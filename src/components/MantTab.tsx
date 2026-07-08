import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit3, Trash2, Save, MapPin, RefreshCw, AlertTriangle, Plus, X, Laptop, KeyRound, Lock, Image, Camera, PackageOpen } from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, FoodItem, BusinessConfig, Empleado } from '../types';
import { resetDatabaseToDefault } from '../initDb';

const FOOD_PRESET_IMAGES = [
  { label: 'Salada', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200' },
  { label: 'Pan', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' },
  { label: 'Sopa', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=200' },
  { label: 'Carne', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=200' },
  { label: 'Desayuno', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=200' },
  { label: 'Postre', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=200' },
  { label: 'Bebida', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=200' }
];

const PRESET_3D_ICONS = [
  { label: 'Panqueques/Desayuno', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pancakes.png' },
  { label: 'Café', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hot%20Beverage.png' },
  { label: 'Sushi', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Sushi.png' },
  { label: 'Sándwich', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Sandwich.png' },
  { label: 'Medialuna/Pan', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Croissant.png' },
  { label: 'Sopa/Ramen', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Steaming%20Bowl.png' },
  { label: 'Pizza', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png' },
  { label: 'Hamburguesa', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png' },
  { label: 'Postres/Pastel', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png' },
  { label: 'Botella/Bebidas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png' },
  { label: 'Caja de Leche/Lácteos', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png' },
  { label: 'Queso', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png' },
  { label: 'Huevo', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png' },
  { label: 'Manzana/Frutas', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png' },
  { label: 'Brócoli/Verduras', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png' },
  { label: 'Corte de Carne/Pollo', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cut%20of%20Meat.png' },
  { label: 'Bolsa de Alimentos/Abarrotes', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png' },
  { label: 'Papas Fritas/Snacks', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png' },
  { label: 'Jabón/Limpieza', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Soap.png' },
  { label: 'Pan Blanco', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Bread.png' },
  { label: 'Carrito de Compras', url: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png' }
];

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  'Todos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Todo': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Bebidas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png',
  'Abarrotes': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png',
  'Lácteos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png',
  'Snacks': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png',
  'Almuerzos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cooking.png',
  'Sopas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Steaming%20Bowl.png',
  'Postres': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png',
};

function getCategoryIcon(cat: string, customIcons?: Record<string, string>): string {
  if (cat === 'Todos' || cat === 'Todo') return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png';
  return customIcons?.[cat] || DEFAULT_CATEGORY_ICONS[cat] || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Cardboard%20Box.png';
}

function CategoryIcon({ cat, iconUrl, className = "w-8 h-8 object-contain" }: { cat: string; iconUrl: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  const getFallbackEmoji = (category: string): string => {
    const lower = category.toLowerCase();
    if (lower.includes('bebida')) return '🥤';
    if (lower.includes('almuerzo') || lower.includes('cocina') || lower.includes('comida') || lower.includes('hamburguesa') || lower.includes('sándwich')) return '🍔';
    if (lower.includes('sopa') || lower.includes('ramen')) return '🍲';
    if (lower.includes('postre') || lower.includes('dulce') || lower.includes('torta') || lower.includes('pastel') || lower.includes('shortcake')) return '🍰';
    if (lower.includes('lácteo') || lower.includes('leche') || lower.includes('queso')) return '🥛';
    if (lower.includes('snack') || lower.includes('papas') || lower.includes('papas fritas')) return '🍿';
    if (lower.includes('abarrote') || lower.includes('limpieza') || lower.includes('jabón')) return '🧴';
    if (lower.includes('pan') || lower.includes('medialuna') || lower.includes('factura') || lower.includes('croissant')) return '🍞';
    if (lower.includes('sushi')) return '🍣';
    if (lower.includes('fruta') || lower.includes('manzana')) return '🍎';
    if (lower.includes('verdura') || lower.includes('brócoli')) return '🥦';
    if (lower.includes('carne') || lower.includes('corte')) return '🥩';
    if (lower.includes('todos') || lower.includes('todo') || lower.includes('carrito')) return '🛒';
    return '📦';
  };

  if (!iconUrl) {
    return <span className="select-none text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] leading-none inline-block">{getFallbackEmoji(cat)}</span>;
  }

  if (iconUrl.startsWith('http') && !hasError) {
    return (
      <img
        src={iconUrl}
        className={`${className} filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.20)]`}
        alt={cat}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className="select-none text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] leading-none inline-block">
      {iconUrl.startsWith('http') ? getFallbackEmoji(cat) : iconUrl}
    </span>
  );
}

function SelectorStickerItem({ item, selected, onClick }: { item: typeof PRESET_3D_ICONS[0]; selected: boolean; onClick: () => void; key?: any }) {
  const [hasError, setHasError] = useState(false);

  const getNativeEmoji = (label: string): string => {
    const l = label.toLowerCase();
    if (l.includes('panqueque') || l.includes('desayuno')) return '🥞';
    if (l.includes('café') || l.includes('cafe')) return '☕';
    if (l.includes('sushi')) return '🍣';
    if (l.includes('sándwich') || l.includes('sandwich')) return '🥪';
    if (l.includes('medialuna') || l.includes('pan')) return '🥐';
    if (l.includes('sopa') || l.includes('ramen')) return '🍲';
    if (l.includes('pizza')) return '🍕';
    if (l.includes('hamburguesa')) return '🍔';
    if (l.includes('postre') || l.includes('pastel')) return '🍰';
    if (l.includes('botella') || l.includes('bebida')) return '🥤';
    if (l.includes('leche') || l.includes('lácteo')) return '🥛';
    if (l.includes('queso')) return '🧀';
    if (l.includes('huevo')) return '🥚';
    if (l.includes('manzana') || l.includes('fruta')) return '🍎';
    if (l.includes('brócoli') || l.includes('verdura')) return '🥦';
    if (l.includes('carne') || l.includes('corte')) return '🥩';
    if (l.includes('bolsa') || l.includes('abarrote')) return '🛍️';
    if (l.includes('papas') || l.includes('snack')) return '🍿';
    if (l.includes('jabón') || l.includes('limpieza')) return '🧼';
    if (l.includes('pan blanco')) return '🍞';
    if (l.includes('carrito')) return '🛒';
    return '📦';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all border cursor-pointer select-none p-2 bg-white shadow-2xs ${
        selected
          ? 'bg-indigo-50/50 border-indigo-600 ring-4 ring-indigo-500/15 scale-110 shadow-md'
          : 'bg-white border-slate-200/80 hover:bg-slate-50 opacity-90 hover:scale-105 hover:opacity-100 hover:shadow-xs'
      }`}
      title={item.label}
    >
      {!hasError ? (
        <img
          src={item.url}
          className="w-10 h-10 object-contain animate-fade-in filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.18)]"
          alt={item.label}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] leading-none inline-block">{getNativeEmoji(item.label)}</span>
      )}
    </button>
  );
}

interface MantTabProps {
  products: Product[];
  foodItems: FoodItem[];
  config: BusinessConfig;
  onUpdateConfig: (newCfg: BusinessConfig) => Promise<void>;
  onEditProduct: (p: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddFoodItem: (f: Omit<FoodItem, 'id'>) => Promise<void>;
  onDeleteFoodItem: (id: string) => Promise<void>;
  isUnlocked: boolean;
  onUnlock: (unlocked: boolean) => void;
  isMasterUnlocked: boolean;
  onUnlockMaster: (unlocked: boolean) => void;
  currentEmployee: Empleado | null;
  onLoginSuccess: (emp: Empleado | null) => void;
  tenantId?: string;
}

export default function MantTab({
  products,
  foodItems,
  config,
  onUpdateConfig,
  onEditProduct,
  onDeleteProduct,
  onAddFoodItem,
  onDeleteFoodItem,
  isUnlocked,
  onUnlock,
  isMasterUnlocked,
  onUnlockMaster,
  currentEmployee,
  onLoginSuccess,
  tenantId
}: MantTabProps) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Role-based login and employee states
  const [employeesList, setEmployeesList] = useState<Empleado[]>([]);
  const [loginRole, setLoginRole] = useState<'dueno' | 'empleado'>('empleado');
  const [loginSelectedEmpId, setLoginSelectedEmpId] = useState<string>('');
  
  // Custom interactive confirm/alert states
  const [confirmDeleteDish, setConfirmDeleteDish] = useState<{ id: string; name: string } | null>(null);
  const [confirmResetDb, setConfirmResetDb] = useState(false);
  const [notifyResetSuccess, setNotifyResetSuccess] = useState(false);
  
  // Dashboard fields state
  const [localName, setLocalName] = useState(config.name || 'Donde el Goyo');
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || '+5491112345678');
  const [gps, setGps] = useState(config.gps || 'Calle Principal #123');
  const [adminPinField, setAdminPinField] = useState(config.adminPin || '1234');
  const [localBannerUrl, setLocalBannerUrl] = useState(config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800');
  const [ivaPercentInput, setIvaPercentInput] = useState(config.ivaPercentage !== undefined ? config.ivaPercentage : 15);
  const [uploadMethod, setUploadMethod] = useState<'link' | 'gallery'>('link');
  
  // Dynamic categories management state
  const [productCategoriesList, setProductCategoriesList] = useState<string[]>([]);
  const [foodItemCategoriesList, setFoodItemCategoriesList] = useState<string[]>([]);
  const [newProductCat, setNewProductCat] = useState('');
  const [newFoodCat, setNewFoodCat] = useState('');
  const [productSelectedEmoji, setProductSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png');
  const [foodSelectedEmoji, setFoodSelectedEmoji] = useState('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pancakes.png');
  const [categoryIconsList, setCategoryIconsList] = useState<Record<string, string>>({});

  // Kitchen dish builder form state
  const [showDishModal, setShowDishModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState<string>('');
  const [dishCategory, setDishCategory] = useState<string>('Almuerzos');
  const [dishImageUrl, setDishImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
  const [uploadingDishImage, setUploadingDishImage] = useState(false);
  const [dishImageError, setDishImageError] = useState(false);

  useEffect(() => {
    setDishImageError(false);
  }, [dishImageUrl]);

  const handleDishImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDishImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Optimal width for food thumbnails
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          const scale = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height = height * scale;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setDishImageUrl(compressed);
        } else {
          setDishImageUrl(event.target?.result as string);
        }
        setUploadingDishImage(false);
      };
      img.onerror = () => {
        setUploadingDishImage(false);
      };
    };
    reader.onerror = () => {
      setUploadingDishImage(false);
    };
    reader.readAsDataURL(file);
  };
  
  const [loading, setLoading] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [notifySavedKitchenCats, setNotifySavedKitchenCats] = useState(false);

  const handleSaveKitchenCategories = async () => {
    setLoading(true);
    try {
      await onUpdateConfig({
        ...config,
        foodItemCategories: foodItemCategoriesList,
        categoryIcons: {
          ...config.categoryIcons,
          ...categoryIconsList
        }
      });
      setNotifySavedKitchenCats(true);
      setTimeout(() => setNotifySavedKitchenCats(false), 3000);
    } catch (err) {
      console.error("Error al guardar categorías de cocina:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keep state sync with firebase config loaded prop
  useEffect(() => {
    setLocalName(config.name || 'Donde el Goyo');
    setWhatsapp(config.whatsapp || '+5491112345678');
    setGps(config.gps || 'Calle Principal #123');
    setAdminPinField(config.adminPin || '1234');
    setLocalBannerUrl(config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800');
    setIvaPercentInput(config.ivaPercentage !== undefined ? config.ivaPercentage : 15);
    setProductCategoriesList(config.productCategories || ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks']);
    setFoodItemCategoriesList(config.foodItemCategories || ['Almuerzos', 'Sopas', 'Postres', 'Bebidas']);
    setCategoryIconsList(config.categoryIcons || {});
  }, [config]);

  // Fetch employees list from config/business_info/empleados subcollection
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const ref = tenantId
          ? collection(db, 'tenants', tenantId, 'config', 'business_info', 'empleados')
          : collection(db, 'config', 'business_info', 'empleados');
        const snap = await getDocs(ref);
        const list: Empleado[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Empleado);
        });
        
        // Ensure there are at least 3 slots for employees to configure
        const filledList = [...list];
        while (filledList.length < 3) {
          filledList.push({
            id: `emp_${filledList.length + 1}`,
            name: '',
            pin: '',
            role: 'cajero'
          });
        }
        const final3 = filledList.slice(0, 3);
        setEmployeesList(final3);
        
        // Default select first employee with a name if none selected
        const firstWithName = final3.find(e => e.name.trim() !== '');
        if (firstWithName) {
          setLoginSelectedEmpId(firstWithName.id);
        } else if (final3.length > 0) {
          setLoginSelectedEmpId(final3[0].id);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    }
    fetchEmployees();
  }, []);

  const handleAddProductCat = () => {
    const val = newProductCat.trim();
    if (!val) return;
    if (productCategoriesList.includes(val)) return;
    setProductCategoriesList([...productCategoriesList, val]);
    setCategoryIconsList(prev => ({
      ...prev,
      [val]: productSelectedEmoji
    }));
    setNewProductCat('');
  };

  const handleAddFoodCat = () => {
    const val = newFoodCat.trim();
    if (!val) return;
    if (foodItemCategoriesList.includes(val)) return;
    setFoodItemCategoriesList([...foodItemCategoriesList, val]);
    setCategoryIconsList(prev => ({
      ...prev,
      [val]: foodSelectedEmoji
    }));
    setNewFoodCat('');
  };

  const handleRemoveProductCat = (cat: string) => {
    setProductCategoriesList(productCategoriesList.filter(c => c !== cat));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const handleRemoveFoodCat = (cat: string) => {
    setFoodItemCategoriesList(foodItemCategoriesList.filter(c => c !== cat));
    setCategoryIconsList(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  // Handle cell phone gallery selection & browser canvas mini-compression to keep data fast and small (under 80kb)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Optimal display width for phone banners
        const scale = MAX_WIDTH / img.width;
        const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const height = img.width > MAX_WIDTH ? img.height * scale : img.height;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress high resolution files to light JPEG representation
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setLocalBannerUrl(compressed);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Handle physical keyboard keypresses when screen is locked
  useEffect(() => {
    if (isUnlocked) return;

    let buffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys if they are typing in an input element
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }
      
      const key = e.key;
      if (key === 'Backspace') {
        buffer = buffer.slice(0, -1);
      } else if (key.length === 1) {
        buffer += key;
        if (buffer.length > 20) {
          buffer = buffer.slice(-20);
        }
        
        if (buffer.endsWith('Saraghina2024') || buffer.endsWith('2024') || buffer.endsWith('Aramis2012')) {
          onUnlockMaster(true);
          onUnlock(true);
          const devEmp: Empleado = { id: 'dev', name: 'Desarrollador', pin: 'Saraghina2024', role: 'admin' };
          onLoginSuccess(devEmp);
          buffer = '';
        } else if (buffer.endsWith(config.adminPin || '1234')) {
          onUnlock(true);
          onUnlockMaster(false);
          const ownerEmp: Empleado = { id: 'dueno', name: 'Dueño', pin: config.adminPin || '1234', role: 'admin' };
          onLoginSuccess(ownerEmp);
          buffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, onUnlock, onUnlockMaster, config.adminPin, onLoginSuccess]);

  const handleVerifyPin = (overridePin?: string) => {
    const pinToVerify = (overridePin !== undefined ? overridePin : pin).trim();
    
    // 1. Master/Desarrollador Bypass
    if (pinToVerify === 'Saraghina2024' || pinToVerify === '2024' || pinToVerify === 'Aramis2012') {
      onUnlockMaster(true);
      onUnlock(true);
      const devEmp: Empleado = { id: 'dev', name: 'Desarrollador', pin: pinToVerify, role: 'admin' };
      onLoginSuccess(devEmp);
      setPin('');
      return;
    }
    
    // 2. Dueño Login
    if (loginRole === 'dueno') {
      const correctPin = config.adminPin || '1234';
      if (pinToVerify === correctPin) {
        onUnlock(true);
        onUnlockMaster(false);
        const ownerEmp: Empleado = { id: 'dueno', name: 'Dueño', pin: pinToVerify, role: 'admin' };
        onLoginSuccess(ownerEmp);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1500);
      }
    } 
    // 3. Empleado Login
    else {
      const selectedEmp = employeesList.find(e => e.id === loginSelectedEmpId);
      if (selectedEmp && selectedEmp.pin === pinToVerify) {
        onUnlock(false);
        onUnlockMaster(false);
        onLoginSuccess(selectedEmp);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1500);
      }
    }
  };

  // Handle dial entries
  const handleDial = (num: string) => {
    if (pinError) setPinError(false);
    const nextPin = pin + num;
    setPin(nextPin);
    
    // Auto check if it matches master PIN
    if (nextPin === '2024' || nextPin === 'Saraghina2024' || nextPin === 'Aramis2012') {
      onUnlockMaster(true);
      onUnlock(true);
      const devEmp: Empleado = { id: 'dev', name: 'Desarrollador', pin: nextPin, role: 'admin' };
      onLoginSuccess(devEmp);
      setPin('');
      return;
    }

    // Check if nextPin is a prefix of any master pin to prevent early auto-submit
    const isMasterPrefix = 
      'Saraghina2024'.startsWith(nextPin) || 
      'Aramis2012'.startsWith(nextPin);

    if (isMasterPrefix) {
      return;
    }

    // Auto submit employee PIN if they complete 4 digits
    if (loginRole === 'empleado' && nextPin.length === 4) {
      const selectedEmp = employeesList.find(e => e.id === loginSelectedEmpId);
      if (selectedEmp && selectedEmp.pin === nextPin) {
        onUnlock(false);
        onUnlockMaster(false);
        onLoginSuccess(selectedEmp);
        setPin('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 1500);
      }
    }
    // Auto submit owner PIN if they complete their configured 4-digit PIN
    else if (loginRole === 'dueno' && nextPin.length === (config.adminPin || '1234').length) {
      const correctPin = config.adminPin || '1234';
      if (nextPin === correctPin) {
        onUnlock(true);
        onUnlockMaster(false);
        const ownerEmp: Empleado = { id: 'dueno', name: 'Dueño', pin: nextPin, role: 'admin' };
        onLoginSuccess(ownerEmp);
        setPin('');
      }
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await onUpdateConfig({
        id: config.id || 'business_info',
        name: localName.trim(),
        whatsapp: whatsapp.trim(),
        gps: gps.trim(),
        adminPin: adminPinField.trim(),
        bannerUrl: localBannerUrl.trim(),
        ivaPercentage: Number(ivaPercentInput),
        productCategories: productCategoriesList,
        foodItemCategories: foodItemCategoriesList,
        categoryIcons: categoryIconsList
      });

      // Save each employee slot to the config/business_info/empleados subcollection
      for (const emp of employeesList) {
        if (emp.name.trim() && emp.pin.trim()) {
          const empDocRef = tenantId
            ? doc(db, 'tenants', tenantId, 'config', 'business_info', 'empleados', emp.id)
            : doc(db, 'config', 'business_info', 'empleados', emp.id);
          await setDoc(empDocRef, {
            id: emp.id,
            name: emp.name.trim(),
            pin: emp.pin.trim(),
            role: emp.role || 'cajero'
          });
        } else {
          // If empty, clean up document
          const empDocRef = tenantId
            ? doc(db, 'tenants', tenantId, 'config', 'business_info', 'empleados', emp.id)
            : doc(db, 'config', 'business_info', 'empleados', emp.id);
          await deleteDoc(empDocRef).catch(() => {});
        }
      }

      setNotifySaved(true);
      setTimeout(() => setNotifySaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeResetDb = async () => {
    setConfirmResetDb(false);
    setLoading(true);
    try {
      await resetDatabaseToDefault(tenantId || 'default');
      setNotifyResetSuccess(true);
      setTimeout(() => setNotifyResetSuccess(false), 4000);
      // Unlocked session restarts
      onUnlock(false);
      setPin('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDb = () => {
    setConfirmResetDb(true);
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setLoading(true);
    try {
      await onAddFoodItem({
        name: dishName.trim(),
        description: dishDesc.trim(),
        price: parseFloat(dishPrice) || 0,
        category: dishCategory,
        isPopular: false,
        imageUrl: dishImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
      });
      setDishName('');
      setDishDesc('');
      setDishPrice('');
      setDishImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
      setShowDishModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteDish = async () => {
    if (!confirmDeleteDish) return;
    const { id } = confirmDeleteDish;
    setConfirmDeleteDish(null);
    setLoading(true);
    try {
      await onDeleteFoodItem(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDishItem = (id: string, name: string) => {
    setConfirmDeleteDish({ id, name });
  };

  // 1. Employee Dashboard (Active Non-Admin/Cajero Session)
  if (currentEmployee && currentEmployee.role === 'cajero') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-2 text-indigo-600 select-none">
          <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Sesión de Empleado</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Usuario activo: <span className="text-indigo-650 font-black">{currentEmployee.name}</span>
          </p>
          <p className="text-[11px] text-slate-405 font-medium px-6 max-w-xs mx-auto leading-normal">
            La pestaña de configuración está restringida para el personal de caja. Pídale al Dueño desbloquearla con su clave si necesita realizar cambios.
          </p>
        </div>
        <button
          onClick={() => {
            onLoginSuccess(null);
            onUnlock(false);
            onUnlockMaster(false);
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider cursor-pointer"
        >
          🔒 Cerrar Sesión
        </button>
      </div>
    );
  }

  // 2. LOCK SCREEN (Initial Auth State)
  if (!isUnlocked) {
    // Only show employees that have a name configured
    const activeEmployees = employeesList.filter(e => e.name.trim() !== '');

    return (
      <div id="lockscreen-container" className="flex flex-col items-center justify-center min-h-[500px] space-y-7 animate-in fade-in duration-300 animate-out duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-2 text-indigo-600 select-none">
            <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Acceso Restringido</h2>
          <p className="text-xs text-gray-405 font-medium leading-normal">
            Seleccione su rol e ingrese sus credenciales para continuar
          </p>
        </div>

        {/* Unified Selector Panel */}
        <div className="w-full max-w-[270px] space-y-4">
          {/* Dropdown: Seleccionar Rol */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">
              Rol de Acceso
            </label>
            <select
              value={loginRole}
              onChange={(e) => {
                const role = e.target.value as 'dueno' | 'empleado';
                setLoginRole(role);
                setPin('');
                setPinError(false);
                if (role === 'empleado' && activeEmployees.length > 0) {
                  setLoginSelectedEmpId(activeEmployees[0].id);
                }
              }}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold text-center focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-sm cursor-pointer"
            >
              <option value="empleado">Empleado (Cajero)</option>
              <option value="dueno">Dueño / Administrador</option>
            </select>
          </div>

          {/* Dropdown: Seleccionar Empleado (only visible if role is Empleado) */}
          {loginRole === 'empleado' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">
                Seleccione su Usuario
              </label>
              <select
                value={loginSelectedEmpId}
                onChange={(e) => {
                  setLoginSelectedEmpId(e.target.value);
                  setPin('');
                  setPinError(false);
                }}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-extrabold text-center focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-sm cursor-pointer"
              >
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
                {activeEmployees.length === 0 && (
                  <option value="">Sin empleados registrados</option>
                )}
              </select>
            </div>
          )}

          {/* Password/PIN Input Field */}
          <div className="space-y-1">
            <input
              type="password"
              placeholder="PIN o Clave Alfanumérica"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVerifyPin();
                }
              }}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-center font-black text-slate-850 focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-sm tracking-widest outline-none"
              autoFocus
            />

            <button
              onClick={() => handleVerifyPin()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Desbloquear</span>
            </button>
          </div>
        </div>

        {/* Visual Dots Indicators */}
        <div className={`flex gap-4 py-1 items-center ${pinError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const active = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  pinError 
                    ? 'border-rose-400 bg-rose-500 shadow-rose-200 shadow-sm' 
                    : active 
                      ? 'border-indigo-600 bg-indigo-600 shadow-indigo-100 shadow-md scale-110' 
                      : 'border-gray-200 bg-transparent'
                }`}
              ></div>
            );
          })}
          {pin.length > 4 && (
            <span className="text-[10px] text-indigo-600 font-extrabold font-mono leading-none bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">+{pin.length - 4}</span>
          )}
        </div>

        {/* Tactical Dial Numeric Pad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDial(num)}
              className="h-15 rounded-2xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 font-bold text-gray-800 text-lg active:scale-90 transition-transform flex items-center justify-center outline-none select-none cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-15 rounded-2xl text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none select-none cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => handleDial('0')}
            className="h-15 rounded-2xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 font-bold text-gray-800 text-lg active:scale-90 transition-transform flex items-center justify-center outline-none select-none cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-15 rounded-2xl text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center justify-center outline-none select-none cursor-pointer"
          >
            Backspace
          </button>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED STATE (Admin dashboard revealed)
  return (
    <div id="admin-dashboard-container" className="space-y-6 pb-28 animate-in slide-in-from-bottom-8 duration-400">
      
      {/* Admin Quick Status and Logout bar */}
      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-indigo-650 rounded-full animate-pulse shrink-0"></div>
          <span className="text-xs font-extrabold text-indigo-950 font-sans">Sesión de Dueño Activa</span>
        </div>
        <button
          onClick={() => {
            onUnlock(false);
            setPin('');
          }}
          className="bg-white border border-indigo-200 hover:bg-slate-50 text-indigo-700 font-extrabold text-[10px] px-3 py-1.5 rounded-xl shadow-3xs cursor-pointer select-none"
        >
          🔒 Cerrar Sesión
        </button>
      </div>

      {/* Messages banner */}
      {notifySaved && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold animate-in fade-in duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>¡Datos actualizados con éxito en Firestore!</span>
        </div>
      )}

      {/* Section A: Global operational variables editing card */}
      <section className="space-y-3">
        <h3 className="text-sm font-extrabold text-gray-950 px-1 uppercase tracking-wider">
          Datos del Negocio (Punto de Venta)
        </h3>
        
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Local</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp del Dueño (Recibe Pedidos de Clientes)</label>
            <input
              type="tel"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              placeholder="Ej: 5491112345678"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <span className="text-[9px] text-indigo-600 font-bold block leading-tight pt-1">
              ⚠️ Ingrese el código de país y número celular (ejemplo: argentino sin prefijos raros, solo números, sin "+" ni guiones). Ej: 5491112345678. Los clientes le enviarán aquí sus carritos de compra.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Ubicación GPS / Dirección</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm pr-9 focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white outline-none"
                  value={gps}
                  onChange={(e) => setGps(e.target.value)}
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">PIN del Administrador</label>
              <input
                type="text"
                placeholder="Ej. 1234"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white outline-none text-center font-bold"
                value={adminPinField}
                onChange={(e) => setAdminPinField(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label id="iva-factor-label" className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Porcentaje de IVA (%)</label>
            <input
              id="iva-factor-input"
              type="number"
              step="any"
              min="0"
              max="100"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              placeholder="Ej. 15 o según regulación fiscal"
              value={ivaPercentInput}
              onChange={(e) => setIvaPercentInput(parseFloat(e.target.value) || 0)}
            />
            <span className="text-[9px] text-gray-400 font-bold block">
              Se utilizará este porcentaje para calcular los impuestos (IVA) automática y dinámicamente al momento de confirmar ventas y generar tickets de respaldo.
            </span>
          </div>

          {/* Banner Selector Component */}
          <div className="space-y-2.5 border-t border-gray-100 pt-3.5">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest block">Foto de Banner / Portada</label>
            
            {/* Real-time Banner Preview */}
            <div className="relative h-24 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={localBannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                className="w-full h-full object-cover"
                alt="Vista previa del banner"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                <span className="text-white text-[9px] font-black uppercase tracking-wider bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
                  Vista Previa
                </span>
              </div>
            </div>

            {/* Selector of method */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setUploadMethod('link')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMethod === 'link' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-gray-450 hover:text-gray-700'
                }`}
              >
                Ingresar Enlace
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('gallery')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMethod === 'gallery' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-gray-450 hover:text-gray-700'
                }`}
              >
                Subir de la Galería 📱
              </button>
            </div>

            {/* Render selected configuration input fields */}
            {uploadMethod === 'link' ? (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="Pegue la URL de la imagen aquí..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
                  value={localBannerUrl.startsWith('data:image/') ? '' : localBannerUrl}
                  onChange={(e) => setLocalBannerUrl(e.target.value)}
                />
                <span className="text-[9px] text-gray-400 font-bold block">Sugerencia: puedes copiar un enlace de Unsplash o Imgur.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/50 p-3 rounded-xl cursor-pointer text-xs font-bold text-indigo-750 transition-all select-none">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Seleccionar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {localBannerUrl.startsWith('data:image/') && (
                    <button
                      type="button"
                      onClick={() => setLocalBannerUrl(config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800')}
                      className="px-3 bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Restaurar
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-indigo-600 font-bold block bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-150/40 leading-normal">
                  ⚡ La imagen se optimiza y comprime automáticamente para que cargue súper rápido en el celular.
                </span>
              </div>
            )}
          </div>

          {/* Categories Management Panel */}
          <div className="space-y-4 border-t border-gray-100 pt-3.5">
            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider">
              Categorías de Productos y Alimentos
            </h4>
            <p className="text-[10px] text-gray-400 leading-normal">
              Agregue, organice y personalice los rubros ofrecidos. Los cambios se aplicarán al guardar la configuración general.
            </p>

            {/* Product Categories */}
            <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <label className="text-[9.5px] font-black text-indigo-700 uppercase tracking-widest block">
                🛍️ Categorías de Productos (La Bodega)
              </label>
              <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl min-h-12 items-center">
                {productCategoriesList.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 shadow-3xs hover:bg-slate-150 transition-colors">
                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
                      <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                    </span>
                    <span className="font-bold">{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProductCat(cat)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
                {productCategoriesList.length === 0 && (
                  <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Bebidas, Enlatados, Jabones..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                  value={newProductCat}
                  onChange={(e) => setNewProductCat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProductCat(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddProductCat}
                  className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer shadow-3xs"
                >
                  Agregar
                </button>
              </div>
              {/* Product Sticker Selector */}
              <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-150">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  🎨 Escoge un sticker 3D para asociarlo al rubro nuevo que va a agregar:
                </span>
                <div className="flex gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none max-w-full">
                  {PRESET_3D_ICONS.map(item => (
                    <SelectorStickerItem
                      key={item.url}
                      item={item}
                      selected={productSelectedEmoji === item.url}
                      onClick={() => setProductSelectedEmoji(item.url)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Food Item Categories */}
            <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <label className="text-[9.5px] font-black text-emerald-700 uppercase tracking-widest block">
                🍳 Categorías del Menú (Alimentos y Cocina)
              </label>
              <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl min-h-12 items-center">
                {foodItemCategoriesList.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-2 bg-slate-100 text-slate-850 text-[11px] font-extrabold pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 shadow-3xs hover:bg-slate-150 transition-colors">
                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
                      <CategoryIcon cat={cat} iconUrl={getCategoryIcon(cat, categoryIconsList)} className="w-5 h-5 object-contain" />
                    </span>
                    <span className="font-bold">{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFoodCat(cat)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer ml-1 p-0.5 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
                {foodItemCategoriesList.length === 0 && (
                  <span className="text-[10px] text-gray-400 px-2 italic">Sin categorías</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Sopas, Desayunos, Postres..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-hidden focus:bg-white transition-all font-semibold outline-hidden"
                  value={newFoodCat}
                  onChange={(e) => setNewFoodCat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFoodCat(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddFoodCat}
                  className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs ${
                    newFoodCat.trim() !== ''
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-450 hover:bg-slate-250'
                  }`}
                >
                  Agregar
                </button>
              </div>
              {/* Food Sticker Selector */}
              <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-150">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  🎨 Escoge un sticker 3D para asociarlo al rubro nuevo que va a agregar:
                </span>
                <div className="flex gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none max-w-full">
                  {PRESET_3D_ICONS.map(item => (
                    <SelectorStickerItem
                      key={item.url}
                      item={item}
                      selected={foodSelectedEmoji === item.url}
                      onClick={() => setFoodSelectedEmoji(item.url)}
                    />
                  ))}
                </div>
              </div>

              {/* Botón de Guardado Específico */}
              <div className="pt-1.5 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveKitchenCategories}
                  disabled={!isUnlocked || loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Categorías de Cocina</span>
                </button>
                {notifySavedKitchenCats && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold animate-in fade-in duration-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                    <span>¡Categorías de cocina guardadas con éxito!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Gestión de Personal */}
          <div className="space-y-3.5 border-t border-gray-100 pt-3.5">
            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider">
              👥 Gestión de Personal (Hasta 3 Empleados)
            </h4>
            <p className="text-[10px] text-gray-450 leading-normal">
              Configure los nombres y códigos PIN de acceso para su personal de turno. Deje campos vacíos para deshabilitar un slot. Los cambios se aplicarán al guardar la configuración general.
            </p>

            <div className="space-y-3">
              {employeesList.map((emp, index) => (
                <div key={emp.id} className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                      Slot #{index + 1} - {emp.name.trim() ? `Empleado: ${emp.name}` : 'Disponible'}
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-md border border-slate-200">
                      Rol: Cajero
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">Nombre completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:outline-none transition-all font-semibold outline-none"
                        value={emp.name}
                        onChange={(e) => {
                          const newList = [...employeesList];
                          newList[index] = { ...newList[index], name: e.target.value };
                          setEmployeesList(newList);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest block">PIN (4 dígitos)</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Ej. 1111"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-center focus:ring-2 focus:ring-indigo-600/10 focus:outline-none transition-all font-black tracking-widest outline-none"
                        value={emp.pin}
                        onChange={(e) => {
                          const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                          const newList = [...employeesList];
                          newList[index] = { ...newList[index], pin: cleanVal };
                          setEmployeesList(newList);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-55 flex items-center justify-center gap-1 shadow-sm select-none outline-none cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-white" />}
            <span>Guardar Configuración</span>
          </button>
        </div>
      </section>

      {/* Section B: Traditional Meals Management list */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider">
            Gestión del Menú
          </h3>
          <span className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
            {foodItems.length} platos
          </span>
        </div>

        <button
          onClick={() => {
            setDishName('');
            setDishDesc('');
            setDishPrice('');
            if (foodItemCategoriesList.length > 0) {
              setDishCategory(foodItemCategoriesList[0]);
            }
            setDishImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200');
            setDishImageError(false);
            setShowDishModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 p-4 rounded-xl text-xs font-bold transition-all outline-hidden cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
          <span>Agregar nuevo plato al menú</span>
        </button>

        <div className="grid grid-cols-1 gap-4">
          {foodItems.map(dish => (
            <div
              key={dish.id}
              className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative h-44 w-full bg-gray-50 shrink-0">
                <img 
                  src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'} 
                  className="w-full h-full object-cover" 
                  alt={dish.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                  }}
                  referrerPolicy="no-referrer" 
                />
                <button
                  type="button"
                  onClick={() => handleDeleteDishItem(dish.id, dish.name)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-rose-50 hover:text-rose-600 shadow-md flex items-center justify-center text-rose-500 transition-colors cursor-pointer shrink-0 border border-slate-100 select-none active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {dish.category}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">Precio</span>
                    <span className="text-lg font-black text-indigo-650">${dish.price.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-950 text-base leading-tight truncate">{dish.name}</h4>
                  <p className="text-xs text-gray-450 font-semibold leading-relaxed mt-1 line-clamp-2">{dish.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section C: Danger Zone database reset */}
      <section className="space-y-3 pt-5 border-t border-gray-100">
        <div className="flex items-center gap-2 text-rose-600 px-1">
          <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Zona Peligrosa</h3>
        </div>
        <div className="bg-rose-50/50 p-4.5 rounded-2xl border border-rose-200/50 text-xs font-medium text-rose-900 space-y-3.5">
          <p className="text-center leading-relaxed text-rose-850">
            Esta acción eliminará de forma permanente todos los registros de ventas de la caja, cargará los productos por defecto y restaurará las credenciales a su estado inicial.
          </p>
          <button
            onClick={handleResetDb}
            disabled={loading}
            className="w-full bg-rose-600 text-white font-extrabold py-3.5 rounded-xl tracking-tight uppercase shadow-md active:shadow-sm active:scale-[0.98] transition-all disabled:opacity-55 select-none outline-none cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Restablecer Base de Datos'}
          </button>
        </div>
      </section>

      {/* Auxiliary modal popup for creating dishes */}
      {showDishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center bg-gray-50/50 px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-950">Nuevo Plato</h3>
              <button 
                onClick={() => setShowDishModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-550 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Plato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Empanadas de Carne"
                  className="w-full bg-gray-50 border border-gray-10s rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-semibold"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                />
              </div>

              {/* Imagen del Plato */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Imagen del Plato</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 bg-slate-50 relative flex items-center justify-center">
                    {uploadingDishImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                    {dishImageError || !dishImageUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2 text-center select-none">
                        <PackageOpen className="w-6 h-6 text-slate-350" />
                        <span className="text-[8px] font-bold text-slate-400 mt-1 leading-none">Sin Imagen</span>
                      </div>
                    ) : (
                      <img
                        src={dishImageUrl}
                        className="w-full h-full object-contain p-1 bg-white"
                        alt="preview"
                        referrerPolicy="no-referrer"
                        onError={() => setDishImageError(true)}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-[10px] py-1.5 px-2 rounded-xl cursor-pointer hover:bg-emerald-100/60 transition-colors select-none">
                      <Image className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                      <span>Subir desde Galería</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleDishImageUpload} />
                    </label>
                    <label className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-[10px] py-1.5 px-2 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors select-none">
                      <Camera className="w-3.5 h-3.5 text-slate-650 stroke-[2.5]" />
                      <span>Tomar Foto</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleDishImageUpload} />
                    </label>
                  </div>
                </div>
                
                {/* Preset food images selection row */}
                <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {FOOD_PRESET_IMAGES.map((img, i) => (
                    <button key={i} type="button" onClick={() => setDishImageUrl(img.url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${dishImageUrl === img.url ? 'ring-2 ring-emerald-500 scale-105 border-emerald-600' : 'border-slate-200 opacity-60'}`}>
                      <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>

                {/* External Image URL with same auto-clean mechanism for presets/base64 */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">O pegar URL de Imagen Externa</label>
                  {(() => {
                    const isPresetUrl = FOOD_PRESET_IMAGES.some(img => img.url === dishImageUrl);
                    const isBase64Url = dishImageUrl?.startsWith('data:');
                    const displayUrl = (isPresetUrl || isBase64Url) ? '' : dishImageUrl;
                    return (
                      <>
                        <input
                          type="text"
                          placeholder="https://ejemplo.com/plato.jpg"
                          className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white outline-none font-bold text-slate-900"
                          value={displayUrl}
                          onChange={(e) => setDishImageUrl(e.target.value)}
                        />
                        {displayUrl && (dishImageError || !/\.(jpg|jpeg|png|webp|gif|svg|bmp)/i.test(displayUrl)) && (
                          <div className="p-2.5 bg-amber-50/85 border border-amber-200/80 rounded-xl text-[10px] text-amber-800 font-medium leading-relaxed mt-1.5 animate-in fade-in duration-250">
                            <div className="flex gap-1.5 items-start">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-extrabold text-amber-900 block mb-0.5">La imagen no se cargó correctamente</strong>
                                Asegúrate de que la URL termine en <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[8px] font-bold">.jpg</code>, <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[8px] font-bold">.png</code> o <code className="bg-amber-100 px-1 py-0.2 rounded text-rose-700 font-mono text-[8px] font-bold">.webp</code>.
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-center outline-none font-bold"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría *</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-10s rounded-xl px-3 py-3 text-sm outline-none cursor-pointer"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                  >
                    {foodItemCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej. masa crujiente frita rellena con carne desmechada sazonada..."
                  className="w-full bg-gray-50 border border-gray-10s rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all outline-none"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Crear Plato'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Database Reset confirmation modal */}
      {confirmResetDb && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in fade-in duration-350">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center border border-slate-150 shadow-2xl relative">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Restablecer Datos</h3>
            <p className="text-xs text-slate-500 mb-4.5 leading-relaxed">
              Esta operación es irreversible y borrará el historial de cobros de forma permanente. ¿Desea continuar?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmResetDb(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 outline-none select-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeResetDb}
                className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-rose-700 outline-none select-none cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete food dish item confirmation modal */}
      {confirmDeleteDish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in fade-in duration-350">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center border border-slate-150 shadow-2xl relative">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-slate-650 border border-slate-200">
              <Trash2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">¿Eliminar Plato?</h3>
            <p className="text-xs text-slate-500 mb-4.5 leading-normal">
              ¿Seguro que desea quitar <span className="font-bold">"{confirmDeleteDish.name}"</span> de la cocina?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDeleteDish(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 outline-none select-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteDish}
                className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-rose-700 outline-none select-none cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Successful database reset notification card */}
      {notifyResetSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-55 w-full max-w-xs p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-150 text-center text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-6 duration-350 select-none">
          Base de datos restablecida correctamente.
        </div>
      )}
    </div>
  );
}
