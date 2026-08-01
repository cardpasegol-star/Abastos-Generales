import React, { useState } from 'react';
import { Calendar, ShieldAlert, CheckCircle2, Lock, Unlock, Clock, Save, LogOut, ArrowRight, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { BusinessConfig, Product, Transaction } from '../types';
import { resetDatabaseToDefault } from '../initDb';

interface MasterTabProps {
  config: BusinessConfig;
  products: Product[];
  transactions: Transaction[];
  onUpdateConfig: (newCfg: BusinessConfig) => Promise<void>;
  onLockMaster: () => void;
  tenantId?: string;
}

export default function MasterTab({ config, products, transactions, onUpdateConfig, onLockMaster, tenantId }: MasterTabProps) {
  const [status, setStatus] = useState<'active' | 'suspended'>(config.licenseStatus || 'active');
  const [expirationDate, setExpirationDate] = useState(config.licenseExpirationDate || '2026-12-31');
  const [message, setMessage] = useState(config.licenseMessage || 'Su acceso ha vencido o se encuentra suspendido. Por favor, regularice su servicio mensual contactando al administrador.');
  const [modulosPermitidos, setModulosPermitidos] = useState(config.modulosPermitidos || {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: false,
    farmacia: false,
    frutería: false,
    congelados: true
  });
  const [mostrarAlmuerzos, setMostrarAlmuerzos] = useState<boolean>(config.mostrarAlmuerzos !== false);
  const [modules, setModules] = useState(config.modules || {
    rutasCamion: config.modules?.rutasCamion ?? (config.rutasCamion ? true : false),
    fruteria: config.modules?.fruteria ?? (config.modulosActivos?.frutería ?? false),
    almuerzos: config.modules?.almuerzos ?? (config.modulosActivos?.cocinaAlmuerzos ?? true),
    tienda: config.modules?.tienda ?? (config.modulosActivos?.tiendaAbarrotes ?? true),
    congelados: config.modules?.congelados ?? true,
    farmacia: config.modules?.farmacia ?? true,
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Danger Zone database reset states
  const [confirmResetDb, setConfirmResetDb] = useState(false);
  const [notifyResetSuccess, setNotifyResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const executeResetDb = async () => {
    setConfirmResetDb(false);
    setResetLoading(true);
    try {
      await resetDatabaseToDefault(tenantId || 'default');
      setNotifyResetSuccess(true);
      setTimeout(() => setNotifyResetSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error al restablecer base de datos: ' + (err?.message || err));
    } finally {
      setResetLoading(false);
    }
  };

  // Intelligent Date Calculators
  const handleExtendDays = (days: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + days);
    
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    
    setExpirationDate(`${year}-${month}-${day}`);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSaved(false);
    
    try {
      const updatedConfig: BusinessConfig = {
        ...config,
        licenseStatus: status,
        licenseExpirationDate: expirationDate,
        licenseMessage: message.trim(),
        modulosPermitidos,
        mostrarAlmuerzos,
        modules
      };
      
      await onUpdateConfig(updatedConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error al guardar en Firestore: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Check if current date exceeds the expiration date
  const todayStr = (() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  const isExpired = todayStr > expirationDate;
  const isLicenseActive = status === 'active' && !isExpired;

  return (
    <div id="master-panel-container" className="space-y-6 pb-28 animate-in slide-in-from-bottom-8 duration-400">
      
      {/* Developer Header Banner */}
      <div className="bg-slate-900 border border-slate-850 p-4.5 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600/25 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">Consola de Desarrollador</h2>
              <p className="text-[10px] text-slate-400 font-bold">CONTROL MASTER DE SUSCRIPCIÓN</p>
            </div>
          </div>
          <button
            onClick={onLockMaster}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-750 active:scale-95 transition-all cursor-pointer"
            title="Cerrar Consola"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Database Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-3xs text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Productos en Catálogo</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{products.length}</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-3xs text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Transacciones Historial</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{transactions.length}</span>
        </div>
      </div>

      {/* License Status Card */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest px-1">Estado de Licencia del Cliente</h3>
        
        <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          
          {/* Quick status visualization banner */}
          <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
            isLicenseActive 
              ? 'bg-emerald-50 border-emerald-150 text-emerald-950' 
              : 'bg-rose-50 border-rose-150 text-rose-950'
          }`}>
            {isLicenseActive ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                {isLicenseActive ? 'Servicio Activo' : 'Servicio Bloqueado'}
              </p>
              <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                {isLicenseActive 
                  ? `El cliente tiene acceso total hasta el ${expirationDate}.` 
                  : status === 'suspended' 
                    ? 'Bloqueado manualmente por el Desarrollador.' 
                    : `El plazo de licencia venció el ${expirationDate}.`}
              </p>
            </div>
          </div>

          {/* Toggle buttons for explicit suspension */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold text-gray-450 uppercase tracking-widest block">Acceso Manual</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2 px-3 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  status === 'active' 
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' 
                    : 'text-slate-500 hover:text-slate-750'
                }`}
              >
                Permitir Funcionamiento
              </button>
              <button
                type="button"
                onClick={() => setStatus('suspended')}
                className={`py-2 px-3 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  status === 'suspended' 
                    ? 'bg-white text-rose-600 shadow-sm border border-rose-100' 
                    : 'text-slate-500 hover:text-slate-750'
                }`}
              >
                Suspender / Dar de Baja
              </button>
            </div>
          </div>

          {/* Intelligent Calendar System */}
          <div className="space-y-2 border-t border-gray-100 pt-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] font-bold text-gray-455 uppercase tracking-widest">Calendario de Cesión</label>
              <span className="text-[10px] font-bold text-indigo-650 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                <Calendar className="w-3.5 h-3.5" /> {expirationDate}
              </span>
            </div>
            
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:outline-none focus:bg-white outline-none font-bold"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />

            {/* Quick Extension Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: '+30 días', days: 30 },
                { label: '+90 días', days: 90 },
                { label: '+180 días', days: 180 },
                { label: '+1 año', days: 365 },
              ].map((btn) => (
                <button
                  key={btn.days}
                  type="button"
                  onClick={() => handleExtendDays(btn.days)}
                  className="py-2 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* 🔐 PERMISOS DE MÓDULOS CONTRATADOS */}
          <div className="space-y-3.5 border-t border-gray-100 pt-3.5">
            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider flex items-center gap-1">
              🔐 PERMISOS DE MÓDULOS CONTRATADOS
            </h4>
            <p className="text-[10px] text-gray-450 leading-normal font-sans">
              Active o inactive los permisos contractuales de los módulos comerciales. Esto controla directamente si el dueño del negocio puede activar el módulo en su panel de administración.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'tiendaAbarrotes', label: '🏪 Tienda de Abarrotes', desc: 'Productos de abasto general' },
                { id: 'cocinaAlmuerzos', label: '🍲 Cocina / Almuerzos', desc: 'Platos de comida preparados' },
                { id: 'bodega', label: '🍷 Bodega', desc: 'Bebidas y licores' },
                { id: 'farmacia', label: '💊 Farmacia', desc: 'Cuidado y medicamentos' },
                { id: 'frutería', label: '🍎 Frutería y Verdulería', desc: 'Frutas y verduras frescas' },
                { id: 'congelados', label: '🧊 MÓDULO CONGELADOS Y DISTRIBUIDORA', desc: 'Controla si el cliente puede usar las secciones de Carnes, Congelados, Mariscos y Kits' }
              ].map((mod) => (
                <div 
                  key={mod.id} 
                  className={`p-3 border-2 rounded-2xl flex items-center justify-between gap-2.5 transition-all ${
                    modulosPermitidos[mod.id as keyof typeof modulosPermitidos] 
                      ? 'bg-indigo-50/40 border-indigo-150 text-indigo-950 shadow-3xs' 
                      : 'bg-gray-50/60 border-gray-150 text-gray-450'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wide block font-sans">
                      {mod.label}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 block font-sans">
                      {mod.desc}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={modulosPermitidos[mod.id as keyof typeof modulosPermitidos]}
                      onChange={(e) => setModulosPermitidos({
                        ...modulosPermitidos,
                        [mod.id]: e.target.checked
                      })}
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 🛠️ VISIBILIDAD DE MÓDULOS OPCIONALES (DEV) */}
          <div className="space-y-3.5 border-t border-gray-100 pt-3.5 animate-in fade-in duration-200">
            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-wider flex items-center gap-1">
              🛠️ VISIBILIDAD DE MÓDULOS OPCIONALES (DEV)
            </h4>
            <p className="text-[10px] text-gray-450 leading-normal font-sans">
              Controle la visibilidad física de las características en la UI de la aplicación de forma dinámica sin alterar los datos persistidos de los mismos.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'rutasCamion', label: '🚚 Banner de Rutas Camión', desc: 'Selector de comunas y aviso de despacho' },
                { key: 'fruteria', label: '🍎 Módulo Frutería y Verdulería', desc: 'Sección de Frutas y Verduras frescas en la tienda' },
                { key: 'almuerzos', label: '🍲 Módulo de Almuerzos (Cocina)', desc: 'Sección de platos preparados y Menú del Día' },
                { key: 'tienda', label: '🏪 Módulo de Tienda (Abarrotes)', desc: 'Sección de víveres, latas, bebidas y snacks' },
                { key: 'congelados', label: '🧊 MÓDULO DE DISTRIBUIDORA / CONGELADOS (ÁRTICO)', desc: 'Sección de productos helados, pulpas, carnes y mariscos congelados' },
                { key: 'farmacia', label: '💊 MÓDULO DE FARMACIA Y SALUD', desc: 'Sección de medicamentos, cuidado personal, higiene y suplementos' },
              ].map((m) => (
                <div key={m.key} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-2.5 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wide block font-sans text-gray-800">
                      {m.label}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 block font-sans font-medium">
                      {m.desc}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={modules[m.key as keyof typeof modules]}
                      onChange={(e) => setModules({
                        ...modules,
                        [m.key]: e.target.checked
                      })}
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Blocking Custom Message */}
          <div className="space-y-1.5 border-t border-gray-100 pt-3.5">
            <label className="text-[10.5px] font-bold text-gray-455 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Mensaje en Pantalla de Bloqueo
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none focus:bg-white outline-none resize-none font-medium leading-relaxed"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej. Su licencia ha expirado. Por favor contáctenos..."
            />
          </div>

          {/* Saving buttons */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-150 text-rose-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saved && (
            <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cambios guardados correctamente</span>
            </div>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Aplicar Configuración Master</span>
              </>
            )}
          </button>

        </div>
      </section>

      {/* Information disclaimer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px] text-slate-500 font-medium leading-relaxed">
        <strong>💡 Instrucción de uso remoto:</strong> Los cambios aplicados se reflejan en tiempo real en la base de datos Firestore y afectarán de inmediato a todos los iPhones, iPads y dispositivos del cliente conectados. El bloqueo de licencia suspende toda la interfaz de usuario de ventas y administración del punto de venta con el mensaje que usted asigne arriba.
      </div>

      {/* ⚠️ ZONA PELIGROSA - ACCIONES CRÍTICAS (SOLO DESARROLLADOR) */}
      <section className="space-y-3 pt-5 border-t border-slate-200">
        <div className="flex items-center gap-2 text-rose-600 px-1">
          <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-wide">Zona Peligrosa (Solo Desarrollador)</h3>
        </div>
        <div className="bg-rose-50/60 p-4.5 rounded-3xl border border-rose-200 text-xs font-medium text-rose-900 space-y-3.5 shadow-xs">
          <p className="text-center leading-relaxed text-rose-850 font-sans">
            Esta acción eliminará de forma permanente todos los registros de ventas de la caja, cargará los productos por defecto y restaurará las credenciales a su estado inicial.
          </p>
          <button
            type="button"
            onClick={() => setConfirmResetDb(true)}
            disabled={resetLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-xl tracking-tight uppercase shadow-md active:shadow-sm active:scale-[0.98] transition-all disabled:opacity-55 select-none outline-none cursor-pointer flex items-center justify-center gap-2"
          >
            {resetLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Restablecer Base de Datos'}
          </button>
        </div>
      </section>

      {/* Database Reset confirmation modal */}
      {confirmResetDb && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in fade-in duration-350">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center border border-slate-150 shadow-2xl relative">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Restablecer Datos</h3>
            <p className="text-xs text-slate-500 mb-4.5 leading-relaxed font-sans">
              Esta operación es irreversible y borrará el historial de cobros de forma permanente. ¿Desea continuar?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetDb(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 outline-none select-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeResetDb}
                className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-rose-700 outline-none select-none cursor-pointer"
              >
                Confirmar
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
