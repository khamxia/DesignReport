import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Car, Wrench, FileText, Package, AlertTriangle, Clock, CheckCircle, Bell } from 'lucide-react';
import { vehicles, repairRecords, maintenancePlans } from '../data/mockData';
import { vehicleDocuments, purchaseOrders, notifications } from '../data/extendedData';

const monthlyData = [
  { month: 'ม.ค.', cost: 45000 }, { month: 'ก.พ.', cost: 62000 }, { month: 'มี.ค.', cost: 78000 },
  { month: 'เม.ย.', cost: 55000 }, { month: 'พ.ค.', cost: 89000 }, { month: 'มิ.ย.', cost: 67000 },
  { month: 'ก.ค.', cost: 91000 }, { month: 'ส.ค.', cost: 74000 }, { month: 'ก.ย.', cost: 103000 },
  { month: 'ต.ค.', cost: 58000 },
];

const PIE_COLORS: Record<string, string> = {
  planned: '#94A3B8', upcoming: '#F59E0B', in_progress: '#3B82F6',
  completed: '#22C55E', overdue: '#EF4444', cancelled: '#9CA3AF',
};

const STATUS_LABELS: Record<string, string> = {
  planned: 'วางแผน', upcoming: 'ใกล้ถึง', in_progress: 'กำลังดำเนิน',
  completed: 'เสร็จสิ้น', overdue: 'เกินกำหนด', cancelled: 'ยกเลิก',
};

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'active').length;
    const repairing = vehicles.filter(v => v.status === 'repairing').length;
    const totalRepairCost = repairRecords.reduce((s, r) => s + r.total, 0);
    const nearDue = maintenancePlans.filter(p => p.status === 'upcoming' || p.status === 'overdue').length;
    const expiredDocs = vehicleDocuments.filter(d => d.status === 'expired').length;
    const pendingOrders = purchaseOrders.filter(o => o.status === 'ordered' || o.status === 'partially_received').length;
    return { total, active, repairing, totalRepairCost, nearDue, expiredDocs, pendingOrders };
  }, []);

  const recentRepairs = useMemo(() => [...repairRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), []);
  const expiringDocs = useMemo(() => vehicleDocuments.filter(d => d.status !== 'active').slice(0, 5), []);

  const maintenanceAlerts = useMemo(() => notifications.filter(n => n.category === 'maintenance').slice(0, 4), []);
  const documentAlerts = useMemo(() => notifications.filter(n => n.category === 'document').slice(0, 4), []);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    maintenancePlans.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({ name: STATUS_LABELS[status] || status, value, status }));
  }, []);

  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), []);

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      critical: 'bg-red-100 text-red-700', warning: 'bg-orange-100 text-orange-700', info: 'bg-blue-100 text-blue-700',
    };
    return map[type] || 'bg-slate-100 text-slate-600';
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', pending: 'bg-amber-100 text-amber-700',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { completed: 'เสร็จสิ้น', in_progress: 'กำลังซ่อม', pending: 'รอดำเนินการ' };
    return map[status] || status;
  };

  const docStatusBadge = (status: string) => {
    const map: Record<string, string> = { active: 'bg-green-100 text-green-700', expiring_soon: 'bg-orange-100 text-orange-700', expired: 'bg-red-100 text-red-700' };
    return map[status] || 'bg-slate-100 text-slate-600';
  };

  const docStatusLabel = (status: string) => {
    const map: Record<string, string> = { active: 'ปกติ', expiring_soon: 'ใกล้หมด', expired: 'หมดอายุ' };
    return map[status] || status;
  };

  const daysDiff = (dateStr: string) => {
    const ref = new Date('2024-10-23');
    const d = new Date(dateStr);
    return Math.round((d.getTime() - ref.getTime()) / 86400000);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard ภาพรวมระบบ</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Car size={22} className="text-blue-600" />} label="ยานพาหนะทั้งหมด" value={stats.total} color="bg-blue-50" />
        <KpiCard icon={<CheckCircle size={22} className="text-green-600" />} label="รถใช้งาน" value={stats.active} color="bg-green-50" />
        <KpiCard icon={<Wrench size={22} className="text-orange-600" />} label="รถกำลังซ่อม" value={stats.repairing} color="bg-orange-50" />
        <KpiCard icon={<Wrench size={22} className="text-indigo-600" />} label="ค่าซ่อมบำรุงรวม" value={`฿${stats.totalRepairCost.toLocaleString()}`} color="bg-indigo-50" />
        <KpiCard icon={<FileText size={22} className="text-purple-600" />} label="ค่าเอกสารรวม" value={`฿${vehicleDocuments.reduce((s, d) => s + d.cost, 0).toLocaleString()}`} color="bg-purple-50" />
        <KpiCard icon={<Clock size={22} className="text-amber-600" />} label="งานซ่อมใกล้กำหนด" value={stats.nearDue} color="bg-amber-50" />
        <KpiCard icon={<AlertTriangle size={22} className="text-red-600" />} label="เอกสารหมดอายุ" value={stats.expiredDocs} color="bg-red-50" />
        <KpiCard icon={<Package size={22} className="text-cyan-600" />} label="Order รอรับ" value={stats.pendingOrders} color="bg-cyan-50" />
      </div>

      {/* Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Wrench size={18} className="text-orange-500" />แจ้งเตือนการบำรุงรักษา</h2>
          <div className="space-y-2">
            {maintenanceAlerts.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeBadge(n.type)}`}>{n.type === 'critical' ? 'วิกฤต' : n.type === 'warning' ? 'เตือน' : 'ข้อมูล'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
            {maintenanceAlerts.length === 0 && <p className="text-sm text-slate-400">ไม่มีการแจ้งเตือน</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><FileText size={18} className="text-red-500" />แจ้งเตือนเอกสาร</h2>
          <div className="space-y-2">
            {documentAlerts.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeBadge(n.type)}`}>{n.type === 'critical' ? 'วิกฤต' : n.type === 'warning' ? 'เตือน' : 'ข้อมูล'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
            {documentAlerts.length === 0 && <p className="text-sm text-slate-400">ไม่มีการแจ้งเตือน</p>}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">ค่าซ่อมบำรุงรายเดือน (บาท)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => `฿${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [`฿${Number(v).toLocaleString()}`, 'ค่าซ่อม']} />
              <Area type="monotone" dataKey="cost" stroke="#1565C0" strokeWidth={2} fill="url(#costGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">สถานะแผนบำรุงรักษา</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.status} fill={PIE_COLORS[entry.status] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [Number(v), String(name)]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Repairs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">การซ่อมบำรุงล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['รถ', 'ทะเบียน', 'หัวข้อ', 'วันที่', 'ค่าใช้จ่าย', 'สถานะ'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRepairs.map(r => {
                const v = vehicleMap[r.vehicleId];
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-700">{v ? `${v.brand} ${v.model}` : r.vehicleId}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{v?.plateNumber || '-'}</td>
                    <td className="py-2 px-3 text-slate-600">{r.repairItems}</td>
                    <td className="py-2 px-3 text-slate-600">{r.date}</td>
                    <td className="py-2 px-3 text-slate-800">฿{r.total.toLocaleString()}</td>
                    <td className="py-2 px-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(r.status)}`}>{statusLabel(r.status)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expiring Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">เอกสารที่ต้องดำเนินการ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['รถ', 'ประเภท', 'วันหมดอายุ', 'วันเหลือ', 'สถานะ'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expiringDocs.map(d => {
                const v = vehicleMap[d.vehicleId];
                const days = daysDiff(d.expiryDate);
                return (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-700">{v?.plateNumber || d.vehicleId}</td>
                    <td className="py-2 px-3 text-slate-600">{d.docType}</td>
                    <td className="py-2 px-3 text-slate-600">{d.expiryDate}</td>
                    <td className={`py-2 px-3 font-medium ${days < 0 ? 'text-red-600' : days < 30 ? 'text-orange-500' : 'text-slate-700'}`}>{days < 0 ? `เกิน ${Math.abs(days)} วัน` : `${days} วัน`}</td>
                    <td className="py-2 px-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${docStatusBadge(d.status)}`}>{docStatusLabel(d.status)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
