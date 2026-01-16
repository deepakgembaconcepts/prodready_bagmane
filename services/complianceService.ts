// Compliance & Maintenance Module Data Service
// Manages statutory compliance, licenses, and preventive maintenance

import type { ComplianceItem, Asset } from '../types';

export interface ComplianceCategory {
    id: string;
    categoryName: string;
    authority: string;
    frequency: 'Yearly' | 'Half-yearly' | 'Quarterly' | 'Monthly';
    description: string;
    documents: string[];
    responsibleDepartment: string;
}

export interface MaintenanceSchedule {
    id: string;
    assetId: string;
    assetName: string;
    maintenanceType: 'Preventive' | 'Corrective' | 'Predictive' | 'Shutdown';
    frequency: string; // e.g., "Monthly", "Quarterly"
    lastMaintenanceDate: Date;
    nextMaintenanceDate: Date;
    estimatedDuration: number; // hours
    vendor?: string;
    contract?: string;
    sparePartsRequired?: string[];
    expectedCost?: number;
    maintenanceHistory: MaintenanceRecord[];
}

export interface MaintenanceRecord {
    id: string;
    maintenanceScheduleId: string;
    maintenanceDate: Date;
    startTime: string;
    endTime: string;
    performedBy: string;
    supervisor: string;
    workDescription: string;
    defectsFound?: string;
    sparePartsUsed?: {
        partName: string;
        quantity: number;
        cost: number;
    }[];
    labourCost: number;
    totalCost: number;
    status: 'Planned' | 'In Progress' | 'Completed' | 'Pending Approval';
    technicalRemarks?: string;
    nextScheduledDate?: Date;
    downtime?: number; // minutes
    assetConditionAfter?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface MaintenanceChecklist {
    id: string;
    assetId: string;
    assetName: string;
    maintenanceType: string;
    items: ChecklistItem[];
    frequency: string;
    estimatedDuration: number;
}

export interface ChecklistItem {
    itemNumber: number;
    task: string;
    checkPoints?: string[];
    normalReading?: string;
    unit?: string;
    remarks?: string;
    completed?: boolean;
    verifiedBy?: string;
}

export interface PPMContract {
    contractId: string;
    vendorName: string;
    vendorId: string;
    assetsCovered: {
        assetId: string;
        assetName: string;
    }[];
    frequency: 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly';
    costPerVisit: number;
    contractStartDate: Date;
    contractEndDate: Date;
    totalValue: number;
    sparePartsCoverage: 'Full' | 'Partial' | 'Not Covered';
    responseTime: number; // hours
    contactPerson: string;
    contactNumber: string;
    invoicesRaised: number;
    totalInvoiceValue: number;
    pendingInvoices: number;
    performanceRating: number; // 1-5
}

export interface ComplianceCheckpoint {
    checkpointId: string;
    complianceId: string;
    checkpointName: string;
    checkpointDate: Date;
    checkedBy: string;
    status: 'Compliant' | 'Non-Compliant' | 'Partial';
    findings?: string;
    actionItems?: {
        action: string;
        responsiblePerson: string;
        targetDate: Date;
        status: 'Open' | 'Closed';
    }[];
    certificateValidUpto?: Date;
}

// Common compliance categories for facilities
export const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
    {
        id: 'COMP-001',
        categoryName: 'Fire Safety Certificate',
        authority: 'Fire Department',
        frequency: 'Yearly',
        description: 'Annual fire safety audit and certification',
        documents: ['Fire Audit Report', 'Certificate'],
        responsibleDepartment: 'Safety & Security',
    },
    {
        id: 'COMP-002',
        categoryName: 'Electrical Safety Compliance',
        authority: 'Electrical Inspector',
        frequency: 'Yearly',
        description: 'Annual electrical safety inspection',
        documents: ['Electrical Audit Report', 'Certificate'],
        responsibleDepartment: 'Technical',
    },
    {
        id: 'COMP-003',
        categoryName: 'Water Quality Testing',
        authority: 'Environmental Department',
        frequency: 'Half-yearly',
        description: 'Water quality testing and validation',
        documents: ['Test Report', 'Analysis Results'],
        responsibleDepartment: 'Facilities',
    },
    {
        id: 'COMP-004',
        categoryName: 'Environmental Compliance',
        authority: 'EPA / Pollution Board',
        frequency: 'Yearly',
        description: 'Environmental compliance verification',
        documents: ['Compliance Report', 'Certificate'],
        responsibleDepartment: 'Sustainability',
    },
    {
        id: 'COMP-005',
        categoryName: 'Lift / Elevator Certification',
        authority: 'Lift Inspector',
        frequency: 'Yearly',
        description: 'Annual lift/elevator inspection',
        documents: ['Inspection Report', 'Certification'],
        responsibleDepartment: 'Technical',
    },
];

