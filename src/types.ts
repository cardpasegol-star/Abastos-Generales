export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  cost: number;
  imageUrl: string;
  updatedAt: string;
  marca?: string;
  subcategoria?: string;
  precioNeto?: number;
  enOferta?: boolean;
  esOferta?: boolean;
  descuento?: number;
  precioOferta?: number | null;
  unidadMedida?: 'unidad' | 'kg' | 'g' | 'saco_5kg' | 'saco_10kg' | 'saco_25kg' | 'malla_3u' | 'malla_4u' | 'malla_5u' | 'malla_6u' | string;
  store?: string;
  comunas?: string[]; // Allowed delivery zones/communes for this product (empty or undefined = available in all zones)
  supplierId?: string;
  supplierName?: string;
  ingredients?: string;
  description?: string;
}

export interface Supplier {
  id: string;
  rut: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  category: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  orderedQty: number;
  purchaseCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: 'Borrador' | 'Enviada' | 'Recibida' | 'Cancelada';
  createdAt: string;
  notes?: string;
}

export interface CustomerCreditEntry {
  id: string;
  date: string;
  type: 'cargo' | 'abono';
  amount: number;
  description: string;
  transactionId?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  comuna?: string;
  deliveryRing?: string;
  creditLimit: number;
  currentDebt: number;
  notes?: string;
  createdAt: string;
  lastOrderDate?: string;
  orderCount: number;
  totalSpent: number;
  ledger: CustomerCreditEntry[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost?: number;
  unidadMedida?: 'unidad' | 'kg' | 'g' | 'saco_5kg' | 'saco_10kg' | 'saco_25kg' | 'malla_3u' | 'malla_4u' | 'malla_5u' | 'malla_6u' | string;
}

export interface Transaction {
  id: string;
  type: 'Venta' | 'Compra';
  source?: 'fisico' | 'digital';
  origen?: 'fisico' | 'digital';
  items: TransactionItem[];
  subtotal: number;
  tax: number; // IVA 15% / 19%
  platformFee?: number; // Tarifa de uso de plataforma digital (10%)
  total: number;
  method: 'Efectivo' | 'Tarjeta' | 'Mercado Pago (Sandbox)' | 'Webpay Plus (Integration)' | 'Fiado / Cuenta Corriente' | string;
  createdAt: string;
  employeeName?: string;
  documentType?: 'Boleta' | 'Factura';
  rutEmpresa?: string;
  razonSocial?: string;
  giroComercial?: string;
  direccionTributaria?: string;
  siiPdfUrl?: string;
  shippingMethod?: 'Domicilio' | 'Retiro';
  deliveryAddress?: string;
  deliveryComuna?: string;
  deliveryFee?: number;
  deliveryId?: string;
  trackingUrl?: string;
  paymentStatus?: 'APPROVED' | 'PENDING' | string;
  paymentStatusText?: string;
  marketplaceFee?: number;
  storeNetAmount?: number;
  marketplaceFeePercentage?: number;
  orderStatus?: 'En Preparación ⏳' | 'En Reparto 🛵' | 'Entregado ✅' | string;
  customerPhone?: string;
  customerName?: string;
  couponCode?: string;
  discountAmount?: number;
  isFiado?: boolean;
  customerId?: string;
}

export interface Empleado {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'cajero';
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isPopular: boolean;
  imageUrl: string;
  stock?: number;
  enOferta?: boolean;
  precioOferta?: number | null;
}

export interface ModulosActivos {
  tiendaAbarrotes: boolean;
  cocinaAlmuerzos: boolean;
  bodega: boolean;
  farmacia: boolean;
  frutería: boolean;
  congeladosPulpas?: boolean;
  carnesCecinas?: boolean;
  kitsCajas?: boolean;
}

export interface ModulosPermitidos {
  tiendaAbarrotes: boolean;
  cocinaAlmuerzos: boolean;
  bodega: boolean;
  farmacia: boolean;
  frutería: boolean;
  congelados?: boolean;
  congeladosPulpas?: boolean;
  carnesCecinas?: boolean;
  kitsCajas?: boolean;
}

export interface SectorConfig {
  name: string;
  comunas: string[];
  days: string[];
  fee: number;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // HH:mm e.g., "09:00"
  closeTime: string; // HH:mm e.g., "20:00"
}

export interface ScheduleConfig {
  openTime: string; // HH:mm fallback e.g., "09:00"
  closeTime: string; // HH:mm fallback e.g., "20:00"
  daysOpen?: string[]; // e.g., ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  mode?: 'auto' | 'forced_open' | 'forced_closed';
  weeklySchedule?: Record<string, DaySchedule>;
}

export interface EnabledModules {
  inventario?: boolean;
  caja?: boolean;
  reportes?: boolean;
  proveedores?: boolean;
  clientes?: boolean;
  compras?: boolean;
  [key: string]: boolean | undefined;
}

export interface BusinessConfig {
  id: string;
  storeKey?: string;
  name: string;
  rut?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp: string;
  gps: string;
  adminPin: string;
  bannerUrl?: string;
  ivaPercentage?: number;
  productCategories?: string[];
  foodItemCategories?: string[];
  fruteriaCategories?: string[];
  articoCategories?: string[];
  pizzaCategories?: string[];
  farmaciaCategories?: string[];
  categoryIcons?: Record<string, string>;
  schedule?: ScheduleConfig;
  licenseExpirationDate?: string; // YYYY-MM-DD
  licenseStatus?: 'active' | 'suspended'; // 'active' | 'suspended'
  licenseMessage?: string; // Custom block screen message
  siiEnabled?: boolean;
  siiRut?: string;
  siiDigitalCert?: string;
  siiApiKey?: string;
  modulosActivos?: ModulosActivos;
  articoActiveModules?: Record<string, boolean>;
  farmaciaActiveModules?: Record<string, boolean>;
  modulosPermitidos?: ModulosPermitidos;
  enabledModules?: EnabledModules;
  enabledTabs?: EnabledModules;
  rutasCamion?: Record<string, SectorConfig>;
  mostrarAlmuerzos?: boolean;
  modules?: {
    rutasCamion: boolean;
    fruteria: boolean;
    almuerzos: boolean;
    tienda: boolean;
    congelados?: boolean;
    farmacia?: boolean;
  };
}

export function isTabEnabledForStore(tab: string, config?: BusinessConfig): boolean {
  if (tab === 'Master' || tab === 'Mant.' || tab === 'InicioTurno') return true;
  if (!config) return true;
  const mods = config.enabledModules || config.enabledTabs;
  if (!mods) return true;

  const map: Record<string, keyof EnabledModules> = {
    'Inventario': 'inventario',
    'Caja': 'caja',
    'Reportes': 'reportes',
    'Proveedores': 'proveedores',
    'Clientes': 'clientes',
    'Compras': 'compras'
  };

  const key = map[tab];
  if (!key) return true;
  return mods[key] !== false;
}

export type ActiveTab = 'Inventario' | 'Caja' | 'Reportes' | 'Comidas' | 'Compras' | 'Mant.' | 'Master' | 'Proveedores' | 'Clientes';

export function getModuleForCategory(category: string): 'tiendaAbarrotes' | 'bodega' | 'farmacia' | 'frutería' | 'cocinaAlmuerzos' | 'congelados' {
  const cat = (category || '').toLowerCase();
  if (cat.includes('bodega') || cat.includes('licor') || cat.includes('alcohol') || cat.includes('vino') || cat.includes('cerveza') || cat.includes('trago') || cat.includes('coctel') || cat.includes('destilado')) {
    return 'bodega';
  }
  if (
    cat.includes('congelado') || cat.includes('carne') || cat.includes('churrasco') || cat.includes('marisco') || cat.includes('pescado') ||
    cat.includes('pulpa') || cat.includes('cecina') || cat.includes('refrigerado') || cat.includes('prefrito') || cat.includes('hamburguesa') ||
    cat.includes('kits y cajas') || cat.includes('kits y huevos') || cat.includes('artico') || cat.includes('ártico')
  ) {
    return 'congelados';
  }
  if (
    cat.includes('farmacia') || cat.includes('medicamento') || cat.includes('remedio') || cat.includes('fármaco') || cat.includes('farmaco') ||
    cat.includes('salud') || cat.includes('cuidado') || cat.includes('higiene') || cat.includes('farmaceut') || cat.includes('dental') ||
    cat.includes('mamá') || cat.includes('bebé') || cat.includes('bebe') || cat.includes('belleza') || cat.includes('cosmética') ||
    cat.includes('vitamina') || cat.includes('suplemento') || cat.includes('adulto mayor') || cat.includes('ortopedia') || cat.includes('conveniencia')
  ) {
    return 'farmacia';
  }
  if (
    cat.includes('frut') || cat.includes('verdur') || cat.includes('vegetal') || cat.includes('campo') ||
    cat.includes('frutas') || cat.includes('verduras') || cat.includes('hortaliza') || cat.includes('seco') ||
    cat.includes('semilla') || cat.includes('huevo') || cat.includes('mermelada') || cat.includes('miel') ||
    cat.includes('legumbre') || cat.includes('poroto') || cat.includes('lenteja') || cat.includes('garbanzo') ||
    cat.includes('palta') || cat.includes('tomate') || cat.includes('agrícola') || cat.includes('agricola')
  ) {
    return 'frutería';
  }
  if (cat.includes('almuerzo') || cat.includes('sopa') || cat.includes('postre') || cat.includes('cocina') || cat.includes('comida') || cat.includes('plato') || cat.includes('ración') || cat.includes('guiso') || cat.includes('ensalada')) {
    return 'cocinaAlmuerzos';
  }
  return 'tiendaAbarrotes';
}

export function normalizeProductForFruteria(p: Product): Product {
  const nameLower = (p.name || (p as any).nombre || '').toLowerCase();
  let cat = p.category || (p as any).categoria || 'Frutas';

  if (
    cat === 'Abarrotes' || cat === 'Bebidas' || cat === 'Lácteos' || cat === 'Snacks' ||
    cat === 'Tienda' || !cat || getModuleForCategory(cat) !== 'frutería'
  ) {
    if (
      nameLower.includes('melón') || nameLower.includes('melon') || nameLower.includes('sandía') ||
      nameLower.includes('sandia') || nameLower.includes('plátano') || nameLower.includes('platano') ||
      nameLower.includes('manzana') || nameLower.includes('naranja') || nameLower.includes('palta') ||
      nameLower.includes('fruta') || nameLower.includes('uva') || nameLower.includes('limón') ||
      nameLower.includes('limon') || nameLower.includes('frutilla') || nameLower.includes('kiwi') ||
      nameLower.includes('piña') || nameLower.includes('pina') || nameLower.includes('mango') ||
      nameLower.includes('pera') || nameLower.includes('durazno') || nameLower.includes('ciruela') ||
      nameLower.includes('berry') || nameLower.includes('arándano') || nameLower.includes('arandano') ||
      nameLower.includes('cereza') || nameLower.includes('frambuesa') || nameLower.includes('chirimoya') ||
      nameLower.includes('higo') || nameLower.includes('damasco') || nameLower.includes('granada') ||
      nameLower.includes('caqui') || nameLower.includes('membrillo')
    ) {
      cat = 'Frutas';
    } else if (
      nameLower.includes('tomate') || nameLower.includes('papa') || nameLower.includes('cebolla') ||
      nameLower.includes('lechuga') || nameLower.includes('zanahoria') || nameLower.includes('ajo') ||
      nameLower.includes('verdura') || nameLower.includes('zapallo') || nameLower.includes('pimentón') ||
      nameLower.includes('pimenton') || nameLower.includes('cilantro') || nameLower.includes('perejil') ||
      nameLower.includes('choclo') || nameLower.includes('apio') || nameLower.includes('espinaca') ||
      nameLower.includes('acelga') || nameLower.includes('pepino') || nameLower.includes('betarraga') ||
      nameLower.includes('brócoli') || nameLower.includes('brocoli') || nameLower.includes('coliflor') ||
      nameLower.includes('rábano') || nameLower.includes('rabano') || nameLower.includes('berenjena') ||
      nameLower.includes('alcachofa') || nameLower.includes('champiñón') || nameLower.includes('champinon')
    ) {
      cat = 'Verduras';
    } else if (
      nameLower.includes('nuez') || nameLower.includes('almendra') || nameLower.includes('maní') ||
      nameLower.includes('mani') || nameLower.includes('pasas') || nameLower.includes('pistacho') ||
      nameLower.includes('avellana') || nameLower.includes('castaña') || nameLower.includes('castana')
    ) {
      cat = 'Frutos Secos';
    } else if (
      nameLower.includes('semilla') || nameLower.includes('chia') || nameLower.includes('linaza') ||
      nameLower.includes('girasol') || nameLower.includes('sésamo') || nameLower.includes('sesamo') ||
      nameLower.includes('legumbre') || nameLower.includes('poroto') || nameLower.includes('lenteja') ||
      nameLower.includes('garbanzo')
    ) {
      cat = 'Semillas';
    } else if (nameLower.includes('huevo') || nameLower.includes('bandeja')) {
      cat = 'Huevos';
    } else if (nameLower.includes('mermelada') || nameLower.includes('confitura') || nameLower.includes('dulce de')) {
      cat = 'Mermeladas';
    } else if (nameLower.includes('miel') || nameLower.includes('panal')) {
      cat = 'Miel';
    } else {
      cat = 'Abarrotes / Varios';
    }
  }

  return {
    ...p,
    category: cat,
    categoria: cat,
    store: 'fruteria',
    module: 'fruteria',
    unidadMedida: p.unidadMedida || 'kg'
  } as Product;
}

export function getFarmaciaModuleForCategory(category: string): string {
  const catLower = (category || '').toLowerCase().trim();
  if (catLower.includes('medicamento') || catLower.includes('remedio') || catLower.includes('fármaco') || catLower.includes('farmaco') || catLower.includes('píldora') || catLower.includes('pastilla') || catLower.includes('analgésico') || catLower.includes('jarabe')) {
    return 'medicamentos';
  }
  if (catLower.includes('cuidado de la salud') || catLower.includes('salud') || catLower.includes('médico') || catLower.includes('medico') || catLower.includes('estetoscopio') || catLower.includes('primeros auxilios') || catLower.includes('termómetro') || catLower.includes('termometro')) {
    return 'cuidadoSalud';
  }
  if (catLower.includes('mamá') || catLower.includes('mama') || catLower.includes('bebé') || catLower.includes('bebe') || catLower.includes('biberón') || catLower.includes('biberon') || catLower.includes('mamadera') || catLower.includes('pañal') || catLower.includes('maternidad') || catLower.includes('infantil')) {
    return 'mamaBebe';
  }
  if (catLower.includes('cuidado personal') || catLower.includes('higiene') || catLower.includes('jabón') || catLower.includes('jabon') || catLower.includes('shampoo') || catLower.includes('desodorante') || catLower.includes('crema') || catLower.includes('loción') || catLower.includes('locion')) {
    return 'cuidadoPersonal';
  }
  if (catLower.includes('belleza') || catLower.includes('cosmética') || catLower.includes('cosmetica') || catLower.includes('maquillaje') || catLower.includes('labial') || catLower.includes('perfume') || catLower.includes('dermocosmética') || catLower.includes('facial')) {
    return 'belleza';
  }
  if (catLower.includes('vitamina') || catLower.includes('suplemento') || catLower.includes('multivitamínico') || catLower.includes('multivitaminico') || catLower.includes('proteína') || catLower.includes('proteina') || catLower.includes('calcio') || catLower.includes('nutrición') || catLower.includes('nutricion')) {
    return 'vitaminasSuplementos';
  }
  if (catLower.includes('adulto mayor') || catLower.includes('adulto') || catLower.includes('ortopedia') || catLower.includes('bastón') || catLower.includes('baston') || catLower.includes('senior') || catLower.includes('movilidad')) {
    return 'adultoMayor';
  }
  if (catLower.includes('conveniencia') || catLower.includes('varios') || catLower.includes('abarrote')) {
    return 'conveniencia';
  }

  // Fallbacks for official default names
  if (category === 'Medicamentos') return 'medicamentos';
  if (category === 'Cuidado de la Salud') return 'cuidadoSalud';
  if (category === 'Mamá y Bebé') return 'mamaBebe';
  if (category === 'Cuidado Personal') return 'cuidadoPersonal';
  if (category === 'Belleza') return 'belleza';
  if (category === 'Vitaminas y Suplementos') return 'vitaminasSuplementos';
  if (category === 'Adulto Mayor') return 'adultoMayor';
  if (category === 'Conveniencia') return 'conveniencia';

  return 'medicamentos';
}

export function isFarmaciaModuleActive(category: string, config?: BusinessConfig): boolean {
  if (!config) return true;

  // 1. Check Master contractual permission
  const permitidos = (config.modulosPermitidos || {}) as Record<string, boolean | undefined>;
  if (permitidos.farmacia === false) return false;

  // 2. Check Developer modules flag
  if (config.modules && config.modules.farmacia === false) return false;

  return true;
}

export function isModuleActive(category: string, config?: BusinessConfig): boolean {
  if (!config) return true;

  const knownKeys = ['tiendaAbarrotes', 'bodega', 'farmacia', 'frutería', 'fruteria', 'cocinaAlmuerzos', 'almuerzos', 'congelados', 'rutasCamion'];
  let moduleKey = category;
  if (!knownKeys.includes(category)) {
    moduleKey = getModuleForCategory(category) as string;
  } else if (category === 'fruteria') {
    moduleKey = 'frutería';
  } else if (category === 'almuerzos') {
    moduleKey = 'cocinaAlmuerzos';
  }

  if (moduleKey === 'farmacia') {
    return isFarmaciaModuleActive(category, config);
  }

  // 1. Check Developer / Master optional module flags (config.modules)
  let isDevActive = true;
  if (config.modules) {
    if (moduleKey === 'frutería') isDevActive = config.modules.fruteria !== false;
    else if (moduleKey === 'cocinaAlmuerzos') isDevActive = config.modules.almuerzos !== false;
    else if (moduleKey === 'tiendaAbarrotes') isDevActive = config.modules.tienda !== false;
    else if (moduleKey === 'congelados') isDevActive = config.modules.congelados !== false;
    else if (moduleKey === 'farmacia') isDevActive = config.modules.farmacia !== false;
    else if (moduleKey === 'rutasCamion') isDevActive = config.modules.rutasCamion !== false;
  }

  // 2. Check Master contractual permission (config.modulosPermitidos)
  let isMasterPermitted = true;
  if (config.modulosPermitidos) {
    const permitidos = config.modulosPermitidos as unknown as Record<string, boolean | undefined>;
    if (moduleKey === 'frutería') {
      const val = permitidos.frutería ?? permitidos.fruteria;
      if (val !== undefined) isMasterPermitted = val !== false;
    } else if (moduleKey === 'cocinaAlmuerzos') {
      const val = permitidos.cocinaAlmuerzos ?? permitidos.almuerzos;
      if (val !== undefined) isMasterPermitted = val !== false;
    } else if (moduleKey === 'tiendaAbarrotes') {
      const val = permitidos.tiendaAbarrotes ?? permitidos.tienda;
      if (val !== undefined) isMasterPermitted = val !== false;
    } else if (moduleKey === 'congelados') {
      const val = permitidos.congelados;
      if (val !== undefined) isMasterPermitted = val !== false;
    } else if (moduleKey === 'farmacia') {
      const val = permitidos.farmacia;
      if (val !== undefined) isMasterPermitted = val !== false;
    } else if (moduleKey === 'rutasCamion') {
      const val = permitidos.rutasCamion;
      if (val !== undefined) isMasterPermitted = val !== false;
    } else {
      isMasterPermitted = permitidos[moduleKey] !== false;
    }
  }

  return isDevActive && isMasterPermitted;
}
