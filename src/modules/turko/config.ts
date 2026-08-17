import { BusinessConfig } from '../../types';
import { TurkoProduct, TurkoBusinessConfig } from './types';
import { safeLocalStorageSetItem } from '../../utils';

export const TURKO_STORE_DATA_KEY = 'turko_store_data';
export const TURKO_STORE_CONFIG_KEY = 'turko_store_config';
export const TURKO_INVENTORY_KEY = 'turko_inventory_data';
export const TURKO_TRANSACTIONS_KEY = 'turko_transactions_data';
export const TURKO_PLATFORM_FEE_PERCENTAGE = 0.10;

export const DEFAULT_TURKO_CONFIG: TurkoBusinessConfig = {
  id: 'business_info_turko',
  name: 'Minimarket Virtual "DondeElTurco"',
  rut: '77.892.341-9',
  address: 'Av. Holanda #123, La Pintana',
  phone: '+56912345678',
  email: 'contacto@dondelturco.cl',
  gps: 'Av. Holanda #123, La Pintana',
  bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800',
  whatsapp: '+56912345678',
  adminPin: '1234',
  licenseStatus: 'active',
  licenseExpirationDate: '2028-12-31',
  licenseMessage: 'Licencia Activa - Módulo El Turko',
  ivaPercentage: 15,
  siiEnabled: true,
  modulosPermitidos: {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: true,
    farmacia: false,
    frutería: true
  },
  modulosActivos: {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: false,
    bodega: true,
    farmacia: false,
    frutería: true
  },
  modules: {
    rutasCamion: true,
    fruteria: true,
    almuerzos: false,
    tienda: true
  },
  productCategories: [
    'Abarrotes',
    'Bebidas',
    'Lácteos',
    'Snacks',
    'Frutas y Verduras',
    'Aseo y Limpieza',
    'Panadería y Pastelería'
  ]
};

export function getTurkoStoredConfig(): TurkoBusinessConfig {
  try {
    const saved = localStorage.getItem(TURKO_STORE_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_TURKO_CONFIG;
}

export function saveTurkoConfig(config: BusinessConfig): void {
  try {
    safeLocalStorageSetItem(TURKO_STORE_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Error saving Turko config:', err);
  }
}

export function getTurkoStoredInventory(): TurkoProduct[] {
  try {
    const saved = localStorage.getItem(TURKO_INVENTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveTurkoInventory(products: TurkoProduct[]): void {
  try {
    safeLocalStorageSetItem(TURKO_INVENTORY_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Error saving Turko inventory:', err);
  }
}

export function getTurkoFormattedChileDate(): string {
  try {
    return new Date().toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  } catch {
    return new Date().toLocaleString();
  }
}
