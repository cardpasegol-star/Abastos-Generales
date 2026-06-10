import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Minus, Send, Trash2, X, ShoppingBag, Check, Utensils, Sparkles } from 'lucide-react';
import { Product, FoodItem, BusinessConfig } from '../types';

interface ComprasTabProps {
  products: Product[];
  foodItems?: FoodItem[];
  config: BusinessConfig;
}

interface CartItem {
  id: string; // product ID or foodItem ID
  type: 'product' | 'meal';
  product?: Product;
  foodItem?: FoodItem;
  quantity: number;
}

export default function ComprasTab({ products, foodItems = [], config }: ComprasTabProps) {
  // Search state (unified across both lists)
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category states for each segment
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('Todo');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>('Todo');
  
  // Cart, Drawer and Form states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'Domicilio' | 'Retiro'>('Retiro');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 2-Step Checkout states
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'ready'>('form');
  const [waUrl, setWaUrl] = useState('');
  const [waMsgText, setWaMsgText] = useState('');

  // Lists of categories
  const productCategories = ['Todo', 'Abarrotes', 'Bebidas', 'Lácteos', 'Snacks'];
  const foodItemCategories = ['Todo', 'Almuerzos', 'Sopas', 'Postres', 'Bebidas'];

  // Match items based on filters and search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedProductCategory === 'Todo' || product.category === selectedProductCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFoodItems = foodItems.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedFoodCategory === 'Todo' || dish.category === selectedFoodCategory;
    return matchesSearch && matchesCategory;
  });

  // Unified add item logic
  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) return;

    const existing = cart.find(item => item.id === product.id && item.type === 'product');
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Lo sentimos, solo quedan ${product.stock} unidades disponibles de este producto.`);
        return;
      }
      setCart(
        cart.map(item =>
          item.id === product.id && item.type === 'product'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { id: product.id, type: 'product', product, quantity: 1 }]);
    }
  };

  const handleAddMeal = (dish: FoodItem) => {
    const existing = cart.find(item => item.id === dish.id && item.type === 'meal');
    if (existing) {
      setCart(
        cart.map(item =>
          item.id === dish.id && item.type === 'meal'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { id: dish.id, type: 'meal', foodItem: dish, quantity: 1 }]);
    }
  };

  // Adjust item qty in unified cart
  const handleAdjustQty = (id: string, type: 'product' | 'meal', amount: number) => {
    const item = cart.find(item => item.id === id && item.type === type);
    if (!item) return;

    const newQty = item.quantity + amount;

    if (newQty <= 0) {
      setCart(cart.filter(item => !(item.id === id && item.type === type)));
    } else {
      // Check stock limit for products only
      if (type === 'product' && item.product && amount > 0 && newQty > item.product.stock) {
        alert(`Lo sentimos, el stock límite para este producto es de ${item.product.stock} unidades.`);
        return;
      }
      setCart(
        cart.map(item =>
          item.id === id && item.type === type ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  // Remove item completely
  const handleRemoveItem = (id: string, type: 'product' | 'meal') => {
    setCart(cart.filter(item => !(item.id === id && item.type === type)));
  };

  // Aggregated mathematics
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalCartCost = cart.reduce((sum, item) => {
    const price = item.type === 'product' ? (item.product?.price || 0) : (item.foodItem?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  // Validate form and compile nice dual-section WhatsApp message details
  const handlePrepareOrder = () => {
    setValidationError(null);

    if (cart.length === 0) {
      setValidationError('Tu carrito está vacío.');
      return;
    }

    if (!customerName.trim()) {
      setValidationError('Por favor, ingresa tu nombre completo para realizar tu pedido.');
      return;
    }

    if (shippingMethod === 'Domicilio' && !deliveryAddress.trim()) {
      setValidationError('Por favor, ingresa tu dirección para el servicio a domicilio.');
      return;
    }

    // Split cart into products and meals for beautiful layout segmentation
    const cartProducts = cart.filter(item => item.type === 'product');
    const cartMeals = cart.filter(item => item.type === 'meal');

    // WhatsApp Message Design (Premium & Elegant formatting)
    let msg = `🛒 *NUEVO PEDIDO CONSOLIDADO* 🏪\n`;
    msg += `*${config.name || 'Donde el Goyo'}*\n`;
    msg += `====================================\n\n`;
    msg += `👤 *Cliente:* ${customerName.trim()}\n`;
    msg += `🚚 *Método:* ${shippingMethod === 'Domicilio' ? 'A Domicilio 🚀' : 'Retiro en Tienda 🏬'}\n`;
    
    if (shippingMethod === 'Domicilio') {
      msg += `📍 *Dirección:* ${deliveryAddress.trim()}\n`;
    }
    
    if (notes.trim()) {
      msg += `📝 *Notas:* ${notes.trim()}\n`;
    }

    // section 1: Kitchen meals
    if (cartMeals.length > 0) {
      msg += `\n🍲 *MENÚ DE COMIDAS (La Cocina):*\n`;
      msg += `------------------------------------\n`;
      cartMeals.forEach((item) => {
        if (!item.foodItem) return;
        const itemSubtotal = item.foodItem.price * item.quantity;
        msg += `• *${item.quantity}x* _${item.foodItem.name}_\n`;
        msg += `  Precio cu: $${item.foodItem.price.toFixed(2)} | Sub: $${itemSubtotal.toFixed(2)}\n`;
      });
      msg += `------------------------------------\n`;
    }

    // section 2: Grocery store products
    if (cartProducts.length > 0) {
      msg += `\n📦 *PRODUCTOS DE TIENDA:*\n`;
      msg += `------------------------------------\n`;
      cartProducts.forEach((item) => {
        if (!item.product) return;
        const itemSubtotal = item.product.price * item.quantity;
        msg += `• *${item.quantity}x* _${item.product.name}_\n`;
        msg += `  Precio cu: $${item.product.price.toFixed(2)} | Sub: $${itemSubtotal.toFixed(2)}\n`;
      });
      msg += `------------------------------------\n`;
    }

    msg += `\n💵 *TOTAL COMPLETO A PAGAR:* $${totalCartCost.toFixed(2)}\n\n`;
    msg += `_¡Muchas gracias! Pedido generado desde el catálogo digital._`;

    // Process phone formatting from business configuration WhatsApp number
    const rawPhone = config.whatsapp || '+5491112345678';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, ''); // Numbers only

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    
    setWaUrl(url);
    setWaMsgText(msg);
    setCheckoutStep('ready');
  };

  const handleCompleteOrder = () => {
    setCart([]);
    setCustomerName('');
    setDeliveryAddress('');
    setNotes('');
    setCheckoutStep('form');
    setShowCartModal(false);
  };

  return (
    <div id="compras-container" className="space-y-6 pb-36 animate-in fade-in duration-300">
      {/* Visual Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm h-32 bg-slate-900 text-white flex items-center p-4 border border-slate-150">
        <div className="absolute inset-0 z-0">
          <img
            src={config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
            alt="Local Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.38] contrast-105"
          />
        </div>
        <div className="relative z-10 space-y-1">
          <span className="bg-indigo-600 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm inline-flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 fill-amber-300 stroke-amber-300" />
            CATÁLOGO COMPLETO
          </span>
          <h2 className="text-xl font-black tracking-tight font-sans">
            {config.name || 'Donde el Goyo'} 🏪
          </h2>
          <p className="text-[10px] text-slate-200 font-medium leading-relaxed max-w-sm">
            ¡Agrega víveres de la tienda y exquisitas comidas de la cocina al mismo carrito para enviarlo todo junto!
          </p>
        </div>
      </div>

      {/* Global Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar platos de comida o víveres de la tienda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-250 rounded-xl pl-9.5 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 outline-none font-semibold text-slate-800 shadow-2xs"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-2.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 transition-colors rounded-lg px-2 py-1 text-[9px] font-bold"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* SECTION 1: MENÚ DEL DÍA (Warm dishes) */}
      <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 bgColor bg-indigo-50 text-indigo-700 rounded-lg">
                <Utensils className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm font-sans tracking-tight">
                Menú del Día ✨
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-medium font-sans">
              Comida casera fresca con el toque tradicional de la cocina
            </p>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {foodItemCategories.map((cat) => {
            const isSelected = selectedFoodCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedFoodCategory(cat)}
                className={`py-1.5 px-3 rounded-full text-[10px] font-extrabold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-3xs'
                    : 'bg-slate-100/70 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Horizontal scrollable row of daily lunch plates */}
        {filteredFoodItems.length === 0 ? (
          <p className="text-slate-400 text-[10.5px] italic text-center py-4">
            No se encontraron comidas que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFoodItems.map((dish) => {
              const cartItem = cart.find(item => item.id === dish.id && item.type === 'meal');
              const inCart = !!cartItem;

              return (
                <div 
                  key={dish.id} 
                  className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 flex flex-col shadow-sm hover:shadow-md ${
                    inCart ? 'border-indigo-400 ring-2 ring-indigo-500/5 bg-indigo-50/5' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="relative h-44 w-full bg-slate-50 shrink-0">
                    <img
                      src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-2xs uppercase tracking-wider">
                      {dish.category}
                    </span>
                    {inCart && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-2xs uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> En carrito ({cartItem.quantity})
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col space-y-3 font-sans">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {dish.name}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide block">Precio</span>
                        <span className="font-black text-indigo-700 text-base leading-none">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      {dish.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-150/60 font-sans">
                      <span className="text-[10px] text-slate-400 font-bold">La Cocina 🍲</span>

                      {inCart ? (
                        <div className="flex items-center bg-slate-100 border border-indigo-250 rounded-xl p-1 shadow-3xs">
                          <button
                            onClick={() => handleAdjustQty(dish.id, 'meal', -1)}
                            className="p-1.5 text-indigo-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          <span className="px-3 text-xs font-black text-slate-900">
                            {cartItem.quantity} raciones
                          </span>
                          <button
                            onClick={() => handleAdjustQty(dish.id, 'meal', 1)}
                            className="p-1.5 text-indigo-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddMeal(dish)}
                          className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-1.5 shadow-2xs border border-indigo-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          Agregar al carrito
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: PRODUCTOS DE LA TIENDA (Víveres y Abarrotes) */}
      <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 bgColor bg-amber-50 text-amber-705 rounded-lg">
                <ShoppingBag className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm font-sans tracking-tight">
                Productos de Tienda 📦
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-medium font-sans">
              Víveres, latas, bebidas frías, lácteos y snacks indispensables
            </p>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {productCategories.map((cat) => {
            const isSelected = selectedProductCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedProductCategory(cat)}
                className={`py-1.5 px-3 rounded-full text-[10px] font-extrabold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-3xs'
                    : 'bg-slate-100/70 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid of Store items */}
        {filteredProducts.length === 0 ? (
          <p className="text-slate-400 text-[10.5px] italic text-center py-4">
            No se encontraron productos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((p) => {
              const cartItem = cart.find(item => item.id === p.id && item.type === 'product');
              const inCart = !!cartItem;
              const isOutofStock = p.stock <= 0;

              return (
                <div 
                  key={p.id}
                  className={`bg-white rounded-2xl border-2 transition-all duration-305 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                    isOutofStock 
                      ? 'opacity-65 border-slate-150' 
                      : inCart 
                        ? 'border-indigo-400 ring-2 ring-indigo-500/5 bg-indigo-50/5' 
                        : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="relative h-44 w-full bg-slate-50 overflow-hidden shrink-0">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-102"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-2xs uppercase tracking-wider">
                      {p.category}
                    </span>

                    {isOutofStock ? (
                      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1.5px] flex items-center justify-center">
                        <span className="bg-red-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                          Agotado / Sin Stock
                        </span>
                      </div>
                    ) : p.stock <= 5 ? (
                      <span className="absolute bottom-3 right-3 bg-amber-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-2xs">
                        ¡Solo quedan {p.stock} u.!
                      </span>
                    ) : (
                      <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-3xs text-white text-[8px] font-bold px-2 py-0.5 rounded">
                        S. Disp: {p.stock}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-sans">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <p className="text-slate-900 font-extrabold text-sm leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold font-mono">
                          Código SKU: {p.sku || p.id}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide block">Precio</span>
                        <span className="text-base font-black text-slate-900">
                          ${p.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-150/60 font-sans">
                      <span className="text-[10px] text-slate-400 font-bold">Tienda 📦</span>

                      {isOutofStock ? (
                        <span className="text-[10px] text-rose-500 font-extrabold bg-rose-50 px-2 py-1 rounded-md">No disponible</span>
                      ) : inCart ? (
                        <div className="flex items-center bg-slate-100 border border-indigo-250 rounded-xl p-1 shadow-3xs">
                          <button
                            onClick={() => handleAdjustQty(p.id, 'product', -1)}
                            className="p-1.5 text-indigo-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          <span className="px-3 text-xs font-black text-slate-900">
                            {cartItem.quantity} unid.
                          </span>
                          <button
                            onClick={() => handleAdjustQty(p.id, 'product', 1)}
                            className="p-1.5 text-indigo-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddProduct(p)}
                          className="bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-1.5 shadow-2xs border border-indigo-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          Agregar al carrito
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Persistent Shopping Cart Sticky Floating Action Button at bottom */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-18 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => {
              setValidationError(null);
              setCheckoutStep('form');
              setShowCartModal(true);
            }}
            className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-extrabold p-3.5 rounded-2xl flex items-center justify-between shadow-2xl transition-all duration-200 active:scale-98 border border-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalItemsCount}
              </div>
              <span className="text-xs tracking-tight uppercase">Ver Carrito Completo</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Total:</span>
              <span className="text-sm font-black text-indigo-400">${totalCartCost.toFixed(2)}</span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer / Modal Checkout */}
      {showCartModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up-custom border-t border-slate-100">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-55/40">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 text-left font-sans">
                  {checkoutStep === 'ready' ? 'Pedido listo para WhatsApp' : 'Tu Pedido Integrado'}
                </h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {totalItemsCount} ítems
                </span>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content - Scrollable list and forms */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 font-sans text-xs">
              {checkoutStep === 'form' ? (
                <>
                  {/* Product list items */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                      Lista de Compra
                    </span>
                    
                    <div className="divide-y divide-slate-100 bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden">
                      {cart.map((item) => {
                        const name = item.type === 'product' ? (item.product?.name || '') : (item.foodItem?.name || '');
                        const img = item.type === 'product' ? item.product?.imageUrl : item.foodItem?.imageUrl;
                        const price = item.type === 'product' ? (item.product?.price || 0) : (item.foodItem?.price || 0);
                        const fallbackImg = item.type === 'product' 
                          ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
                          : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100';

                        return (
                          <div 
                            key={`${item.type}-${item.id}`}
                            className="p-3 flex items-center gap-3 justify-between hover:bg-slate-100/40 transition-colors"
                          >
                            <img
                              src={img || fallbackImg}
                              alt={name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-white"
                            />

                            <div className="flex-1 min-w-0 space-y-0.5 select-all">
                              <p className="font-extrabold text-slate-800 truncate text-[11px] leading-tight font-sans">
                                {name}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span className="bg-slate-200/70 text-slate-600 text-[8px] font-extrabold uppercase px-1 py-0.2 rounded">
                                  {item.type === 'product' ? 'Tienda' : 'Cocina 🍲'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold font-sans">
                                  ${price.toFixed(2)} c/u
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Adjust qty item */}
                              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                                <button
                                  onClick={() => handleAdjustQty(item.id, item.type, -1)}
                                  className="p-1 hover:bg-slate-50 text-slate-600 rounded-inner cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="px-1.5 font-bold text-slate-800 text-[10px]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleAdjustQty(item.id, item.type, 1)}
                                  className="p-1 hover:bg-slate-50 text-slate-600 rounded-inner cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Remove item button */}
                              <button
                                  onClick={() => handleRemoveItem(item.id, item.type)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar de la lista"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery info form fields */}
                  <div className="space-y-3 bg-white border border-slate-150 p-3 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                      Información del Cliente
                    </span>

                    <div className="space-y-2.5 font-sans">
                      <div>
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1 font-sans">
                          Tu Nombre completo *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Juan Pérez"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 outline-none font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1 font-sans">
                          Método de Entrega
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setShippingMethod('Retiro')}
                            className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              shippingMethod === 'Retiro'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Retiro en local
                          </button>
                          <button
                            type="button"
                            onClick={() => setShippingMethod('Domicilio')}
                            className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              shippingMethod === 'Domicilio'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            A Domicilio 🚀
                          </button>
                        </div>
                      </div>

                      {shippingMethod === 'Domicilio' && (
                        <div className="animate-fade-in-quick">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1 font-sans">
                            Dirección detallada de Entrega *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Calle 5, Casa 12, Colonia Santa Lucía"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 outline-none font-semibold text-slate-800"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1 font-sans">
                          Notas especiales o Instrucciones (Opcional)
                        </label>
                        <textarea
                          placeholder="Ej. Dejar en portería, llevar cambio de $20, etc."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 outline-none font-semibold text-slate-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error messages if validations fail */}
                  {validationError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-red-600 font-bold text-[11px] leading-tight flex items-start gap-1 p-2.5 animate-bounce-subtle">
                      <span>⚠️</span>
                      <span className="font-sans">{validationError}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-250 font-sans text-left">
                  <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl space-y-1.5 text-indigo-900 text-center">
                    <span className="text-xl">🎉</span>
                    <h4 className="font-black text-sm leading-tight text-indigo-950 font-sans">¡Listos para enviar pedido!</h4>
                    <p className="text-[11.5px] text-indigo-700/95 font-medium font-sans">
                      Tu lista de compras de tienda y almuerzos calientes ha sido formateada perfectamente. El mensaje se enviará al número celular que el dueño configuró en el sistema.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      WhatsApp Destinatario (Dueño):
                    </span>
                    <p className="font-bold text-slate-800 text-xs bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 inline-block font-mono shadow-3xs">
                      📞 {config.whatsapp || '+5491112345678'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      Vista previa de tu mensaje WhatsApp:
                    </span>
                    <pre className="whitespace-pre-wrap bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto shadow-inner border border-slate-950 select-all">
                      {waMsgText}
                    </pre>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-800 space-y-1 leading-snug">
                    <p className="font-extrabold text-[11.5px] text-amber-950 flex items-center gap-1 font-sans">
                      <span>💡</span> ¿Qué pasará ahora?
                    </p>
                    <p className="text-[10.5px] text-amber-800/90 font-medium font-sans">
                      Al hacer clic en el botón verde de abajo, se abrirá WhatsApp con el chat del local. Solamente debes hacer clic en "Enviar" desde WhatsApp para transmitir tu pedido. ¡Fácil y rápido!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Submit Order to WhatsApp */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3 font-sans">
              {checkoutStep === 'form' ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-550 font-extrabold font-sans">Total de compra:</span>
                    <span className="text-lg font-black text-slate-900 font-sans">${totalCartCost.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePrepareOrder}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 text-xs cursor-pointer font-sans"
                  >
                    <Check className="w-4 h-4 text-white" />
                    Enviar mi Pedido por WhatsApp
                  </button>
                </>
              ) : (
                <div className="space-y-2.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCompleteOrder}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] text-xs text-center cursor-pointer block font-sans"
                  >
                    <Send className="w-4 h-4 fill-white text-transparent" />
                    Iniciar Chat y Enviar Pedido
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('form')}
                      className="py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-xs cursor-pointer font-sans"
                    >
                      ⬅️ Modificar Datos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCart([]);
                        setCustomerName('');
                        setDeliveryAddress('');
                        setNotes('');
                        setCheckoutStep('form');
                        setShowCartModal(false);
                      }}
                      className="py-2.5 rounded-xl border border-red-200 text-red-650 bg-red-55/40 hover:bg-red-100 font-bold text-xs cursor-pointer font-sans"
                    >
                      🗑️ Cancelar Pedido
                    </button>
                  </div>
                </div>
              )}

              {!config.whatsapp && checkoutStep === 'form' && (
                <p className="text-center text-[10px] text-amber-600 font-bold leading-tight font-sans">
                  ⚠️ Atención: El número de WhatsApp no ha sido configurado en "Mant.". Se enviará al número por defecto (+5491112345678).
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
