import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Store, Phone, LogOut, Navigation, ChevronDown } from 'lucide-react';
import { BusinessConfig, Empleado, SectorConfig } from '../types';
import { checkStoreOpenStatus } from '../utils';

interface HeaderProps {
  config: BusinessConfig;
  currentEmployee?: Empleado | null;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
  selectedComuna?: string;
  onSelectComuna?: (comuna: string) => void;
}

const DEFAULT_RUTAS_CAMION: Record<string, SectorConfig> = {
  comunasDiarias: {
    name: "Comunas Diarias",
    comunas: ["Estación Central", "Independencia", "Quinta Normal", "Recoleta", "San Miguel"],
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    fee: 3400
  },
  ejeCentral: {
    name: "Eje Central",
    comunas: ["Santiago Centro", "Ñuñoa", "Providencia"],
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    fee: 3400
  },
  norte: {
    name: "Sector Norte",
    comunas: ["Lampa", "Quilicura", "Renca", "Conchalí", "Huechuraba"],
    days: ["Lunes", "Jueves", "Sábado"],
    fee: 3400
  },
  poniente: {
    name: "Sector Poniente",
    comunas: ["Pedro Aguirre Cerda", "Cerrillos", "Pudahuel", "Maipú"],
    days: ["Lunes", "Jueves"],
    fee: 3400
  },
  sur: {
    name: "Sector Sur",
    comunas: ["Buin", "El Bosque", "San Bernardo", "La Cisterna"],
    days: ["Martes", "Viernes", "Sábado"],
    fee: 3400
  },
  oriente: {
    name: "Sector Oriente",
    comunas: ["Vitacura", "Las Condes", "Lo Barnechea", "La Reina", "Peñalolén"],
    days: ["Martes", "Miércoles", "Viernes"],
    fee: 3400
  },
  surOriente: {
    name: "Sector Sur Oriente",
    comunas: ["Macul", "La Florida", "San Joaquín"],
    days: ["Miércoles", "Sábado"],
    fee: 3400
  }
};

function getAllComunasFromConfig(rutas?: Record<string, SectorConfig>): string[] {
  const currentRutas = (rutas && Object.keys(rutas).length > 0) ? rutas : DEFAULT_RUTAS_CAMION;
  const set = new Set<string>();
  Object.values(currentRutas).forEach(sector => {
    if (sector && Array.isArray(sector.comunas)) {
      sector.comunas.forEach(c => {
        const trimmed = c.trim();
        if (trimmed) {
          const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          set.add(capitalized);
        }
      });
    }
  });
  set.add("Lampa");
  set.add("Buin");
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

export default function Header({ config, currentEmployee, onLogout, onOpenAdmin, selectedComuna, onSelectComuna }: HeaderProps) {
  const isArtico = config.name?.toLowerCase().includes('ártico') || config.name?.toLowerCase().includes('artico') || config.name?.toLowerCase().includes('congelados');
  const isFruteria = config.name?.toLowerCase().includes('frutería') || config.name?.toLowerCase().includes('fruteria') || config.name?.toLowerCase().includes('gales');
  const isPizzeria = config.name?.toLowerCase().includes('pasión') || config.name?.toLowerCase().includes('pasion') || config.name?.toLowerCase().includes('pizza');

  const defaultBanner = isArtico
    ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800'
    : isFruteria
    ? 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800'
    : isPizzeria
    ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800'
    : 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800';

  const bannerImage = config.bannerUrl || defaultBanner;

  // Real-time calculated store status (Open / Closed)
  const [openStatus, setOpenStatus] = useState(() => checkStoreOpenStatus(config.schedule));

  useEffect(() => {
    setOpenStatus(checkStoreOpenStatus(config.schedule));
    const timer = setInterval(() => {
      setOpenStatus(checkStoreOpenStatus(config.schedule));
    }, 15000); // Check every 15s
    return () => clearInterval(timer);
  }, [config.schedule]);

  return (
    <div className="w-full relative bg-slate-900 overflow-hidden shadow-md border-b border-slate-250">
      {/* Background Banner Image covering the entire banner width */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={bannerImage}
          alt={config.name || 'Donde el Goyo'}
          className="w-full h-full object-cover opacity-80"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
          }}
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant gradient overlay so the white text is readable over any photo background */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/30" />
      </div>

      {/* Header Content with large display typography */}
      <div className="relative max-w-md mx-auto w-full px-5 pt-8 pb-5 flex flex-col justify-end min-h-[160px] z-10 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-emerald-400/40 shrink-0">
              <Store className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            
            {openStatus.isOpen ? (
              <div 
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-550/30 backdrop-blur-sm text-emerald-300 rounded-full border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest select-none shadow-xs"
                title={openStatus.reason}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shrink-0" style={{ animationDuration: '2s' }}></div>
                <span>Abierto</span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/70 backdrop-blur-sm text-rose-300 rounded-full border border-rose-500/40 text-[10px] font-black uppercase tracking-widest select-none shadow-xs"
                title={openStatus.reason}
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0"></div>
                <span>Cerrado</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {currentEmployee && (
              <div 
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-200 hover:text-rose-200 rounded-full backdrop-blur-md text-[10px] font-bold shadow-md cursor-pointer transition-all active:scale-95"
                title="Cerrar Turno"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[80px]">{currentEmployee.name}</span>
                <LogOut className="w-3.5 h-3.5 stroke-[2.5] ml-0.5 text-slate-400 hover:text-rose-300" />
              </div>
            )}

            {config.whatsapp && (
              <a
                href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/20 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform cursor-pointer"
                title="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="w-9 h-9 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white shadow-md active:scale-95 transition-transform cursor-pointer"
                title="Acceso Personal"
              >
                <span className="text-base select-none">⚙️</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {config.name || 'Donde el Goyo'}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1 text-slate-200 hover:text-emerald-200 transition-colors cursor-pointer select-none">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold truncate max-w-[200px]">{config.gps || 'Calle Principal #123'}</span>
            </div>

            {/* Commune / Zone Georeferencing Pill Selector */}
            {onSelectComuna && (
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-xl shadow-lg backdrop-blur-md">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider hidden sm:inline">Zona:</span>
                <select
                  value={selectedComuna || 'La Florida'}
                  onChange={(e) => onSelectComuna(e.target.value)}
                  className="bg-transparent text-white text-xs font-black outline-none cursor-pointer pr-1"
                >
                  {getAllComunasFromConfig(config.rutasCamion).map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white font-bold">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
