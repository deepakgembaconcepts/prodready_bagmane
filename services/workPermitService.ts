// Work Permit Module Data Service
// Manages work permits, JSA, permit trackers, and exemptions

import type { WorkPermit } from '../types';

export interface JSA {
    jsaId: string;
    permitId: string;
    workDescription: string;
    location: string;
    hazards: {
        hazardDescription: string;
        potentialInjury: string;
        riskLevel: 'High' | 'Medium' | 'Low';
        controlMeasures: string[];
    }[];
    personalProtectiveEquipment: string[];
    preJobBriefingDone: boolean;
    preJobBriefingAttendees?: string[];
    preJobBriefingDate?: Date;
}

export interface PermitAuditRecord {
    auditId: string;
    permitId: string;
    auditDate: Date;
    auditor: string;
    findings: {
        id: string;
        finding: string;
        severity: 'Critical' | 'Major' | 'Minor';
        status: 'Open' | 'Resolved';
        resolutionDate?: Date;
    }[];
    overallCompliance: number; // percentage
    remarks?: string;
}

export interface WorkPermitIssuer {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    email: string;
    phone: string;
    authorizedPermitTypes: string[];
    activeFrom: Date;
    activeUntil: Date;
    status: 'Active' | 'Inactive';
}

export interface WorkPermitAuthorizer {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    email: string;
    phone: string;
    authorizedPermitTypes: string[];
    activeFrom: Date;
    activeUntil: Date;
    status: 'Active' | 'Inactive';
    approvalsPerDay: number;
}

export interface WorkPermitActivity {
    id: string;
    activityName: string;
    requiresPermit: boolean;
    permitType?: string;
    jsaRequired: boolean;
    riskLevel: 'High' | 'Medium' | 'Low';
    estimatedDuration?: string;
    exemptionApplicable?: boolean;
    notes?: string;
}

export interface PermitTracker {
    trackerId: string;
    permitId: string;
    permitType: string;
    issueDate: Date;
    expiryDate: Date;
    issuer: WorkPermitIssuer;
    authorizer: WorkPermitAuthorizer;
    location: string;
    workDescription: string;
    contractorDetails: {
        name: string;
        contactNumber: string;
        workforceSupervisor: string;
        workforceSize: number;
    };
    status: 'Draft' | 'Issued' | 'Active' | 'Suspended' | 'Completed' | 'Cancelled';
    statusHistory: {
        status: string;
        timestamp: Date;
        updatedBy: string;
        remarks?: string;
    }[];
    gasTestResults?: {
        gasType: string;
        value: number;
        acceptableRange: string;
        timestamp: Date;
    }[];
    toolsAndEquipment: string[];
    spotChecksPerformed: number;
    suspensionReason?: string;
    suspensionDate?: Date;
    resumptionDate?: Date;
    completionDate?: Date;
}

export interface LockOutTagOut {
    id: string;
    permitId: string;
    equipment: string;
    lockingDate: Date;
    issuedTo: string;
    energySources: {
        source: string;
        isolationMethod: string;
        verifiedBy: string;
        verificationDate: Date;
    }[];
    tryOutPerformed: boolean;
    tryOutDate?: Date;
    tryOutBy?: string;
    unlockingDate?: Date;
    unlockedBy?: string;
    verification: {
        verificationDate: Date;
        verifiedBy: string;
        status: 'Verified' | 'Not Verified';
    }[];
}

// Common work permit activities
export const WORK_PERMIT_ACTIVITIES: WorkPermitActivity[] = [
    {
        id: 'WPA-001',
        activityName: 'Hot Work (Welding, Cutting, Grinding)',
        requiresPermit: true,
        permitType: 'Hot Work',
        jsaRequired: true,
        riskLevel: 'High',
        estimatedDuration: 'Up to 8 hours',
        exemptionApplicable: false,
        notes: 'Fire watch mandatory'
    },
    {
        id: 'WPA-002',
        activityName: 'Work at Height',
        requiresPermit: true,
        permitType: 'Height Work',
        jsaRequired: true,
        riskLevel: 'High',
        estimatedDuration: 'Variable',
        exemptionApplicable: false,
        notes: 'Harness and scaffold inspection mandatory'
    },
    {
        id: 'WPA-003',
        activityName: 'Electrical Work',
        requiresPermit: true,
        permitType: 'Electrical',
        jsaRequired: true,
        riskLevel: 'High',
        estimatedDuration: 'Up to 8 hours',
        exemptionApplicable: false,
        notes: 'Licensed electrician required'
    },
    {
        id: 'WPA-004',
        activityName: 'Confined Space Entry',
        requiresPermit: true,
        permitType: 'Confined Space',
        jsaRequired: true,
        riskLevel: 'High',
        exemptionApplicable: false,
        notes: 'Atmospheric testing required'
    },
    {
        id: 'WPA-005',
        activityName: 'Excavation',
        requiresPermit: true,
        permitType: 'Excavation',
        jsaRequired: true,
        riskLevel: 'High',
        exemptionApplicable: false,
        notes: 'Utility locate required'
    },
    {
        id: 'WPA-006',
        activityName: 'Routine Maintenance',
        requiresPermit: false,
        jsaRequired: false,
        riskLevel: 'Low',
        exemptionApplicable: true,
    },
];

