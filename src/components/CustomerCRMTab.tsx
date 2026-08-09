import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Phone, MapPin, DollarSign, CreditCard, 
  Send, History, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, X, Edit3, Trash2
} from 'lucide-react';
import { CustomerProfile, CustomerCreditEntry, BusinessConfig, Transaction } from '../types';

interface CustomerCRMTabProps {
  config: BusinessConfig;
  transactions?: Transaction[];
  tenantId?: string | null;
}

const DEFAULT_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    name: 'Don Héctor Silva',
    phone: '+56991234567',
    address: 'Av. Príncipe de Gales 6200, La Reina',
    comuna: 'La Reina',
    deliveryRing: 'Sector Oriente',
    creditLimit: 50000,
    currentDebt: 18500,
    notes: 'Cliente preferencial hace 5 años. Paga los días 5 de cada mes.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    orderCount: 14,
    totalSpent: 182400,
    ledger: [
      {
        id: 'led-1',
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        type: 'cargo',
        amount: 25000,
        description: 'Compra en mesón - Abarrotes y Lácteos'
      },
      {
        id: 'led-2',
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        type: 'abono',
        amount: 6500,
        description: 'Abono en efectivo'
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Sra. Marta Sepúlveda',
    phone: '+56987654321',
    address: 'Calle Los Álamos 450, Peñalolén',
    comuna: 'Peñalolén',
    deliveryRing: 'Sector Cordillera',
    creditLimit: 30000,
    currentDebt: 0,
    notes: 'Paga puntual al recibir pedidos de Frutería y Almuerzos.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    orderCount: 8,
    totalSpent: 94000,
    ledger: []
  },
  {
    id: 'cust-3',
    name: 'Juan Carlos Díaz',
    phone: '+56976543210',
    address: 'Av. Tobalaba 1250, Providencia',
    comuna: 'Providencia',
    deliveryRing: 'Sector Centro',
    creditLimit: 60000,
    currentDebt: 32000,
    notes: 'Fiado habilitado para despachos a domicilio.',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    orderCount: 19,
    totalSpent: 265000,
    ledger: [
      {
        id: 'led-3',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        type: 'cargo',
        amount: 32000,
        description: 'Pedido Delivery #TX-882'
      }
    ]
  }
];

const PIZZA_DEFAULT_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-piz-1',
    name: 'Sebastián Valenzuela',
    phone: '+56998877665',
    address: 'Av. Providencia 2100, Depto 402',
    comuna: 'Providencia',
    deliveryRing: 'Sector Central / Providencia',
    creditLimit: 50000,
    currentDebt: 21980,
    notes: 'Cliente frecuente de Pizzas Tradicionales y Promos 2x Familiar los fines de semana.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    orderCount: 12,
    totalSpent: 165000,
    ledger: [
      {
        id: 'led-p1',
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        type: 'cargo',
        amount: 21980,
        description: 'Pedido Delivery #PZ-771 (2 Familiar Pepperoni + Bebida)'
      }
    ]
  },
  {
    id: 'cust-piz-2',
    name: 'Carolina Morales',
    phone: '+56987651234',
    address: 'Av. Los Leones 1540, Providencia',
    comuna: 'Providencia',
    deliveryRing: 'Sector Central / Providencia',
    creditLimit: 40000,
    currentDebt: 0,
    notes: 'Pide pizzas vegetarianas y palitos de ajo. Paga con transferencia al recibir.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    orderCount: 9,
    totalSpent: 112000,
    ledger: []
  },
  {
    id: 'cust-piz-3',
    name: 'Empresa Creativa SpA (Rodrigo)',
    phone: '+56976549988',
    address: 'Av. Andrés Bello 2777, Torre Costanera',
    comuna: 'Providencia',
    deliveryRing: 'Sector Central / Providencia',
    creditLimit: 120000,
    currentDebt: 45960,
    notes: 'Cuenta corriente corporativa para eventos de oficina los días viernes.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    orderCount: 22,
    totalSpent: 380000,
    ledger: [
      {
        id: 'led-p2',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        type: 'cargo',
        amount: 45960,
        description: 'Pedido Oficina (4 Pizzas Familiares + 4 Bebidas)'
      }
    ]
  }
];

