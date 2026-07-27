import React from 'react';

export function formatCLP(amount: number | string | null | undefined): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const valid = isNaN(num) ? 0 : Math.round(num);
  return `$${valid.toLocaleString('es-CL')}`;
}

export function formatCLPFull(amount: number | string | null | undefined): string {
  return `${formatCLP(amount)} CLP`;
}

export function sanitizeForFirestore<T extends object>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const cleanObj: any = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    const val = (obj as any)[key];
    if (val !== undefined) {
      if (val && typeof val === 'object' && !(val instanceof Date)) {
        cleanObj[key] = sanitizeForFirestore(val);
      } else {
        cleanObj[key] = val;
      }
    }
  });
  return cleanObj as T;
}

export function getCategoryPlaceholder(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('congelad') || cat.includes('pulpa') || cat.includes('helado')) {
    return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400';
  }
  if (cat.includes('carne') || cat.includes('cecina') || cat.includes('embutido')) {
    return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400';
  }
  if (cat.includes('lácteo') || cat.includes('lacteo') || cat.includes('queso') || cat.includes('leche') || cat.includes('yogurt')) {
    return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=400';
  }
  if (cat.includes('bebida') || cat.includes('jugo') || cat.includes('refresco') || cat.includes('agua')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400';
  }
  if (cat.includes('snack') || cat.includes('papas') || cat.includes('galleta') || cat.includes('dulce')) {
    return 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=400';
  }
  if (cat.includes('fruta') || cat.includes('verdura') || cat.includes('frutería') || cat.includes('fruteria')) {
    return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400';
  }
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, category?: string): void {
  const target = e.currentTarget;
  if (!target) return;
  if (target.getAttribute('data-fallback-tried') === 'true') {
    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10">Sin Imagen</text></svg>';
    return;
  }
  target.setAttribute('data-fallback-tried', 'true');
  const fallback = getCategoryPlaceholder(category);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}

export function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[localStorage] Cuota de almacenamiento alcanzada al guardar "${key}". Optimizando datos...`, err);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // Essential records protection: keep key product attributes (name, SKU, price, category, stock, cost, etc.)
        // and replace heavy image URLs/base64 strings with standard category placeholders
        const cleaned = parsed.map((item: any) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (copy.imageUrl && (copy.imageUrl.length > 300 || copy.imageUrl.startsWith('data:'))) {
              copy.imageUrl = getCategoryPlaceholder(copy.category);
            }
            return copy;
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(cleaned));
        console.info(`[localStorage] Se guardaron los datos esenciales para "${key}" optimizando las imágenes.`);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('app_storage_optimized', {
            detail: { message: "Memoria local optimizada / Se guardaron los datos esenciales de los productos." }
          }));
        }
        return true;
      }
    } catch (cleanErr) {
      console.error("[localStorage] No se pudo guardar ni tras optimizar los datos:", cleanErr);
    }
    return false;
  }
}

