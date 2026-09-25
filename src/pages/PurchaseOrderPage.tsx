import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, Eye, Check, Package, ChevronDown } from 'lucide-react';
import { purchaseOrders } from '../data/extendedData';
import { vehicles } from '../data/mockData';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  requested: 'bg-blue-100 text-blue-700',
  ordered: 'bg-amber-100 text-amber-700',
  partially_received: 'bg-orange-100 text-orange-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'ร่าง', requested: 'ขอสั่งซื้อ', ordered: 'สั่งแล้ว',
  partially_received: 'รับบางส่วน', received: 'รับแล้ว', cancelled: 'ยกเลิก',
};

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
      <Check size={16} />{msg}
    </div>
  );
}

interface OrderItem { name: string; qty: string; unit: string; estimatedPrice: string; }

export default function PurchaseOrderPage() {
  const [toast, setToast] = useState('');
  const [detailOrder, setDetailOrder] = useState<typeof purchaseOrders[0] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ vehicleId: '', supplier: '', orderDate: '', notes: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ name: '', qty: '1', unit: 'ชิ้น', estimatedPrice: '' }]);

  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), []);

  const kpi = useMemo(() => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(o => ['draft', 'requested', 'ordered', 'partially_received'].includes(o.status)).length;
    const received = purchaseOrders.filter(o => o.status === 'received').length;
    const totalAmount = purchaseOrders.reduce((s, o) => s + o.totalAmount, 0);
    return { total, pending, received, totalAmount };
  }, []);

  const addItem = () => setOrderItems(prev => [...prev, { name: '', qty: '1', unit: 'ชิ้น', estimatedPrice: '' }]);
  const removeItem = (i: number) => setOrderItems(prev => prev.filter((_, j) => j !== i));
  const updateItem = (i: number, field: keyof OrderItem, val: string) => {
    setOrderItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: val } : item));
  };

  const handleCreate = () => {
    setShowCreate(false);
    setToast('สร้าง Order สำเร็จ');
    setCreateForm({ vehicleId: '', supplier: '', orderDate: '', notes: '' });
    setOrderItems([{ name: '', qty: '1', unit: 'ชิ้น', estimatedPrice: '' }]);
  };

  const handleUseInRepair = () => {
    setToast('นำ Order ไปใช้ในการซ่อมสำเร็จ');
  };

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Purchase Order</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#1565C0' }}>
          <Plus size={16} />สร้าง Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Order ทั้งหมด', value: kpi.total, color: 'bg-blue-50', icon: <Package size={20} className="text-blue-600" /> },
          { label: 'รอดำเนินการ', value: kpi.pending, color: 'bg-amber-50', icon: <Package size={20} className="text-amber-600" /> },
          { label: 'รับแล้ว', value: kpi.received, color: 'bg-green-50', icon: <Check size={20} className="text-green-600" /> },
          { label: 'ยอดรวม', value: `฿${kpi.totalAmount.toLocaleString()}`, color: 'bg-indigo-50', icon: <Package size={20} className="text-indigo-600" /> },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-sm text-slate-500">{k.label}</p><p className="text-2xl font-bold text-slate-800">{k.value}</p></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['เลขที่ Order', 'วันที่', 'รถ', 'Supplier', 'รายการ', 'จำนวนเงิน', 'สถานะ', 'การดำเนินการ'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(o => {
                const v = vehicleMap[o.vehicleId];
                return (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 font-semibold">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{o.orderDate}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{v?.plateNumber || o.vehicleId}</td>
                    <td className="py-3 px-4 text-slate-600">{o.supplier}</td>
                    <td className="py-3 px-4 text-slate-600">{o.items.length} รายการ</td>
                    <td className="py-3 px-4 text-slate-800">฿{o.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setDetailOrder(o)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                          <Eye size={12} />ดูรายละเอียด
                        </button>
                        {o.status === 'received' && (
                          <button onClick={handleUseInRepair} className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-white font-medium" style={{ background: '#1565C0' }}>
                            <Wrench size={12} />ใช้ในการซ่อม
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {detailOrder && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDetailOrder(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">รายละเอียด Order</h2>
              <button onClick={() => setDetailOrder(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">เลขที่ Order</span><span className="font-semibold text-slate-800">{detailOrder.orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ยานพาหนะ</span><span className="font-medium text-slate-800">{vehicleMap[detailOrder.vehicleId]?.plateNumber || detailOrder.vehicleId}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Supplier</span><span className="font-medium text-slate-800">{detailOrder.supplier}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">วันที่สั่งซื้อ</span><span className="font-medium text-slate-800">{detailOrder.orderDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">สถานะ</span><span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[detailOrder.status]}`}>{STATUS_LABEL[detailOrder.status]}</span></div>
                {detailOrder.notes && <div className="flex justify-between"><span className="text-slate-500">หมายเหตุ</span><span className="font-medium text-slate-800 text-right">{detailOrder.notes}</span></div>}
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">รายการสินค้า</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-200 text-slate-500 text-xs"><th className="text-left py-2">รายการ</th><th className="text-right py-2">จำนวน</th><th className="text-left py-2">หน่วย</th><th className="text-right py-2">ราคา</th></tr></thead>
                  <tbody>
                    {detailOrder.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 text-slate-700">{item.name}</td>
                        <td className="py-2 text-right text-slate-600">{item.quantity}</td>
                        <td className="py-2 text-slate-500">{item.unit}</td>
                        <td className="py-2 text-right text-slate-800">฿{item.estimatedPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td colSpan={3} className="pt-3 font-semibold text-right text-slate-700">รวม</td><td className="pt-3 text-right font-bold text-slate-800">฿{detailOrder.totalAmount.toLocaleString()}</td></tr>
                  </tfoot>
                </table>
              </div>
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
                  <select value={createForm.vehicleId} onChange={e => setCreateForm(f => ({ ...f, vehicleId: e.target.value }))} className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                    <option value="">-- เลือกรถ --</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <input value={createForm.supplier} onChange={e => setCreateForm(f => ({ ...f, supplier: e.target.value }))} placeholder="ชื่อผู้จำหน่าย" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันที่สั่งซื้อ</label>
                  <input type="date" value={createForm.orderDate} onChange={e => setCreateForm(f => ({ ...f, orderDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">รายการสินค้า</label>
                  <button onClick={addItem} className="text-xs px-3 py-1 rounded-lg text-white" style={{ background: '#1565C0' }}>+ เพิ่มรายการ</button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="รายการ" className="col-span-4 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="จำนวน" className="col-span-2 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} placeholder="หน่วย" className="col-span-2 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <input type="number" value={item.estimatedPrice} onChange={e => updateItem(i, 'estimatedPrice', e.target.value)} placeholder="ราคา" className="col-span-3 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <button onClick={() => removeItem(i)} disabled={orderItems.length === 1} className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 flex justify-center"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <textarea value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="หมายเหตุ..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">ยกเลิก</button>
              <button onClick={handleCreate} className="flex-1 py-2 rounded-lg text-sm text-white font-medium" style={{ background: '#1565C0' }}>สร้าง Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrench icon for inline use
function Wrench({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
