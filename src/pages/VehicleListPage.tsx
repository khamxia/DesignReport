import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, X, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { vehicles } from '../data/mockData';
import type { VehicleType, VehicleStatus } from '../data/mockData';

interface Props {
  onViewDetail: (vehicleId: string) => void;
}

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  repairing: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-600',
  disposed: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'ใช้งาน', repairing: 'กำลังซ่อม', inactive: 'ไม่ใช้งาน', disposed: 'จำหน่ายแล้ว',
};
const TYPE_BADGE: Record<string, string> = {
  executive: 'bg-purple-100 text-purple-700',
  management: 'bg-blue-100 text-blue-700',
  operations: 'bg-amber-100 text-amber-700',
  pool: 'bg-slate-100 text-slate-600',
};
const TYPE_LABEL: Record<VehicleType, string> = {
  executive: 'รถตำแหน่ง', management: 'รถบริหาร', operations: 'รถปฏิบัติงาน', pool: 'รถส่วนกลาง',
};
const TYPE_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'executive', label: 'รถตำแหน่ง' },
  { key: 'management', label: 'รถบริหาร' },
  { key: 'operations', label: 'รถปฏิบัติงาน' },
  { key: 'pool', label: 'รถส่วนกลาง' },
];

const FUEL_TYPES: Record<string, string> = {
  VH001: 'ดีเซล', VH002: 'เบนซิน', VH003: 'ดีเซล', VH004: 'ดีเซล', VH005: 'ดีเซล',
  VH006: 'เบนซิน', VH007: 'ดีเซล', VH008: 'ดีเซล', VH009: 'ดีเซล', VH010: 'เบนซิน',
  VH011: 'เบนซิน', VH012: 'เบนซิน', VH013: 'ไฮบริด', VH014: 'ดีเซล', VH015: 'ดีเซล',
  VH016: 'ดีเซล', VH017: 'ดีเซล', VH018: 'เบนซิน', VH019: 'ดีเซล', VH020: 'ดีเซล',
  VH021: 'ดีเซล', VH022: 'เบนซิน', VH023: 'ดีเซล', VH024: 'ไฮบริด', VH025: 'เบนซิน',
  VH026: 'ดีเซล', VH027: 'ดีเซล', VH028: 'ดีเซล', VH029: 'เบนซิน', VH030: 'เบนซิน',
  VH031: 'ดีเซล', VH032: 'ดีเซล', VH033: 'เบนซิน', VH034: 'ไฮบริด', VH035: 'เบนซิน',
};
const TRANSMISSION: Record<string, string> = {
  VH001: 'อัตโนมัติ', VH002: 'อัตโนมัติ', VH003: 'ธรรมดา', VH004: 'ธรรมดา', VH005: 'ธรรมดา',
  VH006: 'อัตโนมัติ', VH007: 'ธรรมดา', VH008: 'อัตโนมัติ', VH009: 'อัตโนมัติ', VH010: 'อัตโนมัติ',
  VH011: 'อัตโนมัติ', VH012: 'อัตโนมัติ', VH013: 'อัตโนมัติ', VH014: 'ธรรมดา', VH015: 'ธรรมดา',
  VH016: 'อัตโนมัติ', VH017: 'อัตโนมัติ', VH018: 'อัตโนมัติ', VH019: 'ธรรมดา', VH020: 'ธรรมดา',
  VH021: 'อัตโนมัติ', VH022: 'อัตโนมัติ', VH023: 'ธรรมดา', VH024: 'อัตโนมัติ', VH025: 'อัตโนมัติ',
  VH026: 'ธรรมดา', VH027: 'อัตโนมัติ', VH028: 'อัตโนมัติ', VH029: 'อัตโนมัติ', VH030: 'ธรรมดา',
  VH031: 'ธรรมดา', VH032: 'ธรรมดา', VH033: 'อัตโนมัติ', VH034: 'อัตโนมัติ', VH035: 'อัตโนมัติ',
};

const BRANCHES = ['ทั้งหมด', 'สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาขอนแก่น', 'สาขาภูเก็ต', 'สาขาหาดใหญ่'];

interface AddVehicleForm {
  plateNumber: string; brand: string; model: string; year: string;
  branch: string; type: string; chassisNumber: string; engineNumber: string;
  fuelType: string; transmissionType: string; seatCapacity: string;
  engineCC: string; ownershipType: string; purchasePrice: string;
  purchaseDate: string; assignedUser: string;
}

const emptyForm: AddVehicleForm = {
  plateNumber: '', brand: '', model: '', year: '', branch: '', type: '',
  chassisNumber: '', engineNumber: '', fuelType: '', transmissionType: '',
  seatCapacity: '', engineCC: '', ownershipType: '', purchasePrice: '',
  purchaseDate: '', assignedUser: '',
};

