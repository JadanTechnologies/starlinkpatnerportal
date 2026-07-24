import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  RefreshCw, 
  UserCheck, 
  Radio, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { Role, SystemSettings } from '../types';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  settings: SystemSettings;
  onRunAutoCheck: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  darkMode,
  onToggleDarkMode,
  settings,
  onRunAutoCheck,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  overdueCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 md:px-6 backdrop-blur transition-colors">
      {/* Brand & System Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              Jadan Tech Solutions
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              JSPMS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Starlink Partner Management System
          </p>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer, phone, Starlink ID, dish serial..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Auto Check Trigger */}
        <button
          onClick={onRunAutoCheck}
          title="Run Daily Overdue & Auto-Suspension Check"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden lg:inline">Run Auto-Check</span>
        </button>

        {/* Overdue Notification Bell */}
        <div className="relative">
          <button 
            onClick={onRunAutoCheck}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={`${overdueCount} accounts overdue`}
          >
            <Bell className="w-4 h-4" />
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                {overdueCount}
              </span>
            )}
          </button>
        </div>

        {/* Role Toggle Pill for RBAC Testing */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onRoleChange('SUPER_ADMIN')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              currentRole === 'SUPER_ADMIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Super Admin: Full system access"
          >
            Super Admin
          </button>
          <button
            onClick={() => onRoleChange('ADMIN')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              currentRole === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Admin: Standard operations (No settings/deletions)"
          >
            Admin
          </button>
        </div>

        {/* Dark/Light Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Admin Profile */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold text-xs">
            {currentRole === 'SUPER_ADMIN' ? 'SA' : 'AD'}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none">
              {currentRole === 'SUPER_ADMIN' ? 'Engr. Jadan' : 'Field Admin'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              {currentRole === 'SUPER_ADMIN' ? 'Super Administrator' : 'Operations Staff'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
