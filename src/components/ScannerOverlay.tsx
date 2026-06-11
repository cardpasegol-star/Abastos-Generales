import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
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

  // Camera devices state
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Detect and List video devices
  useEffect(() => {
    let active = true;

    async function initDevices() {
      try {
        // Request temporary camera permission first to unlock labels in enumerateDevices
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          tempStream.getTracks().forEach(track => track.stop());
        } catch (permErr) {
          console.warn('Initial camera permission request rejected or failed:', permErr);
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        
        if (!active) return;
        setVideoDevices(videoInputs);

        if (videoInputs.length === 0) {
          setErrorMsg('No se detectaron cámaras en este dispositivo. Asegúrate de dar permisos de cámara a la aplicación.');
          setIsInitializing(false);
          return;
        }

        // Search for a suitable rear camera index
        let rearIndex = videoInputs.findIndex(device => {
          const label = device.label.toLowerCase();
          return label.includes('back') || 
                 label.includes('rear') || 
                 label.includes('trasera') || 
                 label.includes('environment') || 
                 label.includes('dirección trasera') ||
                 label.includes('cámara trasera');
        });

        // Fallback to the last camera (which is usually the back camera on Android devices containing multi-lens setups)
        if (rearIndex === -1 && videoInputs.length > 0) {
          rearIndex = videoInputs.length - 1;
        }

        setActiveDeviceIndex(rearIndex !== -1 ? rearIndex : 0);
        setIsInitializing(false);
      } catch (err: any) {
        console.error('Error listing camera devices:', err);
        if (active) {
          setErrorMsg('No se pudo acceder a la lista de cámaras. Revisa los permisos de tu navegador.');
          setIsInitializing(false);
        }
      }
    }

    initDevices();
    return () => { active = false; };
  }, []);

  // 2. Start decoding process using selected device ID
  useEffect(() => {
    if (activeDeviceIndex === null || videoDevices.length === 0) return;

    let active = true;
    let controls: any = null;

    const startScannerOnDevice = async () => {
      // Clear errors
      setErrorMsg(null);

      // Wait until videoRef is rendered
      let attempts = 0;
      while (!videoRef.current && attempts < 25) {
        if (!active) return;
        await new Promise(r => setTimeout(r, 80));
        attempts++;
      }
      if (!videoRef.current || !active) return;

      const device = videoDevices[activeDeviceIndex];
      const deviceId = device?.deviceId || undefined;

      try {
        // High quality decoding parameters
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
        console.log(`Starting barcode scanning on device index: ${activeDeviceIndex}, label: ${device?.label}`);

        // Register decoding on video device (it opens, binds, and loops over frames)
        controls = await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, error) => {
            if (!active) return;
            if (result) {
              const code = result.getText();
              if (code && active) {
                active = false;
                // Trigger success handler
                scanRef.current(code);
              }
            }
          }
        );

      } catch (err: any) {
        console.error('Failed to attach decoding to video device:', err);
        if (active) {
          setErrorMsg('La cámara seleccionada falló al iniciarse. Intenta cambiar de lente con el botón "Cambiar Cámara" abajo.');
        }
      }
    };

    startScannerOnDevice();

    return () => {
      active = false;
      if (controls && typeof controls.stop === 'function') {
        try {
          controls.stop();
        } catch (stopErr) {
          console.warn('Error closing ZXing controls:', stopErr);
        }
      }

      // Ensure explicit stop on all tracks to instantly release the hardware preview light
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
          console.warn('Error releasing stream tracks manually:', streamErr);
        }
      }
    };
  }, [activeDeviceIndex, videoDevices]);

  // 3. Setup continuous autofocus dynamically as soon as video playback starts
  const handleVideoPlay = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        console.log('Active camera track capacities:', JSON.stringify(capabilities));

        const constraints: any = {};
        
        // Android / Chromium autofocus
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          constraints.focusMode = 'continuous';
        }
        
        // Android continuous exposure/white balance auto-tuning
        if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
          constraints.exposureMode = 'continuous';
        }
        if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) {
          constraints.whiteBalanceMode = 'continuous';
        }

        if (Object.keys(constraints).length > 0) {
          await track.applyConstraints({ advanced: [constraints] });
          console.log('Successfully set advanced camera focus constraints:', constraints);
        }
      }
    } catch (e) {
      console.warn('Could not apply continuous autofocus parameters:', e);
    }
  };

  const cycleCamera = () => {
    if (videoDevices.length <= 1) return;
    setActiveDeviceIndex(prev => {
      if (prev === null) return 0;
      return (prev + 1) % videoDevices.length;
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      scanRef.current(manualCode.trim());
    }
  };

  const handleSimulate = () => {
    // Generate typical store product barcodes
    const barcodes = ['7501055300075', '7891000100103', '7790895000431', '7501000111152'];
    const randomCode = barcodes[Math.floor(Math.random() * barcodes.length)];
    scanRef.current(randomCode);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10005] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Title Bar with controls */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div>
            <h4 className="font-extrabold text-gray-950 text-base flex items-center gap-2">📷 Escáner Activo</h4>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
              {videoDevices.length > 0 && activeDeviceIndex !== null 
                ? `Cámara: ${videoDevices[activeDeviceIndex]?.label.slice(0, 24) || 'Principal'}` 
                : 'Cargando Cámara...'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Mirror/Capture container box */}
        <div className="relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden" style={{ height: '310px' }}>
          {isInitializing ? (
            <div className="text-center p-6 space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-extrabold">Inicializando hardware de cámara...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-6 text-center text-slate-300 space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto stroke-[1.8]" />
              <p className="text-xs font-semibold leading-relaxed px-2">
                {errorMsg}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                {videoDevices.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleCamera}
                    className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    🔄 Cambiar a Siguiente Lente / Cámara
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-[11px] transition-colors cursor-pointer"
                >
                  Simular Escaneo (Código de Prueba)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Force aspect-ratio containing so there is no mismatch between coordinates drawn and frames scanned */}
              <video
                ref={videoRef}
                onPlay={handleVideoPlay}
                className="w-full h-full object-contain"
                playsInline
                muted
                autoPlay
              />

              {/* Glowing alignment grid reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-64 h-36 border-2 border-emerald-450 rounded-xl relative bg-emerald-500/5">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                  
                  {/* High voltage green lasers */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 animate-[bounce_2s_infinite] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                </div>
              </div>

              {/* Informative advice banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md rounded-xl p-2.5 border border-white/5 text-center text-white text-[9px] font-medium leading-normal pointer-events-none">
                💡 Para códigos de barra (EAN/UPC), acerca el producto de forma horizontal y mantén buena luz. Si se ve borroso, aléjalo unos 20cm.
              </div>
            </>
          )}
        </div>

        {/* Lower tools with switcher option */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
          {videoDevices.length > 1 && (
            <button
              type="button"
              onClick={cycleCamera}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border-2 border-slate-200 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <Layers className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Cambiar Cámara / Lente ({videoDevices.length} disponibles)</span>
            </button>
          )}

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
