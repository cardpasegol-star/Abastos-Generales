import React, { useState } from 'react';
import { QrCode, Store, ArrowRight, AlertCircle, Sparkles, Search, MapPin, Keyboard, Truck, ShoppingBag } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface WelcomeScreenProps {
  onSelectStore: (storeId: string) => void;
}

interface StoreItem {
  id: string;
  name: string;
  comuna: string;
  badge: string;
  description: string;
  emoji: string;
  bannerUrl: string;
  tagColor: string;
  btnBg: string;
}

const MOCK_STORES: StoreItem[] = [
  { 
    id: 'fruteria_principe_gales', 
    name: 'Frutería & Verdulería "Príncipe de Gales"', 
    comuna: 'Ñuñoa / La Reina', 
    badge: '🍎 Fruta Fina & Campo',
    description: 'Frutas y verduras seleccionadas al peso, frutos secos, huevos de campo y conservas con despacho fresco.', 
    emoji: '🍎',
    bannerUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800',
    tagColor: 'bg-emerald-600 text-white',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  },
  { 
    id: 'el_turco', 
    name: 'Minimarket Virtual "DondeElTurco"', 
    comuna: 'La Pintana', 
    badge: '🏬 Abarrotes & Rotisería',
    description: 'Abarrotes de primera necesidad, fiambrería al corte, panadería, bebidas frías y la mejor atención del barrio.', 
    emoji: '🏪',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800',
    tagColor: 'bg-amber-600 text-white',
    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white'
  },
  { 
    id: 'artico_congelados', 
    name: 'Distribuidora "Ártico Congelados"', 
    comuna: 'La Florida (Despacho RM)', 
    badge: '🧊 Congelados & Pulpa',
    description: 'Distribuidora mayorista de congelados, churrascos, hamburguesas, pulpas de fruta, mariscos y kits parrillero.', 
    emoji: '🧊',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    tagColor: 'bg-sky-600 text-white',
    btnBg: 'bg-sky-600 hover:bg-sky-700 text-white'
  },
  { 
    id: 'buencorte', 
    name: 'Carnicería "El Buen Corte"', 
    comuna: 'La Florida', 
    badge: '🥩 Carnes Premium',
    description: 'Cortes premium de vacuno, cerdo, aves, carbón de espino y todo lo necesario para tu asado perfecto.', 
    emoji: '🥩',
    bannerUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
    tagColor: 'bg-rose-700 text-white',
    btnBg: 'bg-rose-700 hover:bg-rose-800 text-white'
  },
  { 
    id: 'barrioseguro', 
    name: 'Farmacia "Barrio Seguro"', 
    comuna: 'Santiago Centro', 
    badge: '💊 Farmacia & Salud',
    description: 'Medicinas, suplementos, vitaminas, higiene personal y despacho express a tu domicilio.', 
    emoji: '💊',
    bannerUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    tagColor: 'bg-emerald-700 text-white',
    btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white'
  },
  { 
    id: 'pasion-pizzas', 
    name: 'Pizzería "Pasión por las Pizzas"', 
    comuna: 'Providencia / Ñuñoa', 
    badge: '🍕 Pizzas & Promos 2x',
    description: 'Pizzas artesanales a la piedra, masa madre, promociones 2x, calzones, palitos de ajo, tiramisú y bebidas frías.', 
    emoji: '🍕',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    tagColor: 'bg-red-600 text-white',
    btnBg: 'bg-red-600 hover:bg-red-700 text-white'
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
    store.comuna.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (storeId: string) => {
    let clean = storeId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean === 'fruteria' || clean === 'frutería') clean = 'fruteria_principe_gales';
    if (clean === 'turco') clean = 'el_turco';
    if (clean === 'artico' || clean === 'congelados') clean = 'artico_congelados';
    if (clean === 'pasion' || clean === 'pizzas' || clean === 'pasion_pizzas' || clean === 'pasionpizzas') clean = 'pasion-pizzas';
    localStorage.setItem('id_tienda', clean);
    localStorage.setItem('tenant_tienda_id', clean);
    onSelectStore(clean);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = manualCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) {
      setError('Por favor, ingresa un código de almacén válido.');
      return;
    }
    handleSelect(cleanCode);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 sm:px-6 relative font-sans">
      {/* Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Marketplace Hub Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-8 shadow-xl border-2 border-slate-800 space-y-4">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-black uppercase px-3.5 py-1.5 rounded-full tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300 stroke-amber-400" />
                <span>Marketplace Hub Digital</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Elige tu Comercio o Tienda Favorita
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Selecciona entre nuestra red de locales asociados. Compra frutas frescas, congelados, carnes y abarrotes con catálogo digital y despacho programado a tu comuna.
              </p>
            </div>

            {/* Quick Actions / Scanner */}
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/40 border border-emerald-400/30"
              >
                <QrCode className="w-4 h-4 stroke-[2.5]" />
                <span>Escanear QR de Tienda</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                <Keyboard className="w-4 h-4 text-slate-400" />
                <span>Ingreso por Código</span>
              </button>
            </div>
          </div>

          {/* Form manual code */}
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="relative z-10 bg-slate-900/90 border border-slate-700 p-4 rounded-2xl space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                Ingresa el Código Directo del Local
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: fruteria_principe_gales, el_turco, artico_congelados"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setError('');
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            </form>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-950 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* Comuna & Search Bar */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            
            {/* Comuna selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tu Comuna de Despacho</span>
              </label>
              <select
                value={selectedClientComuna}
                onChange={(e) => handleComunaChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {RM_COMUNAS.map((c) => (
                  <option key={c} value={c}>
                    {c} (Región Metropolitana)
                  </option>
                ))}
              </select>
            </div>

            {/* Store search input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filtrar Tiendas o Rubros</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, rubro o comuna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

          </div>
        </div>

        {/* Store Master Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>Tiendas Disponibles ({filteredStores.length})</span>
            </h2>
            <span className="text-xs font-extrabold text-slate-500">
              Despacho activo en <span className="text-indigo-600 font-black">{selectedClientComuna}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white border-2 border-slate-200 hover:border-indigo-500/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Store Cover Banner */}
                <div className="relative h-40 overflow-hidden bg-slate-900">
                  <img
                    src={store.bannerUrl}
                    alt={store.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-[0.6] group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`${store.tagColor} text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider`}>
                      {store.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-black">
                    <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {store.comuna}
                    </span>
                    <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black">
                      Abierto 🟢
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-3">
                      {store.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Delivery programado</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelect(store.id)}
                      className={`${store.btnBg} px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0`}
                    >
                      <span>Ver Catálogo</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-800">No se encontraron locales para tu búsqueda</p>
              <p className="text-xs text-slate-500">Intenta buscar con otra palabra clave o limpia los filtros.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Limpiar Filtro
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Camera Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBarcodeDetected={(code) => {
            setIsScannerOpen(false);
            if (code) {
              handleSelect(code);
            }
          }}
        />
      )}
    </div>
  );
}
