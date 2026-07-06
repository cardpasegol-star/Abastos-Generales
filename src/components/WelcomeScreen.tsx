import React, { useState } from 'react';
import { QrCode, Store, ArrowRight, AlertCircle, Sparkles, Search, MapPin, Keyboard } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface WelcomeScreenProps {
  onSelectStore: (storeId: string) => void;
}

interface StoreItem {
  id: string;
  name: string;
  comuna: string;
  description: string;
  emoji: string;
}

const MOCK_STORES: StoreItem[] = [
  { id: 'turco', name: 'Tienda El Turco', comuna: 'Santiago Centro', description: 'Abarrotes de calidad, ofertas diarias y la mejor atención del barrio.', emoji: '🕌' },
  { id: 'goyo', name: 'Almacén Don Goyo', comuna: 'Ñuñoa', description: 'Pan calientito, fiambrería de selección y verduras de la estación.', emoji: '🏪' },
  { id: 'la-florida', name: 'Minimarket La Florida', comuna: 'La Florida', description: 'Bebidas frías, lácteos de campo, snacks y helados.', emoji: '🍎' },
  { id: 'tres-marias', name: 'Almacén Las Tres Marías', comuna: 'Providencia', description: 'Tu almacén confiable con excelente stock y despacho a domicilio.', emoji: '🥤' },
  { id: 'don-elias', name: 'Botillería Don Elías', comuna: 'Maipú', description: 'Licores, vinos, gaseosas y picoteos listos para tus celebraciones.', emoji: '🍾' },
];

export default function WelcomeScreen({ onSelectStore }: WelcomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Dynamic filter for stores based on name or comuna
  const filteredStores = MOCK_STORES.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.comuna.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (storeId: string) => {
    onSelectStore(storeId);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = manualCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) {
      setError('Por favor, ingresa un código de almacén válido.');
      return;
    }
    onSelectStore(cleanCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-400/10 rounded-full filter blur-3xl" />

      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 space-y-6 sm:space-y-7 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand identity */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Store className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[9.5px] bg-emerald-100/50 border border-emerald-200/50 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Directorio de Almacenes
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 pt-0.5">
              ¿Dónde quieres comprar hoy?
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed max-w-sm mx-auto">
            Explora la vitrina de tu almacén favorito ingresando su nombre, comuna o escaneando su código QR en el local.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-250 text-rose-950 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* Smart Search Filter Input */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">
            Buscar Almacén
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Turco, Goyo, La Florida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-slate-950 font-bold placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          </div>
        </div>

        {/* Dynamic Stores Directory */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
            Locales Encontrados ({filteredStores.length})
          </p>
          
          <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
            {filteredStores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelect(store.id)}
                className="w-full text-left p-3.5 bg-white hover:bg-slate-50/80 border-2 border-slate-100 hover:border-emerald-500 rounded-2xl transition-all cursor-pointer shadow-3xs flex items-start gap-3 active:scale-[0.99] group"
              >
                <span className="text-2xl bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors select-none">
                  {store.emoji}
                </span>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm truncate">
                      {store.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      <MapPin className="w-2.5 h-2.5 stroke-[2.5]" /> {store.comuna}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                    {store.description}
                  </p>
                </div>
              </button>
            ))}

            {filteredStores.length === 0 && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                <p className="text-xs font-extrabold text-slate-700">No se encontraron locales</p>
                <p className="text-[10px] font-semibold text-slate-450">Prueba buscando por otra comuna o ingresa un código manualmente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons layout */}
        <div className="space-y-3">
          {/* QR Scan Button */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider shadow-sm"
          >
            <QrCode className="w-4 h-4 stroke-[2.5] text-emerald-400 animate-pulse" />
            <span>Escanear QR del local</span>
          </button>

          {/* Collapsible Manual Input Toggle */}
          {!showManualInput ? (
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="w-full text-center text-xs font-bold text-slate-450 hover:text-slate-600 py-1 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>¿Tienes un código de almacén directo? Ingresar manualmente</span>
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="bg-slate-50 p-3.5 border border-slate-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                  Código Manual de la Tienda
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: goyo, turco"
                    value={manualCode}
                    onChange={(e) => {
                      setManualCode(e.target.value);
                      setError('');
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!manualCode.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    <span>Ingresar</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5] ml-1" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Camera Scanner overlay modal */}
      {isScannerOpen && (
        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBarcodeDetected={(code) => {
            setIsScannerOpen(false);
            if (code) {
              onSelectStore(code);
            }
          }}
        />
      )}
    </div>
  );
}
