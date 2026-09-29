import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, X, Eye, Check, Package, ChevronDown, Wrench, CreditCard,
  CheckSquare, Square, ArrowRight, AlertCircle, ClipboardList,
} from 'lucide-react';
import { purchaseOrders, PurchaseOrder } from '../data/extendedData';
import { vehicles } from '../data/mockData';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  requested: 'bg-blue-100 text-blue-700',
  ordered: 'bg-amber-100 text-amber-700',
  partially_received: 'bg-orange-100 text-orange-700',
  received: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'ร่าง', requested: 'ขอสั่งซื้อ', ordered: 'สั่งแล้ว',
  partially_received: 'รับบางส่วน', received: 'รับแล้ว', cancelled: 'ยกเลิก',
};
const PO_STATUSES = ['draft','requested','ordered','partially_received','received','cancelled'];

const PAYMENT_STATUSES = [
  { value: 'unpaid',    label: 'ยังไม่ชำระ',    cls: 'bg-red-100 text-red-600' },
  { value: 'partial',   label: 'ชำระบางส่วน',   cls: 'bg-amber-100 text-amber-700' },
  { value: 'paid',      label: 'ชำระแล้ว',       cls: 'bg-emerald-100 text-emerald-700' },
];

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
      <Check size={16} />{msg}
    </div>
  );
}

interface OrderItem { name: string; qty: string; unit: string; estimatedPrice: string; }

interface ItemState { received: boolean; used: boolean; }

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors
      ${checked ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
      {checked ? <CheckSquare size={13} /> : <Square size={13} />}
      {label}
    </button>
  );
}

