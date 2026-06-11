import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, RefreshCw, Check, Camera, HelpCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onBarcodeDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    // Reset component states
    setErrorMsg(null);
    setDetectedCode(null);
    setIsInitializing(true);

    const initializeCameraAndDecoder = async () => {
      // 1. Instanciar el decodificador con los formatos comerciales estándar
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE
      ]);
      const codeReader = new BrowserMultiFormatReader(hints);
      codeReaderRef.current = codeReader;

      // Esperar un momento a que el DOM se procese y videoRef esté disponible
      let retries = 0;
      while (!videoRef.current && retries < 20) {
        if (!active) return;
        await new Promise(r => setTimeout(r, 100));
        retries++;
      }

      if (!videoRef.current || !active) return;

      // 2. Solicitar cámara de forma progresiva y segura
      let stream: MediaStream | null = null;
      try {
        console.log('Intentando obtener video con facingMode: environment');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
      } catch (err1) {
        console.warn('Fallo facingMode environment, intentando cualquier cámara disponible:', err1);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        } catch (err2) {
          console.error('Fallo absoluto al adquirir cámara:', err2);
          if (active) {
            setErrorMsg(
              'No se pudo acceder a la cámara. Por favor, asegúrate de otorgar los permisos necesarios de cámara en tu navegador, o utiliza la opción de ingreso manual de código abajo.'
            );
            setIsInitializing(false);
          }
          return;
        }
      }

      if (!stream || !active) {
        if (stream) stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      try {
        // 3. Flujo correcto de asignación al elemento de video
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // IMPORTANTE para impedir pantalla completa en iOS
        
        // Esperar a que el video comience a reproducirse
        await videoRef.current.play();

        if (!active) return;
        setIsInitializing(false);

        // 4. Iniciar decodificación continua desde el elemento de video ya estabilizado
        codeReader.decodeFromVideoElement(videoRef.current, (result, error) => {
          if (!active) return;
          if (result) {
            const code = result.getText();
            if (code && active) {
              // Detener escaneos posteriores momentáneamente y mostrar la pre-confirmación
              setDetectedCode(code);
            }
          }
        });

      } catch (decodeInitErr: any) {
        console.error('Error al inicializar el lector sobre el elemento de video:', decodeInitErr);
        if (active) {
          setErrorMsg('Error al conectar el lector de códigos de barras. Por favor, ingresa el código de forma manual.');
          setIsInitializing(false);
        }
      }
    };

    initializeCameraAndDecoder();

    // 5. Limpieza al desmontar o cerrar
    return () => {
      active = false;
      
      // Detener todos los tracks del stream
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn('Error deteniendo tracks de video:', e);
        }
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Detener y resetear el reader
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          console.warn('Error reseteando codeReader:', e);
        }
        codeReaderRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onBarcodeDetected(manualCode.trim());
    }
  };

  const handleConfirmDetected = () => {
    if (detectedCode) {
      onBarcodeDetected(detectedCode.trim());
    }
  };

  const handleSimulate = () => {
    const simulateBarcodes = ['7501055300075', '7891000100103', '7790895000431', '7501000111152'];
    const randomCode = simulateBarcodes[Math.floor(Math.random() * simulateBarcodes.length)];
    setDetectedCode(randomCode);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10005] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div>
            <h4 className="font-extrabold text-gray-950 text-base flex items-center gap-2">📷 Escáner de Barras</h4>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
              {detectedCode ? 'Código Detectado' : isInitializing ? 'Cargando Cámara...' : 'Cámara Activa'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zona central: Video / Error / Confirmación */}
        <div className="relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden" style={{ height: '310px' }}>
          
          {/* 1. Vista de pre-confirmación del código detectado */}
          {detectedCode !== null ? (
            <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-slate-900 space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-emerald-400 text-sm tracking-wide uppercase">¡Código Detectado!</h5>
                <p className="text-[10px] text-slate-400 font-medium">Revisa o edita los números del producto antes de proceder</p>
              </div>

              <div className="w-full px-2">
                <input
                  type="text"
                  className="w-full bg-slate-950 text-emerald-400 font-mono font-black text-center py-2.5 rounded-xl border-2 border-emerald-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 text-lg tracking-widest outline-none shadow-inner"
                  value={detectedCode}
                  onChange={(e) => setDetectedCode(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full px-2">
                <button
                  type="button"
                  onClick={() => setDetectedCode(null)}
                  className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-300 font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95"
                >
                  🔄 Volver a intentar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDetected}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95 border border-emerald-500 shadow-md"
                >
                  Confirmar ✓
                </button>
              </div>
            </div>
          ) : isInitializing && !errorMsg ? (
            /* 2. Pantalla de carga */
            <div className="text-center p-6 space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Iniciando hardware de cámara...</p>
            </div>
          ) : errorMsg ? (
            /* 3. Pantalla de error con guía de soporte para el usuario */
            <div className="p-6 text-center text-slate-300 space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto stroke-[1.8]" />
              <p className="text-xs font-semibold leading-relaxed px-2 text-slate-300">
                {errorMsg}
              </p>
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-200 text-[10px] font-black">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>CÓMO ACTIVAR LOS PERMISOS:</span>
                </div>
                <p className="text-[9px] text-slate-450 leading-relaxed">
                  Haz clic en el candado 🔒 al lado de la barra de direcciones de tu navegador web y asegúrate de permitir la <b>Cámara</b> para este sitio.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-[10px] transition-colors cursor-pointer"
                >
                  Simular Escaneo (Código de Prueba)
                </button>
              </div>
            </div>
          ) : (
            /* 4. Stream en vivo con Grid de Enfoque */
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Retículo de enfoque verde */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/5">
                <div className="w-64 h-36 border-2 border-emerald-450 rounded-xl relative bg-emerald-500/5">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                  
                  {/* Láser de barrido animado */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 animate-[bounce_2s_infinite] shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md rounded-xl p-2.5 border border-white/5 text-center text-white text-[9px] font-medium leading-normal pointer-events-none z-10 shadow-lg">
                💡 Mantén el código de barras centrado dentro del recuadro verde. Si notas borrosa la cámara, aleja el producto un instante (a unos 20 cm) para enfocar.
              </div>
            </>
          )}
        </div>

        {/* Zona inferior de entrada manual alternativa */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <form onSubmit={handleManualSubmit} className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">
              O ingresar código numérico manualmente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. 7501055300075"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-650 font-bold text-slate-900 shadow-sm"
              />
              <button
                type="submit"
                className="bg-emerald-650 hover:bg-emerald-705 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm active:scale-95 text-center border border-emerald-500"
              >
                Listo
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
