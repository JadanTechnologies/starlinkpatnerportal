import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Radio, 
  CreditCard, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  MoreVertical, 
  Trash2, 
  Phone, 
  MapPin, 
  ChevronRight,
  Download,
  Calendar
} from 'lucide-react';
import { Customer, Role } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onRecordPaymentForCustomer: (customer: Customer) => void;
  onSuspendCustomer: (customer: Customer) => void;
  onNewCustomer: () => void;
  onDeleteCustomer: (id: string) => void;
  currentRole: Role;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
  onRecordPaymentForCustomer,
  onSuspendCustomer,
  onNewCustomer,
  onDeleteCustomer,
  currentRole,
  searchQuery,
  onSearchChange,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const nigerianStates = Array.from(new Set(customers.map((c) => c.state))).filter(Boolean);

  const filteredCustomers = customers.filter((customer) => {
    // Search query check
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      customer.fullName.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.customerNumber.toLowerCase().includes(query) ||
      customer.starlink.starlinkAccountId.toLowerCase().includes(query) ||
      customer.starlink.serialNumber.toLowerCase().includes(query) ||
      customer.starlink.dishKitNumber.toLowerCase().includes(query) ||
      customer.state.toLowerCase().includes(query) ||
      customer.lga.toLowerCase().includes(query);

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = customer.starlink.currentStatus === 'Active';
    if (statusFilter === 'SUSPENDED') matchesStatus = customer.starlink.currentStatus === 'Suspended';
    if (statusFilter === 'OVERDUE') matchesStatus = customer.installment.status === 'Overdue';
    if (statusFilter === 'COMPLETED') matchesStatus = customer.installment.status === 'Completed';

    // State filter
    let matchesState = true;
    if (stateFilter !== 'ALL') matchesState = customer.state === stateFilter;

    return matchesSearch && matchesStatus && matchesState;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Customer Installment Registry ({filteredCustomers.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Starlink Kit installment plans, terminal statuses, and payment tracking
          </p>
        </div>

        <button
          onClick={onNewCustomer}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, phone, Starlink ID, dish kit #..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'SUSPENDED', label: 'Suspended' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* State Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All States</option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Customer & ID</th>
                <th className="px-4 py-3">Starlink Dish Kit</th>
                <th className="px-4 py-3">Location (State/LGA)</th>
                <th className="px-4 py-3">Installment Plan</th>
                <th className="px-4 py-3">Balance & Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => onSelectCustomer(customer)}
                >
                  {/* Name & Photo */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 text-xs shrink-0 overflow-hidden border border-blue-200 dark:border-blue-800">
                        {customer.photoUrl ? (
                          <img src={customer.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          customer.fullName.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white hover:text-blue-600 transition">
                          {customer.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {customer.customerNumber} | {customer.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Starlink Kit Details */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold">
                        <Radio className="w-3 h-3 text-indigo-500" />
                        <span>{customer.starlink.dishKitNumber || 'DISH-V3-PENDING'}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Acc: {customer.starlink.starlinkAccountId}
                      </p>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{customer.town}, {customer.state}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      LGA: {customer.lga}
                    </p>
                  </td>

                  {/* Installment Duration & Due Date */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {customer.installment.duration} Plan
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {customer.installment.paymentDueDate}</span>
                    </div>
                  </td>

                  {/* Remaining Balance & Progress Bar */}
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      ₦{customer.installment.currentBalance.toLocaleString()}
                    </p>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          customer.installment.completionPercentage === 100
                            ? 'bg-emerald-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${customer.installment.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5 inline-block">
                      {customer.installment.completionPercentage}% paid
                    </span>
                  </td>

                  {/* Status Badges */}
                  <td className="px-4 py-3.5">
                    {customer.starlink.currentStatus === 'Suspended' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                        <WifiOff className="w-3 h-3" /> SUSPENDED
                      </span>
                    ) : customer.installment.status === 'Overdue' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        <AlertTriangle className="w-3 h-3" /> OVERDUE
                      </span>
                    ) : customer.installment.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRecordPaymentForCustomer(customer)}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition"
                        title="Record Payment"
                      >
                        <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                        Pay
                      </button>

                      <button
                        onClick={() => onSuspendCustomer(customer)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                          customer.starlink.currentStatus === 'Suspended'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100'
                        }`}
                        title={customer.starlink.currentStatus === 'Suspended' ? 'Reactivate Service' : 'Suspend Service'}
                      >
                        {customer.starlink.currentStatus === 'Suspended' ? 'Resume' : 'Suspend'}
                      </button>

                      <button
                        onClick={() => onSelectCustomer(customer)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {currentRole === 'SUPER_ADMIN' && (
                        <button
                          onClick={() => onDeleteCustomer(customer.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition"
                          title="Delete Record (Super Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-xs">
                    No customers found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
