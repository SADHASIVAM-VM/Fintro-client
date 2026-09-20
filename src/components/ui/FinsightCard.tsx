import React from 'react';
import { Wifi } from 'lucide-react';

interface FintroCardProps {
  cardName?: string;
  brand?: string;
  balance?: string | number;
  cardNumber?: string;
  expDate?: string;
  className?: string;
  currency?: string;
  onClick?: () => void;
}

export const FintroCard: React.FC<FintroCardProps> = ({
  cardName = 'Fintro',
  brand = 'VISA',
  balance = '$12505.58',
  cardNumber = '•••• •••• •••• 6925',
  expDate = '10/28',
  className = '',
  currency = '₹',
  onClick,
}) => {
  const formattedBalance = typeof balance === 'number'
    ? `${currency} ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : balance;

  return (
    <div
      onClick={onClick}
      className={`relative w-full rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 text-zinc-950 p-6 sm:p-7 shadow-xl shadow-amber-500/20 overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer border border-amber-300/70 ${className}`}
    >
      {/* Metallic golden shine overlay */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-white/40 via-yellow-200/20 to-transparent rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-amber-800/30 via-yellow-600/15 to-transparent rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

      {/* Top row: Brand name & VISA Logo */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <span className="text-sm sm:text-base font-extrabold tracking-wide text-zinc-950 drop-shadow-sm">{cardName}</span>
        <div className="flex items-center gap-3">
          <Wifi className="w-5 h-5 text-zinc-900 rotate-90" />
          <span className="text-lg font-black tracking-wider italic text-zinc-950 drop-shadow-sm">{brand}</span>
        </div>
      </div>

      {/* Middle row: Current Balance */}
      <div className="relative z-10 mb-8">
        <p className="text-xs font-bold text-amber-950/80 mb-1 uppercase tracking-wider">Current Balance</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 drop-shadow-sm">{formattedBalance}</h2>
      </div>

      {/* Bottom row: Card Number & Expiry Date */}
      <div className="relative z-10 flex items-end justify-between font-mono text-xs sm:text-sm text-zinc-900">
        <div className="tracking-widest font-extrabold text-zinc-950">
          {cardNumber}
        </div>
        <div className="text-right font-sans">
          <span className="block text-[10px] uppercase tracking-wider text-amber-950/80 font-bold">Exp.Date</span>
          <span className="font-extrabold text-zinc-950">{expDate}</span>
        </div>
      </div>
    </div>
  );
};

export default FintroCard;
