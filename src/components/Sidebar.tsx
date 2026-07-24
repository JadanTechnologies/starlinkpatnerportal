import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  WifiOff, 
  BellRing, 
  BarChart3, 
  FolderOpen, 
  ShieldAlert, 
  Settings,
  PlusCircle,
  Radio,
  FileCheck2
} from 'lucide-react';
import { Role } from '../types';

export type NavTab = 
  | 'dashboard' 
  | 'customers' 
  | 'payments' 
  | 'suspensions' 
  | 'reminders' 
  | 'reports' 
  | 'documents' 
  | 'audit' 
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewCustomer: () => void;
  onRecordPayment: () => void;
  overdueCount: number;
  suspendedCount: number;
  currentRole: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onNewCustomer,
  onRecordPayment,
  overdueCount,
  suspendedCount,
  currentRole,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'customers' as NavTab, 
      label: 'Customer Registry', 
      icon: Users,
      badge: overdueCount > 0 ? { count: overdueCount, color: 'bg-amber-500' } : undefined
    },
    { id: 'payments' as NavTab, label: 'Payment Module', icon: CreditCard },
    { 
      id: 'suspensions' as NavTab, 
      label: 'Starlink Control', 
      icon: WifiOff,
      badge: suspendedCount > 0 ? { count: suspendedCount, color: 'bg-red-600' } : undefined
    },
    { id: 'reminders' as NavTab, label: 'Reminders & SMS', icon: BellRing },
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'documents' as NavTab, label: 'Customer Documents', icon: FolderOpen },
    { id: 'audit' as NavTab, label: 'Audit & Security Logs', icon: ShieldAlert },
    { id: 'settings' as NavTab, label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 min-h-[calc(100vh-4rem)] p-4 transition-colors">
      {/* Quick Action Buttons */}
      <div className="space-y-2 mb-6">
        <button
          onClick={onNewCustomer}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
        <button
          onClick={onRecordPayment}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl shadow-xs transition"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Navigation Group */}
      <div className="flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Main Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isSettingsDisabled = item.id === 'settings' && currentRole !== 'SUPER_ADMIN';

          return (
            <button
              key={item.id}
              onClick={() => !isSettingsDisabled && onTabChange(item.id)}
              disabled={isSettingsDisabled}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : isSettingsDisabled
                  ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badge.color}`}>
                  {item.badge.count}
                </span>
              )}

              {isSettingsDisabled && (
                <span className="text-[9px] font-mono text-slate-400 uppercase">Restricted</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Partner Status Box */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Starlink API Status</span>
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 font-medium">
            Mode: Partner API (Sandbox)
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              Gateway Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
