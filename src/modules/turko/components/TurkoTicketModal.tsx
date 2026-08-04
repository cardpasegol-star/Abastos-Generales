import React from 'react';
import { Printer, Download, CheckCircle, X } from 'lucide-react';
import { TurkoTransaction } from '../types';
import { BusinessConfig } from '../../../types';
import { downloadTurkoReceiptPDF } from '../utils';

interface TurkoTicketModalProps {
  transaction: TurkoTransaction;
  config: BusinessConfig;
  onClose: () => void;
}

export const TurkoTicketModal: React.FC<TurkoTicketModalProps> = ({
  transaction,
  config,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const platformFee = transaction.platformFee !== undefined
    ? transaction.platformFee
    : (transaction.subtotal * 0.10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          title="Cerrar ticket"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 font-sans">
            ¡Comprobante de Venta Digital!
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Minimarket Virtual "Donde El Turko" • Folio: #{transaction.id.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Ticket Container */}
        <div id="ticket-turko-print" className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
          <div className="text-center border-b border-dashed border-slate-200 pb-2 space-y-0.5">
            <p className="font-black text-sm text-slate-900">{config.name || 'Minimarket Donde El Turko'}</p>
            {config.rut && <p className="text-[11px] text-slate-500 font-mono">RUT: {config.rut}</p>}
            <p className="text-[11px] text-slate-500">{new Date(transaction.createdAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
            {transaction.customerName && (
              <p className="text-[11px] font-bold text-slate-800 pt-1">
                👤 {transaction.customerName} {transaction.customerPhone ? `(${transaction.customerPhone})` : ''}
              </p>
            )}
            {transaction.shippingMethod === 'Domicilio' && (transaction.deliveryAddress || transaction.deliveryComuna) && (
              <p className="text-[11px] text-slate-700 font-semibold">
                📍 {transaction.deliveryAddress} {transaction.deliveryComuna ? `, ${transaction.deliveryComuna}` : ''}
              </p>
            )}
          </div>

          {/* Items Detail */}
          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-wider pb-1 border-b border-slate-200">
              <span>Cant. / Detalle</span>
              <span>Subtotal</span>
            </div>
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-800">
                <span className="font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="border-t border-dashed border-slate-200 pt-2 space-y-1 text-xs text-slate-700 font-sans">
            <div className="flex justify-between">
              <span>Subtotal Artículos:</span>
              <span className="font-mono">${transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({config.ivaPercentage || 15}%):</span>
              <span className="font-mono">${transaction.tax.toFixed(2)}</span>
            </div>
            {transaction.shippingMethod === 'Domicilio' && transaction.deliveryFee ? (
              <div className="flex justify-between">
                <span>Envío (Delivery):</span>
                <span className="font-mono">${transaction.deliveryFee.toFixed(2)}</span>
              </div>
            ) : null}

            {/* Platform Service Fee Line */}
            <div className="flex justify-between font-sans font-bold text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200 my-1">
              <span>TARIFA DE USO DE PLATAFORMA (10%):</span>
              <span className="font-mono">${platformFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between pt-1 border-t border-slate-200 font-black text-sm text-slate-950 items-baseline">
              <span>TOTAL A PAGAR:</span>
              <span className="font-mono font-black text-emerald-600 text-lg">${transaction.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => downloadTurkoReceiptPDF(transaction, config)}
            className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all font-sans"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all font-sans"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};
