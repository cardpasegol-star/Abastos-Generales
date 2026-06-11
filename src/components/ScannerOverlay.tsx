import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

interface ScannerOverlayProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function ScannerOverlay({ onScan, onClose }: ScannerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanRef = useRef(onScan);
  scanRef.current = onScan;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    let controls: any = null;

    const startScanner = async () => {
      // Wait for videoRef to exist
      let attempts = 0;
      while (!videoRef.current && attempts < 20) {
        if (!active) return;
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      if (!videoRef.current || !active) return;

      try {
        // Optimización del Formato de Lectura: Buscar específicamente formatos de códigos de barra comerciales
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
        hints.set(DecodeHintType.TRY_HARDER, true);

        const codeReader = new BrowserMultiFormatReader(hints);
        let stream: MediaStream | null = null;
        let successfulStream = false;

        // Intentos progresivos de constraints para adquirir la cámara de forma robusta
        const constraintsList: MediaStreamConstraints[] = [
          // 1. Cámara trasera preferida (ideal: 'environment') con resolución HD ideal para códigos de barra finos
          {
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          // 2. Fallback: Cámara trasera simple
          {
            video: {
              facingMode: 'environment'
            }
          },
          // 3. Fallback genérico: Cualquier cámara disponible
          {
            video: true
          }
        ];

        for (const constraints of constraintsList) {
          if (!active) break;
          try {
            console.log('Intentando obtener MediaStream con constraints:', JSON.stringify(constraints));
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (stream) {
              console.log('MediaStream obtenido con éxito!');
              successfulStream = true;
              break;
            }
          } catch (err: any) {
            console.warn('Fallo al obtener stream con constraints:', JSON.stringify(constraints), err);
            if (stream) {
              try {
                stream.getTracks().forEach(track => track.stop());
              } catch (e) {}
                stream = null;
            }
          }
        }

        if (successfulStream && stream && active) {
          videoRef.current.srcObject = stream;
          controls = await codeReader.decodeFromStream(
            stream,
            videoRef.current,
            (result) => {
              if (!active) return;
              if (result) {
                const code = result.getText();
                if (code && active) {
                  active = false;
                  if (stream) {
                    try {
                      stream.getTracks().forEach(t => t.stop());
                    } catch (e) {}
                  }
                  scanRef.current(code);
                }
              }
            }
          );
        } else {
          if (active) {
            setErrorMsg('No se pudo acceder a ninguna cámara en este dispositivo. Por favor, asegúrate de otorgar los permisos de la cámara en los ajustes de tu navegador o ingresa el código de barras manualmente.');
          }
        }

      } catch (err: any) {
        console.warn('Error crítico al instanciar el decodificador:', err);
        if (active) {
          setErrorMsg('Ocurrió un error al configurar la cámara. Por favor ingresa el código manualmente.');
        }
      }
    };

    startScanner();

    return () => {
      active = false;
      if (controls && typeof controls.stop === 'function') {
        try {
          controls.stop();
        } catch (stopErr) {
          console.warn('Error deteniendo controles de ZXing:', stopErr);
        }
      }

      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(track => {
              if (typeof track.stop === 'function') {
                track.stop();
              }
            });
          }
          videoRef.current.srcObject = null;
        } catch (streamErr) {
          console.warn('Error al liberar pistas de video manualmente:', streamErr);
        }
      }
    };
  }, [retryCount]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      scanRef.current(manualCode.trim());
    }
  };

  const handleSimulate = () => {
    const barcodes = ['7501055300075', '7891000100103', '7790895000431', '7501000111152'];
    const randomCode = barcodes[Math.floor(Math.random() * barcodes.length)];
    scanRef.current(randomCode);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10005] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h4 className="font-extrabold text-gray-950 text-base flex items-center gap-2">📷 Escanear Código</h4>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden" style={{ height: '290px' }}>
          {errorMsg ? (
            <div className="p-6 text-center text-slate-300 space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto stroke-[1.8]" />
              <p className="text-xs font-semibold leading-relaxed px-2">
                {errorMsg}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setRetryCount(prev => prev + 1);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  🔄 Reintentar Activar Cámara
                </button>
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-[11px] transition-colors cursor-pointer"
                >
                  Simular código de prueba
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-64 h-32 border-2 border-emerald-450 rounded-xl relative bg-emerald-500/5">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 animate-[pulse_1.5s_infinite]" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-white/5 text-center text-white text-[9.5px] font-medium leading-normal pointer-events-none">
                💡 Mantén el código de barras dentro del recuadro verde. La detección es automática.
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              O escribir código manualmente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. 7501055300075"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-650 font-bold text-slate-900"
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
