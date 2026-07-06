import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, AlertTriangle, RefreshCw, Check } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onBarcodeDetected }: BarcodeScannerProps) {
  // Estados
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);         // requestAnimationFrame ID
  const detectorRef = useRef<any>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<'loading'|'active'|'detected'|'error'|'unsupported'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Función stopCamera
  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch (e) {}
      zxingReaderRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    
    // Resetear estados
    setStatus('loading');
    setErrorMsg('');
    setScannedCode('');

    const startCameraAndDetection = async () => {
      // Verificar si BarcodeDetector nativo está soportado
      const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

      try {
        // PASO 1: Pedir la cámara trasera usando facingMode "environment" directo de forma compatible
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment"
            }
          });
        } catch (e1) {
          console.warn('Fallo facingMode simple, intentando constraints extendidos:', e1);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            });
          } catch (e2) {
            console.warn('Fallo facingMode environment, intentando cualquier cámara disponible:', e2);
            stream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
          }
        }

        if (!active) {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          return;
        }

        streamRef.current = stream;

        // PASO 2: Asignar stream al video element
        if (videoRef.current) {
          // Atributos obligatorios para iOS para evitar pantalla completa nativa y reproducir muted
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          videoRef.current.muted = true;

          const playVideo = async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play();
              }
              if (active) {
                setStatus('active');
                
                if (hasDetector) {
                  // --- PROCEDIMIENTO DE ESCANEO ORIGINAL PARA DISPOSITIVOS COMPATIBLES (Android Chrome, etc) ---
                  const BarcodeDetectorClass = (window as any).BarcodeDetector;
                  const detector = new BarcodeDetectorClass({
                    formats: ['ean_13', 'ean_8', 'code_128', 'qr_code']
                  });
                  detectorRef.current = detector;

                  // Loop de detección con requestAnimationFrame
                  const detectFrame = async () => {
                    if (!active || !videoRef.current || status === 'detected') return;
                    try {
                      const barcodes = await detector.detect(videoRef.current);
                      if (active && barcodes && barcodes.length > 0) {
                        const rawVal = barcodes[0].rawValue;
                        if (rawVal && active) {
                          // Detener loop y stream
                          active = false;
                          stopCamera();

                          // Vibración háptica
                          if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            try { navigator.vibrate(120); } catch (e) {}
                          }

                          setScannedCode(rawVal);
                          setStatus('detected');
                          return;
                        }
                      }
                    } catch (err) {
                      // Ignorar fallos continuos de lectura en frames vacíos
                    }
                    if (active) {
                      rafRef.current = requestAnimationFrame(detectFrame);
                    }
                  };

                  rafRef.current = requestAnimationFrame(detectFrame);
                } else {
                  // --- MODELO FALLBACK ULTRA COMPATIBLE PARA IPHONE / SAFARI / IOS CHROME (ZXing library) ---
                  console.log('Iniciando fallback de escaneo con @zxing/library...');
                  const reader = new BrowserMultiFormatReader();
                  zxingReaderRef.current = reader;

                  if (videoRef.current) {
                    reader.decodeFromVideoElementContinuously(videoRef.current, (result, err) => {
                      if (!active) return;
                      if (result) {
                        const rawVal = result.getText();
                        if (rawVal && active) {
                          active = false;
                          
                          if (zxingReaderRef.current) {
                            try {
                              zxingReaderRef.current.reset();
                            } catch (e) {}
                            zxingReaderRef.current = null;
                          }
                          stopCamera();

                          if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            try { navigator.vibrate(120); } catch (e) {}
                          }

                          setScannedCode(rawVal);
                          setStatus('detected');
                        }
                      }
                    });
                  }
                }
              }
            } catch (err) {
              console.error('video.play() falló o fue cancelado:', err);
              if (active) {
                setStatus('error');
                setErrorMsg('Error al reproducir la cámara en tu dispositivo. Asegúrate de dar acceso de video en la configuración de Safari/Chrome.');
              }
            }
          };

          // Registrar eventos de carga de metadatos/datos ANTES de asignar el srcObject para evitar condiciones de carrera en iOS
          let loaded = false;
          const onLoaded = () => {
            if (loaded) return;
            loaded = true;
            playVideo();
          };

          videoRef.current.onloadedmetadata = onLoaded;
          videoRef.current.onloadeddata = onLoaded;

          videoRef.current.srcObject = stream;

          // Si el navegador ya procesó los metadatos de inmediato (común en engines rápidos como iOS WebKit)
          if (videoRef.current.readyState >= 1) {
            onLoaded();
          }
        }

      } catch (err: any) {
        console.error('Error al iniciar stream de cámara:', err);
        if (active) {
          setStatus('error');
          const name = err.name;
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            setErrorMsg('Acceso a la cámara denegado. Para escanear en tu iPhone, ve a Ajustes > Safari (o tu navegador) > Cámara, y selecciona "Permitir".');
            alert('Permiso de cámara denegado. Para escanear códigos en este iPhone, por favor permite el acceso a la cámara en los ajustes de privacidad de tu navegador.');
          } else if (name === 'NotFoundError') {
            setErrorMsg('No se detectó ninguna cámara trasera compatible en este dispositivo.');
          } else if (name === 'NotReadableError') {
            setErrorMsg('La cámara está bloqueada por otra pestaña o aplicación abierta. Por favor ciérralas e intenta de nuevo.');
          } else {
            setErrorMsg('No se pudo abrir la cámara. Por favor autoriza el permiso o ingresa el código numérico manualmente.');
          }
        }
      }
    };

    startCameraAndDetection();

    return () => {
      active = false;
      stopCamera();
      setStatus('loading');
    };
  }, [isOpen, retryTrigger, stopCamera]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onBarcodeDetected(manualCode.trim());
    }
  };

  const handleConfirmCode = () => {
    if (scannedCode.trim()) {
      onBarcodeDetected(scannedCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10005] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-155">
      
      {/* Animación del barrido láser con CSS keyframes */}
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
              {status === 'detected' ? 'Código Detectado' : status === 'loading' ? 'Iniciando Cámara...' : 'Cámara Activa'}
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

        {/* Dimensiones explícitas de ancho y alto en píxeles y porcentaje para máxima estabilidad en Safari / iOS WebKit */}
        <div 
          className="relative bg-slate-955 flex flex-col items-center justify-center overflow-hidden" 
          style={{ width: '100%', height: '310px', minHeight: '310px', maxHeight: '310px' }}
        >
          
          {/* El video element debe estar en el DOM y visible al layout engine en 'loading' para que iOS cargue metadatos y play() funcione */}
          <video
            ref={videoRef}
            className="animate-in fade-in duration-300"
            style={{ 
              display: (status === 'active' || status === 'loading') ? 'block' : 'none',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            playsInline={true}
            webkit-playsinline="true"
            muted={true}
            autoPlay={true}
          />

          {status === 'loading' && (
            /* INITIALIZING / SPINNER - Absoluto cubriendo al video durante la carga */
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900 z-10 space-y-3 animate-in fade-in duration-200" style={{ width: '100%', height: '100%' }}>
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Iniciando cámara...</p>
            </div>
          )}

          {status === 'detected' && (
            /* DETECTED CODE FEEDBACK PANEL */
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900 space-y-4 animate-in fade-in duration-200" style={{ width: '100%', height: '100%' }}>
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
                  onClick={() => {
                    setScannedCode('');
                    setRetryTrigger(prev => prev + 1);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-350 font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95 border border-slate-700"
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
          )}

          {(status === 'error' || status === 'unsupported') && (
            /* COMPATIBILITY FALLBACK OR ERROR */
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center text-slate-300 space-y-4 w-full bg-slate-900" style={{ width: '100%', height: '100%' }}>
              <AlertTriangle className="w-11 h-11 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold leading-relaxed px-4 text-slate-300">
                {errorMsg}
              </p>
              
              <div className="bg-slate-955 border border-slate-800 rounded-2xl p-3.5 text-left space-y-1.5 w-full max-w-[320px]">
                <p className="text-[10px] font-black text-slate-200">💡 CONSEJO PARA ACTIVAR EN IPHONE:</p>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Asegúrate de dar permiso de cámara si el navegador te lo pregunta. Si ya lo denegaste, puedes restablecerlo recargando la página o en los Ajustes del iPhone. También puedes escribir el número directamente abajo.
                </p>
              </div>
            </div>
          )}

          {status === 'active' && (
            /* ACTIVE OVERLAY FRAMES */
            <>
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
                💡 Apunta al código de barras horizontalmente dentro del recuadro verde. Aléjalo a unos 15-20cm si se ve borroso.
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
