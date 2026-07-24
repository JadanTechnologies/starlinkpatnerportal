import React from 'react';
import { X, Printer, ShieldCheck, Download, Radio, CheckCircle2 } from 'lucide-react';
import { PaymentRecord, SystemSettings } from '../types';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  settings: SystemSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  settings,
  onClose,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-slate-900">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-slate-600">Official Payment Receipt Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content Printable Area */}
        <div id="printable-receipt" className="p-8 space-y-6">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-black text-lg tracking-tight">
                <Radio className="w-6 h-6 text-blue-600" />
                <span>{settings.companyName}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs">
                {settings.address}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Phone: {settings.phone} | Email: {settings.email}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg uppercase">
                Official Receipt
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                {payment.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-400">
                Date: {payment.paymentDate}
              </p>
            </div>
          </div>

          {/* Customer & Starlink Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payer / Customer</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{payment.customerName}</p>
              <p className="text-slate-500 font-mono text-[11px]">Phone: {payment.customerPhone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starlink Account ID</p>
              <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{payment.starlinkAccountId}</p>
              <p className="text-slate-500 text-[11px]">Terminal Partner Managed</p>
            </div>
          </div>

          {/* Payment breakdown table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Method</th>
                  <th className="py-2 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3">
                    <p className="font-bold text-slate-900">Starlink Kit Installment Payment</p>
                    <p className="text-[10px] text-slate-400 font-mono">Ref: {payment.referenceNumber} {payment.bankName ? `(${payment.bankName})` : ''}</p>
                  </td>
                  <td className="py-3 text-center font-semibold text-slate-700">
                    {payment.paymentMethod}
                  </td>
                  <td className="py-3 text-right font-black text-emerald-600 text-sm">
                    ₦{payment.amountPaid.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Balance summary */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Previous Balance:</span>
              <span className="font-mono">₦{payment.previousBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Amount Received:</span>
              <span className="font-mono">- ₦{payment.amountPaid.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-extrabold text-sm">
              <span>New Remaining Balance:</span>
              <span className="font-mono text-blue-400">₦{payment.newBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer stamp & signature area */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[9px] font-mono text-slate-400 text-center leading-tight">
                [JSPMS QR CODE]
              </div>
              <div className="text-[10px] text-slate-400">
                <p className="font-bold text-slate-700">Verified System Receipt</p>
                <p>Issued by: {payment.receivedBy}</p>
                <p>Jadan Tech Solutions Nig Ltd</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <p className="text-[10px] font-bold text-slate-600">Authorized Signature</p>
            </div>
          </div>

          {/* Receipt Footer Notice */}
          <p className="text-[9px] text-center text-slate-400 italic">
            Thank you for choosing Jadan Tech Solutions Nig Ltd. All payments are subject to installment terms.
          </p>
        </div>
      </div>
    </div>
  );
};
