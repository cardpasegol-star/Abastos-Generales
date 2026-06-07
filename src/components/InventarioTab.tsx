import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ScanBarcode, Plus, PackageOpen, AlertTriangle, AlertCircle, RefreshCw, X, Camera, FileDown, Image } from 'lucide-react';
import { Product } from '../types';

interface InventarioTabProps {
  products: Product[];
  onAddProduct: (item: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  onEditProduct: (item: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

const PRESET_IMAGES = [
  { label: 'Bebida Lata', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKLM-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk' },
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

export default function InventarioTab({ products, onAddProduct, onEditProduct, onDeleteProduct }: InventarioTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '', name: '', category: 'Bebidas' as Product['category'],
    stock: 0, price: 0.0, cost: 0.0, imageUrl: PRESET_IMAGES[0].url
  });
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [productFetchMsg, setProductFetchMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const stopScanner = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const lookupBarcode = useCallback(async (barcode: string) => {
    setFormData(prev => ({ ...prev, sku: barcode }));
    setFetchingProduct(true);
    setProductFetchMsg('');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nombre = p.product_name_es || p.product_name || p.product_name_en || '';
        const imagen = p.image_front_url || p.image_url || '';
        const categoria = detectCategory(p.categories_tags || []);
        setFormData(prev => ({
          ...prev,
          sku: barcode,
          name: nombre || prev.name,
          imageUrl: imagen || prev.imageUrl,
          category: categoria
        }));
        setProductFetchMsg(nombre ? `✅ Encontrado: ${nombre}` : '⚠️ Código OK, completa el nombre manualmente.');
      } else {
        setProductFetchMsg('⚠️ No encontrado en base de datos. Completa manualmente.');
      }
    } catch {
      setProductFetchMsg('⚠️ Sin conexión externa.');
    } finally {
      setFetchingProduct(false);
    }
  }, []);

  useEffect(() => {
    if (!showScanner) return;
    let active = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanLoop();
        }
      } catch {
        setProductFetchMsg('⚠️ No se pudo acceder a la cámara.');
        setShowScanner(false);
      }
    };
    const scanLoop = async () => {
      if (!('BarcodeDetector' in window)) {
        setProductFetchMsg('⚠️ Tu navegador no soporta escaneo. Escribe el código manualmente.');
        setShowScanner(false);
        return;
      }
      // @ts-ignore
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
      });
      const detect = async () => {
        if (!active || !videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            stopScanner();
            setShowScanner(false);
            await lookupBarcode(code);
            return;
          }
        } catch {}
        animFrameRef.current = requestAnimationFrame(detect);
      };
      animFrameRef.current = requestAnimationFrame(detect);
    };
    startCamera();
    return () => { active = false; stopScanner(); };
  }, [showScanner, stopScanner, lookupBarcode]);

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockItems = products.filter(p => p.stock === 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setProductFetchMsg('');
    setFormData({
      sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
      name: '', category: 'Bebidas', stock: 10, price: 1.50, cost: 1.00,
      imageUrl: PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingItem(product);
    setProductFetchMsg('');
    setFormData({
      sku: product.sku, name: product.name, category: product.category,
      stock: product.stock, price: product.price, cost: product.cost,
      imageUrl: product.imageUrl || PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del producto.');
      return;
    }
    setLoading(true);
    try {
      if (editingItem) {
        await onEditProduct({ ...editingItem, ...formData, updatedAt: new Date().toISOString() });
      } else {
        await onAddProduct(formData);
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
    const reader = new FileReader();
    reader.onload = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const categories = ['Todos', 'Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'];

  return (
    <div className="space-y-5 pb-24">

      {/* ── STATS ── */}
      <section className="grid grid-cols-3 gap-3 mt-1">
        <div className="bg-indigo-600 p-4 rounded-2xl shadow-md flex flex-col gap-1">
          <span className="text-xs font-bold text-indigo-200 uppercase">Total Uds</span>
          <span className="text-3xl font-extrabold text-white">{totalStock.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/50 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase">Bajo</span>
            </div>
            {lowStockItems.length > 0 && (
              <button onClick={() => generateStockPDF('⚠️ Bajo Stock', lowStockItems, 'bajo')} className="text-amber-600 hover:text-amber-800 transition-colors">
                <FileDown className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-2xl font-extrabold text-amber-700">{lowStockItems.length}</span>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200/50 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-bold text-rose-800 uppercase">Agot.</span>
            </div>
            {outOfStockItems.length > 0 && (
              <button onClick={() => generateStockPDF('🔴 Agotados', outOfStockItems, 'agotado')} className="text-rose-600 hover:text-rose-800 transition-colors">
                <FileDown className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-2xl font-extrabold text-rose-700">{outOfStockItems.length}</span>
        </div>
      </section>

      {/* ── BÚSQUEDA ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400 shadow-sm"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
        )}
      </div>

      {/* ── CATEGORÍAS ── */}
      <div className="flex gap-3 overflow-x-auto -mx-3 px-3 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-800 shadow-md border border-gray-100'
            }`}
          >
            <span className="text-3xl">{CATEGORY_ICONS[cat] || '📦'}</span>
            <span className="font-extrabold">{cat}</span>
          </button>
        ))}
      </div>

      {/* ── LISTA DE PRODUCTOS ── */}
      <section className="flex flex-col gap-3">
        {filteredProducts.map((p) => {
          const isOutOfStock = p.stock === 0;
          const isLowStock = p.stock > 0 && p.stock <= 5;
          const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
          return (
            <div
              key={p.id}
              onClick={() => handleOpenEdit(p)}
              className={`bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer flex gap-4 shadow-sm items-center ${
                isOutOfStock ? 'border-gray-200 opacity-70' : isLowStock ? 'border-amber-400' : 'border-gray-100 active:border-indigo-400'
              }`}
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border-2 border-gray-200">
                <img
                  alt={p.name}
                  className="w-full h-full object-cover"
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'; }}
                  referrerPolicy="no-referrer"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-rose-600 text-white font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded">Agotado</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider">
                  {CATEGORY_ICONS[p.category] || '📦'} {p.category}
                </span>
                <h3 className="font-extrabold text-gray-950 text-xl leading-tight truncate mt-0.5">{p.name}</h3>
                <p className="text-xs text-gray-400 font-bold mb-2">SKU: {p.sku}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-base font-extrabold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-500' : 'text-gray-800'}`}>
                    {isLowStock && '⚠️ '}{p.stock} uds
                  </span>