export default function PurchaseOrderPage() {
  const [toast, setToast] = useState('');
  const [detailOrder, setDetailOrder] = useState<PurchaseOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ vehicleId: '', supplier: '', orderDate: '', notes: '', currency: 'THB', usdRate: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ name: '', qty: '1', unit: 'ชิ้น', estimatedPrice: '' }]);

  // Per-item received/used state keyed by `${orderId}-${itemId}`
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [paymentStatus, setPaymentStatus] = useState<Record<string, string>>({});
  const [poStatuses, setPoStatuses] = useState<Record<string, string>>({});

  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), []);

  const kpi = useMemo(() => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(o => ['draft','requested','ordered','partially_received'].includes(o.status)).length;
    const received = purchaseOrders.filter(o => o.status === 'received').length;
    const totalAmount = purchaseOrders.reduce((s, o) => s + o.totalAmount, 0);
    return { total, pending, received, totalAmount };
  }, []);

  const addItem = () => setOrderItems(prev => [...prev, { name: '', qty: '1', unit: 'ชิ้น', estimatedPrice: '' }]);
  const removeItem = (i: number) => setOrderItems(prev => prev.filter((_, j) => j !== i));
  const updateItem = (i: number, field: keyof OrderItem, val: string) =>
    setOrderItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: val } : item));

  const handleCreate = () => {
    setShowCreate(false);
    setToast('สร้าง Order สำเร็จ');
    setCreateForm({ vehicleId: '', supplier: '', orderDate: '', notes: '', currency: 'THB', usdRate: '' });
    setOrderItems([{ name: '', qty: '1', unit: 'ชิ้น', estimatedPrice: '' }]);
  };

  const toggleItemField = (orderId: string, itemId: string, field: 'received' | 'used') => {
    const key = `${orderId}-${itemId}`;
    setItemStates(prev => ({
      ...prev,
      [key]: { ...{ received: false, used: false }, ...prev[key], [field]: !(prev[key]?.[field] ?? false) },
    }));
  };

  const getItemState = (orderId: string, itemId: string): ItemState =>
    itemStates[`${orderId}-${itemId}`] ?? { received: false, used: false };

  const openDetail = (o: PurchaseOrder) => {
    setDetailOrder(o);
    if (!paymentStatus[o.id]) setPaymentStatus(prev => ({ ...prev, [o.id]: 'unpaid' }));
  };

  const currentPoStatus = (o: PurchaseOrder) => poStatuses[o.id] ?? o.status;

  const handleSaveDetail = () => {
    setDetailOrder(null);
    setToast('บันทึกการเปลี่ยนแปลงสำเร็จ');
  };

  const handleCreateRepair = () => {
    setDetailOrder(null);
    setToast('สร้างรายการซ่อมจาก Order สำเร็จ');
  };

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Purchase Order</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-[#1565C0]">
          <Plus size={16} />สร้าง Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Order ทั้งหมด', value: kpi.total, color: 'bg-blue-50', icon: <Package size={20} className="text-[#1565C0]" /> },
          { label: 'รอดำเนินการ',   value: kpi.pending, color: 'bg-amber-50', icon: <ClipboardList size={20} className="text-amber-600" /> },
          { label: 'รับแล้ว',       value: kpi.received, color: 'bg-emerald-50', icon: <Check size={20} className="text-emerald-600" /> },
          { label: 'ยอดรวม', value: `฿${kpi.totalAmount.toLocaleString()}`, color: 'bg-indigo-50', icon: <CreditCard size={20} className="text-indigo-600" /> },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${k.color}`}>{k.icon}</div>
            <div>
              <p className="text-sm text-slate-500">{k.label}</p>
              <p className="text-xl font-bold text-slate-800">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['เลขที่ Order','วันที่','รถ','Supplier','รายการ','จำนวนเงิน','สถานะ PO','สถานะชำระ','การดำเนินการ'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-slate-500 font-medium whitespace-nowrap text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchaseOrders.map(o => {
                const v = vehicleMap[o.vehicleId];
                const pSt = paymentStatus[o.id] ?? 'unpaid';
                const pInfo = PAYMENT_STATUSES.find(p => p.value === pSt);
                const poSt = currentPoStatus(o);
                return (
                  <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openDetail(o)}>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 font-semibold">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap">{o.orderDate}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 text-xs">{v?.plateNumber || o.vehicleId}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{o.supplier}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{o.items.length}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 text-xs">฿{o.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[poSt]}`}>{STATUS_LABEL[poSt]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${pInfo?.cls ?? 'bg-slate-100 text-slate-500'}`}>{pInfo?.label ?? '-'}</span>
                    </td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openDetail(o)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Eye size={12} />ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {detailOrder && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={handleSaveDetail} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[640px] bg-white shadow-2xl z-50 flex flex-col">

            {/* Drawer Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-800">{detailOrder.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[currentPoStatus(detailOrder)]}`}>
                    {STATUS_LABEL[currentPoStatus(detailOrder)]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{detailOrder.supplier} · {detailOrder.orderDate}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* Order Info */}
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">ข้อมูล Order</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'ยานพาหนะ', value: vehicleMap[detailOrder.vehicleId]?.plateNumber ?? detailOrder.vehicleId },
                    { label: 'ยี่ห้อ/รุ่น', value: vehicleMap[detailOrder.vehicleId] ? `${vehicleMap[detailOrder.vehicleId].brand} ${vehicleMap[detailOrder.vehicleId].model}` : '—' },
                    { label: 'Supplier', value: detailOrder.supplier },
                    { label: 'วันที่สั่งซื้อ', value: detailOrder.orderDate },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">{r.label}</p>
                      <p className="font-semibold text-slate-800">{r.value}</p>
                    </div>
                  ))}
                </div>
                {detailOrder.notes && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    {detailOrder.notes}
                  </div>
                )}
              </div>

              {/* สถานะ PO */}
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">เปลี่ยนสถานะ Order</p>
                <div className="flex flex-wrap gap-2">
                  {PO_STATUSES.map(s => (
                    <button key={s} onClick={() => setPoStatuses(prev => ({ ...prev, [detailOrder.id]: s }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                        ${currentPoStatus(detailOrder) === s
                          ? 'bg-[#1565C0] border-[#1565C0] text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {currentPoStatus(detailOrder) === s && <Check size={11} />}
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* รายการอะไหล่ */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">รายการอะไหล่ ({detailOrder.items.length})</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><CheckSquare size={10} className="text-emerald-500" /> รับของแล้ว</span>
                    <span className="flex items-center gap-1"><CheckSquare size={10} className="text-[#1565C0]" /> นำไปใช้งาน</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {detailOrder.items.map(item => {
                    const st = getItemState(detailOrder.id, item.id);
                    return (
                      <div key={item.id} className={`rounded-xl border p-3 transition-colors
                        ${st.used ? 'bg-blue-50 border-blue-200' : st.received ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.quantity} {item.unit}
                              {item.actualPrice != null
                                ? <span> · ราคาจริง <span className="font-mono font-medium text-slate-700">฿{item.actualPrice.toLocaleString()}</span></span>
                                : <span> · ราคาประเมิน <span className="font-mono font-medium text-slate-700">฿{item.estimatedPrice.toLocaleString()}</span></span>
                              }
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Checkbox
                              checked={st.received}
                              onChange={() => toggleItemField(detailOrder.id, item.id, 'received')}
                              label="รับของแล้ว"
                            />
                            <Checkbox
                              checked={st.used}
                              onChange={() => toggleItemField(detailOrder.id, item.id, 'used')}
                              label="นำไปใช้งาน"
                            />
                          </div>
                        </div>
                        {item.receivedQty != null && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                            <span>รับแล้ว:</span>
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, (item.receivedQty / item.quantity) * 100)}%` }} />
                            </div>
                            <span className="font-mono text-slate-600">{item.receivedQty}/{item.quantity}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cost summary */}
                <div className="mt-3 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
                  <span className="text-slate-600 font-medium">รวมทั้งหมด</span>
                  <span className="font-bold font-mono text-[#1565C0] text-base">฿{detailOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* การชำระเงิน */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">สถานะการชำระเงิน</p>
                <div className="flex gap-2">
                  {PAYMENT_STATUSES.map(p => (
                    <button key={p.value}
                      onClick={() => setPaymentStatus(prev => ({ ...prev, [detailOrder.id]: p.value }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-colors
                        ${(paymentStatus[detailOrder.id] ?? 'unpaid') === p.value
                          ? `${p.cls} border-current`
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {(paymentStatus[detailOrder.id] ?? 'unpaid') === p.value && <Check size={13} />}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-100 px-5 py-4 flex gap-3 bg-slate-50">
              <button onClick={handleCreateRepair}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                <Wrench size={14} />สร้างรายการซ่อม
              </button>
              <button onClick={handleSaveDetail}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-medium hover:bg-[#1976D2]">
                <Check size={14} />บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">สร้าง Purchase Order ใหม่</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ยานพาหนะ</label>
                <div className="relative">
                  <select value={createForm.vehicleId} onChange={e => setCreateForm(f => ({ ...f, vehicleId: e.target.value }))}
                    className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                    <option value="">-- เลือกรถ --</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <input value={createForm.supplier} onChange={e => setCreateForm(f => ({ ...f, supplier: e.target.value }))}
                    placeholder="ชื่อผู้จำหน่าย" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันที่สั่งซื้อ</label>
                  <input type="date" value={createForm.orderDate} onChange={e => setCreateForm(f => ({ ...f, orderDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สกุลเงิน</label>
                  <div className="relative">
                    <select value={createForm.currency} onChange={e => setCreateForm(f => ({ ...f, currency: e.target.value, usdRate: '' }))}
                      className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                      <option value="LAK">LAK / ກີບ</option>
                      <option value="THB">THB / บาท</option>
                      <option value="USD">USD / ดอลลาร์</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {createForm.currency === 'USD' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">อัตราแลกเปลี่ยน (1 USD = ? THB)</label>
                    <input type="number" value={createForm.usdRate} onChange={e => setCreateForm(f => ({ ...f, usdRate: e.target.value }))}
                      placeholder="เช่น 35.5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">รายการสินค้า</label>
                  <button onClick={addItem} className="text-xs px-3 py-1 rounded-lg text-white bg-[#1565C0]">+ เพิ่มรายการ</button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="รายการ"
                        className="col-span-4 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="จำนวน"
                        className="col-span-2 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} placeholder="หน่วย"
                        className="col-span-2 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <input type="number" value={item.estimatedPrice} onChange={e => updateItem(i, 'estimatedPrice', e.target.value)} placeholder="ราคา"
                        className="col-span-3 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <button onClick={() => removeItem(i)} disabled={orderItems.length === 1}
                        className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 flex justify-center"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                {(() => {
                  const sym = createForm.currency === 'LAK' ? '₭' : createForm.currency === 'USD' ? '$' : '฿';
                  const total = orderItems.reduce((s, i) => s + (parseFloat(i.qty)||0) * (parseFloat(i.estimatedPrice)||0), 0);
                  return total > 0 ? (
                    <div className="flex justify-end mt-2 text-sm font-semibold text-slate-700">
                      รวม: <span className="ml-1 text-slate-900">{sym}{total.toLocaleString()}</span>
                      {createForm.currency === 'USD' && createForm.usdRate && (
                        <span className="ml-2 text-xs font-normal text-slate-400">(≈ ฿{(total * parseFloat(createForm.usdRate)).toLocaleString()})</span>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <textarea value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="หมายเหตุ..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">ยกเลิก</button>
              <button onClick={handleCreate} className="flex-1 py-2 rounded-lg text-sm text-white font-medium bg-[#1565C0]">สร้าง Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
