import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Edit3, Trash2, Save, MapPin, RefreshCw, AlertTriangle, Plus, X, Camera } from 'lucide-react';
import { Product, FoodItem, BusinessConfig } from '../types';
import { resetDatabaseToDefault } from '../initDb';

interface MantTabProps {
  products: Product[];
  foodItems: FoodItem[];
  config: BusinessConfig;
  onUpdateConfig: (newCfg: BusinessConfig) => Promise<void>;
  onEditProduct: (p: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddFoodItem: (f: Omit<FoodItem, 'id'>) => Promise<void>;
  onDeleteFoodItem: (id: string) => Promise<void>;
}

export default function MantTab({
  products,
  foodItems,
  config,
  onUpdateConfig,
  onEditProduct,
  onDeleteProduct,
  onAddFoodItem,
  onDeleteFoodItem
}: MantTabProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [confirmDeleteDish, setConfirmDeleteDish] = useState<{ id: string; name: string } | null>(null);
  const [confirmResetDb, setConfirmResetDb] = useState(false);
  const [notifyResetSuccess, setNotifyResetSuccess] = useState(false);

  const [localName, setLocalName] = useState(config.name || 'Donde el Goyo');
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || '+5491112345678');
  const [gps, setGps] = useState(config.gps || 'Calle Principal #123');
  const [adminPinField, setAdminPinField] = useState(config.adminPin || '1234');
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(config.bannerUrl);

  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [showDishModal, setShowDishModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState(10.00);
  const [dishCategory, setDishCategory] = useState<FoodItem['category']>('Almuerzos');

  const [loading, setLoading] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);

  useEffect(() => {
    setLocalName(config.name || 'Donde el Goyo');
    setWhatsapp(config.whatsapp || '+5491112345678');
    setGps(config.gps || 'Calle Principal #123');
    setAdminPinField(config.adminPin || '1234');
    setBannerPreview(config.bannerUrl);
  }, [config]);

