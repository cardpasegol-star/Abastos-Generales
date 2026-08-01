import { BusinessConfig } from '../types';

export interface PharmacyBarcodeResult {
  found: boolean;
  name: string;
  imageUrl: string;
  category: string;
  brand?: string;
  specifications?: string;
  description?: string;
  source?: string;
}

/**
 * Validates if the user is currently operating in the Pharmacy ("Farmacia" or "Barrio Seguro") application/module.
 */
export function isPharmacyApp(config?: BusinessConfig, currentTenantId?: string | null): boolean {
  if (currentTenantId) {
    const tid = currentTenantId.trim().toLowerCase();
    if (tid === 'farmacia' || tid === 'barrioseguro') return true;
  }

  if (config) {
    const storeKey = (config.storeKey || (config as any).appId || '').toString().toLowerCase();
    if (storeKey === 'farmacia' || storeKey === 'barrioseguro') return true;

    const name = (config.name || '').toLowerCase();
    if (name.includes('farmacia') || name.includes('barrio seguro') || name.includes('farma')) return true;
  }

  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTienda = (params.get('tienda') || params.get('id_tienda') || params.get('modulo') || '').trim().toLowerCase();
      if (urlTienda === 'farmacia' || urlTienda === 'barrioseguro') return true;

      const savedTenant = (localStorage.getItem('tenant_tienda_id') || localStorage.getItem('id_tienda') || '').trim().toLowerCase();
      if (savedTenant === 'farmacia' || savedTenant === 'barrioseguro') return true;
    } catch (e) {
      // Ignore window/storage errors
    }
  }

  return false;
}

/**
 * Maps raw tags/titles to the official 8 Farmacia Categories
 */
export function mapPharmacyCategory(tagsOrText: string[], nameStr: string = ''): string {
  const text = (tagsOrText.join(' ') + ' ' + nameStr).toLowerCase();

  if (text.includes('medicamento') || text.includes('pill') || text.includes('tableta') || text.includes('comprimido') || text.includes('jarabe') || text.includes('fármaco') || text.includes('farmaco') || text.includes('analgésico') || text.includes('antibiótico') || text.includes('remedio') || text.includes('remedies')) {
    return 'Medicamentos';
  }
  if (text.includes('bebé') || text.includes('bebe') || text.includes('baby') || text.includes('mamá') || text.includes('mama') || text.includes('biberón') || text.includes('pañal') || text.includes('leche infantil') || text.includes('formula')) {
    return 'Mamá y Bebé';
  }
  if (text.includes('belleza') || text.includes('cosmétic') || text.includes('maquillaje') || text.includes('labial') || text.includes('facial') || text.includes('sérum') || text.includes('serum') || text.includes('dermo')) {
    return 'Belleza';
  }
  if (text.includes('vitamina') || text.includes('suplemento') || text.includes('proteína') || text.includes('multivitamínico') || text.includes('colágeno') || text.includes('omega') || text.includes('nutrition')) {
    return 'Vitaminas y Suplementos';
  }
  if (text.includes('adulto mayor') || text.includes('senior') || text.includes('bastón') || text.includes('incontinencia') || text.includes('ortopedia')) {
    return 'Adulto Mayor';
  }
  if (text.includes('cuidado personal') || text.includes('jabón') || text.includes('shampoo') || text.includes('champú') || text.includes('crema') || text.includes('desodorante') || text.includes('pasta dental') || text.includes('higiene') || text.includes('oral')) {
    return 'Cuidado Personal';
  }
  if (text.includes('conveniencia') || text.includes('snack') || text.includes('bebida') || text.includes('agua')) {
    return 'Conveniencia';
  }

  return 'Cuidado de la Salud';
}

/**
 * EXCLUSIVE PHARMACY BARCODE LOOKUP API
 * Asynchronously queries public REST catalogs (Open Beauty Facts, Open Products Facts, Open Food Facts, UPCitemdb)
 * specifically for the Pharmacy app to auto-complete product Name, official Image URL, and Specifications/Description.
 * 
 * STRICT ISOLATION REQUIREMENT:
 * This logic ONLY executes when `isPharmacyActive` is true. Non-pharmacy modules skip this completely.
 */
