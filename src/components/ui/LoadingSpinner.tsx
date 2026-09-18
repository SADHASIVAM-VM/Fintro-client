import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 'md',
  label,
}) => {
  const containerSizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 relative font-sans">
      <div
        className={cn(
          'rounded-full border-purple-500/20 border-t-purple-600 dark:border-purple-400/20 dark:border-t-purple-400 animate-spin transition-all duration-300',
          containerSizes[size],
          className
        )}
      />
      {label && (
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
