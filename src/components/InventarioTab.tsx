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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
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
      // Usar BarcodeDetector nativo del navegador
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
    return () => {
      active = false;
      stopScanner();
    };
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
    setFormData({
      sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
      name: '', category: 'Bebidas', stock: 10, price: 1.50, cost: 1.00,
      imageUrl: PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingItem(product);
    setFormData({
      sku: product.sku, name: product.name, category: product.category,
      stock: product.stock, price: product.price, cost: product.cost,
      imageUrl: product.imageUrl || PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    try {
      if (editingItem) {
        await onEditProduct({ ...editingItem, ...formData, updatedAt: new Date().toISOString() });
      } else {
        await onAddProduct(formData);
      }
      setShowAddModal(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

     {/* ── CATEGORÍAS con íconos grandes estilo Uber Eats ── */}
      <div className="flex gap-3 overflow-x-auto -mx-3 px-3 pb-2 scrollbar-hide">
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
             {/* Imagen */}
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

              {/* Info */}
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
                  <span className="text-2xl font-extrabold text-indigo-600">${p.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 font-semibold">Costo: ${p.cost.toFixed(2)}</span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${marginPercent >= 30 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    +{marginPercent}%
                  </span>
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
        onClick={handleOpenAdd}
        className="fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 hover:shadow-xl transition-all z-40 hover:rotate-90 duration-300"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* ── MODAL AGREGAR / EDITAR ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
         <div className="bg-white w-full h-full sm:rounded-3xl sm:max-w-sm sm:h-auto overflow-hidden shadow-2xl flex flex-col" style={{height: '100dvh'}}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-950">
                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

           <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Imagen */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Imagen del Producto</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-100 shrink-0 bg-gray-50">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="preview" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all">
                      <Image className="w-4 h-4" />
                      <span>Subir desde Galería</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleGalleryImage} />
                    </label>
                    <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                      <Camera className="w-4 h-4" />
                      <span>Tomar Foto</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleGalleryImage} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {PRESET_IMAGES.map((img, i) => (
                    <button key={i} type="button" onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                      className={`w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${formData.imageUrl === img.url ? 'ring-2 ring-indigo-600 scale-105 border-indigo-600' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre *</label>
                <input type="text" required placeholder="Ej. Coca Cola 3L"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

             {/* SKU con escáner real + Open Food Facts */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">SKU / Código de Barras *</label>
                <div className="flex gap-2">
                  <input id="sku-scan-input" type="text" required placeholder="Escanea o escribe..."
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                    value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                  <button type="button" onClick={() => setShowScanner(true)}
                    className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shrink-0">
                    <ScanBarcode className="w-5 h-5" />
                  </button>
                </div>
                {fetchingProduct && (
                  <p className="text-xs text-indigo-600 font-bold animate-pulse">🔍 Buscando producto en base de datos...</p>
                )}
                {productFetchMsg && (
                  <p className={`text-xs font-bold ${productFetchMsg.startsWith('✅') ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {productFetchMsg}
                  </p>
                )}
              </div>

             {/* Modal del escáner nativo */}
              {showScanner && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4">
                  <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                      <h4 className="font-extrabold text-gray-900 text-base">📷 Escanear Código</h4>
                      <button onClick={() => { stopScanner(); setShowScanner(false); }}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative bg-black" style={{ height: '260px' }}>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      {/* Visor de escaneo */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-32 border-2 border-indigo-400 rounded-xl opacity-80">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 font-semibold py-3 px-4">
                      Apunta al código de barras del producto
                    </p>
                  </div>
                </div>
              )}

              {/* Categoría */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categoría *</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-base focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                  value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}>
                  <option value="Bebidas">🥤 Bebidas</option>
                  <option value="Abarrotes">🧴 Abarrotes</option>
                  <option value="Lácteos">🥛 Lácteos</option>
                  <option value="Snacks">🍿 Snacks</option>
                </select>
              </div>

              {/* Stock / Costo / Precio */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Stock', key: 'stock', type: 'number', step: '1' },
                  { label: 'Costo ($)', key: 'cost', type: 'number', step: '0.01' },
                  { label: 'Precio ($)', key: 'price', type: 'number', step: '0.01' },
                ].map(({ label, key, type, step }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                    <input type={type} step={step} required min="0"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-3 text-base text-center focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                      value={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: key === 'stock' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0 })} />
                  </div>
                ))}
              </div>

             </div>
            {/* Botones FIJOS abajo — fuera del scroll */}
            <div className="flex gap-3 p-5 pt-3 border-t border-gray-100 bg-white shrink-0">
              {editingItem && (
                <button type="button"
                  onClick={async () => {
                    if (window.confirm('¿Eliminar este producto?')) {
                      setLoading(true);
                      try { await onDeleteProduct(editingItem.id); setShowAddModal(false); }
                      catch (err) { console.error(err); }
                      finally { setLoading(false); }
                    }
                  }}
                  className="flex-1 bg-rose-50 text-rose-600 border border-rose-200/50 py-3.5 rounded-xl text-sm font-bold hover:bg-rose-100 active:scale-95 transition-all outline-none">
                  Eliminar
                </button>
              )}
              <button type="submit" onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-indigo-600 text-white font-bold py-3.5 px-5 rounded-xl text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 outline-none shadow-md">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
