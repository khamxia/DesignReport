import { useState, useMemo } from 'react';
import { Search, Calendar, Table2, ChevronDown, ChevronUp, Package, Download } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import ExportModal from '../components/ExportModal';
import { maintenancePlans, vehicles } from '../data/mockData';
import { purchaseOrders } from '../data/extendedData';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

type PlanStatus = 'planned' | 'upcoming' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
type IncludeMode = 'plans-only' | 'plans-and-parts' | 'parts-only';

const STATUS_CONFIG: Record<PlanStatus, { label: string; bg: string; text: string }> = {
  planned:     { label: 'วางแผน',           bg: 'bg-slate-100',   text: 'text-slate-600' },
  upcoming:    { label: 'กำลังจะถึง',       bg: 'bg-blue-100',    text: 'text-blue-700' },
  in_progress: { label: 'กำลังดำเนินการ',  bg: 'bg-amber-100',   text: 'text-amber-700' },
  completed:   { label: 'สำเร็จ',           bg: 'bg-emerald-100', text: 'text-emerald-700' },
  overdue:     { label: 'เกินกำหนด',        bg: 'bg-red-100',     text: 'text-red-700' },
  cancelled:   { label: 'ยกเลิก',           bg: 'bg-slate-100',   text: 'text-slate-400' },
};

const defaultFilter: FilterState = {
  dateRange: 'year', startDate: '', endDate: '',
  branch: [], vehicleStatus: [], vehicleType: [], brand: [], currency: 'THB',
};

const INCLUDE_MODES: { value: IncludeMode; label: string }[] = [
  { value: 'plans-only',      label: 'เฉพาะแผนงาน' },
  { value: 'plans-and-parts', label: 'แผน + อะไหล่ย่อย' },
  { value: 'parts-only',      label: 'เฉพาะอะไหล่ย่อย' },
];

