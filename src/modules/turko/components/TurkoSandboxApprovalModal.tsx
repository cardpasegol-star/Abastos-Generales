import React from 'react';
import { Check, Lock } from 'lucide-react';
import { TurkoTransaction } from '../types';

interface TurkoSandboxApprovalModalProps {
  transaction: TurkoTransaction;
  onClose: () => void;
  onGenerateReceipt: () => void;
}

export const TurkoSandboxApprovalModal: React.FC<TurkoSandboxApprovalModalProps> = ({
  transaction,
  onClose,
  onGenerateReceipt
}) => {
  const isWebpay = transaction.method === 'Webpay';
  const gatewayTitle = isWebpay ? 'WEBPAY PLUS SANDBOX' : 'MERCADO PAGO SANDBOX';
  const gatewayName = isWebpay ? 'Webpay Plus' : 'Mercado Pago';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] text-white border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-6 relative">
        {/* Header con Candado */}
        <div className="flex items-center justify-center gap-2 text-sky-400">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-black tracking-widest uppercase">
            {gatewayTitle}
          </span>
        </div>

        {/* Ícono de Verificación Verde */}
        <div className="w-20 h-20 rounded-full border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 bg-emerald-950/40 shadow-inner">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>

        {/* Status Pill & Textos */}
        <div className="space-y-3">
          <div>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 text-[10px] font-black tracking-widest px-3.5 py-1 rounded-full uppercase inline-block shadow-xs">
              STATUS: APPROVED
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-emerald-400 tracking-tight font-sans">
            ¡PAGO PROCESADO Y APROBADO!
          </h3>

          <p className="text-slate-300 text-xs leading-relaxed px-2 font-medium">
            Transacción de prueba procesada con éxito vía {gatewayName} (Sandbox).
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onGenerateReceipt}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer border border-emerald-400/30"
          >
            <span>Generar Comprobante 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
