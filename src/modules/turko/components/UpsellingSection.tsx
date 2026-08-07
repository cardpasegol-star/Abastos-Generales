import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../../../types';
import { getUnidadShortSuffix } from '../../../utils/unitHelpers';

interface UpsellingSectionProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, quantity?: number) => void;
}

export function UpsellingSection({ products, cart, onAddToCart }: UpsellingSectionProps) {
  const cartIds = new Set(cart.map((i) => i.product.id));

  // Suggest products not yet in cart, prioritizing popular snacks, drinks, abarrotes, or low-cost essentials
  const suggestions = products
    .filter((p) => !cartIds.has(p.id) && (p.stock === undefined || p.stock > 0))
    .sort((a, b) => {
      // Prioritize products with price < 4000 CLP or offers
      const scoreA = (a.enOferta ? 10 : 0) + (a.price < 3500 ? 5 : 0) + (a.category === 'Snacks' || a.category === 'Bebidas' ? 4 : 0);
      const scoreB = (b.enOferta ? 10 : 0) + (b.price < 3500 ? 5 : 0) + (b.category === 'Snacks' || b.category === 'Bebidas' ? 4 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 8);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/70 to-rose-50/80 border-2 border-amber-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-950">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse stroke-[2.5]" />
          <h4 className="text-xs font-black uppercase tracking-tight font-sans">
            ¿Te faltó agregar algo? 🛒
          </h4>
        </div>
        <span className="text-[10px] font-black text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full uppercase">
          Venta Sugerida
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-thin scrollbar-thumb-amber-200">
        {suggestions.map((p) => {
          const displayPrice = p.precioOferta || p.price;
          return (
            <div
              key={`upsell-${p.id}`}
              className="w-36 shrink-0 bg-white rounded-xl border border-amber-200/80 p-2 flex flex-col justify-between hover:shadow-md hover:border-amber-400 transition-all group"
            >
              <div className="space-y-1.5">
                <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-100 relative">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {p.enOferta && (
                    <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1 rounded">
                      OFERTA
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="font-extrabold text-[11px] text-slate-900 line-clamp-2 leading-tight min-h-[1.75rem]">
                    {p.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-bold">{p.category}</p>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 mt-1.5">
                <span className="font-black text-xs text-amber-900 font-mono">
                  ${displayPrice.toLocaleString('es-CL')}
                  <span className="text-[9px] text-slate-400 font-sans font-normal">
                    {getUnidadShortSuffix(p.unidadMedida)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => onAddToCart(p, 1)}
                  className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-lg text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-0.5 cursor-pointer"
                  title="Agregar al carrito"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="text-[10px]">Sumar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
