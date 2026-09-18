import * as React from 'react';
import { cn } from '@/lib/utils';

export type TwoShadeIconVariant =
  | 'primary'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'sky'
  | 'indigo'
  | 'violet'
  | 'blue'
  | 'purple'
  | 'slate';

export interface TwoShadeIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType;
  variant?: TwoShadeIconVariant;
  size?: 'sm' | 'md' | 'lg';
}

export const TwoShadeIcon: React.FC<TwoShadeIconProps> = ({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const variantStyles: Record<TwoShadeIconVariant, { outer: string; inner: string; text: string }> = {
    primary: {
      outer: 'bg-gradient-to-br from-lime-500/20 via-lime-500/10 to-lime-500/5 border-lime-500/30 dark:border-lime-500/40',
      inner: 'bg-lime-500/30',
      text: 'text-lime-700 dark:text-lime-400',
    },
    emerald: {
      outer: 'bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/40',
      inner: 'bg-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    rose: {
      outer: 'bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-rose-500/5 border-rose-500/30 dark:border-rose-500/40',
      inner: 'bg-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
    },
    amber: {
      outer: 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 border-amber-500/30 dark:border-amber-500/40',
      inner: 'bg-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    sky: {
      outer: 'bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-sky-500/5 border-sky-500/30 dark:border-sky-500/40',
      inner: 'bg-sky-500/30',
      text: 'text-sky-600 dark:text-sky-400',
    },
    indigo: {
      outer: 'bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-indigo-500/5 border-indigo-500/30 dark:border-indigo-500/40',
      inner: 'bg-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    violet: {
      outer: 'bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-violet-500/5 border-violet-500/30 dark:border-violet-500/40',
      inner: 'bg-violet-500/30',
      text: 'text-violet-600 dark:text-violet-400',
    },
    blue: {
      outer: 'bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-500/5 border-blue-500/30 dark:border-blue-500/40',
      inner: 'bg-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      outer: 'bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-purple-500/5 border-purple-500/30 dark:border-purple-500/40',
      inner: 'bg-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
    slate: {
      outer: 'bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-slate-500/5 border-slate-500/30 dark:border-slate-500/40',
      inner: 'bg-slate-500/30',
      text: 'text-slate-700 dark:text-slate-300',
    },
  };

  const sizeClasses = {
    sm: { container: 'p-2 rounded-xl border', icon: 'h-4 w-4', inner1: 'w-5 h-5', inner2: 'w-2 h-2' },
    md: { container: 'p-2.5 rounded-2xl border', icon: 'h-5 w-5', inner1: 'w-7 h-7', inner2: 'w-2.5 h-2.5' },
    lg: { container: 'p-3.5 rounded-2xl border', icon: 'h-6 w-6', inner1: 'w-9 h-9', inner2: 'w-3 h-3' },
  };

  const style = variantStyles[variant] || variantStyles.primary;
  const sizeConfig = sizeClasses[size];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm overflow-hidden group transition-all duration-300 hover:scale-105',
        style.outer,
        style.text,
        sizeConfig.container,
        className
      )}
      {...props}
    >
      {/* Primary Shade Backdrop Layer */}
      <span
        className={cn(
          'absolute -bottom-1.5 -right-1.5 rounded-full blur-[2px] transition-transform duration-500 group-hover:scale-150 opacity-80',
          style.inner,
          sizeConfig.inner1
        )}
      />
      {/* Secondary Shade Accent Dot Layer */}
      <span
        className={cn(
          'absolute top-1 left-1.5 rounded-full opacity-70 transition-opacity group-hover:opacity-100',
          style.inner,
          sizeConfig.inner2
        )}
      />
      <Icon className={cn('relative z-10 transition-transform duration-300 group-hover:rotate-6', sizeConfig.icon)} />
    </div>
  );
};
