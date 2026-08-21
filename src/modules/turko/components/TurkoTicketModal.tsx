import React from 'react';
import { Printer, Download, CheckCircle, X, MessageSquare } from 'lucide-react';
import { TurkoTransaction } from '../types';
import { BusinessConfig } from '../../../types';
import { downloadTurkoReceiptPDF, generateTurkoWhatsAppMessage } from '../utils';

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

  const handleSendWhatsApp = () => {
    const rawMsg = generateTurkoWhatsAppMessage(transaction, config);
    const cleanPhone = (config.whatsapp || '+56912345678').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMsg)}`;
    window.open(waUrl, '_blank');
  };

  const platformFee = transaction.platformFee !== undefined
    ? transaction.platformFee
    : Math.round(transaction.subtotal * 0.10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar ticket"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 font-sans">
            ¡Comprobante de Venta Digital!
          </h3>
          <p className="text-xs text-slate-500 font-sans font-medium">
            Minimarket Virtual "Donde El Turko" • Folio: #{transaction.id.replace('tx-', '').replace('TURKO-', '').slice(-8).toUpperCase()}
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
            {transaction.trackingUrl && (
              <p className="text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 rounded-md py-1 px-2 mt-1">
                🚀 Tracking Delivery: <a href={transaction.trackingUrl} target="_blank" rel="noreferrer" className="underline hover:text-indigo-900 break-all">{transaction.trackingUrl}</a>
              </p>
            )}
          </div>

          {/* Items Detail */}
          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-wider pb-1 border-b border-slate-200">
              <span>Cant. / Detalle</span>
              <span>Subtotal</span>
            </div>
            {transaction.items.map((item, idx) => {
              const qty = item.quantity ?? item.qty ?? 1;
              return (
                <div key={idx} className="flex justify-between items-center text-slate-800">
                  <span className="font-medium">
                    {qty}x {item.name}
                  </span>
                  <span className="font-mono font-bold">${Math.round(item.price * qty).toLocaleString('es-CL')}</span>
                </div>
              );
            })}
          </div>

          {/* Cost Breakdown */}
          <div className="border-t border-dashed border-slate-200 pt-2 space-y-1 text-xs text-slate-700 font-sans">
            <div className="flex justify-between">
              <span>Subtotal Artículos:</span>
              <span className="font-mono font-bold">${Math.round(transaction.subtotal).toLocaleString('es-CL')} CLP</span>
            </div>
            {transaction.discountAmount ? (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Descuento Cupón:</span>
                <span className="font-mono">-${Math.round(transaction.discountAmount).toLocaleString('es-CL')} CLP</span>
              </div>
            ) : null}
            {transaction.shippingMethod === 'Domicilio' && transaction.deliveryFee ? (
              <div className="flex justify-between">
                <span>Costo de Envío:</span>
                <span className="font-mono font-bold">${Math.round(transaction.deliveryFee).toLocaleString('es-CL')} CLP</span>
              </div>
            ) : null}

            {/* Platform Service Fee Line */}
            <div className="flex justify-between font-sans font-bold text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200 my-1">
              <span>TARIFA DE USO DE PLATAFORMA (10%):</span>
              <span className="font-mono font-black">${Math.round(platformFee).toLocaleString('es-CL')} CLP</span>
            </div>

            {/* IVA Informativo */}
            <div className="flex justify-between text-slate-500 text-[11px] font-medium pt-0.5">
              <span>IVA 19% Incluido en precios:</span>
              <span className="font-mono font-bold text-slate-700">${Math.round(transaction.tax).toLocaleString('es-CL')} CLP</span>
            </div>

            <div className="flex justify-between pt-1.5 border-t border-slate-200 font-black text-sm text-slate-950 items-baseline">
              <span>TOTAL PAGADO:</span>
              <span className="font-mono font-black text-emerald-600 text-lg">${Math.round(transaction.total).toLocaleString('es-CL')} CLP</span>
            </div>
          </div>
        </div>

        {/* Primary Action: Send WhatsApp Confirmation */}
        <button
          onClick={handleSendWhatsApp}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all font-sans cursor-pointer active:scale-98"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>📲 Enviar Confirmación por WhatsApp</span>
        </button>

        {/* Secondary Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => downloadTurkoReceiptPDF(transaction, config)}
            className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all font-sans cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all font-sans cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};
