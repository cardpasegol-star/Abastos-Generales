import { collection, writeBatch, doc, getDocs, deleteDoc, query, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, FoodItem, Transaction, BusinessConfig } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'cola-classic',
    sku: 'CC-001',
    name: 'Cola Classic 350ml',
    category: 'Bebidas',
    stock: 48,
    price: 1.50,
    cost: 1.10,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFlYMgz-vIQcuMIgjuYTAgcl-nd2AxDuI4_1FzyqcDEeVhAdW0OMPH_hMf-2C_eoEWwjLtXF4OE6iINZPMLbLMPO44e1oZxox9whWwTNOL4EEpG_rzZKLM-LTzue0SQzGQv6aW0DnZNBvZt71AsIjOj2IF7awSBI9J_pOpz9wbMiCISokAb8O2qvKoM3MgiKcse0wWbI4-VgkmYMCKIXWaneBXBg2GJxZR3Ky7cG2N7kn_qQSEnxMVl57dbd74Es_rMsFscsjqwjk',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pan-artesanal',
    sku: 'AB-502',
    name: 'Pan Artesanal',
    category: 'Abarrotes',
    stock: 3,
    price: 3.25,
    cost: 2.10,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr8u8wXDvpaNlG_Zq4Ebyy33Hy-gCEr5nVQiTk5CEI0Sva5jVF_J0WcfbJBeFSQsdIC5oP2vvQfC4mldu51JTs-gse8Xo9Zj_NFsaRcSvMoUW7EG_9wpJ4NqTZ-2IX0YinKfCGy_bapUtHhNVVbItz8ULk1KAo_dfFhbeN6srciOXmYuCynlfhrjZKOo9oyUKBd1kL_SYuZBxkvd2zEShZhfvVp4mffGMPr_1zkFzK7u8UC6koC1VsKpC1pOQEAMTzsE-KJkN743o',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'leche-entera',
    sku: 'LE-092',
    name: 'Leche Entera 1L',
    category: 'Lácteos',
    stock: 0,
    price: 2.10,
    cost: 1.50,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfltLCYu3aB_3sd7mXGNlKGUjdV6mTGvaP8oLfH1ogkMUYzcysGwRqOHRlAIVNQfCncW2GfIvIpU05SFsHLsl7ibHcRbvnvri5c9JQ10kOaWz6PD9Ka3J3TGNh4anl0fKMxhmQ0iU7LziNgPkg4SnyTKmNmNEfFcnoMykBP3p2ZKqXjGgpdqlro8hwr2EaVDjhuSsQmJDerBcEwcSAlT-DAyF2m5UxA4pay_IrcpQdwU7ZgbhuaC4rmLEvnFUG227N0SrfINWzYqg',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'papas-fritas',
    sku: 'PF-203',
    name: 'Papas Fritas XL',
    category: 'Snacks',
    stock: 112,
    price: 1.80,
    cost: 0.90,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUF1NcIGYG2T3McNvhGUjed9u7fCunvxJ2UatiMBW1uGyTFK6frS3_ftz2XVCDronGS_zK23LrBTEEgg24yu5t3fj5TZu6L5pzpr6_jbJY5O6cudx5unBBU_yAwOQYwOrUr7Cv5ztUr02HzuHu0wXRjn3Q-qYwiKuHd38sjhTvRDDtwKEorPVyhYQfpJy6fad_aE1Svbe5pN8Xf2agc2pxkAmEfk0Wnla_3u8hQStkl7b1pMzBvIo0cza8sl5VfTO5lx6RXEm6Pws',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'aguacate-hass',
    sku: 'AH-008',
    name: 'Aguacate Hass',
    category: 'Abarrotes',
    stock: 75,
    price: 1.50,
    cost: 1.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHwCOIzMAguRTJrr8d3e9LlqCNrcvXChDmwyJ1INeC785VEq3zcb45qJdduZ9B6w7bfW9jjndYhiQPZj7lj26Bgi1WzCZVsFJsuBcFxJpotpFRcpH2zYvlED5lNmPNsJVcxg8CNTNelLVp8qzpLtmTDTVKRDElFVy3faTWb2hpCI_4taE5AeM4sj72NwNWlIRla2wcowcktVwejxl7gXRzeZFXDH5jzXm92SUW4wybAAAKORVhJec7LUNiT2kSro5ZAvRcsE02h4',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'naranjas',
    sku: 'NDO-012',
    name: 'Naranjas de Ombligo',
    category: 'Abarrotes',
    stock: 45,
    price: 3.00,
    cost: 1.80,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7Odb9m9LVBsEv4N50b5NJeq4bSmQe9fWnrbQ_MFFXlflgpuektEG3pJlhrq7JEaqzZrPWP2wTS98S5M9PtW9BzjAdNjOSiwD1Y3PD5dMyCLmBdA2gQh4D-irqFYEnTAYsx4taGp5CeNQPF3IVGtIqXbNothSbFsLQ_mciNmM9EkZh-UbZ01BldH3wTPcc1FpP7CPqXQtAZ-XoR8rA9IeA4qX1I2omsgUwU-vJzzLY6QnBDuq3vZ9EIEmaLMtEC2tf8Z2no7Dvw0',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'aceite-oliva',
    sku: 'AOV-099',
    name: 'Aceite Oliva Extra V.',
    category: 'Abarrotes',
    stock: 12,
    price: 8.50,
    cost: 5.20,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0w6AWq-EHcBx5SuE1-ScX63fUy0pIOosoofZhQgWqRScufztzr1Cf2VtxDJmQVWbXZ3jwI5MHC640Tl9S-TPjjKr3mbyNjtKH0lwvpmtd16tk4KmQIbDOEpGxPoV9ekw_84kwl4Uebrv2OkS-9u84SA7YXTiFaDx-bNGvjGiM1j56mtdqwCMCuCArG-m3tmWksTH_a83vwvtRkNRyd3Xo8H6ZQD-O8nilMNJt70pim4Hz42_qeiAvcSLQ_jYF89-NYb-FPWUMklw',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'pabellon-criollo',
    name: 'Pabellón Criollo',
    description: 'Arroz blanco, caraotas negras, tajadas de plátano maduro frito y carne mechada sazonada.',
    price: 12.50,
    category: 'Almuerzos',
    isPopular: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZGkEK86Q0nNTrG6inQW-G1OMt1n81iie1V8Sq1tw0tub2jRTHeLBdBUBDJwlG0x8FU06tMv1_8sYsuxcqnFb-8CgDeefs_PEgLU80PkcSu2B26gKyNvMJWNh0tO_fUDEZ0ZFaFByJbw_pHdIaBuPqNkvMtHGDNybR37BG_VJvt9L_32Kw7-4e3N-ZvbvOwlB96bvO3BsKSFmG-LU8qeZPO-5L0nyqzXAFsWRJFm8HganU39ANdhUxWqR0aOtxlLI3XUWnxg0mj-A'
  },
  {
    id: 'lasana-casera',
    name: 'Lasaña Casera',
    description: 'Capas de pasta artesanal con abundante salsa boloñesa, bechamel y queso gratinado.',
    price: 10.00,
    category: 'Almuerzos',
    isPopular: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE8lYhB0hF9l_RmLV_XXXRe-DWzgkl6g4rz4A8m5hMktpE18pwZscnI0IlGisLvmSk0O-s-KmHtdDmGci3lmjyKbRZNPe0kmLoGLYvY8OqvmRnKlP1Oy80xaRKjHTrvnhOywnttIiNtdyP3g5GWoFPuDLlzG1swZJyvPZNuHzPhAd_a3muY3Wj5-0yS3sadLtZnxzfzlBpxhQ6IX-Q2n_Anud1bnJc2dkwefPl7dh-dLPjCx2LgPxRXXSS3oTSRRvdWOHpfSzBFuM'
  },
  {
    id: 'sancocho-gallina',
    name: 'Sancocho de Gallina',
    description: 'Sopa espesa tradicional con verduras frescas, cilantro y presa de gallina de campo.',
    price: 8.00,
    category: 'Sopas',
    isPopular: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJGRzSBAf5dF6ruR3k7vFH9vhaZcQnUW0zaWK2MSACvNhBMcHaR2zEIaQiNBANmAn0vUAK7mf3iTp6qCXZUrSQfSGdlf2fxwvD3X5u9fGUllTDPEngY_Yc3AtZBLxGd3rUiWtA6V_m6XZ3PFFY6zWdUQKIpqDwNp6pn2nahGN8B-wnVSNvWqsY_WdY3UFGJGWYyM4Udf1SmdnwSwg9phchFwPVBQ7hvKxLr_o1RxvzrHqOHYQPxv4v6HFWw_mZARdHqdhKogGCEdc'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-842',
    type: 'Venta',
    items: [
      { productId: 'aguacate-hass', name: 'Aguacate Hass', qty: 2, price: 1.50 },
      { productId: 'leche-entera', name: 'Leche Entera 1L', qty: 1, price: 2.25 },
      { productId: 'pan-artesanal', name: 'Pan Artesanal', qty: 1, price: 4.50 }
    ],
    subtotal: 9.75,
    tax: 1.46,
    total: 11.21,
    method: 'Efectivo',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'tx-841',
    type: 'Venta',
    items: [
      { productId: 'pan-artesanal', name: 'Pan Artesanal', qty: 3, price: 3.25 }
    ],
    subtotal: 9.75,
    tax: 1.46,
    total: 11.21,
    method: 'Tarjeta',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
  },
  {
    id: 'tx-840',
    type: 'Venta',
    items: [
      { productId: 'papas-fritas', name: 'Papas Fritas XL', qty: 50, price: 1.80 }
    ],
    subtotal: 90.00,
    tax: 13.50,
    total: 103.50,
    method: 'Efectivo',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'tx-839',
    type: 'Venta',
    items: [
      { productId: 'cola-classic', name: 'Cola Classic 350ml', qty: 3, price: 1.50 }
    ],
    subtotal: 4.50,
    tax: 0.68,
    total: 5.18,
    method: 'Tarjeta',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString() // 7 hours ago
  }
];

