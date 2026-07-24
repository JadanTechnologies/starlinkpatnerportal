import React, { useState } from 'react';
import { 
  X, 
  User, 
  Radio, 
  CreditCard, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Clock, 
  FolderOpen, 
  Plus, 
  Printer, 
  Send, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck,
  Calendar,
  ExternalLink,
  Award,
  BadgeCheck,
  Camera
} from 'lucide-react';
import { Customer, PaymentRecord, SystemSettings, Role } from '../types';
import { InstallationMapView } from './InstallationMapView';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (customer: Customer) => void;
  onSuspendCustomer: (customer: Customer) => void;
  onMarkAsPaidComplete?: (customer: Customer) => void;
  payments: PaymentRecord[];
  settings: SystemSettings;
  currentRole: Role;
  onAddNote: (customerId: string, note: string) => void;
  onUpdatePhotoUrl?: (customerId: string, photoUrl: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onRecordPayment,
  onSuspendCustomer,
  onMarkAsPaidComplete,
  payments,
  settings,
  currentRole,
  onAddNote,
  onUpdatePhotoUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'payments' | 'documents' | 'timeline' | 'map' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  if (!isOpen || !customer) return null;

  const customerPayments = payments.filter((p) => p.customerId === customer.id);

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(customer.id, newNote);
    setNewNote('');
  };

  const handleSavePhotoUrl = () => {
    if (photoUrlInput.trim() && onUpdatePhotoUrl) {
      onUpdatePhotoUrl(customer.id, photoUrlInput.trim());
    }
    setEditingPhoto(false);
  };

  const handlePrintProfile = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 text-slate-900 dark:text-white">
        {/* Top Header Banner */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white print:bg-white print:text-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group w-16 h-16 rounded-2xl bg-blue-100 border-2 border-white/20 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-800 text-xl shadow-md">
                {customer.photoUrl ? (
                  <img src={customer.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  customer.fullName.substring(0, 2).toUpperCase()
                )}
                <button
                  onClick={() => {
                    setPhotoUrlInput(customer.photoUrl || '');
                    setEditingPhoto(!editingPhoto);
                  }}
                  className="absolute inset-0 bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold gap-1 print:hidden"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" /> Photo
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight">{customer.fullName}</h2>
                  {customer.installment.status === 'Completed' ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white uppercase shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PAID COMPLETE
                    </span>
                  ) : customer.starlink.currentStatus === 'Suspended' ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white uppercase shadow-xs">
                      SUSPENDED
                    </span>
                  ) : customer.installment.status === 'Overdue' ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white uppercase shadow-xs">
                      OVERDUE
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white uppercase shadow-xs">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  ID: {customer.customerNumber} | Phone: {customer.phone} | State: {customer.state}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Starlink Account: <span className="font-mono font-bold text-amber-300">{customer.starlink.starlinkAccountId}</span> | Serial: {customer.starlink.dishKitNumber}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {customer.installment.status !== 'Completed' && onMarkAsPaidComplete && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to mark ${customer.fullName}'s installment plan as PAID COMPLETE? This will clear the remaining balance (₦${customer.installment.currentBalance.toLocaleString()}) and activate service.`)) {
                      onMarkAsPaidComplete(customer);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  title="Mark installment plan as fully settled/paid off"
                >
                  <BadgeCheck className="w-4 h-4 text-emerald-300" />
                  <span>Mark Paid Complete</span>
                </button>
              )}

              <button
                onClick={() => onRecordPayment(customer)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => onSuspendCustomer(customer)}
                className={`px-3.5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition flex items-center gap-1.5 ${
                  customer.starlink.currentStatus === 'Suspended'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <WifiOff className="w-4 h-4" />
                <span>{customer.starlink.currentStatus === 'Suspended' ? 'Reactivate' : 'Suspend'}</span>
              </button>
            </div>
          </div>

          {/* Edit Photo Input Popover */}
          {editingPhoto && (
            <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 text-xs print:hidden">
              <input
                type="text"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="Paste avatar / profile photo image URL..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white placeholder-slate-400 border border-white/20"
              />
              <button
                onClick={handleSavePhotoUrl}
                className="px-3 py-1.5 font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
              >
                Save Photo
              </button>
              <button
                onClick={() => setEditingPhoto(false)}
                className="px-3 py-1.5 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Nav Tabs */}
        <div className="flex items-center gap-1 px-6 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-bold print:hidden">
          {[
            { id: 'overview', label: 'Overview & Kit Specs', icon: Radio },
            { id: 'profile', label: 'Customer Profile Card', icon: User },
            { id: 'payments', label: `Payments (${customerPayments.length})`, icon: CreditCard },
            { id: 'documents', label: `Documents (${customer.documents.length})`, icon: FolderOpen },
            { id: 'timeline', label: 'Activity Timeline', icon: Clock },
            { id: 'map', label: 'Installation Map', icon: MapPin },
            { id: 'notes', label: `Admin Notes (${customer.adminNotes.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Installment Progress Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Installment Plan Summary ({customer.installment.duration})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kit Price: ₦{customer.installment.kitPrice.toLocaleString()} | Down Payment: ₦{customer.installment.downPayment.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                    ₦{customer.installment.currentBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">Bal</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Progress ({customer.installment.completionPercentage}% Paid)</span>
                    <span>Monthly: ₦{customer.installment.monthlyInstallment.toLocaleString()} / mo</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                      style={{ width: `${customer.installment.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Due Date</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{customer.installment.paymentDueDate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Grace Period</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{customer.installment.gracePeriodDays} Days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Penalty Rule</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">₦{customer.installment.penaltyFee.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Installment Status</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{customer.installment.status}</span>
                  </div>
                </div>
              </div>

              {/* Grid: Personal vs Starlink Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal & Location Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" /> Customer Information
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-bold">{customer.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Phone</span>
                      <span className="font-mono font-bold">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Email</span>
                      <span className="font-mono">{customer.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">National ID</span>
                      <span className="font-mono font-bold">{customer.nationalId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Business Name</span>
                      <span>{customer.businessName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">State / LGA</span>
                      <span>{customer.state} ({customer.lga})</span>
                    </div>
                  </div>
                </div>

                {/* Starlink Hardware Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-indigo-600" /> Starlink Kit Hardware Details
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Starlink Account Email</span>
                      <span className="font-mono font-bold">{customer.starlink.starlinkEmail}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Dish Serial Number</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{customer.starlink.serialNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Terminal Hardware ID</span>
                      <span className="font-mono">{customer.starlink.terminalId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Subscription Plan</span>
                      <span className="font-bold">{customer.starlink.subscriptionPlan} (₦{customer.starlink.monthlySubscriptionCost.toLocaleString()}/mo)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-750">
                      <span className="text-slate-400">Installation Tech</span>
                      <span>{customer.starlink.installationTechnician}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Warranty Expiry</span>
                      <span>{customer.starlink.warrantyExpiry}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FULL PROFILE CARD TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between print:hidden">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" /> Customer Official Profile & Field Card
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive digital profile card for field technicians and audit records
                  </p>
                </div>
                <button
                  onClick={handlePrintProfile}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print / Export Profile Sheet
                </button>
              </div>

              {/* Printable Profile Card Container */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 text-slate-900 dark:text-white print:p-0 print:border-none print:shadow-none">
                {/* Profile Header Block */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-md">
                  <div className="w-24 h-24 rounded-2xl bg-blue-100 border-4 border-white/20 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-800 text-3xl shadow-lg">
                    {customer.photoUrl ? (
                      <img src={customer.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      customer.fullName.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-black">{customer.fullName}</h2>
                      {customer.installment.status === 'Completed' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white uppercase tracking-wider">
                          PAID COMPLETE
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white uppercase tracking-wider">
                          {customer.installment.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-200 font-mono">
                      Customer Reg ID: <span className="font-bold text-white">{customer.customerNumber}</span> • Registered: {customer.createdAt.substring(0, 10)}
                    </p>
                    <p className="text-xs text-slate-300">
                      National NIN / ID: <span className="font-mono font-bold text-amber-300">{customer.nationalId}</span> • Phone: <span className="font-mono font-bold text-white">{customer.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Profile Detail Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Contact & Residential */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Personal & Contact Metadata
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-mono font-bold">{customer.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Business / Trade Name</span>
                        <span className="font-bold">{customer.businessName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">State of Residence</span>
                        <span className="font-bold">{customer.state}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">LGA & Town</span>
                        <span>{customer.lga}, {customer.town}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Home / Office Address</span>
                        <span className="font-semibold">{customer.homeAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GPS Coordinates</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{customer.gpsCoordinates}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware & Terminal */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Radio className="w-4 h-4" /> Starlink Hardware & Terminal Sheet
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Starlink Account Email</span>
                        <span className="font-mono font-bold">{customer.starlink.starlinkEmail}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Starlink Account ID</span>
                        <span className="font-mono font-bold text-amber-500">{customer.starlink.starlinkAccountId}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Dish Kit Number</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{customer.starlink.dishKitNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Hardware Serial #</span>
                        <span className="font-mono">{customer.starlink.serialNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                        <span className="text-slate-500">Service Plan</span>
                        <span className="font-bold">{customer.starlink.subscriptionPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Installation Technician</span>
                        <span className="font-semibold">{customer.starlink.installationTechnician}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Installment Ledger */}
                  <div className="md:col-span-2 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                    <h4 className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Installment Payment & Settlement Status
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Kit Price</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">₦{customer.installment.kitPrice.toLocaleString()}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Down Payment Paid</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₦{customer.installment.downPayment.toLocaleString()}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Balance</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">₦{customer.installment.currentBalance.toLocaleString()}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Plan Status</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{customer.installment.status} ({customer.installment.completionPercentage}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>JADAN TECH SOLUTIONS NIG LTD • Official Customer File</span>
                  <span>System Verified ID • {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Payment Ledger & Receipts ({customerPayments.length})
                </h3>
                <button
                  onClick={() => onRecordPayment(customer)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Record New Payment
                </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Receipt #</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                    {customerPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {payment.receiptNumber}
                        </td>
                        <td className="px-4 py-3">{payment.paymentDate}</td>
                        <td className="px-4 py-3 font-semibold">{payment.paymentMethod}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{payment.referenceNumber}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          ₦{payment.amountPaid.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {customerPayments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          No payments recorded yet for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Customer Agreement & KYC Documents</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customer.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</p>
                          <p className="text-[10px] text-slate-400">{doc.category} • {doc.size} • {doc.uploadDate}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Timeline & Service History</h3>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {customer.timeline.map((item) => (
                  <div key={item.id} className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900"></span>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
                      <p className="text-[10px] text-slate-400 italic">By: {item.performedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INSTALLATION MAP TAB */}
          {activeTab === 'map' && (
            <InstallationMapView customer={customer} />
          )}

          {/* ADMIN NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNoteSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal admin memo regarding this customer..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-2">
                {customer.adminNotes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <p className="text-slate-800 dark:text-slate-200">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
