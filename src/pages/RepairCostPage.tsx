import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, DollarSign, TrendingUp, Wrench, BarChart2, Package, Users } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import KpiCard from '../components/KpiCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import ExportModal from '../components/ExportModal';
import { repairRecords, vehicles, monthlyRepairCosts, repairCategories } from '../data/mockData';

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: 'สำเร็จ', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  in_progress: { label: 'กำลังดำเนินการ', bg: 'bg-amber-100', text: 'text-amber-700' },
  pending: { label: 'รอดำเนินการ', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const PIE_COLORS = ['#1565C0', '#2E7D32', '#E65100', '#C62828', '#546E7A', '#7B1FA2'];

const defaultFilter: FilterState = {
  dateRange: 'year', startDate: '', endDate: '',
  branch: [], vehicleStatus: [], vehicleType: [], brand: [], currency: 'THB',
};

export default function RepairCostPage() {
  const [filters, setFilters] = useState(defaultFilter);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);

  const enriched = useMemo(() => repairRecords.map(r => {
    const v = vehicles.find(x => x.id === r.vehicleId);
    return { ...r, vehicle: v };
  }), []);

  const filtered = useMemo(() => {
    let data = enriched;
    if (filters.branch.length) data = data.filter(r => r.vehicle && filters.branch.includes(r.vehicle.branch));
    if (filters.brand.length) data = data.filter(r => r.vehicle && filters.brand.includes(r.vehicle.brand));
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.docNumber.toLowerCase().includes(q) ||
        r.vehicle?.plateNumber.toLowerCase().includes(q) ||
        r.repairItems.toLowerCase().includes(q)
      );
    }
    return data;
  }, [enriched, filters, search]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const totalCost = filtered.reduce((s, r) => s + r.total, 0);
  const totalParts = filtered.reduce((s, r) => s + r.parts, 0);
  const totalLabor = filtered.reduce((s, r) => s + r.labor, 0);
  const avgPerRepair = filtered.length ? Math.round(totalCost / filtered.length) : 0;

  const catData = repairCategories.map(cat => ({
    name: cat,
    value: enriched.filter(r => r.category === cat).reduce((s, r) => s + r.total, 0),
  })).filter(d => d.value > 0);

  const vehicleCostData = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach(r => {
      const label = r.vehicle ? `${r.vehicle.plateNumber.slice(0, 8)}...` : r.vehicleId;
      map[label] = (map[label] ?? 0) + r.total;
    });
    return Object.entries(map)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 8);
  }, [enriched]);

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === pageData.length ? [] : pageData.map(r => r.id));

  return (
    <div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} totalCount={filtered.length} selectedCount={selected.length} />}

      <PageHeader title="รายงานค่าใช้จ่ายซ่อมบำรุง" subtitle="วิเคราะห์ค่าใช้จ่ายซ่อมบำรุงยานพาหนะ" onExport={() => setShowExport(true)} />

      <FilterBar filters={filters} onChange={setFilters} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KpiCard title="ค่าใช้จ่ายรวม" value={`฿${(totalCost / 1000).toFixed(0)}K`} icon={DollarSign} color="blue" change={12} />
        <KpiCard title="ค่าใช้จ่ายเดือนนี้" value="฿83K" icon={TrendingUp} color="orange" change={18} />
        <KpiCard title="เฉลี่ยต่อคัน" value={`฿${(avgPerRepair / 1000).toFixed(1)}K`} icon={BarChart2} color="gray" />
        <KpiCard title="จำนวนครั้งซ่อม" value={String(filtered.length)} icon={Wrench} color="blue" />
        <KpiCard title="ค่าอะไหล่รวม" value={`฿${(totalParts / 1000).toFixed(0)}K`} icon={Package} color="green" />
        <KpiCard title="ค่าแรงรวม" value={`฿${(totalLabor / 1000).toFixed(0)}K`} icon={Users} color="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">ค่าใช้จ่ายตามช่วงเวลา</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyRepairCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Line type="monotone" dataKey="cost" stroke="#1565C0" strokeWidth={2.5} dot={{ r: 3, fill: '#1565C0' }} name="ค่าซ่อมบำรุง" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">ตามหมวดหมู่</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">ค่าใช้จ่ายตามรถ (Top 8)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={vehicleCostData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
            <Bar dataKey="cost" fill="#1565C0" radius={[0, 4, 4, 0]} name="ค่าใช้จ่าย" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="ค้นหา เลขที่เอกสาร / ทะเบียน..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="accent-[#1565C0]"
                    checked={pageData.length > 0 && selected.length === pageData.length}
                    onChange={toggleAll} />
                </th>
                {['เลขที่เอกสาร', 'วันที่', 'ทะเบียน', 'ยี่ห้อ/รุ่น', 'สาขา', 'รายการซ่อม', 'หมวดหมู่', 'ค่าอะไหล่', 'ค่าแรง', 'อื่นๆ', 'รวม', 'สถานที่', 'สถานะ'].map(col => (
                  <th key={col} className="px-3 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageData.map(r => {
                const s = STATUS_LABELS[r.status];
                return (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(r.id) ? 'bg-[#E3F2FD]' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="accent-[#1565C0]"
                        checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">{r.docNumber}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{r.date}</td>
                    <td className="px-3 py-3 text-xs font-medium text-slate-800">{r.vehicle?.plateNumber ?? r.vehicleId}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{r.vehicle?.brand} {r.vehicle?.model}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{r.vehicle?.branch}</td>
                    <td className="px-3 py-3 text-xs text-slate-700 max-w-[150px] truncate">{r.repairItems}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{r.category}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">฿{r.parts.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">฿{r.labor.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">฿{r.other.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-right font-mono font-semibold text-slate-800">฿{r.total.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{r.garage}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={8} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono font-semibold text-slate-800">฿{totalParts.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono font-semibold text-slate-800">฿{totalLabor.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono font-semibold text-slate-800">฿{filtered.reduce((s, r) => s + r.other, 0).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono font-bold text-[#1565C0]">฿{totalCost.toLocaleString()}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">แสดง {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} จาก {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-2.5 py-1.5 text-xs border rounded-lg ${page === p ? 'bg-[#1565C0] border-[#1565C0] text-white' : 'border-slate-200 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
