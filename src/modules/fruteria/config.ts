import { BusinessConfig, Product } from '../../types';
import { FruteriaBusinessConfig, FruteriaProduct } from './types';

export const FRUTERIA_STORE_CONFIG_KEY = 'fruteria_store_config';
export const FRUTERIA_INVENTORY_KEY = 'fruteria_inventory_data';
export const FRUTERIA_TRANSACTIONS_KEY = 'fruteria_transactions_data';
export const FRUTERIA_DATA_LEGACY_KEY = 'FRUTERIA_DATA';
export const FRUTERIA_TENANT_ID = 'fruteria_principe_gales';

export const DEFAULT_FRUTERIA_CONFIG: FruteriaBusinessConfig = {
  id: 'business_info',
  name: 'Frutería & Verdulería "Príncipe de Gales"',
  rut: '76.994.512-3',
  address: 'Av. Príncipe de Gales #5800, Ñuñoa / La Reina',
  phone: '+56920262026',
  email: 'contacto@fruteriaprincipedegales.cl',
  gps: 'Av. Príncipe de Gales #5800, Ñuñoa',
  bannerUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800',
  whatsapp: '+56920262026',
  adminPin: '2026',
  licenseStatus: 'active',
  licenseExpirationDate: '2028-12-31',
  licenseMessage: 'Licencia Activa - Módulo Independiente Frutería Príncipe de Gales',
  ivaPercentage: 15,
  siiEnabled: true,
  fruteriaCategories: [
    'Frutas',
    'Verduras',
    'Frutos Secos',
    'Semillas',
    'Huevos',
    'Mermeladas',
    'Miel',
    'Abarrotes / Varios'
  ],
  productCategories: [
    'Frutas',
    'Verduras',
    'Frutos Secos',
    'Semillas',
    'Huevos',
    'Mermeladas',
    'Miel',
    'Abarrotes / Varios'
  ],
  categoryIcons: {
    'Frutas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Red%20Apple.png',
    'Verduras': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Broccoli.png',
    'Frutos Secos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Peanuts.png',
    'Semillas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beans.png',
    'Huevos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png',
    'Mermeladas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Honey%20Pot.png',
    'Miel': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Animals/Honeybee.png',
    'Abarrotes / Varios': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Objects/Package.png'
  },
  schedule: {
    openTime: '07:30',
    closeTime: '20:30',
    daysOpen: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    mode: 'auto'
  },
  rutasCamion: {
    oriente: {
      name: "Sector Oriente / La Reina & Las Condes",
      comunas: ["La Reina", "Las Condes", "Lo Barnechea", "Ñuñoa", "Peñalolén", "Providencia", "Vitacura"],
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      fee: 2500
    },
    central: {
      name: "Eje Central / Santiago Centro & San Miguel",
      comunas: ["Santiago Centro", "San Miguel", "San Joaquín", "Macul", "Independencia", "Recoleta"],
      days: ["Lunes", "Miércoles", "Viernes", "Sábado"],
      fee: 3000
    },
    sur: {
      name: "Sector Sur / Florida & La Pintana",
      comunas: ["La Florida", "La Pintana", "Puente Alto", "San Bernardo", "La Cisterna", "La Granja", "San Ramón"],
      days: ["Martes", "Jueves", "Sábado"],
      fee: 3200
    },
    poniente: {
      name: "Sector Poniente / Maipú & Estación Central",
      comunas: ["Estación Central", "Maipú", "Quinta Normal", "Pudahuel", "Cerrillos"],
      days: ["Lunes", "Jueves"],
      fee: 3400
    }
  },
  modulosPermitidos: {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: false,
    bodega: true,
    farmacia: false,
    frutería: true
  },
  modulosActivos: {
    tiendaAbarrotes: false,
    cocinaAlmuerzos: false,
    bodega: true,
    farmacia: false,
    frutería: true
  },
  modules: {
    rutasCamion: true,
    fruteria: true,
    almuerzos: false,
    tienda: false
  }
};

