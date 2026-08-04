import { Product, BusinessConfig, Transaction, TransactionItem } from '../../types';

export interface TurkoProduct extends Product {
  store?: 'turco' | string;
  unidadMedida?: 'unidad' | 'kg' | 'g' | 'saco_5kg' | 'saco_10kg' | 'saco_25kg' | 'malla_3u' | 'malla_4u' | 'malla_5u' | 'malla_6u' | string;
  enOferta?: boolean;
  precioOferta?: number;
}

export interface TurkoCartItem {
  id: string;
  type: 'product';
  product: TurkoProduct;
  quantity: number;
  price: number;
  unidadMedida?: string;
  isOferta?: boolean;
}

export interface TurkoTransactionItem extends TransactionItem {
  quantity?: number; // Aliased to qty
}

export interface TurkoTransaction extends Transaction {
  storeId?: 'el_turco' | string;
  platformFee: number; // 10% tarifa de uso de plataforma
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: TurkoTransactionItem[];
}

export interface TurkoBusinessConfig extends BusinessConfig {
  rut?: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseStatus?: 'active' | 'suspended';
  licenseExpirationDate?: string;
  licenseMessage?: string;
  siiEnabled?: boolean;
}

export interface TurkoStoreStateData {
  config: TurkoBusinessConfig;
  inventory: TurkoProduct[];
  transactions: TurkoTransaction[];
  selectedComuna: string;
  lastSync: string;
}
