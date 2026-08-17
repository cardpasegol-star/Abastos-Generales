import { useState, useEffect, useMemo, useCallback } from 'react';
import { TurkoProduct, TurkoCartItem, TurkoTransaction } from './types';
import { BusinessConfig } from '../../types';
import { safeLocalStorageSetItem } from '../../utils';
import {
  TURKO_STORE_DATA_KEY,
  TURKO_STORE_CONFIG_KEY,
  TURKO_INVENTORY_KEY,
  TURKO_TRANSACTIONS_KEY,
  DEFAULT_TURKO_CONFIG,
  getTurkoStoredConfig,
  getTurkoStoredInventory,
  saveTurkoConfig,
  saveTurkoInventory,
  getTurkoFormattedChileDate
} from './config';
import { calculateTurkoTotals, generateTurkoWhatsAppMessage, isTurkoProduct } from './utils';
import { validateTurkoCoupon, CouponValidationResult } from './coupons';

export function useTurkoStore(
  initialConfig?: BusinessConfig,
  initialProducts?: TurkoProduct[],
  onSaveTransactionExternal?: (tx: Omit<TurkoTransaction, 'id'>) => Promise<string>
) {
  // Config state
  const [config, setConfig] = useState<BusinessConfig>(() => {
    return initialConfig || getTurkoStoredConfig() || DEFAULT_TURKO_CONFIG;
  });

  // Sync external config if updated from Master/Settings
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Products inventory state
  const [products, setProducts] = useState<TurkoProduct[]>(() => {
    if (initialProducts && initialProducts.length > 0) return initialProducts;
    const stored = getTurkoStoredInventory();
    if (stored && stored.length > 0) return stored;
    try {
      const appProds = localStorage.getItem('APP_PRODUCTS_DATA');
      if (appProds) return JSON.parse(appProds);
    } catch {}
    return [];
  });

  // Sync external products if provided
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      saveTurkoInventory(initialProducts);
    }
  }, [initialProducts]);

  // Cart State
  const [cart, setCart] = useState<TurkoCartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<'Retiro' | 'Domicilio'>('Domicilio');
  const [selectedComuna, setSelectedComuna] = useState<string>('La Pintana');
  const [deliveryFee, setDeliveryFee] = useState<number>(2500);

  // Coupon State
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Customer Form
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('MercadoPago');

  // Ticket modal state
  const [activeTicket, setActiveTicket] = useState<TurkoTransaction | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!isTurkoProduct(prod, config.productCategories)) return false;
      const matchesSearch = searchQuery === '' || prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Todas' || prod.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory, config.productCategories]);

  // Apply / Validate Coupon
  const applyCouponCode = useCallback((codeToValidate?: string) => {
    const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const code = codeToValidate !== undefined ? codeToValidate : couponInput;
    const fee = shippingMethod === 'Domicilio' ? deliveryFee : 0;

    const result = validateTurkoCoupon(code, rawSubtotal, fee);
    if (result.isValid) {
      setAppliedCoupon(result);
      setCouponFeedback({ message: result.message, isError: false });
    } else {
      setAppliedCoupon(null);
      setCouponFeedback({ message: result.message, isError: true });
    }
    return result;
  }, [cart, couponInput, shippingMethod, deliveryFee]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);
  }, []);

  // Calculated Totals with Coupon Support
  const totals = useMemo(() => {
    const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const discountedSubtotal = Math.max(0, rawSubtotal - (appliedCoupon?.isFreeShipping ? 0 : discountAmount));
    const ivaRate = (config.ivaPercentage || 19) / 100;
    const tax = discountedSubtotal * ivaRate;
    const platformFee = discountedSubtotal * 0.10;
    const effectiveDeliveryFee = appliedCoupon?.isFreeShipping
      ? 0
      : (shippingMethod === 'Domicilio' ? deliveryFee : 0);
    const total = discountedSubtotal + tax + effectiveDeliveryFee + platformFee;

    return {
      subtotal: rawSubtotal,
      discountAmount,
      discountedSubtotal,
      tax,
      platformFee,
      deliveryFee: effectiveDeliveryFee,
      total: Math.round(total)
    };
  }, [cart, shippingMethod, deliveryFee, config.ivaPercentage, appliedCoupon]);

  // Cart operations
  const addToCart = useCallback((product: TurkoProduct, qty: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === product.id);
      const price = product.enOferta && product.precioOferta ? product.precioOferta : product.price;
      if (existing) {
        return prevCart.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          type: 'product',
          product,
          quantity: qty,
          price,
          unidadMedida: product.unidadMedida
        }
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) => (i.id === productId ? { ...i, quantity: qty } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponFeedback(null);
  }, []);

  // Checkout Execution
  const executeCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);

    try {
      const calculated = totals;

      const newTx: Omit<TurkoTransaction, 'id'> = {
        storeId: 'el_turco',
        type: 'Venta',
        items: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          qty: item.quantity,
          quantity: item.quantity,
          category: item.product.category,
          unidadMedida: item.unidadMedida
        })),
        subtotal: calculated.subtotal,
        tax: calculated.tax,
        platformFee: calculated.platformFee,
        total: calculated.total,
        method: paymentMethod,
        createdAt: new Date().toISOString(),
        customerName: customerName.trim() || 'Cliente General',
        customerPhone: customerPhone.trim() || '+56900000000',
        notes: notes.trim() || undefined,
        shippingMethod,
        deliveryFee: shippingMethod === 'Domicilio' ? calculated.deliveryFee : 0,
        deliveryAddress: shippingMethod === 'Domicilio' ? deliveryAddress.trim() : undefined,
        deliveryComuna: shippingMethod === 'Domicilio' ? selectedComuna : undefined,
        paymentStatus: paymentMethod === 'Efectivo' || paymentMethod === 'Fiado / Cuenta Corriente' ? 'Pendiente' : 'Aprobado',
        source: 'digital',
        origen: 'digital',
        orderStatus: 'En Preparación ⏳',
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount || 0,
        isFiado: paymentMethod === 'Fiado / Cuenta Corriente'
      };

      let txId = `TURKO-${Date.now()}`;
      if (onSaveTransactionExternal) {
        try {
          txId = await onSaveTransactionExternal(newTx);
        } catch (err) {
          console.error('Error saving external transaction:', err);
        }
      }

      const fullTx: TurkoTransaction = { ...newTx, id: txId };

      // Save locally under turko namespace
      try {
        const storedTxs: TurkoTransaction[] = JSON.parse(localStorage.getItem(TURKO_TRANSACTIONS_KEY) || '[]');
        storedTxs.unshift(fullTx);
        safeLocalStorageSetItem(TURKO_TRANSACTIONS_KEY, JSON.stringify(storedTxs.slice(0, 50)));
      } catch {}

      // Open WhatsApp with detailed order notification
      let message = `*🛒 NUEVO PEDIDO - ${config.name || 'DONDE EL TURCO'}*\n`;
      message += `*Nº Orden:* #${fullTx.id.replace('tx-', '').toUpperCase()}\n`;
      message += `*Cliente:* ${fullTx.customerName}\n`;
      message += `*Teléfono:* ${fullTx.customerPhone}\n`;
      message += `*Estado Inicial:* [En Preparación ⏳]\n`;
      message += `------------------------------------\n`;
      message += `*DETALLE DE PRODUCTOS:*\n`;

      fullTx.items.forEach((it, idx) => {
        message += `${idx + 1}. *${it.name}* (x${it.qty || it.quantity}) - $${(it.price * (it.qty || it.quantity)).toLocaleString('es-CL')}\n`;
      });

      message += `------------------------------------\n`;
      message += `*Subtotal:* $${calculated.subtotal.toLocaleString('es-CL')} CLP\n`;
      if (appliedCoupon) {
        message += `*Cupón Aplicado (${appliedCoupon.code}):* -$${appliedCoupon.discountAmount.toLocaleString('es-CL')} CLP\n`;
      }
      message += `*IVA (${config.ivaPercentage || 19}%):* $${calculated.tax.toLocaleString('es-CL')} CLP\n`;
      message += `*Tarifa Plataforma (10%):* $${calculated.platformFee.toLocaleString('es-CL')} CLP\n`;

      if (shippingMethod === 'Domicilio') {
        message += `*Despacho a Domicilio:* $${calculated.deliveryFee.toLocaleString('es-CL')} CLP\n`;
        message += `*Dirección:* ${fullTx.deliveryAddress || 'N/A'} (${fullTx.deliveryComuna || 'La Pintana'})\n`;
      } else {
        message += `*Modalidad:* Retiro en Local ($0)\n`;
      }

      message += `*TOTAL FINAL:* *$${calculated.total.toLocaleString('es-CL')} CLP*\n`;
      message += `*Método de Pago:* ${paymentMethod}\n`;
      if (notes.trim()) message += `*Notas:* ${notes.trim()}\n`;
      message += `\nFavor confirmar recepción y preparación del pedido. ¡Muchas gracias!`;

      const cleanPhone = (config.whatsapp || '+56912345678').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');

      // Set Active Ticket Modal & Clear Cart
      setActiveTicket(fullTx);
      clearCart();
    } catch (err) {
      console.error('Error in executeCheckout:', err);
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [cart, shippingMethod, deliveryFee, config, paymentMethod, customerName, customerPhone, deliveryAddress, notes, selectedComuna, onSaveTransactionExternal, clearCart, totals, appliedCoupon]);

  return {
    config,
    setConfig,
    products,
    filteredProducts,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    shippingMethod,
    setShippingMethod,
    selectedComuna,
    setSelectedComuna,
    deliveryFee,
    setDeliveryFee,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    deliveryAddress,
    setDeliveryAddress,
    notes,
    setNotes,
    paymentMethod,
    setPaymentMethod,
    couponInput,
    setCouponInput,
    appliedCoupon,
    couponFeedback,
    applyCouponCode,
    removeCoupon,
    totals,
    activeTicket,
    setActiveTicket,
    isProcessingCheckout,
    executeCheckout
  };
}
