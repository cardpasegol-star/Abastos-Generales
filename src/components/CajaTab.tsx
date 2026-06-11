import React, { useState, useEffect } from 'react';
import { Scan, Trash2, CreditCard, Banknote, ShoppingCart, Check, AlertCircle, ShoppingBag, Zap, RefreshCw } from 'lucide-react';
import { Product, CartItem, Transaction } from '../types';
import ScannerOverlay from './ScannerOverlay';

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
  const [showScanner, setShowScanner] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');

  // Auto clear error message
  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  // Auto clear success message
  useEffect(() => {
    if (scanSuccessMsg) {
      const t = setTimeout(() => setScanSuccessMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [scanSuccessMsg]);

  // Real-time scan result handler
  const handleScan = (barcode: string) => {
    if (!barcode.trim()) return;

    // Search by SKU exact match primarily (case insensitive trimmed)
    const found = products.find(
      p => p.sku.toLowerCase().trim() === barcode.toLowerCase().trim()
    );

    if (found) {
      // Validate active transaction constraints (stock availability warning for Sale)
      const existing = cart.find(item => item.product.id === found.id);
      const currentQtyInCart = existing ? existing.quantity : 0;

      if (transactionType === 'Venta' && found.stock <= currentQtyInCart) {
        setErrorMessage(`Cantidad solicitada excede el inventario de "${found.name}" (${found.stock} en total)`);
        return;
      }

      addToCart(found);
      setScanSuccessMsg(`¡"${found.name}" agregado con éxito al carrito!`);
    } else {
      setErrorMessage(`El código de barras "${barcode}" no está asociado a ningún producto registrado.`);
    }
  };

  // Scan random element manually as simulator
  const handleSimulateScan = () => {
    const available = products.filter(p => transactionType === 'Compra' || p.stock > 0);
    if (available.length === 0) {
      setErrorMessage('Sin productos disponibles para despachar');
      return;
    }
    const rand = available[Math.floor(Math.random() * available.length)];
    addToCart(rand);
    setScanSuccessMsg(`¡"${rand.name}" (Simulado) agregado al carrito!`);
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
      setErrorMessage(`Stock insuficiente de "${product.name}" (${product.stock} despachados)`);
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
      {/* 1. Barcode Laser Scanner Camera Container */}
      <section className="mt-2 text-center">
        <div 
          onClick={() => setShowScanner(true)}
          className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-md border-2 border-slate-200 cursor-pointer group hover:border-emerald-450 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all"
        >
          <img
            alt="Scanner Camera Area"
            className="w-full h-full object-cover opacity-35 grayscale group-hover:grayscale-0 transition-all duration-500 animate-pulse"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIzDjYI3uZvk66GBjZYAup_oY4e1pJf5nQqLTfN3lbl8auaVWhsJsMuiAyAWcEQOVaGGHx9xB9myZ6WvRD0hYbGDbe0YeU1wtbPMMpO8SUO-IXB_JBv_bjDZJU_rEeS57lomZMh2UGY8BabIUkPonv4rb4dvlvGflrpzE-Xai9mxkCpu96UqI6H6rbMgnZ8XzA69hrGBXIfq9Ejz18mVmki2EWvnzyImwqCj7Yrqd6_L8rKF4aeFkTkjJTKkRSdbM36-ipxx-zgfA"
          />
          
          {/* Scanning Box Outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-36 border-4 border-dashed border-emerald-500 rounded-3xl relative overflow-hidden flex items-center justify-center bg-emerald-950/30 backdrop-blur-[1.5px] transition-all group-hover:scale-105 duration-300">
              {/* Laser Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-[bounce_2s_infinite]"></div>
              <Scan className="w-14 h-14 text-emerald-300 stroke-[2] animate-pulse" />
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs text-white font-black tracking-widest uppercase">Cuentas con Cámara Lista</span>
          </div>

          {/* Hint Overlay */}
          <div className="absolute top-4 right-4 bg-emerald-600 px-4 py-2 rounded-xl text-xs uppercase text-white font-black tracking-wider shadow-sm flex items-center gap-2 shadow-emerald-500/10 animate-bounce">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
            <span>Escanear con Cámara</span>
          </div>
        </div>
      </section>

      {/* 2. Messages Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center gap-3 text-sm font-black animate-in fade-in duration-300 shadow-md">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 stroke-[2.5]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {scanSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-250 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-sm font-black animate-in fade-in duration-300 shadow-md">
          <Check className="w-5 h-5 text-emerald-700 shrink-0 stroke-[3]" />
          <span>{scanSuccessMsg}</span>
        </div>
      )}

      {/* 3. Manual Lookup & Instant Checkout Action Fields */}
      <section className="flex flex-col gap-3">
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              className="w-full bg-white border-2 border-slate-350 rounded-2xl pl-12 pr-4 py-3.5 text-base focus:ring-4 focus:ring-emerald-500/15 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-black text-slate-950 h-14"
              placeholder="Escribe SKU o nombre de producto..."
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 stroke-[2.5]" />
          </div>
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-2xl font-black text-sm active:scale-95 transition-all text-center h-14 inline-flex items-center justify-center cursor-pointer select-none border border-emerald-500 shadow-md"
          >
            Buscar
          </button>
        </form>
        
        <button
          onClick={handleCobroRapido}
          className="w-full bg-amber-50 hover:bg-amber-100 text-amber-950 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-2 border-amber-200 shadow-sm cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-amber-600 stroke-amber-700 animate-pulse stroke-[2]" />
          <span>Cobro Rápido</span>
        </button>
      </section>

      {/* 4. Active Shopping Register Cart items list */}
      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-black text-slate-950">Carrito de Despacho</h2>
          <span className="text-xs font-black text-slate-550 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest">{cart.length} Items</span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white p-4 rounded-3xl border-2 border-slate-250 flex items-center gap-4 shadow-sm hover:border-emerald-250 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-extrabold text-base text-slate-1000 truncate">{item.product.name}</p>
                <div className="flex items-center justify-between mt-1 text-sm">
                  <span className="text-slate-500 font-extrabold">{item.quantity} x ${item.product.price.toFixed(2)}</span>
                  <span className="font-black text-emerald-600 text-base">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Counter increment controls */}
              <div className="flex gap-2 items-center bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.product.id, -1)}
                  className="w-7 h-7 bg-white rounded-xl font-black text-sm flex items-center justify-center text-slate-800 hover:bg-slate-250 shadow-sm transition-all active:scale-95"
                >
                  -
                </button>
                <span className="text-sm font-black w-5 text-center text-slate-900">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.product.id, 1)}
                  className="w-7 h-7 bg-white rounded-xl font-black text-sm flex items-center justify-center text-slate-800 hover:bg-slate-250 shadow-sm transition-all active:scale-95"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-slate-400 hover:text-rose-600 p-2.5 rounded-full hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-12 bg-slate-50 border-2 border-dashed border-slate-250 rounded-3xl flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                <ShoppingCart className="w-8 h-8 stroke-1.5 text-slate-400" />
              </div>
              <p className="text-sm font-black uppercase text-slate-850 tracking-wider">El carrito de compra está vacío</p>
              <p className="text-xs text-slate-500 max-w-xs px-4">Utiliza el simulador de escáner superior o la barra de búsqueda para agregar productos.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Pricing controls, totals summary sheet box */}
      {cart.length > 0 && (
        <section className="bg-slate-50 rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
          {/* Operations switcher button */}
          <div className="flex bg-slate-200/60 rounded-2xl p-1 mb-5 border border-slate-300">
            <button
              onClick={() => {
                setTransactionType('Venta');
                setCart([]);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-black shadow-none transition-all outline-none ${
                transactionType === 'Venta'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Venta (Salida de Stock)
            </button>
            <button
              onClick={() => {
                setTransactionType('Compra');
                setCart([]);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-black shadow-none transition-all outline-none ${
                transactionType === 'Compra'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compra (Entrada de Stock)
            </button>
          </div>

          {/* Payment method selector switches */}
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-left">
            Método de Pago
          </p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setPaymentMethod('Efectivo')}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all text-sm outline-none select-none ${
                paymentMethod === 'Efectivo'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 font-bold hover:bg-slate-100'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-700 stroke-[2]" />
              <span>Efectivo</span>
            </button>
            <button
              onClick={() => setPaymentMethod('Tarjeta')}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all text-sm outline-none select-none ${
                paymentMethod === 'Tarjeta'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 font-bold hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-5 h-5 text-emerald-700 stroke-[2]" />
              <span>Tarjeta</span>
            </button>
          </div>

          {/* Checkout pricing details */}
          <div className="space-y-2.5 border-t-2 border-slate-200 pt-4 text-sm font-bold text-slate-600">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-extrabold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>IVA (15%)</span>
              <span className="font-extrabold text-slate-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-3 border-t-2 border-slate-200">
              <span className="text-base font-black text-slate-950">Total General</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cobrar Trigger button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-5 bg-emerald-600 text-white py-4 rounded-2xl font-black tracking-wider text-base flex items-center justify-center gap-3.5 shadow-md hover:bg-emerald-700 active:scale-[0.98] hover:shadow-lg transition-all text-center shrink-0 disabled:opacity-55 cursor-pointer outline-none select-none border border-emerald-500"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-white" />
            ) : (
              <>
                <ShoppingBag className="w-5.5 h-5.5 text-white stroke-[2.5]" />
                <span>COBRAR ${total.toFixed(2)}</span>
              </>
            )}
          </button>
        </section>
      )}

      {/* 6. Checker modal success overview */}
      {successTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center border-2 border-slate-250 shadow-2xl relative">
            <div className="w-18 h-18 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 border-2 border-emerald-250 animate-bounce">
              <Check className="w-9 h-9 stroke-[3.5]" />
            </div>
            <h3 className="text-xl font-black text-slate-1000 mb-1">¡Cobro Completado!</h3>
            <p className="text-xs text-slate-600 mb-4 font-bold font-sans">La transacción ha sido registrada de forma segura en Firestore.</p>

            {/* Recibo Details */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 mb-5">
              <div className="flex justify-between border-b border-gray-150 pb-2 mb-2 font-black">
                <span className="text-slate-500">Recibo #{successTx.id}</span>
                <span className="text-emerald-750 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-extrabold">{successTx.type}</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {successTx.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-slate-705 font-extrabold">
                    <span>{item.name} (x{item.qty})</span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-150 pt-2 flex justify-between font-black text-sm text-gray-1000">
                <span>Total Cobrado:</span>
                <span className="text-emerald-600 text-base">${successTx.total.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-2 italic font-extrabold uppercase tracking-wider">
                Pago realizado mediante: {successTx.method}
              </div>
            </div>

            <button
              onClick={() => setSuccessTx(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-base shadow-md active:scale-95 transition-all cursor-pointer outline-none select-none border border-emerald-500"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* 7. Real-time Barcode Camera Scanner Modal */}
      {showScanner && (
        <ScannerOverlay
          onScan={(code) => {
            setShowScanner(false);
            handleScan(code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