export const DEFAULT_CONFIG: BusinessConfig = {
  id: 'business_info',
  name: 'Donde el Goyo',
  whatsapp: '+5491112345678',
  gps: 'Calle Principal #123',
  adminPin: '1234',
  bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
  ivaPercentage: 15,
  licenseExpirationDate: '2026-12-31',
  licenseStatus: 'active',
  licenseMessage: 'Su acceso ha vencido o se encuentra suspendido. Por favor, regularice su servicio mensual contactando al administrador.',
  mostrarAlmuerzos: true,
  modulosActivos: {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: true,
    farmacia: true,
    frutería: true
  },
  modulosPermitidos: {
    tiendaAbarrotes: true,
    cocinaAlmuerzos: true,
    bodega: false,
    farmacia: false,
    frutería: false
  }
};

const INITIAL_FRUIT_PRODUCTS: Product[] = [
  {
    id: 'gales-manzana-roja',
    sku: 'FR-001',
    name: 'Manzana Roja Royal Gala',
    category: 'Frutas Frescas',
    stock: 120,
    price: 1890,
    cost: 950,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-platano',
    sku: 'FR-002',
    name: 'Plátano Cavendish',
    category: 'Frutas',
    stock: 95,
    price: 1490,
    cost: 700,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-tomate',
    sku: 'VD-001',
    name: 'Tomate Larga Vida',
    category: 'Verduras',
    stock: 80,
    price: 1990,
    cost: 1100,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-palta-hass',
    sku: 'VD-002',
    name: 'Palta Hass Premium',
    category: 'Verduras',
    stock: 60,
    price: 4990,
    cost: 3200,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString(),
    enOferta: true,
    precioOferta: 3990
  },
  {
    id: 'gales-frutilla',
    sku: 'FR-003',
    name: 'Frutilla Seleccionada',
    category: 'Frutas',
    stock: 50,
    price: 2500,
    cost: 1500,
    unidadMedida: 'g',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-papas',
    sku: 'VD-003',
    name: 'Papa Patagonia',
    category: 'Verduras',
    stock: 250,
    price: 1200,
    cost: 600,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-cebolla',
    sku: 'VD-004',
    name: 'Cebolla Guarda',
    category: 'Verduras',
    stock: 150,
    price: 990,
    cost: 450,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-zanahoria',
    sku: 'VD-005',
    name: 'Zanahoria',
    category: 'Verduras',
    stock: 110,
    price: 1100,
    cost: 500,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gales-limon',
    sku: 'FR-004',
    name: 'Limón Sutil',
    category: 'Frutas',
    stock: 130,
    price: 1690,
    cost: 800,
    unidadMedida: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=300',
    updatedAt: new Date().toISOString()
  }
];

