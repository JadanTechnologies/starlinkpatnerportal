import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { Customer, NotificationLog, SystemSettings } from '../types';

interface RemindersViewProps {
  customers: Customer[];
  notifications: NotificationLog[];
  settings: SystemSettings;
  onSendManualReminder: (notif: NotificationLog) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  customers,
  notifications,
  settings,
  onSendManualReminder,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [channel, setChannel] = useState<'SMS' | 'Email' | 'WhatsApp'>('SMS');
  const [customMessage, setCustomMessage] = useState<string>(
    'Dear Customer, your Starlink installment payment is due. Please make payment to Jadan Tech Solutions Nig Ltd account.'
  );

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.fullName,
      type: 'MANUAL',
      channel,
      recipient: channel === 'Email' ? cust.email : cust.phone,
      message: customMessage,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'SENT',
    };

    onSendManualReminder(newNotif);
    alert(`Reminder sent successfully to ${cust.fullName} via ${channel}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-600" /> Automated Payment Reminders & SMS Gateway
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-channel notifications (SMS, Email, WhatsApp) for installment payment schedules
          </p>
        </div>
      </div>

      {/* Grid: Schedule Rules vs Manual Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Rules Config */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Automated Reminder Schedule Matrix
          </h3>

          <div className="space-y-2.5 text-xs">
            {[
              { label: '7 Days Before Due Date', enabled: settings.reminder7DaysBefore, desc: 'Friendly early reminder with payment bank details' },
              { label: '3 Days Before Due Date', enabled: settings.reminder3DaysBefore, desc: 'Urgent reminder before due date' },
              { label: 'On Payment Due Date', enabled: settings.reminderOnDueDate, desc: 'Payment due notice' },
              { label: '1 Day After Due Date (Overdue)', enabled: settings.reminder1DayAfter, desc: 'Overdue alert with grace period countdown' },
              { label: '7 Days After Due Date (Suspension Alert)', enabled: settings.reminder7DaysAfter, desc: 'Starlink service suspension warning' },
              { label: '30 Days After Due Date (Legal Notice)', enabled: settings.reminder30DaysAfter, desc: 'Recovery team legal notice' },
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rule.label}</p>
                  <p className="text-[10px] text-slate-500">{rule.desc}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Instant Trigger Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Send Instant Manual Reminder
          </h3>

          <form onSubmit={handleSendReminderSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Target Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone}) - Due: {c.installment.paymentDueDate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Channel *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SMS', label: 'SMS Gateway', icon: Smartphone },
                  { id: 'Email', label: 'Email', icon: Mail },
                  { id: 'WhatsApp', label: 'WhatsApp API', icon: MessageSquare },
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setChannel(ch.id as any)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border font-bold transition ${
                        channel === ch.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ch.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send Reminder Now
            </button>
          </form>
        </div>
      </div>

      {/* Reminder Activity Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Notification History Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Customer Name</th>
                <th className="px-4 py-2.5">Type & Channel</th>
                <th className="px-4 py-2.5">Recipient</th>
                <th className="px-4 py-2.5">Message Content</th>
                <th className="px-4 py-2.5">Sent At</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {notifications.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{log.customerName}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{log.type} ({log.channel})</td>
                  <td className="px-4 py-3 font-mono">{log.recipient}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.message}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{log.sentAt}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
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
