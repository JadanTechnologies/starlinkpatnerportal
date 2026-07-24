import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerRegistrationModal } from './components/CustomerRegistrationModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SuspensionModal } from './components/SuspensionModal';
import { ReportsView } from './components/ReportsView';
import { RemindersView } from './components/RemindersView';
import { DocumentsView } from './components/DocumentsView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';

import { storageService } from './services/storageService';
import { Customer, PaymentRecord, NotificationLog, SystemSettings, Role } from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>(() => storageService.getCurrentRole());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [settings, setSettings] = useState<SystemSettings>(() => storageService.getSettings());
  const [customers, setCustomers] = useState<Customer[]>(() => storageService.getCustomers());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => storageService.getPayments());
  const [auditLogs, setAuditLogs] = useState(() => storageService.getAuditLogs());
  const [notifications, setNotifications] = useState(() => storageService.getNotifications());

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);

  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [selectedCustomerForSuspension, setSelectedCustomerForSuspension] = useState<Customer | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  // Sync dark mode class on <html> tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived counts
  const overdueCount = customers.filter((c) => c.installment.status === 'Overdue').length;
  const suspendedCount = customers.filter((c) => c.starlink.currentStatus === 'Suspended').length;

  const adminName = currentRole === 'SUPER_ADMIN' ? 'Engr. Jadan (Super Admin)' : 'Field Admin';

  // Handlers
  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    storageService.setCurrentRole(newRole);
    if (newRole === 'ADMIN' && activeTab === 'settings') {
      setActiveTab('dashboard');
    }
  };

  const handleRunAutoCheck = () => {
    const res = storageService.runAutoCheckAndSuspend(adminName);
    setCustomers(res.updatedCustomers);
    setAuditLogs(storageService.getAuditLogs());
    setNotifications(storageService.getNotifications());
    alert(
      `Auto-check complete!\nProcessed: ${res.processedCount} accounts.\nMarked Overdue: ${res.overdueCount}\nSuspended Terminals: ${res.suspendedCount}`
    );
  };

  const handleCreateCustomer = (newCust: Customer) => {
    const updatedList = storageService.addCustomer(newCust, adminName);
    setCustomers(updatedList);
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer record?')) {
      const updatedList = storageService.deleteCustomer(id, adminName);
      setCustomers(updatedList);
      setAuditLogs(storageService.getAuditLogs());
    }
  };

  const handleRecordPayment = (payment: PaymentRecord) => {
    const { updatedCustomers, updatedPayments } = storageService.addPayment(payment, adminName);
    setCustomers(updatedCustomers);
    setPayments(updatedPayments);
    setAuditLogs(storageService.getAuditLogs());

    // Show receipt modal
    setActiveReceipt(payment);
    setIsReceiptModalOpen(true);
  };

  const handleConfirmSuspensionAction = (
    action: 'SUSPEND' | 'RESUME',
    reason: string,
    notes: string,
    paymentRef?: string,
    apiResult?: any
  ) => {
    if (!selectedCustomerForSuspension) return;

    const targetCustomer = selectedCustomerForSuspension;
    const newStarlinkStatus = action === 'SUSPEND' ? 'Suspended' : 'Active';
    const newInstallmentStatus = action === 'RESUME' ? 'Current' : 'Overdue';

    const updatedTimeline = [
      {
        id: `t-${Date.now()}`,
        title: action === 'SUSPEND' ? 'Starlink Terminal Suspended' : 'Starlink Terminal Reactivated',
        description: `${notes}. Reason: ${reason} ${paymentRef ? `(Payment Ref: ${paymentRef})` : ''}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        performedBy: adminName,
        type: (action === 'SUSPEND' ? 'SUSPENSION' : 'REACTIVATION') as any,
      },
      ...targetCustomer.timeline,
    ];

    const updatedCustomer: Customer = {
      ...targetCustomer,
      starlink: {
        ...targetCustomer.starlink,
        currentStatus: newStarlinkStatus,
      },
      installment: {
        ...targetCustomer.installment,
        status: newInstallmentStatus,
      },
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = storageService.updateCustomer(updatedCustomer, adminName);
    setCustomers(updatedList);
    setAuditLogs(storageService.getAuditLogs());
    setIsSuspensionModalOpen(false);
  };

  const handleSaveSettings = (newSettings: SystemSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleResetData = () => {
    storageService.resetToDefaults();
    setSettings(storageService.getSettings());
    setCustomers(storageService.getCustomers());
    setPayments(storageService.getPayments());
    setAuditLogs(storageService.getAuditLogs());
    setNotifications(storageService.getNotifications());
    alert('Demo data successfully reset to defaults!');
  };

  const handleAddNoteToCustomer = (customerId: string, noteText: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const updatedCust: Customer = {
      ...cust,
      adminNotes: [noteText, ...cust.adminNotes],
      updatedAt: new Date().toISOString(),
    };

    const updatedList = storageService.updateCustomer(updatedCust, adminName);
    setCustomers(updatedList);
    setSelectedCustomerForDetail(updatedCust);
  };

  const handleMarkAsPaidComplete = (cust: Customer) => {
    const updatedList = storageService.markAsPaidComplete(cust.id, adminName);
    setCustomers(updatedList);
    const updatedCust = updatedList.find((c) => c.id === cust.id) || null;
    setSelectedCustomerForDetail(updatedCust);
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleUpdatePhotoUrl = (customerId: string, photoUrl: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const updatedCust: Customer = { ...cust, photoUrl, updatedAt: new Date().toISOString() };
    const updatedList = storageService.updateCustomer(updatedCust, adminName);
    setCustomers(updatedList);
    setSelectedCustomerForDetail(updatedCust);
  };

  const handleSendManualReminder = (notif: NotificationLog) => {
    storageService.addNotification(notif);
    setNotifications(storageService.getNotifications());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        settings={settings}
        onRunAutoCheck={handleRunAutoCheck}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setActiveTab('settings')}
        overdueCount={overdueCount}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewCustomer={() => setIsNewCustomerModalOpen(true)}
          onRecordPayment={() => {
            setSelectedCustomerForPayment(null);
            setIsPaymentModalOpen(true);
          }}
          overdueCount={overdueCount}
          suspendedCount={suspendedCount}
          currentRole={currentRole}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              customers={customers}
              payments={payments}
              onNewCustomer={() => setIsNewCustomerModalOpen(true)}
              onRecordPayment={() => {
                setSelectedCustomerForPayment(null);
                setIsPaymentModalOpen(true);
              }}
              onSelectCustomer={(cust) => {
                setSelectedCustomerForDetail(cust);
                setIsDetailModalOpen(true);
              }}
              onRunAutoCheck={handleRunAutoCheck}
              onViewTab={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerList
              customers={customers}
              onSelectCustomer={(cust) => {
                setSelectedCustomerForDetail(cust);
                setIsDetailModalOpen(true);
              }}
              onRecordPaymentForCustomer={(cust) => {
                setSelectedCustomerForPayment(cust);
                setIsPaymentModalOpen(true);
              }}
              onSuspendCustomer={(cust) => {
                setSelectedCustomerForSuspension(cust);
                setIsSuspensionModalOpen(true);
              }}
              onNewCustomer={() => setIsNewCustomerModalOpen(true)}
              onDeleteCustomer={handleDeleteCustomer}
              currentRole={currentRole}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Payment Receipts & Transaction Ledger ({payments.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Record installment receipts, view payment details, and print official receipts
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomerForPayment(null);
                    setIsPaymentModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                >
                  + Record Payment
                </button>
              </div>

              {/* Payments Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
                    <tr>
                      <th className="px-4 py-3">Receipt #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Starlink Acc</th>
                      <th className="px-4 py-3">Method & Ref</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount Paid</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {p.receiptNumber}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.customerName}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{p.starlinkAccountId}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{p.paymentMethod}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{p.referenceNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{p.paymentDate}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          ₦{p.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveReceipt(p);
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition"
                          >
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'suspensions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Starlink Remote Control & Service Suspension Module
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage direct API interactions or manual workflow tickets to suspend and reactivate terminals.
                </p>
              </div>

              <CustomerList
                customers={customers.filter((c) => c.starlink.currentStatus === 'Suspended' || c.installment.status === 'Overdue')}
                onSelectCustomer={(cust) => {
                  setSelectedCustomerForDetail(cust);
                  setIsDetailModalOpen(true);
                }}
                onRecordPaymentForCustomer={(cust) => {
                  setSelectedCustomerForPayment(cust);
                  setIsPaymentModalOpen(true);
                }}
                onSuspendCustomer={(cust) => {
                  setSelectedCustomerForSuspension(cust);
                  setIsSuspensionModalOpen(true);
                }}
                onNewCustomer={() => setIsNewCustomerModalOpen(true)}
                onDeleteCustomer={handleDeleteCustomer}
                currentRole={currentRole}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {activeTab === 'reminders' && (
            <RemindersView
              customers={customers}
              notifications={notifications}
              settings={settings}
              onSendManualReminder={handleSendManualReminder}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              customers={customers}
              payments={payments}
              settings={settings}
            />
          )}

          {activeTab === 'documents' && <DocumentsView customers={customers} />}

          {activeTab === 'audit' && <AuditLogView auditLogs={auditLogs} currentRole={currentRole} />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              currentRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <CustomerRegistrationModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />

      <CustomerDetailModal
        customer={selectedCustomerForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRecordPayment={(cust) => {
          setIsDetailModalOpen(false);
          setSelectedCustomerForPayment(cust);
          setIsPaymentModalOpen(true);
        }}
        onSuspendCustomer={(cust) => {
          setIsDetailModalOpen(false);
          setSelectedCustomerForSuspension(cust);
          setIsSuspensionModalOpen(true);
        }}
        onMarkAsPaidComplete={handleMarkAsPaidComplete}
        payments={payments}
        settings={settings}
        currentRole={currentRole}
        onAddNote={handleAddNoteToCustomer}
        onUpdatePhotoUrl={handleUpdatePhotoUrl}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomerForPayment}
        onSubmitPayment={handleRecordPayment}
      />

      <ReceiptModal
        payment={activeReceipt}
        settings={settings}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <SuspensionModal
        customer={selectedCustomerForSuspension}
        settings={settings}
        isOpen={isSuspensionModalOpen}
        onClose={() => setIsSuspensionModalOpen(false)}
        onConfirmAction={handleConfirmSuspensionAction}
        adminName={adminName}
      />
    </div>
  );
}
