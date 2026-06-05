import React from 'react';
import { Package2, Receipt, BarChart3, Utensils, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'Inventario' as ActiveTab, label: 'Inventario', icon: Package2 },
    { id: 'Caja' as ActiveTab, label: 'Caja', icon: Receipt },
    { id: 'Reportes' as ActiveTab, label: 'Reportes', icon: BarChart3 },
    { id: 'Comidas' as ActiveTab, label: 'Comidas', icon: Utensils },
    { id: 'Mant.' as ActiveTab, label: 'Mant.', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-200 flex justify-around items-center h-20 px-1 shadow-xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200 outline-none cursor-pointer ${
              isActive ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-indigo-100 shadow-sm' : ''}`}>
              <Icon className={`stroke-[2.5] ${isActive ? 'w-7 h-7' : 'w-6 h-6'}`} />
            </div>
            <span className={`text-[11px] font-extrabold tracking-tight uppercase ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
