export const ALL_NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT (Abuja)',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara'
];

export type Role = 'SUPER_ADMIN' | 'ADMIN';

export type CustomerStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';

export type InstallmentDuration = '3 Months' | '6 Months' | '12 Months';

export type PaymentMethod = 'Cash' | 'Transfer' | 'POS' | 'Bank';

export interface StarlinkKitInfo {
  starlinkEmail: string;
  starlinkAccountId: string;
  terminalId: string;
  serialNumber: string;
  dishKitNumber: string;
  activationDate: string;
  subscriptionPlan: 'Standard' | 'Priority' | 'Mobile Regional';
  monthlySubscriptionCost: number;
  currentStatus: 'Active' | 'Suspended' | 'Pending';
  installationTechnician: string;
  installationDate: string;
  warrantyExpiry: string;
}

export interface InstallmentPlanInfo {
  kitPrice: number;
  downPayment: number;
  remainingBalance: number;
  duration: InstallmentDuration;
  monthlyInstallment: number;
  paymentDueDate: string; // ISO date string or YYYY-MM-DD
  gracePeriodDays: number;
  penaltyFee: number;
  currentBalance: number;
  completionPercentage: number;
  status: 'Current' | 'Overdue' | 'Completed' | 'Cancelled';
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Agreement' | 'National ID' | 'Utility Bill' | 'Passport' | 'Contract' | 'Receipt' | 'Invoice' | 'Photo';
  uploadDate: string;
  fileUrl?: string;
  fileType: string;
  size: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  type: 'REGISTRATION' | 'PAYMENT' | 'SUSPENSION' | 'REACTIVATION' | 'REMINDER' | 'DOCUMENT' | 'EDIT';
}

export interface Customer {
  id: string;
  customerNumber: string;
  photoUrl?: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  email: string;
  nationalId: string; // NIN / Voter / License
  businessName?: string;
  occupation?: string;
  homeAddress: string;
  state: string;
  lga: string;
  town: string;
  gpsCoordinates: string; // e.g. "6.5244, 3.3792"
  installationAddress: string;
  customerNotes?: string;
  
  starlink: StarlinkKitInfo;
  installment: InstallmentPlanInfo;
  documents: DocumentItem[];
  timeline: TimelineEvent[];
  adminNotes: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  starlinkAccountId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  bankName?: string;
  receivedBy: string;
  notes?: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
}

export interface SuspensionRecord {
  id: string;
  customerId: string;
  customerName: string;
  action: 'SUSPEND' | 'RESUME';
  date: string;
  reason: string;
  adminName: string;
  paymentReference?: string;
  notes?: string;
  apiSynced: boolean;
  apiResponse?: string;
}

export interface NotificationLog {
  id: string;
  customerId: string;
  customerName: string;
  type: '7_DAYS_BEFORE' | '3_DAYS_BEFORE' | 'DUE_DATE' | '1_DAY_AFTER' | '7_DAYS_AFTER' | '30_DAYS_AFTER' | 'MANUAL';
  channel: 'SMS' | 'Email' | 'WhatsApp';
  recipient: string;
  message: string;
  sentAt: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  role: Role;
  action: string;
  details: string;
  ipAddress: string;
  category: 'LOGIN' | 'EDIT' | 'SUSPENSION' | 'REACTIVATION' | 'PAYMENT' | 'DELETE' | 'SETTINGS';
}

export interface SystemSettings {
  companyName: string;
  systemName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  currencySymbol: string;
  currencyCode: string;
  taxPercentage: number;
  defaultGracePeriodDays: number;
  defaultPenaltyFee: number;
  penaltyType: 'Flat' | 'Percentage';
  
  // Starlink API Settings
  starlinkApiEnabled: boolean;
  starlinkWorkflowMode: 'AUTOMATED_API' | 'MANUAL_WORKFLOW';
  starlinkApiKey: string;
  starlinkClientSecret: string;
  starlinkPartnerId: string;
  starlinkEnvironment: 'Sandbox' | 'Production';
  
  // Messaging Gateway
  smsGatewayEnabled: boolean;
  smsApiKey: string;
  smsSenderId: string;
  whatsappEnabled: boolean;
  whatsappApiToken: string;
  emailNotificationsEnabled: boolean;
  
  // Reminders Schedule toggles
  reminder7DaysBefore: boolean;
  reminder3DaysBefore: boolean;
  reminderOnDueDate: boolean;
  reminder1DayAfter: boolean;
  reminder7DaysAfter: boolean;
  reminder30DaysAfter: boolean;
  
  // Security
  enforce2FA: boolean;
  sessionTimeoutMinutes: number;
  autoBackupDays: number;
}
