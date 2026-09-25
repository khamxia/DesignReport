import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  subtitle?: string;
}

const colorMap = {
  blue: { bg: 'bg-[#E3F2FD]', icon: 'text-[#1565C0]', badge: 'bg-[#1565C0]' },
  green: { bg: 'bg-[#E8F5E9]', icon: 'text-[#2E7D32]', badge: 'bg-[#2E7D32]' },
  orange: { bg: 'bg-[#FFF3E0]', icon: 'text-[#E65100]', badge: 'bg-[#E65100]' },
  red: { bg: 'bg-[#FFEBEE]', icon: 'text-[#C62828]', badge: 'bg-[#C62828]' },
  gray: { bg: 'bg-slate-100', icon: 'text-slate-500', badge: 'bg-slate-500' },
};

export default function KpiCard({ title, value, change, changeLabel, icon: Icon, color = 'blue', subtitle }: KpiCardProps) {
  const colors = colorMap[color];
  const isPositive = (change ?? 0) > 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon size={18} className={colors.icon} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
            ${isNeutral ? 'bg-slate-100 text-slate-500' :
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
          >
            {isNeutral ? <Minus size={10} /> : isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isNeutral ? '0%' : `${isPositive ? '+' : ''}${change}%`}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      {changeLabel && <p className="text-xs text-slate-400 mt-1">{changeLabel}</p>}
    </div>
  );
}
