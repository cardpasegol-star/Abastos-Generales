import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, FoodItem, Transaction, BusinessConfig, ActiveTab } from './types';
import { bootstrapDatabaseIfEmpty, DEFAULT_CONFIG } from './initDb';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InventarioTab from './components/InventarioTab';
import CajaTab from './components/CajaTab';
import ReportesTab from './components/ReportesTab';
import ComprasTab from './components/ComprasTab';
import MantTab from './components/MantTab';

export default function App() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('Compras');
  const [products, setProducts] = useState<Product[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // 1. Bootstrap and setup real-time subscriptions
  useEffect(() => {
    async function init() {
      // Bootstrap database with demo assets if it is completely empty
      await bootstrapDatabaseIfEmpty();

      // Listen to config
      const configRef = doc(db, 'config', 'business_info');
      const unsubConfig = onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
          setConfig(snap.data() as BusinessConfig);
        } else {
          // If deleted, restore default config
          setDoc(configRef, DEFAULT_CONFIG).catch(err => 
            handleFirestoreError(err, OperationType.WRITE, 'config/business_info')
          );
        }
      }, err => handleFirestoreError(err, OperationType.GET, 'config/business_info'));

      // Listen to products Catalog
      const productsQuery = query(collection(db, 'products'), orderBy('sku', 'asc'));
      const unsubProducts = onSnapshot(productsQuery, (snap) => {
        const prodList: Product[] = [];
        snap.forEach(d => {
          prodList.push(d.data() as Product);
        });
        setProducts(prodList);
        setLoading(false);
      }, err => handleFirestoreError(err, OperationType.GET, 'products'));

      // Listen to Food Items Catalog
      const foodQuery = query(collection(db, 'foodItems'), orderBy('name', 'asc'));
      const unsubFood = onSnapshot(foodQuery, (snap) => {
        const dishList: FoodItem[] = [];
        snap.forEach(d => {
          dishList.push(d.data() as FoodItem);
        });
        setFoodItems(dishList);
      }, err => handleFirestoreError(err, OperationType.GET, 'foodItems'));

      // Listen to Transactions logs
      const txQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
      const unsubTx = onSnapshot(txQuery, (snap) => {
        const txList: Transaction[] = [];
        snap.forEach(d => {
          txList.push(d.data() as Transaction);
        });
        setTransactions(txList);
      }, err => handleFirestoreError(err, OperationType.GET, 'transactions'));

      return () => {
        unsubConfig();
        unsubProducts();
        unsubFood();
        unsubTx();
      };
    }

    init();
  }, []);

  // 2. Action Handlers mapping directly to Firestore
  const handleAddProduct = async (item: Omit<Product, 'id' | 'updatedAt'>) => {
    const id = 'prod-' + Math.floor(1000 + Math.random() * 9000);
    const newProduct: Product = {
      ...item,
      id,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
    }
  };

  const handleEditProduct = async (item: Product) => {
    try {
      await setDoc(doc(db, 'products', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${item.id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Math.floor(100 + Math.random() * 900);
    const newTx: Transaction = {
      ...tx,
      id
    };

    try {
      await setDoc(doc(db, 'transactions', id), newTx);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${id}`);
    }
  };

  const handleUpdateProductStock = async (id: string, newStock: number) => {
    try {
      const prodRef = doc(db, 'products', id);
      await updateDoc(prodRef, { stock: newStock, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleUpdateConfig = async (newCfg: BusinessConfig) => {
    try {
      await setDoc(doc(db, 'config', 'business_info'), newCfg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/business_info');
    }
  };

  const handleAddFoodItem = async (f: Omit<FoodItem, 'id'>) => {
    const id = 'dish-' + Math.floor(100 + Math.random() * 900);
    const newDish: FoodItem = {
      ...f,
      id
    };

    try {
      await setDoc(doc(db, 'foodItems', id), newDish);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `foodItems/${id}`);
    }
  };

  const handleDeleteFoodItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'foodItems', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `foodItems/${id}`);
    }
  };

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

  // Shield tabs in case activeTab is set to restricted and user is not unlocked
  const currentTab = (!isAdminUnlocked && (activeTab === 'Inventario' || activeTab === 'Caja' || activeTab === 'Reportes'))
    ? 'Compras'
    : activeTab;

  // 4. Primary client layout canvas with persistent bottom nav
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased text-body-md select-none">
      {/* Dynamic top bar */}
      <Header config={config} />

      {/* Main viewport canvas */}
      <main className="flex-1 px-4 pt-4 pb-28 max-w-md w-full mx-auto">
        {currentTab === 'Inventario' && (
          <InventarioTab
            products={products}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
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
          <ComprasTab products={products} foodItems={foodItems} config={config} />
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
            onDeleteFoodItem={handleDeleteFoodItem}
            isUnlocked={isAdminUnlocked}
            onUnlock={setIsAdminUnlocked}
          />
        )}
      </main>

      {/* Persistent Bottom Nav tab-selector */}
      <BottomNav activeTab={currentTab} setActiveTab={setActiveTab} isAdminUnlocked={isAdminUnlocked} />
    </div>
  );
}
