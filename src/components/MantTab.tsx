import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit3, Trash2, Save, MapPin, RefreshCw, AlertTriangle, Plus, X, Laptop } from 'lucide-react';
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
  
  // Custom interactive confirm/alert states
  const [confirmDeleteDish, setConfirmDeleteDish] = useState<{ id: string; name: string } | null>(null);
  const [confirmResetDb, setConfirmResetDb] = useState(false);
  const [notifyResetSuccess, setNotifyResetSuccess] = useState(false);
  
  // Dashboard fields state
  const [localName, setLocalName] = useState(config.name || 'Donde el Goyo');
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || '+5491112345678');
  const [gps, setGps] = useState(config.gps || 'Calle Principal #123');
  const [adminPinField, setAdminPinField] = useState(config.adminPin || '1234');
  
  // Kitchen dish builder form state
  const [showDishModal, setShowDishModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState(10.00);
  const [dishCategory, setDishCategory] = useState<FoodItem['category']>('Almuerzos');
  
  const [loading, setLoading] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);

  // Keep state sync with firebase config loaded prop
  useEffect(() => {
    setLocalName(config.name || 'Donde el Goyo');
    setWhatsapp(config.whatsapp || '+5491112345678');
    setGps(config.gps || 'Calle Principal #123');
    setAdminPinField(config.adminPin || '1234');
  }, [config]);

  // Handle dial entries
  const handleDial = (num: string) => {
    if (pinError) setPinError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // Auto check on 4 entries
      if (nextPin.length === 4) {
        const correctPin = config.adminPin || '1234';
        if (nextPin === correctPin) {
          setIsUnlocked(true);
        } else {
          setPinError(true);
          setTimeout(() => {
            setPin('');
            setPinError(false);
          }, 1000);
        }
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
        adminPin: adminPinField.trim()
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
      // Unlocked session restarts
      setIsUnlocked(false);
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
        price: dishPrice,
        category: dishCategory,
        isPopular: false,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
      });
      setDishName('');
      setDishDesc('');
      setDishPrice(10.00);
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

  // 1. LOCK SCREEN (Initial Auth Dial State)
  if (!isUnlocked) {
    return (
      <div id="lockscreen-container" className="flex flex-col items-center justify-center min-h-[500px] space-y-7 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-2 text-indigo-600">
            <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Acceso Restringido</h2>
          <p className="text-xs text-gray-405 font-medium leading-normal">
            Ingrese su PIN de administrador para continuar
          </p>
        </div>

        {/* Visual Dots Indicators */}
        <div className={`flex gap-4 py-2 ${pinError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const active = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4.5 h-4.5 rounded-full border-2 transition-all duration-150 ${
                  pinError 
                    ? 'border-rose-400 bg-rose-500 shadow-rose-200 shadow-sm' 
                    : active 
                      ? 'border-indigo-600 bg-indigo-600 shadow-indigo-100 shadow-md scale-110' 
                      : 'border-gray-200 bg-transparent'
                }`}
              ></div>
            );
          })}
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
            <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp de Despacho (Cocina)</label>
            <input
              type="tel"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:bg-white transition-all font-semibold outline-none"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
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
          onClick={() => setShowDishModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 p-4 rounded-xl text-xs font-bold transition-all outline-none"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-gray-50 border border-gray-10s rounded-xl px-4 py-3 text-sm text-center outline-none font-bold"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(parseFloat(e.target.value) || 0.0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría *</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-10s rounded-xl px-3 py-3 text-sm outline-none cursor-pointer"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value as FoodItem['category'])}
                  >
                    <option value="Almuerzos">Almuerzos</option>
                    <option value="Sopas">Sopas</option>
                    <option value="Postres">Postres</option>
                    <option value="Bebidas">Bebidas</option>
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
