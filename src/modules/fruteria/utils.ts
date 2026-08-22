import jsPDF from 'jspdf';
import { FruteriaTransaction, FruteriaCartItem, FruteriaBusinessConfig } from './types';
import { Product } from '../../types';

export const FRUTERIA_MAX_EXPRESS_WEIGHT_KG = 15;
export const FRUTERIA_PLATFORM_FEE_PERCENTAGE = 0.10;

/**
 * Obtiene el peso en kilogramos (Kg) de un producto unitario de Frutería/Verdulería.
 * Si el producto se vende por peso suelto ('kg'), el factor es 1 (la cantidad del carrito ya representa los kilos).
 * Si es en gramos ('g'), el factor es 0.001 (100g = 0.1 kg, etc.).
 * Si es unidad cerrada (saco, malla), extrae la equivalencia en Kg.
 */
export function getFruteriaProductWeightKg(product: any): number {
  if (!product) return 1;

  if (typeof product.peso_kg === 'number' && product.peso_kg > 0) {
    return product.peso_kg;
  }
  if (typeof product.pesoKg === 'number' && product.pesoKg > 0) {
    return product.pesoKg;
  }
  if (typeof product.weight === 'number' && product.weight > 0) {
    return product.weight;
  }

  const u = (product.unidadMedida || '').toLowerCase();
  if (u === 'kg' || u === 'kilo') return 1;
  if (u === 'g' || u === 'gramos' || u === 'gr') return 0.001;
  if (u.includes('25kg')) return 25;
  if (u.includes('10kg')) return 10;
  if (u.includes('5kg')) return 5;
  if (u.includes('malla_6u')) return 2.5;
  if (u.includes('malla_5u')) return 2.0;
  if (u.includes('malla_4u')) return 1.5;
  if (u.includes('malla_3u')) return 1.2;
  if (u.includes('malla')) return 1.5;

  // Intento de inferir desde el nombre del producto
  const name = (product.name || '').toLowerCase();
  const kgMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilos|kilo)/i);
  if (kgMatch) {
    return parseFloat(kgMatch[1].replace(',', '.'));
  }
  const gMatch = name.match(/(\d+)\s*(?:g|gr|gramos)/i);
  if (gMatch) {
    return parseFloat(gMatch[1]) / 1000;
  }
  const lMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(?:l|lt|litro|litros)/i);
  if (lMatch) {
    return parseFloat(lMatch[1].replace(',', '.'));
  }

  // Por defecto en frutería para artículos por unidad (lechuga, melón, sandía, etc.)
  if (name.includes('sandía') || name.includes('sandia')) return 6.0;
  if (name.includes('melón') || name.includes('melon')) return 2.5;
  if (name.includes('zapallo')) return 2.0;
  if (name.includes('piña') || name.includes('pina')) return 1.5;
  if (name.includes('lechuga') || name.includes('cilantro') || name.includes('perejil') || name.includes('apio')) return 0.5;

  return 1;
}

/**
 * Calcula la sumatoria acumulada de peso en Kg de todo el carrito de compras.
 */
export function calculateFruteriaCartTotalWeightKg(cart: any[], liveProducts: Product[] = []): number {
  if (!Array.isArray(cart) || cart.length === 0) return 0;

  const total = cart.reduce((sum, item) => {
    const liveProduct = liveProducts.find(p => p.id === (item.product?.id || item.id));
    const prod = liveProduct || item.product || item;
    const qty = Number(item.quantity) || 0;
    const itemWeight = getFruteriaProductWeightKg(prod);
    return sum + (itemWeight * qty);
  }, 0);

  return Math.round(total * 10) / 10;
}
