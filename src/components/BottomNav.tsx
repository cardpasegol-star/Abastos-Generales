import React from 'react';
import { Package2, Receipt, BarChart3, Settings, ShoppingCart, KeyRound, Truck, Users } from 'lucide-react';
import { ActiveTab, Empleado, BusinessConfig, isTabEnabledForStore } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentEmployee: Empleado | null;
  isAdminUnlocked?: boolean;
  isMasterUnlocked?: boolean;
  config?: BusinessConfig;
}

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  currentEmployee, 
  isAdminUnlocked = false, 
  isMasterUnlocked = false,
  config
}: BottomNavProps) {
  const navItems = [
    { id: 'Inventario' as ActiveTab, label: 'Inventario', icon: Package2 },
    { id: 'Caja' as ActiveTab, label: 'Caja', icon: Receipt },
    { id: 'Reportes' as ActiveTab, label: 'Reportes', icon: BarChart3 },
    { id: 'Proveedores' as ActiveTab, label: 'Proveedores', icon: Truck },
    { id: 'Clientes' as ActiveTab, label: 'Clientes', icon: Users },
    { id: 'Compras' as ActiveTab, label: 'Compras', icon: ShoppingCart },
  ];

  if (isMasterUnlocked) {
    navItems.push({ id: 'Master' as ActiveTab, label: 'Master', icon: KeyRound });
  }

  const visibleNavItems = navItems.filter((item) => {
    // Check feature flag for the store first (except Master)
    if (item.id !== 'Master' && item.id !== 'Mant.') {
      if (!isTabEnabledForStore(item.id, config)) {
        return false;
      }
    }

    // 1. Desarrollador (Master) sees all enabled tabs + Master
    if (isMasterUnlocked) {
      return true;
    }

    // 2. Dueño (Admin) sees enabled operational tabs
    if (isAdminUnlocked) {
      return true;
    }

    // 3. Empleado (Cajero) sees enabled operational tabs
    if (currentEmployee && currentEmployee.role === 'cajero') {
      return true;
    }

    // 4. Default / Cliente Público (Not authenticated) sees only 'Compras' if enabled
    return item.id === 'Compras';
  });

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 px-1 pb-safe shadow-lg rounded-t-2xl max-w-lg mx-auto">
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
            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-150' : 'hover:bg-slate-100'}`}>
              <Icon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className={`text-[9px] tracking-tight uppercase truncate max-w-[65px] ${isActive ? 'font-black text-emerald-800' : 'font-extrabold text-slate-500'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
