import { RefreshCw, Download, Plus, Settings } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onExport?: () => void;
  onRefresh?: () => void;
}

export default function PageHeader({ title, subtitle, onExport, onRefresh }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">รีเฟรช</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#1565C0] text-[#1565C0] text-sm rounded-lg hover:bg-[#E3F2FD] transition-colors font-medium"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1565C0] text-white text-sm rounded-lg hover:bg-[#0D47A1] transition-colors font-medium">
          <Plus size={14} />
          <span className="hidden sm:inline">สร้างรายงาน</span>
        </button>
        <button className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50">
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
