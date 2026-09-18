import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  activeId,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-full bg-[#EFEFF4] dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700/60 shadow-inner',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer select-none',
              isActive
                ? 'bg-white text-[#111827] shadow-sm font-bold dark:bg-slate-900 dark:text-white'
                : 'text-[#6B7280] hover:text-[#111827] dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
