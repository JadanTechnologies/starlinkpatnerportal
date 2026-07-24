import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Calculator, DollarSign, Building2, User } from 'lucide-react';
import { Customer, PaymentMethod, PaymentRecord } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomer?: Customer | null;
  onSubmitPayment: (payment: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onSubmitPayment,
}) => {
  const [customerId, setCustomerId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(100000);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>(`TRF-GTB-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [bankName, setBankName] = useState<string>('GTBank');
  const [receivedBy, setReceivedBy] = useState<string>('Super Admin');
  const [notes, setNotes] = useState<string>('Installment payment received for Starlink Kit.');

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerId(selectedCustomer.id);
      if (selectedCustomer.installment.monthlyInstallment) {
        setAmountPaid(selectedCustomer.installment.monthlyInstallment);
      }
    } else if (customers.length > 0) {
      setCustomerId(customers[0].id);
      setAmountPaid(customers[0].installment.monthlyInstallment);
    }
  }, [selectedCustomer, customers]);

  if (!isOpen) return null;

  const currentCustomer = customers.find((c) => c.id === customerId) || selectedCustomer;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    const receiptNum = `JSPMS-RCP-${Math.floor(1000 + Math.random() * 9000)}`;
    const previousBal = currentCustomer.installment.currentBalance;
    const newBal = Math.max(0, previousBal - amountPaid);

    const paymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      customerId: currentCustomer.id,
      customerName: currentCustomer.fullName,
      customerPhone: currentCustomer.phone,
      starlinkAccountId: currentCustomer.starlink.starlinkAccountId,
      amountPaid: Number(amountPaid),
      paymentDate,
      paymentMethod,
      referenceNumber,
      bankName: paymentMethod === 'Transfer' || paymentMethod === 'Bank' ? bankName : undefined,
      receivedBy,
      notes,
      previousBalance: previousBal,
      newBalance: newBal,
      createdAt: new Date().toISOString(),
    };

    onSubmitPayment(paymentRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Record Installment Payment
              </h2>
              <p className="text-xs text-slate-500">
                Jadan Tech Solutions Nig Ltd Financial Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Select Customer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Customer Account *
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                const cust = customers.find((c) => c.id === e.target.value);
                if (cust) setAmountPaid(cust.installment.monthlyInstallment);
              }}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerNumber}) - Bal: ₦{c.installment.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Current Balance & Calculation Banner */}
          {currentCustomer && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Quick Payment Presets:</span>
                <button
                  type="button"
                  onClick={() => setAmountPaid(currentCustomer.installment.monthlyInstallment)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 transition"
                >
                  1 Month (₦{currentCustomer.installment.monthlyInstallment.toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(currentCustomer.installment.monthlyInstallment * 2)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 transition text-emerald-600 dark:text-emerald-400"
                >
                  Advance 2 Mo (₦{(currentCustomer.installment.monthlyInstallment * 2).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(currentCustomer.installment.monthlyInstallment * 3)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 transition text-emerald-600 dark:text-emerald-400"
                >
                  Advance 3 Mo (₦{(currentCustomer.installment.monthlyInstallment * 3).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(currentCustomer.installment.currentBalance)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Pay Full Balance (₦{currentCustomer.installment.currentBalance.toLocaleString()})
                </button>
              </div>

              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-500">Previous Outstanding:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">₦{currentCustomer.installment.currentBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-500">Amount Being Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">- ₦{Number(amountPaid || 0).toLocaleString()}</span>
              </div>

              {/* Advance Payment Indicator */}
              {Number(amountPaid) > currentCustomer.installment.monthlyInstallment && (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                  <span>⚡ Advance Payment Detected</span>
                  <span>Covers ~{Math.floor(Number(amountPaid) / currentCustomer.installment.monthlyInstallment)} Months Upfront</span>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">New Outstanding Balance:</span>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-black">
                  ₦{Math.max(0, currentCustomer.installment.currentBalance - (Number(amountPaid) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount Paid (NGN ₦) *
              </label>
              <input
                type="number"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Transfer">Bank Transfer</option>
                <option value="POS">POS Terminal</option>
                <option value="Bank">Bank Direct Deposit</option>
                <option value="Cash">Cash Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank / Gateway Name
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="GTBank">GTBank</option>
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="UBA">UBA</option>
                <option value="Access Bank">Access Bank</option>
                <option value="Moniepoint POS">Moniepoint POS</option>
                <option value="OPay">OPay</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reference / Teller / Transaction ID *
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Received By (Admin)
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Memo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Record & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
