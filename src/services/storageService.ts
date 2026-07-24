import { Customer, PaymentRecord, AuditLog, NotificationLog, SystemSettings, Role } from '../types';
import { initialCustomers, initialPayments, initialAuditLogs, initialNotificationLogs, initialSystemSettings } from '../data/mockData';

const KEYS = {
  CUSTOMERS: 'jspms_customers_v1',
  PAYMENTS: 'jspms_payments_v1',
  AUDIT_LOGS: 'jspms_audit_logs_v1',
  NOTIFICATIONS: 'jspms_notifications_v1',
  SETTINGS: 'jspms_settings_v1',
  CURRENT_ROLE: 'jspms_current_role_v1',
  DARK_MODE: 'jspms_dark_mode_v1',
};

export const storageService = {
  getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : initialSystemSettings;
    } catch {
      return initialSystemSettings;
    }
  },

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCurrentRole(): Role {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_ROLE);
      return (data as Role) || 'SUPER_ADMIN';
    } catch {
      return 'SUPER_ADMIN';
    }
  },

  setCurrentRole(role: Role): void {
    localStorage.setItem(KEYS.CURRENT_ROLE, role);
  },

  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS);
      let list: Customer[] = data ? JSON.parse(data) : initialCustomers;
      
      let modified = false;
      const hamzaIndex = list.findIndex((c) => c.fullName.toLowerCase().includes('hamza') && c.fullName.toLowerCase().includes('yakubu'));
      if (hamzaIndex >= 0) {
        if (list[hamzaIndex].installment.currentBalance !== 379000 || list[hamzaIndex].installment.remainingBalance !== 379000) {
          list[hamzaIndex].installment.remainingBalance = 379000;
          list[hamzaIndex].installment.currentBalance = 379000;
          list[hamzaIndex].installment.completionPercentage = Math.round(((list[hamzaIndex].installment.kitPrice - 379000) / list[hamzaIndex].installment.kitPrice) * 100);
          modified = true;
        }
      } else {
        const initialHamza = initialCustomers.find((c) => c.fullName.toLowerCase().includes('hamza'));
        if (initialHamza) {
          list = [initialHamza, ...list];
          modified = true;
        }
      }

      if (modified) {
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
      }

      return list;
    } catch {
      return initialCustomers;
    }
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  addCustomer(customer: Customer, adminName: string): Customer[] {
    const list = this.getCustomers();
    const updated = [customer, ...list];
    this.saveCustomers(updated);
    this.addAuditLog({
      adminName,
      adminEmail: `${adminName.toLowerCase().replace(' ', '.')}@jadantech.ng`,
      role: this.getCurrentRole(),
      action: 'REGISTER_CUSTOMER',
      details: `Registered new customer: ${customer.fullName} (${customer.customerNumber}) - Starlink Kit ${customer.starlink.dishKitNumber}`,
      category: 'EDIT',
    });
    return updated;
  },

  updateCustomer(customer: Customer, adminName: string): Customer[] {
    const list = this.getCustomers();
    const updated = list.map((c) => (c.id === customer.id ? customer : c));
    this.saveCustomers(updated);
    this.addAuditLog({
      adminName,
      adminEmail: `${adminName.toLowerCase().replace(' ', '.')}@jadantech.ng`,
      role: this.getCurrentRole(),
      action: 'UPDATE_CUSTOMER',
      details: `Updated details for ${customer.fullName} (${customer.customerNumber})`,
      category: 'EDIT',
    });
    return updated;
  },

  deleteCustomer(customerId: string, adminName: string): Customer[] {
    const list = this.getCustomers();
    const target = list.find((c) => c.id === customerId);
    const updated = list.filter((c) => c.id !== customerId);
    this.saveCustomers(updated);
    if (target) {
      this.addAuditLog({
        adminName,
        adminEmail: `${adminName.toLowerCase().replace(' ', '.')}@jadantech.ng`,
        role: this.getCurrentRole(),
        action: 'DELETE_CUSTOMER',
        details: `Deleted customer record: ${target.fullName} (${target.customerNumber})`,
        category: 'DELETE',
      });
    }
    return updated;
  },

  getPayments(): PaymentRecord[] {
    try {
      const data = localStorage.getItem(KEYS.PAYMENTS);
      return data ? JSON.parse(data) : initialPayments;
    } catch {
      return initialPayments;
    }
  },

  addPayment(payment: PaymentRecord, adminName: string): { updatedCustomers: Customer[]; updatedPayments: PaymentRecord[] } {
    const payments = [payment, ...this.getPayments()];
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));

    const customers = this.getCustomers();
    const updatedCustomers = customers.map((c) => {
      if (c.id === payment.customerId) {
        const remaining = Math.max(0, c.installment.currentBalance - payment.amountPaid);
        const completionPercentage = Math.round(((c.installment.kitPrice - remaining) / c.installment.kitPrice) * 100);
        
        let newInstallmentStatus: 'Current' | 'Overdue' | 'Completed' | 'Cancelled' = c.installment.status;
        let newStarlinkStatus: 'Active' | 'Suspended' | 'Pending' = c.starlink.currentStatus;

        // Calculate if advance payment is made
        let nextDueDate = c.installment.paymentDueDate;
        const monthlyAmount = c.installment.monthlyInstallment || 50000;
        const monthsCovered = Math.max(1, Math.floor(payment.amountPaid / monthlyAmount));

        if (remaining === 0) {
          newInstallmentStatus = 'Completed';
          newStarlinkStatus = 'Active';
        } else {
          // Advance payment due date extension
          if (payment.amountPaid >= monthlyAmount) {
            try {
              const currentDue = new Date(c.installment.paymentDueDate);
              if (!isNaN(currentDue.getTime())) {
                currentDue.setMonth(currentDue.getMonth() + monthsCovered);
                nextDueDate = currentDue.toISOString().substring(0, 10);
              }
            } catch {
              // fallback keep existing
            }
          }

          if (c.installment.status === 'Overdue') {
            newInstallmentStatus = 'Current';
            if (newStarlinkStatus === 'Suspended') {
              newStarlinkStatus = 'Active';
            }
          }
        }

        const isAdvance = monthsCovered > 1 && remaining > 0;
        const newTimeline = [
          {
            id: `t-${Date.now()}`,
            title: isAdvance 
              ? `Advance Payment Recorded: ₦${payment.amountPaid.toLocaleString()} (${monthsCovered} Months)`
              : `Payment Recorded: ₦${payment.amountPaid.toLocaleString()}`,
            description: `Paid via ${payment.paymentMethod} (Ref: ${payment.referenceNumber}). Receipt ${payment.receiptNumber}. ${isAdvance ? `Covered ${monthsCovered} installments upfront. Next due date extended to ${nextDueDate}. ` : ''}New balance: ₦${remaining.toLocaleString()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            performedBy: adminName,
            type: 'PAYMENT' as const,
          },
          ...c.timeline,
        ];

        return {
          ...c,
          starlink: {
            ...c.starlink,
            currentStatus: newStarlinkStatus,
          },
          installment: {
            ...c.installment,
            remainingBalance: remaining,
            currentBalance: remaining,
            completionPercentage: Math.min(100, completionPercentage),
            paymentDueDate: nextDueDate,
            status: newInstallmentStatus,
          },
          timeline: newTimeline,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    this.saveCustomers(updatedCustomers);

    this.addAuditLog({
      adminName,
      adminEmail: `${adminName.toLowerCase().replace(' ', '.')}@jadantech.ng`,
      role: this.getCurrentRole(),
      action: 'RECORD_PAYMENT',
      details: `Recorded payment of ₦${payment.amountPaid.toLocaleString()} for ${payment.customerName}. Receipt ${payment.receiptNumber}`,
      category: 'PAYMENT',
    });

    return { updatedCustomers, updatedPayments: payments };
  },

  markAsPaidComplete(customerId: string, adminName: string): Customer[] {
    const customers = this.getCustomers();
    const updatedCustomers = customers.map((c) => {
      if (c.id === customerId) {
        const previousBal = c.installment.currentBalance;
        const newTimeline = [
          {
            id: `t-${Date.now()}`,
            title: `PAID COMPLETE: Installment Plan Fully Settled`,
            description: `Account balance cleared from ₦${previousBal.toLocaleString()} to ₦0. Customer installment status marked as PAID COMPLETE. Starlink terminal activated.`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            performedBy: adminName,
            type: 'PAYMENT' as const,
          },
          ...c.timeline,
        ];

        return {
          ...c,
          starlink: {
            ...c.starlink,
            currentStatus: 'Active' as const,
          },
          installment: {
            ...c.installment,
            remainingBalance: 0,
            currentBalance: 0,
            completionPercentage: 100,
            status: 'Completed' as const,
          },
          timeline: newTimeline,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    this.saveCustomers(updatedCustomers);

    const target = customers.find((c) => c.id === customerId);
    this.addAuditLog({
      adminName,
      adminEmail: `${adminName.toLowerCase().replace(' ', '.')}@jadantech.ng`,
      role: this.getCurrentRole(),
      action: 'MARK_PAID_COMPLETE',
      details: `Marked installment plan as PAID COMPLETE for ${target?.fullName || customerId} (${target?.customerNumber || ''})`,
      category: 'PAYMENT',
    });

    return updatedCustomers;
  },

  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  },

  addAuditLog(entry: {
    adminName: string;
    adminEmail: string;
    role: Role;
    action: string;
    details: string;
    category: AuditLog['category'];
  }): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      adminName: entry.adminName,
      adminEmail: entry.adminEmail,
      role: entry.role,
      action: entry.action,
      details: entry.details,
      ipAddress: '102.89.23.11',
      category: entry.category,
    };
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...logs]));
  },

  getNotifications(): NotificationLog[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : initialNotificationLogs;
    } catch {
      return initialNotificationLogs;
    }
  },

  addNotification(notif: NotificationLog): void {
    const logs = this.getNotifications();
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([notif, ...logs]));
  },

  resetToDefaults(): void {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(initialPayments));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialNotificationLogs));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(initialSystemSettings));
    localStorage.setItem(KEYS.CURRENT_ROLE, 'SUPER_ADMIN');
  },

  // Automated Payment Check Engine
  runAutoCheckAndSuspend(adminName = 'System Auto-Check Engine'): {
    updatedCustomers: Customer[];
    suspendedCount: number;
    overdueCount: number;
    processedCount: number;
  } {
    const customers = this.getCustomers();
    const settings = this.getSettings();
    const today = new Date().toISOString().substring(0, 10);
    
    let suspendedCount = 0;
    let overdueCount = 0;

    const updated = customers.map((c) => {
      // If completed or cancelled, skip
      if (c.installment.status === 'Completed' || c.installment.status === 'Cancelled' || c.installment.currentBalance <= 0) {
        return c;
      }

      const dueDate = c.installment.paymentDueDate;
      const graceDays = c.installment.gracePeriodDays || settings.defaultGracePeriodDays;
      
      const dueDateTime = new Date(dueDate).getTime();
      const todayTime = new Date(today).getTime();
      const daysDiff = Math.floor((todayTime - dueDateTime) / (1000 * 60 * 60 * 24));

      let newInstallmentStatus = c.installment.status;
      let newStarlinkStatus = c.starlink.currentStatus;
      let updatedTimeline = [...c.timeline];

      if (daysDiff > 0) {
        // Past due date
        if (newInstallmentStatus !== 'Overdue') {
          newInstallmentStatus = 'Overdue';
          overdueCount++;
          updatedTimeline.unshift({
            id: `t-${Date.now()}-ov`,
            title: 'Account Status Changed to OVERDUE',
            description: `Payment due date (${dueDate}) passed without payment confirmation.`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            performedBy: adminName,
            type: 'REMINDER',
          });
        }

        // If beyond grace period, suspend service!
        if (daysDiff > graceDays && newStarlinkStatus !== 'Suspended') {
          newStarlinkStatus = 'Suspended';
          suspendedCount++;
          updatedTimeline.unshift({
            id: `t-${Date.now()}-susp`,
            title: 'AUTOMATIC STARLINK SERVICE SUSPENDED',
            description: `Service automatically suspended after ${daysDiff} days past due date (exceeded ${graceDays}-day grace period). Mode: ${settings.starlinkWorkflowMode}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            performedBy: adminName,
            type: 'SUSPENSION',
          });

          // Log notification
          this.addNotification({
            id: `notif-susp-${Date.now()}`,
            customerId: c.id,
            customerName: c.fullName,
            type: '7_DAYS_AFTER',
            channel: 'SMS',
            recipient: c.phone,
            message: `IMPORTANT NOTICE: Your Starlink terminal (${c.starlink.dishKitNumber}) service has been SUSPENDED due to overdue payment of ₦${c.installment.currentBalance.toLocaleString()}. Please contact Jadan Tech Solutions Nig Ltd to make payment and reactivate service.`,
            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'SENT',
          });
        }
      }

      return {
        ...c,
        starlink: {
          ...c.starlink,
          currentStatus: newStarlinkStatus,
        },
        installment: {
          ...c.installment,
          status: newInstallmentStatus,
        },
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString(),
      };
    });

    this.saveCustomers(updated);

    if (suspendedCount > 0 || overdueCount > 0) {
      this.addAuditLog({
        adminName,
        adminEmail: 'automation@jadantech.ng',
        role: 'SUPER_ADMIN',
        action: 'MIDNIGHT_AUTO_CHECK',
        details: `Auto-check execution complete. ${overdueCount} accounts marked Overdue, ${suspendedCount} terminals Suspended.`,
        category: 'SUSPENSION',
      });
    }

    return {
      updatedCustomers: updated,
      suspendedCount,
      overdueCount,
      processedCount: customers.length,
    };
  }
};
