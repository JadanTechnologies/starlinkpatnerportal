import React, { useState } from 'react';
import { 
  X, 
  WifiOff, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Code2, 
  RefreshCw, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { Customer, SystemSettings } from '../types';
import { starlinkApiService, StarlinkApiResponse } from '../services/starlinkApi';

interface SuspensionModalProps {
  customer: Customer | null;
  settings: SystemSettings;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAction: (
    action: 'SUSPEND' | 'RESUME',
    reason: string,
    notes: string,
    paymentRef?: string,
    apiResult?: StarlinkApiResponse
  ) => void;
  adminName: string;
}

export const SuspensionModal: React.FC<SuspensionModalProps> = ({
  customer,
  settings,
  isOpen,
  onClose,
  onConfirmAction,
  adminName,
}) => {
  if (!isOpen || !customer) return null;

  const isCurrentlySuspended = customer.starlink.currentStatus === 'Suspended';
  const targetAction = isCurrentlySuspended ? 'RESUME' : 'SUSPEND';

  const [reason, setReason] = useState<string>(
    isCurrentlySuspended
      ? 'Full overdue payment received & verified by finance department.'
      : 'Installment payment overdue past 5-day grace period.'
  );
  const [paymentRef, setPaymentRef] = useState<string>('TRF-GTB-88392019481');
  const [notes, setNotes] = useState<string>('Executed via Starlink Remote Control Center.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<StarlinkApiResponse | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState<boolean>(false);

  const handleExecuteAction = async () => {
    setIsLoading(true);
    let result: StarlinkApiResponse;

    if (targetAction === 'SUSPEND') {
      result = await starlinkApiService.suspendAccount(customer, reason, adminName, settings);
    } else {
      result = await starlinkApiService.resumeAccount(customer, paymentRef, adminName, settings);
    }

    setApiResult(result);
    setIsLoading(false);

    // Trigger parent state update
    onConfirmAction(targetAction, reason, notes, paymentRef, result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 ${
            targetAction === 'SUSPEND'
              ? 'bg-red-50 dark:bg-red-950/30'
              : 'bg-emerald-50 dark:bg-emerald-950/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl text-white ${
                targetAction === 'SUSPEND' ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {targetAction === 'SUSPEND' ? <WifiOff className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {targetAction === 'SUSPEND' ? 'Suspend Starlink Service' : 'Resume / Reactivate Starlink Service'}
              </h2>
              <p className="text-xs text-slate-500">
                Remote Control Terminal Action: {customer.fullName} ({customer.customerNumber})
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Integration Mode Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-600" /> Starlink Integration Layer Mode
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  settings.starlinkWorkflowMode === 'AUTOMATED_API'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                }`}
              >
                {settings.starlinkWorkflowMode === 'AUTOMATED_API' ? 'AUTOMATED PARTNER API' : 'MANUAL WORKFLOW'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono pt-1">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Starlink Account ID</span>
                <span className="font-bold">{customer.starlink.starlinkAccountId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Dish Kit Number</span>
                <span className="font-bold">{customer.starlink.dishKitNumber}</span>
              </div>
            </div>
          </div>

          {/* Action Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {targetAction === 'SUSPEND' ? 'Suspension Reason *' : 'Reactivation Reason *'}
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {targetAction === 'RESUME' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Reference / Receipt Number *
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. JSPMS-RCP-1042 / TRF-GTB-8839201"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Notes & Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* API Execution Output Preview */}
          {apiResult && (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-1.5 border border-slate-800">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> API Response {apiResult.statusCode} OK
                </span>
                <span className="text-[10px] text-slate-400">{apiResult.requestId}</span>
              </div>
              <p className="text-slate-300 text-[11px]">{apiResult.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPayloadModal(!showPayloadModal)}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <Code2 className="w-3.5 h-3.5" /> Toggle API Payload Preview
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleExecuteAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center gap-1.5 ${
                  targetAction === 'SUSPEND'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : targetAction === 'SUSPEND' ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>
                  {targetAction === 'SUSPEND' ? 'Confirm & Suspend Service' : 'Confirm & Reactivate Service'}
                </span>
              </button>
            </div>
          </div>

          {/* Payload Inspection Drawer */}
          {showPayloadModal && (
            <div className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
              <p className="text-slate-500 mb-1">// Endpoint: POST /v1/accounts/partner/service-control</p>
              <pre>
                {JSON.stringify(
                  {
                    partnerId: settings.starlinkPartnerId,
                    environment: settings.starlinkEnvironment,
                    action: targetAction === 'SUSPEND' ? 'SUSPEND_SERVICE' : 'RESUME_SERVICE',
                    targetAccount: {
                      starlinkAccountId: customer.starlink.starlinkAccountId,
                      terminalId: customer.starlink.terminalId,
                      dishKitNumber: customer.starlink.dishKitNumber,
                    },
                    reason,
                    paymentRef: targetAction === 'RESUME' ? paymentRef : undefined,
                    initiatedBy: adminName,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
