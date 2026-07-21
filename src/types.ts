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
  enOferta?: boolean;
  esOferta?: boolean;
  descuento?: number;
  precioOferta?: number | null;
  unidadMedida?: 'unidad' | 'kg' | 'g';
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
  items: TransactionItem[];
  subtotal: number;
  tax: number; // IVA 15%
  total: number;
  method: 'Efectivo' | 'Tarjeta';
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
}

export interface ModulosPermitidos {
  tiendaAbarrotes: boolean;
  cocinaAlmuerzos: boolean;
  bodega: boolean;
  farmacia: boolean;
  frutería: boolean;
}

export interface SectorConfig {
  name: string;
  comunas: string[];
  days: string[];
  fee: number;
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
  categoryIcons?: Record<string, string>;
  licenseExpirationDate?: string; // YYYY-MM-DD
  licenseStatus?: 'active' | 'suspended'; // 'active' | 'suspended'
  licenseMessage?: string; // Custom block screen message
  siiEnabled?: boolean;
  siiRut?: string;
  siiDigitalCert?: string;
  siiApiKey?: string;
  modulosActivos?: ModulosActivos;
  modulosPermitidos?: ModulosPermitidos;
  rutasCamion?: Record<string, SectorConfig>;
  mostrarAlmuerzos?: boolean;
  modules?: {
    rutasCamion: boolean;
    fruteria: boolean;
    almuerzos: boolean;
    tienda: boolean;
  };
}

export type ActiveTab = 'Inventario' | 'Caja' | 'Reportes' | 'Comidas' | 'Compras' | 'Mant.' | 'Master';

export function getModuleForCategory(category: string): 'tiendaAbarrotes' | 'bodega' | 'farmacia' | 'frutería' | 'cocinaAlmuerzos' {
  const cat = category.toLowerCase();
  if (cat.includes('bodega') || cat.includes('licor') || cat.includes('alcohol') || cat.includes('vino') || cat.includes('cerveza') || cat.includes('trago') || cat.includes('coctel') || cat.includes('destilado')) {
    return 'bodega';
  }
  if (cat.includes('farmacia') || cat.includes('medicamento') || cat.includes('remedio') || cat.includes('salud') || cat.includes('cuidado') || cat.includes('higiene') || cat.includes('farmaceut') || cat.includes('dental')) {
    return 'farmacia';
  }
  if (cat.includes('frut') || cat.includes('verdur') || cat.includes('vegetal') || cat.includes('campo') || cat.includes('frutas') || cat.includes('verduras') || cat.includes('hortaliza')) {
    return 'frutería';
  }
  if (cat.includes('almuerzo') || cat.includes('sopa') || cat.includes('postre') || cat.includes('cocina') || cat.includes('comida') || cat.includes('plato') || cat.includes('ración') || cat.includes('guiso') || cat.includes('ensalada')) {
    return 'cocinaAlmuerzos';
  }
  return 'tiendaAbarrotes';
}

export function isModuleActive(category: string, config?: BusinessConfig): boolean {
  if (!config) return true;

  const moduleKey = getModuleForCategory(category);

  if (config.modules) {
    if (moduleKey === 'frutería') return config.modules.fruteria;
    if (moduleKey === 'cocinaAlmuerzos') return config.modules.almuerzos;
    if (moduleKey === 'tiendaAbarrotes') return config.modules.tienda;
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
  return isPermitted && isActive;
}
