/**
 * Work Permit & JSA (Job Safety Analysis) Service
 * Time Constraints: Creation 09:00-18:00, Extension until 20:00
 * JSA must be completed before Work Permit finalization
 * Permit Merging: Combine multiple work types into single permit
 */

export interface JSAForm {
  id: string;
  jsaId: string;
  workPermitId?: string; // Linked permit
  title: string;
  workType: string; // Hot Work, Electrical, Height, etc.
  location: string;
  description: string;
  
  // JSA Fields (from BDPL OCP 03 F-08 format)
  jobDescription: string;
  hazardsIdentified: HazardEntry[];
  riskAssessment: RiskAssessmentEntry[];
  controlMeasures: ControlMeasure[];
  personalProtectiveEquipment: string[];
  toolsAndEquipment: string[];
  emergencyProcedures: string;
  jobSiteLayout?: string; // URL to diagram
  
  // Approvals
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface HazardEntry {
  id: string;
  hazardType: string; // e.g., Fire, Electrical, Fall, Chemical, etc.
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  riskScore: number; // Severity × Likelihood
}

export interface RiskAssessmentEntry {
  id: string;
  riskArea: string;
  riskDescription: string;
  mitigationStrategy: string;
  owner: string;
}

export interface ControlMeasure {
  id: string;
  measureType: 'Engineering' | 'Administrative' | 'PPE' | 'Substitution' | 'Elimination';
  description: string;
  responsibility: string;
  verificationMethod: string;
}

export interface WorkPermitMerged {
  id: string;
  permitId: string;
  mergedPermitIds: string[]; // Original permit IDs that were merged
  workTypes: string[]; // Hot Work + Excavation
  location: string;
  building: string;
  description: string;
  
  // Time Constraints
  createdAt: Date;
  issuedDate: Date;
  issuedTime: string; // HH:MM format (09:00-18:00)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  maxExtensionTime: string; // Cannot exceed 20:00
  
  // JSA Integration
  jsaId?: string;
  jsaStatus: 'Not Started' | 'In Progress' | 'Approved' | 'Rejected';
  jsaRequired: boolean;
  jsaApprovedDate?: Date;
  
  // Safety Info
  contractor: string;
  supervisor: string;
  workDescription: string;
  hazardsIdentified: string[];
  controlMeasures: string[];
  emergencyContacts: EmergencyContact[];
  
  // Status & Approvals
  status: 'Draft' | 'Pending JSA' | 'Pending Approval' | 'Approved' | 'Active' | 'Completed' | 'Cancelled' | 'Rejected';
  issuer: string;
  issuerApprovalDate?: Date;
  authorizer: string;
  authorizerApprovalDate?: Date;
  
  // Extension tracking
  extensions: PermitExtension[];
  
  createdBy: string;
  updatedAt: Date;
}

export interface PermitExtension {
  id: string;
  originalEndTime: string;
  newEndTime: string;
  reason: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  email?: string;
}

export interface WorkPermitDashboardMetrics {
  totalPermitsThisMonth: number;
  activePermits: number;
  completedPermits: number;
  rejectedPermits: number;
  averageCompletionTime: number; // hours
  jsaApprovalRate: number; // %
  permitsByType: { [type: string]: number };
  topRisks: HazardEntry[];
  pendingApprovals: WorkPermitMerged[];
  pendingJSAApprovals: JSAForm[];
  extensionRequests: PermitExtension[];
}

/**
 * JSA Service
 */
export class JSAService {
  /**
   * Create JSA form
   */
  static async createJSA(jsa: Omit<JSAForm, 'id' | 'jsaId' | 'createdAt' | 'updatedAt'>): Promise<JSAForm> {
    const response = await fetch('/api/jsa/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsa),
    });

    if (!response.ok) throw new Error('Failed to create JSA form');
    return response.json();
  }

  /**
   * Get JSA by ID
   */
  static async getJSA(jsaId: string): Promise<JSAForm> {
    const response = await fetch(`/api/jsa/forms/${jsaId}`);
    if (!response.ok) throw new Error('Failed to fetch JSA form');
    return response.json();
  }

