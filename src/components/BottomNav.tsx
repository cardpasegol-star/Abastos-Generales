import React from 'react';
import { Package2, Receipt, BarChart3, Utensils, Settings, ShoppingCart } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdminUnlocked: boolean;
}

export default function BottomNav({ activeTab, setActiveTab, isAdminUnlocked }: BottomNavProps) {
  const navItems = [
    { id: 'Inventario' as ActiveTab, label: 'Inventario', icon: Package2 },
    { id: 'Caja' as ActiveTab, label: 'Caja', icon: Receipt },
    { id: 'Reportes' as ActiveTab, label: 'Reportes', icon: BarChart3 },
    { id: 'Compras' as ActiveTab, label: 'Compras', icon: ShoppingCart },
    { id: 'Mant.' as ActiveTab, label: 'Mant.', icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!isAdminUnlocked && item.id !== 'Compras' && item.id !== 'Mant.') {
      return false;
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 px-2 pb-safe shadow-lg rounded-t-2xl max-w-md mx-auto">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            id={`nav-tab-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 outline-none cursor-pointer ${
              isActive 
                ? 'text-indigo-600 scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-650 shadow-sm border border-indigo-100/50' : 'hover:bg-slate-50'}`}>
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[9px] font-bold tracking-tight uppercase">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
