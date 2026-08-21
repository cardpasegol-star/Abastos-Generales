/**
 * Delivery Sandbox Service (Uber Direct / PedidosYa Envíos / Delivery Vecinal)
 * Provee cotización dinámica en tiempo real y disparo de órdenes de despacho con tracking en sandbox.
 */

export interface CotizacionDeliveryParams {
  origenDireccion?: string;
  origenComuna?: string;
  origenLat?: number;
  origenLon?: number;
  destinoDireccion: string;
  destinoComuna: string;
  destinoLat?: number | null;
  destinoLon?: number | null;
  distanciaMetros?: number | null;
  isCortaDistancia?: boolean;
  montoOrden?: number;
  comercioNombre?: string;
}

export interface CotizacionDeliveryResult {
  tarifa: number;
  proveedor: string;
  tiempoEstimadoMinutos: number;
  distanciaKm?: number;
  isSandbox: boolean;
  cotizacionId: string;
}

export interface CrearOrdenDeliveryParams {
  pedidoId: string;
  clienteNombre: string;
  clienteTelefono: string;
  destinoDireccion: string;
  destinoComuna: string;
  destinoLat?: number | null;
  destinoLon?: number | null;
  distanciaMetros?: number | null;
  isCortaDistancia?: boolean;
  montoTotal: number;
  costoEnvio: number;
  notas?: string;
  items: Array<{ name: string; qty: number; price: number; type?: string }>;
  comercioNombre?: string;
  comercioDireccion?: string;
  comercioTelefono?: string;
}

export interface OrdenDeliveryResult {
  delivery_id: string;
  tracking_url: string;
  estado: string;
  proveedor: string;
  creadoEn: string;
}

/**
 * Tabla de tarifas base por comuna de referencia en Santiago (Sandbox)
 */
const TARIFAS_COMUNAS_SANDBOX: Record<string, number> = {
  'La Pintana': 2000,
  'La Florida': 2500,
  'Puente Alto': 2500,
  'San Bernardo': 3000,
  'El Bosque': 2200,
  'San Ramón': 2200,
  'La Granja': 2200,
  'La Cisterna': 2500,
  'San Miguel': 2800,
  'Santiago': 3200,
  'Ñuñoa': 3200,
  'Providencia': 3500,
  'Las Condes': 4000,
  'Macul': 2800,
  'Peñalolén': 3000,
  'Maipú': 3500,
  'Pudahuel': 3500,
  'Quilicura': 4000,
};

/**
 * Cotiza el costo de envío dinámico contra el entorno Sandbox
 * Incluye fallback blindado si no hay conexión o faltan llaves.
 */
