import React, { useState } from 'react';
import { 
  X, 
  User, 
  Radio, 
  Calculator, 
  MapPin, 
  FileText, 
  Upload, 
  Check, 
  Sparkles,
  Camera
} from 'lucide-react';
import { Customer, InstallmentDuration } from '../types';

interface CustomerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
}

export const CustomerRegistrationModal: React.FC<CustomerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Eti-Osa');
  const [town, setTown] = useState('Lekki');
  const [gpsCoordinates, setGpsCoordinates] = useState('6.4474, 3.4723');
  const [installationAddress, setInstallationAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Starlink Details
  const [starlinkEmail, setStarlinkEmail] = useState('');
  const [starlinkAccountId, setStarlinkAccountId] = useState(`ACC-NG-${Math.floor(10000 + Math.random() * 90000)}`);
  const [terminalId, setTerminalId] = useState(`TERM-${Math.floor(100000 + Math.random() * 900000)}-01`);
  const [serialNumber, setSerialNumber] = useState(`KIT-SL-${Math.floor(1000000 + Math.random() * 9000000)}-NG`);
  const [dishKitNumber, setDishKitNumber] = useState(`DISH-V3-${Math.floor(100000 + Math.random() * 900000)}`);
  const [activationDate, setActivationDate] = useState(new Date().toISOString().substring(0, 10));
  const [subscriptionPlan, setSubscriptionPlan] = useState<'Standard' | 'Priority' | 'Mobile Regional'>('Standard');
  const [monthlySubscriptionCost, setMonthlySubscriptionCost] = useState(38000);
  const [technician, setTechnician] = useState('Engr. Chukwuma Eze');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2027-07-24');

  // Installment Plan
  const [kitPrice, setKitPrice] = useState(950000);
  const [downPayment, setDownPayment] = useState(350000);
  const [duration, setDuration] = useState<InstallmentDuration>('6 Months');
  const [dueDate, setDueDate] = useState('2026-08-24');
  const [gracePeriodDays, setGracePeriodDays] = useState(5);
  const [penaltyFee, setPenaltyFee] = useState(15000);

  // Photo
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  // Auto-calculated values
  const remainingBalance = Math.max(0, kitPrice - downPayment);
  const monthsCount = duration === '3 Months' ? 3 : duration === '6 Months' ? 6 : 12;
  const monthlyInstallment = Math.round(remainingBalance / monthsCount);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCustomerNumber = `JSPMS-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      customerNumber: newCustomerNumber,
      photoUrl,
      fullName: fullName || 'New Customer',
      phone: phone || '08000000000',
      altPhone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      nationalId: nationalId || 'NIN-00000000000',
      businessName,
      occupation,
      homeAddress: homeAddress || 'Lagos Address',
      state,
      lga,
      town,
      gpsCoordinates,
      installationAddress: installationAddress || homeAddress || 'Site Address',
      customerNotes,

      starlink: {
        starlinkEmail: starlinkEmail || email || 'starlink@example.com',
        starlinkAccountId,
        terminalId,
        serialNumber,
        dishKitNumber,
        activationDate,
        subscriptionPlan,
        monthlySubscriptionCost,
        currentStatus: 'Active',
        installationTechnician: technician,
        installationDate: activationDate,
        warrantyExpiry,
      },

      installment: {
        kitPrice,
        downPayment,
        remainingBalance,
        duration,
        monthlyInstallment,
        paymentDueDate: dueDate,
        gracePeriodDays,
        penaltyFee,
        currentBalance: remainingBalance,
        completionPercentage: Math.round(((kitPrice - remainingBalance) / kitPrice) * 100),
        status: remainingBalance === 0 ? 'Completed' : 'Current',
      },

      documents: [
        {
          id: `doc-${Date.now()}-1`,
          title: 'Signed Installment Agreement.pdf',
          category: 'Contract',
          uploadDate: new Date().toISOString().substring(0, 10),
          fileType: 'application/pdf',
          size: '1.1 MB',
        },
      ],

      timeline: [
        {
          id: `t-${Date.now()}`,
          title: 'Customer Registered & Starlink Kit Assigned',
          description: `Registered with ${duration} installment plan. Initial down payment recorded: ₦${downPayment.toLocaleString()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          performedBy: 'System Admin',
          type: 'REGISTRATION',
        },
      ],

      adminNotes: ['Customer account initialized.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Register Customer & Assign Starlink Kit
            </h2>
            <p className="text-xs text-slate-500">
              Jadan Tech Solutions Nig Ltd Customer Onboarding
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-8 py-3 bg-blue-50/50 dark:bg-blue-950/20 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 transition ${activeStep === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Personal & Location</span>
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 transition ${activeStep === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Starlink Kit Details</span>
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 transition ${activeStep === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Installment Plan</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Personal & Location */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/60 overflow-hidden shrink-0 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-xs">
                  <img src={photoUrl} alt="Customer Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Customer Photograph / Passport Picture</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload a custom profile photo from device or provide an image link</p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setPhotoUrl(`https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*100000)}?w=150&auto=format&fit=crop`)}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Random Sample
                    </button>
                  </div>

                  <input
                    type="text"
                    value={photoUrl.startsWith('data:') ? '[Uploaded Image File]' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full mt-1 px-3 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babatunde Ogunlesi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alternative Phone</label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="e.g. 08129876543"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">National ID (NIN / License) *</label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. NIN-92810482910"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Business Name (Optional)</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Jadan Agro Ventures"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Location & Installation Address
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {['Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Enugu', 'Delta', 'Kaduna', 'Ogun'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">LGA *</label>
                    <input
                      type="text"
                      value={lga}
                      onChange={(e) => setLga(e.target.value)}
                      placeholder="e.g. Eti-Osa"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Town / City *</label>
                    <input
                      type="text"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      placeholder="e.g. Lekki Phase 1"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Installation Address *</label>
                  <input
                    type="text"
                    required
                    value={installationAddress}
                    onChange={(e) => setInstallationAddress(e.target.value)}
                    placeholder="Specific site location for Starlink Dish mounting"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Starlink Kit Info */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-indigo-600" /> Starlink Remote Control Hardware Setup
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1">
                  Terminal IDs and Dish Kit numbers are registered on the Jadan Tech Solutions Starlink Partner Portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Starlink Account Email *</label>
                  <input
                    type="email"
                    required
                    value={starlinkEmail}
                    onChange={(e) => setStarlinkEmail(e.target.value)}
                    placeholder="e.g. starlink.acc@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Starlink Account ID *</label>
                  <input
                    type="text"
                    required
                    value={starlinkAccountId}
                    onChange={(e) => setStarlinkAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dish Kit Number (Serial) *</label>
                  <input
                    type="text"
                    required
                    value={dishKitNumber}
                    onChange={(e) => setDishKitNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Terminal Hardware ID *</label>
                  <input
                    type="text"
                    required
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subscription Plan *</label>
                  <select
                    value={subscriptionPlan}
                    onChange={(e) => {
                      const plan = e.target.value as any;
                      setSubscriptionPlan(plan);
                      if (plan === 'Priority') setMonthlySubscriptionCost(65000);
                      else if (plan === 'Mobile Regional') setMonthlySubscriptionCost(49000);
                      else setMonthlySubscriptionCost(38000);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Standard">Standard (₦38,000/mo)</option>
                    <option value="Priority">Priority Business (₦65,000/mo)</option>
                    <option value="Mobile Regional">Mobile Regional (₦49,000/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Installation Technician</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Installment Plan */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" /> Installment Payment Plan Summary
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold pt-1">
                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Kit Price</span>
                    <span className="text-slate-900 dark:text-white text-sm font-extrabold">₦{kitPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Down Payment</span>
                    <span className="text-slate-900 dark:text-white text-sm font-extrabold">₦{downPayment.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Remaining Balance</span>
                    <span className="text-emerald-700 dark:text-emerald-300 text-sm font-extrabold">₦{remainingBalance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Monthly Payment</span>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-extrabold">₦{monthlyInstallment.toLocaleString()} / mo</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Starlink Kit Price (NGN ₦) *</label>
                  <input
                    type="number"
                    required
                    value={kitPrice}
                    onChange={(e) => setKitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Down Payment Received (NGN ₦) *</label>
                  <input
                    type="number"
                    required
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Installment Duration *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as InstallmentDuration)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="3 Months">3 Months Plan</option>
                    <option value="6 Months">6 Months Plan</option>
                    <option value="12 Months">12 Months Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Installment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Overdue Penalty Fee (NGN ₦)</label>
                  <input
                    type="number"
                    value={penaltyFee}
                    onChange={(e) => setPenaltyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Complete Customer Registration</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
