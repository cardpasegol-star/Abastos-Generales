export interface TurkoCoupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number; // e.g. 10 for 10%, 5000 for $5.000 fixed, 0 for free shipping
  minPurchase?: number;
  maxDiscount?: number;
  active: boolean;
}

export const PREDEFINED_TURKO_COUPONS: TurkoCoupon[] = [
  {
    code: 'TURKO10',
    description: '10% de Descuento en tu compra',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 3000,
    active: true
  },
  {
    code: 'TURKO20',
    description: '20% de Descuento Especial',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 8000,
    active: true
  },
  {
    code: 'ENVIOFREE',
    description: 'Envío Gratis a Domicilio ($0)',
    discountType: 'free_shipping',
    discountValue: 0,
    minPurchase: 5000,
    active: true
  },
  {
    code: 'DESPACHOFREE',
    description: 'Despacho Gratis en tu Pedido ($0)',
    discountType: 'free_shipping',
    discountValue: 0,
    minPurchase: 5000,
    active: true
  },
  {
    code: 'TURKO5000',
    description: '$5.000 CLP de Descuento en compras sobre $15.000',
    discountType: 'fixed',
    discountValue: 5000,
    minPurchase: 15000,
    active: true
  },
  {
    code: 'PROMO3000',
    description: '$3.000 CLP de Descuento Fijo',
    discountType: 'fixed',
    discountValue: 3000,
    minPurchase: 10000,
    active: true
  },
  {
    code: 'BIENVENIDA',
    description: '15% de Descuento de Bienvenida',
    discountType: 'percentage',
    discountValue: 15,
    minPurchase: 4000,
    active: true
  }
];

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountAmount: number;
  isFreeShipping: boolean;
  discountPct?: number;
  message: string;
  coupon?: TurkoCoupon;
}

export function validateTurkoCoupon(
  rawCode: string,
  subtotal: number,
  deliveryFee: number
): CouponValidationResult {
  const clean = (rawCode || '').trim().toUpperCase();
  if (!clean) {
    return {
      isValid: false,
      code: '',
      discountAmount: 0,
      isFreeShipping: false,
      message: 'Ingresa un código de cupón.'
    };
  }

  // Load custom coupons from localStorage if any
  let allCoupons = [...PREDEFINED_TURKO_COUPONS];
  try {
    const custom = localStorage.getItem('turko_custom_coupons');
    if (custom) {
      const parsed: TurkoCoupon[] = JSON.parse(custom);
      allCoupons = [...parsed, ...allCoupons];
    }
  } catch {}

  const coupon = allCoupons.find((c) => c.code.toUpperCase() === clean && c.active);

  if (!coupon) {
    return {
      isValid: false,
      code: clean,
      discountAmount: 0,
      isFreeShipping: false,
      message: 'Código de cupón no válido o expirado.'
    };
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return {
      isValid: false,
      code: clean,
      discountAmount: 0,
      isFreeShipping: false,
      message: `Este cupón requiere una compra mínima de $${coupon.minPurchase.toLocaleString('es-CL')} CLP (Subtotal actual: $${subtotal.toLocaleString('es-CL')}).`,
      coupon
    };
  }

  let discountAmount = 0;
  let isFreeShipping = false;
  let discountPct = 0;

  if (coupon.discountType === 'percentage') {
    discountPct = coupon.discountValue;
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(subtotal, coupon.discountValue);
  } else if (coupon.discountType === 'free_shipping') {
    isFreeShipping = true;
    discountAmount = deliveryFee;
  }

  discountAmount = Math.round(discountAmount);

  return {
    isValid: true,
    code: clean,
    discountAmount,
    isFreeShipping,
    discountPct: discountPct > 0 ? discountPct : undefined,
    message: `¡Cupón ${clean} aplicado con éxito! (-$${discountAmount.toLocaleString('es-CL')} CLP)`,
    coupon
  };
}
