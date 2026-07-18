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
  { 
    id: 'el_turco', 
    name: 'Minimarket "Donde el Turco"', 
    comuna: 'La Pintana', 
    description: 'Abarrotes, fiambrería, panadería, bebidas frías y la mejor atención del barrio.', 
    emoji: '🏪' 
  },
  { 
    id: 'fruteria_principe_gales', 
    name: 'Frutería Príncipe de Gales', 
    comuna: 'Ñuñoa', 
    description: 'Frutas y verduras seleccionadas al peso, frutos secos, productos del campo y un servicio excepcional.', 
    emoji: '🍎' 
  },
  { 
    id: 'buencorte', 
    name: 'Carnicería "El Buen Corte"', 
    comuna: 'La Florida', 
    description: 'Cortes premium de vacuno, cerdo, aves, carbón y todo para tu asado perfecto.', 
    emoji: '🥩' 
  },
  { 
    id: 'barrioseguro', 
    name: 'Farmacia "Barrio Seguro"', 
    comuna: 'Santiago Centro', 
    description: 'Medicinas, vitaminas, bienestar, higiene personal y asesoría farmacéutica de confianza.', 
    emoji: '💊' 
  }
];

const RM_COMUNAS = [
  "La Florida",
  "La Pintana",
  "Puente Alto",
  "San Ramón",
  "La Granja",
  "Macul",
  "Peñalolén",
  "San Joaquín",
  "Santiago Centro",
  "Las Condes",
  "Providencia",
  "Ñuñoa",
  "Maipú",
  "San Bernardo",
  "Pudahuel",
  "Quilicura",
  "Recoleta",
  "Estación Central",
  "San Miguel",
  "Pedro Aguirre Cerda",
  "Cerrillos",
  "Lo Espejo",
  "El Bosque",
  "La Cisterna",
  "Independencia",
  "Quinta Normal",
  "Renca",
  "Cerro Navia",
  "Lo Prado",
  "Conchalí",
  "Huechuraba",
  "Vitacura",
  "Lo Barnechea"
];

export default function WelcomeScreen({ onSelectStore }: WelcomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [selectedClientComuna, setSelectedClientComuna] = useState(() => {
    return localStorage.getItem('cliente_comuna') || 'La Florida';
  });

  const handleComunaChange = (val: string) => {
    setSelectedClientComuna(val);
    localStorage.setItem('cliente_comuna', val);
  };

  // Dynamic filter for stores based on name or comuna
  const filteredStores = MOCK_STORES.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.comuna.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (storeId: string) => {
    localStorage.setItem('id_tienda', storeId);
    localStorage.setItem('tenant_tienda_id', storeId);
    onSelectStore(storeId);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = manualCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) {
      setError('Por favor, ingresa un código de almacén válido.');
      return;
    }
    localStorage.setItem('id_tienda', cleanCode);
    localStorage.setItem('tenant_tienda_id', cleanCode);
    onSelectStore(cleanCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-400/10 rounded-full filter blur-3xl" />

      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 space-y-6 sm:space-y-7 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Banner principal */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 sm:p-6 shadow-md border border-emerald-500 text-center space-y-3">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
              Tu Comercio Local a un Clic
            </h1>
            <p className="text-xs font-black uppercase text-emerald-200 tracking-wider">
              Región Metropolitana 🇨🇱
            </p>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-emerald-50 max-w-xs mx-auto leading-relaxed">
            Compra en los mejores locales con cotización inteligente de delivery en tiempo real.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-250 text-rose-950 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* Selector de comuna inicial */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Selecciona tu Comuna de Destino (Envío)</span>
          </label>
          <select
            value={selectedClientComuna}
            onChange={(e) => handleComunaChange(e.target.value)}
            className="w-full bg-white border-2 border-slate-350 rounded-xl px-3 py-2.5 text-xs focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 outline-none font-bold text-slate-950 cursor-pointer"
          >
            {RM_COMUNAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 font-semibold italic">
            Las tarifas se calcularán automáticamente por anillos radiales desde el comercio seleccionado.
          </p>
        </div>

        {/* Smart Search Filter Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
            Buscar Almacén o Comuna
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Turco, Buen Corte, La Florida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-950 font-bold placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          </div>
        </div>

        {/* Dynamic Stores Directory */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Locales Registrados ({filteredStores.length})
          </p>
          
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {filteredStores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelect(store.id)}
                className="w-full text-left p-4 bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl transition-all cursor-pointer shadow-3xs flex items-start gap-3.5 active:scale-[0.99] group relative"
              >
                <span className="text-3xl bg-slate-50 p-2.5 rounded-xl group-hover:bg-emerald-50 transition-colors select-none shrink-0 border border-slate-100">
                  {store.emoji}
                </span>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-950 group-hover:text-emerald-700 transition-colors text-sm truncate">
                      {store.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full shrink-0">
                      Origen: {store.comuna}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed line-clamp-2 font-sans">
                    {store.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-slate-450">
                    <span className="text-emerald-600 font-black flex items-center gap-1">
                      Entrar a la tienda <ArrowRight className="w-3 h-3 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
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
        <div className="space-y-3 pt-1">
          {/* QR Scan Button */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider shadow-sm border border-slate-800"
          >
            <QrCode className="w-4 h-4 stroke-[2.5] text-emerald-400 animate-pulse" />
            <span>Escanear QR del local</span>
          </button>

          {/* Collapsible Manual Input Toggle */}
          {!showManualInput ? (
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 py-1 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>¿Tienes un código de almacén directo? Ingresar manualmente</span>
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="bg-slate-50 p-3.5 border border-slate-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  Código Manual de la Tienda
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: turco, buencorte, barrioseguro"
                    value={manualCode}
                    onChange={(e) => {
                      setManualCode(e.target.value);
                      setError('');
                    }}
                    className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 transition-all text-slate-950"
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
              const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
              localStorage.setItem('id_tienda', cleanCode);
              localStorage.setItem('tenant_tienda_id', cleanCode);
              onSelectStore(cleanCode);
            }
          }}
        />
      )}
    </div>
  );
}
