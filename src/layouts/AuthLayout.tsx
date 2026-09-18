import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9FA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 lg:p-16 gap-8 lg:gap-16 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Left Section: 3D Tilted Credit Cards Graphic & Branding */}
      <div className="w-full md:w-1/2 max-w-md flex flex-col items-center justify-center text-center py-6 space-y-6 z-10">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 font-extrabold text-2xl tracking-tight">
          <div className="h-10 w-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center font-black text-xl shadow-md">
            F
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white font-sans">
            Fintro
          </span>
        </Link>

        {/* 3D Layered Credit Cards Graphic */}
        <div className="relative w-72 h-64 flex items-center justify-center my-4">
          {/* Card 1 (Top teal card, tilted) */}
          <div className="absolute top-0 transform -rotate-12 translate-x-4 w-56 h-32 rounded-2xl bg-gradient-to-r from-emerald-400/90 to-teal-500/90 backdrop-blur-md p-4 text-white shadow-xl border border-white/40 transition-all hover:scale-105 duration-300">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider opacity-90">
              <span>VISA</span>
            </div>
            <div className="mt-6 font-mono text-xs tracking-widest font-semibold">
              9471 3697 4631 6524
            </div>
            <div className="mt-2 text-[10px] tracking-wider opacity-80 uppercase font-medium">
              Edward Hunt
            </div>
          </div>

          {/* Card 2 (Middle cyan card, tilted) */}
          <div className="absolute top-10 transform -rotate-6 translate-x-1 w-56 h-32 rounded-2xl bg-gradient-to-r from-cyan-400/90 to-blue-500/90 backdrop-blur-md p-4 text-white shadow-xl border border-white/40 transition-all hover:scale-105 duration-300">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider opacity-90">
              <span>VISA</span>
            </div>
            <div className="mt-6 font-mono text-xs tracking-widest font-semibold">
              2488 6741 6118 315
            </div>
            <div className="mt-2 text-[10px] tracking-wider opacity-80 uppercase font-medium">
              Edward Hunt
            </div>
          </div>

          {/* Card 3 (Bottom pink/purple mastercard, front tilt) */}
          <div className="absolute top-20 transform rotate-3 -translate-x-2 w-56 h-32 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-4 text-white shadow-2xl border border-white/50 transition-all hover:scale-105 duration-300">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-red-500/90" />
                <div className="w-4 h-4 rounded-full bg-yellow-500/90" />
              </div>
            </div>
            <div className="mt-6 font-mono text-xs tracking-widest font-bold">
              4455 5491 6118 616
            </div>
            <div className="mt-2 text-[10px] tracking-wider opacity-90 uppercase font-medium">
              Edward Hunt
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs font-medium leading-relaxed hidden sm:block">
          Smart management for your cards, balances, and investments all in one unified platform.
        </p>
      </div>

      {/* Right Section: Login / Register Form Card Container */}
      <div className="w-full md:w-1/2 max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl text-center space-y-6 z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
