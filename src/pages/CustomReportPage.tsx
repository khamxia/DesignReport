import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Car, Wrench, FileText, ClipboardList, Eye, Download } from 'lucide-react';
import { vehicles, repairRecords, documentExpenses, maintenancePlans } from '../data/mockData';

const MODULES = [
  { id: 'vehicle', label: 'Vehicle Status', subtitle: 'สถานะและข้อมูลยานพาหนะ', icon: Car, color: 'blue' },
  { id: 'repair', label: 'Repair Expenses', subtitle: 'ค่าใช้จ่ายซ่อมบำรุง', icon: Wrench, color: 'orange' },
  { id: 'doc', label: 'Document Expenses', subtitle: 'ค่าใช้จ่ายเอกสาร', icon: FileText, color: 'green' },
  { id: 'plan', label: 'Maintenance Plan', subtitle: 'แผนการซ่อมบำรุง', icon: ClipboardList, color: 'purple' },
];

const STEPS = ['เลือกข้อมูล', 'Filter', 'เลือก Columns', 'Grouping', 'Summary', 'Preview & Export'];

const COLOR_MAP: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  orange: 'border-amber-200 bg-amber-50 text-amber-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
};

const VEHICLE_COLS = ['รหัสรถ', 'ทะเบียน', 'ยี่ห้อ', 'รุ่น', 'ปี', 'สาขา', 'สถานะ', 'มูลค่า'];
const REPAIR_COLS = ['เลขที่เอกสาร', 'วันที่', 'ทะเบียน', 'รายการซ่อม', 'หมวดหมู่', 'ค่าอะไหล่', 'ค่าแรง', 'รวม', 'สถานที่', 'สถานะ'];
const DOC_COLS = ['เลขที่เอกสาร', 'วันที่', 'ทะเบียน', 'ประเภทเอกสาร', 'จำนวนเงิน', 'สถานะ'];
const PLAN_COLS = ['ทะเบียน', 'รายการ', 'วันที่กำหนด', 'สถานะ', 'ผู้รับผิดชอบ', 'ค่าใช้จ่าย'];

const GROUP_OPTIONS = ['สาขา', 'รถ', 'ยี่ห้อ', 'รุ่น', 'เดือน', 'ประเภทค่าใช้จ่าย'];
const SUMMARY_OPTIONS = ['Total', 'Subtotal', 'Average', 'Count'];

