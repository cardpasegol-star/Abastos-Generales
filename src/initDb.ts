import { collection, writeBatch, doc, getDocs, deleteDoc, query, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, FoodItem, Transaction, BusinessConfig } from './types';
import { INITIAL_FRUTERIA_PRODUCTS, DEFAULT_FRUTERIA_CONFIG } from './modules/fruteria';

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
  productCategories: ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'],
  foodItemCategories: ['Almuerzos', 'Sopas', 'Postres', 'Bebidas'],
  fruteriaCategories: ['Frutas', 'Verduras', 'Frutos Secos', 'Semillas', 'Huevos', 'Mermeladas', 'Miel', 'Abarrotes / Varios'],
  farmaciaCategories: ['Medicamentos', 'Cuidado de la Salud', 'Mamá y Bebé', 'Cuidado Personal', 'Belleza', 'Vitaminas y Suplementos', 'Adulto Mayor', 'Conveniencia'],
  schedule: {
    openTime: '08:00',
    closeTime: '20:00',
    daysOpen: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    mode: 'auto'
  },
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
  },
  modules: {
    rutasCamion: true,
    fruteria: false,
    almuerzos: true,
    tienda: true
  },
  rutasCamion: {
    comunasDiarias: {
      name: "Comunas Diarias",
      comunas: ["Estación Central", "Independencia", "Quinta Normal", "Recoleta", "San Miguel", "Santiago Centro"],
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      fee: 3400
    },
    ejeCentral: {
      name: "Eje Central",
      comunas: ["Ñuñoa", "Providencia", "Santiago Centro"],
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      fee: 3400
    },
    norte: {
      name: "Sector Norte",
      comunas: ["Colina", "Conchalí", "Huechuraba", "Independencia", "Lampa", "Quilicura", "Recoleta", "Renca"],
      days: ["Lunes", "Jueves", "Sábado"],
      fee: 3400
    },
    poniente: {
      name: "Sector Poniente",
      comunas: ["Cerrillos", "Cerro Navia", "Estación Central", "Lo Prado", "Maipú", "Padre Hurtado", "Pedro Aguirre Cerda", "Peñaflor", "Pudahuel", "Quinta Normal", "Talagante"],
      days: ["Lunes", "Jueves"],
      fee: 3400
    },
    sur: {
      name: "Sector Sur",
      comunas: ["Buin", "Calera de Tango", "El Bosque", "La Cisterna", "La Granja", "La Pintana", "Lo Espejo", "Puente Alto", "San Bernardo", "San Ramón"],
      days: ["Martes", "Viernes", "Sábado"],
      fee: 3400
    },
    oriente: {
      name: "Sector Oriente",
      comunas: ["La Reina", "Las Condes", "Lo Barnechea", "Ñuñoa", "Peñalolén", "Providencia", "Vitacura"],
      days: ["Martes", "Miércoles", "Viernes"],
      fee: 3400
    },
    surOriente: {
      name: "Sector Sur Oriente",
      comunas: ["La Florida", "La Granja", "La Pintana", "Macul", "Pirque", "Puente Alto", "San Joaquín", "San José de Maipo", "San Miguel", "San Ramón"],
      days: ["Miércoles", "Sábado"],
      fee: 3400
    }
  }
};

export const INITIAL_FRUIT_PRODUCTS: Product[] = INITIAL_FRUTERIA_PRODUCTS;

