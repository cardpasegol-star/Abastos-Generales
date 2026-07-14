import React, { useState, useEffect } from 'react';
import { Check, X, MapPin, DollarSign, Calendar, RefreshCw, ShoppingBag } from 'lucide-react';
import { Transaction, Product, BusinessConfig } from '../types';

interface AdminDeliveryPanelProps {
  products: Product[];
  onUpdateProductStock: (id: string, newStock: number) => Promise<void>;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<string>;
  config?: BusinessConfig;
}

export default function AdminDeliveryPanel({
  products,
  onUpdateProductStock,
  onAddTransaction,
  config
}: AdminDeliveryPanelProps) {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  // Function to load orders from LocalStorage
  const loadOrders = () => {
    try {
      const existing = localStorage.getItem('pedidos_pendientes');
      if (existing) {
        setPendingOrders(JSON.parse(existing));
      } else {
        setPendingOrders([]);
      }
    } catch (e) {
      console.error("Error loading pending orders:", e);
    }
  };

  // Load on mount and register a listener or poll for simulation simplicity
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2000); // Poll every 2 seconds for real-time simulation feel
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const updated = pendingOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: 'accepted' };
        }
        return order;
      });
      localStorage.setItem('pedidos_pendientes', JSON.stringify(updated));
      setPendingOrders(updated);

      // Find the specific order to decrease stock
      const targetOrder = pendingOrders.find(o => o.id === orderId);
      if (targetOrder) {
        // Sequentially adjust stock for the products in the order
        for (const item of targetOrder.items) {
          const product = products.find(p => p.id === item.productId || p.sku === item.productId);
          if (product) {
            const newStock = Math.max(0, product.stock - item.qty);
            await onUpdateProductStock(product.id, newStock);
          }
        }
      }
      alert('Pedido aceptado exitosamente. Se ha rebajado el stock de los productos.');
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleRejectOrder = (orderId: string) => {
    const updated = pendingOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'rejected' };
      }
      return order;
    });
    localStorage.setItem('pedidos_pendientes', JSON.stringify(updated));
    setPendingOrders(updated);
  };

  const clearHistory = () => {
    if (confirm('¿Deseas vaciar la simulación de pedidos pendientes de esta tienda?')) {
      const storeName = config?.name || 'Donde el Goyo';
      const updated = pendingOrders.filter(o => {
        const orderStore = o.comercioAsociado || 'Donde el Goyo';
        return orderStore.toLowerCase().trim() !== storeName.toLowerCase().trim();
      });
      localStorage.setItem('pedidos_pendientes', JSON.stringify(updated));
      setPendingOrders(updated);
    }
  };

  const storeName = config?.name || 'Donde el Goyo';
  const currentStoreOrders = pendingOrders.filter(o => {
    const orderStore = o.comercioAsociado || 'Donde el Goyo';
    return orderStore.toLowerCase().trim() === storeName.toLowerCase().trim();
  });

  const activePendings = currentStoreOrders.filter(o => o.status === 'pending');
  const pastOrders = currentStoreOrders.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Controls */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-3xl border-2 border-slate-800 shadow-xl">
        <div>
          <h2 className="text-sm font-black tracking-widest text-emerald-400 uppercase">Panel de Control</h2>
          <p className="text-xs font-bold text-slate-400">Sandbox Uber Direct / PedidosYa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 transition-all cursor-pointer active:scale-95"
            title="Sincronizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 text-[10px] font-black uppercase transition-all cursor-pointer"
          >
            Vaciar
          </button>
        </div>
      </div>

      {/* Incoming Delivery Alert List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Alertas de Despacho en Tiempo Real ({activePendings.length})</span>
        </h3>

        {activePendings.length === 0 ? (
          <div className="bg-slate-100 border-2 border-slate-200 border-dashed rounded-3xl p-8 text-center text-slate-450 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto stroke-[1.5]" />
            <p className="text-xs font-bold">No hay despachos nuevos pendientes.</p>
            <p className="text-[10px]">Realiza un pedido con despacho a domicilio en la pestaña de compras para verlo aquí en tiempo real.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activePendings.map((order) => (
              <div
                key={order.id}
                className="bg-white border-2 border-rose-100 rounded-3xl p-5 shadow-lg shadow-rose-500/[0.03] space-y-4 animate-in fade-in slide-in-from-top-3 duration-300"
              >
                {/* Header of Alert */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono">
                      NUEVO PEDIDO DELIVERY 🚨
                    </span>
                    <p className="text-xs font-black text-slate-900 mt-1 font-mono">ID: {order.id.toUpperCase()}</p>
                  </div>
                  <span className="text-xs font-black text-slate-950 bg-slate-50 px-2.5 py-1 rounded-xl font-mono">
                    ${order.total.toFixed(0)}
                  </span>
                </div>

                {/* Info lines */}
                <div className="space-y-2 text-xs text-slate-700 font-bold bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-900 font-black">Dirección de Entrega:</p>
                      <p className="text-slate-600 font-sans">{order.deliveryAddress}, {order.deliveryComuna}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200/60 mt-1">
                    <span className="text-slate-500 uppercase text-[10px] font-black">Costo de Envío:</span>
                    <span className="text-slate-900 font-mono">${order.deliveryFee?.toFixed(0)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Productos solicitados:</p>
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{item.qty}x {item.name}</span>
                      <span className="text-slate-500 font-mono">${(item.price * item.qty).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-rose-200 hover:border-rose-300 bg-rose-50/50 text-rose-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Rechazar</span>
                  </button>
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 border border-emerald-550"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Aceptar Pedido (Rebajar Stock)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders Log */}
      {pastOrders.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Historial de Simulación</h3>
          <div className="space-y-2.5">
            {pastOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center text-xs text-slate-600"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-800">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                      order.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {order.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">{order.deliveryAddress}, {order.deliveryComuna}</p>
                </div>
                <span className="font-mono font-black text-slate-900">${order.total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
