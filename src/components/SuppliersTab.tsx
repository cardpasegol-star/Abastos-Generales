import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Search, Edit3, Trash2, Phone, Mail, FileText, 
  AlertTriangle, CheckCircle2, Download, Send, RefreshCw, X, ShoppingCart, DollarSign
} from 'lucide-react';
import { Product, Supplier, PurchaseOrder, BusinessConfig } from '../types';
import { jsPDF } from 'jspdf';

interface SuppliersTabProps {
  products: Product[];
  onEditProduct?: (product: Product) => void;
  config: BusinessConfig;
  tenantId?: string | null;
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    rut: '76.123.456-7',
    name: 'Distribuidora Central Lo Valledor',
    contactPerson: 'Carlos Valenzuela',
    phone: '+56987654321',
    email: 'ventas@lovalledorcentral.cl',
    category: 'Frutas y Verduras',
    address: 'Av. Cerrillos 450, Lo Valledor, Santiago',
    notes: 'Despachos martes y viernes. Pedidos con 24h de anticipación.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-2',
    rut: '78.987.654-3',
    name: 'Distribuidora Mayorista Alimentos del Sur',
    contactPerson: 'Mariana Soto',
    phone: '+56976543210',
    email: 'contacto@alimentosdelsur.cl',
    category: 'Abarrotes y Granos',
    address: 'Camino Melipilla 1200, Maipú',
    notes: 'Descuento 5% por compras sobre $150.000.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-3',
    rut: '81.234.567-8',
    name: 'Lácteos & Refrigerados Cordillera',
    contactPerson: 'Rodrigo Fuentes',
    phone: '+56998761234',
    email: 'pedidos@lacteoscordillera.cl',
    category: 'Lácteos y Refrigerados',
    address: 'Av. El Salto 890, Recoleta',
    notes: 'Cadena de frío certificada.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-4',
    rut: '96.555.444-1',
    name: 'Embotelladora & Bebidas Metropolitanas',
    contactPerson: 'Fernando Gómez',
    phone: '+56965432198',
    email: 'ventas@bebidasmetro.cl',
    category: 'Bebidas y Jugos',
    address: 'Av. Vicuña Mackenna 4500, Macul',
    notes: 'Envases retornables y descartables.',
    createdAt: new Date().toISOString()
  }
];

const PIZZA_DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-piz-1',
    rut: '77.234.567-1',
    name: 'Molinos del Sol & Harinas Especiales SpA',
    contactPerson: 'Gonzalo Arancibia',
    phone: '+56987650011',
    email: 'pedidos@harinasdelsol.cl',
    category: 'Harinas y Masas',
    address: 'Camino a Melipilla 4500, Maipú',
    notes: 'Harina tipo 00 especial para masa madre y fermentación lenta.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-piz-2',
    rut: '78.890.123-4',
    name: 'Quesos del Sur & Mozzarella Artesanal',
    contactPerson: 'Claudia Valenzuela',
    phone: '+56976540022',
    email: 'ventas@mozzarelladelsur.cl',
    category: 'Lácteos y Quesos',
    address: 'Av. El Salto 1200, Recoleta',
    notes: 'Queso Mozzarella hilado fresco en bloque y rallado fino.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-piz-3',
    rut: '81.456.789-0',
    name: 'Cecinas y Embutidos San Jorge Mayorista',
    contactPerson: 'Patricio Muñoz',
    phone: '+56998760033',
    email: 'contacto@cecinasanjorge.cl',
    category: 'Carnes y Cecinas',
    address: 'Av. La Florida 8900, La Florida',
    notes: 'Pepperoni americano premium, jamón artesanal y tocino laminado.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-piz-4',
    rut: '96.111.222-3',
    name: 'Distribuidora Tomates San Marzano & Salsas',
    contactPerson: 'Matías Rivas',
    phone: '+56965430044',
    email: 'pedidos@salsassanmarzano.cl',
    category: 'Salsas y Conservas',
    address: 'Lo Valledor Central, Galpón 4',
    notes: 'Pulpa de tomate triturada italiana sin acidez añadida.',
    createdAt: new Date().toISOString()
  }
];

