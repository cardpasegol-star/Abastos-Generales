import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, RefreshCw, Check } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onBarcodeDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar soporte nativo del BarcodeDetector
  const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    let stream: MediaStream | null = null;
    let intervalId: any = null;

    // Resetear estados
    setErrorMsg(null);
    setScannedCode(null);
    setIsLoading(true);

    if (!hasDetector) {
      setErrorMsg('No compatible con BarcodeDetector. Ingresa el código de barras manualmente.');
      setIsLoading(false);
      return;
    }

    const startCameraAndDetection = async () => {
      try {
        // Enforce progressive getUserMedia
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
        } catch (e1) {
          console.warn('Fallo facingMode environment, intentando cualquier cámara disponible:', e1);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
          } catch (e2) {
            console.error('Fallo absoluto al adquirir cámara:', e2);
            if (active) {
              setErrorMsg('No se pudo acceder a la cámara. Asegúrele de dar permisos de cámara al navegador o escriba el código manual.');
              setIsLoading(false);
            }
            return;
          }
        }

        if (!active || !stream) {
          if (stream) stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          
          await videoRef.current.play();

          if (!active) return;
          setIsLoading(false);

          // Inicializar BarcodeDetector nativo
          const BarcodeDetectorClass = (window as any).BarcodeDetector;
          const detector = new BarcodeDetectorClass({
            formats: ['ean_13', 'ean_8', 'code_128', 'qr_code']
          });

          // Hacer detección continua cada 300ms
          intervalId = setInterval(async () => {
            if (!active || !videoRef.current) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (active && barcodes && barcodes.length > 0) {
                const rawVal = barcodes[0].rawValue;
                if (rawVal && active) {
                  // Detener loop
                  clearInterval(intervalId);
                  active = false;

                  // Detener tracks
                  if (stream) {
                    stream.getTracks().forEach(t => t.stop());
                  }

                  // Feedback háptico si lo soporta
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(120); } catch (e) {}
                  }

                  setScannedCode(rawVal);
                }
              }
            } catch (err) {
              console.warn('Fallo iteración de decodificación:', err);
            }
          }, 300);
        }

      } catch (err: any) {
        console.error('Error montando cámara en modal:', err);
        if (active) {
          setErrorMsg('Error al conectar el streaming de video para el escaneo.');
          setIsLoading(false);
        }
      }
    };

    startCameraAndDetection();

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, hasDetector]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onBarcodeDetected(manualCode.trim());
    }
  };

  const handleConfirmCode = () => {
    if (scannedCode) {
      onBarcodeDetected(scannedCode.trim());
    }
  };

  const handleSimulate = () => {
    const barcodes = ['7501055300075', '7891000100103', '7790895000431', '7501000111152'];
    const randomCode = barcodes[Math.floor(Math.random() * barcodes.length)];
    setScannedCode(randomCode);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10005] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
      
      {/* Animación del barrido láser con styled-block compatible con Tailwind v4 */}
      <style>{`
        @keyframes verticalSweep {
          0% { transform: translateY(0); }
          50% { transform: translateY(220px); }
          100% { transform: translateY(0); }
        }
        .laser-sweep-line {
          animation: verticalSweep 2.2s infinite ease-in-out;
        }
      `}</style>

      <div className="bg-slate-900 rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative border border-slate-800 animate-in zoom-in-95 duration-200 text-white flex flex-col">
        
        {/* Header bar */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h4 className="font-extrabold text-white text-base flex items-center gap-2">📷 Escáner de Barra</h4>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
              {scannedCode ? 'Código Detectado' : isLoading ? 'Cargando Cámara...' : 'Cámara Activa (Nativa)'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-350 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Inner video / results container */}
        <div className="relative bg-slate-955 flex flex-col items-center justify-center overflow-hidden" style={{ height: '310px' }}>
          
          {scannedCode !== null ? (
            /* DETECTED CODE FEEDBACK PANEL */
            <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-slate-900 space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-emerald-450 text-sm tracking-wide uppercase">¡Código Detectado!</h5>
                <p className="text-[10px] text-slate-400 font-medium">Revisa o edita los números escaneados abajo</p>
              </div>

              <div className="w-full px-2">
                <input
                  type="text"
                  className="w-full bg-slate-950 text-emerald-400 font-mono font-black text-center py-2.5 rounded-xl border-2 border-emerald-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 text-lg tracking-widest outline-none shadow-inner"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full px-2">
                <button
                  type="button"
                  onClick={() => setScannedCode(null)}
                  className="flex-1 bg-slate-805 hover:bg-slate-800 text-slate-350 font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95 border border-slate-700"
                >
                  🔄 Reintentar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95 border border-emerald-500 shadow-md"
                >
                  Confirmar ✓
                </button>
              </div>
            </div>
          ) : isLoading ? (
            /* INITIALIZING / SPINNER */
            <div className="text-center p-6 space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Iniciando hardware de cámara...</p>
            </div>
          ) : errorMsg ? (
            /* COMPATIBILITY FALLBACK OR ERROR */
            <div className="p-6 text-center text-slate-300 space-y-4 w-full">
              <AlertTriangle className="w-11 h-11 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold leading-relaxed px-2 text-slate-300">
                {errorMsg}
              </p>
              
              <div className="bg-slate-905 border border-slate-800 rounded-2xl p-3 text-left space-y-1">
                <p className="text-[10px] font-black text-slate-200">💡 CONSEJO PARA ACTIVAR:</p>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Usa Google Chrome/Microsoft Edge en tu celular Android. Si el navegador solicita permisos al arrancar, otórgalos sin problemas.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold px-4 py-2 rounded-xl text-[10px] transition-colors cursor-pointer"
                >
                  Simular Escaneo (Código de Prueba)
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE CAMERA STREAM VIEWPORT */
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover animate-in fade-in duration-300"
                playsInline
                muted
              />

              {/* Glowing visual scan frames / overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/10">
                <div className="w-64 h-36 border-2 border-emerald-500/20 rounded-xl relative bg-emerald-500/5">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                  
                  {/* Animación de la línea de escaneo horizontal */}
                  <div className="absolute inset-x-0 w-full h-0.5 bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.9)] laser-sweep-line pointer-events-none" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md rounded-xl p-2.5 border border-white/5 text-center text-white text-[9px] font-medium leading-normal pointer-events-none z-10 shadow-lg">
                💡 Apunta al código de barras en forma horizontal dentro del recuadro verde. Aléjalo a unos 15-20cm si se ve borroso.
              </div>
            </>
          )}

        </div>

        {/* Native fallback manual selection inputs */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleManualSubmit} className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              O ingresar código numérico manualmente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. 7501055300075"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-white shadow-inner placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm active:scale-95 text-center border border-emerald-500"
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
