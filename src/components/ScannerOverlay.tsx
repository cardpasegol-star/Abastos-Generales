import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, RefreshCw, Layers, Check, CameraOff } from 'lucide-react';
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

  // States
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Real-time scanned feedback state
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  // 1. Detect and List video devices
  useEffect(() => {
    let active = true;

    async function initDevices() {
      try {
        // Request temporary camera permission first to unlock device labels
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          tempStream.getTracks().forEach(track => track.stop());
        } catch (permErr) {
          console.warn('Initial camera permission request rejected/failed:', permErr);
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        
        if (!active) return;
        setVideoDevices(videoInputs);

        if (videoInputs.length === 0) {
          setErrorMsg('No se detectaron cámaras en este dispositivo o los permisos fueron denegados. Asegúrate de dar acceso a la cámara en tu navegador.');
          setIsInitializing(false);
          return;
        }

        // We want a high-quality rear camera. Choose the last back/rear/rear-facing camera or default to index 0.
        let rearIndex = videoInputs.findIndex(device => {
          const label = device.label.toLowerCase();
          return label.includes('back') || 
                 label.includes('rear') || 
                 label.includes('trasera') || 
                 label.includes('environment') || 
                 label.includes('dirección trasera') ||
                 label.includes('cámara trasera');
        });

        // Fallback to last device (usually back-facing on phone multi-camera system)
        if (rearIndex === -1 && videoInputs.length > 0) {
          rearIndex = videoInputs.length - 1;
        }

        setActiveDeviceIndex(rearIndex !== -1 ? rearIndex : 0);
        setIsInitializing(false);
      } catch (err: any) {
        console.error('Error listing camera devices:', err);
        if (active) {
          setErrorMsg('No se pudo acceder a las cámaras. Asegúrate de autorizar los permisos de cámara en las configuraciones del sitio.');
          setIsInitializing(false);
        }
      }
    }

    initDevices();
    return () => { active = false; };
  }, []);

  // 2. Start decoding process using selected device ID and high-performance stream
  useEffect(() => {
    if (activeDeviceIndex === null || videoDevices.length === 0 || detectedCode !== null) return;

    let active = true;
    let controls: any = null;
    let localStream: MediaStream | null = null;

    const startScannerOnDevice = async () => {
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
      const deviceId = device?.deviceId;

      try {
        // High quality EAN/UPC specific hints. 
        // Removing TRY_HARDER because it drops frame-rate down to 1-2 FPS on standard mobile CPU cores.
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
        console.log(`Starting high definition camera stream for device ID: ${deviceId}`);

        // Custom HD constraints to avoid blurry scanning issues on fine lines of barcodes!
        const constraintsList = [
          // 1. High Definition Rear preferred
          {
            video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 }
          },
          // 2. Standard 720p HD fallback
          {
            video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          // 3. Simple fallback
          {
            video: deviceId ? { deviceId: { exact: deviceId } } : true
          }
        ];

        let success = false;
        for (const constraints of constraintsList) {
          if (!active) break;
          try {
            console.log('Requesting MediaStream constraints:', JSON.stringify(constraints));
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (localStream) {
              success = true;
              break;
            }
          } catch (e) {
            console.warn('Failed with constraints, trying alternative:', e);
          }
        }

        if (!success || !localStream || !active) {
          throw new Error('No se pudo abrir el stream de video de la cámara seleccionada.');
        }

        // Attach stream to video tag
        videoRef.current.srcObject = localStream;

        // Start decode scanner continuously from the opened stream
        controls = await codeReader.decodeFromStream(
          localStream,
          videoRef.current,
          (result, error) => {
            if (!active) return;
            if (result) {
              const code = result.getText();
              if (code && active) {
                // Pause scanner and prompt detected code box inside overlay!
                active = false;
                
                // Play short haptic vibration feedback if supported
                if (typeof window !== 'undefined' && navigator.vibrate) {
                  try {
                    navigator.vibrate(120);
                  } catch (e) {}
                }

                // Show the detected code so the user sees exactly what numbers were scanned before closing!
                setDetectedCode(code);
              }
            }
          }
        );

      } catch (err: any) {
        console.error('Failed to attach decoding to stream:', err);
        if (active) {
          setErrorMsg('La cámara seleccionada falló al iniciarse. Asegúrate de dar los permisos del sitio e intenta cambiar de cámara en el botón inferior.');
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

      // Cleanup stream tracks manually to release camera hardware
      if (localStream) {
        try {
          localStream.getTracks().forEach(track => track.stop());
        } catch (e) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(track => track.stop());
          }
          videoRef.current.srcObject = null;
        } catch (e) {}
      }
    };
  }, [activeDeviceIndex, videoDevices, detectedCode]);

  // Autofocus triggers dynamically on video playback start
  const handleVideoPlay = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        const constraints: any = {};
        
        // Continuous autofocus
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          constraints.focusMode = 'continuous';
        }
        // Continuous auto-exposure / white balance
        if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
          constraints.exposureMode = 'continuous';
        }
        if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) {
          constraints.whiteBalanceMode = 'continuous';
        }

        if (Object.keys(constraints).length > 0) {
          await track.applyConstraints({ advanced: [constraints] });
          console.log('Autofocus properties successfully injected:', constraints);
        }
      }
    } catch (e) {
      console.warn('Could not inject auto settings:', e);
    }
  };

  const cycleCamera = () => {
    if (videoDevices.length <= 1) return;
    setDetectedCode(null);
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

  const handleConfirmDetected = () => {
    if (detectedCode && detectedCode.trim()) {
      scanRef.current(detectedCode.trim());
    }
  };

  const handleSimulate = () => {
    const barcodes = ['7501055300075', '7891000100103', '7790895000431', '7501000111152'];
    const randomCode = barcodes[Math.floor(Math.random() * barcodes.length)];
    setDetectedCode(randomCode);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10005] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div>
            <h4 className="font-extrabold text-gray-950 text-base flex items-center gap-2">📷 Escáner de Barra</h4>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">
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
        
        {/* Central area: Camera Stream OR Scanned Feedback HUD */}
        <div className="relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden" style={{ height: '310px' }}>
          {detectedCode !== null ? (
            /* DETECTED CODE FEEDBACK SYSTEM - Real-time editable display box requested by user! */
            <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-slate-900 border-2 border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-emerald-400 text-sm tracking-wide uppercase">¡Código de Barras Leído!</h5>
                <p className="text-[10px] text-slate-400 font-medium">Revisa o edita los números escaneados abajo</p>
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
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95"
                >
                  🔄 Reintentar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDetected}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95 border border-emerald-500 shadow-md flex items-center justify-center gap-1"
                >
                  Confirmar ✓
                </button>
              </div>
            </div>
          ) : isInitializing ? (
            <div className="text-center p-6 space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Iniciando lentes de cámara...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-6 text-center text-slate-305 space-y-4">
              <CameraOff className="w-12 h-12 text-slate-500 mx-auto stroke-[1.8]" />
              <p className="text-xs font-semibold leading-relaxed px-2 text-slate-400">
                {errorMsg}
              </p>
              
              {/* Manual input help inside the box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 text-left">
                💡 <b>Consejo:</b> Si tu navegador tiene bloqueada la cámara, puedes habilitar los permisos haciendo clic en el candado 🔒 al lado de la dirección web o usar el campo de texto manual abajo.
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {videoDevices.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleCamera}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    🔄 Probar Cámara Alternativa
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold p-2 rounded-xl text-[10px] transition-colors cursor-pointer"
                >
                  Simular Escaneo (Código de Prueba)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Absolute stream visual wrapper */}
              <video
                ref={videoRef}
                onPlay={handleVideoPlay}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />

              {/* Precise green neon laser alignment frames */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/5">
                <div className="w-64 h-36 border-2 border-emerald-450 rounded-xl relative bg-emerald-500/5">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                  
                  {/* Dynamic bouncing visual sweep laser */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 animate-[bounce_2s_infinite] shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                </div>
              </div>

              {/* Real-time instruction guidance */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md rounded-xl p-2.5 border border-white/5 text-center text-white text-[9.5px] font-medium leading-normal pointer-events-none z-10 shadow-lg">
                💡 Apunta al código de barras en forma horizontal cubriendo el recuadro verde. Aléjalo a unos 15-20cm si se ve borroso.
              </div>
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
          {videoDevices.length > 1 && detectedCode === null && !errorMsg && (
            <button
              type="button"
              onClick={cycleCamera}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border-2 border-slate-200 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <Layers className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Cambiar Cámara / Lente ({videoDevices.length} detectadas)</span>
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
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-650 font-bold text-slate-900 shadow-sm"
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
