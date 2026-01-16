/**
 * Contract & Vendor Management Service
 * Contract Renewal Automation: End Date = Start Date + 365 days
 * Auto-create renewal: New Start Date = Old End Date
 * Visual Alerts: Days Left ≤ 0 → Expired with red alert
 */

export interface ContractEnhanced {
  id: number;
  contractId: string;
  title: string;
  type: 'AMC' | 'One-Time' | 'Warranty' | 'Lease' | 'Service' | 'Maintenance';
  vendorId: number;
  vendorName: string;
  startDate: Date;
  endDate: Date; // Auto-calculated: Start + 365 days
  daysLeft: number; // Calculated field
  status: 'Active' | 'Expired' | 'Renewing' | 'Pending Renewal';
  statusColor: string; // Green, Yellow, Red based on days left
  value: number;
  renewalValue?: number;
  currency: 'INR' | 'USD' | 'EUR';
  documentUrl?: string;
  keyTerms?: string;
  autoRenewEnabled: boolean;
  renewalNotificationDays?: number; // Default 30 days before expiry
  renewalHistory?: RenewalRecord[];
  createdAt: Date;
  createdBy: string;
}

export interface RenewalRecord {
  id: number;
  originalContractId: string;
  renewalContractId: string;
  renewalStartDate: Date; // Original End Date
  renewalEndDate: Date; // Start + 365
  renewalValue: number;
  createdAt: Date;
  createdBy: string;
  status: 'Auto-Created' | 'Manual' | 'Approved' | 'Activated';
}

export interface VendorMaster {
  id: number;
  vendorId: string;
  name: string;
  category: string; // e.g., HVAC, Electrical, Plumbing, Housekeeping, etc.
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  rating: number; // 1-5 stars
  status: 'Active' | 'Inactive' | 'Blacklisted';
  contracts?: ContractEnhanced[];
  performanceScore?: number;
  lastAuditDate?: Date;
  certifications?: string[];
  insuranceExpiry?: Date;
  licenses?: string[];
  referencesCount?: number;
  onboardingDate: Date;
  createdAt: Date;
}

export interface ContractDashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  renewingContracts: number;
  totalValue: number;
  renewalsDue30Days: ContractEnhanced[];
  recentlyExpired: ContractEnhanced[];
  pendingRenewals: ContractEnhanced[];
  topVendors: VendorMaster[];
  expiringThisMonth: ContractEnhanced[];
}

/**
 * Contract Management Service
 */
