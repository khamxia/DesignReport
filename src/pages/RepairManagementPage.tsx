import { useState, useMemo, useEffect } from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { vehicles, repairRecords } from '../data/mockData';
import type { Vehicle, RepairRecord } from '../data/mockData';
import { repairItems, payments } from '../data/extendedData';
import type { RepairItem, Payment } from '../data/extendedData';

const GARAGES = ['ทั้งหมด', 'อู่กลาง', 'ศูนย์บริการ Toyota', 'ศูนย์บริการ Isuzu', 'อู่ชัยมงคล', 'อู่สมชาย'];
const CATEGORIES = ['ทั้งหมด', 'น้ำมัน', 'อะไหล่', 'ยาง', 'ค่าแรง', 'บริการภายนอก', 'อื่นๆ'];
const STATUSES = [
  { value: 'ทั้งหมด', label: 'ทั้งหมด' },
  { value: 'completed', label: 'เสร็จแล้ว' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'pending', label: 'รอดำเนินการ' },
];
const PAGE_SIZE = 10;

function fmtCurrency(v: number) {
  return '฿' + v.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle size={10} /> เสร็จแล้ว
      </span>
    );
  if (status === 'in_progress')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock size={10} /> กำลังดำเนินการ
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      <AlertCircle size={10} /> รอดำเนินการ
    </span>
  );
}

function PaymentBadge({ repairId }: { repairId: string }) {
  const pay = payments.find((p) => p.repairId === repairId);
  if (!pay || pay.status === 'unpaid')
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        ยังไม่ชำระ
      </span>
    );
  if (pay.status === 'overdue')
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        เกินกำหนด
      </span>
    );
  if (pay.status === 'partial')
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        ชำระบางส่วน
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      ชำระแล้ว
    </span>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    อะไหล่: 'bg-blue-100 text-blue-700',
    น้ำมัน: 'bg-emerald-100 text-emerald-700',
    ยาง: 'bg-amber-100 text-amber-700',
    ค่าแรง: 'bg-purple-100 text-purple-700',
    บริการภายนอก: 'bg-slate-100 text-slate-600',
    อื่นๆ: 'bg-slate-100 text-slate-600',
  };
  const cls = map[cat] ?? 'bg-slate-100 text-slate-600';
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{cat}</span>;
}

// ─── Repair Detail Drawer ──────────────────────────────────────────────────

interface RepairDetailDrawerProps {
  record: RepairRecord | null;
  onClose: () => void;
}

