import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Empleado } from '../types';
import { KeyRound, User, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface InicioTurnoProps {
  onLoginSuccess: (emp: Empleado) => void;
  tenantId?: string;
}

export default function InicioTurno({ onLoginSuccess, tenantId }: InicioTurnoProps) {
  const [employees, setEmployees] = useState<Empleado[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch employees list from tenant or global config/business_info/empleados subcollection
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true);
        const ref = tenantId
          ? collection(db, 'tenants', tenantId, 'config', 'business_info', 'empleados')
          : collection(db, 'config', 'business_info', 'empleados');
        const snap = await getDocs(ref);
        const list: Empleado[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Empleado);
        });
        setEmployees(list);
        if (list.length > 0) {
          setSelectedEmpId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Error al cargar la lista de empleados.');
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('El PIN debe tener exactamente 4 dígitos.');
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === selectedEmpId);
    if (!selectedEmp) {
      setError('Por favor selecciona un empleado.');
      return;
    }

    setSubmitting(true);
    try {
      // Validate PIN
      if (selectedEmp.pin === pin) {
        onLoginSuccess(selectedEmp);
      } else {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ocurrió un error al validar las credenciales.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-bold text-xs">Cargando personal de turno...</p>
      </div>
    );
  }

  const selectedEmp = employees.find(emp => emp.id === selectedEmpId);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden p-6 mt-4">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-emerald-550/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-550/20">
          <KeyRound className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">Inicio de Turno</h2>
        <p className="text-xs font-semibold text-slate-500">Selecciona tu usuario e ingresa tu PIN de 4 dígitos</p>
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border-2 border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-650 uppercase tracking-wider block">Empleado</label>
          <div className="relative">
            <select
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                setPin('');
                setError('');
              }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-slate-950 font-black focus:outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role === 'admin' ? 'Administrador' : 'Cajero'})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-600">
              <ChevronRight className="w-5 h-5 rotate-90" />
            </div>
          </div>
        </div>

        {/* PIN Dots display */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-slate-650 uppercase tracking-wider block text-center">PIN de 4 dígitos</label>
          <div className="flex justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                  pin.length > index
                    ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-sm shadow-emerald-600/30'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Physical input handler */}
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            setPin(val);
            if (val.length === 4) {
              // Submit immediately when 4 digits are typed manually on standard keyboard
              setTimeout(() => {
                handleSubmit();
              }, 100);
            }
          }}
          className="sr-only"
          autoFocus
        />

        {/* Custom Touch Screen keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 text-xl font-extrabold text-slate-800 rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center select-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-extrabold text-slate-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center select-none"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 text-xl font-extrabold text-slate-800 rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center select-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-extrabold text-slate-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center select-none"
          >
            Borr.
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={pin.length !== 4 || submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none h-14 uppercase tracking-wider text-sm shadow-md flex items-center justify-center gap-2"
        >
          {submitting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Iniciar Turno</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
