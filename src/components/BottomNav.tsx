import React from 'react';
import { Package2, Receipt, BarChart3, Settings, ShoppingCart, KeyRound } from 'lucide-react';
import { ActiveTab, Empleado } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentEmployee: Empleado | null;
  isAdminUnlocked?: boolean;
  isMasterUnlocked?: boolean;
}

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  currentEmployee, 
  isAdminUnlocked = false, 
  isMasterUnlocked = false 
}: BottomNavProps) {
  const navItems = [
    { id: 'Inventario' as ActiveTab, label: 'Inventario', icon: Package2 },
    { id: 'Caja' as ActiveTab, label: 'Caja', icon: Receipt },
    { id: 'Reportes' as ActiveTab, label: 'Reportes', icon: BarChart3 },
    { id: 'Compras' as ActiveTab, label: 'Compras', icon: ShoppingCart },
  ];

  if (isMasterUnlocked) {
    navItems.push({ id: 'Master' as ActiveTab, label: 'Master', icon: KeyRound });
  }

  const visibleNavItems = navItems.filter((item) => {
    // 1. Desarrollador (Master) sees everything: 'Compras', 'Caja', 'Inventario', 'Reportes', 'Master'
    if (isMasterUnlocked) {
      return true;
    }

    // 2. Dueño (Admin) sees: 'Inventario', 'Caja', 'Reportes', 'Compras'
    if (isAdminUnlocked) {
      return (
        item.id === 'Inventario' ||
        item.id === 'Caja' ||
        item.id === 'Reportes' ||
        item.id === 'Compras'
      );
    }

    // 3. Empleado (Cajero) sees: 'Inventario', 'Caja', 'Reportes', 'Compras'
    if (currentEmployee && currentEmployee.role === 'cajero') {
      return (
        item.id === 'Inventario' ||
        item.id === 'Caja' ||
        item.id === 'Reportes' ||
        item.id === 'Compras'
      );
    }

    // 4. Default / Cliente Público (Not authenticated) sees only 'Compras'
    return item.id === 'Compras';
  });

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 px-2 pb-safe shadow-lg rounded-t-2xl max-w-md mx-auto">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            id={`nav-tab-${item.id}`}
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 outline-none cursor-pointer ${
              isActive 
                ? 'text-emerald-700 scale-102 font-black' 
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-150' : 'hover:bg-slate-100'}`}>
              <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span className={`text-[10px] tracking-tight uppercase ${isActive ? 'font-black text-emerald-800' : 'font-extrabold text-slate-500'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
