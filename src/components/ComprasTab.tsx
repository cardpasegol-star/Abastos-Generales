import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Minus, Send, Trash2, X, ShoppingBag, Check, Utensils, Sparkles, Printer, Download, Share2 } from 'lucide-react';
import { Product, FoodItem, BusinessConfig, Transaction } from '../types';
import { jsPDF } from 'jspdf';

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  'Todos': '🛒',
  'Todo': '🛒',
  'Bebidas': '🥤',
  'Abarrotes': '🧴',
  'Lácteos': '🥛',
  'Snacks': '🍿',
  'Almuerzos': '🍳',
  'Sopas': '🍲',
  'Postres': '🍰',
};

function getCategoryIcon(cat: string, config?: BusinessConfig): string {
  if (cat === 'Todos' || cat === 'Todo') return '🛒';
  return config?.categoryIcons?.[cat] || DEFAULT_CATEGORY_ICONS[cat] || '📦';
}

interface ComprasTabProps {
  products: Product[];
  foodItems?: FoodItem[];
  config: BusinessConfig;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<string>;
  onUpdateProductStock: (id: string, newStock: number) => Promise<void>;
}

interface CartItem {
  id: string; // product ID or foodItem ID
  type: 'product' | 'meal';
  product?: Product;
  foodItem?: FoodItem;
  quantity: number;
}

