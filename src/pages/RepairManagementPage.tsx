import { useState, useMemo, useEffect } from 'react';
import {
  Eye, Pencil, Trash2, Plus, Download, X,
  ChevronLeft, ChevronRight, Filter,
  CheckCircle, Clock, AlertCircle, CreditCard,
  Bell, BellOff, Gauge, CalendarDays, MapPin, Phone, Building2, Image, FileText,
} from 'lucide-react';
import { vehicles, repairRecords } from '../data/mockData';
import type { Vehicle, RepairRecord } from '../data/mockData';
import { repairItems, payments } from '../data/extendedData';
import type { RepairItem, Payment } from '../data/extendedData';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAVED_GARAGES = [
  { id: '1', name: 'อู่กลาง', phone: '02-111-2222', address: '99 ถ.รัชดา กรุงเทพฯ' },
  { id: '2', name: 'ศูนย์บริการ Toyota', phone: '02-333-4444', address: '50 ถ.พหลโยธิน กรุงเทพฯ' },
  { id: '3', name: 'ศูนย์บริการ Isuzu', phone: '02-555-6666', address: '120 ถ.บางนา กรุงเทพฯ' },
  { id: '4', name: 'อู่ชัยมงคล', phone: '081-777-8888', address: '55 ถ.สุขุมวิท กรุงเทพฯ' },
  { id: '5', name: 'อู่สมชาย', phone: '089-999-0000', address: '12 ถ.ลาดพร้าว กรุงเทพฯ' },
];

const GARAGE_FILTER_LIST = ['ทั้งหมด', ...SAVED_GARAGES.map(g => g.name)];

const STATUSES = [
  { value: 'ทั้งหมด', label: 'ทั้งหมด' },
  { value: 'completed',   label: 'เสร็จแล้ว' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'pending',     label: 'รอดำเนินการ' },
];

const ITEM_CATEGORIES = ['น้ำมัน', 'อะไหล่', 'ยาง', 'Filter', 'Brake', 'Fluid', 'ค่าแรง', 'อื่นๆ'];
const CURRENCIES = [
  { code: 'LAK', symbol: '₭', label: 'LAK — ກີບ' },
  { code: 'THB', symbol: '฿', label: 'THB — บาท' },
  { code: 'USD', symbol: '$', label: 'USD — ดอลลาร์' },
];

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type AlertType = 'none' | 'km' | 'date' | 'both';

interface ItemAlert {
  type: AlertType;
  intervalKm: number;
  alertAheadKm: number;
  dueDate: string;
  alertAheadDays: number;
}

