import React from 'react';
import { ShieldCheck, Wifi } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Jadan Starlink Partner Management System (JSPMS)
          </span>
          <span className="text-slate-400 hidden md:inline">|</span>
          <span className="hidden md:inline">Enterprise License v2.4</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium">Starlink Partner API Connected</span>
          </div>
          <span>© 2026 Jadan Tech Solutions Nig Ltd. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
};
