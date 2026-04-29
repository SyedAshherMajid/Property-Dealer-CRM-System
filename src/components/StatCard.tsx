import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'red' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
  trend?: { value: number; label: string };
}

const colorMap = {
  blue: 'bg-blue-600 shadow-blue-200',
  emerald: 'bg-emerald-600 shadow-emerald-200',
  red: 'bg-red-600 shadow-red-200',
  yellow: 'bg-yellow-500 shadow-yellow-200',
  purple: 'bg-purple-600 shadow-purple-200',
  orange: 'bg-orange-500 shadow-orange-200',
};

const bgMap = {
  blue: 'bg-blue-50',
  emerald: 'bg-emerald-50',
  red: 'bg-red-50',
  yellow: 'bg-yellow-50',
  purple: 'bg-purple-50',
  orange: 'bg-orange-50',
};

export default function StatCard({ title, value, icon: Icon, color, subtitle, trend }: Props) {
  return (
    <div className={`stat-card rounded-2xl border border-slate-200 bg-white shadow-sm p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorMap[color]} shadow-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
            +{trend.value} {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-600 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