export async function fetchPharmacyBarcodeProduct(
  barcode: string,
  isPharmacyActive: boolean
): Promise<PharmacyBarcodeResult> {
  // 1. Isolation Guard: If not the Pharmacy app, ignore and return immediately
  if (!isPharmacyActive || !barcode || !barcode.trim()) {
    return {
      found: false,
      name: '',
      imageUrl: '',
      category: 'Cuidado de la Salud'
    };
  }

  const cleanBarcode = barcode.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (!cleanBarcode) {
    return {
      found: false,
      name: '',
      imageUrl: '',
      category: 'Cuidado de la Salud'
    };
  }

  const TIMEOUT_MS = 2500; // Strict 2.5s timeout per API endpoint for non-blocking UI

  // Targeted public APIs for medicine, OTC healthcare, cosmetics, hygiene, supplements & global EAN/UPC
  const apiSources = [
    {
      sourceName: 'Open Beauty Facts (Cuidado Personal y Dermocosmética)',
      url: `https://world.openbeautyfacts.org/api/v2/product/${cleanBarcode}`,
      parse: (data: any) => {
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            const rawName = p.product_name_es || p.product_name || p.product_name_en || '';
            const brand = p.brands || p.brand_owner || '';
            const img = p.image_front_url || p.image_url || p.image_small_url || '';
            const specParts = [
              p.generic_name_es || p.generic_name || '',
              p.quantity ? `Contenido: ${p.quantity}` : '',
              p.emb_codes ? `Registro/Emb: ${p.emb_codes}` : ''
            ].filter(Boolean);
            const specs = specParts.length > 0 ? specParts.join(' | ') : 'Artículo de cuidado personal e higiene';

            const name = rawName || brand;
            if (name) {
              const fullTitle = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name;
              const cat = mapPharmacyCategory(p.categories_tags || p.categories_hierarchy || [], fullTitle);
              return {
                name: fullTitle,
                imageUrl: img,
                category: cat,
                brand,
                specifications: specs
              };
            }
          }
        }
        return null;
      }
    },
    {
      sourceName: 'Open Products Facts (Artículos de Salud e Insumos Médicos)',
      url: `https://world.openproductsfacts.org/api/v2/product/${cleanBarcode}`,
      parse: (data: any) => {
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            const rawName = p.product_name_es || p.product_name || p.product_name_en || '';
            const brand = p.brands || p.brand_owner || '';
            const img = p.image_front_url || p.image_url || p.image_small_url || '';
            const specParts = [
              p.generic_name_es || p.generic_name || '',
              p.quantity ? `Presentación: ${p.quantity}` : '',
              p.packaging ? `Empaque: ${p.packaging}` : ''
            ].filter(Boolean);
            const specs = specParts.length > 0 ? specParts.join(' | ') : 'Artículo de farmacia y cuidado de la salud';

            const name = rawName || brand;
            if (name) {
              const fullTitle = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name;
              const cat = mapPharmacyCategory(p.categories_tags || p.categories_hierarchy || [], fullTitle);
              return {
                name: fullTitle,
                imageUrl: img,
                category: cat,
                brand,
                specifications: specs
              };
            }
          }
        }
        return null;
      }
    },
    {
      sourceName: 'Open Food Facts (Vitaminas, Suplementos y Mamá/Bebé)',
      url: `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}`,
      parse: (data: any) => {
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            const rawName = p.product_name_es || p.product_name || p.product_name_en || '';
            const brand = p.brands || '';
            const img = p.image_front_url || p.image_url || p.image_small_url || '';
            const specParts = [
              p.generic_name_es || p.generic_name || '',
              p.serving_size ? `Porción: ${p.serving_size}` : '',
              p.quantity ? `Formato: ${p.quantity}` : ''
            ].filter(Boolean);
            const specs = specParts.length > 0 ? specParts.join(' | ') : 'Suplemento nutricional / Cuidado salud';

            const name = rawName || brand;
            if (name) {
              const fullTitle = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name;
              const cat = mapPharmacyCategory(p.categories_tags || p.categories_hierarchy || [], fullTitle);
              return {
                name: fullTitle,
                imageUrl: img,
                category: cat,
                brand,
                specifications: specs
              };
            }
          }
        }
        return null;
      }
    },
    {
      sourceName: 'UPCitemdb Trial (Catálogo Global de Productos)',
      url: `https://api.upcitemdb.com/prod/trial/lookup?upc=${cleanBarcode}`,
      parse: (data: any) => {
        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          const item = data.items[0];
          if (item && item.title) {
            const name = item.title;
            const brand = item.brand || '';
            const img = item.images?.[0] || '';
            const specs = item.description || item.model || item.dimension || 'Producto registrado en catálogo EAN/UPC';
            const cat = mapPharmacyCategory([item.category || ''], name);
            return {
              name,
              imageUrl: img,
              category: cat,
              brand,
              specifications: specs
            };
          }
        }
        return null;
      }
    }
  ];

  for (const source of apiSources) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timer);

      if (response.ok) {
        const json = await response.json();
        const parsed = source.parse(json);
        if (parsed && parsed.name) {
          let finalImg = parsed.imageUrl;
          if (finalImg && !finalImg.includes('?')) {
            finalImg += '?w=400';
          }
          return {
            found: true,
            name: parsed.name,
            imageUrl: finalImg || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
            category: parsed.category,
            brand: parsed.brand || '',
            specifications: parsed.specifications || '',
            description: parsed.specifications || '',
            source: source.sourceName
          };
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[Farmacia API] Timeout (2.5s) alcanzado en ${source.sourceName}`);
      } else {
        console.warn(`[Farmacia API] Advertencia no bloqueante en ${source.sourceName}:`, err);
      }
      // Resilient fallback: move immediately to next API without throwing or blocking UI
    }
  }

  return {
    found: false,
    name: '',
    imageUrl: '',
    category: 'Cuidado de la Salud'
  };
}

