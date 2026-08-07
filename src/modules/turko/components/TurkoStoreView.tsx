import React, { useState } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, MapPin,
  Store, Truck, Phone, User, CheckCircle2, Tag, ShieldCheck, ArrowRight,
  Sparkles, Calendar, Map, X
} from 'lucide-react';
import { TurkoProduct } from '../types';
import { BusinessConfig } from '../../../types';
import { useTurkoStore } from '../useTurkoStore';
import { TurkoTicketModal } from './TurkoTicketModal';
import { UpsellingSection } from './UpsellingSection';
import { getUnidadLabel, getUnidadShortSuffix } from '../../../utils/unitHelpers';
import { getSectorForComunaTurko, ALL_COMUNAS_TURKO, DEFAULT_RUTAS_TURKO, SectorConfig, isTurkoProduct } from '../utils';
import { checkStoreOpenStatus } from '../../../utils';

interface TurkoStoreViewProps {
  initialConfig?: BusinessConfig;
  initialProducts?: TurkoProduct[];
  onBackToMarketplace?: () => void;
  onSaveTransaction?: (tx: any) => Promise<string>;
}

export const TurkoStoreView: React.FC<TurkoStoreViewProps> = ({
  initialConfig,
  initialProducts,
  onBackToMarketplace,
  onSaveTransaction
}) => {
  const {
    config,
    products,
    filteredProducts,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
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
  } = useTurkoStore(initialConfig, initialProducts, onSaveTransaction);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);

  // Address & Geolocation states
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);

  // Sync initial deliveryAddress if present
  React.useEffect(() => {
    if (deliveryAddress && !street && !number) {
      setStreet(deliveryAddress);
    }
  }, []);

  // Sync delivery fee with selected comuna on load or comuna change
  React.useEffect(() => {
    if (selectedComuna) {
      const sector = getSectorForComunaTurko(selectedComuna, config?.rutasCamion);
      if (sector) {
        setDeliveryFee(sector.fee);
      }
    }
  }, [selectedComuna, config?.rutasCamion, setDeliveryFee]);

  const handleStreetChange = (val: string) => {
    setStreet(val);
    const combined = `${val} ${number}`.trim();
    setDeliveryAddress(combined);
  };

  const handleNumberChange = (val: string) => {
    setNumber(val);
    const combined = `${street} ${val}`.trim();
    setDeliveryAddress(combined);
  };

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
        setIsLocating(false);
        const gpsStreet = `📍 Ubicación GPS (${clientLat.toFixed(5)}, ${clientLon.toFixed(5)})`;
        const gpsNum = 'S/N';
        setStreet(gpsStreet);
        setNumber(gpsNum);
        setDeliveryAddress(`${gpsStreet} ${gpsNum}`);
        setGpsDistance(350); // Metros aproximados al local
      },
      (error) => {
        setIsLocating(false);
        setGpsError('No se pudo obtener la ubicación. Ingresa tu dirección manualmente.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Real-time autocomplete suggestions for search
  const autocompleteSuggestions = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 1) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      if (!isTurkoProduct(p, config?.productCategories)) return false;
      const nameMatch = p.name.toLowerCase().includes(q);
      const skuMatch = p.sku?.toLowerCase().includes(q);
      const catMatch = p.category?.toLowerCase().includes(q);
      return nameMatch || skuMatch || catMatch;
    });
  }, [products, searchQuery, config?.productCategories]);

  // Helper for category emojis / stickers
  const getCategoryEmoji = (cat: string): string => {
    if (!cat) return '📦';
    const lower = cat.toLowerCase().trim();
    if (lower === 'todas' || lower === 'todos' || lower === 'todo') return '🛒';
    if (lower.includes('bebida')) return '🥤';
    if (lower.includes('abarrote')) return '🥫';
    if (lower.includes('lácteo') || lower.includes('lacteo')) return '🥛';
    if (lower.includes('snack') || lower.includes('papas')) return '🍿';
    if (lower.includes('limpieza') || lower.includes('aseo')) return '🧹';
    if (lower.includes('fruta') || lower.includes('verdura')) return '🍏';
    if (lower.includes('carne') || lower.includes('churrasco')) return '🥩';
    if (lower.includes('hamburguesa') || lower.includes('prefrito')) return '🍔';
    if (lower.includes('congelado') || lower.includes('pulpa')) return '🧊';
    if (lower.includes('marisco') || lower.includes('pescado')) return '🐟';
    if (lower.includes('pan') || lower.includes('repostería') || lower.includes('panadería')) return '🥖';
    if (lower.includes('fresco') || lower.includes('refrigerado')) return '🧊';
    if (lower.includes('dulce') || lower.includes('golosina') || lower.includes('confite')) return '🍬';
    return '📦';
  };

  // Available categories
  const categories = ['Todas', ...(config.productCategories || ['Abarrotes', 'Bebidas', 'Lácteos', 'Snacks', 'Frutas y Verduras'])];

  // Comunas options
  const comunas = ALL_COMUNAS_TURKO;

  const handleComunaChange = (c: string) => {
    setSelectedComuna(c);
    const sector = getSectorForComunaTurko(c, config?.rutasCamion);
    if (sector) {
      setDeliveryFee(sector.fee);
    } else if (c === 'La Pintana') {
      setDeliveryFee(1500);
    } else {
      setDeliveryFee(2500);
    }
  };

  const showTruckRoutesBanner = (config?.modules?.rutasCamion !== false) && (config?.modulosActivos?.rutasCamion !== false);
  const currentSector = getSectorForComunaTurko(selectedComuna, config?.rutasCamion);

  // Filter products on offer exclusively for "El Turko" catalog
  const offerProducts = products.filter(
    (p) => isTurkoProduct(p, config?.productCategories) && (p.enOferta || (p.precioOferta && p.precioOferta < p.price))
  );

  // Real-time store open / closed status evaluation (Chile Timezone & Schedules)
  const [storeStatus, setStoreStatus] = useState(() => checkStoreOpenStatus(config?.schedule));

  React.useEffect(() => {
    setStoreStatus(checkStoreOpenStatus(config?.schedule));
    const timer = setInterval(() => {
      setStoreStatus(checkStoreOpenStatus(config?.schedule));
    }, 15000); // Re-evaluate every 15s
    return () => clearInterval(timer);
  }, [config?.schedule]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-36 sm:pb-44 text-slate-900">
      {/* Top Banner & Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden shadow-xl rounded-3xl border-2 border-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={config.bannerUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800'}
            alt="El Turko Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Store className="w-3.5 h-3.5" /> Módulo Tienda Oficial
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {config.name || 'Minimarket "Donde El Turko"'}
              </h1>
              <p className="text-slate-300 text-sm mt-1 flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{config.address || 'Av. Holanda #123, La Pintana'}</span>
                <span>•</span>
                <span className={`inline-flex items-center gap-1 font-bold ${storeStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {storeStatus.isOpen ? 'Atendiendo ahora' : 'Cerrado'}
                </span>
              </p>
            </div>

            {onBackToMarketplace && (
              <button
                onClick={onBackToMarketplace}
                className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                ← Volver al Marketplace
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 1. BANNER DE RUTAS DE DESPACHO PROGRAMADO (LOGÍSTICA CAMIÓN) */}
        {showTruckRoutesBanner && (
          <div className="bg-emerald-50/95 border-2 border-emerald-200 p-4 sm:p-5 rounded-3xl shadow-xs space-y-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shadow-2xs text-lg sm:text-xl shrink-0">
                🚚
              </span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                    Rutas de Despacho Programado
                  </h4>
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    LOGÍSTICA CAMIÓN
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-medium space-y-2">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap leading-relaxed">
                    <span>📍 Despachamos a tu comuna (<span className="text-emerald-700 font-black">{selectedComuna}</span>) los días:</span>
                    <span className="bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {currentSector ? currentSector.days.join(' y ') : 'Miércoles y Sábado'}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span>Flete:</span>
                    <span className="font-black text-slate-950 font-mono">
                      ${(currentSector ? currentSector.fee : deliveryFee).toLocaleString('es-CL')} CLP
                    </span>
                  </p>

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <span className="text-[11px] font-extrabold text-slate-650">Verificar otra Comuna:</span>
                    <select
                      value={selectedComuna}
                      onChange={(e) => handleComunaChange(e.target.value)}
                      className="bg-white border-2 border-emerald-300 rounded-lg px-3 py-1 text-[11px] font-black text-slate-950 outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                    >
                      {comunas.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => setShowRouteModal(true)}
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-extrabold text-xs transition-colors"
                  >
                    <span>🗺️ Ver mapa y calendario de reparto por comunas</span>
                    <span className="text-emerald-600 font-black">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border-2 border-slate-200 space-y-4">
          <div className="relative z-30">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Escribe para buscar productos o platos (ej: Manzana, Arroz)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-200/90 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {/* SUGERENCIAS EN TIEMPO REAL Panel */}
            {searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                {/* Header */}
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span className="font-black text-xs text-slate-900 uppercase tracking-wider">
                      SUGERENCIAS EN TIEMPO REAL
                    </span>
                    <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-2xs font-mono">
                      {autocompleteSuggestions.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-400 hidden sm:inline">
                    Haz clic para ir al producto
                  </span>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
                  {autocompleteSuggestions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 space-y-1">
                      <p className="font-black text-sm text-slate-700">No se encontraron productos</p>
                      <p className="text-xs font-medium">Intenta buscar por otro término o marca</p>
                    </div>
                  ) : (
                    autocompleteSuggestions.map((prod) => {
                      const inCart = cart.find((i) => i.id === prod.id);
                      const displayPrice = prod.enOferta && prod.precioOferta ? prod.precioOferta : prod.price;

                      return (
                        <div
                          key={prod.id}
                          className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                        >
                          {/* Thumbnail & Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                              <img
                                src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
                                alt={prod.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 uppercase">
                                  {getCategoryEmoji(prod.category)} {prod.category}
                                </span>
                                {prod.stock !== undefined && (
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Disp: {prod.stock} unidades
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              {prod.enOferta && prod.precioOferta && (
                                <span className="text-[10px] text-slate-400 line-through font-mono font-bold block leading-none">
                                  ${prod.price.toFixed(0)}
                                </span>
                              )}
                              <span className="font-mono font-black text-sm text-slate-950 block">
                                ${displayPrice.toFixed(0)}
                              </span>
                              <span className="text-[9px] text-slate-400 font-extrabold block">por unidades</span>
                            </div>

                            {inCart ? (
                              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(prod.id, inCart.quantity - 1)}
                                  className="w-6 h-6 bg-white text-emerald-800 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-emerald-100 cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-mono font-black text-xs text-emerald-950 px-1">
                                  {inCart.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(prod.id, inCart.quantity + 1)}
                                  className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-emerald-700 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(prod, 1)}
                                className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 border border-emerald-500"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Agregar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category Pills with Emoji Stickers */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-600/50 scale-[1.02]'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90'
                }`}
              >
                <span className="text-sm">{getCategoryEmoji(cat)}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. CARRUSEL DE OFERTAS DEL DÍA / REMATES ESPECIALES */}
        {offerProducts.length > 0 && (
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border-2 border-rose-200 p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center pb-2 border-b border-rose-200/80 flex-wrap gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 bg-rose-600 text-white rounded-xl shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <h3 className="font-black text-rose-950 text-base sm:text-lg font-sans tracking-tight">
                    ⚡ ¡Ofertas del Día para {selectedComuna}!
                  </h3>
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    COBERTURA {selectedComuna.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-rose-800 font-bold font-sans">
                  ¡Remates especiales con stock limitado y despacho programado a {selectedComuna}!
                </p>
              </div>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-rose-200">
              {offerProducts.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                const displayPrice = product.precioOferta || product.price;
                const discountPct = product.price > 0 && product.precioOferta
                  ? Math.round(((product.price - product.precioOferta) / product.price) * 100)
                  : 0;

                return (
                  <div
                    key={`offer-${product.id}`}
                    className="w-60 sm:w-64 shrink-0 bg-white rounded-2xl border-2 border-rose-200 overflow-hidden flex flex-col justify-between hover:border-rose-400 hover:shadow-md transition-all relative group p-3 space-y-2"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1">
                      {discountPct > 0 ? (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-2xs">
                          -{discountPct}% DCTO
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          OFERTA
                        </span>
                      )}

                      <span className="bg-slate-900/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md font-mono">
                        Stock: {product.stock ?? 50}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100 flex items-center justify-center p-2">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title & SKU */}
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 line-clamp-2 leading-snug min-h-[2.25rem]">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-mono">
                        SKU: {product.sku || product.id.slice(-6)}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] text-slate-400 line-through font-bold">
                          ${product.price.toFixed(0)}
                        </span>
                        <span className="text-base font-black text-rose-600 font-mono">
                          ${displayPrice.toFixed(0)}
                          <span className="text-[10px] text-rose-700 font-extrabold font-sans">
                            {getUnidadShortSuffix(product.unidadMedida)}
                          </span>
                        </span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-1">
                          <button
                            onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                            className="w-7 h-7 bg-white text-rose-800 rounded-lg flex items-center justify-center font-bold hover:bg-rose-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-black text-xs text-rose-950 px-1">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                            className="w-7 h-7 bg-rose-600 text-white rounded-lg flex items-center justify-center font-bold hover:bg-rose-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Product Grid Container */}
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Catálogo de Productos</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                {filteredProducts.length} disponibles
              </span>
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <p className="text-slate-500 font-medium text-sm">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); }}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                const displayPrice = product.enOferta && product.precioOferta ? product.precioOferta : product.price;
                const discountPct = product.price > 0 && product.precioOferta
                  ? Math.round(((product.price - product.precioOferta) / product.price) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative w-full space-y-4"
                  >
                    {/* Top Internal Header: Category Badge Left & Offer Badge Right */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="bg-amber-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                        <span>🧃</span>
                        <span>{product.category || 'BEBIDAS'}</span>
                      </span>

                      {product.enOferta ? (
                        <span className="bg-rose-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
                          <span>🔥</span>
                          <span>¡OFERTA! {discountPct > 0 ? `(-${discountPct}%)` : ''}</span>
                        </span>
                      ) : (
                        product.stock !== undefined && product.stock <= 5 && (
                          <span className="bg-amber-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-2xs uppercase">
                            🔥 ¡Solo {product.stock}!
                          </span>
                        )
                      )}
                    </div>

                    {/* Central Zone: Large Protagonist Image */}
                    <div className="w-full flex items-center justify-center bg-slate-50/70 rounded-2xl p-4 border border-slate-100 my-1">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
                        alt={product.name}
                        className="h-44 sm:h-52 max-w-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                      />
                    </div>

                    {/* Details & Prices Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-1">
                      {/* Left: Title, SKU, Unit, Store Tag */}
                      <div className="space-y-1 max-w-xl">
                        <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold font-mono">
                          SKU: {product.sku || product.id.slice(-10)}
                        </p>
                        {product.unidadMedida && (
                          <span className="text-xs text-amber-800 font-extrabold block">
                            {getUnidadLabel(product.unidadMedida)}
                          </span>
                        )}
                        <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-700 font-black">
                          <span>Tienda</span>
                          <span>📦</span>
                        </div>
                      </div>

                      {/* Right: Stock Badge & Prices */}
                      <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {product.enOferta && product.stock !== undefined && product.stock <= 5 && (
                          <span className="bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-2xs uppercase">
                            🔥 ¡Solo {product.stock}!
                          </span>
                        )}

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 font-black tracking-widest block uppercase">
                            PRECIO
                          </span>
                          {product.enOferta && product.precioOferta && (
                            <span className="text-xs text-slate-400 line-through font-mono font-bold block">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono leading-none block pt-0.5">
                            ${displayPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right: Broad Green Button */}
                    <div className="flex justify-end w-full pt-2 border-t border-slate-100">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-500 rounded-2xl px-3 py-1.5 shadow-2xs">
                          <button
                            onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                            className="w-8 h-8 bg-white text-emerald-800 rounded-xl flex items-center justify-center font-black shadow-2xs hover:bg-emerald-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-mono font-black text-sm text-emerald-950 px-2">
                            {inCart.quantity} en carrito
                          </span>
                          <button
                            onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                            className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black shadow-2xs hover:bg-emerald-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-98 cursor-pointer border border-emerald-500"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-24 left-4 right-4 max-w-md mx-auto z-50 pointer-events-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-amber-500/80 flex items-center justify-between gap-4 font-sans hover:bg-slate-900 transition-all transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow-md">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ver Carrito El Turko</p>
                <p className="text-xs text-slate-300 font-medium">Incluye subtotal, IVA y tarifa 10%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white font-mono">${totals.total.toFixed(0)}</span>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal / Slide-over Drawer - "Tu Pedido Integrado" */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-50 w-full max-w-lg h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
            
            {/* Header */}
            <div className="bg-white p-5 border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-sans tracking-tight">
                    Tu Pedido Integrado
                  </h2>
                  <p className="text-[11px] text-slate-500 font-extrabold font-sans">
                    Donde El Turko • Desglose Transparente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full font-mono">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)} ítems
                </span>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-black transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-6 flex-1">
              
              {/* 1. LISTA DE COMPRA */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block font-sans">
                  LISTA DE COMPRA
                </span>

                <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 space-y-2.5 shadow-2xs max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-bold text-xs">
                      Tu carrito está vacío.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-extrabold text-slate-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-amber-100 text-amber-900 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                EL TURKO
                              </span>
                              <span className="text-slate-500 font-mono font-bold">
                                ${item.price.toFixed(0)} {getUnidadShortSuffix(item.unidadMedida)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl px-1.5 py-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 text-slate-700 font-black hover:bg-slate-100 rounded-lg flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-xs text-slate-950 px-2">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 text-slate-700 font-black hover:bg-slate-100 rounded-lg flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Venta Incremental / Smart Upselling Carousel */}
                <UpsellingSection
                  products={products}
                  cart={cart}
                  onAddToCart={addToCart}
                />
              </div>

              {/* CUPÓN DE DESCUENTO */}
              <div className="space-y-2 bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-200/90 rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-amber-950 uppercase flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-700" />
                    <span>¿Tienes un Cupón de Descuento?</span>
                  </label>
                  {appliedCoupon && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      ¡CUPÓN ACTIVO!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ej. TURKO10, ENVIOFREE, VECINO5"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border-2 border-amber-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 tracking-wider uppercase focus:outline-none focus:border-amber-600 transition-colors placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => applyCouponCode()}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-amber-700 shrink-0"
                  >
                    Validar
                  </button>
                </div>

                {/* Feedback message */}
                {couponFeedback && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                    couponFeedback.isError
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    <span>{couponFeedback.message}</span>
                    {!couponFeedback.isError && appliedCoupon && (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[10px] bg-white text-rose-600 hover:bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md font-black cursor-pointer ml-2"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. DATOS DE DESPACHO / ENTREGA */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block font-sans">
                  DATOS DE DESPACHO / ENTREGA
                </span>

                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs">
                  {/* Customer Name */}
                  <div>
                    <label className="text-[11px] font-black text-slate-800 uppercase block mb-1">
                      TU NOMBRE COMPLETO *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    />
                  </div>

                  {/* Delivery Method Selector */}
                  <div>
                    <label className="text-[11px] font-black text-slate-800 uppercase block mb-1.5">
                      MÉTODO DE ENTREGA
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShippingMethod('Domicilio')}
                        className={`p-3 rounded-xl border-2 text-xs font-black transition-all flex flex-col items-center justify-center gap-1 ${
                          shippingMethod === 'Domicilio'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          <span>Envío a Domicilio</span>
                        </div>
                        <span className="text-[9px] font-normal opacity-80">(Simulador Delivery Sandbox)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShippingMethod('Retiro')}
                        className={`p-3 rounded-xl border-2 text-xs font-black transition-all flex flex-col items-center justify-center gap-1 ${
                          shippingMethod === 'Retiro'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Store className="w-4 h-4" />
                          <span>Retiro en Local ($0)</span>
                        </div>
                        <span className="text-[9px] font-normal opacity-80">(Sin costo de envío)</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery details if Domicilio */}
                  {shippingMethod === 'Domicilio' && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                      
                      {/* GPS Button and status */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleUseMyGps}
                          disabled={isLocating}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border-2 border-indigo-200 text-indigo-950 text-xs font-extrabold shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                          <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                            ⚠️ {gpsError}
                          </p>
                        )}
                        {gpsDistance !== null && (
                          <p className="text-[11px] font-black text-indigo-950 bg-indigo-50/50 border border-indigo-150 rounded-xl px-3 py-2 flex items-center justify-between">
                            <span>Distancia aproximada al local:</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                              {gpsDistance < 1000 ? `${gpsDistance.toFixed(0)}m` : `${(gpsDistance / 1000).toFixed(2)} km`}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Structured Inputs CALLE * & NÚMERO * */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-black text-slate-800 uppercase block mb-1">
                            CALLE *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Av. Vicuña Mackenna"
                            value={street}
                            onChange={(e) => handleStreetChange(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-slate-800 uppercase block mb-1">
                            NÚMERO *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. 1234"
                            value={number}
                            onChange={(e) => handleNumberChange(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Dropdown COMUNA * */}
                      <div>
                        <label className="text-[11px] font-black text-slate-800 uppercase block mb-1">
                          COMUNA *
                        </label>
                        <select
                          value={selectedComuna}
                          onChange={(e) => handleComunaChange(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                        >
                          {comunas.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic Delivery sector / ring banner */}
                      {(() => {
                        const sector = getSectorForComunaTurko(selectedComuna, config?.rutasCamion);
                        if (!sector) return null;
                        return (
                          <div className="bg-indigo-50 border-2 border-indigo-200 p-3.5 rounded-2xl space-y-1 animate-in fade-in duration-200">
                            <span className="block font-black text-[10px] uppercase tracking-wider text-indigo-900">
                              🚚 Ruta de Camión ({sector.name}) - {selectedComuna}
                            </span>
                            <p className="text-xs font-bold text-indigo-950 leading-relaxed">
                              Despachamos a tu zona los días <span className="text-indigo-600 underline decoration-indigo-300 font-extrabold">{sector.days.join(' y ')}</span>. Costo de envío: <span className="text-indigo-700 font-black font-mono">${sector.fee.toLocaleString('es-CL')} CLP</span>.
                            </p>
                          </div>
                        );
                      })()}

                    </div>
                  )}

                  {/* Contact Phone */}
                  <div>
                    <label className="text-[11px] font-black text-slate-800 uppercase block mb-1">
                      TELÉFONO DE CONTACTO *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. +56912345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className="text-[11px] font-black text-slate-800 uppercase block mb-1">
                      NOTAS ESPECIALES O INSTRUCCIONES (OPCIONAL)
                    </label>
                    <textarea
                      placeholder="Ej. Dejar en conserjería, llamar antes de llegar, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. MÉTODOS DE PAGO / PASARELA */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block font-sans">
                  ELEGIR PASARELA DE PAGO
                </span>

                <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 space-y-2 shadow-2xs">
                  {/* Mercado Pago Sandbox */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MercadoPago')}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      paymentMethod === 'MercadoPago'
                        ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-emerald-600 text-white rounded-lg text-sm">💳</span>
                      <div>
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>Mercado Pago</span>
                          <span className="bg-emerald-200 text-emerald-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            Sandbox
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-extrabold">Modo Prueba / Checkout API Sandbox 🔒</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'MercadoPago' ? 'border-emerald-600' : 'border-slate-300'}`}>
                      {paymentMethod === 'MercadoPago' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </div>
                  </button>

                  {/* Webpay Plus */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Webpay')}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      paymentMethod === 'Webpay'
                        ? 'bg-indigo-50 border-indigo-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-indigo-600 text-white rounded-lg text-sm">💳</span>
                      <div>
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>Webpay Plus</span>
                          <span className="bg-indigo-200 text-indigo-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono">
                            Integration
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-extrabold">Transbank Integration 🛡️</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Webpay' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {paymentMethod === 'Webpay' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                  </button>

                  {/* Cash / Transfer */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      paymentMethod === 'Efectivo'
                        ? 'bg-amber-50 border-amber-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-amber-500 text-white rounded-lg text-sm">💵</span>
                      <div>
                        <p className="text-xs font-black text-slate-900">Efectivo / Transferencia al Entregar</p>
                        <p className="text-[10px] text-slate-500 font-extrabold">Pago contra entrega al recibir</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Efectivo' ? 'border-amber-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'Efectivo' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                  </button>

                  {/* Fiado / Cuenta Corriente */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Fiado / Cuenta Corriente')}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      paymentMethod === 'Fiado / Cuenta Corriente'
                        ? 'bg-purple-50 border-purple-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-purple-600 text-white rounded-lg text-sm">📖</span>
                      <div>
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>Cargar a Cuenta Corriente / Fiado</span>
                          <span className="bg-purple-200 text-purple-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            Vecinos
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-extrabold">Libreta de Fiado para clientes habituales</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Fiado / Cuenta Corriente' ? 'border-purple-600' : 'border-slate-300'}`}>
                      {paymentMethod === 'Fiado / Cuenta Corriente' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* 4. TOTALS BREAKDOWN */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 text-xs font-sans shadow-lg border border-slate-800">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Subtotal Artículos:</span>
                  <span className="font-mono font-bold">${totals.subtotal.toLocaleString('es-CL')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/50">
                    <span>Cupón Aplicado ({appliedCoupon.code}):</span>
                    <span className="font-mono font-black">
                      {appliedCoupon.isFreeShipping ? 'Envío Gratis ($0)' : `-$${totals.discountAmount.toLocaleString('es-CL')}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>IVA ({config.ivaPercentage || 19}%):</span>
                  <span className="font-mono font-bold">${totals.tax.toLocaleString('es-CL')}</span>
                </div>
                {shippingMethod === 'Domicilio' && (
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Envío (Delivery):</span>
                    <span className="font-mono font-bold">
                      {appliedCoupon?.isFreeShipping ? (
                        <span className="text-emerald-400 line-through mr-1">${deliveryFee.toLocaleString('es-CL')}</span>
                      ) : null}
                      ${totals.deliveryFee.toLocaleString('es-CL')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-amber-300 bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/30 font-extrabold">
                  <span className="text-[11px]">TARIFA DE USO DE PLATAFORMA (10%):</span>
                  <span className="font-mono font-black text-sm">${totals.platformFee.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-black">
                  <span className="uppercase text-white font-black">TOTAL A PAGAR:</span>
                  <span className="text-2xl font-mono text-emerald-400 font-black">${totals.total.toLocaleString('es-CL')}</span>
                </div>
              </div>

            </div>

            {/* Footer with Action Button */}
            <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-10 space-y-2">
              <button
                onClick={executeCheckout}
                disabled={isProcessingCheckout || cart.length === 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer border border-emerald-500"
              >
                {paymentMethod === 'MercadoPago' ? (
                  <>
                    <span>💳 💳 Pagar con Mercado Pago Sandbox</span>
                  </>
                ) : paymentMethod === 'Webpay' ? (
                  <>
                    <span>💳 Pagar con Webpay Plus Sandbox</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    <span>Confirmar Pedido y Abrir Ticket</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Embedded Standalone Ticket Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl text-lg">🚚</span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Calendario de Despacho por Comunas</h3>
                  <p className="text-xs text-slate-500 font-bold">Rutas de Reparto Programado - Logística Camión</p>
                </div>
              </div>
              <button
                onClick={() => setShowRouteModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries((config?.rutasCamion as Record<string, SectorConfig>) || DEFAULT_RUTAS_TURKO).map(([key, sector]) => (
                <div key={key} className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{sector.name}</span>
                    <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full">
                      Flete: ${sector.fee.toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    🗓️ <span className="font-extrabold">Días de Reparto:</span> {sector.days.join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    📍 <span className="font-bold">Comunas:</span> {sector.comunas.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRouteModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors"
            >
              Cerrar Calendario
            </button>
          </div>
        </div>
      )}

      {activeTicket && (
        <TurkoTicketModal
          transaction={activeTicket}
          config={config}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
};