/**
 * Get compliance category
 */
export function getComplianceCategory(categoryId: string): ComplianceCategory | undefined {
    return COMPLIANCE_CATEGORIES.find(c => c.id === categoryId);
}

/**
 * Calculate days until compliance expiry
 */
export function daysUntilExpiry(expiryDate: Date): number {
    const today = new Date();
    const diff = expiryDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Determine compliance status
 */
export function getComplianceStatus(expiryDate: Date): 'Compliant' | 'Expiring Soon' | 'Expired' | 'Critical' {
    const daysLeft = daysUntilExpiry(expiryDate);
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft <= 7) return 'Critical';
    if (daysLeft <= 30) return 'Expiring Soon';
    return 'Compliant';
}

/**
 * Get maintenance schedule for asset
 */
export function getMaintenanceSchedule(asset: Asset): MaintenanceSchedule {
    return {
        id: `MS-${asset.id}`,
        assetId: asset.id.toString(),
        assetName: asset.name,
        maintenanceType: 'Preventive',
        frequency: asset.maintenance_Frequency || 'Quarterly',
        lastMaintenanceDate: asset.lastMaintenanceDate || asset.purchaseDate,
        nextMaintenanceDate: asset.nextMaintenanceDate,
        estimatedDuration: 4,
        vendor: asset.vendorForMaintenance,
        contract: asset.contractId,
        sparePartsRequired: [],
        expectedCost: (asset.cost * 0.05), // 5% of asset cost
        maintenanceHistory: [],
    };
}

/**
 * Generate PPM import template
 */
export function generatePPMImportTemplate(assets: Asset[]): object[] {
    return assets.map(asset => ({
        'Asset ID': asset.assetId,
        'Asset Name': asset.name,
        'Category': asset.category,
        'Building': asset.building,
        'Location': asset.location,
        'Equipment Type': asset.category,
        'Maintenance Type': 'Preventive',
        'Frequency': asset.maintenance_Frequency || 'Quarterly',
        'Last PPM Date': asset.lastMaintenanceDate?.toLocaleDateString() || '',
        'Next PPM Date': asset.nextMaintenanceDate.toLocaleDateString(),
        'Estimated Duration (hours)': 4,
        'Vendor': asset.vendorForMaintenance || '',
        'Contract': asset.contractId || '',
        'Spare Parts Required': '',
        'Expected Cost': (asset.cost * 0.05).toFixed(2),
    }));
}

/**
 * Create maintenance record
 */
export function createMaintenanceRecord(
    scheduleId: string,
    performedBy: string,
    workDescription: string,
    startTime: string,
    endTime: string
): MaintenanceRecord {
    return {
        id: `MR-${Date.now()}`,
        maintenanceScheduleId: scheduleId,
        maintenanceDate: new Date(),
        startTime,
        endTime,
        performedBy,
        supervisor: 'TBD',
        workDescription,
        labourCost: 500,
        totalCost: 500,
        status: 'In Progress',
    };
}

/**
 * Calculate maintenance statistics
 */
export function calculateMaintenanceStats(schedules: MaintenanceSchedule[]): {
    totalAssets: number;
    dueMaintenance: number;
    overdueMaintenance: number;
    completedThisMonth: number;
    pendingApproval: number;
} {
    const today = new Date();
    let dueMaintenance = 0;
    let overdueMaintenance = 0;

    schedules.forEach(schedule => {
        if (schedule.nextMaintenanceDate <= today) {
            overdueMaintenance++;
        } else if (schedule.nextMaintenanceDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            dueMaintenance++;
        }
    });

    return {
        totalAssets: schedules.length,
        dueMaintenance,
        overdueMaintenance,
        completedThisMonth: 0,
        pendingApproval: 0,
    };
}

/**
 * Generate compliance renewal reminder
 */
export function generateComplianceRenewalReminder(compliance: ComplianceItem): {
    daysLeft: number;
    reminderLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    message: string;
} {
    const daysLeft = daysUntilExpiry(compliance.expiryDate);
    
    let reminderLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    if (daysLeft < 0) reminderLevel = 'Critical';
    else if (daysLeft <= 15) reminderLevel = 'Critical';
    else if (daysLeft <= 30) reminderLevel = 'High';
    else if (daysLeft <= 60) reminderLevel = 'Medium';

    const message = daysLeft < 0 
        ? `URGENT: ${compliance.title} has expired. Immediate renewal required!`
        : `${compliance.title} expires in ${daysLeft} days. Schedule renewal immediately.`;

    return { daysLeft, reminderLevel, message };
}
