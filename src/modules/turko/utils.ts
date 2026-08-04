import jsPDF from 'jspdf';
import { TurkoTransaction, TurkoCartItem, TurkoBusinessConfig } from './types';
import { TURKO_PLATFORM_FEE_PERCENTAGE } from './config';
import { getUnidadShortSuffix } from '../../utils/unitHelpers';

export interface TurkoCalculatedTotals {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
}

export function calculateTurkoTotals(
  cart: TurkoCartItem[],
  shippingMethod: 'Retiro' | 'Domicilio',
  deliveryFee: number,
  ivaPercentage: number = 15
): TurkoCalculatedTotals {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (ivaPercentage / 100);
  const activeDeliveryFee = shippingMethod === 'Domicilio' ? deliveryFee : 0;
  const platformFee = subtotal * TURKO_PLATFORM_FEE_PERCENTAGE;
  const total = subtotal + tax + activeDeliveryFee + platformFee;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    deliveryFee: parseFloat(activeDeliveryFee.toFixed(2)),
    platformFee: parseFloat(platformFee.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

export function downloadTurkoReceiptPDF(tx: TurkoTransaction, config: TurkoBusinessConfig): void {
  const headerHeight = 55;
  const itemsHeight = tx.items.length * 7;
  const platformFeeLineHeight = 5;
  const totalsHeight = (tx.shippingMethod === 'Domicilio' ? 42 : 30) + platformFeeLineHeight;
  const pdfHeight = headerHeight + itemsHeight + totalsHeight + 15;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, Math.max(120, pdfHeight)]
  });

  let currentY = 8;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(config.name || 'Minimarket "Donde El Turko"', 40, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (config.rut) {
    doc.text(`RUT: ${config.rut}`, 40, currentY, { align: 'center' });
    currentY += 4;
  }
  doc.text('COMPROBANTE DE VENTA DIGITAL', 40, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(7);
  doc.text(`Folio: #${tx.id.slice(-8).toUpperCase()}`, 40, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text(`Fecha: ${new Date(tx.createdAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`, 40, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text(`Cliente: ${tx.customerName || 'Cliente General'}`, 40, currentY, { align: 'center' });
  currentY += 5;

  // Divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, currentY, 75, currentY);
  currentY += 4;

  // Items Header
  doc.setFont('helvetica', 'bold');
  doc.text('CANT', 5, currentY);
  doc.text('PRODUCTO', 18, currentY);
  doc.text('TOTAL', 75, currentY, { align: 'right' });
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  tx.items.forEach((item) => {
    const qty = item.quantity ?? item.qty ?? 1;
    const itemSubtotal = item.price * qty;
    const nameTruncated = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;

    doc.text(`${qty}x`, 5, currentY);
    doc.text(nameTruncated, 18, currentY);
    doc.text(`$${itemSubtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 4.5;
  });

  currentY += 2;
  doc.line(5, currentY, 75, currentY);
  currentY += 4;

  // Totals
  doc.setFontSize(7);
  doc.text('SUBTOTAL:', 35, currentY);
  doc.text(`$${tx.subtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
  currentY += 3.5;

  doc.text(`IVA (${config.ivaPercentage || 15}%):`, 35, currentY);
  doc.text(`$${tx.tax.toFixed(2)}`, 75, currentY, { align: 'right' });
  currentY += 3.5;

  if (tx.shippingMethod === 'Domicilio' && tx.deliveryFee) {
    doc.text('ENVIO (DELIVERY):', 35, currentY);
    doc.text(`$${tx.deliveryFee.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 3.5;
  }

  // 10% Platform Fee Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('TARIFA DE USO DE PLATAFORMA (10%):', 5, currentY);
  doc.text(`$${(tx.platformFee || (tx.subtotal * 0.10)).toFixed(2)}`, 75, currentY, { align: 'right' });
  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL A PAGAR:', 5, currentY);
  doc.text(`$${tx.total.toFixed(2)}`, 75, currentY, { align: 'right' });
  currentY += 6;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text('¡Gracias por comprar en Minimarket El Turko!', 40, currentY, { align: 'center' });

  doc.save(`Ticket_ElTurko_${tx.id.slice(-6)}.pdf`);
}

export interface SectorConfig {
  name: string;
  comunas: string[];
  days: string[];
  fee: number;
}

export const DEFAULT_RUTAS_TURKO: Record<string, SectorConfig> = {
  sur: {
    name: "Sector Sur",
    comunas: ["La Pintana", "El Bosque", "San Bernardo", "La Cisterna", "San Ramón"],
    days: ["Martes", "Viernes", "Sábado"],
    fee: 2500
  },
  surOriente: {
    name: "Sector Sur Oriente",
    comunas: ["La Florida", "Puente Alto", "Macul", "San Joaquín"],
    days: ["Miércoles", "Sábado"],
    fee: 3400
  },
  ejeCentral: {
    name: "Eje Central",
    comunas: ["Santiago Centro", "Ñuñoa", "Providencia"],
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    fee: 3400
  },
  oriente: {
    name: "Sector Oriente",
    comunas: ["Vitacura", "Las Condes", "Lo Barnechea", "La Reina", "Peñalolén"],
    days: ["Martes", "Miércoles", "Viernes"],
    fee: 3400
  }
};

export const ALL_COMUNAS_TURKO = [
  "La Pintana", "La Florida", "Puente Alto", "El Bosque", "San Bernardo",
  "San Ramón", "La Cisterna", "Macul", "San Joaquín", "Santiago Centro",
  "Ñuñoa", "Providencia", "Peñalolén", "La Reina", "Las Condes", "Vitacura"
];

export function getSectorForComunaTurko(comunaName: string, configRutas?: Record<string, SectorConfig>): SectorConfig | null {
  if (!comunaName) return null;
  const normalized = comunaName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const rutas = (configRutas && Object.keys(configRutas).length > 0) ? configRutas : DEFAULT_RUTAS_TURKO;

  for (const sector of Object.values(rutas)) {
    if (!sector || !Array.isArray(sector.comunas)) continue;
    const matched = sector.comunas.some((c) => {
      const cNorm = c.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return cNorm === normalized || normalized.includes(cNorm) || cNorm.includes(normalized);
    });
    if (matched) return sector;
  }

  return rutas.sur || Object.values(rutas)[0] || null;
}

export function isTurkoProduct(product: any, turkoCategories?: string[]): boolean {
  if (!product) return false;

  // 1. Explicit store / module check
  const storeTag = (
    product.store ||
    product.storeId ||
    product.module ||
    product.modulo ||
    product.rubro ||
    product.appId ||
    ''
  ).toString().toLowerCase().trim();

  // Explicitly exclude products belonging to frutería, congelados, farmacia, etc.
  if (['fruteria', 'frutería', 'congelados', 'farmacia', 'almuerzos'].includes(storeTag)) {
    return false;
  }

  // 2. Explicit category check for external categories (e.g. Frutería, Congelados)
  const cat = (product.category || product.categoria || '').toString().trim().toLowerCase();
  const externalCategories = [
    'frutas',
    'frutas frescas',
    'verduras',
    'frutos secos',
    'mermeladas',
    'miel',
    'semillas',
    'huevos',
    'huevos de campo',
    'pescados y mariscos',
    'congelados'
  ];

  if (externalCategories.includes(cat)) {
    return false;
  }

  // 3. If explicit Turko store tag
  if (['turco', 'el_turco', 'turko', 'business_info_turko'].includes(storeTag)) {
    return true;
  }

  // 4. Check category matching turkoCategories if provided
  if (turkoCategories && turkoCategories.length > 0) {
    const isCatMatch = turkoCategories.some((c) => c.toLowerCase() === cat);
    if (isCatMatch) return true;
  }

  return true;
}

export function generateTurkoWhatsAppMessage(


  tx: TurkoTransaction,
  config: TurkoBusinessConfig
): string {
  let msg = `🛒 *NUEVO PEDIDO EN MINIMARKET "DONDE EL TURKO"*\n`;
  msg += `------------------------------------------------\n`;
  msg += `👤 *Cliente:* ${tx.customerName || 'Cliente General'}\n`;
  msg += `📞 *Teléfono:* ${tx.customerPhone || 'Sin teléfono'}\n`;
  msg += `🚚 *Método:* ${tx.shippingMethod === 'Domicilio' ? 'Despacho a Domicilio' : 'Retiro en Tienda'}\n`;
  if (tx.shippingMethod === 'Domicilio') {
    msg += `📍 *Dirección:* ${tx.deliveryAddress || 'No especificada'}, ${tx.deliveryComuna || ''}\n`;
  }
  msg += `💳 *Medio de Pago:* ${tx.method}\n`;
  msg += `------------------------------------------------\n`;
  msg += `📦 *DETALLE DE PRODUCTOS:*\n`;

  tx.items.forEach((item) => {
    const qty = item.quantity ?? item.qty ?? 1;
    const itemSubtotal = item.price * qty;
    const unitSuffix = item.unidadMedida ? getUnidadShortSuffix(item.unidadMedida) : '';
    msg += `• ${qty}x ${item.name}${unitSuffix} ($${item.price.toFixed(0)} c/u) -> *$${itemSubtotal.toFixed(2)}*\n`;
  });

  msg += `------------------------------------------------\n`;
  msg += `📊 *RESUMEN DE PAGO:*\n`;
  msg += `• Subtotal: $${tx.subtotal.toFixed(2)}\n`;
  msg += `• IVA (${config.ivaPercentage || 15}%): $${tx.tax.toFixed(2)}\n`;
  if (tx.shippingMethod === 'Domicilio' && tx.deliveryFee) {
    msg += `• Envío (Delivery): $${tx.deliveryFee.toFixed(2)}\n`;
  }
  msg += `• *Tarifa de Uso de Plataforma (10%):* $${(tx.platformFee || (tx.subtotal * 0.10)).toFixed(2)}\n`;
  msg += `• *TOTAL COMPLETO A PAGAR: $${tx.total.toFixed(2)}*\n\n`;
  msg += `¡Gracias por preferir Minimarket El Turko! 🏪✨`;

  return encodeURIComponent(msg);
}