export function getTenantSpecificConfig(tenantId: string): BusinessConfig {
  const isTurco = tenantId.toLowerCase() === 'turco' || tenantId.toLowerCase() === 'el_turco';
  const isPrincipeGales = tenantId.toLowerCase() === 'fruteria_principe_gales' || tenantId.toLowerCase() === 'principe_gales';

  if (isPrincipeGales) {
    return {
      ...DEFAULT_CONFIG,
      id: 'business_info',
      name: 'Frutería Príncipe de Gales',
      adminPin: '2026',
      gps: 'Av. Príncipe de Gales #5800, Ñuñoa',
      bannerUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800',
      whatsapp: '+56920262026',
      modulosPermitidos: {
        tiendaAbarrotes: true,
        cocinaAlmuerzos: false,
        bodega: false,
        farmacia: false,
        frutería: true
      },
      modulosActivos: {
        tiendaAbarrotes: false,
        cocinaAlmuerzos: false,
        bodega: false,
        farmacia: false,
        frutería: true
      }
    };
  }

  const formattedName = tenantId.charAt(0).toUpperCase() + tenantId.slice(1);
  return {
    ...DEFAULT_CONFIG,
    name: isTurco ? 'Minimarket Virtual "DondeElTurco"' : `Minimarket "${formattedName}"`,
    bannerUrl: isTurco 
      ? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800'
      : DEFAULT_CONFIG.bannerUrl,
    gps: isTurco ? 'Av. Holanda #123' : DEFAULT_CONFIG.gps,
  };
}