export default function MaintenancePlanPage() {
  const [filters, setFilters] = useState(defaultFilter);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [includeMode, setIncludeMode] = useState<IncludeMode>('plans-and-parts');

  const enriched = useMemo(() => maintenancePlans.map(p => ({
    ...p,
    vehicle: vehicles.find(v => v.id === p.vehicleId),
    linkedPOs: purchaseOrders.filter(po => po.maintenancePlanId === p.id),
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

  const planned    = maintenancePlans.filter(p => p.status === 'planned').length;
  const upcoming   = maintenancePlans.filter(p => p.status === 'upcoming').length;
  const inProgress = maintenancePlans.filter(p => p.status === 'in_progress').length;
  const completed  = maintenancePlans.filter(p => p.status === 'completed').length;
  const overdue    = maintenancePlans.filter(p => p.status === 'overdue').length;

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === pageData.length ? [] : pageData.map(p => p.id));

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
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const [y, m] = iso.split('-');
    return `${months[parseInt(m) - 1]} ${parseInt(y) + 543}`;
  };

  const totalEstimated = filtered.reduce((s, p) => s + p.estimatedCost, 0);
  const totalActual    = filtered.reduce((s, p) => s + (p.actualCost ?? 0), 0);
  const totalPOItems   = filtered.reduce((s, p) => s + p.linkedPOs.reduce((ss, po) => ss + po.items.length, 0), 0);

  return (
    <div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} totalCount={filtered.length} selectedCount={selected.length} />}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายงานแผนการซ่อมบำรุง</h1>
          <p className="text-sm text-slate-500 mt-0.5">ติดตามแผน สถานะ และอะไหล่ย่อยที่เกี่ยวข้อง</p>
        </div>
        <button onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
          <Download size={14} /> Export
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <KpiCard title="วางแผนแล้ว"     value={String(planned)}    icon={ClipboardList} color="blue" />
        <KpiCard title="กำลังจะถึง"     value={String(upcoming)}   icon={Clock}         color="orange" />
        <KpiCard title="กำลังดำเนินการ" value={String(inProgress)} icon={TrendingUp}    color="blue" />
        <KpiCard title="สำเร็จ"          value={String(completed)}  icon={CheckCircle}   color="green" />
        <KpiCard title="เกินกำหนด"       value={String(overdue)}    icon={AlertTriangle} color="red" />
      </div>

      {/* Cost summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'ค่าประมาณรวม', value: `฿${totalEstimated.toLocaleString()}`, cls: 'text-[#1565C0]' },
          { label: 'ค่าใช้จ่ายจริง', value: `฿${totalActual.toLocaleString()}`, cls: 'text-emerald-600' },
          { label: 'รายการอะไหล่ (PO)', value: `${totalPOItems} รายการ`, cls: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-lg font-bold font-mono mt-0.5 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* View toggle + Include mode */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
          <button onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'table' ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Table2 size={14} /> ตาราง
          </button>
          <button onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'calendar' ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calendar size={14} /> Timeline
          </button>
        </div>

        {view === 'table' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">แสดง:</span>
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
                  const hasPartsData = p.linkedPOs.length > 0;
                  return (
                    <div key={p.id} className="border border-slate-100 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-4 p-3 hover:bg-slate-50">
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
                        {hasPartsData && (
                          <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                            className="text-slate-400 hover:text-slate-600">
                            {expanded === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                      {expanded === p.id && (
                        <div className="border-t border-slate-100 bg-slate-50 px-5 pb-4 pt-3">
                          {p.linkedPOs.map(po => (
                            <div key={po.id} className="mb-3">
                              <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                                <Package size={11} /> {po.orderNumber} · {po.supplier}
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">{po.items.length} รายการ</span>
                              </p>
                              <div className="space-y-0.5">
                                {po.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                                    <span className="text-slate-700">{item.name} × {item.quantity} {item.unit}</span>
                                    <span className="font-mono text-slate-600">฿{item.estimatedPrice.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
            <span className="text-xs text-slate-500 ml-auto">{filtered.length} รายการ</span>
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
                  {['ทะเบียนรถ','รายการบำรุงรักษา','วันที่วางแผน','วันที่กำหนด','วันที่ดำเนินการ','สถานะ','ผู้รับผิดชอบ','ค่าประมาณ','ค่าจริง','อะไหล่ (PO)',''].map(col => (
                    <th key={col} className="px-3 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageData.map(p => {
                  const s = STATUS_CONFIG[p.status as PlanStatus];
                  const hasPartsData = p.linkedPOs.length > 0 && includeMode !== 'plans-only';
                  const poItemCount = p.linkedPOs.reduce((s, po) => s + po.items.length, 0);
                  return (
                    <>
                      <tr key={p.id} className={`hover:bg-slate-50 ${selected.includes(p.id) ? 'bg-[#E3F2FD]' : ''}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" className="accent-[#1565C0]"
                            checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                        </td>
                        <td className="px-3 py-3 text-xs font-mono font-semibold text-slate-800">{p.vehicle?.plateNumber ?? p.vehicleId}</td>
                        <td className="px-3 py-3 text-xs text-slate-700 max-w-[180px]">
                          <p className="truncate">{p.taskName}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{p.plannedDate}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{p.dueDate}</td>
                        <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{p.completedDate ?? '—'}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">{p.assignee}</td>
                        <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">฿{p.estimatedCost.toLocaleString()}</td>
                        <td className="px-3 py-3 text-xs text-right font-mono text-slate-700">{p.actualCost != null ? `฿${p.actualCost.toLocaleString()}` : '—'}</td>
                        <td className="px-3 py-3">
                          {poItemCount > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{poItemCount}</span>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                        <td className="px-3 py-3">
                          {hasPartsData && (
                            <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                              className="text-slate-400 hover:text-slate-600">
                              {expanded === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {/* Expandable parts from linked POs */}
                      {expanded === p.id && hasPartsData && (
                        <tr key={`${p.id}-x`}>
                          <td colSpan={12} className="bg-slate-50 px-6 pb-4 pt-0">
                            {p.linkedPOs.map(po => (
                              <div key={po.id} className="mt-3">
                                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                                  <Package size={11} className="text-amber-500" />
                                  {po.orderNumber} · {po.supplier}
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                                    {po.status}
                                  </span>
                                  <span className="ml-auto font-mono text-slate-600">฿{po.totalAmount.toLocaleString()}</span>
                                </p>
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
                                        <td className="py-1 text-right font-mono">฿{item.estimatedPrice.toLocaleString()}</td>
                                        <td className="py-1 text-right font-mono">{item.actualPrice != null ? `฿${item.actualPrice.toLocaleString()}` : '—'}</td>
                                        <td className="py-1 text-right font-mono text-slate-600">{item.receivedQty ?? 0}/{item.quantity}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
              {/* Footer total */}
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={8} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวม ({filtered.length} รายการ)</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-[#1565C0]">฿{totalEstimated.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">฿{totalActual.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">แสดง {(page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} จาก {filtered.length}</p>
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
