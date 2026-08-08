export type UnidadMedida =
  | 'unidad'
  | 'kg'
  | 'g'
  | 'litro'
  | 'familiar'
  | 'mediana'
  | 'personal'
  | 'combo_2x'
  | 'pack'
  | 'saco_5kg'
  | 'saco_10kg'
  | 'saco_25kg'
  | 'malla_3u'
  | 'malla_4u'
  | 'malla_5u'
  | 'malla_6u'
  | string;

export function getUnidadLabel(unit?: string): string {
  if (!unit) return 'unidades';
  const u = unit.toLowerCase().trim();
  switch (u) {
    case 'kg': return 'Kg';
    case 'g': return 'g';
    case 'litro': case 'l': return 'Litro (L)';
    case 'familiar': case 'familiar_8c': case 'familiar (8 cortes)': return 'Familiar (8 Cortes)';
    case 'mediana': case 'mediana_6c': case 'mediana (6 cortes)': return 'Mediana (6 Cortes)';
    case 'personal': case 'personal_4c': case 'personal (4 cortes)': return 'Personal (4 Cortes)';
    case 'combo_2x': case 'promo_2x': case 'combo': return 'Combo / Promoción 2x';
    case 'pack': case 'caja_pack': case 'caja': return 'Caja / Pack';
    case 'saco_5kg': case 'saco 5 kg': case 'saco 5kg': return 'Saco 5 Kg';
    case 'saco_10kg': case 'saco 10 kg': case 'saco 10kg': return 'Saco 10 Kg';
    case 'saco_25kg': case 'saco 25 kg': case 'saco 25kg': return 'Saco 25 Kg';
    case 'malla_3u': case 'malla 3 u': case 'malla 3 uds': case 'malla 3 unidades': return 'Malla 3 Uds';
    case 'malla_4u': case 'malla 4 u': case 'malla 4 uds': case 'malla 4 unidades': return 'Malla 4 Uds';
    case 'malla_5u': case 'malla 5 u': case 'malla 5 uds': case 'malla 5 unidades': return 'Malla 5 Uds';
    case 'malla_6u': case 'malla 6 u': case 'malla 6 uds': case 'malla 6 unidades': return 'Malla 6 Uds';
    case 'unidad': default: return 'unidades';
  }
}

export function getUnidadShortSuffix(unit?: string): string {
  if (!unit || unit === 'unidad') return '';
  const u = unit.toLowerCase().trim();
  switch (u) {
    case 'kg': return ' / Kg';
    case 'g': return ' / g';
    case 'litro': case 'l': return ' / L';
    case 'familiar': case 'familiar_8c': return ' / Familiar (8 Cortes)';
    case 'mediana': case 'mediana_6c': return ' / Mediana (6 Cortes)';
    case 'personal': case 'personal_4c': return ' / Personal (4 Cortes)';
    case 'combo_2x': case 'promo_2x': return ' / Combo 2x';
    case 'pack': case 'caja_pack': return ' / Pack';
    case 'saco_5kg': case 'saco 5 kg': case 'saco 5kg': return ' / Saco 5 Kg';
    case 'saco_10kg': case 'saco 10 kg': case 'saco 10kg': return ' / Saco 10 Kg';
    case 'saco_25kg': case 'saco 25 kg': case 'saco 25kg': return ' / Saco 25 Kg';
    case 'malla_3u': case 'malla 3 u': case 'malla 3 uds': case 'malla 3 unidades': return ' / Malla 3 Uds';
    case 'malla_4u': case 'malla 4 u': case 'malla 4 uds': case 'malla 4 unidades': return ' / Malla 4 Uds';
    case 'malla_5u': case 'malla 5 u': case 'malla 5 uds': case 'malla 5 unidades': return ' / Malla 5 Uds';
    case 'malla_6u': case 'malla 6 u': case 'malla 6 uds': case 'malla 6 unidades': return ' / Malla 6 Uds';
    default: return ` / ${unit}`;
  }
}

export function isClosedVolumeUnit(unit?: string): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase().trim();
  return u.startsWith('saco') || u.startsWith('malla');
}

export function isLooseWeightUnit(unit?: string): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase().trim();
  return u === 'kg' || u === 'g';
}
