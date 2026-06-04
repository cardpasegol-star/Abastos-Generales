import React, { useState } from 'react';
import { Banknote, CreditCard, Receipt, Milestone, TrendingUp, BarChart3, Clock, CalendarDays, RefreshCw } from 'lucide-react';
import { Transaction } from '../types';

interface ReportesTabProps {
  transactions: Transaction[];
}

type PeriodType = 'Diario' | 'Semanal' | 'Mensual';

export default function ReportesTab({ transactions }: ReportesTabProps) {
  const [period, setPeriod] = useState<PeriodType>('Diario');

  // Filter transactions based on type 'Venta' (or include returns if needed, but Venta represents income)
  const sales = transactions.filter(t => t.type === 'Venta');

  // Base dynamic stats calculations
  const totalSalesSum = sales.reduce((acc, t) => acc + t.total, 0);
  const transactionCount = sales.length;
  const avgTicket = transactionCount > 0 ? totalSalesSum / transactionCount : 0;

  // Comparative percentages (dynamic defaults matching visual references)
  const comparativePercent = '+12.4%';
  const comparativeValue = (totalSalesSum * 0.88).toFixed(2);

  // SVG Custom Bar Chart data generators based on period selection
  const getChartData = () => {
    switch (period) {
      case 'Diario':
        return [
          { label: '08:00', amount: totalSalesSum * 0.12, isCurrent: false },
          { label: '10:00', amount: totalSalesSum * 0.22, isCurrent: false },
          { label: '12:00', amount: totalSalesSum * 0.35, isCurrent: true },
          { label: '14:00', amount: totalSalesSum * 0.18, isCurrent: false },
          { label: '16:00', amount: totalSalesSum * 0.08, isCurrent: false },
          { label: '18:00', amount: totalSalesSum * 0.05, isCurrent: false },
        ];
      case 'Semanal':
        return [
          { label: 'Lun', amount: totalSalesSum * 0.15, isCurrent: false },
          { label: 'Mar', amount: totalSalesSum * 0.12, isCurrent: false },
          { label: 'Mié', amount: totalSalesSum * 0.18, isCurrent: false },
          { label: 'Jue', amount: totalSalesSum * 0.14, isCurrent: false },
          { label: 'Vie', amount: totalSalesSum * 0.28, isCurrent: true },
          { label: 'Sáb', amount: totalSalesSum * 0.13, isCurrent: false },
        ];
      case 'Mensual':
        return [
          { label: 'Sem 1', amount: totalSalesSum * 0.20, isCurrent: false },
          { label: 'Sem 2', amount: totalSalesSum * 0.28, isCurrent: false },
          { label: 'Sem 3', amount: totalSalesSum * 0.38, isCurrent: true },
          { label: 'Sem 4', amount: totalSalesSum * 0.14, isCurrent: false },
        ];
    }
  };

  const chartData = getChartData();
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div id="reportes-container" className="space-y-6 pb-24">
      {/* 1. Period switcher slider tabs */}
      <div className="flex bg-gray-50/50 p-1.5 rounded-2xl border border-gray-150">
        {(['Diario', 'Semanal', 'Mensual'] as PeriodType[]).map((p) => {
          const isSelected = period === p;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all outline-none leading-none select-none ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* 2. Main Stats Bento Card Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total revenue container */}
        <div className="col-span-2 p-5 rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="relative z-10 space-y-1.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Ventas Totales</p>
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-indigo-600 leading-none">
                ${totalSalesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-[11px] bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{comparativePercent}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium pt-1">
              vs. período anterior (${parseInt(comparativeValue).toLocaleString()})
            </p>
          </div>
          {/* Ambient blur circle decor */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-50 rounded-full blur-xl opacity-80"></div>
        </div>

        {/* Dynamic transactions size indicator box */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50 mb-3 shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Transacciones</p>
            <h3 className="text-lg font-extrabold text-gray-900">{transactionCount}</h3>
          </div>
        </div>

        {/* Ticket average estimation box */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50 mb-3 shrink-0">
            <Milestone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ticket Prom.</p>
            <h3 className="text-lg font-extrabold text-gray-900">${avgTicket.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* 3. Custom CSS/SVG Interactive Bar Chart block */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-950">Flujo de Ventas</h3>
          <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 uppercase tracking-wider">
            {period}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
            {chartData.map((data, i) => {
              const pct = (data.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Hover tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-md text-[9px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-md whitespace-nowrap z-15">
                    ${data.amount.toFixed(2)}
                  </div>
                  
                  {/* Rounded bar */}
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                      data.isCurrent 
                        ? 'bg-indigo-600 shadow-sm shadow-indigo-200' 
                        : 'bg-indigo-100 group-hover:bg-indigo-400 group-hover:shadow-sm'
                    }`} 
                    style={{ height: `${Math.max(pct, 12)}%` }}
                  ></div>

                  {/* Label tag */}
                  <span className={`text-[9px] font-bold mt-2 tracking-tight ${
                    data.isCurrent ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-700'
                  }`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Complete Transactions Records Feed list */}
      <section className="space-y-3.5">
        <h3 className="text-sm font-extrabold text-gray-950">Historial de Cobros</h3>
        
        <div className="space-y-2.5">
          {sales.map((tx) => {
            const isCash = tx.method === 'Efectivo';
            const itemsSize = tx.items.reduce((acc, item) => acc + item.qty, 0);

            // Time format
            let timeStr = 'Ayer';
            try {
              const dt = new Date(tx.createdAt);
              timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (err) {}

            return (
              <div 
                key={tx.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-transform active:scale-[0.99]"
              >
                {/* Method icon */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                  isCash 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100/50'
                }`}>
                  {isCash ? <Banknote className="w-5.5 h-5.5" /> : <CreditCard className="w-5.5 h-5.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-gray-900 text-sm tracking-tight truncate">
                      Venta #{tx.id.replace('tx-', '')}
                    </span>
                    <span className="text-sm font-extrabold text-indigo-600 shrink-0">
                      ${tx.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-tight">
                    <span>{timeStr}</span>
                    <span>•</span>
                    <span>{itemsSize} {itemsSize === 1 ? 'item' : 'items'}</span>
                    <span>•</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                      isCash ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {tx.method}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {sales.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
              <RefreshCw className="w-10 h-10 stroke-1 text-gray-300 animate-spin" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Aún no hay transacciones</p>
              <p className="text-xs text-gray-400">Las ventas cobradas en la caja se verán reflejadas aquí.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
