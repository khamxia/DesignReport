import { useState, useMemo } from 'react';
import {
  Search, Download, ChevronDown, ChevronUp,
  ShoppingCart, Package, CheckCircle, Clock, AlertTriangle,
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

export default function PurchaseOrderReportPage() {
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('by-order');
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายงานการสั่งซื้ออะไหล่</h1>
          <p className="mt-0.5 text-sm text-slate-500">ติดตามใบสั่งซื้อ อะไหล่ย่อย ยอดรวม และสถานะ</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
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
                {['เลขที่สั่งซื้อ','วันที่','ทะเบียน','Supplier','รายการ','มูลค่า','สถานะ',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(po => (
                <>
                  <tr key={po.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === po.id ? null : po.id)}>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">{po.orderNumber}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{po.orderDate}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-slate-800">{po.vehicle?.plateNumber ?? '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-700">{po.supplier}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{po.items.length}</span>
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(po.totalAmount)}</td>
                    <td className="px-3 py-3"><StatusBadge status={po.status} /></td>
                    <td className="px-3 py-3 text-slate-400">
                      {expanded === po.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                  </tr>
                  {expanded === po.id && (
                    <tr key={`${po.id}-x`}>
                      <td colSpan={8} className="bg-slate-50 px-6 pb-4 pt-0">
                        <p className="text-xs font-semibold text-slate-500 mt-3 mb-2">รายการอะไหล่ ({po.items.length})</p>
                        <table className="w-full text-xs">
                          <thead><tr className="text-[10px] text-slate-400">
                            {['ชื่ออะไหล่','จำนวน','หน่วย','ราคาประเมิน','ราคาจริง','รับแล้ว'].map(h => (
                              <th key={h} className="pb-1 text-left font-medium">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-slate-100">
                            {po.items.map(item => (
                              <tr key={item.id}>
                                <td className="py-1.5 font-medium text-slate-700">{item.name}</td>
                                <td className="py-1.5 text-right font-mono">{item.quantity}</td>
                                <td className="py-1.5 text-slate-500">{item.unit}</td>
                                <td className="py-1.5 text-right font-mono">{fmt(item.estimatedPrice)}</td>
                                <td className="py-1.5 text-right font-mono">{item.actualPrice != null ? fmt(item.actualPrice) : '—'}</td>
                                <td className="py-1.5 text-right font-mono text-slate-600">{item.receivedQty ?? 0}/{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t border-slate-200">
                            <tr>
                              <td colSpan={3} className="pt-1.5 text-right font-semibold text-slate-600">รวม</td>
                              <td className="pt-1.5 text-right font-mono font-bold text-[#1565C0]">{fmt(po.items.reduce((s,i)=>s+i.estimatedPrice,0))}</td>
                              <td colSpan={2} />
                            </tr>
                          </tfoot>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม ({filtered.length} ใบสั่งซื้อ)</td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#1565C0]">{fmt(totalAmount)}</td>
                <td colSpan={2} />
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
                    <tr key={vid} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === vid ? null : vid)}>
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
                        {expanded === vid ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {expanded === vid && (
                      <tr key={`${vid}-x`}>
                        <td colSpan={6} className="bg-slate-50 px-6 pb-4 pt-0">
                          {pos.map(po => (
                            <div key={po.id} className="mt-3">
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
                    <tr key={supplier} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === supplier ? null : supplier)}>
                      <td className="px-3 py-3 font-semibold text-slate-800">{supplier}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{pos.length}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{itemCount}</span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(total)}</td>
                      <td className="px-3 py-3 text-slate-400">
                        {expanded === supplier ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {expanded === supplier && (
                      <tr key={`${supplier}-x`}>
                        <td colSpan={5} className="bg-slate-50 px-6 pb-4 pt-0">
                          {pos.map(po => {
                            const v = vehicles.find(vv => vv.id === po.vehicleId);
                            return (
                              <div key={po.id} className="mt-3">
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
    </div>
  );
}