export function getTenantEmployees(tenantId: string) {
  const isTurco = tenantId.toLowerCase() === 'turco' || tenantId.toLowerCase() === 'el_turco';
  const isPrincipeGales = tenantId.toLowerCase() === 'fruteria_principe_gales' || tenantId.toLowerCase() === 'principe_gales';

  if (isPrincipeGales) {
    return [
      { id: 'emp-admin', name: 'Admin Príncipe de Gales', pin: '2026', role: 'admin' },
      { id: 'emp-cajero', name: 'Cajero Príncipe de Gales', pin: '4321', role: 'cajero' }
    ];
  }

  return [
    { id: 'emp-admin', name: isTurco ? 'Don Elías' : 'Don Goyo', pin: '1234', role: 'admin' },
    { id: 'emp-cajero', name: 'Empleado Cajero', pin: '4321', role: 'cajero' }
  ];
}

export async function bootstrapDatabaseIfEmpty(tenantId: string) {
  try {
    // 1. Check if config info exists for this tenant
    const configSnap = await getDocs(collection(db, 'tenants', tenantId, 'config'));
    if (configSnap.empty) {
      console.log(`Database empty for tenant "${tenantId}". Bootstrapping assets...`);
      const batch = writeBatch(db);

      const tenantConfig = getTenantSpecificConfig(tenantId);

      // Write config
      batch.set(doc(db, 'tenants', tenantId, 'config', DEFAULT_CONFIG.id), tenantConfig);

      // Write products
      const productsToSeed = tenantId.toLowerCase() === 'fruteria_principe_gales' ? INITIAL_FRUIT_PRODUCTS : INITIAL_PRODUCTS;
      productsToSeed.forEach(p => {
        batch.set(doc(db, 'tenants', tenantId, 'products', p.id), p);
      });

      // Write food items
      if (tenantId.toLowerCase() !== 'fruteria_principe_gales' && tenantId.toLowerCase() !== 'principe_gales') {
        INITIAL_FOOD_ITEMS.forEach(f => {
          batch.set(doc(db, 'tenants', tenantId, 'foodItems', f.id), f);
        });
      }

      // Write transactions
      if (tenantId.toLowerCase() !== 'fruteria_principe_gales' && tenantId.toLowerCase() !== 'principe_gales') {
        INITIAL_TRANSACTIONS.forEach(t => {
          batch.set(doc(db, 'tenants', tenantId, 'transactions', t.id), t);
        });
      }

      await batch.commit();
      console.log(`Booster successfully committed for tenant "${tenantId}".`);
    }

    // 2. Ensure "empleados" subcollection exists and is populated under config/business_info
    const empleadosRef = collection(db, 'tenants', tenantId, 'config', 'business_info', 'empleados');
    const empleadosSnap = await getDocs(empleadosRef);
    if (empleadosSnap.empty) {
      console.log(`Bootstrapping default employees in tenants/${tenantId}/config/business_info/empleados...`);
      const batch = writeBatch(db);
      const defaultEmployees = getTenantEmployees(tenantId);
      defaultEmployees.forEach(emp => {
        batch.set(doc(db, 'tenants', tenantId, 'config', 'business_info', 'empleados', emp.id), emp);
      });
      await batch.commit();
      console.log('Employees bootstrapped successfully.');
    }
  } catch (err) {
    console.error('Error bootstrapping db:', err);
  }
}