const FRUTERIA_DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-frut-1',
    rut: '77.890.111-2',
    name: 'Lo Valledor Central - Mayorista Frutas & Cítricos',
    contactPerson: 'Don Hernán Valenzuela',
    phone: '+56988223344',
    email: 'pedidos@lovalledorfrutas.cl',
    category: 'Frutas Frescas',
    address: 'Patio Mayorista Frutas N° 12, Lo Valledor, Pedro Aguirre Cerda',
    notes: 'Proveedor principal de manzanas Royal Gala, plátanos Cavendish y limones sutiles.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-frut-2',
    rut: '79.234.567-8',
    name: 'Agrícola Valle de Quillota (Paltas & Hortalizas)',
    contactPerson: 'Marcela Soto',
    phone: '+56977445566',
    email: 'ventas@agricolaquillota.cl',
    category: 'Verduras y Hortalizas',
    address: 'Camino Troncal 450, Quillota / Despacho directo a bodega',
    notes: 'Palta Hass Grado 1, tomates Larga Vida y lechugas hidropónicas.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-frut-3',
    rut: '82.901.234-5',
    name: 'Cooperativa Apícola & Frutos Secos del Sur',
    contactPerson: 'Esteban Morales',
    phone: '+56966554433',
    email: 'contacto@apicoladelsur.cl',
    category: 'Frutos Secos y Miel',
    address: 'Ruta 5 Sur Km 240, Talca',
    notes: 'Miel pura de Ulmo nativa 1kg, nueces mariposa y almendras tostadas.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sup-frut-4',
    rut: '85.678.901-2',
    name: 'Huevos de Campo La Granja Feliz',
    contactPerson: 'Ignacio Fuentes',
    phone: '+56955332211',
    email: 'despachos@lagranjafeliz.cl',
    category: 'Huevos de Campo',
    address: 'Camino a Melipilla 8900, Padre Hurtado',
    notes: 'Huevos de gallina libre de jaula, bandejas de 12 y 30 unidades.',
    createdAt: new Date().toISOString()
  }
];

