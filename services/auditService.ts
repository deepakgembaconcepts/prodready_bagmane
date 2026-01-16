// Audit Module Data Service
// Manages audit plans, checklists, findings, and reports

import type { Audit } from '../types';

export interface AuditPlan {
    id: string;
    year: number;
    schedules: AuditSchedule[];
    scope?: string;
    objectives?: string[];
}

export interface AuditSchedule {
    id: string;
    auditType: 'Safety' | 'Hygiene' | 'Security' | 'Statutory' | 'Process' | 'Internal' | 'External';
    auditTitle: string;
    building: string;
    scheduledDate: Date;
    estimatedDuration: number; // hours
    auditorName: string;
    criteria: string[];
}

export interface NonConformance {
    id: string;
    auditId: string;
    findingNumber: number;
    description: string;
    severity: 'Critical' | 'Major' | 'Minor';
    clause?: string;
    observedFact: string;
    correctiveActionRequired: string;
    rootCauseAnalysis?: string;
    targetDateForCorrection?: Date;
    actualClosureDate?: Date;
    status: 'Open' | 'In Progress' | 'Closed' | 'Verified';
    closedBy?: string;
    evidenceOfClosure?: string;
}

export interface AuditObservation {
    id: string;
    auditId: string;
    observationNumber: number;
    observation: string;
    category: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    recommendedImprovement?: string;
    implementationDate?: Date;
    status: 'Open' | 'Implemented' | 'Verified';
}

export interface InternalAuditReport {
    id: string;
    auditId: string;
    auditStartDate: Date;
    auditEndDate: Date;
    auditors: string[];
    scope: string;
    criteria: string[];
    auditeeInformation: {
        building: string;
        department: string;
        personnel: string[];
    };
    summary: string;
    overallScore?: number; // 0-100
    conformancesObserved: number;
    nonConformancesFound: number;
    observations: number;
    strengths?: string[];
    opportunities?: string[];
    nextAuditDate?: Date;
    reportDate: Date;
    approvedBy?: string;
}

// Audit observation tracker for tracking multiple findings
export interface AuditObservationTracker {
    id: string;
    auditDate: Date;
    building: string;
    auditor: string;
    observations: TrackerObservation[];
}

export interface TrackerObservation {
    observationId: string;
    description: string;
    severity: 'Critical' | 'Major' | 'Minor';
    department: string;
    category: 'Safety' | 'Health' | 'Hygiene' | 'Security' | 'Process' | 'Documentation';
    photosAttached?: string[];
    personResponsible?: string;
    targetCorrectionDate?: Date;
    actualCorrectionDate?: Date;
    status: 'Open' | 'In Progress' | 'Closed';
    remarks?: string;
}

/**
 * Create audit from template
 */
export function createAuditFromSchedule(schedule: AuditSchedule): Audit {
    return {
        id: 0,
        auditId: `AUD-${new Date().getFullYear()}-${String(Math.random() * 10000).padStart(4, '0')}`,
        title: schedule.auditTitle,
        type: schedule.auditType,
        auditor: schedule.auditorName,
        scheduledDate: schedule.scheduledDate,
        status: 'Scheduled',
        score: 0,
        findingsCount: 0,
        nonConformanceItems: [],
        auditObservations: [],
        scope: schedule.criteria.join(', '),
        buildingCovered: [schedule.building],
    };
}

/**
 * Calculate audit score based on findings
 * Score = 100 - (Critical*5 + Major*3 + Minor*1)
 */
export function calculateAuditScore(findings: NonConformance[]): number {
    let score = 100;
    findings.forEach(finding => {
        if (finding.status !== 'Closed' && finding.status !== 'Verified') {
            switch (finding.severity) {
                case 'Critical':
                    score -= 5;
                    break;
                case 'Major':
                    score -= 3;
                    break;
                case 'Minor':
                    score -= 1;
                    break;
            }
        }
    });
    return Math.max(0, score);
}

