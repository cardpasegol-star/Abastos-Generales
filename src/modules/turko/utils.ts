import jsPDF from 'jspdf';
import { TurkoTransaction, TurkoCartItem, TurkoBusinessConfig } from './types';
import { TURKO_PLATFORM_FEE_PERCENTAGE } from './config';
import { getUnidadShortSuffix } from '../../utils/unitHelpers';
import { isModuleActive } from '../../types';

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
  _ivaPercentage: number = 19
): TurkoCalculatedTotals {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Regla Matemática: Los precios ya incluyen IVA 19%. IVA Informativo = Subtotal / 1.19 * 0.19
  const tax = Math.round((subtotal / 1.19) * 0.19);
  const activeDeliveryFee = shippingMethod === 'Domicilio' ? deliveryFee : 0;
  const platformFee = Math.round(subtotal * TURKO_PLATFORM_FEE_PERCENTAGE);
  // Total a Pagar = Subtotal + Costo de Envío + Tarifa de Uso de Plataforma 10%
  const total = subtotal + activeDeliveryFee + platformFee;

  return {
    subtotal: Math.round(subtotal),
    tax: Math.round(tax),
    deliveryFee: Math.round(activeDeliveryFee),
    platformFee: Math.round(platformFee),
    total: Math.round(total)
  };
}

