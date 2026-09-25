import { useState, useMemo, useEffect } from 'react';
import { vehicles, Vehicle } from '../data/mockData';
import { vehicleDocuments, VehicleDocument } from '../data/extendedData';
import {
  Eye, Pencil, RefreshCw, Trash2, X, Plus, Download,
  FileText, ChevronLeft, ChevronRight, Upload, CheckCircle2
} from 'lucide-react';

const REFERENCE_DATE = '2024-10-23';

function daysRemaining(expiryDate: string): number {
  return Math.floor(
    (new Date(expiryDate).getTime() - new Date(REFERENCE_DATE).getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

function formatDate(d: string) {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(s: string) {
  if (s === 'active') return 'ปกติ';
  if (s === 'expiring_soon') return 'ใกล้หมดอายุ';
  if (s === 'expired') return 'หมดอายุ';
  return s;
}

function statusBadge(s: string) {
  if (s === 'active') return 'bg-emerald-100 text-emerald-700';
  if (s === 'expiring_soon') return 'bg-amber-100 text-amber-700';
  if (s === 'expired') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
}

function DaysCell({ days }: { days: number }) {
  if (days < 0) return <span className="text-red-600 font-medium text-xs">หมดอายุแล้ว</span>;
  if (days <= 30) return <span className="text-amber-600 font-medium text-xs">{days} วัน</span>;
  return <span className="text-emerald-600 font-medium text-xs">{days} วัน</span>;
}

// ───── Toast ─────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
      <CheckCircle2 size={16} />
      {message}
    </div>
  );
}

// ───── Document Detail Drawer ─────────────────────────────
function DocumentDetailDrawer({
  doc,
  onClose,
  onRenew,
  onEdit,
  onDelete,
}: {
  doc: VehicleDocument | null;
  onClose: () => void;
  onRenew: (doc: VehicleDocument) => void;
  onEdit?: (doc: VehicleDocument) => void;
  onDelete?: (doc: VehicleDocument) => void;
}) {
  if (!doc) return null;
  const vehicle = vehicles.find((v) => v.id === doc.vehicleId);
  const days = daysRemaining(doc.expiryDate);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl w-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-lg font-bold text-slate-800">{doc.docType}</div>
            <div className="text-sm text-slate-500 font-mono mt-0.5">{vehicle?.plateNumber ?? '-'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRenew(doc)}
              className="flex items-center gap-1.5 text-xs bg-[#1565C0] text-white px-3 py-2 rounded-lg hover:bg-[#0D47A1] transition-colors"
            >
              <RefreshCw size={13} /> ต่ออายุ
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(doc)}
                className="flex items-center gap-1.5 text-xs border border-[#1565C0] text-[#1565C0] px-3 py-2 rounded-lg hover:bg-[#E3F2FD] transition-colors"
              >
                <Pencil size={13} /> แก้ไข
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(doc)}
                className="flex items-center gap-1.5 text-xs border border-red-300 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> ลบ
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors ml-1">
              <X size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Info grid */}
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-3">ข้อมูลเอกสาร</div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['ทะเบียนรถ', <span className="font-mono">{vehicle?.plateNumber ?? '-'}</span>],
                ['ยี่ห้อ/รุ่น', `${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`],
                ['ประเภทเอกสาร', doc.docType],
                ['เลขที่เอกสาร', doc.docNumber || '-'],
                ['ประเทศ', doc.country ?? '-'],
                ['วันเริ่ม', formatDate(doc.startDate)],
                ['วันหมดอายุ', formatDate(doc.expiryDate)],
                ['เหลือ', <DaysCell days={days} />],
                ['ค่าใช้จ่าย', doc.cost.toLocaleString()],
                ['สกุลเงิน', doc.currency],
                ['สถานะ', <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(doc.status)}`}>{statusLabel(doc.status)}</span>],
                ['หมายเหตุ', doc.notes ?? '-'],
              ].map(([label, value], i) => (
                <div key={i}>
                  <div className="text-xs text-slate-500 mb-0.5">{label as string}</div>
                  <div className="text-sm text-slate-800">{value as React.ReactNode}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Renewal history */}
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-3">ประวัติการต่ออายุ</div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {['เวอร์ชัน', 'วันต่ออายุ', 'วันหมดอายุเดิม', 'วันหมดอายุใหม่', 'ค่าใช้จ่าย', 'ผู้ดำเนินการ'].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-slate-700">v1</td>
                    <td className="px-3 py-2.5 text-slate-700">01/03/2023</td>
                    <td className="px-3 py-2.5 text-slate-500">31/12/2022</td>
                    <td className="px-3 py-2.5 text-slate-700">31/12/2023</td>
                    <td className="px-3 py-2.5 text-slate-700">2,500 THB</td>
                    <td className="px-3 py-2.5 text-slate-700">สมชาย ก.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-slate-700">v2</td>
                    <td className="px-3 py-2.5 text-slate-700">05/01/2024</td>
                    <td className="px-3 py-2.5 text-slate-500">31/12/2023</td>
                    <td className="px-3 py-2.5 text-slate-700">31/12/2024</td>
                    <td className="px-3 py-2.5 text-slate-700">2,800 THB</td>
                    <td className="px-3 py-2.5 text-slate-700">สมหญิง ข.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-3">เอกสารแนบ</div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="border-2 border-dashed border-slate-300 rounded-xl h-24 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-[#1565C0] hover:text-[#1565C0] cursor-pointer transition-colors"
                >
                  <Upload size={18} />
                  <span className="text-xs">อัปโหลดไฟล์</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ───── Add Document Modal ─────────────────────────────────
function AddDocumentModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [form, setForm] = useState({
    docType: '' as VehicleDocument['docType'] | '',
    docNumber: '',
    country: '' as VehicleDocument['country'] | '',
    startDate: '',
    expiryDate: '',
    cost: '',
    currency: 'THB',
    alertThresholdDays: '30',
    notes: '',
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  function handleSubmit() {
    onSuccess('เพิ่มเอกสารสำเร็จ');
    onClose();
    setStep(1);
    setSelectedVehicleId('');
    setForm({ docType: '', docNumber: '', country: '', startDate: '', expiryDate: '', cost: '', currency: 'THB', alertThresholdDays: '30', notes: '' });
  }

  if (!open) return null;

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]';
  const labelCls = 'text-xs font-medium text-slate-600 mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <div className="text-base font-bold text-slate-800">เพิ่มเอกสาร</div>
            <div className="text-xs text-slate-500 mt-0.5">ขั้นตอนที่ {step} จาก 2</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="px-6 py-3 flex gap-2 border-b border-slate-100">
          {['เลือกยานพาหนะ', 'ข้อมูลเอกสาร'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= i + 1 ? 'bg-[#1565C0] text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div>
              <span className={`text-xs ${step >= i + 1 ? 'text-[#1565C0] font-medium' : 'text-slate-400'}`}>{label}</span>
              {i < 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>เลือกยานพาหนะ *</label>
                <select className={inputCls} value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)}>
                  <option value="">-- เลือกยานพาหนะ --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} – {v.brand} {v.model}</option>
                  ))}
                </select>
              </div>
              {selectedVehicle && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-3">
                  <div><div className="text-xs text-slate-500">สาขา</div><div className="text-sm font-medium text-slate-800 mt-0.5">{selectedVehicle.branch}</div></div>
                  <div><div className="text-xs text-slate-500">ประเภท</div><div className="text-sm font-medium text-slate-800 mt-0.5">{selectedVehicle.type}</div></div>
                  <div><div className="text-xs text-slate-500">สถานะ</div><div className="text-sm font-medium text-slate-800 mt-0.5">{selectedVehicle.status}</div></div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>ประเภทเอกสาร *</label>
                <select className={inputCls} value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value as VehicleDocument['docType'] })}>
                  <option value="">-- เลือกประเภท --</option>
                  {(['ค่าทาง', 'ประกันภัย', 'ตรวจสภาพทางเทคนิค', 'สมุดทะเบียนรถ', 'สัญญาเช่า', 'หนังสือผ่านแดน', 'พรบ.', 'อื่นๆ'] as const).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>เลขที่เอกสาร *</label>
                <input className={inputCls} value={form.docNumber} onChange={(e) => setForm({ ...form, docNumber: e.target.value })} placeholder="DOC-XXXX" />
              </div>
              <div>
                <label className={labelCls}>ประเทศ</label>
                <select className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as VehicleDocument['country'] })}>
                  <option value="">-- เลือกประเทศ --</option>
                  {(['ไทย', 'ลาว', 'เวียดนาม'] as const).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>วันเริ่มต้น *</label>
                <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>วันหมดอายุ *</label>
                <input type="date" className={inputCls} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>ค่าใช้จ่าย</label>
                <input type="number" className={inputCls} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>สกุลเงิน</label>
                <select className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  {['THB', 'LAK', 'USD'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>แจ้งเตือนล่วงหน้า (วัน)</label>
                <select className={inputCls} value={form.alertThresholdDays} onChange={(e) => setForm({ ...form, alertThresholdDays: e.target.value })}>
                  {['30', '60', '90'].map((d) => <option key={d} value={d}>{d} วัน</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>หมายเหตุ</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="หมายเหตุเพิ่มเติม..." />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={() => step === 1 ? onClose() : setStep(1)} className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
            {step === 1 ? 'ยกเลิก' : '← ย้อนกลับ'}
          </button>
          {step === 1 ? (
            <button
              disabled={!selectedVehicleId}
              onClick={() => setStep(2)}
              className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1] transition-colors disabled:opacity-40"
            >
              ถัดไป →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1] transition-colors"
            >
              บันทึกเอกสาร
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ───── Renew Document Modal ───────────────────────────────
function RenewDocumentModal({
  doc,
  open,
  onClose,
  onSuccess,
}: {
  doc: VehicleDocument | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [form, setForm] = useState({ newStartDate: '', newExpiryDate: '', cost: '', currency: 'THB', notes: '' });

  function handleSubmit() {
    onSuccess('ต่ออายุเอกสารสำเร็จ');
    onClose();
    setForm({ newStartDate: '', newExpiryDate: '', cost: '', currency: 'THB', notes: '' });
  }

  if (!open || !doc) return null;

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]';
  const labelCls = 'text-xs font-medium text-slate-600 mb-1 block';
  const vehicle = vehicles.find((v) => v.id === doc.vehicleId);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="text-base font-bold text-slate-800">ต่ออายุเอกสาร</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Previous info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-amber-700 mb-2">ข้อมูลเดิม (อ่านอย่างเดียว)</div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs text-slate-500">ประเภทเอกสาร</div><div className="text-sm font-medium text-slate-800 mt-0.5">{doc.docType}</div></div>
              <div><div className="text-xs text-slate-500">ทะเบียนรถ</div><div className="text-sm font-mono font-medium text-slate-800 mt-0.5">{vehicle?.plateNumber ?? '-'}</div></div>
              <div><div className="text-xs text-slate-500">วันหมดอายุปัจจุบัน</div><div className="text-sm font-medium text-red-600 mt-0.5">{formatDate(doc.expiryDate)}</div></div>
              <div><div className="text-xs text-slate-500">เลขที่เอกสาร</div><div className="text-sm font-medium text-slate-800 mt-0.5">{doc.docNumber}</div></div>
            </div>
          </div>

          {/* New fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>วันเริ่มต้นใหม่ *</label>
              <input type="date" className={inputCls} value={form.newStartDate} onChange={(e) => setForm({ ...form, newStartDate: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>วันหมดอายุใหม่ *</label>
              <input type="date" className={inputCls} value={form.newExpiryDate} onChange={(e) => setForm({ ...form, newExpiryDate: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>ค่าใช้จ่าย</label>
              <input type="number" className={inputCls} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>สกุลเงิน</label>
              <select className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {['THB', 'LAK', 'USD'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>หมายเหตุ</label>
              <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="หมายเหตุ..." />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="text-sm text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">ยกเลิก</button>
          <button onClick={handleSubmit} className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1] transition-colors">ต่ออายุ</button>
        </div>
      </div>
    </div>
  );
}

// ───── Main Page ──────────────────────────────────────────
const DOC_TYPES = ['ทั้งหมด', 'ค่าทาง', 'ประกันภัย', 'ตรวจสภาพทางเทคนิค', 'สมุดทะเบียนรถ', 'สัญญาเช่า', 'หนังสือผ่านแดน', 'พรบ.', 'อื่นๆ'] as const;
const COUNTRIES = ['ทั้งหมด', 'ลาว', 'ไทย', 'เวียดนาม'] as const;
const PAGE_SIZE = 10;

export default function DocumentManagementPage() {
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [countryFilter, setCountryFilter] = useState('ทั้งหมด');
  const [page, setPage] = useState(1);
  const [drawerDoc, setDrawerDoc] = useState<VehicleDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [renewDoc, setRenewDoc] = useState<VehicleDocument | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  function showToast(msg: string) {
    setToast({ show: true, message: msg });
  }

  // Build vehicle lookup map
  const vehicleMap = useMemo(() => {
    const m: Record<string, Vehicle> = {};
    vehicles.forEach((v) => (m[v.id] = v));
    return m;
  }, []);

  // Summary stats
  const stats = useMemo(() => ({
    total: vehicleDocuments.length,
    expired: vehicleDocuments.filter((d) => d.status === 'expired').length,
    expiringSoon: vehicleDocuments.filter((d) => d.status === 'expiring_soon').length,
    active: vehicleDocuments.filter((d) => d.status === 'active').length,
  }), []);

  // Filtered docs
  const filtered = useMemo(() => {
    return vehicleDocuments.filter((doc) => {
      const vehicle = vehicleMap[doc.vehicleId];
      const plateMatch = search === '' ||
        (vehicle?.plateNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (vehicle?.brand ?? '').toLowerCase().includes(search.toLowerCase());
      const typeMatch = docTypeFilter === 'ทั้งหมด' || doc.docType === docTypeFilter;
      const statusMatch = statusFilter === 'ทั้งหมด' || doc.status === statusFilter;
      const countryMatch = countryFilter === 'ทั้งหมด' || doc.country === countryFilter;
      return plateMatch && typeMatch && statusMatch && countryMatch;
    });
  }, [search, docTypeFilter, statusFilter, countryFilter, vehicleMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, docTypeFilter, statusFilter, countryFilter]);

  const selectCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">เอกสารยานพาหนะ</h1>
            <p className="text-sm text-slate-500 mt-1">จัดการเอกสารและวันหมดอายุของยานพาหนะทั้งหมด</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0D47A1] transition-colors shadow-sm"
            >
              <Plus size={16} /> เพิ่มเอกสาร
            </button>
            <button className="flex items-center gap-2 border border-[#1565C0] text-[#1565C0] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#E3F2FD] transition-colors">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'เอกสารทั้งหมด', value: stats.total, cls: 'text-slate-800' },
            { label: 'หมดอายุแล้ว', value: stats.expired, cls: 'text-red-600' },
            { label: 'ใกล้หมดอายุ', value: stats.expiringSoon, cls: 'text-amber-600' },
            { label: 'ปกติ', value: stats.active, cls: 'text-emerald-600' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl px-5 py-4">
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className={`text-2xl font-bold ${cls}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0] min-w-[200px]"
            placeholder="ค้นหาทะเบียน / ยี่ห้อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={selectCls} value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)}>
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
            <option value="active">ปกติ</option>
            <option value="expiring_soon">ใกล้หมดอายุ</option>
            <option value="expired">หมดอายุ</option>
          </select>
          <select className={selectCls} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            {COUNTRIES.map((c) => <option key={c} value={c}>ประเทศ: {c}</option>)}
          </select>
          <div className="ml-auto text-xs text-slate-400">{filtered.length} รายการ</div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    'ประเภทเอกสาร', 'ทะเบียนรถ', 'ยี่ห้อ/รุ่น', 'สาขา',
                    'เลขที่เอกสาร', 'ประเทศ', 'วันเริ่มต้น', 'วันหมดอายุ',
                    'เหลือ', 'ค่าใช้จ่าย', 'สถานะ', 'การดำเนินการ'
                  ].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center py-16 text-slate-400 text-sm">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      ไม่พบข้อมูลเอกสาร
                    </td>
                  </tr>
                )}
                {paginated.map((doc) => {
                  const vehicle = vehicleMap[doc.vehicleId];
                  const days = daysRemaining(doc.expiryDate);
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setDrawerDoc(doc)}
                    >
                      <td className="px-3 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{doc.docType}</td>
                      <td className="px-3 py-3 text-sm font-mono text-[#1565C0] whitespace-nowrap">{vehicle?.plateNumber ?? '-'}</td>
                      <td className="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{vehicle?.branch ?? '-'}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{doc.docNumber || '-'}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{doc.country ?? '-'}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(doc.startDate)}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(doc.expiryDate)}</td>
                      <td className="px-3 py-3 whitespace-nowrap"><DaysCell days={days} /></td>
                      <td className="px-3 py-3 text-sm text-slate-700 text-right whitespace-nowrap">{doc.cost.toLocaleString()} {doc.currency}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(doc.status)}`}>
                          {statusLabel(doc.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDrawerDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-[#1565C0] hover:bg-blue-50 rounded-lg transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setRenewDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="ต่ออายุ"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500">
              แสดง {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <DocumentDetailDrawer
        doc={drawerDoc}
        onClose={() => setDrawerDoc(null)}
        onRenew={(doc) => { setDrawerDoc(null); setRenewDoc(doc); }}
      />

      {/* Add Modal */}
      <AddDocumentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(msg) => { setShowAddModal(false); showToast(msg); }}
      />

      {/* Renew Modal */}
      <RenewDocumentModal
        doc={renewDoc}
        open={renewDoc !== null}
        onClose={() => setRenewDoc(null)}
        onSuccess={(msg) => { setRenewDoc(null); showToast(msg); }}
      />

      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} onDone={() => setToast({ show: false, message: '' })} />
      )}
    </div>
  );
}
