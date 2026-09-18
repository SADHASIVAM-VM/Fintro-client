import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from 'lucide-react';

interface QuickActionGroupProps {
  onSend?: () => void;
  onRequest?: () => void;
  onAddFund?: () => void;
  className?: string;
}

export const QuickActionGroup: React.FC<QuickActionGroupProps> = ({
  onSend,
  onRequest,
  onAddFund,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-3 gap-3 sm:gap-4 my-6 ${className}`}>
      {/* Send Action */}
      <button
        type="button"
        onClick={onSend}
        className="flex flex-col items-center justify-center p-4 sm:p-5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/60 transition-all rounded-3xl group"
      >
        <div className="w-12 h-12 rounded-full bg-[#18181B] text-white flex items-center justify-center mb-2.5 shadow-md group-hover:scale-105 transition-transform">
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Send</span>
      </button>

      {/* Request Action */}
      <button
        type="button"
        onClick={onRequest}
        className="flex flex-col items-center justify-center p-4 sm:p-5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/60 transition-all rounded-3xl group"
      >
        <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
          <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Request</span>
      </button>

      {/* Add Fund Action */}
      <button
        type="button"
        onClick={onAddFund}
        className="flex flex-col items-center justify-center p-4 sm:p-5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/60 transition-all rounded-3xl group"
      >
        <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add Fund</span>
      </button>
    </div>
  );
};

export default QuickActionGroup;
