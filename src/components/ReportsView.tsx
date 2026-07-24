import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  DollarSign, 
  Users, 
  WifiOff, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Customer, PaymentRecord, SystemSettings, ALL_NIGERIAN_STATES } from '../types';

interface ReportsViewProps {
  customers: Customer[];
  payments: PaymentRecord[];
  settings: SystemSettings;
}

export type ReportType = 
  | 'DAILY' 
  | 'WEEKLY' 
  | 'MONTHLY' 
  | 'YEARLY' 
  | 'OUTSTANDING' 
  | 'OVERDUE' 
  | 'SUSPENDED' 
  | 'REVENUE' 
  | 'CUSTOMER_LEDGER';

export const ReportsView: React.FC<ReportsViewProps> = ({
  customers,
  payments,
  settings,
}) => {
  const [reportType, setReportType] = useState<ReportType>('MONTHLY');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const stateOptions = Array.from(new Set([...customers.map((c) => c.state), ...ALL_NIGERIAN_STATES])).filter(Boolean).sort();

  // Export to CSV Function
  const exportToCSV = () => {
    let headers = ['Customer Name', 'Phone', 'Starlink Account ID', 'Dish Serial', 'State', 'Status', 'Outstanding Balance (NGN)'];
    let rows = customers.map((c) => [
      `"${c.fullName}"`,
      `"${c.phone}"`,
      `"${c.starlink.starlinkAccountId}"`,
      `"${c.starlink.dishKitNumber}"`,
      `"${c.state}"`,
      `"${c.starlink.currentStatus}"`,
      c.installment.currentBalance,
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSPMS_Report_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter calculations
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.installment.currentBalance, 0);
  const overdueCount = customers.filter((c) => c.installment.status === 'Overdue').length;
  const suspendedCount = customers.filter((c) => c.starlink.currentStatus === 'Suspended').length;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Executive Financial & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exportable business intelligence analytics for Jadan Tech Solutions Nig Ltd
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        {[
          { id: 'DAILY', label: 'Daily Report' },
          { id: 'WEEKLY', label: 'Weekly Collection' },
          { id: 'MONTHLY', label: 'Monthly Summary' },
          { id: 'OUTSTANDING', label: 'Outstanding Balance' },
          { id: 'OVERDUE', label: 'Overdue Accounts' },
          { id: 'SUSPENDED', label: 'Suspended Terminals' },
          { id: 'CUSTOMER_LEDGER', label: 'Full Customer Ledger' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as ReportType)}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              reportType === type.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Summary KPI Cards for Reports */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Revenue Collected</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Outstanding Portfolio</span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">₦{totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Overdue Accounts</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{overdueCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Suspended Terminals</span>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{suspendedCount}</p>
        </div>
      </div>

      {/* Printable Report Data Sheet */}
      <div id="printable-report" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {settings.companyName} - {reportType} REPORT
            </h3>
            <p className="text-xs text-slate-500">
              Generated Date: {new Date().toLocaleDateString()} | System: JSPMS
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            CONFIDENTIAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
              <tr>
                <th className="px-4 py-2.5">Customer Name</th>
                <th className="px-4 py-2.5">Starlink Account ID</th>
                <th className="px-4 py-2.5">Dish Serial #</th>
                <th className="px-4 py-2.5">State / LGA</th>
                <th className="px-4 py-2.5">Plan / Installment</th>
                <th className="px-4 py-2.5 text-right">Outstanding Bal.</th>
                <th className="px-4 py-2.5">Service Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.fullName}</td>
                  <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">{c.starlink.starlinkAccountId}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{c.starlink.dishKitNumber}</td>
                  <td className="px-4 py-3">{c.state} ({c.lga})</td>
                  <td className="px-4 py-3 font-semibold">{c.installment.duration} Plan</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">
                    ₦{c.installment.currentBalance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {c.starlink.currentStatus === 'Suspended' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                        SUSPENDED
                      </span>
                    ) : c.installment.status === 'Overdue' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        OVERDUE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ACTIVE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
