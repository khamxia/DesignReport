import { useState } from 'react';
import { Bookmark, Edit2, Copy, Trash2, Download, Clock, Filter, Play } from 'lucide-react';

interface SavedReport {
  id: string;
  name: string;
  type: string;
  typeColor: string;
  filters: string;
  columns: number;
  lastRun: string;
  createdAt: string;
  schedule?: string;
}

const MOCK_SAVED: SavedReport[] = [
  {
    id: '1', name: 'รายงานค่าใช้จ่ายซ่อมบำรุงประจำเดือน',
    type: 'ค่าซ่อมบำรุง', typeColor: 'bg-amber-100 text-amber-700',
    filters: 'เดือนนี้, ทุกสาขา, THB',
    columns: 12, lastRun: '2024-10-01', createdAt: '2024-06-15',
    schedule: 'รายเดือน',
  },
  {
    id: '2', name: 'ภาพรวมสถานะยานพาหนะรายสาขา',
    type: 'สถานะรถ', typeColor: 'bg-blue-100 text-blue-700',
    filters: 'ปีนี้, ทุกสาขา',
    columns: 8, lastRun: '2024-09-28', createdAt: '2024-03-01',
  },
  {
    id: '3', name: 'รายงานค่าเอกสารรายไตรมาส',
    type: 'ค่าเอกสาร', typeColor: 'bg-emerald-100 text-emerald-700',
    filters: 'Q3 2024, ทุกสาขา',
    columns: 6, lastRun: '2024-10-05', createdAt: '2024-01-10',
    schedule: 'รายไตรมาส',
  },
  {
    id: '4', name: 'รายงานรวมค่าใช้จ่ายยานพาหนะ',
    type: 'รายงานรวม', typeColor: 'bg-purple-100 text-purple-700',
    filters: 'ปีนี้, สาขาเชียงใหม่',
    columns: 20, lastRun: '2024-09-20', createdAt: '2024-07-05',
  },
  {
    id: '5', name: 'แผนบำรุงรักษาประจำปี',
    type: 'แผนซ่อมบำรุง', typeColor: 'bg-slate-100 text-slate-600',
    filters: 'ปีนี้, ทุกสาขา',
    columns: 9, lastRun: '2024-10-03', createdAt: '2024-01-01',
    schedule: 'รายปี',
  },
];

export default function SavedReportsPage() {
  const [reports, setReports] = useState(MOCK_SAVED);
  const [search, setSearch] = useState('');
  const [runningId, setRunningId] = useState<string | null>(null);

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const deleteReport = (id: string) => setReports(prev => prev.filter(r => r.id !== id));

  const runReport = (id: string) => {
    setRunningId(id);
    setTimeout(() => setRunningId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saved Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">รายงานที่บันทึกไว้สำหรับใช้งานซ้ำ</p>
        </div>
      </div>

      <div className="mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหารายงาน..."
          className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
          <Bookmark size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">ไม่พบรายงานที่บันทึกไว้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(report => (
            <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                  <Bookmark size={18} className="text-[#1565C0]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-800">{report.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.typeColor}`}>
                      {report.type}
                    </span>
                    {report.schedule && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} /> {report.schedule}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Filter size={11} /> {report.filters}
                    </span>
                    <span>{report.columns} columns</span>
                    <span>รันล่าสุด: {report.lastRun}</span>
                    <span>สร้าง: {report.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => runReport(report.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${runningId === report.id
                        ? 'bg-emerald-100 text-emerald-700 cursor-wait'
                        : 'bg-[#1565C0] text-white hover:bg-[#0D47A1]'}`}
                  >
                    {runningId === report.id ? (
                      <><span className="w-3 h-3 border-2 border-emerald-400/40 border-t-emerald-600 rounded-full animate-spin" /> กำลังรัน</>
                    ) : (
                      <><Play size={11} /> เปิด</>
                    )}
                  </button>

                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Export">
                    <Download size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="แก้ไข">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="ทำสำเนา">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => deleteReport(report.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="ลบ">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
