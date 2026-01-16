/**
 * Daily Tasks & Utility Management Service
 * Departmental Silos: Technical, Soft Services, Security, Horticulture
 * Task Approval Flow: Submit → Approve/Deny/Pushback to WIP
 * Utility Billing: Per-unit charges with BESCOM bill verification
 */

export type TaskDepartment = 'Technical' | 'Soft Services' | 'Security' | 'Horticulture';

export interface DailyTask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  department: TaskDepartment;
  assignedTo: string;
  assignedToRole: string;
  location: string;
  building: string;
  
  // Time tracking
  scheduledStartTime: string; // HH:MM
  scheduledEndTime: string; // HH:MM
  actualStartTime?: string;
  actualEndTime?: string;
  duration?: number; // minutes
  
  // Checklist items
  checklistItems: ChecklistItem[];
  readings?: TaskReading[];
  
  // Status workflow: Pending → In Progress → Pending Approval → Approved/Completed or WIP
  status: 'Pending' | 'In Progress' | 'Pending Approval' | 'Approved' | 'Completed' | 'Denied' | 'WIP';
  priority: 'High' | 'Medium' | 'Low';
  
  // Approval workflow
  submittedAt?: Date;
  submittedBy?: string;
  approver?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Denied' | 'Pushed Back';
  approvalComments?: string;
  approvedAt?: Date;
  denialReason?: string;
  pushBackReason?: string;
  
  // Evidence
  photosAttached: string[]; // URLs
  defectsFound: string;
  maintenanceRequired: boolean;
  toolsUsed: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedTime?: string;
  remarks?: string;
  verifiedBy?: string;
}

export interface TaskReading {
  id: string;
  parameterName: string;
  unit: string;
  value: number;
  normalRange: string;
  status: 'Normal' | 'Warning' | 'Critical';
  remarks?: string;
  timestamp?: string;
}

export interface TaskApprovalFlow {
  taskId: string;
  submittedAt: Date;
  submittedBy: string;
  approver: string;
  
  actions: TaskApprovalAction[];
}

export interface TaskApprovalAction {
  actionType: 'Submitted' | 'Approved' | 'Denied' | 'Pushed Back';
  takenBy: string;
  takenAt: Date;
  comments?: string;
  pushBackReasons?: string[]; // e.g., "Incomplete", "Quality Issues", "Rework Required"
}

export interface UtilityBillingSetup {
  id: string;
  buildingId: string;
  building: string;
  
  // BESCOM Master Bill
  bescomBillPeriod: string; // e.g., "Nov 2024 - Dec 2024"
  bescomTotalUnits: number;
  bescomTotalAmount: number;
  bescomBillDate: Date;
  bescomBillDocumentUrl?: string;
  
  // Per-unit calculation
  tenants: TenantUtilityShare[];
  calculationMethod: 'Equal' | 'ProportionalArea' | 'Metered' | 'Custom';
  
  verificationStatus: 'Pending' | 'Verified' | 'Disputed';
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
}

export interface TenantUtilityShare {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  areaSquareFeet?: number;
  areaPercentage?: number;
  
  // Utility consumption
  allocatedUnits: number;
  ratePerUnit: number;
  chargeAmount: number;
  
  // Additional charges
  fixedCharges?: number;
  additionalCharges?: {
    description: string;
    amount: number;
  }[];
  totalChargeAmount: number;
  
  // Tax
  gstRate: number; // %
  gstAmount: number;
  totalBillAmount: number;
  
  // Status
  billStatus: 'Generated' | 'Sent' | 'Acknowledged' | 'Paid' | 'Disputed';
  generatedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  
  // Invoice
  invoiceNumber?: string;
  invoiceUrl?: string;
}

export interface UtilityBillingDashboard {
  totalBuildings: number;
  totalBillAmount: number;
  totalTenants: number;
  paidAmount: number;
  pendingAmount: number;
  disputedBills: TenantUtilityShare[];
  recentBillings: UtilityBillingSetup[];
  verificationRate: number; // %
}

/**
 * Daily Task Service
 */
export class DailyTaskService {
  /**
   * Create daily task
   */
  static async createTask(
    task: Omit<DailyTask, 'id' | 'taskId' | 'createdAt' | 'updatedAt'>
  ): Promise<DailyTask> {
    const response = await fetch('/api/daily-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    if (!response.ok) throw new Error('Failed to create daily task');
    return response.json();
  }

  /**
   * Get task by ID
   */
  static async getTask(taskId: string): Promise<DailyTask> {
    const response = await fetch(`/api/daily-tasks/${taskId}`);
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  }

  /**
   * Get tasks by department
   */
  static async getTasksByDepartment(department: TaskDepartment): Promise<DailyTask[]> {
    const response = await fetch(`/api/daily-tasks?department=${encodeURIComponent(department)}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(status: DailyTask['status']): Promise<DailyTask[]> {
    const response = await fetch(`/api/daily-tasks?status=${encodeURIComponent(status)}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }

  /**
   * Update task (mark as In Progress, complete checklist items, etc.)
   */
  static async updateTask(taskId: string, updates: Partial<DailyTask>): Promise<DailyTask> {
    const response = await fetch(`/api/daily-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  }

  /**
   * Submit task for approval
   */
  static async submitForApproval(
    taskId: string,
    submittedBy: string,
    approver: string,
    comments?: string
  ): Promise<DailyTask> {
    const response = await fetch(`/api/daily-tasks/${taskId}/submit-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submittedBy,
        approver,
        comments,
        status: 'Pending Approval',
        submittedAt: new Date(),
      }),
    });