export default function CustomReportPage() {
  const [step, setStep] = useState(0);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('year');
  const [branch, setBranch] = useState('all');
  const [currency, setCurrency] = useState('THB');
  const [selectedCols, setSelectedCols] = useState<Record<string, string[]>>({});
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [summaryOpts, setSummaryOpts] = useState<string[]>(['Total']);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      const newCols: Record<string, string[]> = {};
      next.forEach(m => {
        newCols[m] = selectedCols[m] ?? getDefaultCols(m);
      });
      setSelectedCols(newCols);
      return next;
    });
  };

  const getDefaultCols = (m: string) => {
    if (m === 'vehicle') return VEHICLE_COLS;
    if (m === 'repair') return REPAIR_COLS;
    if (m === 'doc') return DOC_COLS;
    return PLAN_COLS;
  };

  const getAvailableCols = (m: string) => {
    if (m === 'vehicle') return VEHICLE_COLS;
    if (m === 'repair') return REPAIR_COLS;
    if (m === 'doc') return DOC_COLS;
    return PLAN_COLS;
  };

  const toggleCol = (mod: string, col: string) => {
    setSelectedCols(prev => {
      const curr = prev[mod] ?? [];
      return {
        ...prev,
        [mod]: curr.includes(col) ? curr.filter(c => c !== col) : [...curr, col],
      };
    });
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setExported(true); }, 2000);
  };

  const totalCols = Object.values(selectedCols).flat().length;

  // Preview data
  const previewRows = selectedModules.includes('vehicle')
    ? vehicles.slice(0, 5).map(v => [v.id, v.plateNumber, v.brand, v.model, v.branch, v.status])
    : selectedModules.includes('repair')
    ? repairRecords.slice(0, 5).map(r => [r.docNumber, r.date, r.vehicleId, r.repairItems, r.category, `฿${r.total.toLocaleString()}`])
    : [];

  if (exported) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Export สำเร็จ!</h3>
          <p className="text-sm text-slate-500 mb-6">รายงานรวมถูก Export เรียบร้อยแล้ว</p>
          <button onClick={() => { setStep(0); setSelectedModules([]); setExported(false); }}
            className="px-6 py-2.5 bg-[#1565C0] text-white rounded-lg text-sm font-medium">
            สร้างรายงานใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">รายงานรวม / Custom Report Builder</h1>
        <p className="text-sm text-slate-500 mt-0.5">สร้างรายงานแบบกำหนดเองจากข้อมูลหลายประเภท</p>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${i === step ? 'bg-[#1565C0] text-white' :
                    i < step ? 'bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB]' :
                    'text-slate-400 cursor-not-allowed'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0
                  ${i === step ? 'bg-white/20 text-white' :
                    i < step ? 'bg-[#1565C0] text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </span>
                <span className="hidden sm:inline whitespace-nowrap">{s}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-6">
          {/* Step 0: Select modules */}
          {step === 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">เลือกประเภทข้อมูล</h2>
              <p className="text-sm text-slate-500 mb-4">เลือก Module ที่ต้องการรวมในรายงานนี้ (เลือกได้มากกว่า 1)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODULES.map(m => {
                  const isSelected = selectedModules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                        ${isSelected ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${isSelected ? COLOR_MAP[m.color] : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        <m.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#1565C0]' : 'text-slate-800'}`}>{m.label}</p>
                        <p className="text-xs text-slate-500">{m.subtitle}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'border-[#1565C0] bg-[#1565C0]' : 'border-slate-300'}`}>
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedModules.length === 0 && (
                <p className="text-xs text-amber-600 mt-3">กรุณาเลือกอย่างน้อย 1 Module</p>
              )}
            </div>
          )}

          {/* Step 1: Filter */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-4">กำหนด Filter</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">ช่วงเวลา</label>
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0]">
                    <option value="today">วันนี้</option>
                    <option value="week">สัปดาห์นี้</option>
                    <option value="month">เดือนนี้</option>
                    <option value="year">ปีนี้</option>
                    <option value="custom">กำหนดเอง</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">สาขา</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0]">
                    <option value="all">ทุกสาขา</option>
                    <option>สำนักงานใหญ่</option>
                    <option>สาขาเชียงใหม่</option>
                    <option>สาขาขอนแก่น</option>
                    <option>สาขาภูเก็ต</option>
                    <option>สาขาหาดใหญ่</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">สกุลเงิน</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0]">
                    <option>THB</option>
                    <option>LAK</option>
                    <option>USD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Columns */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">เลือก Columns</h2>
              <p className="text-sm text-slate-500 mb-4">เลือก Columns ที่ต้องการแสดงในรายงาน</p>
              <div className="space-y-4">
                {selectedModules.map(mod => {
                  const module = MODULES.find(m => m.id === mod)!;
                  const cols = getAvailableCols(mod);
                  const sel = selectedCols[mod] ?? cols;
                  return (
                    <div key={mod} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <module.icon size={15} className="text-[#1565C0]" />
                          <span className="text-sm font-semibold text-slate-700">{module.label}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button onClick={() => setSelectedCols(p => ({ ...p, [mod]: cols }))} className="text-[#1565C0]">ทั้งหมด</button>
                          <span className="text-slate-300">|</span>
                          <button onClick={() => setSelectedCols(p => ({ ...p, [mod]: [] }))} className="text-slate-500">ล้าง</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {cols.map(col => (
                          <label key={col} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs border border-slate-100">
                            <input type="checkbox" className="accent-[#1565C0] w-3.5 h-3.5"
                              checked={sel.includes(col)} onChange={() => toggleCol(mod, col)} />
                            <span className="text-slate-700">{col}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Grouping */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-4">Grouping</h2>
              <p className="text-sm text-slate-500 mb-4">เลือกวิธีการ Group ข้อมูลในรายงาน</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GROUP_OPTIONS.map(g => (
                  <label key={g} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors
                    ${groupBy.includes(g) ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="checkbox" className="accent-[#1565C0] hidden"
                      checked={groupBy.includes(g)}
                      onChange={() => setGroupBy(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${groupBy.includes(g) ? 'border-[#1565C0] bg-[#1565C0]' : 'border-slate-300'}`}>
                      {groupBy.includes(g) && <Check size={10} className="text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${groupBy.includes(g) ? 'text-[#1565C0]' : 'text-slate-700'}`}>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-4">Summary Options</h2>
              <div className="grid grid-cols-2 gap-3">
                {SUMMARY_OPTIONS.map(s => (
                  <label key={s} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors
                    ${summaryOpts.includes(s) ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${summaryOpts.includes(s) ? 'border-[#1565C0] bg-[#1565C0]' : 'border-slate-300'}`}>
                      {summaryOpts.includes(s) && <Check size={10} className="text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${summaryOpts.includes(s) ? 'text-[#1565C0]' : 'text-slate-700'}`}>{s}</p>
                    </div>
                    <input type="checkbox" className="hidden"
                      checked={summaryOpts.includes(s)}
                      onChange={() => setSummaryOpts(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Preview & Export */}
          {step === 5 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Preview & Export</h2>
              <p className="text-sm text-slate-500 mb-4">ตรวจสอบรายงานก่อน Export</p>

              {/* Config summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Modules', value: `${selectedModules.length} รายการ` },
                  { label: 'Columns', value: `${totalCols} columns` },
                  { label: 'Grouping', value: groupBy.length ? groupBy.join(', ') : 'ไม่มี' },
                  { label: 'Summary', value: summaryOpts.join(', ') },
                ].map(c => (
                  <div key={c.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">{c.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Preview table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                  <Eye size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">Preview (5 แถวแรก)</span>
                </div>
                {previewRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {(selectedCols[selectedModules[0]] ?? getDefaultCols(selectedModules[0] ?? '')).slice(0, 6).map(col => (
                            <th key={col} className="px-3 py-2 text-left text-slate-500 font-medium">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            {row.slice(0, 6).map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-4 py-6 text-xs text-slate-400 text-center">ไม่มีข้อมูลตัวอย่าง</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1565C0] text-white rounded-xl text-sm font-medium hover:bg-[#0D47A1] disabled:opacity-60"
                >
                  {exporting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลัง Export...</>
                  ) : (
                    <><Download size={15} /> Export Report</>
                  )}
                </button>
                <button
                  onClick={() => setSaved(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-medium transition-colors
                    ${saved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {saved ? <><Check size={15} /> บันทึกแล้ว</> : 'บันทึก Report'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> ย้อนกลับ
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && selectedModules.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white rounded-lg text-sm font-medium hover:bg-[#0D47A1] disabled:opacity-40"
            >
              ถัดไป <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
