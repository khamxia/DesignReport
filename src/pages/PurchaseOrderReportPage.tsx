import { useState, useMemo } from 'react';
import {
  Search, Download, ChevronDown, ChevronUp,
  ShoppingCart, Package, CheckCircle, Clock, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { vehicles } from '../data/mockData';
import { purchaseOrders } from '../data/extendedData';

const PIE_COLORS = ['#1565C0','#1976D2','#42A5F5','#BBDEFB','#0D47A1','#64B5F6'];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:              { label: 'ร่าง',          cls: 'bg-slate-100 text-slate-600' },
  requested:          { label: 'ขอสั่งซื้อ',    cls: 'bg-blue-100 text-blue-700' },
  ordered:            { label: 'สั่งซื้อแล้ว',  cls: 'bg-indigo-100 text-indigo-700' },
  partially_received: { label: 'รับบางส่วน',    cls: 'bg-amber-100 text-amber-700' },
  received:           { label: 'รับครบแล้ว',    cls: 'bg-emerald-100 text-emerald-700' },
  cancelled:          { label: 'ยกเลิก',        cls: 'bg-red-100 text-red-600' },
};

function fmt(v: number) {
  return '฿' + v.toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

type GroupMode = 'by-order' | 'by-vehicle' | 'by-supplier';

const GROUP_MODES: { value: GroupMode; label: string }[] = [
  { value: 'by-order',    label: 'ตามใบสั่งซื้อ' },
  { value: 'by-vehicle',  label: 'ตามรถ' },
  { value: 'by-supplier', label: 'ตาม Supplier' },
];

type EnrichedPO = (typeof purchaseOrders)[0] & { vehicle?: (typeof vehicles)[0] };

export default function PurchaseOrderReportPage() {
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('by-order');
  const [groupExpanded, setGroupExpanded] = useState<string | null>(null);
  const [detailPo, setDetailPo] = useState<EnrichedPO | null>(null);

  // Export modal state
  const [showExport, setShowExport] = useState(false);
  const [exportWithParts, setExportWithParts] = useState(true);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('excel');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [toast, setToast] = useState(false);

  const enriched = useMemo(() => purchaseOrders.map(po => ({
    ...po,
    vehicle: vehicles.find(v => v.id === po.vehicleId),
  })), []);

  const filtered = enriched.filter(po => {
    const matchV = !vehicleId || po.vehicleId === vehicleId;
    const matchS = !search ||
      po.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.toLowerCase().includes(search.toLowerCase()) ||
      (po.vehicle?.plateNumber ?? '').toLowerCase().includes(search.toLowerCase());
    const matchSt = !statusFilter || po.status === statusFilter;
    return matchV && matchS && matchSt;
  });

  const totalAmount  = filtered.reduce((s, po) => s + po.totalAmount, 0);
  const totalItems   = filtered.reduce((s, po) => s + po.items.length, 0);
  const pending      = filtered.filter(po => ['draft','requested','ordered','partially_received'].includes(po.status)).length;
  const received     = filtered.filter(po => po.status === 'received').length;

  // Charts
  const pieData = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(po => { m[po.status] = (m[po.status] ?? 0) + po.totalAmount; });
    return Object.entries(m).map(([name, value]) => ({ name: STATUS_MAP[name]?.label ?? name, value }));
  }, [filtered]);

  const supplierData = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(po => { m[po.supplier] = (m[po.supplier] ?? 0) + po.totalAmount; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,8);
  }, [filtered]);

  // Grouped view helpers
  const byVehicle = useMemo(() => {
    const m: Record<string, typeof enriched> = {};
    filtered.forEach(po => {
      const key = po.vehicleId;
      if (!m[key]) m[key] = [];
      m[key].push(po);
    });
    return Object.entries(m);
  }, [filtered]);

  const bySupplier = useMemo(() => {
    const m: Record<string, typeof enriched> = {};
    filtered.forEach(po => {
      if (!m[po.supplier]) m[po.supplier] = [];
      m[po.supplier].push(po);
    });
    return Object.entries(m);
  }, [filtered]);

  function handleExport() {
    setShowExport(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายงานการสั่งซื้ออะไหล่</h1>
          <p className="mt-0.5 text-sm text-slate-500">ติดตามใบสั่งซื้อ อะไหล่ย่อย ยอดรวม และสถานะ</p>
        </div>
        <button onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ใบสั่งซื้อทั้งหมด', value: String(filtered.length), icon: ShoppingCart, color: 'text-[#1565C0]' },
          { label: 'รายการอะไหล่',       value: String(totalItems),      icon: Package,     color: 'text-amber-600' },
          { label: 'รอดำเนินการ',         value: String(pending),         icon: Clock,       color: 'text-indigo-600' },
          { label: 'รับครบแล้ว',          value: String(received),        icon: CheckCircle, color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <k.icon size={16} className={`${k.color} mb-2`} />
            <p className="text-xl font-bold text-slate-900 font-mono">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">มูลค่าตามสถานะ</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">มูลค่าตาม Supplier (Top 8)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={supplierData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="value" fill="#1565C0" radius={[0,4,4,0]} name="มูลค่า" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเลขที่ / Supplier / ทะเบียน..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0] w-64" />
          </div>
          <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
            <option value="">ยานพาหนะทั้งหมด</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} – {v.brand}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
            <option value="">สถานะทั้งหมด</option>
            {Object.entries(STATUS_MAP).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
          </select>

          <div className="flex bg-slate-100 rounded-lg p-0.5 ml-auto">
            {GROUP_MODES.map(m => (
              <button key={m.value} onClick={() => setGroupMode(m.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                  ${groupMode === m.value ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                {m.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">{filtered.length} รายการ · {fmt(totalAmount)}</span>
        </div>

        {/* ── by-order view ── */}
        {groupMode === 'by-order' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['เลขที่สั่งซื้อ','วันที่','ทะเบียน','Supplier','รายการ','มูลค่า','สถานะ'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(po => (
                <tr key={po.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetailPo(po)}>
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">{po.orderNumber}</td>
                  <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{po.orderDate}</td>
                  <td className="px-3 py-3 font-mono font-semibold text-slate-800">{po.vehicle?.plateNumber ?? '-'}</td>
                  <td className="px-3 py-3 text-xs text-slate-700">{po.supplier}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{po.items.length}</span>
                  </td>
                  <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(po.totalAmount)}</td>
                  <td className="px-3 py-3"><StatusBadge status={po.status} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม ({filtered.length} ใบสั่งซื้อ)</td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#1565C0]">{fmt(totalAmount)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}

        {/* ── by-vehicle view ── */}
        {groupMode === 'by-vehicle' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['ทะเบียน','ยี่ห้อ/รุ่น','จำนวน PO','รายการอะไหล่','มูลค่ารวม',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {byVehicle.map(([vid, pos]) => {
                const v = vehicles.find(vv => vv.id === vid);
                const total = pos.reduce((s,po)=>s+po.totalAmount,0);
                const itemCount = pos.reduce((s,po)=>s+po.items.length,0);
                return (
                  <>
                    <tr key={vid} className="hover:bg-slate-50 cursor-pointer" onClick={() => setGroupExpanded(groupExpanded === vid ? null : vid)}>
                      <td className="px-3 py-3 font-mono font-semibold text-slate-800">{v?.plateNumber ?? vid}</td>
                      <td className="px-3 py-3 text-xs text-slate-700">{v ? `${v.brand} ${v.model}` : '—'}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{pos.length}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{itemCount}</span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(total)}</td>
                      <td className="px-3 py-3 text-slate-400">
                        {groupExpanded === vid ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {groupExpanded === vid && (
                      <tr key={`${vid}-x`}>
                        <td colSpan={6} className="bg-slate-50 px-6 pb-4 pt-0">
                          {pos.map(po => (
                            <div key={po.id} className="mt-3 cursor-pointer hover:bg-slate-100 rounded-lg p-2 -mx-2 transition-colors"
                              onClick={() => setDetailPo(po)}>
                              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1.5">
                                {po.orderNumber} · {po.supplier}
                                <StatusBadge status={po.status} />
                                <span className="ml-auto font-mono text-slate-600">{fmt(po.totalAmount)}</span>
                              </p>
                              <div className="space-y-0.5">
                                {po.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-700">{item.name} × {item.quantity} {item.unit}</span>
                                    <span className="font-mono text-slate-600">{fmt(item.estimatedPrice)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}

        {/* ── by-supplier view ── */}
        {groupMode === 'by-supplier' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Supplier','จำนวน PO','รายการอะไหล่','มูลค่ารวม',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bySupplier.map(([supplier, pos]) => {
                const total = pos.reduce((s,po)=>s+po.totalAmount,0);
                const itemCount = pos.reduce((s,po)=>s+po.items.length,0);
                return (
                  <>
                    <tr key={supplier} className="hover:bg-slate-50 cursor-pointer" onClick={() => setGroupExpanded(groupExpanded === supplier ? null : supplier)}>
                      <td className="px-3 py-3 font-semibold text-slate-800">{supplier}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{pos.length}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{itemCount}</span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(total)}</td>
                      <td className="px-3 py-3 text-slate-400">
                        {groupExpanded === supplier ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {groupExpanded === supplier && (
                      <tr key={`${supplier}-x`}>
                        <td colSpan={5} className="bg-slate-50 px-6 pb-4 pt-0">
                          {pos.map(po => {
                            const v = vehicles.find(vv => vv.id === po.vehicleId);
                            return (
                              <div key={po.id} className="mt-3 cursor-pointer hover:bg-slate-100 rounded-lg p-2 -mx-2 transition-colors"
                                onClick={() => setDetailPo(po)}>
                                <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1.5">
                                  {po.orderNumber}
                                  <span className="font-mono text-slate-600">{v?.plateNumber}</span>
                                  <StatusBadge status={po.status} />
                                  <span className="ml-auto font-mono text-slate-600">{fmt(po.totalAmount)}</span>
                                </p>
                                <div className="space-y-0.5">
                                  {po.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 last:border-0">
                                      <span className="text-slate-700">{item.name} × {item.quantity} {item.unit}</span>
                                      <span className="font-mono text-slate-600">{fmt(item.estimatedPrice)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PO Detail Drawer */}
      {detailPo && (
        <div className="fixed inset-0 z-50" onClick={() => setDetailPo(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="fixed top-0 right-0 h-full w-[560px] bg-white shadow-2xl z-50 flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800 font-mono">{detailPo.orderNumber}</h3>
                <div className="mt-0.5"><StatusBadge status={detailPo.status} /></div>
              </div>
              <button onClick={() => setDetailPo(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* ข้อมูล Order */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">ข้อมูล Order</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">ยานพาหนะ</span>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-slate-800">{detailPo.vehicle?.plateNumber ?? '-'}</p>
                      {detailPo.vehicle && (
                        <p className="text-xs text-slate-500">{detailPo.vehicle.brand} {detailPo.vehicle.model}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">ผู้จำหน่าย (Supplier)</span>
                    <span className="text-sm text-slate-700">{detailPo.supplier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">วันที่สั่งซื้อ</span>
                    <span className="text-sm text-slate-700">{detailPo.orderDate}</span>
                  </div>
                  {detailPo.notes && (
                    <div className="pt-1 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">หมายเหตุ</p>
                      <p className="text-sm text-slate-700">{detailPo.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* รายการอะไหล่ */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">รายการอะไหล่ ({detailPo.items.length} รายการ)</p>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        {['ชื่ออะไหล่','จำนวน','หน่วย','ราคาประเมิน','ราคาจริง','รับแล้ว'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {detailPo.items.map(item => {
                        const pct = item.quantity > 0 ? Math.round(((item.receivedQty ?? 0) / item.quantity) * 100) : 0;
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-2.5 font-medium text-slate-700">{item.name}</td>
                            <td className="px-3 py-2.5 text-right font-mono">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-slate-500">{item.unit}</td>
                            <td className="px-3 py-2.5 text-right font-mono">{fmt(item.estimatedPrice)}</td>
                            <td className="px-3 py-2.5 text-right font-mono">{item.actualPrice != null ? fmt(item.actualPrice) : '—'}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                                  <div className="bg-[#1565C0] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="font-mono text-slate-600 text-[10px] whitespace-nowrap">{item.receivedQty ?? 0}/{item.quantity}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">สรุปมูลค่ารวม</span>
                <span className="font-mono text-lg font-bold text-[#1565C0]">{fmt(detailPo.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">ตั้งค่า Export</h3>
              <button onClick={() => setShowExport(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ตั้งแต่วันที่</label>
                  <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ถึงวันที่</label>
                  <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">รูปแบบ</label>
                <div className="flex gap-2">
                  {(['excel','pdf'] as const).map(f => (
                    <button key={f} onClick={() => setExportFormat(f)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                        ${exportFormat === f ? 'bg-[#1565C0] border-[#1565C0] text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {f === 'excel' ? '📊 Excel' : '📄 PDF'}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={exportWithParts} onChange={e => setExportWithParts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1565C0] accent-[#1565C0]" />
                <div>
                  <p className="text-sm font-medium text-slate-700">รวมรายการอะไหล่ย่อย</p>
                  <p className="text-xs text-slate-400">แสดงรายละเอียดอะไหล่แต่ละรายการในรายงาน</p>
                </div>
              </label>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setShowExport(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">ยกเลิก</button>
              <button onClick={handleExport}
                className="flex-1 py-2 rounded-lg bg-[#1565C0] text-white text-sm font-medium flex items-center justify-center gap-2">
                <Download size={14} />Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          กำลัง Export...
        </div>
      )}
    </div>
  );
}
