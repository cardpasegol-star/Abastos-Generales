import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertCircle, Sparkles, PhoneCall } from 'lucide-react';
import { BusinessConfig } from '../types';

interface LicenseBlockScreenProps {
  config: BusinessConfig;
  onUnlockMaster: () => void;
}

export default function LicenseBlockScreen({ config, onUnlockMaster }: LicenseBlockScreenProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.trim() === 'Aramis2012') {
      onUnlockMaster();
    } else {
      setErrorMsg('Clave incorrecta');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  return (
    <div id="license-block-screen" className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 font-sans select-none relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

      {/* Top Brand Block */}
      <div className="text-center pt-8 z-10">
        <h1 className="text-xl font-black uppercase tracking-widest text-slate-400">
          {config.name || 'Donde el Goyo'}
        </h1>
        <div className="h-0.5 w-16 bg-rose-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Center lock message */}
      <div className="max-w-xs w-full mx-auto my-auto text-center space-y-6 z-10">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 animate-pulse">
            <Lock className="w-9 h-9 stroke-[1.8]" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">
            !
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-100">Acceso Suspendido</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            Suscripción Mensual Inactiva
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl text-xs font-semibold text-slate-300 leading-relaxed shadow-lg">
          {config.licenseMessage || 'Su acceso ha vencido o se encuentra suspendido. Por favor, regularice su servicio mensual contactando al administrador.'}
        </div>

        {/* Call to action */}
        <div className="flex justify-center">
          <a
            href={`https://wa.me/5491112345678`} // Default developer contact link
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Soporte Técnico</span>
          </a>
        </div>
      </div>

      {/* Bottom area for developer secret unlock */}
      <div className="z-10 w-full max-w-xs mx-auto pb-4">
        {showPasswordInput ? (
          <form onSubmit={handleSubmit} className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Clave de Desarrollador
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordInput(false);
                  setMasterPassword('');
                }}
                className="text-[9px] font-bold text-slate-500 hover:text-slate-300"
              >
                Cancelar
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="password"
                autoFocus
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold tracking-widest outline-none text-white focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs"
              >
                Acceder
              </button>
            </div>
            
            {errorMsg && (
              <p className="text-[9px] text-rose-500 font-extrabold text-center animate-shake">
                {errorMsg}
              </p>
            )}
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowPasswordInput(true)}
              className="text-[10px] font-extrabold text-slate-650 hover:text-indigo-400 transition-colors uppercase tracking-widest cursor-pointer py-1 px-3"
            >
              🔑 Desarrollador Master
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
