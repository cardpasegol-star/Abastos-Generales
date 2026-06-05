import React from 'react';
import { MapPin, Store } from 'lucide-react';
import { BusinessConfig } from '../types';

interface HeaderProps {
  config: BusinessConfig;
}

export default function Header({ config }: HeaderProps) {
  const handleMapClick = () => {
    if (config.gps) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(config.gps)}`, '_blank');
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 w-full sticky top-0 z-40 shadow-sm">
      <div className="relative w-full h-40 overflow-hidden bg-indigo-900">
        {config.bannerUrl ? (
          <img
            src={config.bannerUrl}
            alt={config.name}
            className="w-full h-full object-cover opacity-90"
          />
        ) : config.logoUrl ? (
          <img
            src={config.logoUrl}
            alt={config.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700">
            <Store className="w-20 h-20 text-white/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-white text-xl font-extrabold tracking-tight drop-shadow-lg">
              {config.name || 'Donde el Goyo'}
            </h1>
            {config.gps && (
              <button
                onClick={handleMapClick}
                className="flex items-center gap-1 mt-1 text-white/90 hover:text-white transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span className="text-xs font-semibold truncate max-w-[200px]">{config.gps}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span>En línea</span>
          </div>
        </div>
      </div>
    </header>
  );
}
