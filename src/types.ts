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
  categoryIcons?: Record<string, string>;
  licenseExpirationDate?: string; // YYYY-MM-DD
  licenseStatus?: 'active' | 'suspended'; // 'active' | 'suspended'
  licenseMessage?: string; // Custom block screen message
}

export type ActiveTab = 'Inventario' | 'Caja' | 'Reportes' | 'Comidas' | 'Compras' | 'Mant.' | 'Master';
