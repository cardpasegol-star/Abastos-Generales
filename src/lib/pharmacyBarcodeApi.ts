import { BusinessConfig } from '../types';

export interface PharmacyBarcodeResult {
  found: boolean;
  name: string;
  imageUrl: string;
  category: string;
  brand?: string;
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
 * EXCLUSIVE PHARMACY BARCODE LOOKUP API
 * Asynchronously queries public catalogs (Open Beauty Facts, Open Products Facts, Open Food Facts)
 * specifically for the Pharmacy app to auto-complete product Name and official Image URL.
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
      category: 'Farmacia / Salud'
    };
  }

  const cleanBarcode = barcode.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (!cleanBarcode) {
    return {
      found: false,
      name: '',
      imageUrl: '',
      category: 'Farmacia / Salud'
    };
  }

  const TIMEOUT_MS = 2500; // 2.5s fast timeout per endpoint for snappy UX

  // Targeted public APIs for medicine, OTC healthcare, cosmetics, hygiene, and supplements
  const apiSources = [
    {
      sourceName: 'Open Beauty Facts (Cuidado Personal y Cosmética)',
      url: `https://world.openbeautyfacts.org/api/v2/product/${cleanBarcode}`,
      parse: (data: any) => {
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            const name = p.product_name_es || p.product_name || p.product_name_en || p.brands || '';
            const img = p.image_front_url || p.image_url || p.image_small_url || '';
            const brand = p.brands || '';
            if (name) {
              return {
                name: brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name,
                imageUrl: img,
                category: 'Farmacia / Cuidado Personal',
                brand
              };
            }
          }
        }
        return null;
      }
    },
    {
      sourceName: 'Open Products Facts (Artículos de Salud e Higiene)',
      url: `https://world.openproductsfacts.org/api/v2/product/${cleanBarcode}`,
      parse: (data: any) => {
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            const name = p.product_name_es || p.product_name || p.product_name_en || '';
            const img = p.image_front_url || p.image_url || p.image_small_url || '';
            const brand = p.brands || '';
            if (name) {
              return {
                name: brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name,
                imageUrl: img,
                category: 'Farmacia / Salud',
                brand
              };
            }
          }
        }
        return null;
      }
    },
    {
      sourceName: 'Open Food Facts (Suplementos y Nutrición)',
      url: `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}`,
      parse: (data: any) => {
        if (data && (data.status === 'success' || data.status === 1 || data.product)) {
          const p = data.product;
          if (p) {
            const name = p.product_name_es || p.product_name || p.product_name_en || '';
            const img = p.image_front_url || p.image_url || p.image_small_url || '';
            const brand = p.brands || '';
            if (name) {
              return {
                name: brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name,
                imageUrl: img,
                category: 'Farmacia / Nutrición',
                brand
              };
            }
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
            brand: parsed.brand,
            source: source.sourceName
          };
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[Farmacia API] Timeout en ${source.sourceName}`);
      } else {
        console.warn(`[Farmacia API] Error en ${source.sourceName}:`, err);
      }
      // Resilient fallback: proceed to next API source
    }
  }

  return {
    found: false,
    name: '',
    imageUrl: '',
    category: 'Farmacia / Salud'
  };
}
