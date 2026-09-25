import { useState, useMemo, useEffect } from 'react';
import {
  Eye,
  Wrench,
  Pencil,
  Trash2,
  X,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import { vehicles, maintenancePlans } from '../data/mockData';
import type { Vehicle, MaintenancePlan } from '../data/mockData';

type StatusFilter =
  | 'all'
  | 'planned'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

const STATUS_LABELS: Record<string, string> = {
  planned: 'วางแผนแล้ว',
  upcoming: 'กำลังจะถึง',
  in_progress: 'กำลังดำเนินการ',
  completed: 'เสร็จแล้ว',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิก',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700',
  upcoming: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-600',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function formatCurrency(amount?: number): string {
  if (amount == null) return '—';
  return `฿${amount.toLocaleString('th-TH')}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const MOCK_SUB_ITEMS = [
  { id: 1, name: 'เปลี่ยนน้ำมันเครื่อง', category: 'น้ำมัน', estimatedCost: 1500, status: 'completed' },
  { id: 2, name: 'เปลี่ยนกรองน้ำมัน', category: 'Filter', estimatedCost: 200, status: 'completed' },
  { id: 3, name: 'ตรวจระบบเบรค', category: 'เบรค', estimatedCost: 800, status: 'planned' },
  { id: 4, name: 'เปลี่ยนยางรถ', category: 'ยาง', estimatedCost: 12000, status: 'planned' },
];

interface ConfirmCreateRepairModalProps {
  open: boolean;
  selectedItems: typeof MOCK_SUB_ITEMS;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmCreateRepairModal({ open, selectedItems, onClose, onConfirm }: ConfirmCreateRepairModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800">ยืนยันการสร้างรายการซ่อม</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-slate-600 mb-3">รายการที่เลือกจะถูกสร้างเป็นใบสั่งซ่อม:</p>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <span className="text-sm text-slate-700">{formatCurrency(item.estimatedCost)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-[#1565C0] text-white hover:bg-[#0D47A1]"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}

interface PlanDetailDrawerProps {
  plan: MaintenancePlan | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

function PlanDetailDrawer({ plan, onClose, onToast }: PlanDetailDrawerProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setCheckedItems(new Set());
    setConfirmOpen(false);
  }, [plan?.id]);

  if (!plan) return null;

  const vehicle = vehicles.find((v: Vehicle) => v.id === plan.vehicleId);

  const toggleItem = (id: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedSubItems = MOCK_SUB_ITEMS.filter((i) => checkedItems.has(i.id));

  const handleConfirm = () => {
    setConfirmOpen(false);
    onClose();
    onToast('สร้างการซ่อมสำเร็จ Plan เปลี่ยนเป็น Partially Completed');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl w-[600px] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{plan.taskName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">รายละเอียดแผนการซ่อมบำรุง</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">ข้อมูลทั่วไป</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">ทะเบียนรถ</p>
                <p className="text-sm font-mono font-medium text-slate-800">
                  {vehicle?.plateNumber ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">ยี่ห้อ/รุ่น</p>
                <p className="text-sm font-medium text-slate-800">
                  {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">วันที่วางแผน</p>
                <p className="text-sm text-slate-800">{formatDate(plan.plannedDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">วันกำหนด</p>
                <p className={`text-sm ${plan.status === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-800'}`}>
                  {formatDate(plan.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">ผู้รับผิดชอบ</p>
                <p className="text-sm text-slate-800">{plan.assignee}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">สถานะ</p>
                <StatusBadge status={plan.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">ค่าประมาณ</p>
                <p className="text-sm text-slate-800">{formatCurrency(plan.estimatedCost)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">ค่าจริง</p>
                <p className="text-sm text-slate-800">{formatCurrency(plan.actualCost)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">รายการในแผน</h3>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-8 px-3 py-3"></th>
                    <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">ชื่อรายการ</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">หมวดหมู่</th>
                    <th className="text-right text-xs font-medium text-slate-500 px-3 py-3">ค่าประมาณ</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_SUB_ITEMS.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="text-slate-400 hover:text-[#1565C0] transition-colors"
                        >
                          {checkedItems.has(item.id) ? (
                            <CheckSquare size={16} className="text-[#1565C0]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-3 py-3 text-slate-600">{item.category}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{formatCurrency(item.estimatedCost)}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white">
          <button
            disabled={checkedItems.size === 0}
            onClick={() => setConfirmOpen(true)}
            className="w-full py-2.5 text-sm font-medium rounded-lg bg-[#1565C0] text-white hover:bg-[#0D47A1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            สร้างการซ่อมจากรายการที่เลือก ({checkedItems.size})
          </button>
        </div>
      </div>

      <ConfirmCreateRepairModal
        open={confirmOpen}
        selectedItems={selectedSubItems}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

interface PlanItemRow {
  name: string;
  category: string;
  estimatedCost: number;
}

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

function CreatePlanModal({ open, onClose, onSuccess }: CreatePlanModalProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [currency, setCurrency] = useState('THB');
  const [usdRate, setUsdRate] = useState('');
  const [notes, setNotes] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [planItems, setPlanItems] = useState<PlanItemRow[]>([]);

  const reset = () => {
    setVehicleId('');
    setTaskName('');
    setPlannedDate('');
    setDueDate('');
    setAssignee('');
    setEstimatedCost('');
    setCurrency('THB');
    setUsdRate('');
    setNotes('');
    setItemName('');
    setItemCategory('');
    setItemCost('');
    setPlanItems([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addItem = () => {
    if (!itemName.trim()) return;
    setPlanItems((prev) => [
      ...prev,
      { name: itemName.trim(), category: itemCategory.trim(), estimatedCost: parseFloat(itemCost) || 0 },
    ]);
    setItemName('');
    setItemCategory('');
    setItemCost('');
  };

  const removeItem = (idx: number) => {
    setPlanItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
    onSuccess('สร้างแผนการซ่อมบำรุงสำเร็จ');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800">สร้างแผนการซ่อมบำรุงใหม่</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ยานพาหนะ</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
            >
              <option value="">-- เลือกยานพาหนะ --</option>
              {vehicles.map((v: Vehicle) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} — {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อแผนงาน</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              placeholder="เช่น บำรุงรักษาประจำ 10,000 กม."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่วางแผน</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">วันกำหนดเสร็จ</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ผู้รับผิดชอบ</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="ชื่อช่างหรือผู้รับผิดชอบ"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ค่าประมาณรวม</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">สกุลเงิน</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]">
                <option value="THB">THB — บาท</option>
                <option value="LAK">LAK — ກີບ</option>
                <option value="USD">USD — ดอลลาร์</option>
              </select>
            </div>
            {currency === 'USD' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">อัตราแลกเปลี่ยน (1 USD = ? THB)</label>
                <input type="number" value={usdRate} onChange={e => setUsdRate(e.target.value)} placeholder="35"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">หมายเหตุ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="รายละเอียดเพิ่มเติม..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0] resize-none"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">รายการในแผน</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-[1fr_120px_100px_auto] gap-2 items-end">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">ชื่อรายการ</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="เช่น เปลี่ยนน้ำมันเครื่อง"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">หมวดหมู่</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                  >
                    <option value="">เลือก</option>
                    <option value="น้ำมัน">น้ำมัน</option>
                    <option value="Filter">Filter</option>
                    <option value="เบรค">เบรค</option>
                    <option value="ยาง">ยาง</option>
                    <option value="ไฟฟ้า">ไฟฟ้า</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">ค่าประมาณ</label>
                  <input
                    type="number"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                  />
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-[#1565C0] text-white hover:bg-[#0D47A1] transition-colors whitespace-nowrap"
                >
                  <Plus size={13} />
                  เพิ่มรายการ
                </button>
              </div>

              {planItems.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-2">ชื่อรายการ</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-2">หมวดหมู่</th>
                        <th className="text-right text-xs font-medium text-slate-500 px-3 py-2">ค่าประมาณ</th>
                        <th className="w-10 px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {planItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2 text-slate-800">{item.name}</td>
                          <td className="px-3 py-2 text-slate-600">{item.category || '—'}</td>
                          <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(item.estimatedCost)}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#1565C0] text-white hover:bg-[#0D47A1] transition-colors"
            >
              บันทึกแผน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'planned', label: 'วางแผนแล้ว' },
  { key: 'upcoming', label: 'กำลังจะถึง' },
  { key: 'in_progress', label: 'กำลังดำเนินการ' },
  { key: 'completed', label: 'เสร็จแล้ว' },
  { key: 'overdue', label: 'เกินกำหนด' },
  { key: 'cancelled', label: 'ยกเลิก' },
];

export default function MaintenanceManagementPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, message: '' }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const kpi = useMemo(() => {
    const plans: MaintenancePlan[] = maintenancePlans;
    return {
      total: plans.length,
      planned: plans.filter((p) => p.status === 'planned').length,
      upcoming: plans.filter((p) => p.status === 'upcoming').length,
      in_progress: plans.filter((p) => p.status === 'in_progress').length,
      overdue: plans.filter((p) => p.status === 'overdue').length,
    };
  }, []);

  const filtered = useMemo(() => {
    const plans: MaintenancePlan[] = maintenancePlans;
    if (statusFilter === 'all') return plans;
    return plans.filter((p) => p.status === statusFilter);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">แผนการซ่อมบำรุง</h1>
            <p className="text-sm text-slate-500 mt-1">จัดการแผนและกำหนดการซ่อมบำรุงยานพาหนะ</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-[#1565C0] text-[#1565C0] hover:bg-[#E3F2FD] transition-colors">
              <Download size={15} />
              Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[#1565C0] text-white hover:bg-[#0D47A1] transition-colors"
            >
              <Plus size={15} />
              สร้างแผนใหม่
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs font-medium text-slate-500 mb-1">ทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-800">{kpi.total}</p>
            <p className="text-xs text-slate-400 mt-0.5">แผนทั้งหมด</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs font-medium text-slate-500 mb-1">วางแผนแล้ว</p>
            <p className="text-2xl font-bold text-blue-700">{kpi.planned}</p>
            <p className="text-xs text-slate-400 mt-0.5">รอดำเนินการ</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs font-medium text-slate-500 mb-1">กำลังจะถึง</p>
            <p className="text-2xl font-bold text-amber-600">{kpi.upcoming}</p>
            <p className="text-xs text-slate-400 mt-0.5">ใกล้ถึงกำหนด</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs font-medium text-slate-500 mb-1">กำลังดำเนินการ</p>
            <p className="text-2xl font-bold text-[#1565C0]">{kpi.in_progress}</p>
            <p className="text-xs text-slate-400 mt-0.5">อยู่ระหว่างซ่อม</p>
          </div>
          <div className="bg-white border border-red-100 rounded-xl px-5 py-4 bg-red-50/40">
            <p className="text-xs font-medium text-red-500 mb-1">เกินกำหนด</p>
            <p className="text-2xl font-bold text-red-600">{kpi.overdue}</p>
            <p className="text-xs text-red-400 mt-0.5">ต้องดำเนินการด่วน</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-xl">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-[#1565C0] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} รายการ</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">รายการ</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">ทะเบียนรถ</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">ยี่ห้อ/รุ่น</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">วันที่วางแผน</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">วันกำหนด</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">ผู้รับผิดชอบ</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-right">ค่าประมาณ</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-right">ค่าจริง</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-left">สถานะ</th>
                  <th className="bg-slate-50 text-xs font-medium text-slate-500 px-3 py-3 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-12 text-center text-sm text-slate-400">
                      ไม่พบข้อมูลแผนการซ่อมบำรุง
                    </td>
                  </tr>
                ) : (
                  paginated.map((plan: MaintenancePlan) => {
                    const vehicle = vehicles.find((v: Vehicle) => v.id === plan.vehicleId);
                    return (
                      <tr
                        key={plan.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <td className="px-3 py-3 font-semibold text-slate-800 max-w-[200px] truncate">
                          {plan.taskName}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-700">
                          {vehicle?.plateNumber ?? '—'}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                          {formatDate(plan.plannedDate)}
                        </td>
                        <td className={`px-3 py-3 whitespace-nowrap ${plan.status === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                          {formatDate(plan.dueDate)}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{plan.assignee}</td>
                        <td className="px-3 py-3 text-right text-slate-700 whitespace-nowrap">
                          {formatCurrency(plan.estimatedCost)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-600 whitespace-nowrap">
                          {formatCurrency(plan.actualCost)}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={plan.status} />
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedPlan(plan)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#1565C0] hover:bg-blue-50 transition-colors"
                              title="ดูรายละเอียด"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setSelectedPlan(plan)}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-[#1565C0] text-[#1565C0] hover:bg-[#E3F2FD] transition-colors whitespace-nowrap"
                              title="สร้างการซ่อม"
                            >
                              <Wrench size={11} />
                              สร้างการซ่อม
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="แก้ไข"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                แสดง {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                          page === item
                            ? 'bg-[#1565C0] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Detail Drawer */}
      <PlanDetailDrawer
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onToast={showToast}
      />

      {/* Create Plan Modal */}
      <CreatePlanModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-white/80" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
