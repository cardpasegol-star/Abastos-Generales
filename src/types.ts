export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Bebidas' | 'Abarrotes' | 'Lácteos' | 'Snacks';
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
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Almuerzos' | 'Sopas' | 'Postres' | 'Bebidas';
  isPopular: boolean;
  imageUrl: string;
}

export interface BusinessConfig {
  id: string;
  name: string;
  whatsapp: string;
  gps: string;
  adminPin: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export type ActiveTab = 'Inventario' | 'Caja' | 'Reportes' | 'Comidas' | 'Mant.';