export async function resetDatabaseToDefault(tenantId: string) {
  const collections = ['products', 'transactions', 'foodItems', 'config'];

  try {
    const batch = writeBatch(db);

    // Delete existing documents in root collections
    for (const coll of collections) {
      const snap = await getDocs(collection(db, 'tenants', tenantId, coll));
      snap.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
    }

    // Also delete any subcollection documents of config/business_info/empleados
    const empSnap = await getDocs(collection(db, 'tenants', tenantId, 'config', 'business_info', 'empleados'));
    empSnap.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    // Set defaults
    const tenantConfig = getTenantSpecificConfig(tenantId);
    batch.set(doc(db, 'tenants', tenantId, 'config', DEFAULT_CONFIG.id), tenantConfig);

    const productsToSeed = tenantId.toLowerCase() === 'fruteria_principe_gales' ? INITIAL_FRUIT_PRODUCTS : INITIAL_PRODUCTS;
    productsToSeed.forEach(p => {
      batch.set(doc(db, 'tenants', tenantId, 'products', p.id), p);
    });

    if (tenantId.toLowerCase() !== 'fruteria_principe_gales' && tenantId.toLowerCase() !== 'principe_gales') {
      INITIAL_FOOD_ITEMS.forEach(f => {
        batch.set(doc(db, 'tenants', tenantId, 'foodItems', f.id), f);
      });
    }

    if (tenantId.toLowerCase() !== 'fruteria_principe_gales' && tenantId.toLowerCase() !== 'principe_gales') {
      INITIAL_TRANSACTIONS.forEach(t => {
        batch.set(doc(db, 'tenants', tenantId, 'transactions', t.id), t);
      });
    }

    // Seed default employees on reset
    const defaultEmployees = getTenantEmployees(tenantId);
    defaultEmployees.forEach(emp => {
      batch.set(doc(db, 'tenants', tenantId, 'config', 'business_info', 'empleados', emp.id), emp);
    });

    await batch.commit();
    console.log(`Database reset committed for tenant "${tenantId}".`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tenants/${tenantId}/reset_database`);
  }
}
