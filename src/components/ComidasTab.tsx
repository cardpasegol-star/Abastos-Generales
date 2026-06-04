import React, { useState } from 'react';
import { ShoppingBag, Utensils, Send, Check, X, Plus, Minus, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { FoodItem, BusinessConfig } from '../types';

interface ComidasTabProps {
  foodItems: FoodItem[];
  config: BusinessConfig;
}

interface OrderMealItem {
  dish: FoodItem;
  quantity: number;
}

export default function ComidasTab({ foodItems, config }: ComidasTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');
  const [mealCart, setMealCart] = useState<OrderMealItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [deliveryNeeded, setDeliveryNeeded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredDishes = foodItems.filter(dish => {
    return selectedCategory === 'Todo' || dish.category === selectedCategory;
  });

  const handleAddMeal = (dish: FoodItem) => {
    const existing = mealCart.find(item => item.dish.id === dish.id);
    if (existing) {
      setMealCart(
        mealCart.map(item =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setMealCart([...mealCart, { dish, quantity: 1 }]);
    }
  };

  const handleAdjustQty = (dishId: string, amount: number) => {
    setMealCart(
      mealCart.map(item => {
        if (item.dish.id === dishId) {
          const newQty = item.quantity + amount;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const totalItemsCount = mealCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartCost = mealCart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  // Send WhatsApp dispatch compile link
  const handleSendWhatsapp = () => {
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Por favor, ingrese el nombre del cliente para registrar su pedido.');
      return;
    }
    if (mealCart.length === 0) {
      setValidationError('Su pedido de platos está vacío.');
      return;
    }

    // WhatsApp text formatting
    let msg = `*DONDE EL GOYO* 🏪\n*La Cocina de la Señora - Pedido de Comida* 🍲\n\n`;
    msg += `👤 *Cliente:* ${customerName.trim()}\n`;
    msg += `📍 *Entrega:* ${deliveryNeeded ? 'A Domicilio 🚀' : 'Retiro en Local 🛒'}\n\n`;
    msg += `📝 *Detalle del Pedido:*\n`;

    mealCart.forEach(item => {
      msg += `• *${item.quantity}x* ${item.dish.name} - $${(item.dish.price * item.quantity).toFixed(2)}\n`;
    });

    msg += `\n💵 *Total a pagar:* $${totalCartCost.toFixed(2)}\n\n`;
    msg += `_¡Muchas gracias por su preferencia! El pedido está en preparación._`;

    // Process delivery coordinates if available or fallback
    const targetPhone = config.whatsapp ? config.whatsapp.replace(/[^a-zA-Z0-9]/g, '') : '50370000000';
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;

    // Open link
    window.open(waUrl, '_blank');

    // Reset shopping bags on success
    setMealCart([]);
    setCustomerName('');
    setShowOrderModal(false);
  };

  return (
    <div id="comidas-container" className="space-y-6 pb-24">
      {/* 1. Header Hero section */}
      <section className="space-y-1">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider block">
          La Cocina de la Señora
        </span>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
          <span>Menú del Día</span>
          <Sparkles className="w-4 h-4 fill-amber-500 stroke-amber-500 text-amber-500" />
        </h2>
        <p className="text-xs text-gray-400 font-semibold leading-relaxed">
          Comida casera con el toque tradicional de casa.
        </p>
      </section>

      {/* 2. Scrollable dishes categories */}
      <section className="flex gap-2 overflow-x-auto scroller-no-bar -mx-4 px-4 py-1">
        {['Todo', 'Almuerzos', 'Sopas', 'Postres', 'Bebidas'].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* 3. Grid representation of meals food items */}
      <section className="grid grid-cols-1 gap-4">
        {filteredDishes.map((dish) => (
          <article
            key={dish.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-transform active:scale-[0.99]"
          >
            {/* Meal image banner */}
            <div className="relative h-44 overflow-hidden bg-gray-50">
              <img
                alt={dish.name}
                className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
                src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300';
                }}
                referrerPolicy="no-referrer"
              />
              {dish.isPopular && (
                <div className="absolute top-3 left-3 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                  Popular
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col flex-grow space-y-2.5 justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">
                    {dish.name}
                  </h3>
                  <span className="text-sm font-extrabold text-indigo-600 shrink-0">
                    ${dish.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed pt-1">
                  {dish.description}
                </p>
              </div>

              {/* Order Button trigger */}
              <button
                onClick={() => handleAddMeal(dish)}
                className="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 outline-none cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Agregar al Pedido</span>
              </button>
            </div>
          </article>
        ))}

        {filteredDishes.length === 0 && (
          <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-1">
            <Utensils className="w-10 h-10 stroke-1 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">Ningún plato disponible</p>
            <p className="text-xs text-gray-400">Intente revisar otras categorías.</p>
          </div>
        )}
      </section>

      {/* 4. Persistent bottom floating shopping bag counter badge */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-20 right-6 z-40 transition-all duration-305 flex shrink-0">
          <button
            onClick={() => setShowOrderModal(true)}
            className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all shadow-xl select-none"
          >
            <ShoppingBag className="w-6 h-6 stroke-[2]" />
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {totalItemsCount}
            </span>
          </button>
        </div>
      )}

      {/* 5. Order dialog sheet modal popup overlay */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="absolute inset-0 z-0" onClick={() => setShowOrderModal(false)}></div>
          <div className="bg-white rounded-t-3xl w-full max-w-sm overflow-hidden shadow-2xl border-t border-gray-100 flex flex-col max-h-[85vh] relative z-10">
            {/* Modal Drag bar handle visual */}
            <div className="w-12 h-1.5 bg-gray-150 rounded-full mx-auto my-3 shrink-0"></div>

            <div className="flex justify-between items-center px-5 pb-3 border-b border-gray-50">
              <h3 className="text-base font-extrabold text-gray-950">Tu Pedido</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:text-gray-700"
              >
                <X className="w-4.5 h-4.5 font-bold" />
              </button>
            </div>

            {/* Scrollable basket contents list */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-2.5">
                {mealCart.map((item) => (
                  <div key={item.dish.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="min-w-0 pr-2">
                      <div className="font-extrabold text-gray-900 truncate">{item.dish.name}</div>
                      <div className="text-gray-400 font-semibold mt-0.5">${item.dish.price.toFixed(2)} x {item.quantity}</div>
                    </div>
                    
                    {/* Qty controller and multiplier */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAdjustQty(item.dish.id, -1)}
                        className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-800 hover:bg-gray-105 active:scale-90 transition-all outline-none"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold min-w-[12px] text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleAdjustQty(item.dish.id, 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-800 hover:bg-gray-105 active:scale-90 transition-all outline-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer input name binding card */}
              {validationError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-100 font-semibold text-xs animate-in fade-in duration-200">
                  {validationError}
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre del Cliente *</label>
                <input
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 focus:bg-white transition-all font-semibold outline-none"
                  placeholder="¿A nombre de quién?"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Delivery needed toggle element option */}
              <div className="flex items-center justify-between py-2.5 border-t border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">Entrega a domicilio</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryNeeded(!deliveryNeeded)}
                  className="text-indigo-600 hover:scale-105 transition-all outline-none"
                >
                  {deliveryNeeded ? (
                    <ToggleRight className="w-10 h-10 stroke-[1.5]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300 stroke-[1.5]" />
                  )}
                </button>
              </div>

              {/* Total values math line display */}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-900">Total a pagar:</span>
                <span className="text-xl font-extrabold text-indigo-600">${totalCartCost.toFixed(2)}</span>
              </div>

              {/* Sending button */}
              <button
                onClick={handleSendWhatsapp}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-750 active:scale-[0.98] transition-all shadow-md mt-4 select-none outline-none cursor-pointer text-sm"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>ENVIAR PEDIDO POR WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
