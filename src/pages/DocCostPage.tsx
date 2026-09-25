import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import KpiCard from '../components/KpiCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import ExportModal from '../components/ExportModal';
import { documentExpenses, vehicles, monthlyDocCosts, docTypes } from '../data/mockData';
import { FileText, Receipt, TrendingUp, DollarSign } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: 'ชำระแล้ว', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  pending: { label: 'รอชำระ', bg: 'bg-amber-100', text: 'text-amber-700' },
  overdue: { label: 'เกินกำหนด', bg: 'bg-red-100', text: 'text-red-700' },
};

const PIE_COLORS = ['#1565C0', '#2E7D32', '#E65100', '#C62828', '#546E7A', '#7B1FA2'];

const defaultFilter: FilterState = {
  dateRange: 'year', startDate: '', endDate: '',
  branch: [], vehicleStatus: [], vehicleType: [], brand: [], currency: 'THB',
};

export default function DocCostPage() {
  const [filters, setFilters] = useState(defaultFilter);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);

  const enriched = useMemo(() => documentExpenses.map(d => ({
    ...d,
    vehicle: vehicles.find(v => v.id === d.vehicleId),
  })), []);

  const filtered = useMemo(() => {
    let data = enriched;
    if (filters.branch.length) data = data.filter(d => d.vehicle && filters.branch.includes(d.vehicle.branch));
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.docNumber.toLowerCase().includes(q) ||
        d.vehicle?.plateNumber.toLowerCase().includes(q) ||
        d.docType.toLowerCase().includes(q)
      );
    }
    return data;
  }, [enriched, filters, search]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const totalCost = filtered.reduce((s, d) => s + d.amount, 0);
  const avgPerDoc = filtered.length ? Math.round(totalCost / filtered.length) : 0;

  const docTypePie = docTypes.map((t, i) => ({
    name: t,
    value: enriched.filter(d => d.docType === t).reduce((s, d) => s + d.amount, 0),
  })).filter(d => d.value > 0);

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === pageData.length ? [] : pageData.map(d => d.id));

  return (
    <div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} totalCount={filtered.length} selectedCount={selected.length} />}

      <PageHeader title="รายงานค่าใช้จ่ายเอกสาร" subtitle="วิเคราะห์ค่าใช้จ่ายเอกสารและภาษียานพาหนะ" onExport={() => setShowExport(true)} />

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard title="ค่าใช้จ่ายเอกสารรวม" value={`฿${(totalCost / 1000).toFixed(0)}K`} icon={DollarSign} color="blue" change={-3} />
        <KpiCard title="จำนวนเอกสาร" value={String(filtered.length)} icon={FileText} color="gray" />
        <KpiCard title="เฉลี่ยต่อเอกสาร" value={`฿${avgPerDoc.toLocaleString()}`} icon={Receipt} color="orange" />
        <KpiCard title="รอดำเนินการ" value={String(filtered.filter(d => d.status === 'pending').length)} icon={TrendingUp} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">ค่าใช้จ่ายรายเดือน</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyDocCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Line type="monotone" dataKey="cost" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3, fill: '#2E7D32' }} name="ค่าเอกสาร" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">ตามประเภทเอกสาร</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={docTypePie} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                {docTypePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="ค้นหา..."
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
                {['เลขที่เอกสาร', 'วันที่', 'ทะเบียนรถ', 'ยี่ห้อ/รุ่น', 'สาขา', 'ประเภทเอกสาร', 'จำนวนเงิน', 'สถานะ'].map(col => (
                  <th key={col} className="px-3 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageData.map(d => {
                const s = STATUS_LABELS[d.status];
                return (
                  <tr key={d.id} className={`hover:bg-slate-50 ${selected.includes(d.id) ? 'bg-[#E3F2FD]' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="accent-[#1565C0]"
                        checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">{d.docNumber}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{d.date}</td>
                    <td className="px-3 py-3 text-xs font-medium text-slate-800">{d.vehicle?.plateNumber ?? d.vehicleId}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{d.vehicle?.brand} {d.vehicle?.model}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{d.vehicle?.branch}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{d.docType}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-mono font-semibold text-slate-800">฿{d.amount.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={7} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono font-bold text-[#1565C0]">฿{totalCost.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">แสดง {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} จาก {filtered.length}</p>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-2.5 py-1.5 text-xs border rounded-lg ${page === p ? 'bg-[#1565C0] border-[#1565C0] text-white' : 'border-slate-200'}`}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
