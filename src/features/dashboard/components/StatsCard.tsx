import React from 'react';
import { cn } from '@/utils/helpers';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600',
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBgColor)}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {change && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold',
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {isPositive ? '+' : ''}
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