export default function SuppliersTab({ products, onEditProduct, config, tenantId }: SuppliersTabProps) {
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

  const initialDefaults = isPizzaTenant ? PIZZA_DEFAULT_SUPPLIERS : isFruteriaTenant ? FRUTERIA_DEFAULT_SUPPLIERS : DEFAULT_SUPPLIERS;
  const canonicalTenant = isFruteriaTenant ? 'fruteria_principe_gales' : isPizzaTenant ? 'pasion-pizzas' : (tenantId || 'default');
  const storageKey = `suppliers_${canonicalTenant}`;
  const poStorageKey = `purchase_orders_${canonicalTenant}`;

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialDefaults;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(poStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'reorder' | 'history'>('reorder');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for Supplier Form
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    rut: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'Abarrotes y Granos',
    address: '',
    notes: ''
  });

  // Modal State for Purchase Order Generation
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState<Supplier | null>(null);
  const [poItems, setPoItems] = useState<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    orderedQty: number;
    purchaseCost: number;
  }[]>([]);
  const [poNotes, setPoNotes] = useState('');

  // Persist suppliers
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(suppliers));
    } catch {}
  }, [suppliers, storageKey]);

  // Persist purchase orders
  useEffect(() => {
    try {
      localStorage.setItem(poStorageKey, JSON.stringify(purchaseOrders));
    } catch {}
  }, [purchaseOrders, poStorageKey]);

  // Low stock products
  const lowStockProducts = products.filter((p) => (p.stock !== undefined && p.stock <= 5));
  const outOfStockProducts = products.filter((p) => (p.stock === undefined || p.stock <= 0));

  // Supplier Form Handlers
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      rut: '',
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      category: 'Abarrotes y Granos',
      address: '',
      notes: ''
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierForm({
      rut: sup.rut,
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email || '',
      category: sup.category,
      address: sup.address || '',
      notes: sup.notes || ''
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;

    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? { ...s, ...supplierForm }
            : s
        )
      );
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        ...supplierForm,
        createdAt: new Date().toISOString()
      };
      setSuppliers((prev) => [newSup, ...prev]);
    }
    setIsSupplierModalOpen(false);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Generate Automated Purchase Order
  const handleGeneratePO = (supplier?: Supplier) => {
    const targetSup = supplier || suppliers[0];
    setSelectedSupplierForPO(targetSup);

    // Products that need restock
    const candidateProds = lowStockProducts.length > 0 ? lowStockProducts : products.slice(0, 5);
    const items = candidateProds.map((p) => {
      const needed = Math.max(10, 50 - (p.stock || 0));
      const cost = p.cost > 0 ? p.cost : Math.round((p.price || 1000) * 0.65);
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku || p.id.slice(-6),
        currentStock: p.stock || 0,
        orderedQty: needed,
        purchaseCost: cost
      };
    });

    setPoItems(items);
    setPoNotes(`Solicitud de reposición urgente para ${config?.name || 'Donde el Turco'}.`);
    setIsPOModalOpen(true);
  };

  // Calculate PO Total
  const poTotalCost = poItems.reduce((acc, it) => acc + (it.orderedQty * it.purchaseCost), 0);

  // Send PO via WhatsApp
  const handleSendPOWhatsApp = () => {
    if (!selectedSupplierForPO) return;
    const cleanPhone = selectedSupplierForPO.phone.replace(/[^0-9]/g, '');
    
    let message = `*🚚 ORDEN DE COMPRA - ${config?.name || 'DONDE EL TURCO'}*\n`;
    message += `*Proveedor:* ${selectedSupplierForPO.name}\n`;
    message += `*Fecha:* ${new Date().toLocaleDateString('es-CL')}\n`;
    message += `*Contacto:* ${selectedSupplierForPO.contactPerson}\n`;
    message += `------------------------------------\n`;
    message += `*DETALLE DE PRODUCTOS:*\n`;

    poItems.forEach((it, idx) => {
      const sub = it.orderedQty * it.purchaseCost;
      message += `${idx + 1}. *${it.productName}* (SKU: ${it.sku})\n`;
      message += `   Cantidad Solicitada: *${it.orderedQty} un.* (Stock Actual: ${it.currentStock})\n`;
      message += `   Costo Estimado: $${it.purchaseCost.toLocaleString('es-CL')} | Subtotal: $${sub.toLocaleString('es-CL')}\n`;
    });

    message += `------------------------------------\n`;
    message += `*TOTAL ESTIMADO:* $${poTotalCost.toLocaleString('es-CL')} CLP\n`;
    if (poNotes) message += `*Notas:* ${poNotes}\n`;
    message += `\nFavor confirmar disponibilidad y fecha de entrega. ¡Gracias!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Save PO to history
    savePOToHistory('Enviada');
  };

  // Export PO as PDF
  const handleDownloadPO_PDF = () => {
    if (!selectedSupplierForPO) return;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`ORDEN DE COMPRA - ${config?.name || 'DONDE EL TURCO'}`, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Proveedor: ${selectedSupplierForPO.name} (RUT: ${selectedSupplierForPO.rut})`, 14, 34);
    doc.text(`Contacto: ${selectedSupplierForPO.contactPerson} | Tel: ${selectedSupplierForPO.phone}`, 14, 40);
    doc.text(`Dirección: ${selectedSupplierForPO.address || 'N/A'}`, 14, 46);

    doc.line(14, 50, 196, 50);

    // Table Header
    doc.setFont('helvetica', 'bold');
    let y = 58;
    doc.text('SKU', 14, y);
    doc.text('PRODUCTO', 45, y);
    doc.text('CANTIDAD', 125, y);
    doc.text('COSTO NETO', 155, y);
    doc.text('TOTAL', 185, y, { align: 'right' });

    doc.line(14, y + 3, 196, y + 3);
    y += 10;

    doc.setFont('helvetica', 'normal');
    poItems.forEach((it) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(it.sku, 14, y);
      const nameTrunc = it.productName.length > 35 ? it.productName.slice(0, 32) + '...' : it.productName;
      doc.text(nameTrunc, 45, y);
      doc.text(`${it.orderedQty} un.`, 125, y);
      doc.text(`$${it.purchaseCost.toLocaleString('es-CL')}`, 155, y);
      const sub = it.orderedQty * it.purchaseCost;
      doc.text(`$${sub.toLocaleString('es-CL')}`, 185, y, { align: 'right' });
      y += 8;
    });

    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL ORDEN DE COMPRA: $${poTotalCost.toLocaleString('es-CL')} CLP`, 14, y);

    if (poNotes) {
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Instrucciones: ${poNotes}`, 14, y);
    }

    doc.save(`Orden_Compra_${selectedSupplierForPO.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    savePOToHistory('Borrador');
  };

  const savePOToHistory = (status: 'Borrador' | 'Enviada' | 'Recibida') => {
    if (!selectedSupplierForPO) return;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      supplierId: selectedSupplierForPO.id,
      supplierName: selectedSupplierForPO.name,
      supplierPhone: selectedSupplierForPO.phone,
      items: poItems.map((i) => ({
        ...i,
        subtotal: i.orderedQty * i.purchaseCost
      })),
      totalCost: poTotalCost,
      status,
      createdAt: new Date().toISOString(),
      notes: poNotes
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    setIsPOModalOpen(false);
  };

  // Mark PO as received and restock
  const handleMarkPOReceived = (po: PurchaseOrder) => {
    if (confirm(`¿Confirmas la recepción de la Orden #${po.id}? Se actualizará el stock en inventario.`)) {
      po.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && onEditProduct) {
          onEditProduct({
            ...prod,
            stock: (prod.stock || 0) + item.orderedQty,
            cost: item.purchaseCost > 0 ? item.purchaseCost : prod.cost
          });
        }
      });

      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === po.id ? { ...p, status: 'Recibida' } : p))
      );
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl border-2 border-slate-800 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h2 className="text-xl font-black tracking-tight">Proveedores & Reposición</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Gestión de abastecimiento, órdenes de compra automáticas y enlace de costos netos.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleGeneratePO()}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generar Orden de Compra</span>
          </button>

          <button
            onClick={handleOpenAddSupplier}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300 text-xs font-black">
        <button
          onClick={() => setActiveSubTab('reorder')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'reorder'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Reposición & Stock Bajo ({lowStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'directory'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-indigo-600" />
          <span>Directorio de Proveedores ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Historial de Órdenes ({purchaseOrders.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: REPOSICIÓN & STOCK BAJO */}
      {activeSubTab === 'reorder' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                Productos Agotados
              </span>
              <h3 className="text-2xl font-black text-rose-950 font-mono">
                {outOfStockProducts.length}
              </h3>
              <p className="text-[11px] text-rose-700 font-bold">Requieren compra urgente</p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Stock Crítico (≤ 5 un.)
              </span>
              <h3 className="text-2xl font-black text-amber-950 font-mono">
                {lowStockProducts.length}
              </h3>
              <p className="text-[11px] text-amber-700 font-bold">Próximos a agotarse</p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Total Productos Monitoreados
              </span>
              <h3 className="text-2xl font-black text-emerald-950 font-mono">
                {products.length}
              </h3>
              <p className="text-[11px] text-emerald-700 font-bold">En base de datos de inventario</p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Inventario para Reposición
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configura el costo de compra y asigna el proveedor correspondiente.
                </p>
              </div>

              <button
                onClick={() => handleGeneratePO()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Generar PO para Stock Bajo ({lowStockProducts.length})</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-[10px] uppercase font-black text-slate-400">
                    <th className="pb-3">Producto</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-center">Stock Actual</th>
                    <th className="pb-3 text-right">Costo Compra</th>
                    <th className="pb-3 text-right">Precio Venta</th>
                    <th className="pb-3 text-right">Margen</th>
                    <th className="pb-3">Proveedor Asignado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const cost = p.cost || 0;
                    const price = p.precioOferta || p.price;
                    const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
                    const isLow = p.stock !== undefined && p.stock <= 5;
                    const currentSup = suppliers.find((s) => s.id === p.supplierId) || suppliers[0];

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${isLow ? 'bg-rose-50/40' : ''}`}>
                        <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-contain bg-slate-50 border p-0.5"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-normal">{p.category}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-500">{p.sku || p.id.slice(-6)}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono font-black text-[11px] ${
                              (p.stock || 0) <= 0
                                ? 'bg-rose-100 text-rose-800'
                                : (p.stock || 0) <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock ?? 0}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-800">
                          ${cost.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 text-right font-mono font-black text-emerald-600">
                          ${price.toLocaleString('es-CL')}
                        </td>
                        <td className="py-3 text-right font-mono font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${margin >= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {margin}%
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            value={p.supplierId || currentSup.id}
                            onChange={(e) => {
                              const newSupId = e.target.value;
                              const supObj = suppliers.find((s) => s.id === newSupId);
                              if (onEditProduct) {
                                onEditProduct({
                                  ...p,
                                  supplierId: newSupId,
                                  supplierName: supObj?.name
                                });
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 max-w-[180px] truncate"
                          >
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DIRECTORIO DE PROVEEDORES */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proveedor por nombre, RUT, categoría o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm hover:border-indigo-300 transition-all space-y-3 relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-mono">
                      RUT: {s.rut}
                    </span>
                    <h3 className="font-black text-base text-slate-950 mt-1">{s.name}</h3>
                    <p className="text-xs text-slate-500 font-bold">Contacto: {s.contactPerson}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSupplier(s)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Editar proveedor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(s.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Eliminar proveedor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{s.phone}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.address && (
                    <p className="text-[11px] text-slate-500 font-sans">
                      📍 {s.address}
                    </p>
                  )}
                  {s.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      💬 "{s.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const clean = s.phone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${clean}`, '_blank');
                    }}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleGeneratePO(s)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Crear PO</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HISTORIAL DE ÓRDENES */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {purchaseOrders.length === 0 ? (
            <div className="py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-black text-sm text-slate-600 uppercase">Aún no hay órdenes de compra</p>
              <p className="text-xs">Genera tu primera orden desde la pestaña de Reposición.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          #{po.id.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            po.status === 'Recibida'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.status === 'Enviada'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold">
                        Proveedor: <span className="text-slate-900">{po.supplierName}</span> • {new Date(po.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-emerald-700 font-mono">
                        ${po.totalCost.toLocaleString('es-CL')} CLP
                      </span>

                      {po.status !== 'Recibida' && (
                        <button
                          onClick={() => handleMarkPOReceived(po)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar Recibida (+Stock)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1">
                    <p className="font-black text-[10px] uppercase text-slate-400">Items Solicitados ({po.items.length}):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-medium text-slate-700">
                      {po.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate pr-2">• {it.productName} ({it.orderedQty} un.)</span>
                          <span className="font-mono font-bold">${it.subtotal.toLocaleString('es-CL')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border-2 border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</span>
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">RUT Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 76.123.456-7"
                    value={supplierForm.rut}
                    onChange={(e) => setSupplierForm({ ...supplierForm, rut: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Central"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Valenzuela"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +56987654321"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Ej. ventas@proveedor.cl"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-black text-slate-700 uppercase block mb-1">Categoría</label>
                  <select
                    value={supplierForm.category}
                    onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="Abarrotes y Granos">Abarrotes y Granos</option>
                    <option value="Frutas y Verduras">Frutas y Verduras</option>
                    <option value="Lácteos y Refrigerados">Lácteos y Refrigerados</option>
                    <option value="Bebidas y Jugos">Bebidas y Jugos</option>
                    <option value="Snacks y Confitería">Snacks y Confitería</option>
                    <option value="Carnes y Congelados">Carnes y Congelados</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Dirección de Despacho</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Lo Valledor 450, Santiago"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 uppercase block mb-1">Condiciones / Notas</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Despacho mínimo $50.000, 5 días de crédito..."
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE PURCHASE ORDER */}
      {isPOModalOpen && selectedSupplierForPO && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl border-2 border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <span>Orden de Compra Automática</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Proveedor: <span className="font-bold text-slate-900">{selectedSupplierForPO.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsPOModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Supplier Selector */}
            <div>
              <label className="text-[11px] font-black uppercase text-slate-700 block mb-1">
                Cambiar Proveedor Destinatario:
              </label>
              <select
                value={selectedSupplierForPO.id}
                onChange={(e) => {
                  const s = suppliers.find((sup) => sup.id === e.target.value);
                  if (s) setSelectedSupplierForPO(s);
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category}) - {s.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Item list editor */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase text-slate-700 block">
                Artículos Solicitados:
              </span>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-2xl">
                {poItems.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900 truncate">{it.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {it.sku} | Stock Actual: {it.currentStock}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-500">Cant:</span>
                        <input
                          type="number"
                          min="1"
                          value={it.orderedQty}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setPoItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, orderedQty: val } : item))
                            );
                          }}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-500">Costo:</span>
                        <input
                          type="number"
                          min="0"
                          value={it.purchaseCost}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setPoItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, purchaseCost: val } : item))
                            );
                          }}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>

                      <span className="font-mono font-black text-emerald-700 min-w-[70px] text-right">
                        ${(it.orderedQty * it.purchaseCost).toLocaleString('es-CL')}
                      </span>

                      <button
                        type="button"
                        onClick={() => setPoItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PO Notes */}
            <div>
              <label className="text-[11px] font-black uppercase text-slate-700 block mb-1">
                Instrucciones / Comentarios para el Proveedor:
              </label>
              <textarea
                rows={2}
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 resize-none"
              />
            </div>

            {/* Total summary */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Total Orden de Compra</p>
                <p className="text-xl font-black font-mono text-emerald-400">
                  ${poTotalCost.toLocaleString('es-CL')} CLP
                </p>
              </div>
              <span className="text-xs text-slate-300 font-bold">
                {poItems.length} artículos solicitados
              </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleSendPOWhatsApp}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Orden por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPO_PDF}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF / Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
