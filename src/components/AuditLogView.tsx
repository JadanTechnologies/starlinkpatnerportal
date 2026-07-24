import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Lock, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { AuditLog, Role } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  currentRole: Role;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs, currentRole }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.adminName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" /> Security Audit Log & Admin Activity Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable tracking of logins, edits, suspensions, reactivations, payments, and system changes
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" /> Security Audit Active
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, details, admin..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['ALL', 'LOGIN', 'SUSPENSION', 'REACTIVATION', 'PAYMENT', 'EDIT', 'DELETE', 'SETTINGS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterCategory === cat ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin Staff</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details & Audit Trail</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {log.adminName}
                    <span className="block text-[10px] text-slate-400 font-mono">{log.adminEmail}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
