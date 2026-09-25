import { useState, useEffect } from 'react';
import {
  ArrowLeft, Car, Wrench, FileText, Image, History, ClipboardList,
  MapPin, User, Fuel, Settings2, Calendar, Hash, Gauge, DollarSign,
  AlertTriangle, CheckCircle, Clock, Edit2, MoreHorizontal
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { vehicles, repairRecords, maintenancePlans } from '../data/mockData';
import { getVehicleRepairItems, getVehicleDocuments } from '../data/extendedData';

interface Props { vehicleId: string; onBack: () => void; }

type Tab = 'overview' | 'repairs' | 'maintenance' | 'documents' | 'images' | 'history';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Car },
  { id: 'repairs', label: 'ประวัติซ่อม', icon: Wrench },
  { id: 'maintenance', label: 'แผนบำรุง', icon: ClipboardList },
  { id: 'documents', label: 'เอกสาร', icon: FileText },
  { id: 'images', label: 'รูปภาพ', icon: Image },
  { id: 'history', label: 'History', icon: History },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:      { label: 'ใช้งาน',           cls: 'bg-emerald-100 text-emerald-700' },
  repairing:   { label: 'กำลังซ่อม',        cls: 'bg-amber-100 text-amber-700' },
  inactive:    { label: 'ไม่สามารถใช้งาน', cls: 'bg-red-100 text-red-700' },
  disposed:    { label: 'จำหน่ายแล้ว',      cls: 'bg-slate-100 text-slate-500' },
  completed:   { label: 'เสร็จแล้ว',         cls: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'กำลังดำเนินการ',   cls: 'bg-amber-100 text-amber-700' },
  pending:     { label: 'รอดำเนินการ',       cls: 'bg-slate-100 text-slate-600' },
  planned:     { label: 'วางแผน',            cls: 'bg-slate-100 text-slate-600' },
  upcoming:    { label: 'กำลังจะถึง',        cls: 'bg-blue-100 text-blue-700' },
  overdue:     { label: 'เกินกำหนด',         cls: 'bg-red-100 text-red-700' },
  cancelled:   { label: 'ยกเลิก',           cls: 'bg-slate-100 text-slate-400' },
};

function Badge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-slate-400 font-medium">{label}</dt>
      <dd className="text-sm text-slate-800 font-medium">{value ?? '—'}</dd>
    </div>
  );
}

const DOC_STATUS: Record<string, { label: string; cls: string }> = {
  active:         { label: 'ปกติ',         cls: 'bg-emerald-100 text-emerald-700' },
  expiring_soon:  { label: 'ใกล้หมดอายุ', cls: 'bg-amber-100 text-amber-700' },
  expired:        { label: 'หมดอายุ',      cls: 'bg-red-100 text-red-700' },
};

const TYPE_LABELS: Record<string, string> = {
  executive: 'รถตำแหน่ง', management: 'รถบริหาร',
  operations: 'รถปฏิบัติงาน', pool: 'รถส่วนกลาง',
};

const PLACEHOLDER_IMAGES = [
  { label: 'ด้านหน้า', bg: 'from-slate-200 to-slate-300' },
  { label: 'ด้านหลัง', bg: 'from-slate-300 to-slate-400' },
  { label: 'ด้านข้าง', bg: 'from-blue-100 to-blue-200' },
  { label: 'ภายใน',    bg: 'from-slate-200 to-blue-100' },
];