/**
 * Generate non-conformance report
 */
export function generateNonConformanceReport(
    audit: Audit,
    nonConformances: NonConformance[]
): {
    totalFindings: number;
    criticalFindings: number;
    majorFindings: number;
    minorFindings: number;
    pendingClosures: number;
    report: string;
} {
    const critical = nonConformances.filter(nc => nc.severity === 'Critical').length;
    const major = nonConformances.filter(nc => nc.severity === 'Major').length;
    const minor = nonConformances.filter(nc => nc.severity === 'Minor').length;
    const pending = nonConformances.filter(nc => nc.status === 'Open').length;

    const report = `
Audit Report: ${audit.title}
Audit Date: ${audit.scheduledDate.toLocaleDateString()}
Auditor: ${audit.auditor}

FINDINGS SUMMARY:
- Total Non-Conformances: ${nonConformances.length}
- Critical: ${critical}
- Major: ${major}
- Minor: ${minor}
- Pending Closure: ${pending}

AUDIT SCORE: ${calculateAuditScore(nonConformances)}/100
    `;

    return {
        totalFindings: nonConformances.length,
        criticalFindings: critical,
        majorFindings: major,
        minorFindings: minor,
        pendingClosures: pending,
        report,
    };
}

/**
 * Generate RCA (Root Cause Analysis) template
 */
export function generateRCATemplate(nonConformance: NonConformance): string {
    return `
Root Cause Analysis for NC #${nonConformance.findingNumber}
Finding: ${nonConformance.description}
Severity: ${nonConformance.severity}

1. IMMEDIATE CAUSE:
   What directly caused the non-conformance?

2. ROOT CAUSE(S):
   Why did the immediate cause occur? (Use 5 Whys)
   Why 1: ?
   Why 2: ?
   Why 3: ?
   Why 4: ?
   Why 5: ?

3. CONTRIBUTING FACTORS:
   - 
   - 
   - 

4. CORRECTIVE ACTIONS:
   Action 1: ? (Responsible: ?, Due: ?)
   Action 2: ? (Responsible: ?, Due: ?)

5. PREVENTIVE ACTIONS:
   Action 1: ? (Responsible: ?, Due: ?)

6. EFFECTIVENESS CHECK:
   Date: ?, Verified By: ?, Status: ?
    `;
}

/**
 * Track audit observation closure
 */
export function trackObservationClosure(observation: AuditObservation, closureDate: Date, evidence: string): AuditObservation {
    return {
        ...observation,
        status: 'Verified',
        implementationDate: closureDate,
        recommendedImprovement: evidence,
    };
}

/**
 * Generate audit schedule for a year
 */
export function generateAnnualAuditSchedule(year: number, buildingsToAudit: string[]): AuditSchedule[] {
    const auditTypes: Array<'Safety' | 'Hygiene' | 'Security' | 'Statutory'> = ['Safety', 'Hygiene', 'Security', 'Statutory'];
    const schedules: AuditSchedule[] = [];
    const auditors = ['Rajesh Kumar', 'Sita Sharma', 'Amit Patel'];
    
    let auditId = 1;
    const months = [1, 3, 5, 7, 9, 11]; // Spread across year

    months.forEach((month, monthIndex) => {
        auditTypes.forEach((type, typeIndex) => {
            const building = buildingsToAudit[typeIndex % buildingsToAudit.length];
            schedules.push({
                id: `SCHED-${year}-${String(auditId).padStart(3, '0')}`,
                auditType: type,
                auditTitle: `${type} Audit - ${building}`,
                building,
                scheduledDate: new Date(year, month - 1, 15 + monthIndex * 2),
                estimatedDuration: 8,
                auditorName: auditors[monthIndex % auditors.length],
                criteria: [`${type} Standards and Regulations`],
            });
            auditId++;
        });
    });

    return schedules;
}
