import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, FoodItem, Transaction, BusinessConfig, ActiveTab, Empleado, getModuleForCategory } from './types';
import { bootstrapDatabaseIfEmpty, DEFAULT_CONFIG, getTenantSpecificConfig } from './initDb';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InventarioTab from './components/InventarioTab';
import CajaTab from './components/CajaTab';
import ReportesTab from './components/ReportesTab';
import ComprasTab from './components/ComprasTab';
import MantTab from './components/MantTab';
import MasterTab from './components/MasterTab';
import LicenseBlockScreen from './components/LicenseBlockScreen';
import InicioTurno from './components/InicioTurno';
import WelcomeScreen from './components/WelcomeScreen';
import AdminDeliveryPanel from './components/AdminDeliveryPanel';

export default function App() {
  const [tenantId, setTenantId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTienda = params.get('tienda') || params.get('id_tienda') || params.get('modulo');
      if (urlTienda) {
        let clean = urlTienda.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (clean === 'fruteria' || clean === 'frutería') {
          clean = 'fruteria_principe_gales';
        } else if (clean === 'turco') {
          clean = 'el_turco';
        } else if (clean === 'farmacia') {
          clean = 'barrioseguro';
        }
        localStorage.setItem('id_tienda', clean);
        localStorage.setItem('tenant_tienda_id', clean);
        return clean;
      }
      return localStorage.getItem('id_tienda') || localStorage.getItem('tenant_tienda_id');
    } catch {
      return null;
    }
  });

  const [currentEmployee, setCurrentEmployee] = useState<Empleado | null>(() => {
    try {
      const saved = localStorage.getItem('currentEmployee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isMasterUnlocked, setIsMasterUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('currentEmployee');
      if (saved) {
        const emp = JSON.parse(saved) as Empleado;
        if (emp.id === 'dev') return 'Master';
        if (emp.role === 'admin') return 'Mant.';
        return 'Inventario';
      }
    } catch {}
    return 'Compras';
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const fruteriaData = localStorage.getItem('FRUTERIA_DATA');
      if (fruteriaData) {
        return JSON.parse(fruteriaData);
      }
      const appProducts = localStorage.getItem('APP_PRODUCTS_DATA');
      if (appProducts) {
        return JSON.parse(appProducts);
      }
      const savedTenantId = localStorage.getItem('tenant_tienda_id');
      if (savedTenantId) {
        const cached = localStorage.getItem(`products_${savedTenantId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch {}
    return [];
  });
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    try {
      const savedTenantId = localStorage.getItem('tenant_tienda_id');
      if (savedTenantId) {
        const cached = localStorage.getItem(`foodItems_${savedTenantId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch {}
    return [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // States for Delivery Simulation
  const [adminDeliveryActive, setAdminDeliveryActive] = useState(false);
  const [pendingDeliveryCount, setPendingDeliveryCount] = useState(0);

  // Poll LocalStorage to update pending counts in the switcher buttons
  useEffect(() => {
    const checkCount = () => {
      try {
        const saved = localStorage.getItem('pedidos_pendientes');
        if (saved) {
          const list = JSON.parse(saved);
          const storeName = config?.name || 'Donde el Goyo';
          const active = list.filter((o: any) => {
            const orderStore = o.comercioAsociado || 'Donde el Goyo';
            return o.status === 'pending' && orderStore.toLowerCase().trim() === storeName.toLowerCase().trim();
          });
          setPendingDeliveryCount(active.length);
        } else {
          setPendingDeliveryCount(0);
        }
      } catch {
        setPendingDeliveryCount(0);
      }
    };
    checkCount();
    const timer = setInterval(checkCount, 1500);
    return () => clearInterval(timer);
  }, [config?.name]);

  // Sync unlock states when currentEmployee is set/restored
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tiendaParam = params.get('tienda') || params.get('modulo') || params.get('id_tienda');
      if (tiendaParam) {
        let clean = tiendaParam.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (clean === 'fruteria' || clean === 'frutería') {
          clean = 'fruteria_principe_gales';
        } else if (clean === 'turco') {
          clean = 'el_turco';
        } else if (clean === 'farmacia') {
          clean = 'barrioseguro';
        }
        setTenantId(clean);
        localStorage.setItem('id_tienda', clean);
        localStorage.setItem('tenant_tienda_id', clean);
        setActiveTab('Compras');
      }
    } catch (err) {
      console.error("Error reading tienda parameter on mount", err);
    }
  }, []);

  // Sync unlock states when currentEmployee is set/restored
  useEffect(() => {
    if (currentEmployee) {
      if (currentEmployee.id === 'dev') {
        setIsMasterUnlocked(true);
        setIsAdminUnlocked(true);
      } else if (currentEmployee.role === 'admin') {
        setIsAdminUnlocked(true);
        setIsMasterUnlocked(false);
      } else {
        setIsAdminUnlocked(false);
        setIsMasterUnlocked(false);
      }
    } else {
      setIsAdminUnlocked(false);
      setIsMasterUnlocked(false);
    }
  }, [currentEmployee]);
  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    let unsubConfig: () => void = () => {};
    let unsubProducts: () => void = () => {};
    let unsubFood: () => void = () => {};
    let unsubTx: () => void = () => {};

    async function init() {
      setLoading(true);
      // Bootstrap database with demo assets for this tenant if it is completely empty
      await bootstrapDatabaseIfEmpty(tenantId);

      // Listen to config
      const configRef = doc(db, 'tenants', tenantId, 'config', 'business_info');
      unsubConfig = onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
          setConfig(snap.data() as BusinessConfig);
        } else {
          // If deleted, restore default config tailored to tenantId
          const tenantConfig = getTenantSpecificConfig(tenantId);
          setDoc(configRef, tenantConfig).catch(err => 
            handleFirestoreError(err, OperationType.WRITE, `tenants/${tenantId}/config/business_info`)
          );
        }
      }, err => handleFirestoreError(err, OperationType.GET, `tenants/${tenantId}/config/business_info`));

      // Listen to products Catalog
      const productsQuery = query(collection(db, 'tenants', tenantId, 'products'), orderBy('sku', 'asc'));
      unsubProducts = onSnapshot(productsQuery, (snap) => {
        const prodList: Product[] = [];
        snap.forEach(d => {
          prodList.push(d.data() as Product);
        });
        setProducts(prodList);
        localStorage.setItem(`products_${tenantId}`, JSON.stringify(prodList));
        localStorage.setItem('APP_PRODUCTS_DATA', JSON.stringify(prodList));
        localStorage.setItem('FRUTERIA_DATA', JSON.stringify(prodList));
        setLoading(false);
      }, err => handleFirestoreError(err, OperationType.GET, `tenants/${tenantId}/products`));

      // Listen to Food Items Catalog
      const foodQuery = query(collection(db, 'tenants', tenantId, 'foodItems'), orderBy('name', 'asc'));
      unsubFood = onSnapshot(foodQuery, (snap) => {
        const dishList: FoodItem[] = [];
        snap.forEach(d => {
          dishList.push(d.data() as FoodItem);
        });
        setFoodItems(dishList);
        localStorage.setItem(`foodItems_${tenantId}`, JSON.stringify(dishList));
      }, err => handleFirestoreError(err, OperationType.GET, `tenants/${tenantId}/foodItems`));

      // Listen to Transactions logs
      const txQuery = query(collection(db, 'tenants', tenantId, 'transactions'), orderBy('createdAt', 'desc'));
      unsubTx = onSnapshot(txQuery, (snap) => {
        const txList: Transaction[] = [];
        snap.forEach(d => {
          txList.push(d.data() as Transaction);
        });
        setTransactions(txList);
      }, err => handleFirestoreError(err, OperationType.GET, `tenants/${tenantId}/transactions`));
    }

    init();

    return () => {
      unsubConfig();
      unsubProducts();
      unsubFood();
      unsubTx();
    };
  }, [tenantId]);

  // 2. Action Handlers mapping directly to Firestore
  const handleAddProduct = async (item: Omit<Product, 'id' | 'updatedAt'> & { id?: string }) => {
    const id = item.id || 'prod-' + Math.floor(1000 + Math.random() * 9000);
    const sanitizedStock = Math.floor(Number(item.stock)) || 0;
    const sanitizedPrice = Number(item.price) || 0;
    const sanitizedCost = Number(item.cost) || 0;

    const newProduct: Product = {
      ...item,
      id,
      stock: sanitizedStock,
      price: sanitizedPrice,
      cost: sanitizedCost,
      updatedAt: new Date().toISOString()
    };

    // Immediate zero-latency local state & LocalStorage update
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      const updated = [...filtered, newProduct];
      if (tenantId) {
        localStorage.setItem(`products_${tenantId}`, JSON.stringify(updated));
      }
      localStorage.setItem('APP_PRODUCTS_DATA', JSON.stringify(updated));
      localStorage.setItem('FRUTERIA_DATA', JSON.stringify(updated));
      return updated;
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'products', id)
        : doc(db, 'products', id);
      await setDoc(docRef, newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, tenantId ? `tenants/${tenantId}/products/${id}` : `products/${id}`);
    }
  };

  const handleEditProduct = async (item: Product) => {
    const sanitizedStock = Math.floor(Number(item.stock)) || 0;
    const sanitizedPrice = Number(item.price) || 0;
    const sanitizedCost = Number(item.cost) || 0;

    const sanitizedProduct: Product = {
      ...item,
      stock: sanitizedStock,
      price: sanitizedPrice,
      cost: sanitizedCost,
      updatedAt: new Date().toISOString()
    };

    // Immediate zero-latency local state & LocalStorage update
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === item.id ? sanitizedProduct : p));
      if (tenantId) {
        localStorage.setItem(`products_${tenantId}`, JSON.stringify(updated));
      }
      localStorage.setItem('APP_PRODUCTS_DATA', JSON.stringify(updated));
      localStorage.setItem('FRUTERIA_DATA', JSON.stringify(updated));
      return updated;
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'products', item.id)
        : doc(db, 'products', item.id);
      await setDoc(docRef, sanitizedProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, tenantId ? `tenants/${tenantId}/products/${item.id}` : `products/${item.id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    // Immediate zero-latency local state & LocalStorage update
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (tenantId) {
        localStorage.setItem(`products_${tenantId}`, JSON.stringify(updated));
      }
      localStorage.setItem('APP_PRODUCTS_DATA', JSON.stringify(updated));
      localStorage.setItem('FRUTERIA_DATA', JSON.stringify(updated));
      return updated;
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'products', id)
        : doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, tenantId ? `tenants/${tenantId}/products/${id}` : `products/${id}`);
    }
  };

  const handleLoginSuccess = (emp: Empleado | null) => {
    setCurrentEmployee(emp);
    if (emp) {
      localStorage.setItem('currentEmployee', JSON.stringify(emp));
      if (emp.id === 'dev') {
        setIsMasterUnlocked(true);
        setIsAdminUnlocked(true);
        setActiveTab('Master');
      } else if (emp.role === 'admin') {
        setIsAdminUnlocked(true);
        setIsMasterUnlocked(false);
        setActiveTab('Mant.');
      } else {
        setIsAdminUnlocked(false);
        setIsMasterUnlocked(false);
        setActiveTab('Inventario');
      }
    } else {
      localStorage.removeItem('currentEmployee');
      setIsAdminUnlocked(false);
      setIsMasterUnlocked(false);
      setActiveTab('Compras');
    }
  };

  const handleLogout = () => {
    setCurrentEmployee(null);
    localStorage.removeItem('currentEmployee');
    setIsAdminUnlocked(false);
    setIsMasterUnlocked(false);
    setActiveTab('Compras');
  };

  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>): Promise<string> => {
    const id = 'tx-' + Math.floor(100 + Math.random() * 900);
    const newTx: Transaction = {
      ...tx,
      id
    };

    const empName = tx.employeeName || currentEmployee?.name;
    if (empName) {
      newTx.employeeName = empName;
    } else {
      delete newTx.employeeName;
    }

    // Cleanse any other undefined fields for Firestore compatibility
    Object.keys(newTx).forEach(key => {
      if ((newTx as any)[key] === undefined) {
        delete (newTx as any)[key];
      }
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'transactions', id)
        : doc(db, 'transactions', id);
      await setDoc(docRef, newTx);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, tenantId ? `tenants/${tenantId}/transactions/${id}` : `transactions/${id}`);
    }
    return id;
  };

  const handleUpdateProductStock = async (id: string, newStock: number) => {
    const targetProduct = products.find(p => p.id === id);
    const isWeightBased = targetProduct?.unidadMedida === 'kg' || targetProduct?.unidadMedida === 'g' || (targetProduct && getModuleForCategory(targetProduct.category) === 'frutería');
    const sanitizedStock = isWeightBased 
      ? parseFloat(Math.max(0, Number(newStock)).toFixed(3))
      : Math.max(0, Math.floor(Number(newStock)) || 0);

    // 1. Immediately update local React state and LocalStorage for zero-latency UI updates
    setProducts((prev) => {
      const updated = prev.map((p) => p.id === id ? { ...p, stock: sanitizedStock, updatedAt: new Date().toISOString() } : p);
      if (tenantId) {
        localStorage.setItem(`products_${tenantId}`, JSON.stringify(updated));
      }
      localStorage.setItem('APP_PRODUCTS_DATA', JSON.stringify(updated));
      localStorage.setItem('FRUTERIA_DATA', JSON.stringify(updated));
      return updated;
    });

    // 2. Perform Firestore update in background
    try {
      const prodRef = tenantId
        ? doc(db, 'tenants', tenantId, 'products', id)
        : doc(db, 'products', id);
      await updateDoc(prodRef, { stock: sanitizedStock, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, tenantId ? `tenants/${tenantId}/products/${id}` : `products/${id}`);
    }
  };

  const handleUpdateFoodItemStock = async (id: string, newStock: number) => {
    const sanitizedStock = Math.max(0, Math.floor(Number(newStock)) || 0);

    // 1. Immediately update local React state and LocalStorage for zero-latency UI updates
    setFoodItems((prev) => {
      const updated = prev.map((f) => f.id === id ? { ...f, stock: sanitizedStock } : f);
      if (tenantId) {
        localStorage.setItem(`foodItems_${tenantId}`, JSON.stringify(updated));
      }
      return updated;
    });

    // 2. Perform Firestore update in background
    try {
      const prodRef = tenantId
        ? doc(db, 'tenants', tenantId, 'foodItems', id)
        : doc(db, 'foodItems', id);
      await updateDoc(prodRef, { stock: sanitizedStock });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, tenantId ? `tenants/${tenantId}/foodItems/${id}` : `foodItems/${id}`);
    }
  };

  const handleUpdateConfig = async (newCfg: BusinessConfig) => {
    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'config', 'business_info')
        : doc(db, 'config', 'business_info');
      await setDoc(docRef, newCfg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, tenantId ? `tenants/${tenantId}/config/business_info` : 'config/business_info');
    }
  };

  const handleAddFoodItem = async (f: Omit<FoodItem, 'id'>) => {
    const id = 'dish-' + Math.floor(100 + Math.random() * 900);
    const sanitizedStock = Math.max(0, Math.floor(Number(f.stock)) || 0);
    const newDish: FoodItem = {
      ...f,
      id,
      stock: sanitizedStock
    };

    // Immediate zero-latency local state & LocalStorage update
    setFoodItems((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      const updated = [...filtered, newDish];
      if (tenantId) {
        localStorage.setItem(`foodItems_${tenantId}`, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'foodItems', id)
        : doc(db, 'foodItems', id);
      await setDoc(docRef, newDish);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, tenantId ? `tenants/${tenantId}/foodItems/${id}` : `foodItems/${id}`);
    }
  };

  const handleEditFoodItem = async (f: FoodItem) => {
    const sanitizedStock = Math.max(0, Math.floor(Number(f.stock)) || 0);
    const sanitizedDish: FoodItem = {
      ...f,
      stock: sanitizedStock
    };

    // Immediate zero-latency local state & LocalStorage update
    setFoodItems((prev) => {
      const updated = prev.map((d) => (d.id === f.id ? sanitizedDish : d));
      if (tenantId) {
        localStorage.setItem(`foodItems_${tenantId}`, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'foodItems', f.id)
        : doc(db, 'foodItems', f.id);
      await setDoc(docRef, sanitizedDish);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, tenantId ? `tenants/${tenantId}/foodItems/${f.id}` : `foodItems/${f.id}`);
    }
  };

  const handleDeleteFoodItem = async (id: string) => {
    // Immediate zero-latency local state & LocalStorage update
    setFoodItems((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      if (tenantId) {
        localStorage.setItem(`foodItems_${tenantId}`, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      const docRef = tenantId
        ? doc(db, 'tenants', tenantId, 'foodItems', id)
        : doc(db, 'foodItems', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, tenantId ? `tenants/${tenantId}/foodItems/${id}` : `foodItems/${id}`);
    }
  };

  // If tenantId is not set, show the welcome screen to select a store first
  if (!tenantId) {
    return (
      <WelcomeScreen
        onSelectStore={(id) => {
          setTenantId(id);
          localStorage.setItem('id_tienda', id);
          localStorage.setItem('tenant_tienda_id', id);
        }}
      />
    );
  }

  // 3. Render loading layout screen representation
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold tracking-tight text-xs animate-pulse">
          Conectando con la base de datos Firestore...
        </p>
      </div>
    );
  }

  // Check if current date exceeds the expiration date or is manually suspended
  const isLicenseActive = () => {
    if (config.licenseStatus === 'suspended') return false;
    if (!config.licenseExpirationDate) return true; // By default active
    
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    
    return todayStr <= config.licenseExpirationDate;
  };

  // If the license is expired/suspended and the developer has not unlocked the session
  if (!isLicenseActive() && !isMasterUnlocked) {
    return (
      <LicenseBlockScreen 
        config={config} 
        onUnlockMaster={() => {
          setIsMasterUnlocked(true);
          setActiveTab('Master');
        }} 
      />
    );
  }

  // Derive actual current tab based on employee shift status and role permissions
  let currentTab: string = activeTab;
  
  if (!currentEmployee) {
    // Default unauthenticated / App restarted state: only Compras and Mant. are allowed
    if (activeTab !== 'Compras' && activeTab !== 'Mant.') {
      currentTab = 'Compras';
    }
  } else if (currentEmployee.role === 'cajero') {
    // Empleado state: can access Compras, Inventario, Caja, Reportes, and Mant. (for PIN verification/logout)
    if (activeTab === 'Master') {
      currentTab = 'Inventario';
    }
  } else {
    // Admin / Dueño / Developer state: all tabs allowed (with master gating if applicable)
    if (activeTab === 'Master' && !isMasterUnlocked) {
      currentTab = 'Mant.';
    }
  }

  // 4. Primary client layout canvas with persistent bottom nav
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased text-body-md select-none">
      {/* Dynamic top bar */}
      <Header 
        config={config} 
        currentEmployee={currentEmployee} 
        onLogout={handleLogout} 
        onOpenAdmin={() => {
          setAdminDeliveryActive(false);
          setActiveTab('Mant.');
        }}
      />

      {/* Visual Dual System Mode Selector */}
      {currentEmployee && (
        <div className="max-w-md w-full mx-auto px-4 pt-4">
          <div className="bg-white border-2 border-slate-200 p-1 rounded-2xl flex shadow-sm">
            <button
              onClick={() => {
                setAdminDeliveryActive(false);
                setActiveTab('Compras');
              }}
              className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !adminDeliveryActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Modo Cliente 🛒</span>
            </button>
            <button
              onClick={() => {
                setAdminDeliveryActive(true);
              }}
              className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                adminDeliveryActive
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Modo Admin ⚙️ (Delivery)</span>
              {pendingDeliveryCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce font-mono">
                  {pendingDeliveryCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main viewport canvas */}
      <main className="flex-1 px-4 pt-4 pb-28 max-w-md w-full mx-auto">
        {adminDeliveryActive && currentEmployee ? (
          <AdminDeliveryPanel
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddTransaction={handleAddTransaction}
            config={config}
          />
        ) : (
          <>
            {currentTab === 'InicioTurno' && (
              <InicioTurno onLoginSuccess={handleLoginSuccess} tenantId={tenantId} />
            )}

            {currentTab === 'Inventario' && (
              <InventarioTab
                products={products}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                config={config}
                userRole={currentEmployee?.role}
              />
            )}

            {currentTab === 'Caja' && (
              <CajaTab
                products={products}
                onAddProduct={handleAddProduct}
                onAddTransaction={handleAddTransaction}
                onUpdateProductStock={handleUpdateProductStock}
                config={config}
              />
            )}

            {currentTab === 'Reportes' && (
              <ReportesTab transactions={transactions} config={config} />
            )}

            {currentTab === 'Compras' && (
              <ComprasTab
                products={products}
                productos={products}
                foodItems={foodItems}
                config={config}
                onAddTransaction={handleAddTransaction}
                onUpdateProductStock={handleUpdateProductStock}
                onUpdateFoodItemStock={handleUpdateFoodItemStock}
                onBackToMarketplace={() => {
                  setTenantId(null);
                  localStorage.removeItem('id_tienda');
                  localStorage.removeItem('tenant_tienda_id');
                }}
              />
            )}

            {currentTab === 'Mant.' && (
              <MantTab
                products={products}
                foodItems={foodItems}
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddFoodItem={handleAddFoodItem}
                onEditFoodItem={handleEditFoodItem}
                onDeleteFoodItem={handleDeleteFoodItem}
                isUnlocked={isAdminUnlocked}
                onUnlock={setIsAdminUnlocked}
                isMasterUnlocked={isMasterUnlocked}
                onUnlockMaster={setIsMasterUnlocked}
                currentEmployee={currentEmployee}
                onLoginSuccess={handleLoginSuccess}
                tenantId={tenantId}
              />
            )}

            {currentTab === 'Master' && (
              <MasterTab
                config={config}
                products={products}
                transactions={transactions}
                onUpdateConfig={handleUpdateConfig}
                onLockMaster={() => {
                  setIsMasterUnlocked(false);
                  setActiveTab('Mant.');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom Nav tab-selector */}
      <BottomNav 
        activeTab={currentTab as ActiveTab} 
        setActiveTab={(tab) => {
          setAdminDeliveryActive(false);
          setActiveTab(tab);
        }} 
        currentEmployee={currentEmployee} 
        isMasterUnlocked={isMasterUnlocked}
        isAdminUnlocked={isAdminUnlocked}
      />
    </div>
  );
}
