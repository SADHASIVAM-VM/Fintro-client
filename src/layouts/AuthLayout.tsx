import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/constants';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Graphic Grid (large devices only) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden text-white bg-cover bg-center"
        style={{ backgroundImage: "url('/auth_graphic.png')" }}
      >
        {/* Glow decoration nodes / Dark semi-transparent black and violet overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-[#1a0b2e]/70 to-black/85 z-0 pointer-events-none" />

        <div className="flex items-center gap-2.5 z-10">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain bg-white rounded-sm border border-primary" />
          <span className="font-bold text-xl tracking-tight font-sans">{APP_NAME}</span>
        </div>

        <div className="z-10 max-w-md my-auto space-y-6 text-left">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight font-sans">
            Personal Finance Management System.
          </h1>
          <p className="text-white/80 leading-relaxed font-sans text-sm">
            Take complete control of your financial destiny. Log incomes, classify expenditures, manage room bills, track EMI repayments, and monitor outstanding borrowed or lent amounts in a single unified ledger dashboard.
          </p>
        </div>

        <div className="z-10 text-xs text-white/50 font-sans flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}.</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