export const INITIAL_FRUTERIA_PRODUCTS: FruteriaProduct[] = [
  {
    id: 'gales-manzana-roja',
    sku: 'FR-001',
    name: 'Manzana Roja Royal Gala',
    category: 'Frutas',
    stock: 120,
    price: 1890,
    cost: 950,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-platano',
    sku: 'FR-002',
    name: 'Plátano Cavendish Premium',
    category: 'Frutas',
    stock: 95,
    price: 1490,
    cost: 700,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-frutilla',
    sku: 'FR-003',
    name: 'Frutilla Seleccionada Dulce',
    category: 'Frutas',
    stock: 50,
    price: 2500,
    cost: 1500,
    unidadMedida: 'g',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-limon',
    sku: 'FR-004',
    name: 'Limón Sutil Jugoso',
    category: 'Frutas',
    stock: 130,
    price: 1690,
    cost: 800,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-naranja',
    sku: 'FR-005',
    name: 'Naranja Valencia para Jugo',
    category: 'Frutas',
    stock: 100,
    price: 1390,
    cost: 650,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-arandanos',
    sku: 'FR-006',
    name: 'Arándanos Frescos Exportación',
    category: 'Frutas',
    stock: 40,
    price: 1990,
    cost: 1100,
    unidadMedida: 'g',
    imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-tomate',
    sku: 'VD-001',
    name: 'Tomate Larga Vida Grado 1',
    category: 'Verduras',
    stock: 80,
    price: 1990,
    cost: 1100,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-palta-hass',
    sku: 'VD-002',
    name: 'Palta Hass Cruz Premium',
    category: 'Verduras',
    stock: 60,
    price: 4990,
    cost: 3200,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString(),
    enOferta: true,
    precioOferta: 3990
  },
  {
    id: 'gales-papas',
    sku: 'VD-003',
    name: 'Papa Patagonia Seleccionada',
    category: 'Verduras',
    stock: 250,
    price: 1200,
    cost: 600,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-cebolla',
    sku: 'VD-004',
    name: 'Cebolla de Guarda Limache',
    category: 'Verduras',
    stock: 150,
    price: 990,
    cost: 450,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-zanahoria',
    sku: 'VD-005',
    name: 'Zanahoria Dulce Fina',
    category: 'Verduras',
    stock: 110,
    price: 1100,
    cost: 500,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-lechuga-costina',
    sku: 'VD-006',
    name: 'Lechuga Costina Hidropónica',
    category: 'Verduras',
    stock: 45,
    price: 1190,
    cost: 550,
    unidadMedida: 'unidad',
    imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-nueces',
    sku: 'FS-001',
    name: 'Nueces Mariposa Peladas Grado Extra',
    category: 'Frutos Secos',
    stock: 35,
    price: 4800,
    cost: 2900,
    unidadMedida: 'g',
    imageUrl: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-almendras',
    sku: 'FS-002',
    name: 'Almendras Non Pareil Tostadas Naturales',
    category: 'Frutos Secos',
    stock: 40,
    price: 4500,
    cost: 2700,
    unidadMedida: 'g',
    imageUrl: 'https://images.unsplash.com/photo-1508061252966-f72fb402945d?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-semillas-chia',
    sku: 'SEM-001',
    name: 'Semillas de Chía Premium 500g',
    category: 'Semillas',
    stock: 30,
    price: 2890,
    cost: 1600,
    unidadMedida: 'g',
    imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-huevos-campo-12',
    sku: 'HUE-001',
    name: 'Huevos de Campo Gallina Libre (Bandeja 12u)',
    category: 'Huevos',
    stock: 55,
    price: 3890,
    cost: 2600,
    unidadMedida: 'unidad',
    imageUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-miel-ulmo',
    sku: 'MIE-001',
    name: 'Miel de Ulmo Nativa del Sur 1kg',
    category: 'Miel',
    stock: 25,
    price: 6990,
    cost: 4200,
    unidadMedida: 'unidad',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-mermelada-frutilla',
    sku: 'MER-001',
    name: 'Mermelada Casera Frutilla de Temporada 500g',
    category: 'Mermeladas',
    stock: 20,
    price: 3490,
    cost: 1900,
    unidadMedida: 'unidad',
    imageUrl: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?auto=format&fit=crop&q=80&w=400',
    store: 'fruteria',
    updatedAt: new Date().toISOString()
  }
];

export function isFruteriaTenant(tenantId?: string | null): boolean {
  if (!tenantId) return false;
  const clean = tenantId.toLowerCase().trim();
  return (
    clean === 'fruteria_principe_gales' ||
    clean === 'fruteria-principe' ||
    clean === 'fruteria_principe' ||
    clean === 'principe-gales' ||
    clean === 'principe_gales' ||
    clean === 'fruteria' ||
    clean === 'frutería' ||
    clean === 'fruteriaprincipegales' ||
    clean === 'principe'
  );
}

export function getFruteriaStoredConfig(): FruteriaBusinessConfig {
  try {
    const saved = localStorage.getItem(FRUTERIA_STORE_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_FRUTERIA_CONFIG;
}

export function saveFruteriaConfig(config: BusinessConfig): void {
  try {
    localStorage.setItem(FRUTERIA_STORE_CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(`config_${FRUTERIA_TENANT_ID}`, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving Frutería config:', err);
  }
}

export function getFruteriaStoredInventory(): FruteriaProduct[] {
  try {
    const saved = localStorage.getItem(FRUTERIA_INVENTORY_KEY) || localStorage.getItem(`products_${FRUTERIA_TENANT_ID}`) || localStorage.getItem(FRUTERIA_DATA_LEGACY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_FRUTERIA_PRODUCTS;
}

export function saveFruteriaInventory(products: FruteriaProduct[]): void {
  try {
    localStorage.setItem(FRUTERIA_INVENTORY_KEY, JSON.stringify(products));
    localStorage.setItem(`products_${FRUTERIA_TENANT_ID}`, JSON.stringify(products));
    localStorage.setItem(FRUTERIA_DATA_LEGACY_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving Frutería inventory:', err);
  }
}

export function getFruteriaFormattedChileDate(): string {
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