  /**
   * Update JSA
   */
  static async updateJSA(jsaId: string, updates: Partial<JSAForm>): Promise<JSAForm> {
    const response = await fetch(`/api/jsa/forms/${jsaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update JSA form');
    return response.json();
  }

  /**
   * Submit JSA for approval
   */
  static async submitForApproval(jsaId: string, submittedBy: string): Promise<JSAForm> {
    return this.updateJSA(jsaId, {
      status: 'Submitted',
      preparedDate: new Date(),
      preparedBy: submittedBy,
    });
  }

  /**
   * Approve JSA
   */
  static async approveJSA(jsaId: string, approvedBy: string): Promise<JSAForm> {
    return this.updateJSA(jsaId, {
      status: 'Approved',
      approvedBy,
      approvedDate: new Date(),
    });
  }

  /**
   * Reject JSA with reason
   */
  static async rejectJSA(jsaId: string, rejectionReason: string, rejectedBy: string): Promise<JSAForm> {
    return this.updateJSA(jsaId, {
      status: 'Rejected',
      rejectionReason,
      approvedBy: rejectedBy,
      approvedDate: new Date(),
    });
  }

  /**
   * Calculate risk score for hazard
   */
  static calculateRiskScore(severity: 'Critical' | 'High' | 'Medium' | 'Low', likelihood: 'High' | 'Medium' | 'Low'): number {
    const severityScore = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    const likelihoodScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return severityScore[severity] * likelihoodScore[likelihood];
  }
}

/**
 * Work Permit Service
 */
export class WorkPermitService {
  /**
   * Validate permit creation time (09:00-18:00)
   */
  static isValidCreationTime(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 18;
  }

  /**
   * Validate extension time (cannot exceed 20:00)
   */
  static isValidExtensionTime(extensionTimeHour: number): boolean {
    return extensionTimeHour <= 20;
  }

  /**
   * Create work permit with time constraints
   */
  static async createPermit(permit: Omit<WorkPermitMerged, 'id' | 'permitId' | 'createdAt' | 'updatedAt' | 'extensions'>): Promise<WorkPermitMerged> {
    // Validate creation time
    if (!this.isValidCreationTime()) {
      throw new Error('Work Permits can only be created between 09:00 and 18:00');
    }

    const response = await fetch('/api/work-permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...permit,
        createdAt: new Date(),
        extensions: [],
      }),
    });

    if (!response.ok) throw new Error('Failed to create work permit');
    return response.json();
  }

  /**
   * Get permit by ID
   */
  static async getPermit(permitId: string): Promise<WorkPermitMerged> {
    const response = await fetch(`/api/work-permits/${permitId}`);
    if (!response.ok) throw new Error('Failed to fetch work permit');
    return response.json();
  }

  /**
   * Merge multiple permits into one
   */
  static async mergePermits(
    sourcePermitIds: string[],
    mergedPermitDetails: Omit<WorkPermitMerged, 'id' | 'permitId' | 'mergedPermitIds' | 'createdAt' | 'updatedAt' | 'extensions'>
  ): Promise<WorkPermitMerged> {
    const response = await fetch('/api/work-permits/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourcePermitIds,
        ...mergedPermitDetails,
      }),
    });

    if (!response.ok) throw new Error('Failed to merge permits');
    return response.json();
  }

  /**
   * Request permit extension (up to 20:00)
   */
  static async requestExtension(
    permitId: string,
    newEndTime: string, // HH:MM format
    reason: string,
    requestedBy: string
  ): Promise<PermitExtension> {
    // Validate extension time
    const [hours] = newEndTime.split(':').map(Number);
    if (!this.isValidExtensionTime(hours)) {
      throw new Error('Extension cannot exceed 20:00');
    }

    const response = await fetch(`/api/work-permits/${permitId}/extension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newEndTime,
        reason,
        requestedBy,
      }),
    });

    if (!response.ok) throw new Error('Failed to request extension');
    return response.json();
  }

  /**
   * Approve extension
   */
  static async approveExtension(permitId: string, extensionId: string, approvedBy: string): Promise<PermitExtension> {
    const response = await fetch(`/api/work-permits/${permitId}/extension/${extensionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy }),
    });

    if (!response.ok) throw new Error('Failed to approve extension');
    return response.json();
  }

  /**
   * Link JSA to permit - JSA must be approved before permit can be finalized
   */
  static async linkJSA(permitId: string, jsaId: string): Promise<WorkPermitMerged> {
    const response = await fetch(`/api/work-permits/${permitId}/jsa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsaId }),
    });

    if (!response.ok) throw new Error('Failed to link JSA to permit');
    return response.json();
  }

  /**
   * Finalize permit (only if JSA approved)
   */
  static async finalizePermit(permitId: string, finalizedBy: string): Promise<WorkPermitMerged> {
    const response = await fetch(`/api/work-permits/${permitId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalizedBy }),
    });

    if (!response.ok) throw new Error('Failed to finalize permit');
    return response.json();
  }

  /**
   * Get all active permits
   */
  static async getActivePermits(): Promise<WorkPermitMerged[]> {
    const response = await fetch('/api/work-permits?status=Active');
    if (!response.ok) throw new Error('Failed to fetch active permits');
    return response.json();
  }

  /**
   * Get permits pending JSA approval
   */
  static async getPermitsPendingJSA(): Promise<WorkPermitMerged[]> {
    const response = await fetch('/api/work-permits?jsaStatus=In Progress');
    if (!response.ok) throw new Error('Failed to fetch permits pending JSA');
    return response.json();
  }

  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(): Promise<WorkPermitDashboardMetrics> {
    const response = await fetch('/api/work-permits/dashboard/metrics');
    if (!response.ok) throw new Error('Failed to fetch permit metrics');
    return response.json();
  }

  /**
   * Get permits by type
   */
  static async getPermitsByType(workType: string): Promise<WorkPermitMerged[]> {
    const response = await fetch(`/api/work-permits?workType=${encodeURIComponent(workType)}`);
    if (!response.ok) throw new Error('Failed to fetch permits');
    return response.json();
  }
}
