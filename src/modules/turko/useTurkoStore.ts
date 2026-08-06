import { useState, useEffect, useMemo, useCallback } from 'react';
import { TurkoProduct, TurkoCartItem, TurkoTransaction } from './types';
import { BusinessConfig } from '../../types';
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

  // Calculated Totals
  const totals = useMemo(() => {
    return calculateTurkoTotals(cart, shippingMethod, deliveryFee, config.ivaPercentage || 15);
  }, [cart, shippingMethod, deliveryFee, config.ivaPercentage]);

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
  }, []);

  // Checkout Execution
  const executeCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);

    try {
      const calculated = calculateTurkoTotals(cart, shippingMethod, deliveryFee, config.ivaPercentage || 15);

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
        paymentStatus: paymentMethod === 'Efectivo' ? 'Pendiente' : 'Aprobado',
        source: 'digital',
        origen: 'digital'
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
        localStorage.setItem(TURKO_TRANSACTIONS_KEY, JSON.stringify(storedTxs));
      } catch {}

      // Open WhatsApp
      const encodedMsg = generateTurkoWhatsAppMessage(fullTx, config);
      const cleanPhone = (config.whatsapp || '+56912345678').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');

      // Set Active Ticket Modal & Clear Cart
      setActiveTicket(fullTx);
      clearCart();
    } catch (err) {
      console.error('Error in executeCheckout:', err);
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [cart, shippingMethod, deliveryFee, config, paymentMethod, customerName, customerPhone, deliveryAddress, notes, selectedComuna, onSaveTransactionExternal, clearCart]);

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
    totals,
    activeTicket,
    setActiveTicket,
    isProcessingCheckout,
    executeCheckout
  };
}
