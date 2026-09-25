import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, SlidersHorizontal, Car, TrendingUp, Wrench, AlertTriangle, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KpiCard from '../components/KpiCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import ExportModal from '../components/ExportModal';
import { vehicles, Vehicle, VehicleStatus } from '../data/mockData';

const STATUS_COLORS: Record<VehicleStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'ใช้งาน', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  repairing: { label: 'กำลังซ่อม', bg: 'bg-amber-100', text: 'text-amber-700' },
  inactive: { label: 'ไม่ใช้งาน', bg: 'bg-red-100', text: 'text-red-700' },
  disposed: { label: 'จำหน่ายแล้ว', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const TYPE_LABELS: Record<string, string> = {
  executive: 'รถตำแหน่ง', management: 'รถบริหาร',
  operations: 'รถปฏิบัติงาน', pool: 'รถส่วนกลาง',
};

const DONUT_COLORS = ['#1565C0', '#E65100', '#C62828', '#546E7A'];

const ALL_COLUMNS = ['รหัสรถ', 'ทะเบียนรถ', 'ยี่ห้อ', 'รุ่น', 'ปี', 'สาขา', 'ประเภท', 'สถานะ', 'มูลค่ารถ', 'วันเริ่มใช้งาน'];

const defaultFilter: FilterState = {
  dateRange: 'month', startDate: '', endDate: '',
  branch: [], vehicleStatus: [], vehicleType: [], brand: [], currency: 'THB',
};

export default function VehicleStatusPage() {
  const [filters, setFilters] = useState(defaultFilter);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Vehicle>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS);
  const [showExport, setShowExport] = useState(false);
  const [showColMenu, setShowColMenu] = useState(false);

  const filtered = useMemo(() => {
    let data = vehicles;
    if (filters.branch.length) data = data.filter(v => filters.branch.includes(v.branch));
    if (filters.vehicleStatus.length) data = data.filter(v => filters.vehicleStatus.includes(v.status));
    if (filters.vehicleType.length) data = data.filter(v => filters.vehicleType.includes(v.type));
    if (filters.brand.length) data = data.filter(v => filters.brand.includes(v.brand));
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.branch.toLowerCase().includes(q)
      );
    }
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'th');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filters, search, sortKey, sortDir]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (key: keyof Vehicle) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === pageData.length ? [] : pageData.map(v => v.id));

  const statusPie = [
    { name: 'ใช้งาน', value: vehicles.filter(v => v.status === 'active').length },
    { name: 'กำลังซ่อม', value: vehicles.filter(v => v.status === 'repairing').length },
    { name: 'ไม่ใช้งาน', value: vehicles.filter(v => v.status === 'inactive').length },
    { name: 'จำหน่าย', value: vehicles.filter(v => v.status === 'disposed').length },
  ];

  const branchBar = ['สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาขอนแก่น', 'สาขาภูเก็ต', 'สาขาหาดใหญ่'].map(b => ({
    name: b.replace('สำนักงานใหญ่', 'สนญ.').replace('สาขา', ''),
    count: vehicles.filter(v => v.branch === b).length,
  }));

  const totalValue = vehicles.reduce((s, v) => s + v.value, 0);

  function SortIcon({ col }: { col: keyof Vehicle }) {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-300 opacity-50" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-[#1565C0]" />
      : <ChevronDown size={12} className="text-[#1565C0]" />;
  }

  return (
    <div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} totalCount={filtered.length} selectedCount={selected.length} defaultColumns={visibleCols} />}

      <PageHeader title="รายงานสถานะยานพาหนะ" subtitle="ข้อมูลสถานะและมูลค่ายานพาหนะทั้งหมดในองค์กร" onExport={() => setShowExport(true)} />

      <FilterBar filters={filters} onChange={setFilters} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <KpiCard title="ยานพาหนะทั้งหมด" value={String(vehicles.length)} icon={Car} color="blue" change={5} />
        <KpiCard title="กำลังใช้งาน" value={String(vehicles.filter(v => v.status === 'active').length)} icon={TrendingUp} color="green" />
        <KpiCard title="กำลังซ่อม" value={String(vehicles.filter(v => v.status === 'repairing').length)} icon={Wrench} color="orange" />
        <KpiCard title="ไม่สามารถใช้งาน" value={String(vehicles.filter(v => v.status === 'inactive').length)} icon={AlertTriangle} color="red" />
        <KpiCard title="มูลค่ารวม" value={`฿${(totalValue / 1000000).toFixed(1)}M`} icon={DollarSign} color="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">สัดส่วนตามสถานะ</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {statusPie.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">ยานพาหนะตามสาขา</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={branchBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} name="จำนวนรถ" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="ค้นหา รหัส / ทะเบียน / ยี่ห้อ..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1565C0]"
            />
          </div>
          <div className="text-xs text-slate-500">
            {filtered.length} รายการ
            {selected.length > 0 && <span className="ml-2 text-[#1565C0] font-medium">เลือก {selected.length} รายการ</span>}
          </div>
          <div className="relative ml-auto">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50"
            >
              <SlidersHorizontal size={13} /> Columns
            </button>
            {showColMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-48">
                {ALL_COLUMNS.map(c => (
                  <label key={c} className="flex items-center gap-2 py-1 cursor-pointer text-xs text-slate-700">
                    <input type="checkbox" className="accent-[#1565C0]"
                      checked={visibleCols.includes(c)}
                      onChange={() => setVisibleCols(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                    />
                    {c}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="accent-[#1565C0]"
                    checked={pageData.length > 0 && selected.length === pageData.length}
                    onChange={toggleAll} />
                </th>
                {visibleCols.includes('รหัสรถ') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer" onClick={() => toggleSort('id')}><span className="flex items-center gap-1">รหัสรถ <SortIcon col="id" /></span></th>}
                {visibleCols.includes('ทะเบียนรถ') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer" onClick={() => toggleSort('plateNumber')}><span className="flex items-center gap-1">ทะเบียนรถ <SortIcon col="plateNumber" /></span></th>}
                {visibleCols.includes('ยี่ห้อ') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer" onClick={() => toggleSort('brand')}><span className="flex items-center gap-1">ยี่ห้อ <SortIcon col="brand" /></span></th>}
                {visibleCols.includes('รุ่น') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">รุ่น</th>}
                {visibleCols.includes('ปี') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">ปี</th>}
                {visibleCols.includes('สาขา') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer" onClick={() => toggleSort('branch')}><span className="flex items-center gap-1">สาขา <SortIcon col="branch" /></span></th>}
                {visibleCols.includes('ประเภท') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">ประเภท</th>}
                {visibleCols.includes('สถานะ') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer" onClick={() => toggleSort('status')}><span className="flex items-center gap-1">สถานะ <SortIcon col="status" /></span></th>}
                {visibleCols.includes('มูลค่ารถ') && <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 cursor-pointer" onClick={() => toggleSort('value')}><span className="flex items-center gap-1 justify-end">มูลค่ารถ <SortIcon col="value" /></span></th>}
                {visibleCols.includes('วันเริ่มใช้งาน') && <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">วันเริ่มใช้งาน</th>}
                <th className="px-3 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageData.map(v => {
                const s = STATUS_COLORS[v.status];
                return (
                  <tr key={v.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(v.id) ? 'bg-[#E3F2FD]' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="accent-[#1565C0]"
                        checked={selected.includes(v.id)} onChange={() => toggleSelect(v.id)} />
                    </td>
                    {visibleCols.includes('รหัสรถ') && <td className="px-3 py-3 font-mono text-xs text-slate-600">{v.id}</td>}
                    {visibleCols.includes('ทะเบียนรถ') && <td className="px-3 py-3 text-slate-800 font-medium text-xs">{v.plateNumber}</td>}
                    {visibleCols.includes('ยี่ห้อ') && <td className="px-3 py-3 text-slate-700">{v.brand}</td>}
                    {visibleCols.includes('รุ่น') && <td className="px-3 py-3 text-slate-600">{v.model}</td>}
                    {visibleCols.includes('ปี') && <td className="px-3 py-3 text-slate-600">{v.year}</td>}
                    {visibleCols.includes('สาขา') && <td className="px-3 py-3 text-slate-600 text-xs">{v.branch}</td>}
                    {visibleCols.includes('ประเภท') && <td className="px-3 py-3 text-slate-600 text-xs">{TYPE_LABELS[v.type]}</td>}
                    {visibleCols.includes('สถานะ') && (
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                    )}
                    {visibleCols.includes('มูลค่ารถ') && <td className="px-3 py-3 text-right font-mono text-xs text-slate-700">฿{v.value.toLocaleString()}</td>}
                    {visibleCols.includes('วันเริ่มใช้งาน') && <td className="px-3 py-3 text-xs text-slate-500">{v.startDate}</td>}
                    <td className="px-3 py-3">
                      <button className="p-1.5 hover:bg-[#E3F2FD] rounded-lg text-slate-400 hover:text-[#1565C0] transition-colors">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Total row */}
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={visibleCols.length + 2 - (visibleCols.includes('มูลค่ารถ') ? 1 : 0)} className="px-3 py-2.5 text-xs font-semibold text-slate-600">รวมทั้งหมด</td>
                {visibleCols.includes('มูลค่ารถ') && (
                  <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold text-slate-800">
                    ฿{filtered.reduce((s, v) => s + v.value, 0).toLocaleString()}
                  </td>
                )}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">ไม่พบข้อมูล</p>
            <p className="text-slate-400 text-xs mt-1">ลองปรับเงื่อนไขการค้นหา</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              แสดง {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} จาก {filtered.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-2.5 py-1.5 text-xs border rounded-lg transition-colors
                    ${page === p ? 'bg-[#1565C0] border-[#1565C0] text-white' : 'border-slate-200 hover:bg-slate-50'}`}>
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
