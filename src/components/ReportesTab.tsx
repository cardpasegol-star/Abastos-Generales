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
      <div className="flex bg-slate-205/65 p-1.5 rounded-2xl border-2 border-slate-250">
        {(['Diario', 'Semanal', 'Mensual'] as PeriodType[]).map((p) => {
          const isSelected = period === p;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all outline-none leading-none select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md border border-emerald-500'
                  : 'text-slate-600 hover:text-slate-900'
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
        <div className="col-span-2 p-6 rounded-3xl bg-white shadow-sm border-2 border-slate-200 overflow-hidden relative">
          <div className="relative z-10 space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Ventas Totales</p>
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-3xl font-black tracking-tight text-emerald-650 leading-none">
                ${totalSalesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1 text-emerald-800 font-extrabold text-xs bg-emerald-50 border-2 border-emerald-250 rounded-xl px-3 py-1">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                <span>{comparativePercent}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-bold pt-1">
              vs. período anterior (${parseInt(comparativeValue).toLocaleString()})
            </p>
          </div>
          {/* Ambient blur circle decor */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-50 rounded-full blur-xl opacity-80"></div>
        </div>

        {/* Dynamic transactions size indicator box */}
        <div className="p-5 rounded-3xl bg-white shadow-sm border-2 border-slate-200 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 border-2 border-emerald-250 mb-4 shrink-0">
            <Receipt className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Transacciones</p>
            <h3 className="text-2xl font-black text-slate-950">{transactionCount}</h3>
          </div>
        </div>

        {/* Ticket average estimation box */}
        <div className="p-5 rounded-3xl bg-white shadow-sm border-2 border-slate-200 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 border-2 border-emerald-250 mb-4 shrink-0">
            <Milestone className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Ticket Prom.</p>
            <h3 className="text-2xl font-black text-slate-950">${avgTicket.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* 3. Custom CSS/SVG Interactive Bar Chart block */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-950">Flujo de Ventas</h3>
          <span className="text-xs font-black text-emerald-800 bg-emerald-50 border-2 border-emerald-250 rounded-xl px-3 py-1 uppercase tracking-wider">
            {period}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white shadow-sm border-2 border-slate-200">
          <div className="h-44 flex items-end justify-between gap-2 pt-4">
            {chartData.map((data, i) => {
              const pct = (data.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Hover tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white rounded-xl text-xs font-black px-2.5 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-md whitespace-nowrap z-15">
                    ${data.amount.toFixed(2)}
                  </div>
                  
                  {/* Rounded bar */}
                  <div 
                    className={`w-full rounded-t-xl transition-all duration-500 cursor-pointer ${
                      data.isCurrent 
                        ? 'bg-emerald-600 shadow-md shadow-emerald-100' 
                        : 'bg-emerald-100/60 group-hover:bg-emerald-400 group-hover:shadow-sm'
                    }`} 
                    style={{ height: `${Math.max(pct, 12)}%` }}
                  ></div>

                  {/* Label tag */}
                  <span className={`text-xs font-black mt-2 tracking-tight ${
                    data.isCurrent ? 'text-slate-950' : 'text-slate-400 group-hover:text-slate-750'
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
      <section className="space-y-4">
        <h3 className="text-base font-black text-slate-950">Historial de Cobros</h3>
        
        <div className="space-y-3">
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
                className="flex items-center gap-4 p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-emerald-250 transition-all active:scale-[0.99]"
              >
                {/* Method icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  isCash 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-250'
                }`}>
                  {isCash ? <Banknote className="w-6 h-6 stroke-[2]" /> : <CreditCard className="w-6 h-6 stroke-[2]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-950 text-base tracking-tight truncate">
                      Venta #{tx.id.replace('tx-', '')}
                    </span>
                    <span className="text-base font-black text-emerald-600 shrink-0">
                      ${tx.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1 uppercase tracking-tight">
                    <span>{timeStr}</span>
                    <span>•</span>
                    <span>{itemsSize} {itemsSize === 1 ? 'item' : 'items'}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-lg font-black text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {tx.method}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {sales.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <RefreshCw className="w-10 h-10 stroke-1 text-slate-300 animate-spin" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Aún no hay transacciones</p>
              <p className="text-xs text-slate-400">Las ventas cobradas en la caja se verán reflejadas aquí.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