    if (!response.ok) throw new Error('Failed to submit for approval');
    return response.json();
  }

  /**
   * Approve task
   */
  static async approveTask(
    taskId: string,
    approvedBy: string,
    comments?: string
  ): Promise<DailyTask> {
    const response = await fetch(`/api/daily-tasks/${taskId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvedBy,
        comments,
        status: 'Approved',
        approvalStatus: 'Approved',
        approvedAt: new Date(),
      }),
    });

    if (!response.ok) throw new Error('Failed to approve task');
    return response.json();
  }

  /**
   * Deny task completion (force back to WIP)
   */
  static async denyTask(
    taskId: string,
    deniedBy: string,
    reason: string
  ): Promise<DailyTask> {
    const response = await fetch(`/api/daily-tasks/${taskId}/deny`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deniedBy,
        denialReason: reason,
        status: 'WIP',
        approvalStatus: 'Denied',
      }),
    });

    if (!response.ok) throw new Error('Failed to deny task');
    return response.json();
  }

  /**
   * Push task back to WIP for rework
   */
  static async pushBackTask(
    taskId: string,
    pushedBackBy: string,
    reason: string
  ): Promise<DailyTask> {
    const response = await fetch(`/api/daily-tasks/${taskId}/push-back`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pushedBackBy,
        pushBackReason: reason,
        status: 'WIP',
        approvalStatus: 'Pushed Back',
      }),
    });

    if (!response.ok) throw new Error('Failed to push back task');
    return response.json();
  }

  /**
   * Get pending approvals
   */
  static async getPendingApprovals(approver: string): Promise<DailyTask[]> {
    const response = await fetch(`/api/daily-tasks/approvals/pending?approver=${encodeURIComponent(approver)}`);
    if (!response.ok) throw new Error('Failed to fetch pending approvals');
    return response.json();
  }

  /**
   * Import offline checklist
   */
  static async importOfflineChecklist(
    data: FormData
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    const response = await fetch('/api/daily-tasks/import', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) throw new Error('Failed to import offline checklist');
    return response.json();
  }
}

/**
 * Utility Billing Service
 */
export class UtilityBillingService {
  /**
   * Create billing setup for building
   */
  static async createBillingSetup(
    buildingId: string,
    building: string,
    bescomBillData: {
      period: string;
      totalUnits: number;
      totalAmount: number;
      billDate: Date;
      documentUrl?: string;
    }
  ): Promise<UtilityBillingSetup> {
    const response = await fetch('/api/utility-billing/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildingId,
        building,
        bescomBillPeriod: bescomBillData.period,
        bescomTotalUnits: bescomBillData.totalUnits,
        bescomTotalAmount: bescomBillData.totalAmount,
        bescomBillDate: bescomBillData.billDate,
        bescomBillDocumentUrl: bescomBillData.documentUrl,
        tenants: [],
        calculationMethod: 'ProportionalArea',
        verificationStatus: 'Pending',
      }),
    });

    if (!response.ok) throw new Error('Failed to create billing setup');
    return response.json();
  }

  /**
   * Calculate per-unit charges for all tenants
   */
  static async calculatePerUnitCharges(
    setupId: string,
    calculationMethod: 'Equal' | 'ProportionalArea' | 'Metered' | 'Custom'
  ): Promise<UtilityBillingSetup> {
    const response = await fetch(`/api/utility-billing/setup/${setupId}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calculationMethod }),
    });

    if (!response.ok) throw new Error('Failed to calculate per-unit charges');
    return response.json();
  }

  /**
   * Verify against BESCOM master bill
   */
  static async verifyAgainstMasterBill(
    setupId: string,
    verifiedBy: string,
    verificationNotes?: string
  ): Promise<UtilityBillingSetup> {
    const response = await fetch(`/api/utility-billing/setup/${setupId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verifiedBy,
        verificationNotes,
        verificationStatus: 'Verified',
        verifiedAt: new Date(),
      }),
    });

    if (!response.ok) throw new Error('Failed to verify billing setup');
    return response.json();
  }

  /**
   * Generate tenant bills
   */
  static async generateTenantBills(setupId: string): Promise<TenantUtilityShare[]> {
    const response = await fetch(`/api/utility-billing/setup/${setupId}/generate-bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to generate tenant bills');
    return response.json();
  }

  /**
   * Send bills to tenants
   */
  static async sendBillsToTenants(setupId: string): Promise<{ sent: number; failed: number }> {
    const response = await fetch(`/api/utility-billing/setup/${setupId}/send-bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to send bills');
    return response.json();
  }

  /**
   * Get setup details
   */
  static async getSetup(setupId: string): Promise<UtilityBillingSetup> {
    const response = await fetch(`/api/utility-billing/setup/${setupId}`);
    if (!response.ok) throw new Error('Failed to fetch billing setup');
    return response.json();
  }

  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(): Promise<UtilityBillingDashboard> {
    const response = await fetch('/api/utility-billing/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
    return response.json();
  }

  /**
   * Handle bill dispute
   */
  static async disputeBill(
    tenantShareId: string,
    reason: string,
    tenantEmail: string
  ): Promise<TenantUtilityShare> {
    const response = await fetch(`/api/utility-billing/bills/${tenantShareId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason,
        tenantEmail,
        billStatus: 'Disputed',
      }),
    });

    if (!response.ok) throw new Error('Failed to dispute bill');
    return response.json();
  }

  /**
   * Record payment
   */
  static async recordPayment(
    tenantShareId: string,
    amount: number,
    paymentMethod: string,
    referenceNumber: string
  ): Promise<TenantUtilityShare> {
    const response = await fetch(`/api/utility-billing/bills/${tenantShareId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        paymentMethod,
        referenceNumber,
        paidAt: new Date(),
        billStatus: 'Paid',
      }),
    });

    if (!response.ok) throw new Error('Failed to record payment');
    return response.json();
  }
}