function RepairDetailDrawer({ record, onClose }: RepairDetailDrawerProps) {
  if (!record) return null;

  const vehicle = vehicles.find((v) => v.id === record.vehicleId);
  const items = repairItems.filter((i) => i.repairId === record.id);
  const pay = payments.find((p) => p.repairId === record.id);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-[640px] overflow-y-auto bg-white shadow-2xl">
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs text-slate-500">เลขที่เอกสาร</p>
            <p className="font-mono text-base font-semibold text-slate-800">{record.docNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-[#1565C0] px-3 py-1.5 text-sm text-[#1565C0] hover:bg-[#E3F2FD]">
              <Pencil size={14} className="inline mr-1" />
              แก้ไข
            </button>
            <button className="rounded-lg border border-red-400 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} className="inline mr-1" />
              ลบ
            </button>
            <button
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* ข้อมูลการซ่อม */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">ข้อมูลการซ่อม</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">ทะเบียนรถ</p>
                <p className="font-mono font-medium text-slate-800">{vehicle?.plateNumber ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ยี่ห้อ/รุ่น</p>
                <p className="text-slate-800">{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">วันที่ซ่อม</p>
                <p className="text-slate-800">{record.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ร้านซ่อม</p>
                <p className="text-slate-800">{record.garage}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">หมวดหมู่</p>
                <CategoryBadge cat={record.category} />
              </div>
              <div>
                <p className="text-xs text-slate-500">รายละเอียด</p>
                <p className="text-slate-800">{record.repairItems}</p>
              </div>
            </div>
          </div>

          {/* รายการอะไหล่ */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">รายการอะไหล่</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {['รายการ', 'ประเภท', 'จำนวน', 'ราคา/หน่วย', 'ส่วนลด', 'รวม', 'สถานะ', ''].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-sm text-slate-400">
                        ไม่มีรายการ
                      </td>
                    </tr>
                  )}
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-800">{item.name}</td>
                      <td className="px-3 py-2 text-slate-600">{item.type}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">{item.quantity}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">
                        {fmtCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">
                        {item.discount > 0 ? fmtCurrency(item.discount) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-slate-800">
                        {fmtCurrency(item.total)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#1565C0]">
                            <Pencil size={12} />
                          </button>
                          <button className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {items.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={5} className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                        รวม
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">
                        {fmtCurrency(items.reduce((s, i) => s + i.total, 0))}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ค่าใช้จ่าย */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">ค่าใช้จ่าย</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">ค่าอะไหล่</p>
                <p className="mt-1 font-mono font-semibold text-slate-800">{fmtCurrency(record.parts)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">ค่าแรง</p>
                <p className="mt-1 font-mono font-semibold text-slate-800">{fmtCurrency(record.labor)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">ค่าอื่นๆ</p>
                <p className="mt-1 font-mono font-semibold text-slate-800">{fmtCurrency(record.other)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[#E3F2FD] px-4 py-3">
              <p className="font-semibold text-[#1565C0]">รวมทั้งหมด</p>
              <p className="font-mono text-xl font-bold text-[#1565C0]">{fmtCurrency(record.total)}</p>
            </div>
          </div>

          {/* การชำระเงิน */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">การชำระเงิน</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-slate-400" />
                <PaymentBadge repairId={record.id} />
                {pay && (
                  <span className="text-xs text-slate-500">
                    {pay.paidDate ? `วันที่: ${pay.paidDate}` : ''}
                  </span>
                )}
              </div>
              <button className="rounded-lg border border-[#1565C0] px-3 py-1.5 text-sm text-[#1565C0] hover:bg-[#E3F2FD]">
                บันทึกการชำระ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Create Repair Modal ───────────────────────────────────────────────────

interface CreateRepairModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

interface NewItem {
  id: string;
  name: string;
  type: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

function CreateRepairModal({ open, onClose, onSuccess }: CreateRepairModalProps) {
  const [step, setStep] = useState(1);
  const [form1, setForm1] = useState({
    vehicleId: '',
    title: '',
    date: '',
    garage: '',
    category: '',
    description: '',
  });
  const [newItem, setNewItem] = useState({ name: '', type: 'อะไหล่', qty: 1, unit: 'ชิ้น', unitPrice: 0 });
  const [items, setItems] = useState<NewItem[]>([]);
  const [form3, setForm3] = useState({ labor: 0, payStatus: 'unpaid', notes: '' });

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm1({ vehicleId: '', title: '', date: '', garage: '', category: '', description: '' });
      setItems([]);
      setNewItem({ name: '', type: 'อะไหล่', qty: 1, unit: 'ชิ้น', unitPrice: 0 });
      setForm3({ labor: 0, payStatus: 'unpaid', notes: '' });
    }
  }, [open]);

  if (!open) return null;

  const itemSubtotal = items.reduce((s, i) => s + i.total, 0);
  const grandTotal = itemSubtotal + Number(form3.labor);

  function addItem() {
    if (!newItem.name) return;
    const t = newItem.qty * newItem.unitPrice;
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), name: newItem.name, type: newItem.type, qty: newItem.qty, unit: newItem.unit, unitPrice: newItem.unitPrice, total: t },
    ]);
    setNewItem({ name: '', type: 'อะไหล่', qty: 1, unit: 'ชิ้น', unitPrice: 0 });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const steps = ['ข้อมูลการซ่อม', 'รายการอะไหล่', 'ค่าใช้จ่าย & ชำระเงิน'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <p className="text-base font-semibold text-slate-800">สร้างการซ่อม</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 border-b border-slate-100 px-6 py-3">
          {steps.map((s, idx) => {
            const n = idx + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : active
                        ? 'bg-[#1565C0] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {done ? <CheckCircle size={14} /> : n}
                  </div>
                  <span className={`text-xs ${active ? 'font-semibold text-[#1565C0]' : 'text-slate-500'}`}>
                    {s}
                  </span>
                </div>
                {idx < steps.length - 1 && <div className="mx-3 h-px w-10 bg-slate-200" />}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">ยานพาหนะ</label>
                <select
                  value={form1.vehicleId}
                  onChange={(e) => setForm1((p) => ({ ...p, vehicleId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  <option value="">-- เลือกยานพาหนะ --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} – {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">หัวข้อการซ่อม</label>
                <input
                  value={form1.title}
                  onChange={(e) => setForm1((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="ระบุหัวข้อ..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">วันที่</label>
                  <input
                    type="date"
                    value={form1.date}
                    onChange={(e) => setForm1((p) => ({ ...p, date: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">ร้านซ่อม</label>
                  <select
                    value={form1.garage}
                    onChange={(e) => setForm1((p) => ({ ...p, garage: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  >
                    <option value="">-- เลือกร้านซ่อม --</option>
                    {GARAGES.filter((g) => g !== 'ทั้งหมด').map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">หมวดหมู่</label>
                <select
                  value={form1.category}
                  onChange={(e) => setForm1((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {CATEGORIES.filter((c) => c !== 'ทั้งหมด').map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">รายละเอียด</label>
                <textarea
                  rows={3}
                  value={form1.description}
                  onChange={(e) => setForm1((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="อธิบายรายละเอียดการซ่อม..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold text-slate-600">เพิ่มรายการอะไหล่</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="ชื่อรายการ"
                />
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  {['น้ำมัน', 'อะไหล่', 'ยาง', 'Filter', 'Brake', 'อื่นๆ'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newItem.qty}
                  onChange={(e) => setNewItem((p) => ({ ...p, qty: Number(e.target.value) }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="จำนวน"
                  min={1}
                />
                <input
                  value={newItem.unit}
                  onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="หน่วย"
                />
                <input
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem((p) => ({ ...p, unitPrice: Number(e.target.value) }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="ราคา/หน่วย"
                  min={0}
                />
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="text-slate-500">ยอดรวม:</span>
                  <span className="font-mono font-semibold text-[#1565C0]">
                    {fmtCurrency(newItem.qty * newItem.unitPrice)}
                  </span>
                </div>
              </div>
              <button
                onClick={addItem}
                className="mt-3 flex items-center gap-1 rounded-lg bg-[#1565C0] px-4 py-2 text-sm text-white hover:bg-[#0D47A1]"
              >
                <Plus size={14} /> เพิ่มรายการ
              </button>
            </div>

            {items.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['รายการ', 'ประเภท', 'จำนวน', 'หน่วย', 'ราคา/หน่วย', 'รวม', ''].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-800">{it.name}</td>
                        <td className="px-3 py-2 text-slate-600">{it.type}</td>
                        <td className="px-3 py-2 text-right font-mono">{it.qty}</td>
                        <td className="px-3 py-2 text-slate-600">{it.unit}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmtCurrency(it.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">{fmtCurrency(it.total)}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeItem(it.id)}
                            className="rounded p-1 text-red-400 hover:bg-red-50"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-500">{items.length} รายการ</span>
              <span className="font-mono font-semibold text-slate-800">{fmtCurrency(itemSubtotal)}</span>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">ค่าแรง (บาท)</label>
                <input
                  type="number"
                  value={form3.labor}
                  onChange={(e) => setForm3((p) => ({ ...p, labor: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  min={0}
                />
              </div>
              <div className="rounded-lg bg-[#E3F2FD] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1565C0]">ยอดรวมทั้งหมด</span>
                  <span className="font-mono text-xl font-bold text-[#1565C0]">{fmtCurrency(grandTotal)}</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-[#1565C0]/70">
                  <div className="flex justify-between">
                    <span>ค่าอะไหล่</span>
                    <span className="font-mono">{fmtCurrency(itemSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าแรง</span>
                    <span className="font-mono">{fmtCurrency(Number(form3.labor))}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">สถานะการชำระเงิน</label>
                <select
                  value={form3.payStatus}
                  onChange={(e) => setForm3((p) => ({ ...p, payStatus: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  <option value="unpaid">ยังไม่ชำระ</option>
                  <option value="partial">ชำระบางส่วน</option>
                  <option value="paid">ชำระแล้ว</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">หมายเหตุ</label>
                <textarea
                  rows={3}
                  value={form3.notes}
                  onChange={(e) => setForm3((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  placeholder="หมายเหตุเพิ่มเติม..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
          </button>
          <div className="flex gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg bg-[#1565C0] px-5 py-2 text-sm text-white hover:bg-[#0D47A1]"
              >
                ถัดไป
              </button>
            ) : (
              <button
                onClick={() => {
                  onSuccess('สร้างการซ่อมสำเร็จ');
                  onClose();
                }}
                className="rounded-lg bg-[#1565C0] px-5 py-2 text-sm text-white hover:bg-[#0D47A1]"
              >
                บันทึกการซ่อม
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function RepairManagementPage() {
  const [search, setSearch] = useState('');
  const [garage, setGarage] = useState('ทั้งหมด');
  const [category, setCategory] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState<RepairRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, message: '' }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const filtered = useMemo(() => {
    return repairRecords.filter((r) => {
      const v = vehicles.find((vv) => vv.id === r.vehicleId);
      const matchSearch =
        !search ||
        r.docNumber.toLowerCase().includes(search.toLowerCase()) ||
        (v?.plateNumber ?? '').toLowerCase().includes(search.toLowerCase());
      const matchGarage = garage === 'ทั้งหมด' || r.garage === garage;
      const matchCat = category === 'ทั้งหมด' || r.category === category;
      const matchStatus = statusFilter === 'ทั้งหมด' || r.status === statusFilter;
      return matchSearch && matchGarage && matchCat && matchStatus;
    });
  }, [search, garage, category, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpiTotal = repairRecords.length;
  const kpiInProgress = repairRecords.filter((r) => r.status === 'in_progress').length;
  const kpiSpend = repairRecords.reduce((s, r) => s + r.total, 0);
  const kpiUnpaid = repairRecords.filter((r) => {
    const pay = payments.find((p) => p.repairId === r.id);
    return !pay || pay.status === 'unpaid' || pay.status === 'overdue';
  }).length;

  const pageTotal = {
    parts: paginated.reduce((s, r) => s + r.parts, 0),
    labor: paginated.reduce((s, r) => s + r.labor, 0),
    total: paginated.reduce((s, r) => s + r.total, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">การจัดการซ่อมบำรุง</h1>
          <p className="mt-0.5 text-sm text-slate-500">จัดการและติดตามงานซ่อมบำรุงยานพาหนะ</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#1565C0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D47A1]"
          >
            <Plus size={15} /> สร้างการซ่อม
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#1565C0] px-4 py-2 text-sm font-medium text-[#1565C0] hover:bg-[#E3F2FD]">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'งานซ่อมทั้งหมด', value: kpiTotal, icon: <CheckCircle size={18} className="text-blue-500" />, color: 'blue' },
          { label: 'กำลังดำเนินการ', value: kpiInProgress, icon: <Clock size={18} className="text-amber-500" />, color: 'amber' },
          { label: 'ค่าใช้จ่ายรวม', value: fmtCurrency(kpiSpend), icon: <CreditCard size={18} className="text-emerald-500" />, color: 'emerald' },
          { label: 'รอชำระเงิน', value: kpiUnpaid, icon: <AlertCircle size={18} className="text-red-500" />, color: 'red' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{k.label}</p>
              {k.icon}
            </div>
            <p className="mt-2 font-mono text-xl font-bold text-slate-800">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white">
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Filter size={15} />
          ตัวกรอง
          <ChevronRight
            size={14}
            className={`ml-auto transition-transform ${filterOpen ? 'rotate-90' : ''}`}
          />
        </button>
        {filterOpen && (
          <div className="border-t border-slate-100 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                placeholder="ค้นหาทะเบียน / เลขที่..."
              />
              <select
                value={garage}
                onChange={(e) => { setGarage(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
              >
                {GARAGES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {[
                  '#', 'เลขที่เอกสาร', 'วันที่', 'ทะเบียนรถ', 'ยี่ห้อ/รุ่น',
                  'รายการซ่อม', 'หมวดหมู่', 'ร้านซ่อม', 'อะไหล่', 'ค่าแรง',
                  'รวม', 'การชำระ', 'สถานะ', 'จัดการ',
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap bg-slate-50 px-3 py-3 text-left text-xs font-medium text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-sm text-slate-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
              {paginated.map((r, idx) => {
                const v = vehicles.find((vv) => vv.id === r.vehicleId);
                const label = r.repairItems.length > 30 ? r.repairItems.slice(0, 30) + '...' : r.repairItems;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-xs text-slate-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-700">{r.docNumber}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{r.date}</td>
                    <td className="px-3 py-3 font-mono text-slate-800">{v?.plateNumber ?? '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {v ? `${v.brand} ${v.model}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-600" title={r.repairItems}>{label}</td>
                    <td className="px-3 py-3"><CategoryBadge cat={r.category} /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{r.garage}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fmtCurrency(r.parts)}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fmtCurrency(r.labor)}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{fmtCurrency(r.total)}</td>
                    <td className="px-3 py-3"><PaymentBadge repairId={r.id} /></td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailRecord(r)}
                          className="rounded p-1.5 text-slate-400 hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="แก้ไข"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          title="ลบ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {paginated.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                  <td colSpan={8} className="px-3 py-3 text-right text-xs text-slate-500">
                    รวมหน้านี้ ({paginated.length} รายการ)
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm text-slate-800">
                    {fmtCurrency(pageTotal.parts)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm text-slate-800">
                    {fmtCurrency(pageTotal.labor)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm font-bold text-slate-900">
                    {fmtCurrency(pageTotal.total)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">
            แสดง {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | string)[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-slate-400">
                    {p}
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1 text-sm ${
                      page === p
                        ? 'bg-[#1565C0] text-white'
                        : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <RepairDetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />

      {/* Create Modal */}
      <CreateRepairModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(msg) => {
          setModalOpen(false);
          setToast({ show: true, message: msg });
        }}
      />

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle size={16} />
          {toast.message}
        </div>
      )}
    </div>
  );
}
