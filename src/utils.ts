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

