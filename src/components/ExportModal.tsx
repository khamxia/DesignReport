import { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
  totalCount?: number;
  selectedCount?: number;
  defaultColumns?: string[];
}

const steps = ['เลือกข้อมูล', 'เลือก Columns', 'Summary', 'Export'];

const defaultCols = [
  'รหัสรถ', 'ทะเบียนรถ', 'ยี่ห้อ', 'รุ่น', 'ปี', 'สาขา', 'ประเภท', 'สถานะ', 'มูลค่ารถ', 'วันที่เริ่มใช้งาน'
];

export default function ExportModal({ onClose, totalCount = 35, selectedCount = 0, defaultColumns = defaultCols }: ExportModalProps) {
  const [step, setStep] = useState(0);
  const [dataScope, setDataScope] = useState<'all' | 'selected' | 'filtered'>('all');
  const [columns, setColumns] = useState(defaultColumns);
  const [selected, setSelected] = useState<string[]>(defaultColumns);
  const [showTotal, setShowTotal] = useState(true);
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleCol = (c: string) =>
    setSelected(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); }, 1800);
  };

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Export สำเร็จ!</h3>
          <p className="text-sm text-slate-500 mb-6">ไฟล์ถูก Export เรียบร้อยแล้ว</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-[#1565C0] text-white rounded-lg text-sm font-medium hover:bg-[#0D47A1]">
            ปิด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">Export รายงาน</h3>
            <p className="text-xs text-slate-500 mt-0.5">ขั้นตอน {step + 1} จาก {steps.length}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center px-6 py-3 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                ${i < step ? 'bg-[#1565C0] text-white' : i === step ? 'bg-[#1565C0] text-white' : 'bg-slate-100 text-slate-500'}`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs truncate ${i === step ? 'text-[#1565C0] font-medium' : 'text-slate-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-4 min-h-[220px]">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 mb-3">เลือกข้อมูลที่ต้องการ Export</p>
              {[
                { value: 'all', label: 'Export ทั้งหมด', sub: `${totalCount} รายการ` },
                { value: 'selected', label: 'Export เฉพาะรายการที่เลือก', sub: `${selectedCount} รายการที่เลือก` },
                { value: 'filtered', label: 'Export ตาม Filter ปัจจุบัน', sub: 'ตาม Filter ที่กำหนด' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors
                    ${dataScope === opt.value ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <input type="radio" name="scope" value={opt.value}
                    checked={dataScope === opt.value}
                    onChange={() => setDataScope(opt.value as any)}
                    className="accent-[#1565C0]"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">เลือก Columns</p>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setSelected([...columns])} className="text-[#1565C0] hover:underline">เลือกทั้งหมด</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={() => setSelected([])} className="text-slate-500 hover:underline">ยกเลิกทั้งหมด</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {columns.map(col => (
                  <label key={col} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100">
                    <input type="checkbox" checked={selected.includes(col)}
                      onChange={() => toggleCol(col)} className="accent-[#1565C0] w-3.5 h-3.5" />
                    <span className="text-sm text-slate-700">{col}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">เลือกแล้ว {selected.length} จาก {columns.length} columns</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 mb-3">ตั้งค่า Summary</p>
              {[
                { value: true, label: 'แสดง Total', sub: 'แสดงผลรวมด้านล่างตาราง' },
                { value: false, label: 'ไม่แสดง Total', sub: 'ส่งออกเฉพาะข้อมูลรายการ' },
              ].map(opt => (
                <label key={String(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors
                    ${showTotal === opt.value ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <input type="radio" name="total" checked={showTotal === opt.value}
                    onChange={() => setShowTotal(opt.value)} className="accent-[#1565C0]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-4">เลือกรูปแบบไฟล์</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { value: 'xlsx', label: 'Excel', sub: '.xlsx', icon: FileSpreadsheet, color: 'text-emerald-600' },
                  { value: 'csv', label: 'CSV', sub: '.csv', icon: FileText, color: 'text-slate-600' },
                ].map(f => (
                  <label key={f.value}
                    className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-colors
                      ${format === f.value ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <input type="radio" name="format" value={f.value}
                      checked={format === f.value} onChange={() => setFormat(f.value as any)} className="hidden" />
                    <f.icon size={32} className={f.color} />
                    <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                    <p className="text-xs text-slate-500">{f.sub}</p>
                  </label>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>ข้อมูล:</span>
                  <span className="font-medium">{dataScope === 'all' ? 'ทั้งหมด' : dataScope === 'selected' ? 'รายการที่เลือก' : 'ตาม Filter'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Columns:</span>
                  <span className="font-medium">{selected.length} columns</span>
                </div>
                <div className="flex justify-between">
                  <span>รูปแบบ:</span>
                  <span className="font-medium">{format.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
          >
            <ChevronLeft size={14} /> {step === 0 ? 'ยกเลิก' : 'ย้อนกลับ'}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white rounded-lg text-sm font-medium hover:bg-[#0D47A1]"
            >
              ถัดไป <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1565C0] text-white rounded-lg text-sm font-medium hover:bg-[#0D47A1] disabled:opacity-60"
            >
              {exporting ? (
                <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลัง Export...</span>
              ) : (
                <><Download size={14} /> Export Report</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