export default function VehicleDetailPage({ vehicleId, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [toast, setToast] = useState({ show: false, message: '' });

  const vehicle   = vehicles.find(v => v.id === vehicleId);
  const repairs   = repairRecords.filter(r => r.vehicleId === vehicleId);
  const plans     = maintenancePlans.filter(p => p.vehicleId === vehicleId);
  const items     = getVehicleRepairItems(vehicleId);
  const docs      = getVehicleDocuments(vehicleId);

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast({ show: false, message: '' }), 3000);
    return () => clearTimeout(t);
  }, [toast.show]);

  if (!vehicle) return (
    <div className="flex items-center justify-center h-64 text-slate-400">ไม่พบข้อมูลยานพาหนะ</div>
  );

  const totalRepairCost = repairs.reduce((s, r) => s + r.total, 0);
  const totalDocCost    = docs.reduce((s, d) => s + d.cost, 0);
  const expiringSoon    = docs.filter(d => d.status === 'expiring_soon' || d.status === 'expired').length;

  const costByMonth = [
    { m: 'ม.ค.', cost: 12000 }, { m: 'ก.พ.', cost: 8000 },  { m: 'มี.ค.', cost: 35000 },
    { m: 'เม.ย.', cost: 5000 }, { m: 'พ.ค.', cost: 22000 }, { m: 'มิ.ย.', cost: 0 },
  ];

  const vStatus = STATUS_MAP[vehicle.status] ?? { label: vehicle.status, cls: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle size={16} /> {toast.message}
        </div>
      )}

      {/* Back nav */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1565C0] transition-colors">
          <ArrowLeft size={15} /> ยานพาหนะ
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-medium">{vehicle.plateNumber}</span>
      </div>

      {/* ═══════════════════════════════════════════════
          LARGE MAIN CARD — vehicle identity + all specs
          ═══════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* Hero strip */}
        <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Vehicle thumbnail */}
          <div className="w-24 h-20 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
            <Car size={36} className="text-white/80" />
          </div>

          {/* Core identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <div>
                <p className="text-white/70 text-xs font-medium mb-1">ทะเบียนรถ</p>
                <p className="text-2xl font-bold text-white tracking-wide">{vehicle.plateNumber}</p>
              </div>
              <span className={`mt-5 text-xs px-2.5 py-1 rounded-full font-semibold ${vStatus.cls}`}>
                {vStatus.label}
              </span>
            </div>
            <p className="text-white/90 text-base font-medium mt-1.5">
              {vehicle.brand} {vehicle.model} · ปี {vehicle.year}
            </p>
            <p className="text-white/60 text-sm mt-0.5">{vehicle.branch} — {TYPE_LABELS[vehicle.type] ?? vehicle.type}</p>
          </div>

          {/* Key metrics */}
          <div className="flex gap-6 sm:text-right">
            {[
              { label: 'เลขไมล์', value: '45,230 กม.' },
              { label: 'มูลค่า', value: `฿${(vehicle.value / 1000000).toFixed(2)}M` },
            ].map(m => (
              <div key={m.label}>
                <p className="text-white/60 text-xs">{m.label}</p>
                <p className="text-white font-bold text-lg">{m.value}</p>
              </div>
            ))}
          </div>

          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0">
            <Edit2 size={16} />
          </button>
        </div>

        {/* Spec grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-5">

            {/* Column 1 — Identification */}
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ข้อมูลรถ</p>
              <InfoRow label="ยี่ห้อ" value={vehicle.brand} />
              <InfoRow label="รุ่น" value={vehicle.model} />
              <InfoRow label="ปีผลิต" value={vehicle.year} />
              <InfoRow label="สี" value={vehicle.color} />
            </div>

            {/* Column 2 — Technical */}
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">เครื่องยนต์</p>
              <InfoRow label="เลขตัวถัง" value="VIN-TH-2021-001" />
              <InfoRow label="เลขเครื่องยนต์" value="ENG-001-2021" />
              <InfoRow label="เชื้อเพลิง" value="ดีเซล" />
              <InfoRow label="เกียร์" value="อัตโนมัติ" />
            </div>

            {/* Column 3 — Specs */}
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">สมรรถนะ</p>
              <InfoRow label="ความจุเครื่อง" value={`${vehicle.engineCC} cc`} />
              <InfoRow label="กำลังเครื่อง" value="150 แรงม้า" />
              <InfoRow label="ที่นั่ง" value="5 ที่นั่ง" />
              <InfoRow label="เลขไมล์เริ่มต้น" value="0 กม." />
            </div>

            {/* Column 4 — Assignment */}
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">การมอบหมาย</p>
              <InfoRow label="สาขา/พื้นที่" value={vehicle.branch} />
              <InfoRow label="แผนก" value={vehicle.department} />
              <InfoRow label="ประเภทการใช้" value={TYPE_LABELS[vehicle.type]} />
              <InfoRow label="ผู้รับผิดชอบ" value="นายสมชาย ใจดี" />
            </div>

            {/* Column 5 — Purchase */}
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">การจัดซื้อ</p>
              <InfoRow label="วันเริ่มใช้งาน" value={vehicle.startDate} />
              <InfoRow label="ราคาซื้อ" value={`฿${vehicle.value.toLocaleString()}`} />
              <InfoRow label="ประเภทการถือครอง" value="ซื้อ" />
              <InfoRow label="ชื่อผู้จดทะเบียน" value="บริษัท วีเอ็มเอส จำกัด" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ TABS SECTION ═══════ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-100 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${tab === id
                  ? 'border-[#1565C0] text-[#1565C0]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Stat strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Wrench,       label: 'จำนวนครั้งซ่อม',   value: String(repairs.length),             color: 'text-[#1565C0]' },
                  { icon: DollarSign,  label: 'ค่าซ่อมรวม',         value: `฿${(totalRepairCost/1000).toFixed(0)}K`, color: 'text-amber-600' },
                  { icon: FileText,    label: 'เอกสารทั้งหมด',     value: String(docs.length),               color: 'text-emerald-600' },
                  { icon: AlertTriangle, label: 'เอกสารใกล้หมดอายุ', value: String(expiringSoon),             color: 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <s.icon size={18} className={`${s.color} mb-2`} />
                    <p className="text-xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">ค่าใช้จ่ายซ่อมบำรุงรายเดือน</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={costByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="cost" fill="#1565C0" radius={[4,4,0,0]} name="ค่าซ่อม" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent repairs */}
              {repairs.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">การซ่อมล่าสุด</p>
                  <div className="divide-y divide-slate-50">
                    {repairs.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm text-slate-800 font-medium truncate max-w-xs">{r.repairItems}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{r.date} · {r.garage}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-800 font-mono">฿{r.total.toLocaleString()}</span>
                          <Badge status={r.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Repairs ── */}
          {tab === 'repairs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">ประวัติซ่อมบำรุง ({repairs.length} รายการ)</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1565C0] text-white text-xs rounded-lg hover:bg-[#0D47A1]">
                  <Wrench size={12} /> + สร้างการซ่อม
                </button>
              </div>
              {repairs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Wrench size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีประวัติซ่อมบำรุง</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {['เลขที่', 'วันที่', 'รายการซ่อม', 'ร้านซ่อม', 'ค่าใช้จ่าย', 'การชำระ', 'สถานะ'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 first:pl-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {repairs.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-mono text-xs text-slate-500 first:pl-0">{r.docNumber}</td>
                          <td className="px-3 py-3 text-xs text-slate-600">{r.date}</td>
                          <td className="px-3 py-3 text-sm text-slate-800 max-w-[200px]">
                            <p className="truncate">{r.repairItems}</p>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">{r.garage}</td>
                          <td className="px-3 py-3 text-sm font-mono font-semibold text-slate-800 text-right">฿{r.total.toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">ชำระแล้ว</span>
                          </td>
                          <td className="px-3 py-3"><Badge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="px-3 py-2.5 text-xs font-semibold text-slate-600 first:pl-0">รวมค่าใช้จ่ายทั้งหมด</td>
                        <td className="px-3 py-2.5 text-sm font-bold text-[#1565C0] font-mono text-right">฿{totalRepairCost.toLocaleString()}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Maintenance Plans ── */}
          {tab === 'maintenance' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">แผนการซ่อมบำรุง ({plans.length} รายการ)</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1565C0] text-white text-xs rounded-lg hover:bg-[#0D47A1]">
                  <ClipboardList size={12} /> + สร้างแผน
                </button>
              </div>
              {plans.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีแผนการซ่อมบำรุง</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map(p => {
                    const s = STATUS_MAP[p.status] ?? { label: p.status, cls: 'bg-slate-100 text-slate-600' };
                    const isOverdue = p.status === 'overdue';
                    return (
                      <div key={p.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{p.taskName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            กำหนด: <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{p.dueDate}</span>
                            {' · '}{p.assignee}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-mono text-slate-700">฿{p.estimatedCost.toLocaleString()}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                          <button
                            onClick={() => setToast({ show: true, message: 'สร้างการซ่อมจากแผนสำเร็จ' })}
                            className="text-xs px-2.5 py-1 rounded-lg border border-[#1565C0] text-[#1565C0] hover:bg-[#E3F2FD] transition-colors">
                            สร้างการซ่อม
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Documents ── */}
          {tab === 'documents' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">เอกสารประจำรถ ({docs.length} รายการ)</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1565C0] text-white text-xs rounded-lg hover:bg-[#0D47A1]">
                  <FileText size={12} /> + เพิ่มเอกสาร
                </button>
              </div>
              {docs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีเอกสาร</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {docs.map(d => {
                    const ref = new Date('2024-10-23');
                    const exp = new Date(d.expiryDate);
                    const days = Math.ceil((exp.getTime() - ref.getTime()) / 86400000);
                    const ds = DOC_STATUS[d.status] ?? { label: d.status, cls: 'bg-slate-100 text-slate-600' };
                    return (
                      <div key={d.id}
                        className={`p-4 rounded-xl border-2 ${d.status === 'expired' ? 'border-red-200 bg-red-50' : d.status === 'expiring_soon' ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-slate-800">{d.docType}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ds.cls}`}>{ds.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mb-1">{d.docNumber}</p>
                        <p className="text-xs text-slate-500">หมดอายุ: <span className="font-medium text-slate-700">{d.expiryDate}</span></p>
                        <p className={`text-xs font-semibold mt-1 ${days < 0 ? 'text-red-600' : days < 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {days < 0 ? `เกินกำหนด ${Math.abs(days)} วัน` : `เหลือ ${days} วัน`}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">฿{d.cost.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Images ── */}
          {tab === 'images' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">รูปภาพยานพาหนะ</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1565C0] text-[#1565C0] text-xs rounded-lg hover:bg-[#E3F2FD]">
                  <Image size={12} /> อัปโหลดรูปภาพ
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {PLACEHOLDER_IMAGES.map(img => (
                  <div key={img.label}
                    className={`aspect-video rounded-xl bg-gradient-to-br ${img.bg} flex flex-col items-center justify-center border border-slate-200 relative group cursor-pointer`}>
                    <Car size={24} className="text-slate-400" />
                    <p className="text-xs text-slate-500 mt-2">{img.label}</p>
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="text-white text-xs bg-white/20 px-2 py-1 rounded-lg">ดู</button>
                      <button className="text-white text-xs bg-red-500/70 px-2 py-1 rounded-lg">ลบ</button>
                    </div>
                  </div>
                ))}
                {/* Upload placeholder */}
                <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1565C0] hover:bg-[#E3F2FD]/30 transition-colors">
                  <Image size={20} className="text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">เพิ่มรูปภาพ</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">เอกสารแนบ</p>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#1565C0] transition-colors cursor-pointer">
                  <FileText size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">ลาก & วางไฟล์ หรือคลิกเพื่ออัปโหลด</p>
                  <p className="text-xs text-slate-400 mt-1">รองรับ PDF, JPG, PNG (สูงสุด 10MB ต่อไฟล์)</p>
                </div>
              </div>
            </div>
          )}

          {/* ── History / Timeline ── */}
          {tab === 'history' && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-4">ประวัติการดำเนินการ</p>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-1">
                  {[
                    { date: '2024-09-01', icon: ClipboardList, color: 'bg-blue-100 text-blue-600',   title: 'สร้างแผนการซ่อมบำรุง', desc: 'เปลี่ยนน้ำมันเครื่อง + กรองอากาศ' },
                    { date: '2024-09-08', icon: Wrench,        color: 'bg-amber-100 text-amber-600', title: 'เริ่มงานซ่อม', desc: 'RP2024003 · อู่กลาง' },
                    { date: '2024-09-10', icon: CheckCircle,   color: 'bg-emerald-100 text-emerald-600', title: 'ซ่อมเสร็จสมบูรณ์', desc: '฿12,800' },
                    { date: '2024-09-15', icon: FileText,      color: 'bg-slate-100 text-slate-600', title: 'ต่ออายุประกันภัย', desc: 'หมดอายุ 2025-09-15' },
                    { date: '2024-10-05', icon: Clock,         color: 'bg-amber-100 text-amber-700', title: 'แผนซ่อมครั้งถัดไป', desc: 'เปลี่ยนผ้าเบรก — กำหนด 2024-11-10' },
                  ].map((e, i) => (
                    <div key={i} className="flex gap-4 pl-1">
                      <div className={`w-8 h-8 rounded-full ${e.color} flex items-center justify-center flex-shrink-0 relative z-10`}>
                        <e.icon size={14} />
                      </div>
                      <div className="pb-6 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{e.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{e.desc}</p>
                          </div>
                          <p className="text-xs text-slate-400 flex-shrink-0 ml-4">{e.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