export const INITIAL_ARTICO_PRODUCTS: Product[] = [
  {
    id: 'pack-huevos-12',
    sku: 'HUEV-12',
    name: 'Pack Huevos Yemita XL 12 Uds',
    category: 'Kits y Huevos',
    stock: 50,
    price: 3650,
    cost: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pack-huevos-20',
    sku: 'HUEV-20',
    name: 'Pack Huevos Yemita XL 20 Uds',
    category: 'Kits y Huevos',
    stock: 40,
    price: 5750,
    cost: 4100,
    imageUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'caja-huevos-180',
    sku: 'HUEV-180',
    name: 'Caja Huevos Yemita 180 Uds',
    category: 'Kits y Huevos',
    stock: 15,
    price: 36250,
    cost: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pulpa-frambuesa-1kg',
    sku: 'PULP-FRAMB',
    name: 'Pulpa de Frambuesa Minuto Verde 1kg',
    category: 'Congelados y Pulpas',
    stock: 30,
    price: 4500,
    cost: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'churrasco-vacuno-pack',
    sku: 'CHURR-VAC',
    name: 'Churrasco Vacuno (Formato Pack)',
    category: 'Carnes y Churrascos',
    stock: 25,
    price: 7900,
    cost: 5800,
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'kit-parrillero-8p',
    sku: 'KIT-PARR',
    name: 'Kit Parrillero (6 a 8 Personas)',
    category: 'Kits y Huevos',
    stock: 20,
    price: 24900,
    cost: 18500,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'hamburguesa-vacuno-pack4',
    sku: 'HAMB-PACK4',
    name: 'Hamburguesa Vacuno Pack 4 Uds',
    category: 'Hamburguesas y Prefritos',
    stock: 35,
    price: 4200,
    cost: 2900,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'filete-merluza-1kg',
    sku: 'FISH-MERL',
    name: 'Filete de Merluza Austral 1kg',
    category: 'Mariscos y Pescados',
    stock: 22,
    price: 6800,
    cost: 4800,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'queso-chanco-500g',
    sku: 'QUES-CHAN',
    name: 'Queso Chanco Trozo 500g',
    category: 'Refrigerados y Cecinas',
    stock: 28,
    price: 4900,
    cost: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  }
];

export const INITIAL_PIZZA_PRODUCTS: Product[] = [
  {
    id: 'pizza-margherita',
    sku: 'PZ-001',
    name: 'Pizza Margherita Artesanal (Masa Madre)',
    category: 'Pizzas',
    stock: 45,
    price: 9990,
    cost: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pizza-pepperoni',
    sku: 'PZ-002',
    name: 'Pizza Pepperoni Suprema a la Piedra',
    category: 'Pizzas',
    stock: 60,
    price: 10990,
    cost: 4800,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pizza-cuatro-quesos',
    sku: 'PZ-003',
    name: 'Pizza Cuatro Quesos Fina Selección',
    category: 'Pizzas',
    stock: 35,
    price: 11990,
    cost: 5200,
    imageUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pizza-mechada-bbq',
    sku: 'PZ-004',
    name: 'Pizza Mechada BBQ & Cebolla Caramelizada',
    category: 'Pizzas',
    stock: 40,
    price: 12990,
    cost: 5800,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pizza-napolitana',
    sku: 'PZ-005',
    name: 'Pizza Napolitana Especial con Jamón & Tomate',
    category: 'Pizzas',
    stock: 50,
    price: 10490,
    cost: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'pizza-vegetariana',
    sku: 'PZ-006',
    name: 'Pizza Vegetariana Rústica & Champiñones',
    category: 'Pizzas',
    stock: 30,
    price: 10990,
    cost: 4400,
    imageUrl: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'promo-duo-pizzas',
    sku: 'PR-2X1',
    name: 'Promo Dúo 2x Pizzas Familiares (Masa Madre)',
    category: 'Promociones 2x',
    stock: 25,
    price: 18990,
    cost: 8500,
    enOferta: true,
    precioOferta: 18990,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'promo-combo-completo',
    sku: 'PR-COMBO',
    name: 'Combo Familiar: Pizza + Palitos de Ajo + Bebida 1.5L',
    category: 'Promociones 2x',
    stock: 30,
    price: 14990,
    cost: 6200,
    enOferta: true,
    precioOferta: 14990,
    imageUrl: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'palitos-ajo-queso',
    sku: 'AC-001',
    name: 'Palitos de Ajo con Queso Parmesano & Orégano',
    category: 'Acompañamientos',
    stock: 80,
    price: 3990,
    cost: 1400,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'bastones-mozzarella',
    sku: 'AC-002',
    name: 'Bastones de Mozzarella Horneados (6 Uds)',
    category: 'Acompañamientos',
    stock: 45,
    price: 4990,
    cost: 1900,
    imageUrl: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'coca-cola-15',
    sku: 'BEB-001',
    name: 'Coca Cola Zero 1.5L',
    category: 'Bebidas',
    stock: 60,
    price: 2490,
    cost: 1400,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'sprite-15',
    sku: 'BEB-002',
    name: 'Sprite Lima Limón 1.5L',
    category: 'Bebidas',
    stock: 40,
    price: 2490,
    cost: 1400,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'tiramisu-italiano',
    sku: 'POS-001',
    name: 'Tiramisú Artesanal Italiano con Café Espresso',
    category: 'Postres',
    stock: 30,
    price: 3990,
    cost: 1600,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  },
  {
    id: 'calzone-nutella',
    sku: 'POS-002',
    name: 'Calzone Dulce Nutella & Frutilla Horneado',
    category: 'Postres',
    stock: 25,
    price: 4990,
    cost: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    updatedAt: new Date().toISOString(),
    unidadMedida: 'unidad'
  }
];

