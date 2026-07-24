import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  WifiOff, 
  AlertTriangle, 
  Radio, 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  RefreshCw, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { Customer, PaymentRecord } from '../types';

interface DashboardProps {
  customers: Customer[];
  payments: PaymentRecord[];
  onNewCustomer: () => void;
  onRecordPayment: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onRunAutoCheck: () => void;
  onViewTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  customers,
  payments,
  onNewCustomer,
  onRecordPayment,
  onSelectCustomer,
  onRunAutoCheck,
  onViewTab,
}) => {
  // Metrics Calculation
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.starlink.currentStatus === 'Active').length;
  const suspendedCustomers = customers.filter((c) => c.starlink.currentStatus === 'Suspended').length;
  const overdueCustomers = customers.filter((c) => c.installment.status === 'Overdue').length;
  const totalKitsInstalled = customers.filter((c) => c.starlink.dishKitNumber).length;

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.installment.currentBalance || 0), 0);
  
  // Calculate Monthly Income (Sum of all payments)
  const totalMonthlyIncome = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  const todayStr = new Date().toISOString().substring(0, 10);
  const paymentsToday = payments
    .filter((p) => p.paymentDate.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const paymentsDueTodayCount = customers.filter(
    (c) => c.installment.paymentDueDate === todayStr && c.installment.currentBalance > 0
  ).length;

  // Upcoming expirations (due within 7 days)
  const todayTime = new Date().getTime();
  const upcomingExpirationsCount = customers.filter((c) => {
    if (c.installment.currentBalance <= 0) return false;
    const dueTime = new Date(c.installment.paymentDueDate).getTime();
    const daysDiff = (dueTime - todayTime) / (1000 * 60 * 60 * 24);
    return daysDiff >= 0 && daysDiff <= 7;
  }).length;

  // Chart Data Preparation
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 850000 },
    { month: 'Feb', revenue: 920000 },
    { month: 'Mar', revenue: 1100000 },
    { month: 'Apr', revenue: 1050000 },
    { month: 'May', revenue: 1250000 },
    { month: 'Jun', revenue: 1400000 },
    { month: 'Jul', revenue: 1650000 },
  ];

  const statusDonutData = [
    { name: 'Active', value: activeCustomers, color: '#10B981' },
    { name: 'Suspended', value: suspendedCustomers, color: '#EF4444' },
    { name: 'Overdue', value: overdueCustomers, color: '#F59E0B' },
  ];

  const collectionTrendData = [
    { week: 'Wk 1', collected: 320000, target: 400000 },
    { week: 'Wk 2', collected: 450000, target: 400000 },
    { week: 'Wk 3', collected: 380000, target: 400000 },
    { week: 'Wk 4', collected: 500000, target: 400000 },
  ];

  const installmentProgressData = customers.slice(0, 5).map((c) => ({
    name: c.fullName.split(' ')[0],
    paid: c.installment.kitPrice - c.installment.currentBalance,
    remaining: c.installment.currentBalance,
  }));

  const customerGrowthData = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 18 },
    { month: 'Mar', count: 25 },
    { month: 'Apr', count: 32 },
    { month: 'May', count: 40 },
    { month: 'Jun', count: 48 },
    { month: 'Jul', count: totalCustomers },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Overdue Accounts */}
      {overdueCustomers > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm">
                Attention Required: {overdueCustomers} Customer Account(s) Overdue
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Installment payments are past due dates. Run auto-check to enforce grace period rules and service suspension.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRunAutoCheck}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
            >
              Run Auto-Check Now
            </button>
            <button
              onClick={() => onViewTab('customers')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
            >
              View Overdue List
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid (10 Key Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalCustomers}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12% this month
          </p>
        </div>

        {/* Active Customers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Active Customers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {activeCustomers}
          </p>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 mt-1">
            Service Active
          </span>
        </div>

        {/* Suspended Customers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Suspended</span>
            <WifiOff className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">
            {suspendedCustomers}
          </p>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 mt-1">
            Starlink Blocked
          </span>
        </div>

        {/* Overdue Customers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Overdue Accounts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {overdueCustomers}
          </p>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mt-1">
            Payment Pending
          </span>
        </div>

        {/* Starlink Kits Installed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Kits Installed</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalKitsInstalled}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Dish V3 Actuated
          </p>
        </div>

        {/* Monthly Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-2 truncate">
            ₦{totalMonthlyIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Collections YTD
          </p>
        </div>

        {/* Outstanding Balance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Outstanding Bal.</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2 truncate">
            ₦{totalOutstanding.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Unpaid Installments
          </p>
        </div>

        {/* Payments Received Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Paid Today</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-2 truncate">
            ₦{paymentsToday.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Today's Receipts
          </p>
        </div>

        {/* Payments Due Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Due Today</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {paymentsDueTodayCount}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Target Accounts
          </p>
        </div>

        {/* Upcoming Expirations */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Due in 7 Days</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {upcomingExpirationsCount}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Reminders Sent
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Income & Collection Revenue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Installment payments collected per month (NGN ₦)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              2026 Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Status Breakdown Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Starlink Service Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active vs Suspended vs Overdue Ratio
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2">
            {statusDonutData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-700 dark:text-slate-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts & Priority Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Collection vs Target
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              88% Collection Rate
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="collected" fill="#10B981" radius={[6, 6, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill="#64748B" radius={[6, 6, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Action: Overdue & Suspended Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Priority Action Accounts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customers requiring payment recording or Starlink suspension
                </p>
              </div>
              <button
                onClick={() => onViewTab('customers')}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {customers
                .filter((c) => c.installment.status === 'Overdue' || c.starlink.currentStatus === 'Suspended')
                .slice(0, 4)
                .map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                        {customer.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {customer.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Due: {customer.installment.paymentDueDate} | Bal: ₦{customer.installment.currentBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {customer.starlink.currentStatus === 'Suspended' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </div>
                ))}

              {customers.filter((c) => c.installment.status === 'Overdue' || c.starlink.currentStatus === 'Suspended').length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  🎉 No overdue or suspended accounts! All customer installments are up to date.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Starlink API Partner Sync</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Automated Rules Enforced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
