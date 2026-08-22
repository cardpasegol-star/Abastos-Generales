import { useState, useEffect, useMemo, useCallback } from 'react';
import { TurkoProduct, TurkoCartItem, TurkoTransaction } from './types';
import { BusinessConfig, isModuleActive } from '../../types';
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
import { calculateTurkoTotals, generateTurkoWhatsAppMessage, isTurkoProduct, getSectorForComunaTurko, calculateCartTotalWeightKg, TURKO_MAX_EXPRESS_WEIGHT_KG } from './utils';
import { validateTurkoCoupon, CouponValidationResult } from './coupons';
import { crearOrdenDelivery } from '../../services/deliveryService';

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
  const [deliveryType, setDeliveryType] = useState<'expres' | 'camion'>('expres');
  const [selectedComuna, setSelectedComuna] = useState<string>('La Pintana');
  const [deliveryFee, setDeliveryFee] = useState<number>(2500);

  // Cart Weight Calculation & Express Limit Enforcement
  const totalWeightKg = useMemo(() => calculateCartTotalWeightKg(cart), [cart]);
  const isOverweightForExpress = totalWeightKg > TURKO_MAX_EXPRESS_WEIGHT_KG;

  useEffect(() => {
    if (isOverweightForExpress && deliveryType !== 'camion') {
      setDeliveryType('camion');
    }
  }, [isOverweightForExpress, deliveryType]);

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
  const [pendingApprovalTx, setPendingApprovalTx] = useState<TurkoTransaction | null>(null);
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
    // Regla Matemática: Los precios ya incluyen IVA 19%. IVA Informativo = Subtotal con descuento / 1.19 * 0.19
    const tax = Math.round((discountedSubtotal / 1.19) * 0.19);
    const platformFee = Math.round(discountedSubtotal * 0.10);
    const effectiveDeliveryFee = appliedCoupon?.isFreeShipping
      ? 0
      : (shippingMethod === 'Domicilio' ? deliveryFee : 0);
    // Total a Pagar = Subtotal con descuento + Costo de Envío + Tarifa de Uso de Plataforma 10%
    const total = discountedSubtotal + effectiveDeliveryFee + platformFee;

    return {
      subtotal: Math.round(rawSubtotal),
      discountAmount: Math.round(discountAmount),
      discountedSubtotal: Math.round(discountedSubtotal),
      tax: Math.round(tax),
      platformFee: Math.round(platformFee),
      deliveryFee: Math.round(effectiveDeliveryFee),
      total: Math.round(total)
    };
  }, [cart, shippingMethod, deliveryFee, appliedCoupon]);

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
        deliveryType: shippingMethod === 'Domicilio' ? (isOverweightForExpress ? 'camion' : deliveryType) : undefined,
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

      let deliveryRes: any = null;
      const isRutasActive = isModuleActive('rutasCamion', config);
      const isExpresDelivery = shippingMethod === 'Domicilio' && (!isRutasActive || deliveryType === 'expres');

      if (isExpresDelivery) {
        try {
          deliveryRes = await crearOrdenDelivery({
            pedidoId: txId,
            clienteNombre: customerName.trim() || 'Cliente General',
            clienteTelefono: customerPhone.trim() || '+56900000000',
            destinoDireccion: deliveryAddress.trim(),
            destinoComuna: selectedComuna,
            montoTotal: calculated.total,
            costoEnvio: calculated.deliveryFee,
            notas: notes.trim(),
            items: cart.map(c => ({ name: c.product.name, qty: c.quantity, price: c.price })),
            comercioNombre: config.name || 'DONDE EL TURCO',
            comercioTelefono: config.whatsapp || ''
          });
        } catch (err) {
          console.warn('Error creating delivery in TurkoStore:', err);
        }
      }

      // Generate fallback tracking url for instant sandbox tracking if needed
      const trackingUrl = deliveryRes?.tracking_url || (isExpresDelivery ? `https://delivery-sandbox.pedidos.cl/track/${txId}` : undefined);

      const fullTx: TurkoTransaction = {
        ...newTx,
        id: txId,
        deliveryId: deliveryRes?.delivery_id || (isExpresDelivery ? `DLV-${Date.now().toString().slice(-6)}` : undefined),
        trackingUrl
      };

      // Save locally under turko namespace
      try {
        const storedTxs: TurkoTransaction[] = JSON.parse(localStorage.getItem(TURKO_TRANSACTIONS_KEY) || '[]');
        storedTxs.unshift(fullTx);
        safeLocalStorageSetItem(TURKO_TRANSACTIONS_KEY, JSON.stringify(storedTxs.slice(0, 50)));
      } catch {}

      // Delivery type labelling & route programming
      const shippingLabel = shippingMethod === 'Domicilio'
        ? (isRutasActive && deliveryType === 'camion' ? 'Flete Logístico Programado (Ruta Camión) 🚚' : 'Envío Inmediato / Exprés (Uber/Rappi) 🚀')
        : 'Retiro en Local ($0) 🏬';

      let progEntregaLine = '';
      if (shippingMethod === 'Domicilio' && isRutasActive && deliveryType === 'camion') {
        const sector = getSectorForComunaTurko(selectedComuna, config?.rutasCamion);
        if (sector) {
          progEntregaLine = `👉 PROGRAMACIÓN ENTREGA: Sector ${sector.name} — Próxima Ruta (${sector.days.join(', ')})\n`;
        }
      }

      // For digital payment gateways (Mercado Pago / Webpay Sandbox), show intermediate approval modal first
      if (paymentMethod === 'Mercado Pago' || paymentMethod === 'MercadoPago' || paymentMethod === 'Webpay') {
        setPendingApprovalTx(fullTx);
      } else {
        setActiveTicket(fullTx);
      }
      clearCart();
    } catch (err) {
      console.error('Error in executeCheckout:', err);
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [cart, shippingMethod, deliveryType, deliveryFee, config, paymentMethod, customerName, customerPhone, deliveryAddress, notes, selectedComuna, onSaveTransactionExternal, clearCart, totals, appliedCoupon]);

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
    deliveryType,
    setDeliveryType,
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
    totalWeightKg,
    isOverweightForExpress,
    activeTicket,
    setActiveTicket,
    pendingApprovalTx,
    setPendingApprovalTx,
    isProcessingCheckout,
    executeCheckout
  };
}
