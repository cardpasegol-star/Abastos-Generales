import React from 'react';
import { MapPin, Store, Phone } from 'lucide-react';
import { BusinessConfig } from '../types';

interface HeaderProps {
  config: BusinessConfig;
}

export default function Header({ config }: HeaderProps) {
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
            <div className="w-10 h-10 bg-indigo-650/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-indigo-400/30 shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 rounded-full border border-emerald-400/20 text-[9px] font-black uppercase tracking-widest select-none">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>

          <div className="flex gap-2">
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
          </div>
        </div>

        <div className="mt-5">
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {config.name || 'Donde el Goyo'}
          </h1>
          
          <div className="flex items-center gap-1 text-slate-200 mt-1 hover:text-indigo-200 transition-colors cursor-pointer select-none">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold truncate max-w-[280px]">{config.gps || 'Calle Principal #123'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