export default function VehicleListPage({ onViewDetail }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('ทั้งหมด');
  const [typeTab, setTypeTab] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddVehicleForm>(emptyForm);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, message: '' }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !q || v.plateNumber.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchBranch = branchFilter === 'ทั้งหมด' || v.branch === branchFilter;
      const matchType = typeTab === 'all' || v.type === typeTab;
      return matchSearch && matchStatus && matchBranch && matchType;
    });
  }, [search, statusFilter, branchFilter, typeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleStatus = (v: string) => { setStatusFilter(v); setPage(1); };
  const handleBranch = (v: string) => { setBranchFilter(v); setPage(1); };
  const handleTypeTab = (v: string) => { setTypeTab(v); setPage(1); };

  const handleSubmit = () => {
    setShowModal(false);
    setForm(emptyForm);
    setToast({ show: true, message: 'เพิ่มยานพาหนะสำเร็จ' });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายการยานพาหนะ</h1>
          <p className="text-sm text-slate-500 mt-0.5">จัดการและติดตามยานพาหนะทั้งหมดในองค์กร</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">
          <Plus size={16} />เพิ่มยานพาหนะ
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_TABS.map(t => (
          <button key={t.key} onClick={() => handleTypeTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${typeTab === t.key ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="ค้นหาทะเบียน ยี่ห้อ รุ่น รหัส..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => handleStatus(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
            <option value="all">สถานะทั้งหมด</option>
            <option value="active">ใช้งาน</option>
            <option value="repairing">กำลังซ่อม</option>
            <option value="inactive">ไม่ใช้งาน</option>
            <option value="disposed">จำหน่ายแล้ว</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={branchFilter} onChange={e => handleBranch(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['รหัสรถ', 'ทะเบียนรถ', 'ยี่ห้อ', 'รุ่น', 'ปี', 'ประเภทเชื้อเพลิง', 'ประเภทการส่ง', 'สาขา', 'ประเภทการใช้งาน', 'สถานะ', 'มูลค่า', 'การดำเนินการ'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono text-xs text-slate-500">{v.id}</td>
                  <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">{v.plateNumber}</td>
                  <td className="py-3 px-3 text-slate-700">{v.brand}</td>
                  <td className="py-3 px-3 text-slate-700">{v.model}</td>
                  <td className="py-3 px-3 text-slate-600">{v.year}</td>
                  <td className="py-3 px-3 text-slate-600">{FUEL_TYPES[v.id] || 'ดีเซล'}</td>
                  <td className="py-3 px-3 text-slate-600">{TRANSMISSION[v.id] || 'อัตโนมัติ'}</td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{v.branch}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TYPE_BADGE[v.type] || 'bg-slate-100 text-slate-600'}`}>{TYPE_LABEL[v.type] || v.type}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[v.status] || 'bg-slate-100 text-slate-600'}`}>{STATUS_LABEL[v.status] || v.status}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">฿{v.value.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button onClick={() => onViewDetail(v.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="ดูรายละเอียด">
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="แก้ไข">
                        <Pencil size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="ลบ">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={12} className="py-12 text-center text-slate-400">ไม่พบข้อมูลยานพาหนะ</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">แสดง {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">ก่อนหน้า</button>
            <span className="px-3 py-1 text-sm text-slate-600">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">ถัดไป</button>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">เพิ่มยานพาหนะใหม่</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">ข้อมูลพื้นฐาน</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'ทะเบียนรถ', key: 'plateNumber', placeholder: 'เช่น กข-1234 กรุงเทพ' },
                    { label: 'ยี่ห้อ', key: 'brand', placeholder: 'เช่น Toyota' },
                    { label: 'รุ่น', key: 'model', placeholder: 'เช่น Fortuner' },
                    { label: 'ปี', key: 'year', placeholder: 'เช่น 2022' },
                    { label: 'เลขตัวถัง (Chassis)', key: 'chassisNumber', placeholder: 'เลขตัวถัง' },
                    { label: 'เลขเครื่องยนต์', key: 'engineNumber', placeholder: 'เลขเครื่องยนต์' },
                    { label: 'ความจุเครื่องยนต์ (cc)', key: 'engineCC', placeholder: 'เช่น 2400' },
                    { label: 'ที่นั่ง (คน)', key: 'seatCapacity', placeholder: 'เช่น 5' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                      <input
                        value={form[key as keyof AddVehicleForm]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">ข้อมูลยานพาหนะ</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สาขา</label>
                    <div className="relative">
                      <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                        <option value="">เลือกสาขา</option>
                        {BRANCHES.filter(b => b !== 'ทั้งหมด').map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทการใช้งาน</label>
                    <div className="relative">
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                        <option value="">เลือกประเภท</option>
                        <option value="executive">รถตำแหน่ง</option>
                        <option value="management">รถบริหาร</option>
                        <option value="operations">รถปฏิบัติงาน</option>
                        <option value="pool">รถส่วนกลาง</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทเชื้อเพลิง</label>
                    <div className="relative">
                      <select value={form.fuelType} onChange={e => setForm(f => ({ ...f, fuelType: e.target.value }))} className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                        <option value="">เลือกประเภทเชื้อเพลิง</option>
                        <option value="ดีเซล">ดีเซล</option>
                        <option value="เบนซิน">เบนซิน</option>
                        <option value="ไฮบริด">ไฮบริด</option>
                        <option value="EV">EV</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทการส่ง</label>
                    <div className="relative">
                      <select value={form.transmissionType} onChange={e => setForm(f => ({ ...f, transmissionType: e.target.value }))} className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                        <option value="">เลือกประเภทการส่ง</option>
                        <option value="อัตโนมัติ">อัตโนมัติ</option>
                        <option value="ธรรมดา">ธรรมดา</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทการถือครอง</label>
                    <div className="relative">
                      <select value={form.ownershipType} onChange={e => setForm(f => ({ ...f, ownershipType: e.target.value }))} className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                        <option value="">เลือกประเภท</option>
                        <option value="ซื้อ">ซื้อ</option>
                        <option value="เช่า">เช่า</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับผิดชอบ</label>
                    <input value={form.assignedUser} onChange={e => setForm(f => ({ ...f, assignedUser: e.target.value }))} placeholder="ชื่อผู้รับผิดชอบ" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ราคาซื้อ (฿)</label>
                    <input value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} placeholder="ราคาซื้อ" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ซื้อ</label>
                    <input value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">ยกเลิก</button>
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg text-sm text-white font-medium bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast.message}
        </div>
      )}
    </div>
  );
}
