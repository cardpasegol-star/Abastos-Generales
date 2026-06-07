import React, { useState, useEffect } from 'react';
import { Scan, Trash2, CreditCard, Banknote, ShoppingCart, Check, AlertCircle, ShoppingBag, Zap, RefreshCw } from 'lucide-react';
import { Product, CartItem, Transaction } from '../types';

interface CajaTabProps {
  products: Product[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdateProductStock: (id: string, newStock: number) => Promise<void>;
}

export default function CajaTab({ products, onAddTransaction, onUpdateProductStock }: CajaTabProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactionType, setTransactionType] = useState<'Venta' | 'Compra'>('Venta');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta'>('Efectivo');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto clear error message
  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  // Scan random element manually as simulator
  const handleSimulateScan = () => {
    const available = products.filter(p => transactionType === 'Compra' || p.stock > 0);
    if (available.length === 0) {
      setErrorMessage('Sin productos disponibles para despachar');
      return;
    }
    const rand = available[Math.floor(Math.random() * available.length)];
    addToCart(rand);
  };

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Search by SKU or Name exact match
    const found = products.find(
      p => p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() ||
           p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );

    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      setErrorMessage(`No se encontró el producto SKU: "${barcodeInput}"`);
    }
  };

  const addToCart = (product: Product) => {
    // If it is a sale, check if stock is enough
    const existing = cart.find(item => item.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (transactionType === 'Venta' && product.stock <= currentQtyInCart) {
      setErrorMessage(`Stock insuficiente de "${product.name}" (${product.stock} disponibles)`);
      return;
    }

    if (existing) {
      setCart(
        cart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, amount: number) => {
    setCart(
      cart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + amount;
          if (newQty <= 0) return item;

          // Check stock cap for sales
          if (transactionType === 'Venta' && item.product.stock < newQty) {
            setErrorMessage(`Límite de stock alcanzado para "${item.product.name}"`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.15; // IVA 15%
  const total = subtotal + tax;

  const handleCobroRapido = () => {
    // Add a fast general item to the cart immediately
    const found = products.find(p => p.stock > 0);
    if (found) {
      addToCart(found);
    } else {
      setErrorMessage('Agregue un producto manual primero');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMessage('El carrito está vacío');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const txItems = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
      }));

      const transactionPayload: Omit<Transaction, 'id'> = {
        type: transactionType,
        items: txItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        method: paymentMethod,
        createdAt: new Date().toISOString(),
      };

      // 1. Write transaction to Firestore
      await onAddTransaction(transactionPayload);

      // 2. Adjust inventories stocks sequentially
      for (const item of cart) {
        const delta = transactionType === 'Venta' ? -item.quantity : item.quantity;
        const targetProduct = products.find(p => p.id === item.product.id);
        if (targetProduct) {
          const newStock = Math.max(0, targetProduct.stock + delta);
          await onUpdateProductStock(targetProduct.id, newStock);
        }
      }

      // Create dummy transaction for showing success summary
      const dummyId = 'TX-' + Math.floor(100 + Math.random() * 900);
      setSuccessTx({
        id: dummyId,
        ...transactionPayload
      });

      // Clear register cart
      setCart([]);
    } catch (err) {
      console.error(err);
      setErrorMessage('Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="caja-container" className="space-y-6 pb-24">
     {/* 1. Selector de Productos */}
<section className="mt-2 space-y-3">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Agregar al Carrito</h2>
    <span className="text-xs text-gray-400 font-semibold">{products.filter(p => p.stock > 0).length} disponibles</span>
  </div>
  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
    {products.filter(p => transactionType === 'Compra' || p.stock > 0).map((product) => (
      <button
        key={product.id}
        type="button"
        onClick={() => addToCart(product)}
        className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm hover:border-indigo-300 hover:shadow-md active:scale-95 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
        <p className="text-[9px] text-indigo-400 font-bold">{product.category}</p>
          <p className="text-[10px] text-indigo-600 font-extrabold">${product.price.toFixed(2)}</p>
          <p className="text-[9px] text-gray-400 font-semibold">{product.stock} uds</p>
        </div>
      </button>
    ))}
  </div>
</section>

      {/* 2. Messages Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-300">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Manual Lookup & Instant Checkout Action Fields */}
      <section className="flex flex-col gap-3">
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              className="w-full bg-white border border-gray-150 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-600/10 focus:outline-none focus:border-indigo-600 transition-all font-medium h-12"
              placeholder="Escriba SKU o Producto..."
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <Scan className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          </div>
          <button 
            type="submit" 
            className="bg-indigo-600 text-white px-5 rounded-xl font-bold tracking-tight text-xs hover:bg-indigo-700 active:scale-95 transition-all text-center h-12 inline-flex items-center justify-center cursor-pointer select-none"
          >
            Buscar
          </button>
        </form>
        
        <button
          onClick={handleCobroRapido}
          className="w-full bg-amber-100 hover:bg-amber-150 text-amber-900 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm outline-none cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-amber-700 stroke-amber-700 animate-pulse" />
          <span>Cobro Rápido</span>
        </button>
      </section>

      {/* 4. Active Shopping Register Cart items list */}
      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <h2 className="text-base font-extrabold text-gray-900">Carrito de Compra</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cart.length} Items</span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.product.name}</p>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-400 font-semibold">{item.quantity} x ${item.product.price.toFixed(2)}</span>
                  <span className="font-extrabold text-indigo-600">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Counter increment controls */}
              <div className="flex gap-1.5 items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.product.id, -1)}
                  className="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center text-gray-650 hover:bg-gray-150 transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center text-gray-800">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.product.id, 1)}
                  className="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center text-gray-650 hover:bg-gray-150 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-gray-300 hover:text-rose-600 p-2 rounded-full transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-8 bg-dashed bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center text-gray-400 space-y-1">
              <ShoppingCart className="w-8 h-8 stroke-1 text-gray-300" />
              <p className="text-xs font-bold uppercase text-gray-500">El carrito de compra está vacío</p>
              <p className="text-[11px] text-gray-400">Escanee productos o use la barra de búsqueda.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Pricing controls, totals summary sheet box */}
      {cart.length > 0 && (
        <section className="bg-slate-50 rounded-2xl p-4.5 border border-gray-100">
          {/* Operations switcher button */}
          <div className="flex bg-white rounded-xl p-1 mb-5 border border-gray-100">
            <button
              onClick={() => {
                setTransactionType('Venta');
                setCart([]);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold leading-normal transition-all outline-none ${
                transactionType === 'Venta'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Venta (Salida de Stock)
            </button>
            <button
              onClick={() => {
                setTransactionType('Compra');
                setCart([]);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold leading-normal transition-all outline-none ${
                transactionType === 'Compra'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Compra (Entrada de Stock)
            </button>
          </div>

          {/* Payment method selector switches */}
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3.5">
            Método de Pago
          </p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setPaymentMethod('Efectivo')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs outline-none select-none ${
                paymentMethod === 'Efectivo'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-extrabold'
                  : 'border-gray-200 bg-white text-gray-500 font-semibold'
              }`}
            >
              <Banknote className="w-4 w-4" />
              <span>Efectivo</span>
            </button>
            <button
              onClick={() => setPaymentMethod('Tarjeta')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs outline-none select-none ${
                paymentMethod === 'Tarjeta'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-extrabold'
                  : 'border-gray-200 bg-white text-gray-500 font-semibold'
              }`}
            >
              <CreditCard className="w-4 w-4" />
              <span>Tarjeta</span>
            </button>
          </div>

          {/* Checkout pricing details */}
          <div className="space-y-2 border-t border-gray-150 pt-4 text-xs font-medium text-gray-500">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>IVA (15%)</span>
              <span className="font-bold text-gray-800">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-slate-200">
              <span className="text-sm font-bold text-gray-950">Total General</span>
              <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cobrar Trigger button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-5 bg-indigo-600 text-white py-4 rounded-2xl font-bold tracking-tight text-sm flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 active:scale-[0.98] hover:shadow-lg transition-all text-center shrink-0 disabled:opacity-55 cursor-pointer outline-none select-none"
          >
            {loading ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin mx-auto" />
            ) : (
              <>
                <ShoppingBag className="w-4.5 h-4.5 text-white" />
                <span>COBRAR ${total.toFixed(2)}</span>
              </>
            )}
          </button>
        </section>
      )}

      {/* 6. Checker modal success overview */}
      {successTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center border border-gray-100 shadow-2xl relative">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 border border-emerald-200">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-950 mb-1">¡Cobro Completado!</h3>
            <p className="text-xs text-gray-500 mb-4">La transacción ha sido registrada de forma segura en Firestore.</p>

            {/* Recibo Details */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2 mb-5">
              <div className="flex justify-between border-b border-gray-150 pb-2 mb-2 font-semibold">
                <span className="text-gray-400">Recibo #{successTx.id}</span>
                <span className="text-indigo-700">{successTx.type}</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {successTx.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-650">
                    <span>{item.name} (x{item.qty})</span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-150 pt-2 flex justify-between font-extrabold text-sm text-gray-900">
                <span>Total Cobrado:</span>
                <span className="text-indigo-600">${successTx.total.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-gray-400 text-center pt-2 italic">
                Pago realizado mediante: {successTx.method}
              </div>
            </div>

            <button
              onClick={() => setSuccessTx(null)}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm hover:indigo-700 active:scale-95 transition-all cursor-pointer outline-none select-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
