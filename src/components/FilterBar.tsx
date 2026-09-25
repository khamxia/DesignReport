import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter, Save, RotateCcw } from 'lucide-react';
import { branches, brands } from '../data/mockData';

export interface FilterState {
  dateRange: string;
  startDate: string;
  endDate: string;
  branch: string[];
  vehicleStatus: string[];
  vehicleType: string[];
  brand: string[];
  currency: string;
}

const defaultFilter: FilterState = {
  dateRange: 'month',
  startDate: '',
  endDate: '',
  branch: [],
  vehicleStatus: [],
  vehicleType: [],
  brand: [],
  currency: 'THB',
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const dateOptions = [
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: 'สัปดาห์นี้' },
  { value: 'month', label: 'เดือนนี้' },
  { value: 'year', label: 'ปีนี้' },
  { value: 'custom', label: 'กำหนดเอง' },
];
const statusOptions = [
  { value: 'active', label: 'ใช้งาน' },
  { value: 'repairing', label: 'กำลังซ่อม' },
  { value: 'inactive', label: 'ไม่สามารถใช้งาน' },
  { value: 'disposed', label: 'จำหน่าย/ปลดระวาง' },
];
const typeOptions = [
  { value: 'executive', label: 'รถตำแหน่ง' },
  { value: 'management', label: 'รถบริหาร' },
  { value: 'operations', label: 'รถปฏิบัติงาน' },
  { value: 'pool', label: 'รถส่วนกลาง' },
];
const currencies = ['THB', 'LAK', 'USD'];

function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors w-full
          ${selected.length > 0 ? 'border-[#1565C0] bg-[#E3F2FD] text-[#1565C0]' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
      >
        <span className="flex-1 text-left truncate">
          {selected.length === 0 ? label : `${label} (${selected.length})`}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[180px] py-1">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="accent-[#1565C0] w-3.5 h-3.5"
              />
              <span className="text-slate-700">{o.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <div className="border-t border-slate-100 mt-1 pt-1 px-3 pb-1">
              <button onClick={() => { onChange([]); setOpen(false); }} className="text-xs text-slate-500 hover:text-[#1565C0]">ล้าง</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(true);

  const activeCount = [
    filters.branch.length > 0,
    filters.vehicleStatus.length > 0,
    filters.vehicleType.length > 0,
    filters.brand.length > 0,
    filters.dateRange !== 'month',
    filters.currency !== 'THB',
  ].filter(Boolean).length;

  const reset = () => onChange(defaultFilter);

  const branchOpts = branches.map(b => ({ value: b, label: b }));
  const brandOpts = brands.map(b => ({ value: b, label: b }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-5">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[#1565C0]" />
          <span className="text-sm font-medium text-slate-700">ตัวกรอง</span>
          {activeCount > 0 && (
            <span className="text-xs bg-[#1565C0] text-white rounded-full px-2 py-0.5">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); reset(); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#1565C0] transition-colors"
            >
              <RotateCcw size={12} /> รีเซ็ต
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Date Range */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">ช่วงเวลา</label>
              <select
                value={filters.dateRange}
                onChange={e => onChange({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-[#1565C0]"
              >
                {dateOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">วันเริ่มต้น</label>
                  <input type="date" value={filters.startDate}
                    onChange={e => onChange({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">วันสิ้นสุด</label>
                  <input type="date" value={filters.endDate}
                    onChange={e => onChange({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-slate-500 mb-1">สาขา</label>
              <MultiSelect label="ทุกสาขา" options={branchOpts}
                selected={filters.branch} onChange={v => onChange({ ...filters, branch: v })} />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">สถานะรถ</label>
              <MultiSelect label="ทุกสถานะ" options={statusOptions}
                selected={filters.vehicleStatus} onChange={v => onChange({ ...filters, vehicleStatus: v })} />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">ประเภทการใช้งาน</label>
              <MultiSelect label="ทุกประเภท" options={typeOptions}
                selected={filters.vehicleType} onChange={v => onChange({ ...filters, vehicleType: v })} />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">ยี่ห้อ</label>
              <MultiSelect label="ทุกยี่ห้อ" options={brandOpts}
                selected={filters.brand} onChange={v => onChange({ ...filters, brand: v })} />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">สกุลเงิน</label>
              <select
                value={filters.currency}
                onChange={e => onChange({ ...filters, currency: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-[#1565C0]"
              >
                {currencies.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Active chips */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
              {filters.dateRange !== 'month' && (
                <span className="flex items-center gap-1 text-xs bg-[#E3F2FD] text-[#1565C0] px-2.5 py-1 rounded-full">
                  {dateOptions.find(d => d.value === filters.dateRange)?.label}
                  <button onClick={() => onChange({ ...filters, dateRange: 'month' })}><X size={10} /></button>
                </span>
              )}
              {filters.branch.map(b => (
                <span key={b} className="flex items-center gap-1 text-xs bg-[#E3F2FD] text-[#1565C0] px-2.5 py-1 rounded-full">
                  {b} <button onClick={() => onChange({ ...filters, branch: filters.branch.filter(x => x !== b) })}><X size={10} /></button>
                </span>
              ))}
              {filters.brand.map(b => (
                <span key={b} className="flex items-center gap-1 text-xs bg-[#E3F2FD] text-[#1565C0] px-2.5 py-1 rounded-full">
                  {b} <button onClick={() => onChange({ ...filters, brand: filters.brand.filter(x => x !== b) })}><X size={10} /></button>
                </span>
              ))}
              {filters.vehicleStatus.map(s => (
                <span key={s} className="flex items-center gap-1 text-xs bg-[#E3F2FD] text-[#1565C0] px-2.5 py-1 rounded-full">
                  {statusOptions.find(o => o.value === s)?.label}
                  <button onClick={() => onChange({ ...filters, vehicleStatus: filters.vehicleStatus.filter(x => x !== s) })}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1565C0] text-white text-sm rounded-lg hover:bg-[#0D47A1] transition-colors font-medium">
              <Filter size={13} /> Apply Filter
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
              <RotateCcw size={13} /> รีเซ็ต
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors ml-auto">
              <Save size={13} /> บันทึก Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
