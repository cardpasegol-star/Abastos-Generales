import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ScanBarcode, Plus, PackageOpen, AlertTriangle, AlertCircle, RefreshCw, X, Camera, FileDown, Image, Check } from 'lucide-react';
import { Product, BusinessConfig } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface InventarioTabProps {
  products: Product[];
  onAddProduct: (item: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  onEditProduct: (item: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  config?: BusinessConfig;
}

const PRESET_IMAGES = [
  { label: 'Bebida Lata', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKL-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk' },
  { label: 'Pan', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr8u8wXDvpaNlG_Zq4Ebyy33Hy-gCEr5nVQiTk5CEI0Sva5jVF_J0WcfbJBeFSQsdIC5oP2vvQfC4mldu51JTs-gse8Xo9Zj_NFsaRcSvMoUW7EG_9wpJ4NqTZ-2IX0YinKfCGy_bapUtHhNVVbItz8ULk1KAo_dfFhbeN6srciOXmYuCynlfhrjZKOo9oyUKBd1kL_SYuZBxkvd2zEShZhfvVp4mffGMPr_1zkFzK7u8UC6koC1VsKpC1pOQEAMTzsE-KJkN743o' },
  { label: 'Leche', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfltLCYu3aB_3sd7mXGNlKGUjdV6mTGvaP8oLfH1ogkMUYzcysGwRqOHRlAIVNQfCncW2GfIvIpU05SFsHLsl7ibHcRbvnvri5c9JQ10kOaWz6PD9Ka3J3TGNh4anl0fKMxhmQ0iU7LziNgPkg4SnyTKmNmNEfFcnoMykBP3p2ZKqXjGgpdqlro8hwr2EaVDjhuSsQmJDerBcEwcSAlT-DAyF2m5UxA4pay_IrcpQdwU7ZgbhuaC4rmLEvnFUG227N0SrfINWzYqg' },
  { label: 'Snacks', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUF1NcIGYG2T3McNvhGUjed9u7fCunvxJ2UatiMBW1uGyTFK6frS3_ftz2XVCDronGS_zK23LrBTEEgg24yu5t3fj5TZu6L5pzpr6_jbJY5O6cudx5unBBU_yAwOQYwOrUr7Cv5ztUr02HzuHu0wXRjn3Q-qYwiKuHd38sjhTvRDDtwKEorPVyhYQfpJy6fad_aE1Svbe5pN8Xf2agc2pxkAmEfk0Wnla_3u8hQStkl7b1pMzBvIo0cza8sl5VfTO5lx6RXEm6Pws' },
  { label: 'Aguacate', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHwCOIzMAguRTJrr8d3e9LlqCNrcvXChDmwyJ1INeC785VEq3zcb45qJdduZ9B6w7bfW9jjndYhiQPZj7lj26Bgi1WzCZVsFJsuBcFxJpotpFRcpH2zYvlED5lNmPNsJVcxg8CNTNelLVp8qzpLtmTDTVKRDElFVy3faTWb2hpCI_4taE5AeM4sj72NwNWlIRla2wcowcktVwejxl7gXRzeZFXDH5jzXm92SUW4wybAAAKORVhJec7LUNiT2kSro5ZAvRcsE02h4' },
  { label: 'Naranjas', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7Odb9m9LVBsEv4N50b5NJeq4bSmQe9fWnrbQ_MFFXlflgpuektEG3pJlhrq7JEaqzZrPWP2wTS98S5M9PtW9BzjAdNjOSiwD1Y3PD5dMyCLmBdA2gQh4D-irqFYEnTAYsx4taGp5CeNQPF3IVGtIqXbNothSbFsLQ_mciNmM9EkZh-UbZ01BldH3wTPcc1FpP7CPqXQtAZ-XoR8rA9IeA4qX1I2omsgUwU-vJzzLY6QnBDuq3vZ9EIEmaLMtEC2tf8Z2no7Dvw0' },
  { label: 'Aceite', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0w6AWq-EHcBx5SuE1-ScX63fUy0pIOosoofZhQgWqRScufztzr1Cf2VtxDJmQVWbXZ3jwI5MHC640Tl9S-TPjjKr3mbyNjtKH0lwvpmtd16tk4KmQIbDOEpGxPoV9ekw_84kwl4Uebrv2OkS-9u84SA7YXTiFaDx-bNGvjGiM1j56mtdqwCMCuCArG-m3tmWksTH_a83vwvtRkNRyd3Xo8H6ZQD-O8nilMNJt70pim4Hz42_qeiAvcSLQ_jYF89-NYb-FPWUMklw' }
];

const CATEGORY_ICONS: Record<string, string> = {
  'Todos': '🛒',
  'Bebidas': '🥤',
  'Abarrotes': '🧴',
  'Lácteos': '🥛',
  'Snacks': '🍿',
};

export function getCategoryIcon(cat: string, config?: BusinessConfig): string {
  if (cat === 'Todos' || cat === 'Todo') return '🛒';
  return config?.categoryIcons?.[cat] || CATEGORY_ICONS[cat] || '📦';
}

function detectCategory(tags: string[]): Product['category'] {
  const s = tags.join(' ').toLowerCase();
  if (s.includes('bebida') || s.includes('drink') || s.includes('juice') || s.includes('water')) return 'Bebidas';
  if (s.includes('dairy') || s.includes('lacteo') || s.includes('milk') || s.includes('cheese')) return 'Lácteos';
  if (s.includes('snack') || s.includes('chip') || s.includes('cookie') || s.includes('galleta')) return 'Snacks';
  return 'Abarrotes';
}

function generateStockPDF(title: string, items: Product[], tipo: 'bajo' | 'agotado') {
  const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  const color = tipo === 'bajo' ? '#D97706' : '#DC2626';
  const filas = items.map(p => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-weight:600">${p.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;color:#6366f1;font-weight:700">${p.sku}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:${color}">${p.stock} uds</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">$${p.cost.toFixed(2)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#6366f1">$${p.price.toFixed(2)}</td>
    </tr>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;max-width:800px;margin:0 auto}
    h1{color:${color};font-size:22px;margin-bottom:4px}.sub{color:#64748b;font-size:13px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse}
    th{background:${color};color:white;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase}
    tr:nth-child(even){background:#f8fafc}
    .badge{display:inline-block;background:${color}22;color:${color};padding:2px 10px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px}
    </style></head><body>
    <h1>${title}</h1><p class="sub">Generado el ${fecha}</p>
    <div class="badge">${items.length} producto${items.length !== 1 ? 's' : ''}</div>
    <table><thead><tr><th>Producto</th><th>SKU</th><th style="text-align:center">Stock</th>
    <th style="text-align:right">Costo</th><th style="text-align:right">Precio</th></tr></thead>
    <tbody>${filas}</tbody></table></body></html>`;
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400); }
}


export default function InventarioTab({ products, onAddProduct, onEditProduct, onDeleteProduct, config }: InventarioTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  
  const productCats = config?.productCategories || ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'];
  const defaultCategory = productCats.length > 0 ? productCats[0] : 'Bebidas';

  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    category: string;
    stock: string | number;
    price: string | number;
    cost: string | number;
    imageUrl: string;
  }>({
    sku: '', name: '', category: defaultCategory,
    stock: 0, price: '', cost: '', imageUrl: PRESET_IMAGES[0].url
  });
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [productFetchMsg, setProductFetchMsg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const lookupBarcode = useCallback(async (barcode: string) => {
    setFormData(prev => ({ ...prev, sku: barcode }));
    setFetchingProduct(true);
    setProductFetchMsg('');
    
    let found = false;
    let pName = '';
    let pImg = '';
    let pCat: Product['category'] = 'Abarrotes';

    // Paso 1: Consulta a Open Food Facts API
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          const p = data.product;
          pName = p.product_name_es || p.product_name || p.product_name_en || '';
          pImg = p.image_front_url || p.image_url || '';
          pCat = detectCategory(p.categories_tags || []);
          found = true;
        }
      }
    } catch (err) {
      console.warn('Open Food Facts lookup failed:', err);
    }

    // Paso 2 (Fallback): Consulta en cascada a UPCitemdb con AllOrigins CORS proxy
    if (!found) {
      try {
        const upcUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(upcUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.contents) {
            const upcData = JSON.parse(data.contents);
            if (upcData && upcData.items && upcData.items.length > 0) {
              const item = upcData.items[0];
              pName = item.title || '';
              pImg = item.images?.[0] || '';
              if (item.category) {
                pCat = detectCategory([item.category]);
              }
              found = true;
            }
          }
        }
      } catch (err) {
        console.warn('UPCitemdb fallback lookup failed:', err);
      }
    }

    // Paso 3 & 4: Auto-llenado o Alerta amistosa
    if (found) {
      setFormData(prev => ({
        ...prev,
        sku: barcode,
        name: pName || prev.name,
        imageUrl: pImg || prev.imageUrl,
        category: pCat
      }));
      setProductFetchMsg(pName ? `✅ Encontrado: ${pName}` : '⚠️ Código OK, completa el nombre manualmente.');
    } else {
      setProductFetchMsg('⚠️ No encontrado. Ingrese los datos de forma manual.');
      alert('Producto nuevo no encontrado en bases de datos públicas. Por favor, ingrese los detalles manualmente.');
    }
    setFetchingProduct(false);
  }, []);

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockItems = products.filter(p => p.stock === 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = useCallback(() => {
    setEditingItem(null);
    setProductFetchMsg('');
    setFormData({
      sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
      name: '', category: defaultCategory, stock: 12, price: '', cost: '',
      imageUrl: PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  }, [defaultCategory]);

  const handleOpenEdit = useCallback((product: Product) => {
    setEditingItem(product);
    setProductFetchMsg('');
    setFormData({
      sku: product.sku, name: product.name, category: product.category,
      stock: product.stock, price: product.price, cost: product.cost,
      imageUrl: product.imageUrl || PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  }, []);

  /* ── SISTEMA DE ENRUTAMIENTO DE ESCANEO DE CODIGO DE BARRAS (REGLA 6) ── */
  const handleBarcodeScanResult = useCallback((barcode: string) => {
    setShowScanner(false);
    
    // Buscar en el Firestore existente si el código ya existe
    const foundProduct = products.find(
      p => p.sku === barcode || p.sku.trim() === barcode.trim()
    );

    if (foundProduct) {
      // Si existe: mostrar los datos del producto encontrado (abrir modal de edición)
      handleOpenEdit(foundProduct);
    } else {
      // Si no existe: abrir formulario para agregar nuevo producto con el código pre-llenado
      setEditingItem(null);
      setProductFetchMsg('Buscando detalles del producto...');
      setFormData({
        sku: barcode,
        name: '',
        category: defaultCategory,
        stock: 12,
        price: '',
        cost: '',
        imageUrl: PRESET_IMAGES[0].url
      });
      setShowAddModal(true);
      // Auto-buscar detalles desde bases de datos externas Open Food Facts / UPCitemdb
      lookupBarcode(barcode);
    }
  }, [products, handleOpenEdit, lookupBarcode, defaultCategory]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del producto.');
      return;
    }
    setLoading(true);
    try {
      const parsedData = {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        stock: parseInt(String(formData.stock), 10) || 0,
        price: parseFloat(String(formData.price)) || 0,
        cost: parseFloat(String(formData.cost)) || 0,
        imageUrl: formData.imageUrl
      };
      if (editingItem) {
        await onEditProduct({ ...editingItem, ...parsedData, updatedAt: new Date().toISOString() });
      } else {
        await onAddProduct(parsedData);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingItem) return;
    if (!window.confirm('¿Eliminar este producto?')) return;
    setLoading(true);
    try {
      await onDeleteProduct(editingItem.id);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Optimal width for product grid thumbnails
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
          setFormData(prev => ({ ...prev, imageUrl: compressed }));
        } else {
          setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
        }
        setUploadingImage(false);
      };
      img.onerror = () => {
        setUploadingImage(false);
      };
    };
    reader.onerror = () => {
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const categories = ['Todos', ...productCats];

  return (
    <div className="space-y-5 pb-24">

      {/* ── STATS ── */}
      <section className="grid grid-cols-3 gap-3 mt-1">
        <div className="bg-slate-950 p-4 rounded-2xl shadow-md flex flex-col gap-1 border-2 border-slate-900">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Uds</span>
          <span className="text-3xl font-black text-white">{totalStock.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[2.5]" />
              <span className="text-xs font-black text-amber-805 uppercase tracking-wide">Bajo</span>
            </div>
            {lowStockItems.length > 0 && (
              <button type="button" onClick={() => generateStockPDF('⚠️ Bajo Stock', lowStockItems, 'bajo')} className="text-amber-600 hover:text-amber-900 transition-colors cursor-pointer bg-white p-1 rounded-lg border border-amber-200 shadow-2xs">
                <FileDown className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            )}
          </div>
          <span className="text-2xl font-black text-amber-700">{lowStockItems.length}</span>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-300 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-rose-700 stroke-[2.5]" />
              <span className="text-xs font-black text-rose-805 uppercase tracking-wide">Agot.</span>
            </div>
            {outOfStockItems.length > 0 && (
              <button type="button" onClick={() => generateStockPDF('🔴 Agotados', outOfStockItems, 'agotado')} className="text-rose-600 hover:text-rose-900 transition-colors cursor-pointer bg-white p-1 rounded-lg border border-rose-200 shadow-2xs">
                <FileDown className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            )}
          </div>
          <span className="text-2xl font-black text-rose-700">{outOfStockItems.length}</span>
        </div>
      </section>

      {/* ── BÚSQUEDA CON BOTÓN DE ESCÁNER DE BARRAS DIRECTO (REGLA 6) ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 stroke-[2.5]" />
          <input
            className="w-full pl-11 pr-10 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all text-base placeholder:text-slate-500 font-extrabold shadow-sm text-slate-950"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xl font-black cursor-pointer bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">×</button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md border-2 border-emerald-500 active:scale-95 text-xs font-black gap-1.5"
          title="Scanner de Código de Barras"
        >
          <ScanBarcode className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Escanear</span>
        </button>
      </div>

      {/* ── CATEGORÍAS ── */}
      <div className="flex gap-3 overflow-x-auto -mx-3 px-3 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex flex-col items-center gap-1.5 px-6 py-3.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105 border-2 border-emerald-555'
                : 'bg-white text-slate-800 shadow-sm border-2 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-3xl">{getCategoryIcon(cat, config)}</span>
            <span className="font-black">{cat}</span>
          </button>
        ))}
      </div>

      {/* ── LISTA DE PRODUCTOS ── */}
      <section className="flex flex-col gap-4">
        {filteredProducts.map((p) => {
          const isOutOfStock = p.stock === 0;
          const isLowStock = p.stock > 0 && p.stock <= 5;
          const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
          return (
            <div
              key={p.id}
              onClick={() => handleOpenEdit(p)}
              className={`bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col shadow-sm ${
                isOutOfStock ? 'border-slate-200 opacity-75 bg-slate-50' : isLowStock ? 'border-amber-400 ring-2 ring-amber-400/10' : 'border-slate-200 active:border-emerald-500 hover:shadow-md'
              }`}
            >
              <div className="relative h-44 w-full bg-slate-100 shrink-0">
                <img
                  alt={p.name}
                  className="w-full h-full object-contain p-2.5 bg-white transition-transform duration-500 hover:scale-[1.01]"
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'; }}
                  referrerPolicy="no-referrer"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-rose-600 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-sm">
                      Agotado
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg">
                    {getCategoryIcon(p.category, config)} {p.category}
                  </span>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${marginPercent >= 30 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                    +{marginPercent}% margen
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-xl leading-tight truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold tracking-wide mt-1 font-mono">SKU: {p.sku}</p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-205">
                  <span className={`text-xs font-black px-3.5 py-2 rounded-xl border ${
                    isOutOfStock ? 'bg-rose-50 text-rose-700 border-rose-200' : isLowStock ? 'bg-amber-50 text-amber-700 border-amber-305' : 'bg-slate-50 text-slate-800 border-slate-250'
                  }`}>
                    {isLowStock && '⚠️ '}{p.stock} unidades
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Precio</span>
                    <span className="text-2xl font-black text-emerald-600">${p.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-800 font-extrabold bg-slate-100 p-3.5 rounded-2xl mt-1 border-2 border-slate-200">
                  <span>Costo: ${p.cost.toFixed(2)}</span>
                  <span className="text-emerald-750 font-black">Ganancia: ${(p.price - p.cost).toFixed(2)} / ud</span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <PackageOpen className="w-16 h-16 stroke-1 text-gray-300" />
            <p className="text-lg font-bold text-gray-500">Ningún producto encontrado</p>
          </div>
        )}
      </section>

      {/* ── FAB ── */}
      <button
        type="button"
        onClick={handleOpenAdd}
        className="fixed bottom-20 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 active:scale-95 hover:shadow-xl transition-all z-40 hover:rotate-90 duration-300 cursor-pointer"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* ── MÁSCARA ESCÁNER CON PORTAL NATIVO ── */}
      {typeof document !== 'undefined' && createPortal(
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onBarcodeDetected={handleBarcodeScanResult}
        />,
        document.body
      )}

      {/* ── MODAL NUEVO/EDITAR PRODUCTO ── */}
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-white flex flex-col overflow-hidden md:max-w-md md:left-1/2 md:-translate-x-1/2 md:shadow-2xl md:border-x md:border-gray-100" style={{ zIndex: 9999 }}>

          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white shrink-0">
            <h3 className="text-lg font-extrabold text-gray-950">
              {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button type="button" onClick={() => setShowAddModal(false)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo con Scroll */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-32">

            {/* Imagen */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Imagen del Producto</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 bg-slate-50 relative flex items-center justify-center">
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  <img src={formData.imageUrl} className="w-full h-full object-contain p-1 bg-white" alt="preview" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="flex items-center justify-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-black text-xs py-2.5 px-3 rounded-xl cursor-pointer hover:bg-emerald-100/60 transition-colors">
                    <Image className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                    <span>Subir desde Galería</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleGalleryImage} />
                  </label>
                  <label className="flex items-center justify-center gap-2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black text-xs py-2.5 px-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                    <Camera className="w-4 h-4 text-slate-650 stroke-[2.5]" />
                    <span>Tomar Foto</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleGalleryImage} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto py-1.5">
                {PRESET_IMAGES.map((img, i) => (
                  <button key={i} type="button" onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${formData.imageUrl === img.url ? 'ring-2 ring-emerald-500 scale-105 border-emerald-600' : 'border-slate-200 opacity-60'}`}>
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Nombre *</label>
              <input type="text" placeholder="Ej. Coca Cola 3L"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white outline-none font-bold text-slate-950"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">SKU / Código de Barras *</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Escanea o escribe..."
                  className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none font-bold outline-hidden"
                  value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                <button type="button" onClick={() => setShowScanner(true)}
                  className="bg-emerald-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shrink-0 cursor-pointer border border-emerald-500 shadow-md">
                  <ScanBarcode className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
              {fetchingProduct && <p className="text-xs text-emerald-600 font-bold animate-pulse">🔍 Buscando producto...</p>}
              {productFetchMsg && (
                <p className={`text-xs font-bold ${productFetchMsg.startsWith('✅') ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {productFetchMsg}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">Categoría *</label>
              <select className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-3.5 text-sm outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white"
                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {productCats.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat, config)} {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock / Costo / Precio */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Stock', key: 'stock', type: 'number', step: '1' },
                { label: 'Costo ($)', key: 'cost', type: 'number', step: '0.01' },
                { label: 'Precio ($)', key: 'price', type: 'number', step: '0.01' },
              ].map(({ label, key, type, step }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-black text-slate-755 uppercase tracking-wider block">{label}</label>
                   <input type={type} step={step} min="0"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-2 py-3.5 text-sm text-center outline-none font-bold text-slate-950 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white"
                     value={(formData as any)[key]}
                     onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="p-4 bg-slate-100 border-t-2 border-slate-200 flex gap-3 shrink-0 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {editingItem && (
              <button type="button" onClick={handleDeleteProduct} disabled={loading}
                className="flex-1 bg-white text-rose-600 border-2 border-rose-205 hover:bg-rose-50 py-3.5 rounded-2xl text-sm font-black active:scale-95 transition-all outline-none disabled:opacity-50 cursor-pointer">
                Eliminar
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 bg-emerald-600 text-white font-black py-4 px-5 rounded-2xl text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 outline-none shadow-md cursor-pointer border border-emerald-500 flex items-center justify-center">
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : editingItem ? (
                '💾 Guardar Cambios'
              ) : (
                '✅ Agregar Producto'
              )}
            </button>
          </div>

        </div>,
        document.body
      )}
    </div>
  );
}
