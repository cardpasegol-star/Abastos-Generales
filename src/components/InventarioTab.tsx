import React, { useState } from 'react';
import { Search, ScanBarcode, Plus, PackageOpen, AlertTriangle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Product } from '../types';

interface InventarioTabProps {
  products: Product[];
  onAddProduct: (item: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  onEditProduct: (item: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

const PRESET_IMAGES = [
  { label: 'Bebida Lata (Azul)', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKLM-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk' },
  { label: 'Pan Artesanal', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr8u8wXDvpaNlG_Zq4Ebyy33Hy-gCEr5nVQiTk5CEI0Sva5jVF_J0WcfbJBeFSQsdIC5oP2vvQfC4mldu51JTs-gse8Xo9Zj_NFsaRcSvMoUW7EG_9wpJ4NqTZ-2IX0YinKfCGy_bapUtHhNVVbItz8ULk1KAo_dfFhbeN6srciOXmYuCynlfhrjZKOo9oyUKBd1kL_SYuZBxkvd2zEShZhfvVp4mffGMPr_1zkFzK7u8UC6koC1VsKpC1pOQEAMTzsE-KJkN743o' },
  { label: 'Leche entera', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfltLCYu3aB_3sd7mXGNlKGUjdV6mTGvaP8oLfH1ogkMUYzcysGwRqOHRlAIVNQfCncW2GfIvIpU05SFsHLsl7ibHcRbvnvri5c9JQ10kOaWz6PD9Ka3J3TGNh4anl0fKMxhmQ0iU7LziNgPkg4SnyTKmNmNEfFcnoMykBP3p2ZKqXjGgpdqlro8hwr2EaVDjhuSsQmJDerBcEwcSAlT-DAyF2m5UxA4pay_IrcpQdwU7ZgbhuaC4rmLEvnFUG227N0SrfINWzYqg' },
  { label: 'Papas fritas (Chips)', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUF1NcIGYG2T3McNvhGUjed9u7fCunvxJ2UatiMBW1uGyTFK6frS3_ftz2XVCDronGS_zK23LrBTEEgg24yu5t3fj5TZu6L5pzpr6_jbJY5O6cudx5unBBU_yAwOQYwOrUr7Cv5ztUr02HzuHu0wXRjn3Q-qYwiKuHd38sjhTvRDDtwKEorPVyhYQfpJy6fad_aE1Svbe5pN8Xf2agc2pxkAmEfk0Wnla_3u8hQStkl7b1pMzBvIo0cza8sl5VfTO5lx6RXEm6Pws' },
  { label: 'Aguacate Hass', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHwCOIzMAguRTJrr8d3e9LlqCNrcvXChDmwyJ1INeC785VEq3zcb45qJdduZ9B6w7bfW9jjndYhiQPZj7lj26Bgi1WzCZVsFJsuBcFxJpotpFRcpH2zYvlED5lNmPNsJVcxg8CNTNelLVp8qzpLtmTDTVKRDElFVy3faTWb2hpCI_4taE5AeM4sj72NwNWlIRla2wcowcktVwejxl7gXRzeZFXDH5jzXm92SUW4wybAAAKORVhJec7LUNiT2kSro5ZAvRcsE02h4' },
  { label: 'Naranjas Orgánicas', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7Odb9m9LVBsEv4N50b5NJeq4bSmQe9fWnrbQ_MFFXlflgpuektEG3pJlhrq7JEaqzZrPWP2wTS98S5M9PtW9BzjAdNjOSiwD1Y3PD5dMyCLmBdA2gQh4D-irqFYEnTAYsx4taGp5CeNQPF3IVGtIqXbNothSbFsLQ_mciNmM9EkZh-UbZ01BldH3wTPcc1FpP7CPqXQtAZ-XoR8rA9IeA4qX1I2omsgUwU-vJzzLY6QnBDuq3vZ9EIEmaLMtEC2tf8Z2no7Dvw0' },
  { label: 'Aceite de Oliva', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0w6AWq-EHcBx5SuE1-ScX63fUy0pIOosoofZhQgWqRScufztzr1Cf2VtxDJmQVWbXZ3jwI5MHC640Tl9S-TPjjKr3mbyNjtKH0lwvpmtd16tk4KmQIbDOEpGxPoV9ekw_84kwl4Uebrv2OkS-9u84SA7YXTiFaDx-bNGvjGiM1j56mtdqwCMCuCArG-m3tmWksTH_a83vwvtRkNRyd3Xo8H6ZQD-O8nilMNJt70pim4Hz42_qeiAvcSLQ_jYF89-NYb-FPWUMklw' }
];

export default function InventarioTab({ products, onAddProduct, onEditProduct, onDeleteProduct }: InventarioTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Bebidas' as Product['category'],
    stock: 0,
    price: 0.0,
    cost: 0.0,
    imageUrl: PRESET_IMAGES[0].url
  });

  const [loading, setLoading] = useState(false);

  // Calculate statistics
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

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
      name: '',
      category: 'Bebidas',
      stock: 10,
      price: 1.50,
      cost: 1.00,
      imageUrl: PRESET_IMAGES[0].url
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingItem(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      cost: product.cost,
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
        await onEditProduct({
          ...editingItem,
          ...formData,
          updatedAt: new Date().toISOString()
        });
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

  const handleRandomScan = () => {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    setSearch(randomProduct.sku);
  };

  return (
    <div id="inventario-container" className="space-y-6 pb-24">
      {/* 1. Dashboard Stats Cards */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col gap-1 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Total Uds</span>
          <span className="text-xl font-extrabold text-indigo-600">{totalStock.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/50 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">Bajo Stock</span>
          </div>
          <span className="text-xl font-extrabold text-amber-700">{lowStockCount}</span>
        </div>
        <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200/50 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-tight">Agotados</span>
          </div>
          <span className="text-xl font-extrabold text-rose-700">{outOfStockCount}</span>
        </div>
      </section>

      {/* 2. Search & Scanner Simulator button */}
      <section className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-4.5 h-4.5" />
          <input
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all text-sm text-gray-850 placeholder:text-gray-400 h-12"
            placeholder="Buscar productos..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
            >
              ×
            </button>
          )}
        </div>
        <button 
          onClick={handleRandomScan}
          className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all text-sm shrink-0"
          title="Simular escaneo de código"
        >
          <ScanBarcode className="w-5.5 h-5.5" />
        </button>
      </section>

      {/* 3. Horizontal Category Scroller */}
      <section className="flex gap-2 overflow-x-auto scroller-no-bar -mx-4 px-4 py-1">
        {['Todos', 'Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* 4. Product Catalog Feed Grid */}
      <section className="grid grid-cols-2 gap-4">
        {filteredProducts.map((p) => {
          const isOutOfStock = p.stock === 0;
          const isLowStock = p.stock > 0 && p.stock <= 5;
          const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;

          return (
            <div
              key={p.id}
              onClick={() => handleOpenEdit(p)}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer relative flex flex-col shadow-sm select-none ${
                isOutOfStock 
                  ? 'border-gray-100 grayscale filter opacity-70 hover:opacity-95' 
                  : isLowStock 
                    ? 'border-amber-300 ring-2 ring-amber-300/10 hover:shadow-md' 
                    : 'border-gray-50 hover:border-indigo-100 hover:shadow-md'
              }`}
            >
              {/* Image Container with Dynamic stock alerts */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3 select-none">
                <img
                  alt={p.name}
                  className="w-full h-full object-cover select-none"
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'}
                  onError={(e) => {
                    // Fallback visual
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200';
                  }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Category tag */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-50/95 text-indigo-700 font-bold text-[9px] uppercase tracking-wider">
                  {p.category}
                </span>

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center">
                    <span className="bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                      Agotado
                    </span>
                  </div>
                )}

                {isLowStock && (
                  <div className="absolute bottom-2 left-2 bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    <span>Bajo Stock</span>
                  </div>
                )}
              </div>

              {/* Product Metadata */}
              <div className="flex-grow flex flex-col justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight truncate" title={p.name}>
                    {p.name}
                  </h3>
                  <p className="text-[10px] font-semibold text-gray-400">SKU: {p.sku}</p>
                  
                  <div className="flex items-center gap-1 text-[11px] font-medium pt-1">
                    <span className="text-gray-400">Stock:</span>
                    <span className={`font-bold ${
                      isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600 font-extrabold' : 'text-gray-800'
                    }`}>
                      {p.stock} uds
                    </span>
                  </div>
                </div>

                {/* Sell costs & calculated Margin markup */}
                <div className="pt-2 border-t border-gray-50 flex flex-col">
                  <span className="text-base font-extrabold text-indigo-600">${p.price.toFixed(2)}</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-gray-400 font-medium">Costo: ${p.cost.toFixed(2)}</span>
                    <span className={`text-[9.5px] font-extrabold px-1 py-0.2 rounded-md ${
                      marginPercent >= 30 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
                    }`}>
                      +{marginPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
            <PackageOpen className="w-10 h-10 stroke-1 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">Ningún producto encontrado</p>
            <p className="text-xs text-gray-400">Intente modificar sus filtros de búsqueda.</p>
          </div>
        )}
      </section>

      {/* 5. Fixed Circular FAB Button */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 hover:shadow-xl transition-all z-40 outline-none hover:rotate-90 duration-300"
        title="Agregar nuevo producto"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* 6. Form Overlay Modal: Add/Edit products */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gray-50/50 px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-950">
                {editingItem ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Coca Cola 3L"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="CC-001"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categoría *</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                  >
                    <option value="Bebidas">Bebidas</option>
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="10"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-3 text-sm text-center focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Costo ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="0.90"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-3 text-sm text-center focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0.0 })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="1.50"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-3 text-sm text-center focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0.0 })}
                  />
                </div>
              </div>

              {/* Image Preset Picker */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Elegir Imagen Referencial *</label>
                <div className="flex gap-2 overflow-x-auto scroller-no-bar py-1">
                  {PRESET_IMAGES.map((img, i) => {
                    const isSelected = formData.imageUrl === img.url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                          isSelected ? 'ring-2 ring-indigo-600 scale-105 border-indigo-600' : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-3">
                {editingItem && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('¿Seguro que desea eliminar este producto?')) {
                        setLoading(true);
                        try {
                          await onDeleteProduct(editingItem.id);
                          setShowAddModal(false);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="flex-1 bg-rose-50 text-rose-600 border border-rose-200/50 py-3 rounded-xl text-xs font-bold hover:bg-rose-100/50 active:scale-95 transition-all outline-none"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 bg-indigo-600 text-white font-bold py-3 px-5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 text-center outline-none select-none shadow-md"
                >
                  {loading ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin mx-auto" />
                  ) : editingItem ? (
                    'Guardar'
                  ) : (
                    'Agregar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