  const handleDial = (num: string) => {
    if (pinError) setPinError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const correctPin = config.adminPin || '1234';
        if (nextPin === correctPin) {
          setIsUnlocked(true);
        } else {
          setPinError(true);
          setTimeout(() => { setPin(''); setPinError(false); }, 1000);
        }
      }
    }
  };

  const handleClear = () => setPin('');
  const handleBackspace = () => setPin(p => p.slice(0, -1));

 const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement('canvas');

    // Máximo 800px de ancho, manteniendo proporción
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Calidad 0.7 = buen balance tamaño/calidad
    const compressed = canvas.toDataURL('image/jpeg', 0.7);
    setBannerPreview(compressed);
    URL.revokeObjectURL(objectUrl);
  };

  img.src = objectUrl;
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
        logoUrl: config.logoUrl,
        bannerUrl: bannerPreview
      });
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
      await resetDatabaseToDefault();
      setNotifyResetSuccess(true);
      setTimeout(() => setNotifyResetSuccess(false), 4000);
      setIsUnlocked(false);
      setPin('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    setLoading(true);
    try {
      await onAddFoodItem({
        name: dishName.trim(),
        description: dishDesc.trim(),
        price: dishPrice,
        category: dishCategory,
        isPopular: false,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
      });
      setDishName(''); setDishDesc(''); setDishPrice(10.00);
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

  // LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-7 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-2 text-indigo-600">
            <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Acceso Restringido</h2>
          <p className="text-xs text-gray-400 font-medium leading-normal">
            Ingrese su PIN de administrador para continuar
          </p>
        </div>

        <div className={`flex gap-4 py-2 ${pinError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              pinError ? 'border-rose-400 bg-rose-500' : idx < pin.length ? 'border-indigo-600 bg-indigo-600 scale-110' : 'border-gray-200 bg-transparent'
            }`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-[270px]">
          {['1','2','3','4','5','6','7','8','9'].map(num => (
            <button key={num} onClick={() => handleDial(num)}
              className="h-14 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 font-bold text-gray-800 text-lg active:scale-90 transition-transform flex items-center justify-center">
              {num}
            </button>
          ))}
          <button onClick={handleClear} className="h-14 rounded-2xl text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center">Clear</button>
          <button onClick={() => handleDial('0')} className="h-14 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 font-bold text-gray-800 text-lg active:scale-90 transition-transform flex items-center justify-center">0</button>
          <button onClick={handleBackspace} className="h-14 rounded-2xl text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center justify-center">Backspace</button>
        </div>
      </div>
    );
  }

  // ADMIN PANEL
  return (
    <div className="space-y-6 pb-28 animate-in slide-in-from-bottom-8 duration-400">

      {notifySaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>¡Datos actualizados con éxito en Firestore!</span>
        </div>
      )}

      {/* Sección A: Datos del negocio */}
      <section className="space-y-3">
        <h3 className="text-sm font-extrabold text-gray-950 px-1 uppercase tracking-wider">
          Datos del Negocio
        </h3>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">

          {/* ── FOTO DEL BANNER ── */}
          <div className="space-y-2">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">
              Foto del Banner (cabecera)
            </label>

            {/* Preview */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 border border-gray-100">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white/30" />
                </div>
              )}
              {/* Botón encima del preview */}
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{bannerPreview ? 'Cambiar foto' : 'Subir foto'}</span>
              </button>
              {/* Botón quitar foto */}
              {bannerPreview && (
                <button
                  onClick={() => setBannerPreview(undefined)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-rose-600 text-white rounded-full text-xs transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
            <p className="text-[10px] text-gray-400 font-medium">
              La foto se guarda al presionar "Guardar Configuración"
            </p>
          </div>

          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Local</label>
            <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              value={localName} onChange={(e) => setLocalName(e.target.value)} />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp de Despacho</label>
            <input type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          {/* GPS + PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Ubicación GPS</label>
              <div className="relative">
                <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm pr-9 focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white outline-none"
                  value={gps} onChange={(e) => setGps(e.target.value)} />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">PIN Admin</label>
              <input type="text" placeholder="Ej. 1234" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white outline-none text-center font-bold"
                value={adminPinField} onChange={(e) => setAdminPinField(e.target.value)} />
            </div>
          </div>

          <button onClick={handleSaveConfig} disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-55 flex items-center justify-center gap-1 shadow-sm cursor-pointer">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración</span>
          </button>
        </div>
      </section>

      {/* Sección B: Menú */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider">Gestión del Menú</h3>
          <span className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
            {foodItems.length} platos
          </span>
        </div>

        <button onClick={() => setShowDishModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 p-4 rounded-xl text-xs font-bold transition-all outline-none">
          <Plus className="w-4 h-4" />
          <span>Agregar nuevo plato al menú</span>
        </button>

        <div className="space-y-2.5">
          {foodItems.map(dish => (
            <div key={dish.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-extrabold text-gray-900 text-xs truncate">{dish.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{dish.category} • ${dish.price.toFixed(2)}</p>
              </div>
              <button onClick={() => setConfirmDeleteDish({ id: dish.id, name: dish.name })}
                className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sección C: Zona Peligrosa */}
      <section className="space-y-3 pt-5 border-t border-gray-100">
        <div className="flex items-center gap-2 text-rose-600 px-1">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Zona Peligrosa</h3>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200/50 space-y-3.5">
          <p className="text-center text-xs leading-relaxed text-rose-900">
            Esta acción eliminará permanentemente todos los registros de ventas, cargará productos por defecto y restaurará las credenciales.
          </p>
          <button onClick={() => setConfirmResetDb(true)} disabled={loading}
            className="w-full bg-rose-600 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-tight shadow-md active:scale-[0.98] transition-all disabled:opacity-55 cursor-pointer">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Restablecer Base de Datos'}
          </button>
        </div>
      </section>

      {/* Modal nuevo plato */}
      {showDishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center bg-gray-50 px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-950">Nuevo Plato</h3>
              <button onClick={() => setShowDishModal(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDish} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Plato *</label>
                <input type="text" required placeholder="Ej. Empanadas de Carne"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none font-semibold"
                  value={dishName} onChange={(e) => setDishName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio ($)</label>
                  <input type="number" step="0.01" required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-center outline-none font-bold"
                    value={dishPrice} onChange={(e) => setDishPrice(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm outline-none cursor-pointer"
                    value={dishCategory} onChange={(e) => setDishCategory(e.target.value as FoodItem['category'])}>
                    <option value="Almuerzos">Almuerzos</option>
                    <option value="Sopas">Sopas</option>
                    <option value="Postres">Postres</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                <textarea required rows={3} placeholder="Ej. masa crujiente frita rellena con carne..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                  value={dishDesc} onChange={(e) => setDishDesc(e.target.value)} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all outline-none">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Crear Plato'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar reset */}
      {confirmResetDb && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center border border-slate-100 shadow-2xl">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Restablecer Datos</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">Esta operación es irreversible. ¿Desea continuar?</p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmResetDb(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs cursor-pointer">Cancelar</button>
              <button onClick={executeResetDb} className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar plato */}
      {confirmDeleteDish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center border border-slate-100 shadow-2xl">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-slate-500 border border-slate-200">
              <Trash2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">¿Eliminar Plato?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-normal">
              ¿Seguro que desea quitar <span className="font-bold">"{confirmDeleteDish.name}"</span>?
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDeleteDish(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs cursor-pointer">Cancelar</button>
              <button onClick={executeDeleteDish} className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {notifyResetSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-center text-xs font-bold shadow-xl">
          Base de datos restablecida correctamente.
        </div>
      )}
    </div>
  );
}
