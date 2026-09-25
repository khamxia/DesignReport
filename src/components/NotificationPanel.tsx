import { useState } from 'react';
import { X } from 'lucide-react';
import { notifications, type Notification } from '../data/extendedData';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'all' | 'critical' | 'warning' | 'info';

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
];

const DOT_COLOR: Record<Notification['type'], string> = {
  critical: 'bg-red-500',
  warning: 'bg-orange-400',
  info: 'bg-blue-500',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(notifications.filter(n => n.read).map(n => n.id))
  );

  const filtered = notifications.filter(n =>
    activeTab === 'all' ? true : n.type === activeTab
  );

  function markAllRead() {
    setReadIds(new Set(notifications.map(n => n.id)));
  }

  function isRead(n: Notification) {
    return readIds.has(n.id);
  }

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]));
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">การแจ้งเตือน</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-sm text-[#1565C0] hover:underline"
            >
              อ่านทั้งหมด
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="ปิด"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {TAB_LABELS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#1565C0] border-b-2 border-[#1565C0]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-slate-400">
              ไม่มีการแจ้งเตือน
            </div>
          )}
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                !isRead(n) ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLOR[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-sm font-medium text-slate-800 leading-snug">{n.title}</span>
                    {!isRead(n) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                  {n.vehiclePlate && (
                    <span className="text-xs text-slate-400 mt-0.5 block">{n.vehiclePlate}</span>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-400">{formatDate(n.date)}</span>
                    {n.actionLabel && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="text-xs text-[#1565C0] font-medium hover:underline"
                      >
                        {n.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
