import React, { useRef } from 'react';
import { MapPin, Store, Camera } from 'lucide-react';
import { BusinessConfig } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface HeaderProps {
  config: BusinessConfig;
}

export default function Header({ config }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMapClick = () => {
    if (config.gps) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(config.gps)}`, '_blank');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await updateDoc(doc(db, 'config', 'business_info'), {
          bannerUrl: base64
        });
      } catch (err) {
        console.error('Error guardando banner:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="bg-white border-b border-slate-100 w-full sticky top-0 z-40 shadow-sm">
      {/* Banner foto del negocio */}
      <div className="relative w-full h-40 overflow-hidden bg-indigo-900">
        {config.bannerUrl ? (
          <img
            src={config.bannerUrl}
            alt={config.name}
            className="w-full h-full object-cover opacity-90"
          />
        ) : config.logoUrl ? (
          <img
            src={config.logoUrl}
            alt={config.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700">
            <Store className="w-20 h-20 text-white/30" />
          </div>
        )}

        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Botón cámara para cambiar banner */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Cambiar foto</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />

        {/* Info del negocio sobre la imagen */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-white text-xl font-extrabold tracking-tight drop-shadow-lg">
              {config.name || 'Donde el Goyo'}
            </h1>
            {config.gps && (
              <button
                onClick={handleMapClick}
                className="flex items-center gap-1 mt-1 text-white/90 hover:text-white transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span className="text-xs font-semibold truncate max-w-[200px]">{config.gps}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span>En línea</span>
          </div>
        </div>
      </div>
    </header>
  );
}