export function getTenantSpecificConfig(tenantId: string): BusinessConfig {
  const isTurco = tenantId.toLowerCase() === 'turco' || tenantId.toLowerCase() === 'el_turco';
  const isPrincipeGales = tenantId.toLowerCase() === 'fruteria_principe_gales' ||
                          tenantId.toLowerCase() === 'fruteria-principe' ||
                          tenantId.toLowerCase() === 'fruteria_principe' ||
                          tenantId.toLowerCase() === 'principe-gales' ||
                          tenantId.toLowerCase() === 'principe_gales' ||
                          tenantId.toLowerCase() === 'fruteria' ||
                          tenantId.toLowerCase() === 'frutería' ||
                          tenantId.toLowerCase() === 'fruteriaprincipegales' ||
                          tenantId.toLowerCase() === 'principe';
  const isFarmacia = tenantId.toLowerCase() === 'barrioseguro' || tenantId.toLowerCase() === 'farmacia';
  const isArtico = tenantId.toLowerCase().includes('artico') || tenantId.toLowerCase().includes('congelados');
  const isPasionPizzas = tenantId.toLowerCase() === 'pasion-pizzas' ||
                         tenantId.toLowerCase() === 'pasion_pizzas' ||
                         tenantId.toLowerCase() === 'pasion' ||
                         tenantId.toLowerCase() === 'pizzas' ||
                         tenantId.toLowerCase() === 'pasionpizzas';

  if (isPasionPizzas) {
    return {
      ...DEFAULT_CONFIG,
      id: 'business_info',
      name: 'Pizzería "Pasión por las Pizzas"',
      rut: '76.882.104-5',
      address: 'Av. Providencia #2450, Providencia',
      gps: 'Av. Providencia #2450, Providencia',
      bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
      whatsapp: '+56987659999',
      adminPin: '1234',
      productCategories: [
        'Pizzas',
        'Promociones 2x',
        'Acompañamientos',
        'Bebidas',
        'Postres',
        'Salsas y Extras'
      ],
      pizzaCategories: [
        'Pizzas',
        'Promociones 2x',
        'Acompañamientos',
        'Bebidas',
        'Postres',
        'Salsas y Extras'
      ],
      categoryIcons: {
        'Pizzas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Pizza.png',
        'Promociones 2x': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Symbols/Sparkles.png',
        'Acompañamientos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Baguette%20Bread.png',
        'Bebidas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Beverage%20Box.png',
        'Postres': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shortcake.png',
        'Salsas y Extras': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cooking.png'
      },
      rutasCamion: {
        'eje_central': {
          name: 'Sector Central / Providencia',
          comunas: ['Providencia', 'Ñuñoa', 'Santiago Centro', 'Las Condes', 'La Reina', 'Vitacura'],
          days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
          fee: 2500
        },
        'sector_oriente': {
          name: 'Sector Oriente / Cordillera',
          comunas: ['Lo Barnechea', 'Peñalolén', 'Macul'],
          days: ['Martes', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
          fee: 3000
        },
        'sector_sur': {
          name: 'Sector Sur / Florida',
          comunas: ['La Florida', 'San Miguel', 'San Joaquín', 'La Cisterna'],
          days: ['Miércoles', 'Viernes', 'Sábado', 'Domingo'],
          fee: 3200
        }
      },
      modulosPermitidos: {
        tiendaAbarrotes: true,
        cocinaAlmuerzos: false,
        bodega: true,
        farmacia: false,
        frutería: false
      },
      modulosActivos: {
        tiendaAbarrotes: true,
        cocinaAlmuerzos: false,
        bodega: true,
        farmacia: false,
        frutería: false
      },
      modules: {
        rutasCamion: true,
        fruteria: false,
        almuerzos: false,
        tienda: true
      }
    };
  }

  if (isArtico) {
    return {
      ...DEFAULT_CONFIG,
      id: 'business_info',
      name: 'Ártico Congelados',
      adminPin: '1234',
      gps: 'Av. Vicuña Mackenna #8500, La Florida',
      bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
      whatsapp: '+56987654321',
      productCategories: [
        'Carnes y Churrascos',
        'Hamburguesas y Prefritos',
        'Congelados y Pulpas',
        'Mariscos y Pescados',
        'Refrigerados y Cecinas',
        'Kits y Huevos'
      ],
      articoCategories: [
        'Carnes y Churrascos',
        'Hamburguesas y Prefritos',
        'Congelados y Pulpas',
        'Mariscos y Pescados',
        'Refrigerados y Cecinas',
        'Kits y Huevos'
      ],
      categoryIcons: {
        'Carnes y Churrascos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cut%20of%20Meat.png',
        'Hamburguesas y Prefritos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Hamburger.png',
        'Congelados y Pulpas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Travel%20and%20places/Ice.png',
        'Mariscos y Pescados': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Shrimp.png',
        'Refrigerados y Cecinas': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Cheese%20Wedge.png',
        'Kits y Huevos': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/Food%20Drink/Egg.png'
      },
      rutasCamion: {
        'sector_sur': { name: 'Sector Sur', comunas: ['La Florida', 'La Pintana', 'Puente Alto', 'San Bernardo', 'Maipú', 'San Miguel'], days: ['Martes', 'Jueves'], fee: 3000 },
        'sector_oriente': { name: 'Sector Oriente', comunas: ['Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 'Peñalolén'], days: ['Miércoles', 'Sábado'], fee: 3500 },
        'sector_poniente': { name: 'Sector Norte/Centro', comunas: ['Santiago Centro', 'Recoleta', 'Estación Central', 'Pudahuel'], days: ['Lunes', 'Viernes'], fee: 3200 }
      },
      modulosPermitidos: {
        tiendaAbarrotes: true,
        cocinaAlmuerzos: false,
        bodega: false,
        farmacia: false,
        frutería: false
      },
      modulosActivos: {
        tiendaAbarrotes: true,
        cocinaAlmuerzos: false,
        bodega: false,
        farmacia: false,
        frutería: false
      },
      modules: {
        rutasCamion: true,
        fruteria: false,
        almuerzos: false,
        tienda: true
      }
    };
  }

  if (isPrincipeGales) {
    return DEFAULT_FRUTERIA_CONFIG;
  }

  if (isFarmacia) {
    return {
      ...DEFAULT_CONFIG,
      id: 'business_info',
      name: 'Farmacia Barrio Seguro',
      adminPin: '1234',
      gps: 'Av. Providencia #1020, Providencia',
      bannerUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      whatsapp: '+56912341234',
      modulosPermitidos: {
        tiendaAbarrotes: false,
        cocinaAlmuerzos: false,
        bodega: false,
        farmacia: true,
        frutería: false
      },
      modulosActivos: {
        tiendaAbarrotes: false,
        cocinaAlmuerzos: false,
        bodega: false,
        farmacia: true,
        frutería: false
      },
      modules: {
        rutasCamion: false,
        fruteria: false,
        almuerzos: false,
        tienda: false
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
  const isPrincipeGales = tenantId.toLowerCase() === 'fruteria_principe_gales' ||
                          tenantId.toLowerCase() === 'fruteria-principe' ||
                          tenantId.toLowerCase() === 'fruteria_principe' ||
                          tenantId.toLowerCase() === 'principe-gales' ||
                          tenantId.toLowerCase() === 'principe_gales' ||
                          tenantId.toLowerCase() === 'fruteria' ||
                          tenantId.toLowerCase() === 'frutería' ||
                          tenantId.toLowerCase() === 'fruteriaprincipegales' ||
                          tenantId.toLowerCase() === 'principe';
  const isPasionPizzas = tenantId.toLowerCase() === 'pasion-pizzas' ||
                         tenantId.toLowerCase() === 'pasion_pizzas' ||
                         tenantId.toLowerCase() === 'pasion' ||
                         tenantId.toLowerCase() === 'pizzas' ||
                         tenantId.toLowerCase() === 'pasionpizzas';

  if (isPasionPizzas) {
    return [
      { id: 'emp-admin', name: 'Maestro Pizzero (Admin)', pin: '1234', role: 'admin' },
      { id: 'emp-cajero', name: 'Cajero / Delivery', pin: '4321', role: 'cajero' }
    ];
  }

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
      const isArticoTenant = tenantId.toLowerCase().includes('artico') || tenantId.toLowerCase().includes('congelados');
      const isFruteriaTenant = tenantId.toLowerCase() === 'fruteria_principe_gales' ||
                               tenantId.toLowerCase() === 'fruteria-principe' ||
                               tenantId.toLowerCase() === 'fruteria_principe' ||
                               tenantId.toLowerCase() === 'principe-gales' ||
                               tenantId.toLowerCase() === 'principe_gales' ||
                               tenantId.toLowerCase() === 'fruteria' ||
                               tenantId.toLowerCase() === 'frutería' ||
                               tenantId.toLowerCase() === 'fruteriaprincipegales' ||
                               tenantId.toLowerCase() === 'principe';
      const isPizzaTenant = tenantId.toLowerCase() === 'pasion-pizzas' ||
                            tenantId.toLowerCase() === 'pasion_pizzas' ||
                            tenantId.toLowerCase() === 'pasion' ||
                            tenantId.toLowerCase() === 'pizzas' ||
                            tenantId.toLowerCase() === 'pasionpizzas';
      const productsToSeed = isArticoTenant 
        ? INITIAL_ARTICO_PRODUCTS 
        : isFruteriaTenant 
        ? INITIAL_FRUIT_PRODUCTS 
        : isPizzaTenant
        ? INITIAL_PIZZA_PRODUCTS
        : INITIAL_PRODUCTS;

      productsToSeed.forEach(p => {
        batch.set(doc(db, 'tenants', tenantId, 'products', p.id), p);
      });

      // Write food items
      if (!isFruteriaTenant && !isArticoTenant && !isPizzaTenant) {
        INITIAL_FOOD_ITEMS.forEach(f => {
          batch.set(doc(db, 'tenants', tenantId, 'foodItems', f.id), f);
        });
      }

      // Write transactions
      if (!isFruteriaTenant) {
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

    const isArticoTenant = tenantId.toLowerCase().includes('artico') || tenantId.toLowerCase().includes('congelados');
    const isFruteriaTenant = tenantId.toLowerCase() === 'fruteria_principe_gales' ||
                             tenantId.toLowerCase() === 'fruteria-principe' ||
                             tenantId.toLowerCase() === 'fruteria_principe' ||
                             tenantId.toLowerCase() === 'principe-gales' ||
                             tenantId.toLowerCase() === 'principe_gales' ||
                             tenantId.toLowerCase() === 'fruteria' ||
                             tenantId.toLowerCase() === 'frutería' ||
                             tenantId.toLowerCase() === 'fruteriaprincipegales' ||
                             tenantId.toLowerCase() === 'principe';
    const isPizzaTenant = tenantId.toLowerCase() === 'pasion-pizzas' ||
                          tenantId.toLowerCase() === 'pasion_pizzas' ||
                          tenantId.toLowerCase() === 'pasion' ||
                          tenantId.toLowerCase() === 'pizzas' ||
                          tenantId.toLowerCase() === 'pasionpizzas';
    const productsToSeed = isArticoTenant 
      ? INITIAL_ARTICO_PRODUCTS 
      : isFruteriaTenant 
      ? INITIAL_FRUIT_PRODUCTS 
      : isPizzaTenant
      ? INITIAL_PIZZA_PRODUCTS
      : INITIAL_PRODUCTS;

    productsToSeed.forEach(p => {
      batch.set(doc(db, 'tenants', tenantId, 'products', p.id), p);
    });

    if (!isFruteriaTenant && !isArticoTenant && !isPizzaTenant) {
      INITIAL_FOOD_ITEMS.forEach(f => {
        batch.set(doc(db, 'tenants', tenantId, 'foodItems', f.id), f);
      });
    }

    if (!isFruteriaTenant) {
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