/**
 * Get permit activity details
 */
export function getPermitActivity(activityId: string): WorkPermitActivity | undefined {
    return WORK_PERMIT_ACTIVITIES.find(a => a.id === activityId);
}

/**
 * Check if activity requires permit
 */
export function requiresPermit(activityName: string): boolean {
    const activity = WORK_PERMIT_ACTIVITIES.find(a => 
        a.activityName.toLowerCase() === activityName.toLowerCase()
    );
    return activity?.requiresPermit || false;
}

/**
 * Get required permit type for activity
 */
export function getRequiredPermitType(activityName: string): string | undefined {
    const activity = WORK_PERMIT_ACTIVITIES.find(a => 
        a.activityName.toLowerCase() === activityName.toLowerCase()
    );
    return activity?.permitType;
}

/**
 * Generate JSA template for permit
 */
export function generateJSATemplate(permit: WorkPermit, activity: WorkPermitActivity): JSA {
    return {
        jsaId: `JSA-${permit.permitId}`,
        permitId: permit.permitId,
        workDescription: permit.description,
        location: permit.location,
        hazards: [
            {
                hazardDescription: `Hazards associated with ${activity.activityName}`,
                potentialInjury: 'Burns, Cuts, Eye injuries',
                riskLevel: activity.riskLevel as 'High' | 'Medium' | 'Low',
                controlMeasures: [
                    'Use appropriate PPE',
                    'Maintain safe distance',
                    'Follow safety procedures',
                ]
            }
        ],
        personalProtectiveEquipment: ['Safety Helmet', 'Safety Shoes', 'Gloves', 'Eye Protection'],
        preJobBriefingDone: false,
    };
}

/**
 * Validate permit completion
 */
export function validatePermitCompletion(permit: WorkPermit): {
    valid: boolean;
    missingFields: string[];
} {
    const missingFields: string[] = [];

    if (!permit.vendor) missingFields.push('Contractor Name');
    if (!permit.startDate) missingFields.push('Start Date');
    if (!permit.endDate) missingFields.push('End Date');
    if (!permit.jsaVerified) missingFields.push('JSA Verification');

    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}

/**
 * Track permit status changes
 */
export function updatePermitStatus(
    tracker: PermitTracker,
    newStatus: string,
    remarks?: string
): PermitTracker {
    return {
        ...tracker,
        status: newStatus as any,
        statusHistory: [
            ...tracker.statusHistory,
            {
                status: newStatus,
                timestamp: new Date(),
                updatedBy: 'Current User', // Will be replaced by actual user
                remarks,
            }
        ]
    };
}

/**
 * Perform gas test for confined space
 */
export function performGasTest(
    tracker: PermitTracker,
    gasType: string,
    value: number,
    acceptableRange: string
): PermitTracker {
    return {
        ...tracker,
        gasTestResults: [
            ...(tracker.gasTestResults || []),
            {
                gasType,
                value,
                acceptableRange,
                timestamp: new Date(),
            }
        ]
    };
}

/**
 * Check permit validity
 */
export function isPermitValid(tracker: PermitTracker): boolean {
    const now = new Date();
    return tracker.expiryDate > now && (tracker.status === 'Issued' || tracker.status === 'Active');
}

/**
 * Generate permit audit checklist
 */
export function generatePermitAuditChecklist(permitType: string): Array<{ item: string; critical: boolean }> {
    const baseChecklist = [
        { item: 'Permit issued by authorized person', critical: true },
        { item: 'Permit signed by all parties', critical: true },
        { item: 'Work scope clearly defined', critical: true },
        { item: 'Hazards identified and assessed', critical: true },
        { item: 'Control measures implemented', critical: true },
        { item: 'JSA completed and signed', critical: true },
        { item: 'PPE specified and available', critical: true },
        { item: 'Permit not expired', critical: true },
    ];

    if (permitType === 'Hot Work') {
        baseChecklist.push(
            { item: 'Fire watch present', critical: true },
            { item: 'Fire extinguisher available', critical: true }
        );
    } else if (permitType === 'Height Work') {
        baseChecklist.push(
            { item: 'Harness inspected', critical: true },
            { item: 'Scaffold certified', critical: true }
        );
    } else if (permitType === 'Confined Space') {
        baseChecklist.push(
            { item: 'Atmospheric test done', critical: true },
            { item: 'Rescue equipment available', critical: true }
        );
    }

    return baseChecklist;
}
