/**
 * Inventory & Asset Management Service
 * Stock Transfer: Request and track material transfers between campuses
 * QR Codes: Download/Print function for all assets
 * Asset Dashboards: Operational Age buckets (0-2 yrs, 2-4 yrs, etc.)
 */

export interface StockTransferRequest {
  id: string;
  transferId: string;
  
  // Source
  sourceCampus: string;
  sourceBuilding: string;
  sourceLocation: string;
  
  // Destination
  destinationCampus: string;
  destinationBuilding: string;
  destinationLocation: string;
  
  // Items
  items: TransferItem[];
  
  // Request details
  requestedBy: string;
  requestedAt: Date;
  approver?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | 'In Transit' | 'Completed';
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Transit tracking
  shippedBy?: string;
  shippedAt?: Date;
  transportMethod?: 'Internal' | 'Courier' | 'Manual';
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  
  // Receipt
  receivedBy?: string;
  receivedAt?: Date;
  receiptNotes?: string;
  damageReported?: boolean;
  damageDetails?: string;
  
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface TransferItem {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  
  // QR code info
  qrCodeUrl?: string;
  serialNumbers?: string[];
}

export interface AssetWithQRCode {
  id: string;
  assetId: string;
  name: string;
  category: string;
  location: string;
  building: string;
  campus: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  status: 'Operational' | 'In Maintenance' | 'Breakdown' | 'Standby' | 'Decommissioned';
  
  // QR Code
  qrCode: {
    url: string; // URL to QR code image
    data: string; // QR encoded data
    generated: Date;
  };
  
  // Operational age
  operationalAge: number; // years
  ageBucket: '0-2 yrs' | '2-4 yrs' | '4-6 yrs' | '6-8 yrs' | '8+ yrs';
  
  cost: number;
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  yearOfInstallation: number;
}

export interface OperationalAgeDashboard {
  totalAssets: number;
  byAgeBucket: {
    '0-2 yrs': { count: number; value: number; percentage: number };
    '2-4 yrs': { count: number; value: number; percentage: number };
    '4-6 yrs': { count: number; value: number; percentage: number };
    '6-8 yrs': { count: number; value: number; percentage: number };
    '8+ yrs': { count: number; value: number; percentage: number };
  };
  byCategory: { [category: string]: { count: number; value: number } };
  byBuilding: { [building: string]: { count: number; value: number } };
  averageAge: number; // years
  totalValue: number;
  replacementRecommendations: AssetWithQRCode[];
  maintenanceCritical: AssetWithQRCode[];
}

export interface AssetDashboard {
  totalAssets: number;
  operational: number;
  inMaintenance: number;
  breakdown: number;
  standby: number;
  decommissioned: number;
  operationalPercentage: number;
  averageAge: number;
  totalValue: number;
  byCategory: { [category: string]: number };
  byBuilding: { [building: string]: number };
  recentTransfers: StockTransferRequest[];
  pendingTransfers: StockTransferRequest[];
}

/**
 * Stock Transfer Service
 */
export class StockTransferService {
  /**
   * Create stock transfer request
   */
  static async createTransfer(
    transfer: Omit<StockTransferRequest, 'id' | 'transferId' | 'requestedAt'>
  ): Promise<StockTransferRequest> {
    const response = await fetch('/api/stock-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transfer,
        requestedAt: new Date(),
      }),
    });

    if (!response.ok) throw new Error('Failed to create stock transfer');
    return response.json();
  }

  /**
   * Get transfer by ID
   */
  static async getTransfer(transferId: string): Promise<StockTransferRequest> {
    const response = await fetch(`/api/stock-transfer/${transferId}`);
    if (!response.ok) throw new Error('Failed to fetch transfer');
    return response.json();
  }

  /**
   * Get all transfers for campus
   */
  static async getTransfersByCampus(campus: string): Promise<StockTransferRequest[]> {
    const response = await fetch(`/api/stock-transfer?campus=${encodeURIComponent(campus)}`);
    if (!response.ok) throw new Error('Failed to fetch transfers');
    return response.json();
  }

  /**
   * Get pending transfer approvals
   */
  static async getPendingApprovals(): Promise<StockTransferRequest[]> {
    const response = await fetch('/api/stock-transfer?status=Pending');
    if (!response.ok) throw new Error('Failed to fetch pending approvals');
    return response.json();
  }

  /**
   * Approve transfer
   */
  static async approveTransfer(transferId: string, approvedBy: string): Promise<StockTransferRequest> {
    const response = await fetch(`/api/stock-transfer/${transferId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvedBy,
        approvalStatus: 'Approved',
        approvedAt: new Date(),
      }),
    });

    if (!response.ok) throw new Error('Failed to approve transfer');
    return response.json();
  }

  /**
   * Reject transfer
   */
  static async rejectTransfer(
    transferId: string,
    rejectedBy: string,
    reason: string
  ): Promise<StockTransferRequest> {
    const response = await fetch(`/api/stock-transfer/${transferId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rejectedBy,
        rejectionReason: reason,
        approvalStatus: 'Rejected',
      }),
    });

    if (!response.ok) throw new Error('Failed to reject transfer');
    return response.json();
  }

  /**
   * Mark as shipped
   */
  static async markAsShipped(
    transferId: string,
    shippedBy: string,
    transportMethod: 'Internal' | 'Courier' | 'Manual',
    trackingNumber?: string
  ): Promise<StockTransferRequest> {
    const response = await fetch(`/api/stock-transfer/${transferId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippedBy,
        approvalStatus: 'In Transit',
        shippedAt: new Date(),
        transportMethod,
        trackingNumber,
      }),
    });

    if (!response.ok) throw new Error('Failed to mark as shipped');
    return response.json();
  }

  /**
   * Mark as received
   */
  static async markAsReceived(
    transferId: string,
    receivedBy: string,
    damageReported: boolean = false,
    damageDetails?: string
  ): Promise<StockTransferRequest> {
    const response = await fetch(`/api/stock-transfer/${transferId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receivedBy,
        approvalStatus: 'Completed',
        receivedAt: new Date(),
        damageReported,
        damageDetails,
      }),
    });

    if (!response.ok) throw new Error('Failed to mark as received');
    return response.json();
  }

  /**
   * Track transfer in transit
   */
  static async trackTransfer(transferId: string): Promise<StockTransferRequest> {
    return this.getTransfer(transferId);
  }
}

