import { Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

interface AppHeaderProps {
  currentPageTitle: string;
  onNotificationClick: () => void;
  notificationCount: number;
  onNavigate: (page: string, id?: string) => void;
}

export default function AppHeader({
  currentPageTitle,
  onNotificationClick,
  notificationCount,
  onNavigate,
}: AppHeaderProps) {
  const today = new Date('2024-10-23');
  const thaiDate = today.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 z-10 flex items-center px-6 gap-4">
      <h1 className="text-lg font-semibold text-slate-800 whitespace-nowrap">{currentPageTitle}</h1>

      <GlobalSearch onNavigate={onNavigate} />

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-slate-500 whitespace-nowrap hidden lg:block">{thaiDate}</span>

        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        <div className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
      </div>
    </header>
  );
}