export async function cotizarEnvio(params: CotizacionDeliveryParams): Promise<CotizacionDeliveryResult> {
  try {
    // 1. Caso de entrega corta distancia / vecinal (<= 500m)
    if (params.isCortaDistancia || (params.distanciaMetros !== null && params.distanciaMetros !== undefined && params.distanciaMetros <= 500 && params.isCortaDistancia)) {
      return {
        tarifa: 1000,
        proveedor: 'Delivery Vecinal (Corta Distancia)',
        tiempoEstimadoMinutos: 15,
        distanciaKm: params.distanciaMetros ? params.distanciaMetros / 1000 : 0.4,
        isSandbox: true,
        cotizacionId: `QUOTE-VECINAL-${Date.now().toString().slice(-6)}`
      };
    }

    // 2. Simulación o llamada API Sandbox (Uber Direct / PedidosYa)
    // Se calcula con base en comuna, distancia GPS y reglas del comercio
    const comunaNorm = (params.destinoComuna || '').trim();
    let tarifaCalculada = TARIFAS_COMUNAS_SANDBOX[comunaNorm] || 2500;

    let distanciaKm = 3.5;
    if (params.distanciaMetros && params.distanciaMetros > 0) {
      distanciaKm = parseFloat((params.distanciaMetros / 1000).toFixed(1));
      if (distanciaKm > 8) {
        tarifaCalculada = Math.max(tarifaCalculada, Math.round(2500 + (distanciaKm - 8) * 350));
      }
    }

    const cotizacionId = `QUOTE-SBX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return {
      tarifa: tarifaCalculada,
      proveedor: `Sandbox Uber Direct / PedidosYa (${comunaNorm || 'RM'})`,
      tiempoEstimadoMinutos: Math.min(45, Math.max(20, Math.round(distanciaKm * 3 + 15))),
      distanciaKm,
      isSandbox: true,
      cotizacionId
    };
  } catch (error) {
    console.warn('[DeliveryService] Error al cotizar envío en Sandbox, aplicando tarifa por defecto:', error);
    // Modo Aislado / Fallback Seguro: $2.500
    return {
      tarifa: 2500,
      proveedor: 'Sandbox Uber Direct / PedidosYa (Fallback)',
      tiempoEstimadoMinutos: 30,
      distanciaKm: 3.0,
      isSandbox: true,
      cotizacionId: `QUOTE-MOCK-${Date.now().toString().slice(-6)}`
    };
  }
}

/**
 * Dispara la creación de la orden de delivery en segundo plano (Back-end Hook)
 * Genera el ID de delivery y el enlace de seguimiento (tracking_url) en sandbox.
 */
export async function crearOrdenDelivery(params: CrearOrdenDeliveryParams): Promise<OrdenDeliveryResult> {
  try {
    const rawId = params.pedidoId.replace('tx-', '').replace('TURKO-', '').toUpperCase();
    const deliveryId = `SBX-DEL-${rawId || Math.floor(100000 + Math.random() * 900000)}`;
    const trackingUrl = `https://rastreo.sandbox-delivery.cl/track/${deliveryId}`;

    const deliveryResult: OrdenDeliveryResult = {
      delivery_id: deliveryId,
      tracking_url: trackingUrl,
      estado: 'En Preparación ⏳',
      proveedor: 'Sandbox Uber Direct / PedidosYa',
      creadoEn: new Date().toISOString()
    };

    // Guardar en pedidos_pendientes locales para que el panel de administración
    // y el repartidor simulado puedan sincronizar en tiempo real
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existing = localStorage.getItem('pedidos_pendientes');
        const list = existing ? JSON.parse(existing) : [];
        
        // Verificar si ya existe
        const existingIdx = list.findIndex((o: any) => o.id === params.pedidoId || o.deliveryId === deliveryId);
        const orderRecord = {
          id: params.pedidoId,
          deliveryId,
          trackingUrl,
          items: params.items,
          customerName: params.clienteNombre,
          customerPhone: params.clienteTelefono,
          total: params.montoTotal,
          deliveryFee: params.costoEnvio,
          deliveryAddress: params.destinoDireccion,
          deliveryComuna: params.destinoComuna,
          notes: params.notas || '',
          orderStatus: 'En Preparación ⏳',
          status: 'pending',
          comercioAsociado: params.comercioNombre || 'Donde el Goyo',
          createdAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...orderRecord };
        } else {
          list.push(orderRecord);
        }

        localStorage.setItem('pedidos_pendientes', JSON.stringify(list));
      }
    } catch (storageErr) {
      console.warn('[DeliveryService] Error al guardar en pedidos_pendientes:', storageErr);
    }

    console.info('=== ORDEN DE DELIVERY SANDBOX CREADA ===', deliveryResult);
    return deliveryResult;
  } catch (error) {
    console.warn('[DeliveryService] Error al disparar orden delivery, aplicando MOCK fallback:', error);
    const mockId = `#MOCK-DELIVERY-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      delivery_id: mockId,
      tracking_url: `https://rastreo.sandbox-delivery.cl/track/${encodeURIComponent(mockId)}`,
      estado: 'En Preparación ⏳',
      proveedor: 'Sandbox Mock Delivery',
      creadoEn: new Date().toISOString()
    };
  }
}