/**
 * Asset QR Code Service
 */
export class AssetQRCodeService {
  /**
   * Generate QR code for asset
   */
  static async generateQRCode(assetId: string): Promise<{ qrCodeUrl: string; qrData: string }> {
    const response = await fetch(`/api/assets/${assetId}/qr-code/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to generate QR code');
    return response.json();
  }

  /**
   * Get asset QR code
   */
  static async getQRCode(assetId: string): Promise<AssetWithQRCode> {
    const response = await fetch(`/api/assets/${assetId}/qr-code`);
    if (!response.ok) throw new Error('Failed to fetch QR code');
    return response.json();
  }

  /**
   * Download QR code as image
   */
  static async downloadQRCode(assetId: string, format: 'png' | 'pdf' = 'png'): Promise<Blob> {
    const response = await fetch(`/api/assets/${assetId}/qr-code/download?format=${format}`);
    if (!response.ok) throw new Error('Failed to download QR code');
    return response.blob();
  }

  /**
   * Print QR code
   */
  static async printQRCode(assetIds: string[]): Promise<Blob> {
    const response = await fetch('/api/assets/qr-code/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds }),
    });

    if (!response.ok) throw new Error('Failed to prepare print document');
    return response.blob();
  }

  /**
   * Generate batch QR codes
   */
  static async generateBatchQRCodes(assetIds: string[]): Promise<Array<{ assetId: string; qrCodeUrl: string }>> {
    const response = await fetch('/api/assets/qr-code/batch-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds }),
    });

    if (!response.ok) throw new Error('Failed to generate batch QR codes');
    return response.json();
  }

  /**
   * Get all QR codes for building
   */
  static async getQRCodesForBuilding(building: string): Promise<AssetWithQRCode[]> {
    const response = await fetch(`/api/assets/qr-code/building/${encodeURIComponent(building)}`);
    if (!response.ok) throw new Error('Failed to fetch QR codes for building');
    return response.json();
  }

  /**
   * Scan QR code (for mobile app)
   */
  static async scanQRCode(qrData: string): Promise<AssetWithQRCode> {
    const response = await fetch('/api/assets/qr-code/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData }),
    });

    if (!response.ok) throw new Error('Failed to scan QR code');
    return response.json();
  }
}

/**
 * Asset Operational Age Service
 */
export class AssetOperationalAgeService {
  /**
   * Calculate operational age bucket
   */
  static calculateAgeBucket(yearOfInstallation: number): '0-2 yrs' | '2-4 yrs' | '4-6 yrs' | '6-8 yrs' | '8+ yrs' {
    const age = new Date().getFullYear() - yearOfInstallation;
    if (age < 2) return '0-2 yrs';
    if (age < 4) return '2-4 yrs';
    if (age < 6) return '4-6 yrs';
    if (age < 8) return '6-8 yrs';
    return '8+ yrs';
  }

  /**
   * Get operational age dashboard
   */
  static async getOperationalAgeDashboard(): Promise<OperationalAgeDashboard> {
    const response = await fetch('/api/assets/operational-age/dashboard');
    if (!response.ok) throw new Error('Failed to fetch operational age dashboard');
    return response.json();
  }

  /**
   * Get assets by age bucket
   */
  static async getAssetsByAgeBucket(
    bucket: '0-2 yrs' | '2-4 yrs' | '4-6 yrs' | '6-8 yrs' | '8+ yrs'
  ): Promise<AssetWithQRCode[]> {
    const response = await fetch(`/api/assets/operational-age/${bucket}`);
    if (!response.ok) throw new Error('Failed to fetch assets by age bucket');
    return response.json();
  }

  /**
   * Get replacement recommendations (8+ years old)
   */
  static async getReplacementRecommendations(): Promise<AssetWithQRCode[]> {
    const response = await fetch('/api/assets/operational-age/replacements');
    if (!response.ok) throw new Error('Failed to fetch replacement recommendations');
    return response.json();
  }

  /**
   * Get maintenance-critical assets by age
   */
  static async getMaintenanceCritical(): Promise<AssetWithQRCode[]> {
    const response = await fetch('/api/assets/operational-age/maintenance-critical');
    if (!response.ok) throw new Error('Failed to fetch maintenance-critical assets');
    return response.json();
  }
}

/**
 * Asset Dashboard Service
 */
export class AssetDashboardService {
  /**
   * Get comprehensive asset dashboard
   */
  static async getDashboard(): Promise<AssetDashboard> {
    const response = await fetch('/api/assets/dashboard');
    if (!response.ok) throw new Error('Failed to fetch asset dashboard');
    return response.json();
  }

  /**
   * Get assets by building
   */
  static async getAssetsByBuilding(building: string): Promise<AssetWithQRCode[]> {
    const response = await fetch(`/api/assets?building=${encodeURIComponent(building)}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  }

  /**
   * Get assets by category
   */
  static async getAssetsByCategory(category: string): Promise<AssetWithQRCode[]> {
    const response = await fetch(`/api/assets?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  }
}