const FRUTERIA_DEFAULT_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-frut-1',
    name: 'Don Héctor Silva',
    phone: '+56991234567',
    address: 'Av. Príncipe de Gales 6200, La Reina',
    comuna: 'La Reina',
    deliveryRing: 'Sector Oriente / La Reina',
    creditLimit: 50000,
    currentDebt: 16500,
    notes: 'Cliente preferencial de frutas de estación y frutos secos. Paga los días 5 de cada mes.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    orderCount: 18,
    totalSpent: 215400,
    ledger: [
      {
        id: 'led-f1',
        date: new Date(Date.now() - 6 * 86400000).toISOString(),
        type: 'cargo',
        amount: 23500,
        description: 'Compra en mesón: Manzanas, Paltas Hass y Miel de Ulmo'
      },
      {
        id: 'led-f2',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        type: 'abono',
        amount: 7000,
        description: 'Abono en efectivo en caja'
      }
    ]
  },
  {
    id: 'cust-frut-2',
    name: 'Sra. Carmen Gloria Vial',
    phone: '+56987654321',
    address: 'Av. Ossa 1120, Ñuñoa',
    comuna: 'Ñuñoa',
    deliveryRing: 'Sector Oriente / Ñuñoa',
    creditLimit: 40000,
    currentDebt: 0,
    notes: 'Pide verduras para la semana y huevos de campo. Pago puntual vía transferencia.',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    orderCount: 12,
    totalSpent: 148000,
    ledger: []
  },
  {
    id: 'cust-frut-3',
    name: 'Familia Larraín (Sofía)',
    phone: '+56976543210',
    address: 'Av. Francisco Bilbao 4500, Providencia',
    comuna: 'Providencia',
    deliveryRing: 'Sector Central / Providencia',
    creditLimit: 60000,
    currentDebt: 28900,
    notes: 'Fiado habilitado para despachos semanales de frutas, verduras y frutos secos.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    orderCount: 20,
    totalSpent: 285000,
    ledger: [
      {
        id: 'led-f3',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        type: 'cargo',
        amount: 28900,
        description: 'Despacho Semanal Frutas y Hortalizas #FR-904'
      }
    ]
  }
];

