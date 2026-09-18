import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PillFilterOption {
  id: string;
  label: string;
  icon?: React.ElementType;
  count?: number;
}

export interface PillFilterProps {
  options: PillFilterOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'dark' | 'light';
}

export const PillFilter: React.FC<PillFilterProps> = ({
  options,
  activeId,
  onChange,
  className,
  variant = 'dark',
}) => {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto no-scrollbar py-1', className)}>
      {options.map((opt) => {
        const isActive = opt.id === activeId;
        const Icon = opt.icon;

        if (variant === 'dark') {
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none',
                isActive
                  ? 'bg-[#1C1C1E] text-white shadow-sm dark:bg-white dark:text-[#1C1C1E]'
                  : 'bg-white/80 text-[#6B7280] hover:text-[#111827] hover:bg-white border border-[#E5E7EB] dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800'
              )}
            >
              {Icon && <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-white dark:text-[#1C1C1E]' : 'text-[#9CA3AF]')} />}
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span className={cn('ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold', isActive ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' : 'bg-slate-100 text-slate-600')}>
                  {opt.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
