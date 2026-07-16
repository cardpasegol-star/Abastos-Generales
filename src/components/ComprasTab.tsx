import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Send, Trash2, X, ShoppingBag, Check, Utensils, Sparkles, Printer, Download, Share2, CreditCard, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Product, FoodItem, BusinessConfig, Transaction } from '../types';
import { jsPDF } from 'jspdf';

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  'Todos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Todo': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png',
  'Bebidas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png',
  'Abarrotes': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Bags.png',
  'Lácteos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Milk%20Carton.png',
  'Snacks': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Potato%20Chips.png',
  'Almuerzos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cooking.png',
  'Sopas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Steaming%20Bowl.png',
  'Postres': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png',
};

function getCategoryIcon(cat: string, config?: BusinessConfig): string {
  if (cat === 'Todos' || cat === 'Todo') return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Shopping%20Cart.png';
  return config?.categoryIcons?.[cat] || DEFAULT_CATEGORY_ICONS[cat] || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Cardboard%20Box.png';
}

function renderCategoryIcon(cat: string, config?: BusinessConfig, sizeClass: string = "w-5 h-5 object-contain inline-block") {
  return <CategoryIcon cat={cat} config={config} sizeClass={sizeClass} />;
}

function CategoryIcon({ cat, config, sizeClass = "w-5 h-5 object-contain inline-block" }: { cat: string; config?: BusinessConfig; sizeClass?: string }) {
  const [hasError, setHasError] = useState(false);

  const getFallbackEmoji = (category: string): string => {
    const lower = category.toLowerCase();
    if (lower.includes('bebida')) return '🥤';
    if (lower.includes('almuerzo') || lower.includes('cocina') || lower.includes('comida') || lower.includes('hamburguesa') || lower.includes('sándwich')) return '🍔';
    if (lower.includes('sopa') || lower.includes('ramen')) return '🍲';
    if (lower.includes('postre') || lower.includes('dulce') || lower.includes('torta') || lower.includes('pastel') || lower.includes('shortcake')) return '🍰';
    if (lower.includes('lácteo') || lower.includes('leche') || lower.includes('queso')) return '🥛';
    if (lower.includes('snack') || lower.includes('papas') || lower.includes('papas fritas')) return '🍿';
    if (lower.includes('abarrote') || lower.includes('limpieza') || lower.includes('jabón')) return '🧴';
    if (lower.includes('pan') || lower.includes('medialuna') || lower.includes('factura') || lower.includes('croissant')) return '🍞';
    if (lower.includes('sushi')) return '🍣';
    if (lower.includes('fruta') || lower.includes('manzana')) return '🍎';
    if (lower.includes('verdura') || lower.includes('brócoli')) return '🥦';
    if (lower.includes('carne') || lower.includes('corte')) return '🥩';
    if (lower.includes('todos') || lower.includes('todo') || lower.includes('carrito')) return '🛒';
    
    // Expanded ones
    if (lower.includes('farmacia') || lower.includes('salud') || lower.includes('píldora') || lower.includes('medicamento')) return '💊';
    if (lower.includes('champaña') || lower.includes('vino') || lower.includes('licor') || lower.includes('botillería')) return '🍷';
    if (lower.includes('computador') || lower.includes('laptop') || lower.includes('tecnología')) return '💻';
    if (lower.includes('celular') || lower.includes('teléfono')) return '📱';
    if (lower.includes('balón') || lower.includes('fútbol') || lower.includes('deporte')) return '⚽';
    if (lower.includes('mancuerna') || lower.includes('gimnasio') || lower.includes('fitness')) return '🏋️';
    if (lower.includes('tocino') || lower.includes('fiambrería') || lower.includes('cecina')) return '🥓';
    if (lower.includes('conserva') || lower.includes('enlatado')) return '🥫';
    if (lower.includes('pescado') || lower.includes('pescadería')) return '🐟';
    if (lower.includes('camarón') || lower.includes('marisco') || lower.includes('marisquería')) return '🍤';
    if (lower.includes('condimento') || lower.includes('especias') || lower.includes('hierbas')) return '🌿';
    if (lower.includes('caliente') || lower.includes('olla')) return '🍲';
    if (lower.includes('escoba') || lower.includes('aseo')) return '🧹';
    if (lower.includes('cupcake')) return '🧁';
    if (lower.includes('cosmética') || lower.includes('belleza') || lower.includes('labial')) return '💄';
    if (lower.includes('perfumería') || lower.includes('perfume') || lower.includes('loción')) return '🧴';
    if (lower.includes('mochila') || lower.includes('útiles')) return '🎒';
    if (lower.includes('lápiz') || lower.includes('pencil')) return '✏️';
    if (lower.includes('oso') || lower.includes('juguete') || lower.includes('peluche')) return '🧸';
    if (lower.includes('rompecabezas') || lower.includes('puzzle')) return '🧩';
    if (lower.includes('dado') || lower.includes('azar') || lower.includes('juego')) return '🎲';
    if (lower.includes('caramelo') || lower.includes('dulce') || lower.includes('candy')) return '🍬';
    if (lower.includes('chocolate')) return '🍫';
    if (lower.includes('baguette')) return '🥖';
    if (lower.includes('congelado') || lower.includes('hielo')) return '🧊';
    if (lower.includes('mascota') || lower.includes('huella')) return '🐾';
    if (lower.includes('ferretería') || lower.includes('llave') || lower.includes('herramienta')) return '🔧';
    if (lower.includes('ropa') || lower.includes('polera') || lower.includes('vestuario')) return '👕';
    if (lower.includes('hogar') || lower.includes('casa')) return '🏠';
    return '📦';
  };

  const icon = getCategoryIcon(cat, config);

  if (icon && icon.startsWith('http') && !hasError) {
    return (
      <img
        src={icon}
        className={sizeClass}
        alt={cat}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }

  return <span className="select-none">{icon && icon.startsWith('http') ? getFallbackEmoji(cat) : (icon || '📦')}</span>;
}

const RM_COMUNAS = [
  "La Florida",
  "La Pintana",
  "Puente Alto",
  "San Ramón",
  "La Granja",
  "Macul",
  "Peñalolén",
  "San Joaquín",
  "Santiago Centro",
  "Las Condes",
  "Providencia",
  "Ñuñoa",
  "Maipú",
  "San Bernardo",
  "Pudahuel",
  "Quilicura",
  "Recoleta",
  "Estación Central",
  "San Miguel",
  "Pedro Aguirre Cerda",
  "Cerrillos",
  "Lo Espejo",
  "El Bosque",
  "La Cisterna",
  "Independencia",
  "Quinta Normal",
  "Renca",
  "Cerro Navia",
  "Lo Prado",
  "Conchalí",
  "Huechuraba",
  "Vitacura",
  "Lo Barnechea"
];

function getStoreOriginComuna(): string {
  try {
    const activeTenant = localStorage.getItem('tenant_tienda_id') || '';
    if (activeTenant.includes('turco')) return 'La Pintana';
    if (activeTenant.includes('buencorte')) return 'La Florida';
    if (activeTenant.includes('barrioseguro')) return 'Santiago Centro';
  } catch (e) {
    console.error(e);
  }
  return 'La Florida';
}

function getDeliveryFeeForComuna(targetComuna: string, originComuna: string): number {
  const targetNorm = targetComuna.trim().toLowerCase();
  const originNorm = originComuna.trim().toLowerCase();
  
  if (targetNorm === originNorm) {
    return 3000;
  }
  
  // Aledañas/vecinas mapping based on origin
  const vecinasMap: Record<string, string[]> = {
    "la florida": ["la pintana", "puente alto", "san ramón", "san ramon", "macul", "peñalolén", "peñalolen", "san joaquín", "san joaquin", "la granja", "ñuñoa", "nunoa", "providencia", "las condes"],
    "la pintana": ["la florida", "puente alto", "san ramón", "san ramon", "la granja", "el bosque", "san bernardo"],
    "santiago centro": ["providencia", "ñuñoa", "nunoa", "recoleta", "independencia", "quinta normal", "estación central", "estacion central", "san miguel", "san joaquín", "san joaquin", "pedro aguirre cerda", "macul"]
  };
  
  const vecinas = vecinasMap[originNorm] || vecinasMap["la florida"];
  if (vecinas.includes(targetNorm)) {
    return 4500;
  }
  
  return 7000;
}

function getStoreCoordinates(): { lat: number; lon: number } {
  try {
    const activeTenant = localStorage.getItem('tenant_tienda_id') || '';
    if (activeTenant.includes('turco')) return { lat: -33.5857, lon: -70.6276 };
    if (activeTenant.includes('buencorte')) return { lat: -33.5226, lon: -70.5987 };
    if (activeTenant.includes('barrioseguro')) return { lat: -33.4489, lon: -70.6693 };
  } catch (e) {
    console.error(e);
  }
  return { lat: -33.5226, lon: -70.5987 };
}

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

interface ComprasTabProps {
  products: Product[];
  foodItems?: FoodItem[];
  config: BusinessConfig;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<string>;
  onUpdateProductStock: (id: string, newStock: number) => Promise<void>;
  onUpdateFoodItemStock?: (id: string, newStock: number) => Promise<void>;
  onBackToMarketplace?: () => void;
}

interface CartItem {
  id: string; // product ID or foodItem ID
  type: 'product' | 'meal';
  product?: Product;
  foodItem?: FoodItem;
  quantity: number;
}

export default function ComprasTab({ products, foodItems = [], config, onAddTransaction, onUpdateProductStock, onUpdateFoodItemStock, onBackToMarketplace }: ComprasTabProps) {
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
  
  // Shipping Form fields
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [comuna, setComuna] = useState(() => localStorage.getItem('cliente_comuna') || 'La Florida');
  const [paymentMethod, setPaymentMethod] = useState<'MercadoPago' | 'Efectivo'>('MercadoPago');

  // Document selection states
  const [documentType, setDocumentType] = useState<'Boleta' | 'Factura'>('Boleta');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [giroComercial, setGiroComercial] = useState('');
  const [direccionTributaria, setDireccionTributaria] = useState('');

  // Mercado Pago simulation states
  const [showMpSimulator, setShowMpSimulator] = useState(false);
  const [mpCardNumber, setMpCardNumber] = useState('');
  const [mpCardName, setMpCardName] = useState('');
  const [mpCardExpiry, setMpCardExpiry] = useState('');
  const [mpCardCvc, setMpCardCvc] = useState('');
  const [mpProcessingState, setMpProcessingState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [mpProcessingText, setMpProcessingText] = useState('');

  // SII Billing simulation states
  const [siiProcessing, setSiiProcessing] = useState(false);
  const [siiMessage, setSiiMessage] = useState('');

  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delivery quote states
  const [isQuotingDelivery, setIsQuotingDelivery] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Geolocation & Delivery Corto states
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null); // in meters
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isManualShortDistance, setIsManualShortDistance] = useState(false);

  const handleUseMyGps = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no está soportada por tu navegador.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const clientLat = position.coords.latitude;
        const clientLon = position.coords.longitude;
        setGpsLatitude(clientLat);
        setGpsLongitude(clientLon);

        const storeCoords = getStoreCoordinates();
        const distanceM = getDistanceInMeters(storeCoords.lat, storeCoords.lon, clientLat, clientLon);
        setGpsDistance(distanceM);
        setIsLocating(false);

        setStreet(`📍 Ubicación GPS (${clientLat.toFixed(5)}, ${clientLon.toFixed(5)})`);
        setNumber('S/N');
        
        const storeComuna = getStoreOriginComuna();
        setComuna(storeComuna);

        // Validation rule: If distance <= 500 meters, automatically enable short distance delivery and check it.
        if (distanceM <= 500) {
          setIsManualShortDistance(true);
        } else {
          setIsManualShortDistance(false);
        }
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        setGpsError('No pudimos acceder a tu ubicación o denegaste el permiso de GPS. Calculando según comuna elegida.');
        setGpsDistance(null);
        setIsManualShortDistance(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (shippingMethod === 'Domicilio') {
      setIsQuotingDelivery(true);
      const timer = setTimeout(() => {
        setIsQuotingDelivery(false);
        
        // Priority 1: Short Distance by GPS ONLY. Must be <= 500m AND checked.
        if (gpsDistance !== null && gpsDistance <= 500 && isManualShortDistance) {
          setDeliveryFee(1000);
          return;
        }
        
        // Priority 2: Fallback to Comuna
        if (street.trim() && comuna) {
          const fee = getDeliveryFeeForComuna(comuna, getStoreOriginComuna());
          setDeliveryFee(fee);
        } else {
          setDeliveryFee(0);
        }
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setDeliveryFee(0);
      setIsQuotingDelivery(false);
    }
  }, [shippingMethod, street, comuna, isManualShortDistance, gpsDistance]);

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
    const liveDish = foodItems.find(f => f.id === dish.id) || dish;
    const stockLimit = liveDish.stock ?? 0;
    const existing = cart.find(item => item.id === dish.id && item.type === 'meal');
    if (existing) {
      if (existing.quantity >= stockLimit) {
        alert(`Lo sentimos, solo quedan ${stockLimit} porciones disponibles de este plato.`);
        return;
      }
      setCart(
        cart.map(item =>
          item.id === dish.id && item.type === 'meal'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (stockLimit <= 0) {
        alert(`Lo sentimos, este plato está agotado.`);
        return;
      }
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
      if (type === 'meal' && amount > 0) {
        const liveDish = foodItems.find(f => f.id === id) || item.foodItem;
        const stockLimit = liveDish?.stock ?? 0;
        if (newQty > stockLimit) {
          alert(`Lo sentimos, solo quedan ${stockLimit} porciones disponibles de este plato.`);
          return;
        }
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
    const liveProduct = item.type === 'product' ? products.find(p => p.id === item.id) : null;
    const liveFoodItem = item.type === 'meal' ? foodItems.find(f => f.id === item.id) : null;
    const price = item.type === 'product'
      ? (liveProduct?.price ?? item.product?.price ?? 0)
      : (liveFoodItem?.price ?? item.foodItem?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);
  const taxVal = subtotalVal * (ivaPercentage / 100);
  const totalCartCost = subtotalVal + taxVal + (shippingMethod === 'Domicilio' ? deliveryFee : 0);

  // PDF Ticket Downloader for Clients
  const downloadReceiptPDF = (tx: Transaction) => {
    const paddingBottom = 25;
    const headerHeight = 55;
    const itemsHeight = tx.items.length * 7;
    const totalsHeight = tx.shippingMethod === 'Domicilio' ? 42 : 30;
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
    doc.text('TIPO OPERACION: VENTA (PEDIDO ON)', 5, currentY);
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
    doc.text('SUBTOTAL:', 35, currentY);
    doc.text(`$${tx.subtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 3.5;

    const calculatedIvaRate = tx.subtotal > 0 ? Math.round((tx.tax / tx.subtotal) * 100) : (config?.ivaPercentage !== undefined ? config.ivaPercentage : 15);
    doc.text(`IVA (${calculatedIvaRate}%):`, 35, currentY);
    doc.text(`$${tx.tax.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 4.5;

    if (tx.shippingMethod === 'Domicilio' && tx.deliveryFee) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('ENVIO (DELIVERY)', 35, currentY);
      doc.text(`$${tx.deliveryFee.toFixed(2)}`, 75, currentY, { align: 'right' });
      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`DESPACHO: ${tx.deliveryAddress || ''}, ${tx.deliveryComuna || ''}`, 5, currentY);
      currentY += 4.5;
    } else {
      currentY += 1;
    }

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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length > 0) return parts.join(' ');
    return v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
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

    if (!customerPhone.trim()) {
      setValidationError('Por favor, ingresa un número de teléfono de contacto.');
      return;
    }

    if (shippingMethod === 'Domicilio') {
      if (!street.trim()) {
        setValidationError('Por favor, ingresa la calle para el despacho.');
        return;
      }
      if (!number.trim()) {
        setValidationError('Por favor, ingresa el número de la calle.');
        return;
      }
      if (!comuna.trim()) {
        setValidationError('Por favor, ingresa la comuna.');
        return;
      }
      if (isQuotingDelivery) {
        setValidationError('Por favor, espera a que finalice la cotización de despacho.');
        return;
      }
    }

    if (documentType === 'Factura') {
      if (!rutEmpresa.trim()) {
        setValidationError('Por favor, ingresa el RUT de la empresa para la factura.');
        return;
      }
      if (!razonSocial.trim()) {
        setValidationError('Por favor, ingresa la Razón Social de la empresa.');
        return;
      }
      if (!giroComercial.trim()) {
        setValidationError('Por favor, ingresa el Giro Comercial.');
        return;
      }
      if (!direccionTributaria.trim()) {
        setValidationError('Por favor, ingresa la Dirección Tributaria.');
        return;
      }
    }

    // Determine gateway trigger
    if (paymentMethod === 'MercadoPago') {
      setMpCardNumber('4509 1234 5678 9012');
      setMpCardName(customerName.toUpperCase());
      setMpCardExpiry('12/29');
      setMpCardCvc('123');
      setMpProcessingState('processing');
      setMpProcessingText('Conectando con Mercado Pago Sandbox...');
      setShowMpSimulator(true);

      // Automated sandbox progression
      setTimeout(() => {
        setMpProcessingState('success');
      }, 1500);
    } else {
      // Direct Cash checkout
      handleExecuteAddTransaction('Efectivo');
    }
  };

  const enviarDatosAlSII = async (datosCheckout: {
    tipoDocumento: 'Boleta' | 'Factura';
    rutEmpresa?: string;
    razonSocial?: string;
    giroComercial?: string;
    direccionTributaria?: string;
    total: number;
    items: { productId: string; name: string; qty: number; price: number }[];
  }): Promise<string> => {
    const tipoDte = datosCheckout.tipoDocumento === 'Factura' ? 33 : 39;
    
    const jsonTributario = {
      tipo_dte: tipoDte,
      fecha_emision: new Date().toISOString().split('T')[0],
      emisor: {
        rut: "76.452.120-K",
        razon_social: config.name || "Donde el Goyo",
        giro: "Almacén y Cocina de Comidas Rápidas"
      },
      receptor: datosCheckout.tipoDocumento === 'Factura' ? {
        rut: datosCheckout.rutEmpresa,
        razon_social: datosCheckout.razonSocial,
        giro: datosCheckout.giroComercial,
        direccion: datosCheckout.direccionTributaria
      } : {
        rut: "66.666.666-6",
        razon_social: "Receptor Final"
      },
      totales: {
        total: datosCheckout.total,
        neto: Math.round(datosCheckout.total / 1.19),
        iva: Math.round(datosCheckout.total - (datosCheckout.total / 1.19))
      },
      detalles: datosCheckout.items.map((item, index) => ({
        linea: index + 1,
        nombre: item.name,
        cantidad: item.qty,
        precio_unitario: item.price,
        subtotal: item.qty * item.price
      }))
    };

    console.log("=== ENVIANDO JSON TRIBUTARIO AL SII ===");
    console.log(JSON.stringify(jsonTributario, null, 2));

    setSiiProcessing(true);
    setSiiMessage("Generando documento electrónico autorizado por el SII...");

    // Simulated network call with a 1.5s delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSiiProcessing(false);
    setSiiMessage("");

    return `https://www.sii.cl/facturacion_electronica/ejemplo_dte_${tipoDte}.pdf`;
  };

  const handleExecuteAddTransaction = async (finalMethod: 'Efectivo' | 'Tarjeta') => {
    setIsCheckingOut(true);
    setValidationError(null);

    try {
      const txItems = cart.map(item => {
        const productId = item.id;
        const liveProduct = item.type === 'product' ? products.find(p => p.id === item.id) : null;
        const liveFoodItem = item.type === 'meal' ? foodItems.find(f => f.id === item.id) : null;
        const name = item.type === 'product'
          ? (liveProduct?.name || item.product?.name || '')
          : (liveFoodItem?.name || item.foodItem?.name || '');
        const price = item.type === 'product'
          ? (liveProduct?.price ?? item.product?.price ?? 0)
          : (liveFoodItem?.price ?? item.foodItem?.price ?? 0);
        return {
          productId,
          name,
          qty: item.quantity,
          price
        };
      });

      let simulatedPdfUrl = '';
      if (finalMethod === 'Tarjeta' && config?.siiEnabled) {
        simulatedPdfUrl = await enviarDatosAlSII({
          tipoDocumento: documentType,
          rutEmpresa,
          razonSocial,
          giroComercial,
          direccionTributaria,
          total: totalCartCost,
          items: txItems
        });
      }

      const transactionPayload: Omit<Transaction, 'id'> = {
        type: 'Venta',
        items: txItems,
        subtotal: parseFloat(subtotalVal.toFixed(2)),
        tax: parseFloat(taxVal.toFixed(2)),
        total: parseFloat(totalCartCost.toFixed(2)),
        method: finalMethod,
        createdAt: new Date().toISOString(),
        documentType,
        ...(documentType === 'Factura' ? {
          rutEmpresa: rutEmpresa.trim(),
          razonSocial: razonSocial.trim(),
          giroComercial: giroComercial.trim(),
          direccionTributaria: direccionTributaria.trim(),
        } : {}),
        siiPdfUrl: simulatedPdfUrl || undefined,
        shippingMethod,
        ...(shippingMethod === 'Domicilio' ? {
          deliveryAddress: `${street.trim()} # ${number.trim()}`,
          deliveryComuna: comuna,
          deliveryFee: deliveryFee
        } : {})
      };


      // 1. Save transaction to Firestore with fallback for testing sandbox
      let txId = 'tx-simulado-' + Math.floor(Math.random() * 1000000);
      try {
        txId = await onAddTransaction(transactionPayload);

        // 2. Adjust inventories stocks sequentially
        const inventarioMap = new Map(products.map(p => [p.id, p]));
        const foodMap = new Map(foodItems.map(f => [f.id, f]));

        for (const item of cart) {
          if (item.type === 'product' && shippingMethod !== 'Domicilio') {
            const prodId = item.product?.id || item.id;
            const targetProduct = inventarioMap.get(prodId);
            if (targetProduct) {
              const cantidadVendida = Number(item.quantity) || 0;
              const stockActual = Math.max(0, Number(targetProduct.stock) - cantidadVendida);
              await onUpdateProductStock(targetProduct.id, stockActual);
            }
          } else if (item.type === 'meal') {
            const mealId = item.foodItem?.id || item.id;
            const targetMeal = foodMap.get(mealId);
            if (targetMeal) {
              const cantidadVendida = Number(item.quantity) || 0;
              const stockActual = Math.max(0, (targetMeal.stock ?? 0) - cantidadVendida);
              if (onUpdateFoodItemStock) {
                await onUpdateFoodItemStock(targetMeal.id, stockActual);
              }
            }
          }
        }
      } catch (dbError) {
        console.warn("DB operation failed or offline in sandbox environment, bypassing safely...", dbError);
      }

      const txObj = {
        id: txId,
        ...transactionPayload
      };

      // 3. Keep standard transaction representation for displaying physical-grade ticket overlay on-screen
      setSuccessTx(txObj);

      // Save to "Pedidos Pendientes" in LocalStorage if it is delivery
      if (shippingMethod === 'Domicilio') {
        try {
          const existing = localStorage.getItem('pedidos_pendientes');
          const list = existing ? JSON.parse(existing) : [];
          const orderItems = cart.map(item => {
            const liveProduct = item.type === 'product' ? products.find(p => p.id === item.id) : null;
            const liveFoodItem = item.type === 'meal' ? foodItems.find(f => f.id === item.id) : null;
            const name = item.type === 'product'
              ? (liveProduct?.name || item.product?.name || '')
              : (liveFoodItem?.name || item.foodItem?.name || '');
            const price = item.type === 'product'
              ? (liveProduct?.price ?? item.product?.price ?? 0)
              : (liveFoodItem?.price ?? item.foodItem?.price ?? 0);
            return {
              productId: item.id,
              name,
              qty: item.quantity,
              price,
              type: item.type
            };
          });

          list.push({
            id: txId,
            items: orderItems,
            subtotal: parseFloat(subtotalVal.toFixed(2)),
            tax: parseFloat(taxVal.toFixed(2)),
            total: parseFloat(totalCartCost.toFixed(2)),
            createdAt: new Date().toISOString(),
            deliveryAddress: `${street.trim()} # ${number.trim()}`,
            deliveryComuna: comuna,
            deliveryFee: deliveryFee,
            status: 'pending',
            comercioAsociado: config?.name || 'Donde el Goyo'
          });
          localStorage.setItem('pedidos_pendientes', JSON.stringify(list));
        } catch (e) {
          console.error("Error saving pending order to LocalStorage:", e);
        }
      }

      // 4. Generate beautiful structured WhatsApp Message
      const cartProducts = cart.filter(item => item.type === 'product');
      const cartMeals = cart.filter(item => item.type === 'meal');

      let msg = '';
      if (finalMethod === 'Tarjeta') {
        const docText = documentType === 'Factura' ? 'Factura' : 'Boleta';
        const docUrl = simulatedPdfUrl || `https://www.sii.cl/facturacion_electronica/ejemplo_dte_${documentType === 'Factura' ? 33 : 39}.pdf`;
        
        if (shippingMethod === 'Domicilio') {
          msg = `¡Hola! Nuevo pedido pagado. Método: Delivery. Dirección de entrega: ${street.trim()} # ${number.trim()}, ${comuna}. Total con envío: $${totalCartCost.toFixed(2)}. Ver documento emitido aquí: ${docUrl}\n\n`;
        } else {
          msg = `¡Hola! Nuevo pedido pagado. Método: Retiro en Local. Total: $${totalCartCost.toFixed(2)}. Ver documento emitido aquí: ${docUrl}\n\n`;
        }
        
        msg += `📦 *DETALLE DE PRODUCTOS:* \n`;
        cart.forEach((item) => {
          const liveProduct = item.type === 'product' ? products.find(p => p.id === item.id) : null;
          const liveFoodItem = item.type === 'meal' ? foodItems.find(f => f.id === item.id) : null;
          const name = item.type === 'product'
            ? (liveProduct?.name || item.product?.name || '')
            : (liveFoodItem?.name || item.foodItem?.name || '');
          const price = item.type === 'product'
            ? (liveProduct?.price ?? item.product?.price ?? 0)
            : (liveFoodItem?.price ?? item.foodItem?.price ?? 0);
          msg += `• *${item.quantity}x* _${name}_ | Precio c/u: $${price.toFixed(2)}\n`;
        });
        
        if (shippingMethod === 'Domicilio') {
          msg += `🚚 *Costo de Envío (Delivery):* $${deliveryFee.toFixed(2)}\n`;
        }
        
        msg += `\n_¡Muchas gracias! Comprobante emitido y venta confirmada._`;
      } else {
        msg += `📝 *NUEVO PEDIDO CON PAGO EN EFECTIVO* 🏪\n`;
        msg += `*${config.name || 'Donde el Goyo'}*\n`;
        msg += `====================================\n\n`;
        msg += `👤 *Cliente:* ${customerName.trim()}\n`;
        msg += `📞 *Teléfono:* ${customerPhone.trim()}\n`;
        msg += `🚚 *Método de Entrega:* ${shippingMethod === 'Domicilio' ? 'A Domicilio 🚀' : 'Retiro en Tienda 🏬'}\n`;
        
        if (shippingMethod === 'Domicilio') {
          msg += `📍 *Dirección de Despacho:* ${street.trim()} # ${number.trim()}, ${comuna}\n`;
        } else {
          msg += `📍 *Dirección de Retiro:* Retiro en local\n`;
        }
        
        msg += `💳 *Método de Pago:* Pago contra Entrega (Efectivo)\n`;
        msg += `🟢 *Estado de Transacción:* Pendiente de Pago al recibir\n`;

        if (documentType === 'Factura') {
          msg += `📄 *Documento solicitado:* Factura (RUT: ${rutEmpresa.trim()})\n`;
          msg += `   *Razón Social:* ${razonSocial.trim()}\n`;
          msg += `   *Giro:* ${giroComercial.trim()}\n`;
          msg += `   *Dirección Tributaria:* ${direccionTributaria.trim()}\n`;
        } else {
          msg += `📄 *Documento solicitado:* Boleta\n`;
        }

        msg += `🔐 *ID Transacción:* #${txId.toUpperCase()}\n`;
        
        if (notes.trim()) {
          msg += `📝 *Notas:* ${notes.trim()}\n`;
        }

        // section 1: Kitchen meals
        if (cartMeals.length > 0) {
          msg += `\n🍲 *DETALLE DE COMIDAS (La Cocina):*\n`;
          msg += `------------------------------------\n`;
          cartMeals.forEach((item) => {
            const liveFoodItem = foodItems.find(f => f.id === item.id) || item.foodItem;
            if (!liveFoodItem) return;
            const itemSubtotal = liveFoodItem.price * item.quantity;
            msg += `• *${item.quantity}x* _${liveFoodItem.name}_\n`;
            msg += `  Precio cu: $${liveFoodItem.price.toFixed(2)} | Sub: $${itemSubtotal.toFixed(2)}\n`;
          });
          msg += `------------------------------------\n`;
        }

        // section 2: Grocery store products
        if (cartProducts.length > 0) {
          msg += `\n📦 *DETALLE DE PRODUCTOS DE TIENDA:*\n`;
          msg += `------------------------------------\n`;
          cartProducts.forEach((item) => {
            const liveProduct = products.find(p => p.id === item.id) || item.product;
            if (!liveProduct) return;
            const itemSubtotal = liveProduct.price * item.quantity;
            msg += `• *${item.quantity}x* _${liveProduct.name}_\n`;
            msg += `  Precio cu: $${liveProduct.price.toFixed(2)} | Sub: $${itemSubtotal.toFixed(2)}\n`;
          });
          msg += `------------------------------------\n`;
        }

        msg += `\n💵 *RESUMEN DE PAGO:*\n`;
        msg += `• Subtotal: $${subtotalVal.toFixed(2)}\n`;
        msg += `• IVA (${ivaPercentage}%): $${taxVal.toFixed(2)}\n`;
        msg += `• *TOTAL COMPLETO A PAGAR: $${totalCartCost.toFixed(2)}*\n\n`;
        if (simulatedPdfUrl) {
          msg += `📥 *Descargar Comprobante SII:* ${simulatedPdfUrl}\n\n`;
        }
        msg += `_¡Muchas gracias! Pedido generado desde el catálogo digital._`;
      }

      const rawPhone = config.whatsapp || '+5491112345678';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, ''); // Numbers only
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      
      setWaUrl(url);
      setWaMsgText(msg);
      setCheckoutStep('ready');
    } catch (err) {
      console.error(err);
      setValidationError('Ocurrió un error al registrar el ticket de compra y actualizar inventarios.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSendWhatsAppAndClear = () => {
    window.open(waUrl, '_blank');
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setStreet('');
    setNumber('');
    setComuna('La Florida');
    setNotes('');
    setDocumentType('Boleta');
    setRutEmpresa('');
    setRazonSocial('');
    setGiroComercial('');
    setDireccionTributaria('');
    setCheckoutStep('form');
    setShowCartModal(false);
  };

  return (
    <div id="compras-container" className="space-y-6 pb-36 animate-in fade-in duration-300">
      {onBackToMarketplace && (
        <button
          onClick={onBackToMarketplace}
          className="group flex items-center gap-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-800 hover:from-indigo-500 hover:to-blue-700 px-5 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.03] active:scale-95 border border-indigo-500/35 transition-all duration-300 ease-out cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3] transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Volver al Marketplace</span>
        </button>
      )}
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
                <span className="inline-flex items-center gap-1.5">
                  {renderCategoryIcon(cat, config)}
                  <span>{cat}</span>
                </span>
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
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                      {renderCategoryIcon(dish.category, config, "w-4 h-4 object-contain inline-block")}
                      <span>{dish.category}</span>
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

                    {/* Stock Indicator */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Porciones:</span>
                      <span className={`text-[10.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                        (dish.stock ?? 0) <= 0 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 font-bold' 
                          : (dish.stock ?? 0) <= 5 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse font-extrabold' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {(dish.stock ?? 0) <= 0 ? 'Agotado ❌' : `Platos disp: ${dish.stock ?? 0}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 font-sans">
                      <span className="text-xs text-slate-950 font-black flex items-center gap-1">La Cocina 🍲</span>

                      {inCart ? (
                        <div className="flex items-center bg-slate-100 border-2 border-slate-250 rounded-xl p-1 shadow-inner font-sans">
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
                            disabled={cartItem.quantity >= (dish.stock ?? 0)}
                            className={`p-1.5 bg-white rounded-lg shadow-3xs transition-all cursor-pointer ${
                              cartItem.quantity >= (dish.stock ?? 0) 
                                ? 'text-slate-350 opacity-40 cursor-not-allowed' 
                                : 'text-emerald-700 hover:bg-slate-100'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      ) : (dish.stock ?? 0) <= 0 ? (
                        <span className="bg-slate-100 border border-slate-200 text-slate-400 font-black text-xs px-5 py-2 rounded-xl select-none uppercase tracking-wider">
                          Agotado
                        </span>
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
                <span className="inline-flex items-center gap-1.5">
                  {renderCategoryIcon(cat, config)}
                  <span>{cat}</span>
                </span>
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
                    
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-black px-3.5 py-1 rounded-lg shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                      {renderCategoryIcon(p.category, config, "w-4 h-4 object-contain inline-block")}
                      <span>{p.category}</span>
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
                        const liveProduct = item.type === 'product' ? products.find(p => p.id === item.id) : null;
                        const liveFoodItem = item.type === 'meal' ? foodItems.find(f => f.id === item.id) : null;
                        
                        const name = item.type === 'product'
                          ? (liveProduct?.name || item.product?.name || '')
                          : (liveFoodItem?.name || item.foodItem?.name || '');
                        const img = item.type === 'product'
                          ? (liveProduct?.imageUrl || item.product?.imageUrl)
                          : (liveFoodItem?.imageUrl || item.foodItem?.imageUrl);
                        const price = item.type === 'product'
                          ? (liveProduct?.price ?? item.product?.price ?? 0)
                          : (liveFoodItem?.price ?? item.foodItem?.price ?? 0);
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
                      Datos de Despacho / Entrega
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
                            className={`py-3 px-2 rounded-2xl text-[11px] font-black border-2 transition-all cursor-pointer ${
                              shippingMethod === 'Retiro'
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Retiro en Local ($0)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShippingMethod('Domicilio')}
                            className={`py-3 px-2 rounded-2xl text-[11px] font-black border-2 transition-all cursor-pointer ${
                              shippingMethod === 'Domicilio'
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Envío a Domicilio (Simulador Delivery Sandbox)
                          </button>
                        </div>
                      </div>

                      {/* Unified form fields */}
                      {shippingMethod === 'Domicilio' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* GPS Button and Error feedback */}
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={handleUseMyGps}
                              disabled={isLocating}
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 active:bg-indigo-150 border-2 border-indigo-200 text-indigo-950 text-xs font-extrabold shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isLocating ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                                  <span>Obteniendo ubicación satelital...</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm">📍</span>
                                  <span>Usar mi ubicación actual</span>
                                </>
                              )}
                            </button>
                            {gpsError && (
                              <p className="text-[11px] font-semibold text-red-650 bg-red-50/50 border border-red-150 rounded-xl px-3 py-2">
                                ⚠️ {gpsError}
                              </p>
                            )}
                            {gpsDistance !== null && !isManualShortDistance && (
                              <p className="text-[11px] font-black text-indigo-950 bg-indigo-50/50 border border-indigo-150 rounded-xl px-3 py-2 flex items-center justify-between">
                                <span>Distancia aproximada al local:</span>
                                <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                                  {gpsDistance < 1000 ? `${gpsDistance.toFixed(0)}m` : `${(gpsDistance / 1000).toFixed(2)} km`}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                                Calle *
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. Av. Vicuña Mackenna"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                                Número *
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. 1234"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                                Comuna *
                            </label>
                            <select
                              value={comuna}
                              onChange={(e) => setComuna(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950 cursor-pointer"
                            >
                              {RM_COMUNAS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Manual Delivery Corto Selector */}
                          {gpsDistance !== null && gpsDistance <= 500 && (
                            <div className="bg-amber-50/60 border-2 border-amber-200 p-3.5 rounded-2xl flex items-start gap-3 transition-all duration-200 animate-in fade-in duration-200">
                              <input
                                id="delivery-corto-checkbox"
                                type="checkbox"
                                checked={isManualShortDistance}
                                onChange={(e) => setIsManualShortDistance(e.target.checked)}
                                className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                              <label htmlFor="delivery-corto-checkbox" className="text-xs font-bold text-amber-950 cursor-pointer leading-normal select-none">
                                <span className="block font-black text-[11px] uppercase tracking-wide text-amber-900 mb-0.5">🚀 Despacho de Corta Distancia</span>
                                ¡Verificado por GPS! Distancia al local de {gpsDistance.toFixed(0)} metros. Elegible para tarifa fija preferencial de $1.000 CLP.
                              </label>
                            </div>
                          )}

                          {/* Delivery Quotation Loader & Result */}
                          {isQuotingDelivery ? (
                            <div className="flex items-center gap-2.5 bg-blue-50 border-2 border-blue-200 text-blue-900 p-3.5 rounded-2xl animate-pulse text-xs font-bold font-sans">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span>Cotizando ruta con repartidores disponibles...</span>
                            </div>
                          ) : deliveryFee > 0 ? (
                            <div className={`p-4 rounded-2xl flex justify-between items-center font-sans animate-in fade-in duration-250 ${
                              deliveryFee === 1000 
                                ? 'bg-amber-50 border-2 border-amber-250 text-amber-950' 
                                : 'bg-emerald-50 border-2 border-emerald-250 text-emerald-950'
                            }`}>
                              <div>
                                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${deliveryFee === 1000 ? 'text-amber-800' : 'text-emerald-800'}`}>
                                  {deliveryFee === 1000 ? 'Tarifa Especial Preferencial' : 'Tarifa de Despacho Cotizada'}
                                </p>
                                <p className="text-xs font-black">
                                  {deliveryFee === 1000 ? 'DELIVERY VECINAL (CORTA DISTANCIA)' : `Sandbox Uber Direct / PedidosYa (${comuna})`}
                                </p>
                              </div>
                              <span className={`text-xs font-black bg-white border-2 px-3 py-1.5 rounded-xl font-mono ${
                                deliveryFee === 1000 ? 'text-amber-950 border-amber-350' : 'text-emerald-950 border-emerald-350'
                              }`}>
                                ${deliveryFee.toFixed(0)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div>
                        <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                          Teléfono de Contacto *
                        </label>
                        <input
                          type="tel"
                          placeholder="Ej. +56912345678"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-750 font-black uppercase block mb-1.5 font-sans">
                          Notas especiales o Instrucciones (Opcional)
                        </label>
                        <textarea
                          placeholder="Ej. Dejar en conserjería, llamar antes de llegar, etc."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documento Tributario Selector */}
                  <div className="space-y-4 bg-white border-2 border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest block font-sans">
                      Documento Tributario
                    </span>

                    <div className="grid grid-cols-2 gap-2.5 font-sans">
                      <button
                        type="button"
                        onClick={() => setDocumentType('Boleta')}
                        className={`p-3.5 rounded-2xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          documentType === 'Boleta'
                            ? 'bg-sky-50/70 border-sky-500 shadow-md ring-2 ring-sky-500/10'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`text-xs font-black ${documentType === 'Boleta' ? 'text-sky-950' : 'text-slate-700'}`}>
                          Boleta Electrónica
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Consumo Final</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDocumentType('Factura')}
                        className={`p-3.5 rounded-2xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          documentType === 'Factura'
                            ? 'bg-sky-50/70 border-sky-500 shadow-md ring-2 ring-sky-500/10'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`text-xs font-black ${documentType === 'Factura' ? 'text-sky-950' : 'text-slate-700'}`}>
                          Factura Electrónica
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Para Empresas</span>
                      </button>
                    </div>

                    {documentType === 'Factura' && (
                      <div className="space-y-3.5 pt-3.5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 text-left font-sans">
                        <div>
                          <label className="text-[10px] text-slate-750 font-black uppercase block mb-1 mt-0.5 font-sans">
                            RUT Empresa *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. 76.123.456-7"
                            value={rutEmpresa}
                            onChange={(e) => setRutEmpresa(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 outline-none font-bold text-slate-950"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-750 font-black uppercase block mb-1 mt-0.5 font-sans">
                            Razón Social *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Comercializadora Goyo SpA"
                            value={razonSocial}
                            onChange={(e) => setRazonSocial(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 outline-none font-bold text-slate-950"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-750 font-black uppercase block mb-1 mt-0.5 font-sans">
                            Giro Comercial *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Almacén de provisiones"
                            value={giroComercial}
                            onChange={(e) => setGiroComercial(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 outline-none font-bold text-slate-950"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-750 font-black uppercase block mb-1 mt-0.5 font-sans">
                            Dirección Tributaria *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Av. Providencia 1234, Of. 501, Providencia"
                            value={direccionTributaria}
                            onChange={(e) => setDireccionTributaria(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-350 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 outline-none font-bold text-slate-950"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selector de Método de Pago */}
                  <div className="space-y-4 bg-white border-2 border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest block font-sans">
                      Elegir Método de Pago
                    </span>

                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MercadoPago')}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                          paymentMethod === 'MercadoPago'
                            ? 'bg-sky-50/70 border-sky-500 shadow-md ring-2 ring-sky-500/10'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-sky-500 text-white rounded-xl">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-950">Tarjeta de Crédito/Débito</p>
                            <p className="text-[10px] font-extrabold text-sky-700">Simulado Mercado Pago Sandbox 🔒</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'MercadoPago' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {paymentMethod === 'MercadoPago' && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Efectivo')}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                          paymentMethod === 'Efectivo'
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-600 text-white rounded-xl">
                            <Send className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-950">Efectivo / Transferencia</p>
                            <p className="text-[10px] font-extrabold text-emerald-700">Pago contra entrega al recibir</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'Efectivo' ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {paymentMethod === 'Efectivo' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                      </button>
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

                   {paymentMethod === 'MercadoPago' && config?.siiEnabled && successTx?.siiPdfUrl && (
                    <div className="bg-sky-50 border-2 border-sky-250 p-4 rounded-2xl space-y-2.5 font-sans">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-sky-600" />
                        <h5 className="font-black text-xs uppercase tracking-wider text-sky-950">Documento Tributario Emitido</h5>
                      </div>
                      <p className="text-[11px] text-sky-900 font-extrabold leading-normal">
                        Tu {documentType === 'Factura' ? 'Factura' : 'Boleta'} Electrónica ha sido autorizada y generada correctamente por el SII.
                      </p>
                      <a
                        href={successTx.siiPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-black py-3 px-4 rounded-xl text-xs transition-colors shadow-sm no-underline border border-sky-550 cursor-pointer text-center font-sans"
                      >
                        <FileText className="w-4 h-4 text-sky-100" />
                        Descargar {documentType === 'Factura' ? 'Factura' : 'Boleta'} (PDF)
                      </a>
                    </div>
                  )}

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
                    {paymentMethod === 'MercadoPago' ? (
                      <>
                        <CreditCard className="w-5 h-5 text-white" />
                        <span>💳 Proceder al Pago Seguro</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                        <span>Confirmar por WhatsApp</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleSendWhatsAppAndClear}
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
        <div id="success-receipt-modal" className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-300 font-sans">
          {/* Custom isolated @media print styling rules inside ComprasTab */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* 1. Hide everything by default using visibility */
              body * {
                visibility: hidden !important;
              }
              
              /* 2. Show only our target ticket container and its children */
              #ticket-impresion-fiscal-online,
              #ticket-impresion-fiscal-online * {
                visibility: visible !important;
              }

              /* 3. Position the ticket at the top-left of the page so it prints beautifully */
              #ticket-impresion-fiscal-online {
                visibility: visible !important;
                display: block !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 10px !important;
                border: none !important;
                box-shadow: none !important;
                background: #ffffff !important;
                color: #000000 !important;
                height: auto !important;
              }

              /* 4. Ensure no scrollbars or clipped contents are printed */
              #ticket-impresion-fiscal-online .max-h-48,
              #ticket-impresion-fiscal-online .overflow-y-auto {
                max-height: none !important;
                overflow: visible !important;
              }

              /* 5. Force background colors and exact colors to render */
              #ticket-impresion-fiscal-online * {
                background-color: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                text-shadow: none !important;
                page-break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              /* 6. Ensure HTML/Body take up automatic height and do not generate extra blank pages */
              html, body {
                height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              @page {
                size: auto;
                margin: 4mm;
              }
            }
          `}} />

          <div className="modal-box bg-white text-slate-900 rounded-3xl w-full max-w-sm border-2 border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] relative font-sans">
            
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
            <div className="modal-body flex-1 overflow-y-auto p-4 min-h-0 bg-slate-50/50">
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
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      successTx.method === 'Tarjeta'
                        ? 'bg-sky-55 text-sky-800 border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {successTx.method === 'Tarjeta' ? 'TARJETA (PAGADO) 🔒' : 'EFECTIVO / ENTREGA'}
                    </span>
                  </div>
                </div>

                {/* Items Break Down Table */}
                <div className="border-t border-dashed border-slate-200 pt-3 font-sans">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-sans">Artículos Solicitados</p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {successTx.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0 font-sans">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-slate-850 truncate">{item.name.toUpperCase()}</p>
                          <p className="text-[10px] text-slate-450 font-semibold font-sans">
                            {item.qty} unids x ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-black text-slate-950 shrink-0 font-mono">
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
                  {successTx.shippingMethod === 'Domicilio' && successTx.deliveryFee && (
                    <div className="space-y-0.5 pt-0.5 border-t border-dashed border-slate-100 font-sans">
                      <div className="flex justify-between">
                        <span>ENVIO (DELIVERY):</span>
                        <span className="font-mono">${successTx.deliveryFee.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic font-sans text-left">
                        📍 Despacho: {successTx.deliveryAddress}, {successTx.deliveryComuna}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-slate-100 items-baseline font-sans">
                    <span className="font-black text-xs text-slate-950 uppercase font-sans">
                      {successTx.method === 'Tarjeta' ? 'TOTAL PAGADO:' : 'TOTAL A PAGAR:'}
                    </span>
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

              {config?.siiEnabled ? (
                <a
                  href={successTx.siiPdfUrl || `https://www.sii.cl/facturacion_electronica/ejemplo_dte_${successTx.documentType === 'Factura' ? 33 : 39}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5 border border-sky-550 cursor-pointer shadow-md text-center no-underline"
                >
                  <FileText className="w-4 h-4 text-sky-100" />
                  Emitir Boleta/Factura Electrónica (SII)
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => downloadReceiptPDF(successTx)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5 border border-indigo-550 cursor-pointer shadow-md text-center font-sans"
                >
                  <FileText className="w-4 h-4 text-indigo-100" />
                  Descargar Ticket de Compra
                </button>
              )}

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

      {/* Mercado Pago Sandbox Interactive Simulator Modal */}
      {showMpSimulator && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250 flex flex-col p-6 space-y-6 text-center">
            
            {/* Header branding */}
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-sky-500 animate-pulse" />
              <h3 className="font-black text-xs tracking-widest text-white uppercase font-sans">Mercado Pago Sandbox</h3>
            </div>

            {/* Content depends on state */}
            {mpProcessingState === 'processing' && (
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-black text-xs uppercase tracking-wider font-sans">Pasarela Segura</h4>
                  <p className="text-xs text-sky-400 font-extrabold font-mono animate-pulse">
                    Conectando con Mercado Pago Sandbox...
                  </p>
                </div>
              </div>
            )}

            {mpProcessingState === 'success' && (
              <div className="py-2 flex flex-col items-center justify-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <Check className="w-8 h-8 stroke-[3.5] animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-emerald-400 font-black text-xs uppercase tracking-wider font-sans">¡PAGO PROCESADO!</h4>
                  <p className="text-slate-200 text-xs font-black font-sans leading-relaxed">
                    ¡Pago Aprobado con Éxito! Tarjeta de prueba procesada.
                  </p>
                </div>

                <div className="w-full pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMpSimulator(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors cursor-pointer font-sans"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowMpSimulator(false);
                      await handleExecuteAddTransaction('Tarjeta');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/10 border border-emerald-550 font-sans"
                  >
                    Avanzar 🚀
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 6. SII Billing Simulation Overlay Modal */}
      {siiProcessing && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-black text-xs tracking-widest uppercase font-sans">Facturación Electrónica</h4>
              <p className="text-xs text-sky-400 font-extrabold font-mono leading-relaxed animate-pulse">
                {siiMessage || 'Emitiendo documento electrónico autorizado por el SII...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