export default function ComprasTab({ products, foodItems = [], config, onAddTransaction, onUpdateProductStock }: ComprasTabProps) {
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

  // Transaction state after database save
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Lists of categories
  const productCategories = ['Todo', ...(config?.productCategories || ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'])];
  const foodItemCategories = ['Todo', ...(config?.foodItemCategories || ['Almuerzos', 'Sopas', 'Postres', 'Bebidas'])];

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
  
  const ivaPercentage = config?.ivaPercentage !== undefined ? config.ivaPercentage : 15;
  const subtotalVal = cart.reduce((sum, item) => {
    const price = item.type === 'product' ? (item.product?.price || 0) : (item.foodItem?.price || 0);
    return sum + price * item.quantity;
  }, 0);
  const taxVal = subtotalVal * (ivaPercentage / 100);
  const totalCartCost = subtotalVal + taxVal;

  // PDF Ticket Downloader for Clients
  const downloadReceiptPDF = (tx: Transaction) => {
    const paddingBottom = 25;
    const headerHeight = 55;
    const itemsHeight = tx.items.length * 7;
    const totalsHeight = 30;
    const pdfHeight = headerHeight + itemsHeight + totalsHeight + paddingBottom;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, pdfHeight]
    });

    let currentY = 10;
    
    // Store branding header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text((config?.name || 'Mi Negocio').toUpperCase(), 40, currentY, { align: 'center' });
    currentY += 4.5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('TICKET DE OPERACION PEDIDO', 40, currentY, { align: 'center' });
    currentY += 4.5;

    if (config?.gps) {
      doc.text(config.gps, 40, currentY, { align: 'center' });
      currentY += 4;
    }
    if (config?.whatsapp) {
      doc.text(`Wsp: +${config.whatsapp}`, 40, currentY, { align: 'center' });
      currentY += 4;
    }
    
    doc.line(5, currentY, 75, currentY);
    currentY += 4.5;

    // Billing / Registry context
    doc.setFontSize(7);
    doc.text(`NRO COMPROBANTE: #${tx.id.toUpperCase()}`, 5, currentY);
    currentY += 3.5;
    doc.text(`FECHA EMISION: ${new Date(tx.createdAt).toLocaleString()}`, 5, currentY);
    currentY += 3.5;
    doc.text(`TIPO OPERACION: VENTA (PEDIDO ON)', 5, currentY);`, 5, currentY);
    currentY += 4.5;

    doc.line(5, currentY, 75, currentY);
    currentY += 5;

    // Column Headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('DESCRIPCIÓN', 5, currentY);
    doc.text('CANT', 42, currentY, { align: 'center' });
    doc.text('P.UNIT', 56, currentY, { align: 'center' });
    doc.text('TOTAL', 75, currentY, { align: 'right' });
    currentY += 4;
    
    doc.line(5, currentY, 75, currentY);
    currentY += 4;

    // Itemized list
    doc.setFont('helvetica', 'normal');
    tx.items.forEach((item) => {
      let displayName = item.name.toUpperCase();
      if (displayName.length > 20) displayName = displayName.slice(0, 19) + '.';
      
      doc.text(displayName, 5, currentY);
      doc.text(`${item.qty}`, 42, currentY, { align: 'center' });
      doc.text(`$${item.price.toFixed(2)}`, 56, currentY, { align: 'center' });
      
      const itemTotal = item.qty * item.price;
      doc.text(`$${itemTotal.toFixed(2)}`, 75, currentY, { align: 'right' });
      currentY += 5.5;
    });

    currentY -= 1.5;
    doc.line(5, currentY, 75, currentY);
    currentY += 4.5;

    // Totals Block
    doc.setFontSize(7);
    doc.text('SUBTOTAL:', 45, currentY);
    doc.text(`$${tx.subtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 3.5;

    const calculatedIvaRate = tx.subtotal > 0 ? Math.round((tx.tax / tx.subtotal) * 100) : (config?.ivaPercentage !== undefined ? config.ivaPercentage : 15);
    doc.text(`IVA (${calculatedIvaRate}%):`, 45, currentY);
    doc.text(`$${tx.tax.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 4.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL PEDIDO:', 5, currentY);
    doc.text(`$${tx.total.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 7;

    // Footer lines
    doc.line(5, currentY, 75, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('¡Pedido por catálogo online!', 40, currentY, { align: 'center' });
    currentY += 3;
    doc.text('Gracias por su preferencia.', 40, currentY, { align: 'center' });

    doc.save(`Ticket_Pedido_${tx.id}.pdf`);
  };

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

    msg += `\n💵 *RESUMEN DE PAGO:*\n`;
    msg += `• Subtotal: $${subtotalVal.toFixed(2)}\n`;
    msg += `• IVA (${ivaPercentage}%): $${taxVal.toFixed(2)}\n`;
    msg += `• *TOTAL COMPLETO A PAGAR: $${totalCartCost.toFixed(2)}*\n\n`;
    msg += `_¡Muchas gracias! Pedido generado desde el catálogo digital._`;

    // Process phone formatting from business configuration WhatsApp number
    const rawPhone = config.whatsapp || '+5491112345678';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, ''); // Numbers only

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    
    setWaUrl(url);
    setWaMsgText(msg);
    setCheckoutStep('ready');
  };

  const handlePlaceOrderAndCheckout = async () => {
    setIsCheckingOut(true);
    setValidationError(null);

    try {
      const txItems = cart.map(item => {
        const productId = item.id;
        const name = item.type === 'product' ? (item.product?.name || '') : (item.foodItem?.name || '');
        const price = item.type === 'product' ? (item.product?.price || 0) : (item.foodItem?.price || 0);
        return {
          productId,
          name,
          qty: item.quantity,
          price
        };
      });

      const transactionPayload: Omit<Transaction, 'id'> = {
        type: 'Venta',
        items: txItems,
        subtotal: parseFloat(subtotalVal.toFixed(2)),
        tax: parseFloat(taxVal.toFixed(2)),
        total: parseFloat(totalCartCost.toFixed(2)),
        method: 'Efectivo', // pickup / delivery
        createdAt: new Date().toISOString(),
      };

      // 1. Save transaction to Firestore
      const txId = await onAddTransaction(transactionPayload);

      // 2. Adjust inventories stocks sequentially for products ONLY
      for (const item of cart) {
        if (item.type === 'product' && item.product) {
          const targetProduct = products.find(p => p.id === item.product?.id);
          if (targetProduct) {
            const newStock = Math.max(0, targetProduct.stock - item.quantity);
            await onUpdateProductStock(targetProduct.id, newStock);
          }
        }
      }

      // 3. Keep standard transaction representation for displaying physical-grade ticket overlay on-screen
      setSuccessTx({
        id: txId,
        ...transactionPayload
      });

      // 4. Open WhatsApp chat with pre-filled message
      window.open(waUrl, '_blank');

      // 5. Clear cart & states
      setCart([]);
      setCustomerName('');
      setDeliveryAddress('');
      setNotes('');
      setCheckoutStep('form');
      setShowCartModal(false);
    } catch (err) {
      console.error(err);
      setValidationError('Ocurrió un error al registrar el ticket de compra y actualizar inventarios.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div id="compras-container" className="space-y-6 pb-36 animate-in fade-in duration-300">
      {/* Visual Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-md h-36 bg-slate-900 text-white flex items-center p-5 border-2 border-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src={config.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
            alt="Local Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.45] contrast-110"
          />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-emerald-600 text-white text-xs font-black uppercase px-3.5 py-1.5 rounded-full tracking-wider shadow-md inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-amber-300 stroke-amber-350" />
            CATÁLOGO COMPLETO
          </span>
          <h2 className="text-2xl font-black tracking-tight font-sans text-white">
            {config.name || 'Donde el Goyo'} 🏪
          </h2>
          <p className="text-xs text-slate-100 font-extrabold leading-relaxed max-w-sm">
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
          className="w-full bg-white border-2 border-slate-350 rounded-2xl pl-11 pr-20 py-4 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-extrabold text-slate-950 shadow-sm"
        />
        <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-500 stroke-[2.5]" />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-3 bg-slate-100 hover:bg-slate-200 text-slate-850 transition-colors rounded-xl px-3 py-1.5 text-xs font-black border border-slate-200"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* SECTION 1: MENÚ DEL DÍA (Warm dishes) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-3xs">
                <Utensils className="w-4 h-4 stroke-[2.5]" />
              </span>
              <h3 className="font-black text-slate-950 text-lg font-sans tracking-tight">
                Menú del Día ✨
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-bold font-sans">
              Comida casera fresca con el toque tradicional de la cocina
            </p>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {foodItemCategories.map((cat) => {
            const isSelected = selectedFoodCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedFoodCategory(cat)}
                className={`py-2 px-4 rounded-full text-xs font-black tracking-tight whitespace-nowrap transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-250 border-transparent'
                }`}
              >
                {getCategoryIcon(cat, config)} {cat}
              </button>
            );
          })}
        </div>

        {/* Horizontal scrollable row of daily lunch plates */}
        {filteredFoodItems.length === 0 ? (
          <p className="text-slate-500 text-xs font-bold italic text-center py-5">
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
                    inCart ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/5' : 'border-slate-200 bg-white'
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
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-sm uppercase tracking-wider flex items-center gap-1">
                      {getCategoryIcon(dish.category, config)} {dish.category}
                    </span>
                    {inCart && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> En carrito ({cartItem.quantity})
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col space-y-3 font-sans">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-black text-slate-950 text-base leading-snug">
                        {dish.name}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-550 font-black uppercase tracking-wide block">Precio</span>
                        <span className="font-black text-emerald-600 text-lg leading-none">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-750 text-xs font-semibold leading-relaxed">
                      {dish.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 font-sans">
                      <span className="text-xs text-slate-950 font-black flex items-center gap-1">La Cocina 🍲</span>

                      {inCart ? (
                        <div className="flex items-center bg-slate-100 border-2 border-slate-250 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => handleAdjustQty(dish.id, 'meal', -1)}
                            className="p-1.5 bg-white text-emerald-700 hover:bg-slate-100 rounded-lg shadow-3xs transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="px-3 text-xs font-black text-slate-950">
                            {cartItem.quantity} raciones
                          </span>
                          <button
                            onClick={() => handleAdjustQty(dish.id, 'meal', 1)}
                            className="p-1.5 bg-white text-emerald-700 hover:bg-slate-100 rounded-lg shadow-3xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddMeal(dish)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-1.5 shadow-md border border-emerald-500 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
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
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 shadow-3xs">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <h3 className="font-black text-slate-950 text-lg font-sans tracking-tight">
                Productos de Tienda 📦
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-bold font-sans">
              Víveres, latas, bebidas frías, lácteos y snacks indispensables
            </p>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {productCategories.map((cat) => {
            const isSelected = selectedProductCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedProductCategory(cat)}
                className={`py-2 px-4 rounded-full text-xs font-black tracking-tight whitespace-nowrap transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-250 border-transparent font-extrabold'
                }`}
              >
                {getCategoryIcon(cat, config)} {cat}
              </button>
            );
          })}
        </div>

        {/* Grid of Store items */}
        {filteredProducts.length === 0 ? (
          <p className="text-slate-500 text-xs font-bold italic text-center py-5">
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
                      ? 'opacity-65 border-slate-200 bg-slate-50' 
                      : inCart 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/5' 
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="relative h-44 w-full bg-slate-50 overflow-hidden shrink-0">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-2.5 bg-white transition-transform duration-305 ease-out hover:scale-101"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-black px-3.5 py-1 rounded-lg shadow-sm uppercase tracking-wider flex items-center gap-1">
                      {getCategoryIcon(p.category, config)} {p.category}
                    </span>

                    {isOutofStock ? (
                      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1.5px] flex items-center justify-center">
                        <span className="bg-red-500 text-white font-extrabold text-xs px-4 py-2 rounded-full uppercase tracking-widest shadow-md">
                          Agotado / Sin Stock
                        </span>
                      </div>
                    ) : p.stock <= 5 ? (
                      <span className="absolute bottom-3 right-3 bg-amber-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-xs">
                        ¡Solo quedan {p.stock} u.!
                      </span>
                    ) : (
                      <span className="absolute bottom-3 right-3 bg-slate-950/90 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                        S. Disp: {p.stock}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-sans">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <p className="text-slate-950 font-black text-base leading-tight">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-600 font-extrabold font-mono">
                          SKU: {p.sku || p.id}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-550 font-black uppercase tracking-wide block">Precio</span>
                        <span className="text-lg font-black text-slate-950">
                          ${p.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-205 font-sans">
                      <span className="text-xs text-slate-950 font-black">Tienda 📦</span>

                      {isOutofStock ? (
                        <span className="text-xs text-rose-600 font-black bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">No disponible</span>
                      ) : inCart ? (
                        <div className="flex items-center bg-slate-100 border-2 border-slate-250 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => handleAdjustQty(p.id, 'product', -1)}
                            className="p-1.5 bg-white text-emerald-700 hover:bg-slate-100 rounded-lg shadow-3xs transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="px-3 text-xs font-black text-slate-950">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleAdjustQty(p.id, 'product', 1)}
                            className="p-1.5 bg-white text-emerald-700 hover:bg-slate-100 rounded-lg shadow-3xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddProduct(p)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-1.5 shadow-md border border-emerald-500 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          Agregar
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
            className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-black p-4 rounded-2xl flex items-center justify-between shadow-2xl transition-all duration-200 active:scale-98 border-2 border-emerald-500 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-emerald-700 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalItemsCount}
              </div>
              <span className="text-sm font-black tracking-tight uppercase">VER MI CARRITO</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-100">Total:</span>
              <span className="text-base font-black text-white">${totalCartCost.toFixed(2)}</span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer / Modal Checkout */}
      {showCartModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up-custom border-t border-slate-100">
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-slate-200 flex items-center justify-between bg-white text-slate-950">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                <h3 className="text-base font-black text-slate-950 text-left font-sans">
                  {checkoutStep === 'ready' ? 'Pedido listo para WhatsApp' : 'Tu Pedido Integrado'}
                </h3>
                <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200">
                  {totalItemsCount} ítems
                </span>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 font-sans text-xs">
              {checkoutStep === 'form' ? (
                <>
                  {/* Product list items */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest block font-sans">
                      Lista de Compra
                    </span>
                    
                    <div className="divide-y-2 divide-slate-100 bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden">
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
                            className="p-3.5 flex items-center gap-3 justify-between hover:bg-slate-100/40 transition-colors"
                          >
                            <img
                              src={img || fallbackImg}
                              alt={name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 object-contain p-1 rounded-xl border-2 border-slate-200 bg-white"
                            />

                            <div className="flex-1 min-w-0 space-y-1 select-all">
                              <p className="font-extrabold text-slate-950 truncate text-xs leading-snug font-sans">
                                {name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                  item.type === 'product' ? 'bg-amber-100 text-amber-800 font-extrabold' : 'bg-emerald-100 text-emerald-800 font-extrabold'
                                }`}>
                                  {item.type === 'product' ? 'Tienda' : 'Cocina 🍲'}
                                </span>
                                <span className="text-xs text-slate-800 font-black font-sans">
                                  ${price.toFixed(2)} c/u
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Adjust qty item */}
                              <div className="flex items-center bg-white border-2 border-slate-250 rounded-xl p-1 shadow-2xs">
                                <button
                                  onClick={() => handleAdjustQty(item.id, item.type, -1)}
                                  className="p-1 hover:bg-slate-55 text-slate-800 rounded-lg cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <span className="px-2 font-black text-slate-950 text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleAdjustQty(item.id, item.type, 1)}
                                  className="p-1 hover:bg-slate-55 text-slate-800 rounded-lg cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              </div>

                              {/* Remove item button */}
                              <button
                                  onClick={() => handleRemoveItem(item.id, item.type)}
                                  className="p-2 bg-rose-50 hover:bg-rose-105 text-rose-600 rounded-xl transition-colors cursor-pointer border-2 border-rose-150"
                                  title="Eliminar de la lista"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery info form fields */}
                  <div className="space-y-4 bg-white border-2 border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest block font-sans">
                      Información del Cliente
                    </span>

                    <div className="space-y-3.5 font-sans">
                      <div>
                        <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                          Tu Nombre completo *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Juan Pérez"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                          Método de Entrega
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setShippingMethod('Retiro')}
                            className={`py-3 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer ${
                              shippingMethod === 'Retiro'
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Retiro en local
                          </button>
                          <button
                            type="button"
                            onClick={() => setShippingMethod('Domicilio')}
                            className={`py-3 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer ${
                              shippingMethod === 'Domicilio'
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            A Domicilio 🚀
                          </button>
                        </div>
                      </div>

                      {shippingMethod === 'Domicilio' && (
                        <div className="animate-fade-in-quick">
                          <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                            Dirección detallada de Entrega *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Calle 5, Casa 12, Colonia Santa Lucía"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                          Notas especiales o Instrucciones (Opcional)
                        </label>
                        <textarea
                          placeholder="Ej. Dejar en portería, llevar cambio de $20, etc."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950 resize-none"
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
                  <div className="bg-emerald-50 border-2 border-emerald-250 p-4 rounded-2xl space-y-2 text-emerald-900 text-center">
                    <span className="text-2xl block">🎉</span>
                    <h4 className="font-black text-base leading-tight text-emerald-950 font-sans">¡Listos para enviar pedido!</h4>
                    <p className="text-xs text-emerald-900/90 font-bold font-sans">
                      Tu lista de compras de tienda y almuerzos calientes ha sido formateada perfectamente. El mensaje se enviará al número celular que el dueño configuró en el sistema.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-slate-650 uppercase tracking-widest block font-sans">
                      WhatsApp Destinatario (Dueño):
                    </span>
                    <p className="font-black text-slate-900 text-sm bg-slate-100 px-4 py-3 rounded-2xl border-2 border-slate-300 inline-block font-mono shadow-sm">
                      📞 {config.whatsapp || '+5491112345678'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-slate-650 uppercase tracking-widest block font-sans">
                      Vista previa de tu mensaje WhatsApp:
                    </span>
                    <pre className="whitespace-pre-wrap bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs leading-relaxed max-h-48 overflow-y-auto shadow-inner border-2 border-slate-900 select-all">
                      {waMsgText}
                    </pre>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-250 rounded-2xl p-4 text-amber-900 space-y-1.5 leading-snug">
                    <p className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5 font-sans">
                      <span>💡</span> ¿Qué pasará ahora?
                    </p>
                    <p className="text-xs text-amber-900/90 font-bold font-sans">
                      Al hacer clic en el botón verde de abajo, se abrirá WhatsApp con el chat del local. Solamente debes hacer clic en "Enviar" desde WhatsApp para transmitir tu pedido. ¡Fácil y rápido!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Submit Order to WhatsApp */}
            <div className="p-4 bg-slate-100 border-t-2 border-slate-200 space-y-4 font-sans">
              {checkoutStep === 'form' ? (
                <>
                  <div className="flex items-center justify-between text-sm px-1.5">
                    <span className="text-slate-800 font-extrabold font-sans">Total de compra:</span>
                    <span className="text-xl font-black text-slate-950 font-sans">${totalCartCost.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePrepareOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 text-sm cursor-pointer font-sans border border-emerald-550"
                  >
                    <Check className="w-5 h-5 text-white stroke-[3]" />
                    Enviar mi Pedido por WhatsApp
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrderAndCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-65 text-white font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] text-sm text-center cursor-pointer font-sans border-0 flex justify-center items-center"
                  >
                    <Send className="w-5 h-5 fill-white text-transparent" />
                    {isCheckingOut ? 'Registrando y abriendo WhatsApp...' : 'Iniciar Chat y Enviar Pedido'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('form')}
                      className="py-3 rounded-xl border-2 border-slate-300 text-slate-800 bg-white hover:bg-slate-50 font-bold text-xs cursor-pointer font-sans"
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
                      className="py-3 rounded-xl border-2 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs cursor-pointer font-sans"
                    >
                      🗑️ Cancelar Pedido
                    </button>
                  </div>
                </div>
              )}

              {!config.whatsapp && checkoutStep === 'form' && (
                <p className="text-center text-xs text-amber-700 font-black leading-tight font-sans bg-amber-50 rounded-xl p-2.5 border border-amber-200">
                  ⚠️ Atención: El número de WhatsApp no ha sido configurado en "Mant.". Se enviará al número por defecto (+5491112345678).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Success receipt overlay modal */}
      {successTx && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-300 font-sans">
          {/* Custom isolated @media print styling rules inside ComprasTab */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
                background-color: transparent !important;
                background-image: none !important;
                box-shadow: none !important;
              }
              #ticket-impresion-fiscal-online, #ticket-impresion-fiscal-online * {
                visibility: visible !important;
              }
              #ticket-impresion-fiscal-online {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 4mm !important;
                border: none !important;
                box-shadow: none !important;
                background: #ffffff !important;
                color: #000000 !important;
              }
              @page {
                size: auto;
                margin: 0mm;
              }
            }
          `}} />

          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-sm border-2 border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] relative font-sans">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-widest pl-1 font-sans">¡Pedido Confirmado!</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessTx(null)}
                className="w-8 h-8 rounded-full bg-slate-150 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Scrollable Body - Simulating receipt */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-slate-50/50">
              <p className="text-center text-xs text-emerald-800 font-extrabold leading-tight font-sans bg-emerald-50 rounded-xl p-3 border border-emerald-200 mb-4 shadow-3xs">
                ¡Tu pedido se ha guardado en nuestro inventario y se abrió WhatsApp para coordinar tu entrega! Aquí está tu ticket oficial:
              </p>

              <div id="ticket-impresion-fiscal-online" className="bg-white border-2 border-slate-250 rounded-2xl p-5 shadow-sm space-y-4">
                
                {/* Store Branding Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-slate-200 pb-3">
                  <h4 className="font-black text-slate-950 text-base uppercase tracking-tight font-sans">
                    {config?.name || 'DONDE EL GOYO'}
                  </h4>
                  <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider font-sans">
                    Ticket de Pedido Digital
                  </p>
                  {config?.whatsapp && (
                    <p className="text-xs text-slate-500 font-mono">
                      WhatsApp: +{config.whatsapp}
                    </p>
                  )}
                </div>

                {/* Ticket Meta Info */}
                <div className="text-xs space-y-1 block leading-normal text-slate-600 font-medium font-sans">
                  <div className="flex justify-between">
                    <span className="font-black text-slate-900">NRO COMPROBANTE:</span>
                    <span className="font-mono text-slate-805 font-black">#{successTx.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FECHA:</span>
                    <span>{new Date(successTx.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span>MÉTODO DE PAGO:</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      EFECTIVO / ENTREGA
                    </span>
                  </div>
                </div>

                {/* Items Break Down Table */}
                <div className="border-t border-dashed border-slate-200 pt-3 font-sans">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-sans font-sans">Artículos Solicitados</p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {successTx.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0 font-sans font-sans">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-slate-850 truncate">{item.name.toUpperCase()}</p>
                          <p className="text-[10px] text-slate-450 font-semibold font-sans font-sans">
                            {item.qty} unids x ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-black text-slate-950 shrink-0 font-mono font-sans">
                          ${(item.qty * item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Totals summary */}
                <div className="border-t border-dashed border-slate-200 pt-3 text-xs space-y-1.5 font-medium text-slate-650 font-sans font-sans">
                  <div className="flex justify-between font-sans">
                    <span>SUBTOTAL:</span>
                    <span className="font-mono">${successTx.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span>IVA ({ivaPercentage}%):</span>
                    <span className="font-mono">${successTx.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100 items-baseline font-sans font-sans">
                    <span className="font-black text-xs text-slate-950 uppercase font-sans">TOTAL A PAGAR:</span>
                    <span className="font-mono font-black text-base text-emerald-650 font-sans">
                      ${successTx.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Ticket Footer */}
                <p className="text-[10px] text-slate-450 italic font-bold text-center pt-2 font-sans">
                  ¡Gracias por su preferencia en catálogo digital!
                </p>

              </div>
            </div>

            {/* Quick action buttons block */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 font-sans shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => downloadReceiptPDF(successTx)}
                  className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border-2 border-slate-350 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  Guardar PDF
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border-2 border-slate-350 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Imprimir Ticket
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSuccessTx(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all duration-150 active:scale-97 border border-emerald-550 cursor-pointer shadow-md"
              >
                Hecho / Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
