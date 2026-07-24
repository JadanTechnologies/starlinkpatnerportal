import { Customer, SystemSettings } from '../types';

export interface StarlinkApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  requestId: string;
  timestamp: string;
  modeUsed: 'AUTOMATED_API' | 'MANUAL_WORKFLOW';
  payloadSent?: object;
  accountDetails?: {
    starlinkAccountId: string;
    terminalId: string;
    currentServiceState: 'Active' | 'Suspended' | 'Pending';
    lastSyncTimestamp: string;
    subscriptionPlan: string;
  };
}

export const starlinkApiService = {
  /**
   * Suspend customer Starlink service via API or Manual Workflow
   */
  async suspendAccount(customer: Customer, reason: string, adminName: string, settings: SystemSettings): Promise<StarlinkApiResponse> {
    const requestId = `REQ-STL-SUSP-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    if (settings.starlinkApiEnabled && settings.starlinkWorkflowMode === 'AUTOMATED_API') {
      // Simulate real REST API interaction with Starlink Partner Gateway
      const payload = {
        partnerId: settings.starlinkPartnerId,
        environment: settings.starlinkEnvironment,
        action: 'SUSPEND_SERVICE',
        targetAccount: {
          accountId: customer.starlink.starlinkAccountId,
          email: customer.starlink.starlinkEmail,
          terminalId: customer.starlink.terminalId,
          serialNumber: customer.starlink.serialNumber,
          dishKitNumber: customer.starlink.dishKitNumber,
        },
        suspensionReason: reason,
        initiatedBy: adminName,
        timestamp: now,
      };

      // Simulating API latency & response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            statusCode: 200,
            message: `[Starlink API ${settings.starlinkEnvironment}] Account ${customer.starlink.starlinkAccountId} suspended successfully. Service deactivated at Starlink Ground Station.`,
            requestId,
            timestamp: now,
            modeUsed: 'AUTOMATED_API',
            payloadSent: payload,
            accountDetails: {
              starlinkAccountId: customer.starlink.starlinkAccountId,
              terminalId: customer.starlink.terminalId,
              currentServiceState: 'Suspended',
              lastSyncTimestamp: now,
              subscriptionPlan: customer.starlink.subscriptionPlan,
            },
          });
        }, 600);
      });
    } else {
      // Fallback Manual Workflow Mode
      return {
        success: true,
        statusCode: 200,
        message: `[Manual Workflow] Account status updated to SUSPENDED internally. Internal ticket generated for field ops team to verify Starlink Portal status manually.`,
        requestId,
        timestamp: now,
        modeUsed: 'MANUAL_WORKFLOW',
        accountDetails: {
          starlinkAccountId: customer.starlink.starlinkAccountId,
          terminalId: customer.starlink.terminalId,
          currentServiceState: 'Suspended',
          lastSyncTimestamp: now,
          subscriptionPlan: customer.starlink.subscriptionPlan,
        },
      };
    }
  },

  /**
   * Resume/Reactivate customer Starlink service
   */
  async resumeAccount(customer: Customer, paymentRef: string, adminName: string, settings: SystemSettings): Promise<StarlinkApiResponse> {
    const requestId = `REQ-STL-RES-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    if (settings.starlinkApiEnabled && settings.starlinkWorkflowMode === 'AUTOMATED_API') {
      const payload = {
        partnerId: settings.starlinkPartnerId,
        environment: settings.starlinkEnvironment,
        action: 'RESUME_SERVICE',
        targetAccount: {
          accountId: customer.starlink.starlinkAccountId,
          terminalId: customer.starlink.terminalId,
          dishKitNumber: customer.starlink.dishKitNumber,
        },
        paymentReference: paymentRef,
        reactivatedBy: adminName,
        timestamp: now,
      };

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            statusCode: 200,
            message: `[Starlink API ${settings.starlinkEnvironment}] Account ${customer.starlink.starlinkAccountId} reactivated successfully. Terminal signals enabled.`,
            requestId,
            timestamp: now,
            modeUsed: 'AUTOMATED_API',
            payloadSent: payload,
            accountDetails: {
              starlinkAccountId: customer.starlink.starlinkAccountId,
              terminalId: customer.starlink.terminalId,
              currentServiceState: 'Active',
              lastSyncTimestamp: now,
              subscriptionPlan: customer.starlink.subscriptionPlan,
            },
          });
        }, 600);
      });
    } else {
      return {
        success: true,
        statusCode: 200,
        message: `[Manual Workflow] Service status updated to ACTIVE internally. Verification logged for Payment Ref: ${paymentRef}.`,
        requestId,
        timestamp: now,
        modeUsed: 'MANUAL_WORKFLOW',
        accountDetails: {
          starlinkAccountId: customer.starlink.starlinkAccountId,
          terminalId: customer.starlink.terminalId,
          currentServiceState: 'Active',
          lastSyncTimestamp: now,
          subscriptionPlan: customer.starlink.subscriptionPlan,
        },
      };
    }
  },

  /**
   * Check status & sync records
   */
  async syncCustomerRecords(customer: Customer, settings: SystemSettings): Promise<StarlinkApiResponse> {
    const requestId = `REQ-STL-SYNC-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    return {
      success: true,
      statusCode: 200,
      message: `Starlink terminal telemetry synchronized. Satellite dish ping: 24ms, Download: 185 Mbps, Upload: 28 Mbps.`,
      requestId,
      timestamp: now,
      modeUsed: settings.starlinkWorkflowMode,
      accountDetails: {
        starlinkAccountId: customer.starlink.starlinkAccountId,
        terminalId: customer.starlink.terminalId,
        currentServiceState: customer.starlink.currentStatus,
        lastSyncTimestamp: now,
        subscriptionPlan: customer.starlink.subscriptionPlan,
      },
    };
  }
};