export default function CustomerCRMTab({ config, transactions = [], tenantId }: CustomerCRMTabProps) {
  const isPizzaTenant = tenantId?.toLowerCase() === 'pasion-pizzas' ||
                        tenantId?.toLowerCase() === 'pasion_pizzas' ||
                        tenantId?.toLowerCase() === 'pasion' ||
                        tenantId?.toLowerCase() === 'pizzas' ||
                        tenantId?.toLowerCase() === 'pasionpizzas';

  const isFruteriaTenant = tenantId?.toLowerCase() === 'fruteria_principe_gales' ||
                           tenantId?.toLowerCase() === 'fruteria-principe' ||
                           tenantId?.toLowerCase() === 'fruteria_principe' ||
                           tenantId?.toLowerCase() === 'principe-gales' ||
                           tenantId?.toLowerCase() === 'principe_gales' ||
                           tenantId?.toLowerCase() === 'fruteria' ||
                           tenantId?.toLowerCase() === 'frutería' ||
                           tenantId?.toLowerCase() === 'fruteriaprincipegales' ||
                           tenantId?.toLowerCase() === 'principe';

  const initialDefaults = isPizzaTenant ? PIZZA_DEFAULT_CUSTOMERS : isFruteriaTenant ? FRUTERIA_DEFAULT_CUSTOMERS : DEFAULT_CUSTOMERS;
  const canonicalTenant = isFruteriaTenant ? 'fruteria_principe_gales' : isPizzaTenant ? 'pasion-pizzas' : (tenantId || 'default');
  const storageKey = `crm_customers_${canonicalTenant}`;

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialDefaults;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Modal State for Add / Edit Customer
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    comuna: 'La Reina',
    deliveryRing: 'Sector Oriente',
    creditLimit: 40000,
    notes: ''
  });

  // Modal State for Ledger Operation (Cargo / Abono)
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerType, setLedgerType] = useState<'cargo' | 'abono'>('abono');
  const [ledgerAmount, setLedgerAmount] = useState<number>(0);
  const [ledgerDesc, setLedgerDesc] = useState('');

  // Persist customers
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(customers));
    } catch {}
  }, [customers, storageKey]);

  // Keep selectedCustomer updated with latest state
  useEffect(() => {
    if (selectedCustomer) {
      const fresh = customers.find((c) => c.id === selectedCustomer.id);
      if (fresh) setSelectedCustomer(fresh);
    }
  }, [customers]);

  // Total metrics
  const totalDebt = customers.reduce((acc, c) => acc + (c.currentDebt || 0), 0);
  const totalCustomers = customers.length;
  const customersWithDebt = customers.filter((c) => (c.currentDebt || 0) > 0);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      address: '',
      comuna: 'La Reina',
      deliveryRing: 'Sector Oriente',
      creditLimit: 40000,
      notes: ''
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEdit = (cust: CustomerProfile) => {
    setEditingCustomer(cust);
    setCustomerForm({
      name: cust.name,
      phone: cust.phone,
      address: cust.address,
      comuna: cust.comuna || 'La Reina',
      deliveryRing: cust.deliveryRing || 'Sector Oriente',
      creditLimit: cust.creditLimit || 40000,
      notes: cust.notes || ''
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? { ...c, ...customerForm }
            : c
        )
      );
    } else {
      const newCust: CustomerProfile = {
        id: `cust-${Date.now()}`,
        ...customerForm,
        currentDebt: 0,
        orderCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        ledger: []
      };
      setCustomers((prev) => [newCust, ...prev]);
    }
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('¿Estás seguro de eliminar el perfil de este cliente?')) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    }
  };

  // Ledger operations
  const handleOpenLedger = (type: 'cargo' | 'abono') => {
    setLedgerType(type);
    setLedgerAmount(0);
    setLedgerDesc(type === 'abono' ? 'Pago / Abono de saldo en efectivo' : 'Venta fiada autorizada');
    setIsLedgerModalOpen(true);
  };

  const handleSaveLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || ledgerAmount <= 0) return;

    const entry: CustomerCreditEntry = {
      id: `led-${Date.now()}`,
      date: new Date().toISOString(),
      type: ledgerType,
      amount: ledgerAmount,
      description: ledgerDesc
    };

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === selectedCustomer.id) {
          const newDebt = ledgerType === 'cargo'
            ? (c.currentDebt || 0) + ledgerAmount
            : Math.max(0, (c.currentDebt || 0) - ledgerAmount);
          return {
            ...c,
            currentDebt: newDebt,
            ledger: [entry, ...(c.ledger || [])]
          };
        }
        return c;
      })
    );

    setIsLedgerModalOpen(false);
  };

  // Send WhatsApp Account Statement
  const handleSendStatementWhatsApp = (cust: CustomerProfile) => {
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    let message = `*👥 ESTADO DE CUENTA CORRIENTE (FIADO) - ${config?.name || 'DONDE EL TURCO'}*\n`;
    message += `*Cliente:* ${cust.name}\n`;
    message += `*Fecha de Emisión:* ${new Date().toLocaleDateString('es-CL')}\n`;
    message += `------------------------------------\n`;
    message += `*SALDO DEUDOR ACTUAL:* *$${cust.currentDebt.toLocaleString('es-CL')} CLP*\n`;
    message += `*Límite de Crédito Autorizado:* $${cust.creditLimit.toLocaleString('es-CL')} CLP\n`;
    message += `------------------------------------\n`;
    message += `*ÚLTIMOS MOVIMIENTOS:*\n`;

    if (cust.ledger && cust.ledger.length > 0) {
      cust.ledger.slice(0, 5).forEach((item) => {
        const d = new Date(item.date).toLocaleDateString('es-CL');
        const sign = item.type === 'cargo' ? '🔴 (+)' : '🟢 (-)';
        message += `${sign} ${d}: $${item.amount.toLocaleString('es-CL')} (${item.description})\n`;
      });
    } else {
      message += `Sin movimientos recientes registrados.\n`;
    }

    message += `\nPuedes regularizar tu saldo en efectivo, transferencia o contra entrega. ¡Muchas gracias por tu preferencia!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.comuna && c.comuna.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-3xl border-2 border-slate-800 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h2 className="text-xl font-black tracking-tight">Clientes / CRM & Fiado Local</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Directorio de clientes, cuentas corrientes por cobrar (sistema de fiado) e historial de compras.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">
            Total Deuda por Cobrar (Fiados)
          </span>
          <h3 className="text-2xl font-black text-rose-950 font-mono">
            ${totalDebt.toLocaleString('es-CL')} CLP
          </h3>
          <p className="text-[11px] text-rose-700 font-bold">
            {customersWithDebt.length} clientes con saldo pendiente
          </p>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
            Clientes Registrados
          </span>
          <h3 className="text-2xl font-black text-emerald-950 font-mono">
            {totalCustomers}
          </h3>
          <p className="text-[11px] text-emerald-700 font-bold">Base de clientes fidelizados</p>
        </div>

        <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">
            Crédito Total Habilitado
          </span>
          <h3 className="text-2xl font-black text-indigo-950 font-mono">
            ${customers.reduce((a, b) => a + (b.creditLimit || 0), 0).toLocaleString('es-CL')} CLP
          </h3>
          <p className="text-[11px] text-indigo-700 font-bold">Límite global disponible</p>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente por nombre, teléfono o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              const hasDebt = (cust.currentDebt || 0) > 0;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{cust.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust.phone}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">
                        Deuda Fiado:
                      </span>
                      <span
                        className={`text-sm font-mono font-black ${
                          hasDebt ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        ${cust.currentDebt.toLocaleString('es-CL')} CLP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[200px] font-medium">📍 {cust.address}</span>
                    <span className="font-bold text-slate-700">
                      Límite: ${cust.creditLimit.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredCustomers.length === 0 && (
              <div className="py-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-bold">No se encontraron clientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Details & Fiado Ledger */}
        <div className="lg:col-span-6">
          {selectedCustomer ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Profile Card Header */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Perfil de Cliente CRM
                  </span>
                  <h3 className="text-lg font-black text-slate-950 mt-1">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500 font-bold">📍 {selectedCustomer.address} ({selectedCustomer.comuna})</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(selectedCustomer)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Editar cliente"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Debt & Credit Status Block */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Deuda Actual (Fiado)</span>
                    <h4 className="text-2xl font-black font-mono text-rose-400">
                      ${selectedCustomer.currentDebt.toLocaleString('es-CL')} CLP
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400">Límite Autorizado</span>
                    <p className="text-base font-black font-mono text-emerald-400">
                      ${selectedCustomer.creditLimit.toLocaleString('es-CL')} CLP
                    </p>
                  </div>
                </div>

                {/* Progress bar of credit used */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedCustomer.currentDebt > selectedCustomer.creditLimit
                          ? 'bg-rose-500'
                          : selectedCustomer.currentDebt > selectedCustomer.creditLimit * 0.7
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (selectedCustomer.currentDebt / (selectedCustomer.creditLimit || 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Disponible: ${(Math.max(0, selectedCustomer.creditLimit - selectedCustomer.currentDebt)).toLocaleString('es-CL')}</span>
                    <span>{((selectedCustomer.currentDebt / (selectedCustomer.creditLimit || 1)) * 100).toFixed(0)}% Utilizado</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Ledger */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOpenLedger('abono')}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Abonar Pago</span>
                </button>

                <button
                  onClick={() => handleOpenLedger('cargo')}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Cargar Fiado</span>
                </button>

                <button
                  onClick={() => handleSendStatementWhatsApp(selectedCustomer)}
                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Wsp</span>
                </button>
              </div>

              {/* Ledger History */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Historial de Movimientos de Cuenta ({selectedCustomer.ledger?.length || 0})</span>
                </h4>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {selectedCustomer.ledger && selectedCustomer.ledger.length > 0 ? (
                    selectedCustomer.ledger.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-slate-150 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{item.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.date).toLocaleString('es-CL')}
                          </span>
                        </div>

                        <span
                          className={`font-mono font-black ${
                            item.type === 'cargo' ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {item.type === 'cargo' ? '+' : '-'}${item.amount.toLocaleString('es-CL')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      No hay registros de cargos o abonos aún.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center text-slate-400 space-y-2 p-6">
              <Users className="w-12 h-12 text-slate-300 stroke-1" />
              <h4 className="font-black text-sm text-slate-700 uppercase">Selecciona un cliente</h4>
              <p className="text-xs max-w-xs">
                Selecciona un cliente de la lista para ver su cuenta corriente, registrar abonos o enviar su estado de cuenta por WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT CUSTOMER */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border-2 border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente CRM'}</span>
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Don Héctor Silva"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +56991234567"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Límite Crédito Fiado ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={customerForm.creditLimit}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Príncipe de Gales 6200"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Comuna</label>
                  <input
                    type="text"
                    placeholder="Ej. La Reina"
                    value={customerForm.comuna}
                    onChange={(e) => setCustomerForm({ ...customerForm, comuna: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Sector / Anillo</label>
                  <input
                    type="text"
                    placeholder="Ej. Sector Oriente"
                    value={customerForm.deliveryRing}
                    onChange={(e) => setCustomerForm({ ...customerForm, deliveryRing: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Notas / Preferencias</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Cliente confiable, paga los 5 de cada mes..."
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR CARGO O ABONO (LEDGER) */}
      {isLedgerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border-2 border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {ledgerType === 'abono' ? '🟢 Registrar Abono / Pago' : '🔴 Registrar Cargo de Fiado'}
              </h3>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLedger} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <p className="text-slate-500 font-bold">Cliente:</p>
                <p className="font-black text-slate-900 text-sm">{selectedCustomer.name}</p>
                <p className="text-[11px] text-slate-600">Deuda actual: <span className="font-mono font-bold text-rose-600">${selectedCustomer.currentDebt.toLocaleString('es-CL')}</span></p>
              </div>

              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Monto ($ CLP) *</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  placeholder="Ej. 10000"
                  value={ledgerAmount || ''}
                  onChange={(e) => setLedgerAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 font-mono font-black text-base text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Descripción / Comprobante</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Abono en efectivo / Pago transferencia"
                  value={ledgerDesc}
                  onChange={(e) => setLedgerDesc(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 text-white font-black rounded-xl shadow-md ${
                    ledgerType === 'abono'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {ledgerType === 'abono' ? 'Guardar Abono' : 'Guardar Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
