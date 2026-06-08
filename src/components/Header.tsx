import React from 'react';
import { MapPin, Bell, Store } from 'lucide-react';
import { BusinessConfig } from '../types';

interface HeaderProps {
  config: BusinessConfig;
}

export default function Header({ config }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Sleek logo box container */}
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
          <Store className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-extrabold tracking-tight text-slate-800 truncate leading-none mb-0.5">
            {config.name || 'Donde el Goyo'}
          </h1>
          <div className="flex items-center gap-0.5 text-slate-400 hover:text-indigo-655 transition-colors cursor-pointer">
            <MapPin className="w-3 h-3 text-indigo-505 shrink-0" />
            <span className="text-[10px] font-bold truncate max-w-[120px]">{config.gps || 'Calle Principal #123'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[9px] font-semibold uppercase tracking-wider select-none">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <span>Firebase</span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
