import { useState, useMemo } from 'react';
import {
  Search, Download, ChevronDown, ChevronUp, Car, Wrench,
  Package, ShoppingCart, DollarSign,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { repairRecords, vehicles, monthlyRepairCosts } from '../data/mockData';
import { repairItems, purchaseOrders } from '../data/extendedData';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportTab = 'by-vehicle' | 'by-repair' | 'by-parts' | 'purchase-orders';
type IncludeMode = 'repairs-only' | 'repairs-and-parts' | 'parts-only';

const PIE_COLORS = ['#1565C0','#1976D2','#42A5F5','#90CAF9','#BBDEFB','#0D47A1','#2196F3'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return '฿' + v.toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-amber-100 text-amber-700',
    pending: 'bg-slate-100 text-slate-600',
    draft: 'bg-slate-100 text-slate-600',
    requested: 'bg-blue-100 text-blue-700',
    ordered: 'bg-indigo-100 text-indigo-700',
    partially_received: 'bg-amber-100 text-amber-700',
    received: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
    installed: 'bg-emerald-100 text-emerald-700',
  };
  const labels: Record<string, string> = {
    completed: 'เสร็จแล้ว', in_progress: 'กำลังดำเนินการ', pending: 'รอดำเนินการ',
    draft: 'ร่าง', requested: 'ขอสั่งซื้อ', ordered: 'สั่งซื้อแล้ว',
    partially_received: 'รับบางส่วน', received: 'รับครบแล้ว', cancelled: 'ยกเลิก',
    installed: 'ติดตั้งแล้ว',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>{labels[status] ?? status}</span>;
}

// ─── Report Tab: By Vehicle ───────────────────────────────────────────────────

function ByVehicleReport({ includeMode }: { includeMode: IncludeMode }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => vehicles.map(v => {
    const repairs = repairRecords.filter(r => r.vehicleId === v.id);
    const parts = repairItems.filter(i => i.vehicleId === v.id);
    const repairTotal = repairs.reduce((s, r) => s + r.total, 0);
    const partsTotal = parts.reduce((s, p) => s + p.total, 0);
    return { v, repairs, parts, repairTotal, partsTotal };
  }).filter(r => r.repairs.length > 0 || r.parts.length > 0), []);

  const filtered = rows.filter(r =>
    !search ||
    r.v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.v.brand.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal = filtered.reduce((s, r) => s + r.repairTotal, 0);
  const pieData = filtered.slice(0, 8).map(r => ({ name: r.v.plateNumber, value: r.repairTotal }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาทะเบียน / ยี่ห้อ..."
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0] w-56" />
        </div>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} คัน · รวม {fmt(grandTotal)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['ทะเบียนรถ','ยี่ห้อ/รุ่น','สาขา','จำนวนซ่อม','ค่าซ่อมรวม',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(({ v, repairs, parts, repairTotal, partsTotal }) => (
                <>
                  <tr key={v.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
                    <td className="px-3 py-3 font-mono font-semibold text-slate-800">{v.plateNumber}</td>
                    <td className="px-3 py-3 text-slate-700">{v.brand} {v.model}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{v.branch}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{repairs.length}</span>
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(repairTotal)}</td>
                    <td className="px-3 py-3 text-slate-400">
                      {expanded === v.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                  </tr>
                  {expanded === v.id && (
                    <tr key={`${v.id}-x`}>
                      <td colSpan={6} className="bg-slate-50 px-6 pb-4 pt-0">
                        {(includeMode === 'repairs-only' || includeMode === 'repairs-and-parts') && (
                          <>
                            <p className="text-xs font-semibold text-slate-500 mt-3 mb-2">รายการซ่อม</p>
                            <div className="space-y-1">
                              {repairs.map(r => (
                                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                                  <div>
                                    <p className="text-xs font-medium text-slate-700">{r.repairItems}</p>
                                    <p className="text-[10px] text-slate-400">{r.date} · {r.garage}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <StatusBadge status={r.status} />
                                    <span className="font-mono text-xs font-semibold text-slate-800">{fmt(r.total)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {(includeMode === 'repairs-and-parts' || includeMode === 'parts-only') && parts.length > 0 && (
                          <>
                            <p className="text-xs font-semibold text-slate-500 mt-4 mb-2">อะไหล่ย่อย ({parts.length} รายการ)</p>
                            <div className="space-y-1">
                              {parts.map(p => (
                                <div key={p.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0 text-xs">
                                  <div>
                                    <span className="font-medium text-slate-700">{p.name}</span>
                                    <span className="ml-2 text-slate-400">{p.type} · {p.quantity} {p.unit}</span>
                                  </div>
                                  <span className="font-mono text-slate-700">{fmt(p.total)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between pt-1 text-xs font-bold text-[#1565C0]">
                                <span>รวมอะไหล่</span>
                                <span className="font-mono">{fmt(partsTotal)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={4} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวมทั้งหมด</td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#1565C0]">{fmt(grandTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">ค่าใช้จ่ายตามรถ (Top 8)</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Report Tab: By Repair ────────────────────────────────────────────────────

function ByRepairReport({ includeMode }: { includeMode: IncludeMode }) {
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const enriched = useMemo(() => repairRecords.map(r => ({
    ...r,
    vehicle: vehicles.find(v => v.id === r.vehicleId),
    parts: repairItems.filter(i => i.repairId === r.id),
  })), []);

  const filtered = enriched.filter(r => {
    const matchV = !vehicleId || r.vehicleId === vehicleId;
    const matchS = !search ||
      r.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.repairItems.toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicle?.plateNumber ?? '').toLowerCase().includes(search.toLowerCase());
    return matchV && matchS;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเลขที่ / ทะเบียน..."
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0] w-52" />
        </div>
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
          <option value="">ยานพาหนะทั้งหมด</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} – {v.brand} {v.model}</option>)}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} รายการ · {fmt(filtered.reduce((s,r)=>s+r.total,0))}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['เลขที่','วันที่','ทะเบียน','รายการซ่อม','ร้านซ่อม','รวม','สถานะ',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <>
                  <tr key={r.id} className={`hover:bg-slate-50 cursor-pointer ${r.parts.length > 0 && includeMode !== 'repairs-only' ? '' : ''}`}
                    onClick={() => r.parts.length > 0 && includeMode !== 'repairs-only' ? setExpanded(expanded === r.id ? null : r.id) : undefined}>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">{r.docNumber}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-3 font-mono font-medium text-slate-800">{r.vehicle?.plateNumber ?? '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-700 max-w-[160px] truncate">{r.repairItems}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{r.garage}</td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-800">{fmt(r.total)}</td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3 text-slate-400">
                      {r.parts.length > 0 && includeMode !== 'repairs-only'
                        ? (expanded === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                        : <span className="text-slate-200">—</span>}
                    </td>
                  </tr>
                  {expanded === r.id && includeMode !== 'repairs-only' && r.parts.length > 0 && (
                    <tr key={`${r.id}-x`}>
                      <td colSpan={8} className="bg-slate-50 px-6 pb-4 pt-0">
                        <p className="text-xs font-semibold text-slate-500 mt-3 mb-2">อะไหล่ย่อย ({r.parts.length} รายการ)</p>
                        <table className="w-full text-xs">
                          <thead><tr className="text-[10px] text-slate-400">
                            {['ชื่ออะไหล่','ประเภท','จำนวน','หน่วย','ราคา/หน่วย','รวม','สถานะ'].map(h => (
                              <th key={h} className="pb-1 text-left font-medium">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-slate-100">
                            {r.parts.map(p => (
                              <tr key={p.id}>
                                <td className="py-1 font-medium text-slate-700">{p.name}</td>
                                <td className="py-1 text-slate-500">{p.type}</td>
                                <td className="py-1 text-right font-mono">{p.quantity}</td>
                                <td className="py-1 text-slate-500">{p.unit}</td>
                                <td className="py-1 text-right font-mono">{fmt(p.unitPrice)}</td>
                                <td className="py-1 text-right font-mono font-semibold">{fmt(p.total)}</td>
                                <td className="py-1"><StatusBadge status={p.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t border-slate-200">
                            <tr>
                              <td colSpan={5} className="pt-1 text-right text-xs font-semibold text-slate-600">รวม</td>
                              <td className="pt-1 text-right font-mono font-bold text-[#1565C0]">{fmt(r.parts.reduce((s,p)=>s+p.total,0))}</td>
                              <td />
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
                <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม ({filtered.length} รายการ)</td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#1565C0]">{fmt(filtered.reduce((s,r)=>s+r.total,0))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">ค่าซ่อมรายเดือน</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRepairCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="cost" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} name="ค่าซ่อม" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Report Tab: By Parts ─────────────────────────────────────────────────────

function ByPartsReport() {
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const types = useMemo(() => [...new Set(repairItems.map(i => i.type))], []);
  const CUR_KM = 45230;

  function dueStatus(i: typeof repairItems[0]) {
    if (!i.reminderKm && !i.reminderDays) return null;
    if (i.reminderKm) {
      const rem = i.reminderKm - CUR_KM;
      if (rem <= 0) return { label: 'Overdue', cls: 'bg-red-100 text-red-700' };
      if (rem <= 2000) return { label: 'Due Soon', cls: 'bg-amber-100 text-amber-700' };
      return { label: 'Normal', cls: 'bg-emerald-100 text-emerald-700' };
    }
    if (i.reminderDays) {
      if (i.reminderDays < 0) return { label: 'Overdue', cls: 'bg-red-100 text-red-700' };
      if (i.reminderDays <= 30) return { label: 'Due Soon', cls: 'bg-amber-100 text-amber-700' };
      return { label: 'Normal', cls: 'bg-emerald-100 text-emerald-700' };
    }
    return null;
  }

  const filtered = useMemo(() => repairItems.filter(i => {
    const v = vehicles.find(vv => vv.id === i.vehicleId);
    return (!vehicleId || i.vehicleId === vehicleId)
      && (!typeFilter || i.type === typeFilter)
      && (!search || i.name.toLowerCase().includes(search.toLowerCase()) || (v?.plateNumber ?? '').toLowerCase().includes(search.toLowerCase()));
  }), [search, vehicleId, typeFilter]);

  const totalCost = filtered.reduce((s, i) => s + i.total, 0);

  const byType = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(i => { m[i.type] = (m[i.type] ?? 0) + i.total; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่ออะไหล่..."
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0] w-52" />
        </div>
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
          <option value="">ยานพาหนะทั้งหมด</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
          <option value="">ทุกประเภท</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} รายการ · {fmt(totalCost)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['ชื่ออะไหล่','ประเภท','ทะเบียน','จำนวน','ราคา/หน่วย','รวม','กำหนดถัดไป','สถานะ'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(i => {
                const v = vehicles.find(vv => vv.id === i.vehicleId);
                const due = dueStatus(i);
                const dueText = i.reminderKm
                  ? `${(i.reminderKm - CUR_KM).toLocaleString()} กม.`
                  : i.reminderDays ? `${i.reminderDays} วัน` : '—';
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{i.name}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{i.type}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{v?.plateNumber ?? '-'}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{i.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">{fmt(i.unitPrice)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800">{fmt(i.total)}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{dueText}</td>
                    <td className="px-3 py-2.5">
                      {due ? <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${due.cls}`}>{due.label}</span>
                           : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม</td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#1565C0]">{fmt(totalCost)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">ตามประเภทอะไหล่</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#1565C0" radius={[0,4,4,0]} name="มูลค่า" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">สรุปสถานะอะไหล่</p>
            {[
              { label: 'Overdue',    cls: 'bg-red-100 text-red-700',       count: filtered.filter(i => dueStatus(i)?.label === 'Overdue').length },
              { label: 'Due Soon',   cls: 'bg-amber-100 text-amber-700',   count: filtered.filter(i => dueStatus(i)?.label === 'Due Soon').length },
              { label: 'Normal',     cls: 'bg-emerald-100 text-emerald-700', count: filtered.filter(i => dueStatus(i)?.label === 'Normal').length },
              { label: 'ไม่ติดตาม', cls: 'bg-slate-100 text-slate-500',   count: filtered.filter(i => !dueStatus(i)).length },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.cls}`}>{row.label}</span>
                <span className="text-sm font-bold text-slate-700">{row.count} รายการ</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Report Tab: Purchase Orders ──────────────────────────────────────────────

function PurchaseOrderReport() {
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  const totalAmount = filtered.reduce((s, po) => s + po.totalAmount, 0);
  const statusCounts = ['draft','requested','ordered','partially_received','received','cancelled'].map(st => ({
    name: st, count: enriched.filter(po => po.status === st).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเลขที่ / ผู้จำหน่าย..."
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0] w-56" />
        </div>
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
          <option value="">ยานพาหนะทั้งหมด</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]">
          <option value="">สถานะทั้งหมด</option>
          {['draft','requested','ordered','partially_received','received','cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} รายการ · {fmt(totalAmount)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['เลขที่สั่งซื้อ','วันที่','ทะเบียน','ผู้จำหน่าย','รายการ','มูลค่า','สถานะ',''].map(h => (
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
                    <td className="px-3 py-3 font-mono font-medium text-slate-800">{po.vehicle?.plateNumber ?? '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-700">{po.supplier}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{po.items.length}</span>
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
                                <td className="py-1 font-medium text-slate-700">{item.name}</td>
                                <td className="py-1 text-right font-mono">{item.quantity}</td>
                                <td className="py-1 text-slate-500">{item.unit}</td>
                                <td className="py-1 text-right font-mono">{fmt(item.estimatedPrice)}</td>
                                <td className="py-1 text-right font-mono">{item.actualPrice != null ? fmt(item.actualPrice) : '—'}</td>
                                <td className="py-1 text-right font-mono">{item.receivedQty ?? 0}/{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม</td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#1565C0]">{fmt(totalAmount)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-1">มูลค่ารวม</p>
            <p className="font-mono text-2xl font-bold text-[#1565C0]">{fmt(totalAmount)}</p>
            <p className="text-xs text-slate-400 mt-1">{filtered.length} ใบสั่งซื้อ</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">สรุปสถานะ</p>
            {statusCounts.filter(b => b.count > 0).map(b => (
              <div key={b.name} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <StatusBadge status={b.name} />
                <span className="text-sm font-bold text-slate-700">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: 'by-vehicle',      label: 'รายงานตามรถ',      icon: Car },
  { id: 'by-repair',       label: 'รายการซ่อมแซม',    icon: Wrench },
  { id: 'by-parts',        label: 'อะไหล่ย่อย',       icon: Package },
  { id: 'purchase-orders', label: 'ใบสั่งซื้ออะไหล่', icon: ShoppingCart },
];

const INCLUDE_MODES: { value: IncludeMode; label: string }[] = [
  { value: 'repairs-only',      label: 'เฉพาะรายการซ่อม' },
  { value: 'repairs-and-parts', label: 'ซ่อม + อะไหล่ย่อย' },
  { value: 'parts-only',        label: 'เฉพาะอะไหล่ย่อย' },
];

export default function RepairCostPage() {
  const [tab, setTab] = useState<ReportTab>('by-vehicle');
  const [includeMode, setIncludeMode] = useState<IncludeMode>('repairs-and-parts');

  const totalCost = repairRecords.reduce((s, r) => s + r.total, 0);

  const showInclude = tab === 'by-vehicle' || tab === 'by-repair';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายงานค่าใช้จ่ายซ่อมบำรุง</h1>
          <p className="mt-0.5 text-sm text-slate-500">วิเคราะห์ค่าใช้จ่าย · รายการซ่อม · อะไหล่ · ใบสั่งซื้อ</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ค่าใช้จ่ายรวม',   value: fmt(totalCost),                     icon: DollarSign,  color: 'text-[#1565C0]' },
          { label: 'รายการซ่อม',       value: String(repairRecords.length),        icon: Wrench,      color: 'text-amber-600' },
          { label: 'รายการอะไหล่',     value: String(repairItems.length),          icon: Package,     color: 'text-emerald-600' },
          { label: 'ใบสั่งซื้อ',       value: String(purchaseOrders.length),       icon: ShoppingCart,color: 'text-indigo-600' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <k.icon size={16} className={`${k.color} mb-2`} />
            <p className="text-xl font-bold text-slate-900 font-mono">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 overflow-x-auto">
          <div className="flex gap-0 flex-shrink-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${tab === id ? 'border-[#1565C0] text-[#1565C0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          {showInclude && (
            <div className="flex items-center gap-2 px-4 flex-shrink-0">
              <span className="text-xs text-slate-400 whitespace-nowrap">แสดง:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                {INCLUDE_MODES.map(m => (
                  <button key={m.value} onClick={() => setIncludeMode(m.value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                      ${includeMode === m.value ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          {tab === 'by-vehicle'      && <ByVehicleReport includeMode={includeMode} />}
          {tab === 'by-repair'       && <ByRepairReport includeMode={includeMode} />}
          {tab === 'by-parts'        && <ByPartsReport />}
          {tab === 'purchase-orders' && <PurchaseOrderReport />}
        </div>
      </div>
    </div>
  );
}