export class ContractService {
  /**
   * Create contract with auto-calculated end date (Start + 365 days)
   */
  static async createContract(
    title: string,
    vendorId: number,
    vendorName: string,
    type: ContractEnhanced['type'],
    startDate: Date,
    value: number,
    createdBy: string,
    options?: {
      autoRenewEnabled?: boolean;
      renewalNotificationDays?: number;
      currency?: 'INR' | 'USD' | 'EUR';
      keyTerms?: string;
      documentUrl?: string;
    }
  ): Promise<ContractEnhanced> {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Add exactly 365 days worth

    const response = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        vendorId,
        vendorName,
        type,
        startDate,
        endDate, // Auto-calculated
        value,
        createdBy,
        currency: options?.currency ?? 'INR',
        autoRenewEnabled: options?.autoRenewEnabled ?? true,
        renewalNotificationDays: options?.renewalNotificationDays ?? 30,
        keyTerms: options?.keyTerms,
        documentUrl: options?.documentUrl,
      }),
    });

    if (!response.ok) throw new Error('Failed to create contract');
    return response.json();
  }

  /**
   * Get contract with calculated days left and status
   */
  static async getContract(contractId: string): Promise<ContractEnhanced> {
    const response = await fetch(`/api/contracts/${contractId}`);
    if (!response.ok) throw new Error('Failed to fetch contract');
    const contract = await response.json();

    // Calculate days left and status
    const now = new Date();
    const daysLeft = Math.ceil((contract.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...contract,
      vendorName: contract.vendor?.name || contract.vendorName || 'Unknown Vendor',
      daysLeft,
      status: daysLeft <= 0 ? 'Expired' : daysLeft <= 30 ? 'Renewing' : 'Active',
      statusColor: daysLeft <= 0 ? '#EF4444' : daysLeft <= 30 ? '#FBBF24' : '#10B981',
    };
  }

  /**
   * Get all contracts
   */
  static async getAllContracts(): Promise<ContractEnhanced[]> {
    const response = await fetch('/api/contracts');
    if (!response.ok) throw new Error('Failed to fetch contracts');
    const contracts = await response.json();

    return contracts.map((contract: any) => {
      const now = new Date();
      const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...contract,
        vendorName: contract.vendor?.name || contract.vendorName || 'Unknown Vendor',
        endDate: new Date(contract.endDate),
        startDate: new Date(contract.startDate),
        daysLeft,
        status: daysLeft <= 0 ? 'Expired' : 'Active', // Status is simplified/derived
        statusColor: daysLeft <= 0 ? '#EF4444' : daysLeft <= 30 ? '#FBBF24' : '#10B981',
      };
    });
  }

  /**
   * Auto-renew contract: Create new contract with Start = Old End Date
   * Triggered automatically or manually
   */
  static async renewContract(
    originalContractId: string,
    renewalValue?: number,
    createdBy?: string
  ): Promise<{ original: ContractEnhanced; renewal: ContractEnhanced; renewalRecord: RenewalRecord }> {
    const response = await fetch(`/api/contracts/${originalContractId}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        renewalValue,
        createdBy: createdBy ?? 'System Auto-Renewal',
      }),
    });

    if (!response.ok) throw new Error('Failed to renew contract');
    return response.json();
  }

  /**
   * Get contracts due for renewal (expires within X days)
   */
  static async getContractsDueForRenewal(daysThreshold: number = 30): Promise<ContractEnhanced[]> {
    const response = await fetch(`/api/contracts/renewal/due?days=${daysThreshold}`);
    if (!response.ok) throw new Error('Failed to fetch renewal-due contracts');
    return response.json();
  }

  /**
   * Process auto-renewals (run periodically)
   */
  static async processAutoRenewals(): Promise<{ renewed: number; failed: number }> {
    const response = await fetch('/api/contracts/renewal/process-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to process auto-renewals');
    return response.json();
  }

  /**
   * Get renewal history for contract
   */
  static async getRenewalHistory(contractId: string): Promise<RenewalRecord[]> {
    const response = await fetch(`/api/contracts/${contractId}/renewal-history`);
    if (!response.ok) throw new Error('Failed to fetch renewal history');
    return response.json();
  }

  /**
   * Update contract
   */
  static async updateContract(contractId: string, updates: Partial<ContractEnhanced>): Promise<ContractEnhanced> {
    const response = await fetch(`/api/contracts/${contractId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update contract');
    return response.json();
  }

  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(): Promise<ContractDashboardMetrics> {
    const response = await fetch('/api/contracts/dashboard/metrics');
    if (!response.ok) throw new Error('Failed to fetch contract metrics');
    return response.json();
  }
}

/**
 * Vendor Master Service
 */
export class VendorService {
  /**
   * Create vendor
   */
  static async createVendor(vendor: Omit<VendorMaster, 'id' | 'createdAt'>): Promise<VendorMaster> {
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });

    if (!response.ok) throw new Error('Failed to create vendor');
    return response.json();
  }

  /**
   * Get all vendors
   */
  static async getAllVendors(): Promise<VendorMaster[]> {
    const response = await fetch('/api/vendors');
    if (!response.ok) throw new Error('Failed to fetch vendors');
    const vendors = await response.json();
    return vendors.map((v: any) => ({
      ...v,
      // Compute contractExpiry from contracts list (latest end date)
      contractExpiry: v.contracts?.length
        ? new Date(Math.max(...v.contracts.map((c: any) => new Date(c.endDate).getTime())))
        : undefined
    }));
  }

  /**
   * Get vendor by ID with associated contracts
   */
  static async getVendor(vendorId: string): Promise<VendorMaster> {
    const response = await fetch(`/api/vendors/${vendorId}`);
    if (!response.ok) throw new Error('Failed to fetch vendor');
    return response.json();
  }

  /**
   * Get vendors by category
   */
  static async getVendorsByCategory(category: string): Promise<VendorMaster[]> {
    const response = await fetch(`/api/vendors?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  }

  /**
   * Update vendor
   */
  static async updateVendor(vendorId: string, updates: Partial<VendorMaster>): Promise<VendorMaster> {
    const response = await fetch(`/api/vendors/${vendorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update vendor');
    return response.json();
  }

  /**
   * Get vendor contracts
   */
  static async getVendorContracts(vendorId: string): Promise<ContractEnhanced[]> {
    const response = await fetch(`/api/vendors/${vendorId}/contracts`);
    if (!response.ok) throw new Error('Failed to fetch vendor contracts');
    return response.json();
  }

  /**
   * Update vendor performance score based on audits/ratings
   */
  static async updatePerformanceScore(vendorId: string, score: number): Promise<VendorMaster> {
    const response = await fetch(`/api/vendors/${vendorId}/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ performanceScore: score }),
    });

    if (!response.ok) throw new Error('Failed to update performance score');
    return response.json();
  }

  /**
   * Blacklist vendor
   */
  static async blacklistVendor(vendorId: string, reason?: string): Promise<VendorMaster> {
    return this.updateVendor(vendorId, { status: 'Blacklisted' });
  }
}
