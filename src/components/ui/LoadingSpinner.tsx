import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-14 w-14',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {/* Noise-box glass card wrapper */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-card/40 backdrop-blur-md transition-all duration-300",
          sizes[size],
          className
        )}
      >
        {/* Grainy fractal noise texture layer */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.99' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Rotating gradient inner element creating kinetic motion */}
        <div className="h-3/5 w-3/5 rounded-full bg-gradient-to-br from-primary via-indigo-500 to-accent animate-spin duration-1000 opacity-80 blur-xs" />
        
        {/* Subtle inner pulse shadow */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
};
export default LoadingSpinner;