interface NewItem {
  id: string;
  name: string;
  description: string;
  category: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  alert: ItemAlert;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(v: number, symbol = '฿') {
  return symbol + v.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function currentKm() { return 45230; }

function computeDueStatus(alert: ItemAlert): { label: string; cls: string } {
  const CUR_KM = currentKm();
  const TODAY = new Date('2024-10-23');

  let kmOverdue = false, kmDueSoon = false;
  let dateOverdue = false, dateDueSoon = false;

  if ((alert.type === 'km' || alert.type === 'both') && alert.intervalKm > 0) {
    const nextDue = CUR_KM + alert.intervalKm;
    const remaining = nextDue - CUR_KM;
    kmOverdue = remaining <= 0;
    kmDueSoon = remaining > 0 && remaining <= alert.alertAheadKm;
  }

  if ((alert.type === 'date' || alert.type === 'both') && alert.dueDate) {
    const due = new Date(alert.dueDate);
    const daysLeft = Math.ceil((due.getTime() - TODAY.getTime()) / 86400000);
    dateOverdue = daysLeft < 0;
    dateDueSoon = daysLeft >= 0 && daysLeft <= alert.alertAheadDays;
  }

  if (kmOverdue || dateOverdue) return { label: 'Overdue', cls: 'bg-red-100 text-red-700' };
  if (kmDueSoon || dateDueSoon) return { label: 'Due Soon', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'Normal', cls: 'bg-emerald-100 text-emerald-700' };
}

function getRepairDueSummary(repairId: string) {
  const items = repairItems.filter(i => i.repairId === repairId);
  // Simulate: items with reminderKm near current mileage
  const CUR_KM = currentKm();
  let overdue = 0, dueSoon = 0;
  items.forEach(i => {
    if (i.reminderKm) {
      const remaining = i.reminderKm - CUR_KM;
      if (remaining <= 0) overdue++;
      else if (remaining <= 2000) dueSoon++;
    }
    if (i.reminderDays) {
      if (i.reminderDays < 0) overdue++;
      else if (i.reminderDays <= 30) dueSoon++;
    }
  });
  return { overdue, dueSoon, total: items.length };
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed')
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle size={10} /> เสร็จแล้ว</span>;
  if (status === 'in_progress')
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"><Clock size={10} /> กำลังดำเนินการ</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"><AlertCircle size={10} /> รอดำเนินการ</span>;
}

function PaymentBadge({ repairId }: { repairId: string }) {
  const pay = payments.find(p => p.repairId === repairId);
  if (!pay || pay.status === 'unpaid')
    return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">ยังไม่ชำระ</span>;
  if (pay.status === 'overdue')
    return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">เกินกำหนด</span>;
  if (pay.status === 'partial')
    return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">ชำระบางส่วน</span>;
  return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">ชำระแล้ว</span>;
}

function PartsDueBadge({ repairId }: { repairId: string }) {
  const { overdue, dueSoon } = getRepairDueSummary(repairId);
  if (overdue > 0)
    return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Overdue {overdue}</span>;
  if (dueSoon > 0)
    return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Due Soon {dueSoon}</span>;
  return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Normal</span>;
}

function CatBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    อะไหล่: 'bg-blue-100 text-blue-700', น้ำมัน: 'bg-emerald-100 text-emerald-700',
    ยาง: 'bg-amber-100 text-amber-700',   ค่าแรง: 'bg-purple-100 text-purple-700',
    Brake: 'bg-red-100 text-red-700',     Filter: 'bg-cyan-100 text-cyan-700',
    Fluid: 'bg-sky-100 text-sky-700',
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[cat] ?? 'bg-slate-100 text-slate-600'}`}>{cat}</span>;
}

// ─── Item Alert Config ────────────────────────────────────────────────────────

function ItemAlertConfig({ alert, onChange }: { alert: ItemAlert; onChange: (a: ItemAlert) => void }) {
  const enabled = alert.type !== 'none';
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      {/* Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
        <div
          onClick={() => onChange({ ...alert, type: enabled ? 'none' : 'km' })}
          className={`w-8 h-4 rounded-full transition-colors ${enabled ? 'bg-[#1565C0]' : 'bg-slate-300'} relative cursor-pointer`}
        >
          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
          {enabled ? <Bell size={12} className="text-[#1565C0]" /> : <BellOff size={12} className="text-slate-400" />}
          เปิดใช้งานการแจ้งเตือน
        </span>
      </label>

      {enabled && (
        <div className="space-y-3">
          {/* Alert type tabs */}
          <div className="flex gap-1 rounded-lg bg-slate-200 p-0.5 w-fit">
            {[
              { v: 'km',   label: 'ตามระยะทาง' },
              { v: 'date', label: 'ตามวันที่' },
              { v: 'both', label: 'ทั้งสองแบบ' },
            ].map(opt => (
              <button key={opt.v}
                onClick={() => onChange({ ...alert, type: opt.v as AlertType })}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors font-medium ${alert.type === opt.v ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* KM fields */}
          {(alert.type === 'km' || alert.type === 'both') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block flex items-center gap-1"><Gauge size={10} /> ทุก ๆ (กม.)</label>
                <input type="number" min={0} value={alert.intervalKm}
                  onChange={e => onChange({ ...alert, intervalKm: Number(e.target.value) })}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-[#1565C0] focus:outline-none"
                  placeholder="10000" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">แจ้งล่วงหน้า (กม.)</label>
                <input type="number" min={0} value={alert.alertAheadKm}
                  onChange={e => onChange({ ...alert, alertAheadKm: Number(e.target.value) })}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-[#1565C0] focus:outline-none"
                  placeholder="1000" />
              </div>
            </div>
          )}

          {/* Date fields */}
          {(alert.type === 'date' || alert.type === 'both') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block flex items-center gap-1"><CalendarDays size={10} /> วันครบกำหนด</label>
                <input type="date" value={alert.dueDate}
                  onChange={e => onChange({ ...alert, dueDate: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-[#1565C0] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">แจ้งล่วงหน้า (วัน)</label>
                <input type="number" min={0} value={alert.alertAheadDays}
                  onChange={e => onChange({ ...alert, alertAheadDays: Number(e.target.value) })}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-[#1565C0] focus:outline-none"
                  placeholder="30" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Repair Detail Drawer ──────────────────────────────────────────────────────

function RepairDetailDrawer({ record, onClose }: { record: RepairRecord | null; onClose: () => void }) {
  if (!record) return null;
  const vehicle = vehicles.find(v => v.id === record.vehicleId);
  const items = repairItems.filter(i => i.repairId === record.id);
  const pay = payments.find(p => p.repairId === record.id);
  const CUR_KM = currentKm();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-[640px] overflow-y-auto bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs text-slate-500">เลขที่เอกสาร</p>
            <p className="font-mono text-base font-semibold text-slate-800">{record.docNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} />
            <button className="rounded-lg border border-[#1565C0] px-3 py-1.5 text-xs text-[#1565C0] hover:bg-[#E3F2FD]">
              <Pencil size={13} className="inline mr-1" />แก้ไข
            </button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">
              <Trash2 size={13} className="inline mr-1" />ลบ
            </button>
            <button onClick={onClose} className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-6">
          {/* ── Repair Information ── */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">ข้อมูลการซ่อม</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'หัวข้อการซ่อม', value: record.repairItems, full: true },
                { label: 'วันที่ซ่อม', value: record.date },
                { label: 'เลขไมล์ที่ซ่อม', value: `${(CUR_KM - 1200).toLocaleString()} กม.` },
                { label: 'เลขที่ใบแจ้งหนี้', value: record.docNumber },
              ].map(f => (
                <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                  <p className="text-xs text-slate-400">{f.label}</p>
                  <p className="font-medium text-slate-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Vehicle ── */}
          <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">ยานพาหนะ</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                <span className="text-[#1565C0] text-xs font-bold">{vehicle?.plateNumber?.slice(0,2)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{vehicle?.plateNumber ?? '-'}</p>
                <p className="text-xs text-slate-500">{vehicle ? `${vehicle.brand} ${vehicle.model} · ปี ${vehicle.year}` : '-'}</p>
              </div>
              <div className="ml-auto text-right text-xs text-slate-500">
                <p>เลขไมล์ปัจจุบัน</p>
                <p className="font-mono font-semibold text-slate-700">{CUR_KM.toLocaleString()} กม.</p>
              </div>
            </div>
          </section>

          {/* ── Garage ── */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">อู่ / ร้านซ่อม</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 size={14} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{record.garage}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> 02-111-2222</p>
                <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> 99 ถ.รัชดา กรุงเทพฯ</p>
              </div>
            </div>
          </section>

          {/* ── Repair Items Table ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">รายการอะไหล่ ({items.length})</p>
              <button className="flex items-center gap-1 text-xs text-[#1565C0] hover:underline">
                <Plus size={11} /> เพิ่มรายการ
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    {['รายการ', 'ประเภท', 'จำนวน', 'ราคา/หน่วย', 'รวม', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-slate-400">ไม่มีรายการ</td></tr>
                  )}
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-800 font-medium">{item.name}</td>
                      <td className="px-3 py-2"><CatBadge cat={item.type} /></td>
                      <td className="px-3 py-2 text-right font-mono">{item.quantity}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{fmtCurrency(item.total)}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button className="rounded p-1 text-slate-400 hover:text-[#1565C0] hover:bg-slate-100"><Pencil size={11} /></button>
                          <button className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="border-t border-slate-200 bg-slate-50">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-slate-600">รวม</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{fmtCurrency(items.reduce((s,i)=>s+i.total,0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>

          {/* ── Due & Alert ── */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Due &amp; Alert</p>
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">ไม่มีรายการ</p>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {['อะไหล่', 'กำหนดครั้งถัดไป', 'สถานะ'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => {
                      const hasKm = !!item.reminderKm;
                      const remaining = hasKm ? (item.reminderKm! - CUR_KM) : null;
                      const isOverdue = remaining !== null && remaining <= 0;
                      const isDueSoon = remaining !== null && remaining > 0 && remaining <= 2000;
                      const statusCls = isOverdue ? 'bg-red-100 text-red-700'
                        : isDueSoon ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700';
                      const statusLabel = isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Normal';
                      const nextDueText = hasKm
                        ? isOverdue ? `เกิน ${Math.abs(remaining!).toLocaleString()} กม.` : `อีก ${remaining!.toLocaleString()} กม.`
                        : item.reminderDays ? `${item.reminderDays} วัน` : '—';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                          <td className="px-3 py-2 text-slate-600 font-mono">{nextDueText}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCls}`}>{statusLabel}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Cost ── */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">ค่าใช้จ่าย</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              {[
                { label: 'ค่าอะไหล่', value: record.parts },
                { label: 'ค่าแรง',    value: record.labor },
                { label: 'อื่นๆ',     value: record.other },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-mono text-slate-700">{fmtCurrency(row.value)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-[#1565C0]">
                <span>รวมทั้งหมด</span>
                <span className="font-mono text-lg">{fmtCurrency(record.total)}</span>
              </div>
            </div>
          </section>

          {/* ── Images & Attachments ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">รูปภาพ &amp; เอกสารแนบ</p>
              <button className="flex items-center gap-1 text-xs text-[#1565C0] hover:underline"><Image size={11} /> อัปโหลด</button>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#1565C0] transition-colors cursor-pointer">
              <FileText size={20} className="mx-auto text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-400">ยังไม่มีรูปภาพ · คลิกเพื่ออัปโหลด</p>
            </div>
          </section>

          {/* ── Payment ── */}
          <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-slate-400" />
                <span className="text-sm text-slate-700 font-medium">การชำระเงิน</span>
                <PaymentBadge repairId={record.id} />
              </div>
              <button className="rounded-lg border border-[#1565C0] px-3 py-1.5 text-xs text-[#1565C0] hover:bg-[#E3F2FD]">
                บันทึกการชำระ
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ─── Create Repair Modal ──────────────────────────────────────────────────────

function CreateRepairModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: (msg: string) => void;
}) {
  const defaultAlert: ItemAlert = { type: 'none', intervalKm: 0, alertAheadKm: 0, dueDate: '', alertAheadDays: 0 };

  const [step, setStep] = useState(1);
  const [form1, setForm1] = useState({
    vehicleId: '', title: '', date: '', mileage: '', invoiceNo: '', description: '',
    garageMode: 'saved' as 'saved' | 'manual',
    savedGarageId: '', manualName: '', manualPhone: '', manualAddress: '',
    currency: 'THB', usdRate: '',
  });
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', category: 'อะไหล่', qty: 1, unit: 'ชิ้น', unitPrice: 0 });
  const [newItemAlert, setNewItemAlert] = useState<ItemAlert>({ ...defaultAlert });
  const [items, setItems] = useState<NewItem[]>([]);
  const [payStatus, setPayStatus] = useState('unpaid');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm1({ vehicleId: '', title: '', date: '', mileage: '', invoiceNo: '', description: '', garageMode: 'saved', savedGarageId: '', manualName: '', manualPhone: '', manualAddress: '', currency: 'THB', usdRate: '' });
      setItems([]);
      setAddingItem(false);
      setNewItem({ name: '', description: '', category: 'อะไหล่', qty: 1, unit: 'ชิ้น', unitPrice: 0 });
      setNewItemAlert({ ...defaultAlert });
      setPayStatus('unpaid');
      setNotes('');
    }
  }, [open]);

  if (!open) return null;

  const selectedVehicle = vehicles.find(v => v.id === form1.vehicleId);
  const savedGarage = SAVED_GARAGES.find(g => g.id === form1.savedGarageId);
  const currency = CURRENCIES.find(c => c.code === form1.currency) ?? CURRENCIES[1];
  const itemSubtotal = items.reduce((s, i) => s + i.total, 0);
  const usdTotal = form1.currency === 'USD' && Number(form1.usdRate) > 0 ? itemSubtotal / Number(form1.usdRate) : 0;

  function addItem() {
    if (!newItem.name) return;
    setItems(prev => [...prev, {
      id: String(Date.now()),
      ...newItem,
      total: newItem.qty * newItem.unitPrice,
      alert: { ...newItemAlert },
    }]);
    setNewItem({ name: '', description: '', category: 'อะไหล่', qty: 1, unit: 'ชิ้น', unitPrice: 0 });
    setNewItemAlert({ ...defaultAlert });
    setAddingItem(false);
  }

  const steps = ['ข้อมูลการซ่อม', 'รายการอะไหล่', 'ค่าใช้จ่าย & ชำระ'];

  function inputCls(extra = '') {
    return `w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none ${extra}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <p className="text-base font-semibold text-slate-800">สร้างการซ่อม</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 border-b border-slate-100 px-6 py-3 flex-shrink-0">
          {steps.map((s, idx) => {
            const n = idx + 1; const active = step === n; const done = step > n;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'bg-[#1565C0] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {done ? <CheckCircle size={14} /> : n}
                  </div>
                  <span className={`text-xs ${active ? 'font-semibold text-[#1565C0]' : 'text-slate-500'}`}>{s}</span>
                </div>
                {idx < steps.length - 1 && <div className="mx-3 h-px w-10 bg-slate-200" />}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Repair Info ── */}
        {step === 1 && (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* Vehicle */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">ยานพาหนะ</label>
              <select value={form1.vehicleId} onChange={e => setForm1(p => ({ ...p, vehicleId: e.target.value }))} className={inputCls()}>
                <option value="">-- เลือกยานพาหนะ --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} – {v.brand} {v.model}</option>)}
              </select>
              {selectedVehicle && (
                <div className="rounded-lg bg-[#E3F2FD] px-3 py-2 text-xs text-[#1565C0] flex items-center gap-4">
                  <span>{selectedVehicle.brand} {selectedVehicle.model} · {selectedVehicle.branch}</span>
                  <span className="ml-auto font-mono">เลขไมล์: {currentKm().toLocaleString()} กม.</span>
                </div>
              )}
            </div>

            {/* Repair Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">หัวข้อการซ่อม</label>
                <input value={form1.title} onChange={e => setForm1(p => ({ ...p, title: e.target.value }))} className={inputCls()} placeholder="เช่น เปลี่ยนผ้าเบรก + ตรวจระบบ" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">วันที่ซ่อม</label>
                <input type="date" value={form1.date} onChange={e => setForm1(p => ({ ...p, date: e.target.value }))} className={inputCls()} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">เลขไมล์ ณ วันซ่อม</label>
                <input type="number" value={form1.mileage} onChange={e => setForm1(p => ({ ...p, mileage: e.target.value }))} className={inputCls()} placeholder="45000" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">เลขที่ใบแจ้งหนี้</label>
                <input value={form1.invoiceNo} onChange={e => setForm1(p => ({ ...p, invoiceNo: e.target.value }))} className={inputCls()} placeholder="INV-2024-001" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">รายละเอียด</label>
              <textarea rows={2} value={form1.description} onChange={e => setForm1(p => ({ ...p, description: e.target.value }))} className={inputCls()} placeholder="อธิบายรายละเอียด..." />
            </div>

            {/* Garage section */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">อู่ / ร้านซ่อม</label>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 mb-3 w-fit">
                <button onClick={() => setForm1(p => ({ ...p, garageMode: 'saved' }))}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${form1.garageMode === 'saved' ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                  เลือกจากรายการ
                </button>
                <button onClick={() => setForm1(p => ({ ...p, garageMode: 'manual' }))}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${form1.garageMode === 'manual' ? 'bg-white text-[#1565C0] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                  ป้อนเอง
                </button>
              </div>

              {form1.garageMode === 'saved' ? (
                <>
                  <select value={form1.savedGarageId} onChange={e => setForm1(p => ({ ...p, savedGarageId: e.target.value }))} className={inputCls()}>
                    <option value="">-- เลือกร้านซ่อม --</option>
                    {SAVED_GARAGES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  {savedGarage && (
                    <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600 space-y-0.5">
                      <p className="flex items-center gap-1"><Phone size={10} /> {savedGarage.phone}</p>
                      <p className="flex items-center gap-1"><MapPin size={10} /> {savedGarage.address}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <input value={form1.manualName} onChange={e => setForm1(p => ({ ...p, manualName: e.target.value }))} className={inputCls()} placeholder="ชื่อร้านซ่อม / อู่" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={form1.manualPhone} onChange={e => setForm1(p => ({ ...p, manualPhone: e.target.value }))} className={inputCls()} placeholder="เบอร์โทรศัพท์" />
                    <input value={form1.manualAddress} onChange={e => setForm1(p => ({ ...p, manualAddress: e.target.value }))} className={inputCls()} placeholder="ที่อยู่" />
                  </div>
                </div>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">สกุลเงิน</label>
              <div className="flex gap-2 items-start">
                <select value={form1.currency} onChange={e => setForm1(p => ({ ...p, currency: e.target.value }))} className={inputCls('flex-shrink-0 w-48')}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                {form1.currency === 'USD' && (
                  <div className="flex-1">
                    <input type="number" value={form1.usdRate} onChange={e => setForm1(p => ({ ...p, usdRate: e.target.value }))} className={inputCls()} placeholder="อัตราแลกเปลี่ยน USD → THB เช่น 35" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Repair Items ── */}
        {step === 2 && (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* Item list */}
            {items.length > 0 && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {['รายการ', 'ประเภท', 'จำนวน', 'ราคา/หน่วย', 'รวม', 'Alert', ''].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(it => {
                      const alertStatus = it.alert.type !== 'none' ? computeDueStatus(it.alert) : null;
                      return (
                        <tr key={it.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-800">{it.name}</td>
                          <td className="px-3 py-2"><CatBadge cat={it.category} /></td>
                          <td className="px-3 py-2 text-right font-mono">{it.qty}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmtCurrency(it.unitPrice, currency.symbol)}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">{fmtCurrency(it.total, currency.symbol)}</td>
                          <td className="px-3 py-2">
                            {alertStatus ? (
                              <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${alertStatus.cls}`}>{alertStatus.label}</span>
                            ) : (
                              <span className="text-slate-300 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => setItems(p => p.filter(i => i.id !== it.id))} className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 size={11} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-slate-600">รวม</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{fmtCurrency(itemSubtotal, currency.symbol)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Add item form */}
            {!addingItem ? (
              <button onClick={() => setAddingItem(true)}
                className="flex items-center gap-2 w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-[#1565C0] hover:text-[#1565C0] transition-colors">
                <Plus size={16} /> เพิ่มรายการอะไหล่
              </button>
            ) : (
              <div className="rounded-xl border border-[#1565C0]/30 bg-[#E3F2FD]/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-[#1565C0]">รายการใหม่</p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">ชื่อรายการ *</label>
                    <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                      className={inputCls()} placeholder="เช่น Brake Pad" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">คำอธิบาย</label>
                    <input value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                      className={inputCls()} placeholder="รายละเอียดเพิ่มเติม..." />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">ประเภท (Category)</label>
                    <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} className={inputCls()}>
                      {ITEM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">หน่วย</label>
                    <input value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} className={inputCls()} placeholder="ชิ้น" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">จำนวน</label>
                    <input type="number" min={1} value={newItem.qty} onChange={e => setNewItem(p => ({ ...p, qty: Number(e.target.value) }))} className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">ราคา/หน่วย ({currency.symbol})</label>
                    <input type="number" min={0} value={newItem.unitPrice} onChange={e => setNewItem(p => ({ ...p, unitPrice: Number(e.target.value) }))} className={inputCls()} />
                  </div>
                  <div className="col-span-2 flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2">
                    <span className="text-xs text-slate-500">ยอดรวม</span>
                    <span className="font-mono font-bold text-[#1565C0] text-sm">{fmtCurrency(newItem.qty * newItem.unitPrice, currency.symbol)}</span>
                  </div>
                </div>

                {/* Alert config for this item */}
                <ItemAlertConfig alert={newItemAlert} onChange={setNewItemAlert} />

                <div className="flex gap-2 pt-1">
                  <button onClick={addItem} disabled={!newItem.name}
                    className="flex items-center gap-1.5 rounded-lg bg-[#1565C0] px-4 py-2 text-xs text-white hover:bg-[#0D47A1] disabled:opacity-40">
                    <Plus size={13} /> เพิ่มรายการ
                  </button>
                  <button onClick={() => setAddingItem(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

            {items.length === 0 && !addingItem && (
              <p className="text-center text-xs text-slate-400 py-2">ยังไม่มีรายการอะไหล่</p>
            )}
          </div>
        )}

        {/* ── Step 3: Cost & Payment ── */}
        {step === 3 && (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">สรุปค่าใช้จ่าย</p>
              <div className="space-y-2 text-sm">
                {items.map(it => (
                  <div key={it.id} className="flex justify-between text-slate-600">
                    <span className="text-xs">{it.name} ×{it.qty}</span>
                    <span className="font-mono text-xs">{fmtCurrency(it.total, currency.symbol)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#1565C0]">
                  <span>รวมทั้งหมด ({currency.code})</span>
                  <span className="font-mono">{fmtCurrency(itemSubtotal, currency.symbol)}</span>
                </div>
                {form1.currency === 'USD' && Number(form1.usdRate) > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>USD (อัตรา 1 USD = {form1.usdRate} THB)</span>
                    <span className="font-mono">${usdTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment status */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">สถานะการชำระเงิน</label>
              <select value={payStatus} onChange={e => setPayStatus(e.target.value)} className={inputCls()}>
                <option value="unpaid">ยังไม่ชำระ</option>
                <option value="partial">ชำระบางส่วน</option>
                <option value="paid">ชำระแล้ว</option>
              </select>
            </div>

            {/* Parts due summary */}
            {items.some(it => it.alert.type !== 'none') && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1"><Bell size={12} /> รายการที่มีการแจ้งเตือน</p>
                <div className="space-y-1">
                  {items.filter(it => it.alert.type !== 'none').map(it => {
                    const s = computeDueStatus(it.alert);
                    return (
                      <div key={it.id} className="flex items-center justify-between text-xs">
                        <span className="text-amber-700">{it.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">หมายเหตุ</label>
              <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className={inputCls()} placeholder="หมายเหตุเพิ่มเติม..." />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 flex-shrink-0">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{step} / {steps.length}</span>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="rounded-lg bg-[#1565C0] px-5 py-2 text-sm text-white hover:bg-[#0D47A1]">
                ถัดไป →
              </button>
            ) : (
              <button onClick={() => { onSuccess('สร้างการซ่อมสำเร็จ'); onClose(); }}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm text-white hover:bg-emerald-700">
                <CheckCircle size={14} className="inline mr-1.5" />บันทึกการซ่อม
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RepairManagementPage() {
  const [search, setSearch] = useState('');
  const [garageFilter, setGarageFilter] = useState('ทั้งหมด');
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

  const filtered = useMemo(() => repairRecords.filter(r => {
    const v = vehicles.find(vv => vv.id === r.vehicleId);
    const matchSearch = !search ||
      r.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v?.plateNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
      r.repairItems.toLowerCase().includes(search.toLowerCase());
    const matchGarage = garageFilter === 'ทั้งหมด' || r.garage === garageFilter;
    const matchStatus = statusFilter === 'ทั้งหมด' || r.status === statusFilter;
    return matchSearch && matchGarage && matchStatus;
  }), [search, garageFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpiTotal = repairRecords.length;
  const kpiInProgress = repairRecords.filter(r => r.status === 'in_progress').length;
  const kpiSpend = repairRecords.reduce((s, r) => s + r.total, 0);
  const kpiUnpaid = repairRecords.filter(r => {
    const pay = payments.find(p => p.repairId === r.id);
    return !pay || pay.status === 'unpaid' || pay.status === 'overdue';
  }).length;

  const pageTotal = paginated.reduce((s, r) => s + r.total, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">การจัดการซ่อมบำรุง</h1>
          <p className="mt-0.5 text-sm text-slate-500">จัดการและติดตามงานซ่อมบำรุงยานพาหนะ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#1565C0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D47A1]">
            <Plus size={15} /> สร้างการซ่อม
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'งานซ่อมทั้งหมด',  value: kpiTotal,              icon: <CheckCircle size={18} className="text-blue-500" /> },
          { label: 'กำลังดำเนินการ',  value: kpiInProgress,         icon: <Clock size={18} className="text-amber-500" /> },
          { label: 'ค่าใช้จ่ายรวม',   value: fmtCurrency(kpiSpend), icon: <CreditCard size={18} className="text-emerald-500" /> },
          { label: 'รอชำระเงิน',       value: kpiUnpaid,             icon: <AlertCircle size={18} className="text-red-500" /> },
        ].map(k => (
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
        <button onClick={() => setFilterOpen(o => !o)}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter size={15} />
          ตัวกรอง
          <ChevronRight size={14} className={`ml-auto transition-transform ${filterOpen ? 'rotate-90' : ''}`} />
        </button>
        {filterOpen && (
          <div className="border-t border-slate-100 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                placeholder="ค้นหาทะเบียน / เลขที่..." />
              <select value={garageFilter} onChange={e => { setGarageFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none">
                {GARAGE_FILTER_LIST.map(g => <option key={g}>{g}</option>)}
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {[
                  '#', 'เลขที่เอกสาร', 'วันที่', 'ทะเบียนรถ', 'ยี่ห้อ/รุ่น',
                  'รายการซ่อม', 'ร้านซ่อม', 'อะไหล่ใกล้กำหนด',
                  'รวม', 'การชำระ', 'สถานะ', 'จัดการ',
                ].map(h => (
                  <th key={h} className="whitespace-nowrap bg-slate-50 px-3 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 && (
                <tr><td colSpan={12} className="py-12 text-center text-sm text-slate-400">ไม่พบข้อมูล</td></tr>
              )}
              {paginated.map((r, idx) => {
                const v = vehicles.find(vv => vv.id === r.vehicleId);
                const label = r.repairItems.length > 32 ? r.repairItems.slice(0, 32) + '…' : r.repairItems;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-xs text-slate-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-700">{r.docNumber}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{r.date}</td>
                    <td className="px-3 py-3 font-mono font-medium text-slate-800">{v?.plateNumber ?? '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">{v ? `${v.brand} ${v.model}` : '-'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 max-w-[180px]" title={r.repairItems}>{label}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{r.garage}</td>
                    <td className="px-3 py-3"><PartsDueBadge repairId={r.id} /></td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{fmtCurrency(r.total)}</td>
                    <td className="px-3 py-3"><PaymentBadge repairId={r.id} /></td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailRecord(r)}
                          className="rounded p-1.5 text-slate-400 hover:bg-[#E3F2FD] hover:text-[#1565C0]" title="ดูรายละเอียด">
                          <Eye size={14} />
                        </button>
                        <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="แก้ไข">
                          <Pencil size={14} />
                        </button>
                        <button className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="ลบ">
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
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={8} className="px-3 py-3 text-right text-xs text-slate-500 font-medium">
                    รวมหน้านี้ ({paginated.length} รายการ)
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm font-bold text-slate-900">{fmtCurrency(pageTotal)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">
            แสดง {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | string)[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('…');
                acc.push(p); return acc;
              }, [])
              .map((p, i) => typeof p === 'string'
                ? <span key={`e${i}`} className="px-1 text-slate-400">{p}</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1 text-sm ${page === p ? 'bg-[#1565C0] text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                    {p}
                  </button>
              )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <RepairDetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />
      <CreateRepairModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSuccess={msg => { setModalOpen(false); setToast({ show: true, message: msg }); }} />

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle size={16} /> {toast.message}
        </div>
      )}
    </div>
  );
}