export function downloadTurkoReceiptPDF(tx: TurkoTransaction, config: TurkoBusinessConfig): void {
  const headerHeight = 55;
  const itemsHeight = tx.items.length * 7;
  const platformFeeLineHeight = 5;
  const totalsHeight = (tx.shippingMethod === 'Domicilio' ? 45 : 35) + platformFeeLineHeight;
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
  doc.text(`Folio: #${tx.id.replace('tx-', '').replace('TURKO-', '').toUpperCase()}`, 40, currentY, { align: 'center' });
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
    doc.text(`$${Math.round(itemSubtotal).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
    currentY += 4.5;
  });

  currentY += 2;
  doc.line(5, currentY, 75, currentY);
  currentY += 4;

  const platformFee = tx.platformFee !== undefined
    ? tx.platformFee
    : Math.round(tx.subtotal * 0.10);

  // Totals
  doc.setFontSize(7);
  doc.text('SUBTOTAL ARTICULOS:', 30, currentY);
  doc.text(`$${Math.round(tx.subtotal).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
  currentY += 3.5;

  if (tx.discountAmount) {
    doc.text('DESCUENTO CUPON:', 30, currentY);
    doc.text(`-$${Math.round(tx.discountAmount).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
    currentY += 3.5;
  }

  if (tx.shippingMethod === 'Domicilio' && tx.deliveryFee) {
    doc.text('COSTO DE ENVIO:', 30, currentY);
    doc.text(`$${Math.round(tx.deliveryFee).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
    currentY += 3.5;
  }

  // 10% Platform Fee Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('TARIFA DE USO PLATAFORMA (10%):', 5, currentY);
  doc.text(`$${Math.round(platformFee).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
  currentY += 3.5;

  // IVA Informativo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('IVA 19% INCLUIDO EN PRECIOS:', 5, currentY);
  doc.text(`$${Math.round(tx.tax).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL PAGADO:', 5, currentY);
  doc.text(`$${Math.round(tx.total).toLocaleString('es-CL')}`, 75, currentY, { align: 'right' });
  currentY += 6;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text('¡Gracias por comprar en Minimarket El Turko!', 40, currentY, { align: 'center' });

  doc.save(`Ticket_ElTurko_${tx.id.replace('tx-', '').replace('TURKO-', '').slice(-6)}.pdf`);
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
  const isRutasActive = isModuleActive('rutasCamion', config);
  const isCamion = tx.shippingMethod === 'Domicilio' && isRutasActive && (tx as any).deliveryType === 'camion';

  const shippingLabel = tx.shippingMethod === 'Domicilio'
    ? (isCamion ? 'Flete Logístico Programado (Ruta Camión) 🚚' : 'Envío Inmediato / Exprés (Uber/Rappi) 🚀')
    : 'Retiro en Local ($0) 🏬';

  let progEntregaLine = '';
  if (tx.shippingMethod === 'Domicilio' && isCamion) {
    const sector = getSectorForComunaTurko(tx.deliveryComuna || '', config?.rutasCamion);
    if (sector) {
      progEntregaLine = `PROGRAMACIÓN ENTREGA: Sector ${sector.name} — Próxima Ruta (${sector.days.join(', ')})`;
    }
  }

  const platformFee = tx.platformFee !== undefined
    ? tx.platformFee
    : Math.round(tx.subtotal * 0.10);

  let msg = `*🛒 NUEVO PEDIDO - ${config.name || 'DONDE EL TURCO'}*\n`;
  msg += `*Nº Orden:* #${tx.id.replace('tx-', '').replace('TURKO-', '').toUpperCase()}\n`;
  msg += `*Estado Inicial:* [En Preparación ⏳]\n`;
  msg += `------------------------------------\n`;
  msg += `👤 *DATOS DEL CLIENTE:*\n`;
  msg += `• *Cliente:* ${tx.customerName || 'Cliente General'}\n`;
  msg += `• *Teléfono:* ${tx.customerPhone || 'Sin teléfono'}\n`;
  msg += `• *Modalidad de Despacho:* ${shippingLabel}\n`;
  if (tx.shippingMethod === 'Domicilio') {
    msg += `• *Dirección:* ${tx.deliveryAddress || 'N/A'}${tx.deliveryComuna ? ` (${tx.deliveryComuna})` : ''}\n`;
    if (progEntregaLine) {
      msg += `• *👉 ${progEntregaLine}*\n`;
    }
    if (tx.trackingUrl) {
      msg += `• *Tracking Delivery:* ${tx.trackingUrl}\n`;
    }
  }
  msg += `• *Medio de Pago:* ${tx.method || 'Mercado Pago'}\n`;
  msg += `------------------------------------\n`;
  msg += `📦 *DETALLE DE PRODUCTOS:*\n`;

  tx.items.forEach((item, idx) => {
    const qty = item.quantity ?? item.qty ?? 1;
    const itemSubtotal = item.price * qty;
    const unitSuffix = item.unidadMedida ? getUnidadShortSuffix(item.unidadMedida) : '';
    msg += `${idx + 1}. *${item.name}* (x${qty}${unitSuffix}) - $${Math.round(itemSubtotal).toLocaleString('es-CL')} CLP\n`;
  });

  msg += `------------------------------------\n`;
  msg += `◇ *RESUMEN DE PAGO:*\n`;
  msg += `• *Subtotal Artículos:* $${Math.round(tx.subtotal).toLocaleString('es-CL')} CLP\n`;
  if (tx.discountAmount) {
    msg += `• *Cupón de Descuento:* -$${Math.round(tx.discountAmount).toLocaleString('es-CL')} CLP\n`;
  }
  if (tx.shippingMethod === 'Domicilio') {
    msg += `• *Costo de Envío:* $${Math.round(tx.deliveryFee || 0).toLocaleString('es-CL')} CLP\n`;
  }
  msg += `• *Tarifa de Uso de Plataforma (10%):* $${Math.round(platformFee).toLocaleString('es-CL')} CLP\n`;
  msg += `• *IVA 19% Incluido en precios:* $${Math.round(tx.tax).toLocaleString('es-CL')} CLP\n\n`;
  msg += `◇ *TOTAL PAGADO:* *$${Math.round(tx.total).toLocaleString('es-CL')} CLP*\n`;
  msg += `◇ *Ver Documento SII:* https://www.sii.cl/facturacion_electronica/ejemplo_dte_39.pdf\n\n`;
  if (tx.notes?.trim()) {
    msg += `*Notas:* ${tx.notes.trim()}\n\n`;
  }
  msg += `¡Muchas gracias! Comprobante emitido y venta aprobada. 🏪✨`;

  return msg;
}
