import React from 'react';

export interface PortfolioSegment {
  name: string;
  value: number;
  color: string;
}

interface PortfolioDonutProps {
  totalBalance?: number;
  segments?: PortfolioSegment[];
  currencySymbol?: string;
  className?: string;
}

const DEFAULT_SEGMENTS: PortfolioSegment[] = [
  { name: 'Available', value: 6150.00, color: '#4ADE80' },
  { name: 'Bonds', value: 3250.84, color: '#F87171' },
  { name: 'Spent', value: 3103.66, color: '#FACC15' },
];

export const PortfolioDonut: React.FC<PortfolioDonutProps> = ({
  totalBalance = 0,
  segments = DEFAULT_SEGMENTS,
  currencySymbol = '₹',
  className = '',
}) => {
  const sumValues = segments.reduce((acc, curr) => acc + curr.value, 0);

  // Calculate SVG arc paths
  const radius = 80;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 ${className}`}>
      {/* SVG Donut Chart with Center Text */}
      <div className="relative w-56 h-56 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {segments.map((segment, index) => {
            const percent = sumValues > 0 ? segment.value / sumValues : 1 / (segments.length || 1);
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -(accumulatedPercent * circumference);
            accumulatedPercent += percent;

            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out hover:opacity-90"
              />
            );
          })}
        </svg>

        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Net Flow</span>
          <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 truncate max-w-[170px]">
            {currencySymbol}{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Legend below donut */}
      <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(segments.length, 4)} gap-3 w-full mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center`}>
        {segments.map((seg, i) => (
          <div key={i} className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-xl">
            <div className="flex items-center gap-1.5 mb-0.5 max-w-full">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">{seg.name}</span>
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-full">
              {currencySymbol}{seg.value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioDonut;
