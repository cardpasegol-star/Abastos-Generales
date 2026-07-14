import React from 'react';
import { MapPin, Store, Phone, LogOut } from 'lucide-react';
import { BusinessConfig, Empleado } from '../types';

interface HeaderProps {
  config: BusinessConfig;
  currentEmployee?: Empleado | null;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export default function Header({ config, currentEmployee, onLogout, onOpenAdmin }: HeaderProps) {
  const bannerImage = config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';

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
            
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-550/30 backdrop-blur-sm text-emerald-300 rounded-full border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest select-none shadow-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shrink-0" style={{ animationDuration: '2s' }}></div>
              <span>Abierto</span>
            </div>
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

        <div className="mt-5">
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {config.name || 'Donde el Goyo'}
          </h1>
          
          <div className="flex items-center gap-1 text-slate-200 mt-1 hover:text-emerald-200 transition-colors cursor-pointer select-none">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold truncate max-w-[280px]">{config.gps || 'Calle Principal #123'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
