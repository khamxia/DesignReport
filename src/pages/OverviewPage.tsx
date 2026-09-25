import { useState } from 'react';
import { Car, Wrench, AlertTriangle, DollarSign, TrendingUp, FileText, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import KpiCard from '../components/KpiCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import ExportModal from '../components/ExportModal';
import { vehicles, repairRecords, documentExpenses, monthlyRepairCosts, monthlyDocCosts } from '../data/mockData';

const COLORS = ['#1565C0', '#2E7D32', '#E65100', '#546E7A'];

const defaultFilter: FilterState = {
  dateRange: 'month', startDate: '', endDate: '',
  branch: [], vehicleStatus: [], vehicleType: [], brand: [], currency: 'THB',
};

export default function OverviewPage() {
  const [filters, setFilters] = useState(defaultFilter);
  const [showExport, setShowExport] = useState(false);

  const totalVehicles = vehicles.length;
  const active = vehicles.filter(v => v.status === 'active').length;
  const repairing = vehicles.filter(v => v.status === 'repairing').length;
  const inactive = vehicles.filter(v => v.status === 'inactive').length;
  const totalRepairCost = repairRecords.reduce((s, r) => s + r.total, 0);
  const totalDocCost = documentExpenses.reduce((s, d) => s + d.amount, 0);
  const totalCost = totalRepairCost + totalDocCost;

  const fmt = (n: number) => n >= 1000000
    ? `${(n / 1000000).toFixed(2)}M`
    : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toLocaleString();

  const fmtCurrency = (n: number) => `${filters.currency === 'USD' ? '$' : '฿'}${fmt(n)}`;

  const statusPie = [
    { name: 'ใช้งาน', value: active },
    { name: 'กำลังซ่อม', value: repairing },
    { name: 'ไม่ใช้งาน', value: inactive },
    { name: 'จำหน่ายแล้ว', value: vehicles.filter(v => v.status === 'disposed').length },
  ];

  const branchData = ['สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาขอนแก่น', 'สาขาภูเก็ต', 'สาขาหาดใหญ่'].map(b => ({
    name: b.replace('สาขา', '').replace('สำนักงานใหญ่', 'สนญ.'),
    count: vehicles.filter(v => v.branch === b).length,
  }));

  const combinedCosts = monthlyRepairCosts.map((r, i) => ({
    month: r.month,
    ซ่อมบำรุง: r.cost,
    เอกสาร: monthlyDocCosts[i]?.cost ?? 0,
  }));

  const brandData = ['Toyota', 'Isuzu', 'Ford', 'Mitsubishi', 'Honda'].map(b => ({
    name: b,
    count: vehicles.filter(v => v.brand === b).length,
  }));

  return (
    <div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} totalCount={totalVehicles} />}

      <PageHeader
        title="ศูนย์รายงาน"
        subtitle="วิเคราะห์ข้อมูลยานพาหนะ ค่าใช้จ่าย และการซ่อมบำรุงขององค์กร"
        onExport={() => setShowExport(true)}
      />

      <FilterBar filters={filters} onChange={setFilters} />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
        <KpiCard title="ยานพาหนะทั้งหมด" value={String(totalVehicles)} icon={Car} color="blue" change={5} changeLabel="vs เดือนก่อน" />
        <KpiCard title="กำลังใช้งาน" value={String(active)} icon={TrendingUp} color="green" change={2} />
        <KpiCard title="กำลังซ่อมบำรุง" value={String(repairing)} icon={Wrench} color="orange" change={-1} />
        <KpiCard title="ไม่สามารถใช้งาน" value={String(inactive)} icon={AlertTriangle} color="red" change={0} />
        <KpiCard title="ค่าซ่อมบำรุง" value={fmtCurrency(totalRepairCost)} icon={Wrench} color="orange" change={12} subtitle="รวมทั้งปี" />
        <KpiCard title="ค่าใช้จ่ายเอกสาร" value={fmtCurrency(totalDocCost)} icon={FileText} color="blue" change={-3} subtitle="รวมทั้งปี" />
        <KpiCard title="ค่าใช้จ่ายรวม" value={fmtCurrency(totalCost)} icon={DollarSign} color="gray" change={8} subtitle="รวมทั้งปี" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">ค่าใช้จ่ายรายเดือน</h3>
              <p className="text-xs text-slate-500">ค่าซ่อมบำรุงและค่าเอกสาร</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={combinedCosts}>
              <defs>
                <linearGradient id="repairGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="ซ่อมบำรุง" stroke="#1565C0" strokeWidth={2}
                fill="url(#repairGrad)" dot={false} />
              <Area type="monotone" dataKey="เอกสาร" stroke="#2E7D32" strokeWidth={2}
                fill="url(#docGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">สถานะยานพาหนะ</h3>
          <p className="text-xs text-slate-500 mb-3">การกระจายตามสถานะ</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {statusPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">ยานพาหนะตามสาขา</h3>
          <p className="text-xs text-slate-500 mb-3">จำนวนรถแต่ละสาขา</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={branchData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" fill="#1565C0" radius={[0, 4, 4, 0]} name="จำนวนรถ" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">ยานพาหนะตามยี่ห้อ</h3>
          <p className="text-xs text-slate-500 mb-3">จำนวนรถแต่ละยี่ห้อ</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" fill="#1976D2" radius={[4, 4, 0, 0]} name="จำนวนรถ" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
