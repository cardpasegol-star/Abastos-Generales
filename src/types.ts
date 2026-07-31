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
  unidadMedida?: 'unidad' | 'kg' | 'g';
  store?: string;
  comunas?: string[]; // Allowed delivery zones/communes for this product (empty or undefined = available in all zones)
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
  unidadMedida?: 'unidad' | 'kg' | 'g';
}

export interface Transaction {
  id: string;
  type: 'Venta' | 'Compra';
  source?: 'fisico' | 'digital';
  origen?: 'fisico' | 'digital';
  items: TransactionItem[];
  subtotal: number;
  tax: number; // IVA 15%
  total: number;
  method: 'Efectivo' | 'Tarjeta' | 'Mercado Pago (Sandbox)' | 'Webpay Plus (Integration)' | string;
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
  paymentStatus?: 'APPROVED' | 'PENDING' | string;
  paymentStatusText?: string;
  marketplaceFee?: number;
  storeNetAmount?: number;
  marketplaceFeePercentage?: number;
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

export interface BusinessConfig {
  id: string;
  name: string;
  whatsapp: string;
  gps: string;
  adminPin: string;
  bannerUrl?: string;
  ivaPercentage?: number;
  productCategories?: string[];
  foodItemCategories?: string[];
  fruteriaCategories?: string[];
  articoCategories?: string[];
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
  modulosPermitidos?: ModulosPermitidos;
  rutasCamion?: Record<string, SectorConfig>;
  mostrarAlmuerzos?: boolean;
  modules?: {
    rutasCamion: boolean;
    fruteria: boolean;
    almuerzos: boolean;
    tienda: boolean;
    congelados?: boolean;
  };
}

export type ActiveTab = 'Inventario' | 'Caja' | 'Reportes' | 'Comidas' | 'Compras' | 'Mant.' | 'Master';

export function getModuleForCategory(category: string): 'tiendaAbarrotes' | 'bodega' | 'farmacia' | 'frutería' | 'cocinaAlmuerzos' {
  const cat = (category || '').toLowerCase();
  if (cat.includes('bodega') || cat.includes('licor') || cat.includes('alcohol') || cat.includes('vino') || cat.includes('cerveza') || cat.includes('trago') || cat.includes('coctel') || cat.includes('destilado')) {
    return 'bodega';
  }
  if (cat.includes('farmacia') || cat.includes('medicamento') || cat.includes('remedio') || cat.includes('salud') || cat.includes('cuidado') || cat.includes('higiene') || cat.includes('farmaceut') || cat.includes('dental')) {
    return 'farmacia';
  }
  if (
    cat.includes('frut') || cat.includes('verdur') || cat.includes('vegetal') || cat.includes('campo') ||
    cat.includes('frutas') || cat.includes('verduras') || cat.includes('hortaliza') || cat.includes('seco') ||
    cat.includes('semilla') || cat.includes('huevo') || cat.includes('mermelada') || cat.includes('miel') ||
    cat.includes('abarrotes / varios') || cat.includes('abarrotes/varios')
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

export function isModuleActive(category: string, config?: BusinessConfig): boolean {
  if (!config) return true;

  const moduleKey = getModuleForCategory(category);

  // Check optional module toggle in config.modules if present
  let isOptActive = true;
  if (config.modules) {
    if (moduleKey === 'frutería') isOptActive = config.modules.fruteria !== false;
    else if (moduleKey === 'cocinaAlmuerzos') isOptActive = config.modules.almuerzos !== false;
    else if (moduleKey === 'tiendaAbarrotes') isOptActive = config.modules.tienda !== false;
  }

  const modulos = config.modulosActivos || {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: true,
    farmacia: true,
    frutería: true
  };
  const permitidos = config.modulosPermitidos || {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: false,
    farmacia: false,
    frutería: false
  };
  const isPermitted = permitidos[moduleKey] !== false;
  const isActive = modulos[moduleKey] !== false;
  return isOptActive && isPermitted && isActive;
}
