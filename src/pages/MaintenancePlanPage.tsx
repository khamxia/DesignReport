import { useState, useMemo } from 'react';
import { Search, Calendar, Table2 } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import ExportModal from '../components/ExportModal';
import { maintenancePlans, vehicles } from '../data/mockData';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

type PlanStatus = 'planned' | 'upcoming' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

const STATUS_CONFIG: Record<PlanStatus, { label: string; bg: string; text: string }> = {
  planned: { label: 'วางแผน', bg: 'bg-slate-100', text: 'text-slate-600' },
  upcoming: { label: 'กำลังจะถึง', bg: 'bg-blue-100', text: 'text-blue-700' },
  in_progress: { label: 'กำลังดำเนินการ', bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { label: 'สำเร็จ', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  overdue: { label: 'เกินกำหนด', bg: 'bg-red-100', text: 'text-red-700' },
  cancelled: { label: 'ยกเลิก', bg: 'bg-slate-100', text: 'text-slate-400' },
};

const defaultFilter: FilterState = {
  dateRange: 'year', startDate: '', endDate: '',
  branch: [], vehicleStatus: [], vehicleType: [], brand: [], currency: 'THB',
};

export default function MaintenancePlanPage() {
  const [filters, setFilters] = useState(defaultFilter);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);

  const enriched = useMemo(() => maintenancePlans.map(p => ({
    ...p,
    vehicle: vehicles.find(v => v.id === p.vehicleId),
  })), []);

  const filtered = useMemo(() => {
    let data = enriched;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.taskName.toLowerCase().includes(q) ||
        p.vehicle?.plateNumber.toLowerCase().includes(q) ||
        p.assignee.toLowerCase().includes(q)
      );
    }
    return data;
  }, [enriched, search]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const planned = maintenancePlans.filter(p => p.status === 'planned').length;
  const upcoming = maintenancePlans.filter(p => p.status === 'upcoming').length;
  const inProgress = maintenancePlans.filter(p => p.status === 'in_progress').length;
  const completed = maintenancePlans.filter(p => p.status === 'completed').length;
  const overdue = maintenancePlans.filter(p => p.status === 'overdue').length;

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === pageData.length ? [] : pageData.map(p => p.id));

  // Calendar view: group by month
  const calendarData = useMemo(() => {
    const months: Record<string, typeof enriched> = {};
    enriched.forEach(p => {
      const m = p.dueDate.slice(0, 7);
      if (!months[m]) months[m] = [];
      months[m].push(p);
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  }, [enriched]);

  const thaiMonth = (iso: string) => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const [y, m] = iso.split('-');
    return `${months[parseInt(m) - 1]} ${parseInt(y) + 543}`;
  };

  return (
    <div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} totalCount={filtered.length} selectedCount={selected.length} />}

      <PageHeader title="รายงานแผนการซ่อมบำรุง" subtitle="ติดตามแผนและสถานะการซ่อมบำรุงยานพาหนะ" onExport={() => setShowExport(true)} />

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <KpiCard title="วางแผนแล้ว" value={String(planned)} icon={ClipboardList} color="blue" />
        <KpiCard title="กำลังจะถึง" value={String(upcoming)} icon={Clock} color="orange" />
        <KpiCard title="กำลังดำเนินการ" value={String(inProgress)} icon={TrendingUp} color="blue" />
        <KpiCard title="สำเร็จ" value={String(completed)} icon={CheckCircle} color="green" />
        <KpiCard title="เกินกำหนด" value={String(overdue)} icon={AlertTriangle} color="red" />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
              ${view === 'table' ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Table2 size={14} /> ตาราง
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
              ${view === 'calendar' ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Calendar size={14} /> Timeline
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="space-y-4">
          {calendarData.map(([month, plans]) => (
            <div key={month} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">{thaiMonth(month + '-01')}</h3>
                <span className="text-xs text-slate-500">{plans.length} รายการ</span>
              </div>
              <div className="p-4 space-y-2">
                {plans.map(p => {
                  const s = STATUS_CONFIG[p.status as PlanStatus];
                  return (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text} flex-shrink-0`}>{s.label}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{p.taskName}</p>
                        <p className="text-xs text-slate-500">{p.vehicle?.plateNumber} · {p.vehicle?.brand} {p.vehicle?.model}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500 flex-shrink-0">
                        <p>กำหนด {p.dueDate}</p>
                        <p>{p.assignee}</p>
                      </div>
                      <div className="text-right text-xs font-mono font-medium text-slate-700 flex-shrink-0">
                        ฿{p.estimatedCost.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                  {['ทะเบียนรถ', 'รายการบำรุงรักษา', 'วันที่วางแผน', 'วันที่กำหนด', 'วันที่ดำเนินการ', 'สถานะ', 'ผู้รับผิดชอบ', 'ค่าใช้จ่ายโดยประมาณ', 'ค่าใช้จ่ายจริง'].map(col => (
                    <th key={col} className="px-3 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageData.map(p => {
                  const s = STATUS_CONFIG[p.status as PlanStatus];
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 ${selected.includes(p.id) ? 'bg-[#E3F2FD]' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" className="accent-[#1565C0]"
                          checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-slate-800">{p.vehicle?.plateNumber ?? p.vehicleId}</td>
                      <td className="px-3 py-3 text-xs text-slate-700">{p.taskName}</td>
                      <td className="px-3 py-3 text-xs text-slate-600">{p.plannedDate}</td>
                      <td className="px-3 py-3 text-xs text-slate-600">{p.dueDate}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{p.completedDate ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">{p.assignee}</td>
                      <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">฿{p.estimatedCost.toLocaleString()}</td>
                      <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">{p.actualCost != null ? `฿${p.actualCost.toLocaleString()}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
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
      )}
    </div>
  );
}
