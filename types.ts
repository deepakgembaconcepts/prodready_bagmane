
import React from 'react';

export enum Status {
    Open = 'Open',
    WIP = 'WIP',
    Resolved = 'Resolved',
    Closed = 'Closed',
    Lapsed = 'Lapsed',
}

export enum Priority {
    P1 = 'P1 - Critical',
    P2 = 'P2 - High',
    P3 = 'P3 - Medium',
    P4 = 'P4 - Low',
}

export enum Category {
    Technical = 'Technical',
    SoftServices = 'Soft Services',
    Civil = 'Civil',
    Security = 'Security',
    Horticulture = 'Horticulture',
    Admin = 'Admin',
}

export enum ViewType {
    DASHBOARD = 'DASHBOARD',
    SITE_HIERARCHY = 'SITE_HIERARCHY',
    COMPLEX_INFO = 'COMPLEX_INFO',
    TICKETS = 'TICKETS',
    ASSETS = 'ASSETS',
    ASSET_REGISTRY = 'ASSET_REGISTRY',
    ASSET_DASHBOARD = 'ASSET_DASHBOARD',
    PPM = 'PPM',
    CONTRACTS = 'CONTRACTS',
    ASSET_VERIFICATION = 'ASSET_VERIFICATION',
    INCIDENTS = 'INCIDENTS',
    WORK_PERMITS = 'WORK_PERMITS',
    AUDITS = 'AUDITS',
    INVENTORY = 'INVENTORY',
    TASKS = 'TASKS',
    FEEDBACK = 'FEEDBACK',
    CSAT_MODULE = 'CSAT_MODULE', // Sub-module of Feedback
    NPS_MODULE = 'NPS_MODULE', // Sub-module of Feedback
    TENANT_PORTAL = 'TENANT_PORTAL',
    VENDOR_CRM = 'VENDOR_CRM',
    COMPLIANCE = 'COMPLIANCE',
    ESG = 'ESG',
    TRANSITION = 'TRANSITION',
    UTILITY_BILLING = 'UTILITY_BILLING',
    USER_GROUPS = 'USER_GROUPS',
    // Daily Task Sub-modules
    TASKS_TECHNICAL = 'TASKS_TECHNICAL',
    TASKS_SOFT_SERVICES = 'TASKS_SOFT_SERVICES',
    TASKS_SECURITY = 'TASKS_SECURITY',
    TASKS_HORTICULTURE = 'TASKS_HORTICULTURE',
    // Work Permit Sub-modules
    WORK_PERMITS_DASHBOARD = 'WORK_PERMITS_DASHBOARD',
    JSA_MANAGEMENT = 'JSA_MANAGEMENT',
    ASSET_QR_CODES = 'ASSET_QR_CODES',
    ASSET_OPERATIONAL_AGE = 'ASSET_OPERATIONAL_AGE',
    STOCK_TRANSFER = 'STOCK_TRANSFER',
    // Dashboard Sub-modules
    CSAT_DASHBOARD = 'CSAT_DASHBOARD',
    NPS_DASHBOARD = 'NPS_DASHBOARD',
    WORK_PERMIT_DASHBOARD = 'WORK_PERMIT_DASHBOARD',
    WORK_PERMIT_APPROVAL = 'WORK_PERMIT_APPROVAL',
    STOCK_TRANSFER_DASHBOARD = 'STOCK_TRANSFER_DASHBOARD',
    INVENTORY_DASHBOARD = 'INVENTORY_DASHBOARD',
    TICKET_DASHBOARD = 'TICKET_DASHBOARD',
    CONTRACT_VENDOR = 'CONTRACT_VENDOR',
    CLIENT_CONNECT_MEETINGS = 'CLIENT_CONNECT_MEETINGS',
    HELPDESK_DASHBOARD = 'HELPDESK_DASHBOARD',
    ESCALATION_TIMELINE = 'ESCALATION_TIMELINE',
}

export enum UserRole {
    ADMIN = 'Admin',
    BUILDING_MANAGER = 'Building Manager',
    TECHNICIAN_L0 = 'L0 Technician',
    TECHNICIAN_L1 = 'L1 Technician',
    TECHNICIAN_L2 = 'L2 Technician',
    SUPERVISOR = 'Supervisor',
    TENANT = 'Tenant',
    FINANCE_MANAGER = 'Finance Manager',
}

export enum AssetStatus {
    Operational = 'Operational',
    InMaintenance = 'In Maintenance',
    Breakdown = 'Breakdown',
    Standby = 'Standby',
    Decommissioned = 'Decommissioned',
}

export enum AssetCategory {
    HVAC = 'HVAC',
    Electrical = 'Electrical',
    Plumbing = 'Plumbing',
    FireSafety = 'Fire Safety',
    IT = 'IT',
    Furniture = 'Furniture',
    Transport = 'Transport'
}

export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    PendingApproval = 'Pending Approval',
    Completed = 'Completed'
}

export enum TaskPriority {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low'
}

export interface User {
    id: number;
    name: string;
    role: UserRole;
    description: string;
    icon: React.FC;
    permissions: ViewType[];
}

export interface Ticket {
    id: number;
    ticketId: string;
    createdBy: string;
    contactEmail: string;
    category: Category;
    subcategory: string;
    status: Status;
    runningTAT: string;
    assignedLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
    technicianName: string;
    priority: Priority;
    createdAt: Date;
    description: string;
    building: string;
    rootCauseAnalysis?: string;
    // Ticket Master CSV fields
    ticketType?: string; // e.g., 'Reactive', 'Proactive'
    issueType?: string; // e.g., 'Client Complaint', 'Observation'
    issue?: string; // Issue description/category
    // L0 - L5 Escalation fields
    l0ResponseTime?: number; // in minutes
    l0ResolutionTime?: number; // in minutes
    l0Assignee?: string;
    l1ResponseTime?: number;
    l1ResolutionTime?: number;
    l1Assignee?: string;
    l2ResponseTime?: number;
    l2ResolutionTime?: number;
    l2Assignee?: string;
    l3ResponseTime?: number;
    l3ResolutionTime?: number;
    l3Assignee?: string;
    l4ResponseTime?: number;
    l4ResolutionTime?: number;
    l4Assignee?: string;
    l5ResponseTime?: number;
    l5ResolutionTime?: number;
    l5Assignee?: string;
    // Escalation flags from master
    clientEscalation?: boolean;
    tenantEscalation?: boolean;
    // SLA Matrix fields
    escalationLevel?: number;
    responseTimeTarget?: number;
    resolutionTimeTarget?: number;
    title?: string;
    requester?: string;
    requesterEmail?: string;
    requesterPhone?: string;
    assignedTo?: string;
    location?: string;
}

export interface Asset {
    id: number;
    assetId: string;
    // Basic Information
    campus?: string;
    building: string;
    name: string; // Asset Name (Max 120 chars)
    category: AssetCategory;
    subCategory?: string;
    assetType?: string;
    serviceType?: string;

    // Hierarchy
    parentAssetCode?: string; // Max 20 chars
    childAssetDetails?: string; // Max 120 chars

    // Location Details
    wing?: string;
    floor?: string;
    room?: string;
    location: string;

    // Asset Properties
    status: AssetStatus;
    critical?: boolean;
    quantity?: number;
    make?: string; // Manufacturer (Max 64 chars)
    model?: string; // Max 25 chars
    serialNumber: string; // Max 25 chars
    capacity?: string; // Max 10 chars
    uom?: string; // Unit of Measure

    // Maintenance
    maintenancePolicy?: string;
    surfaceType?: string;
    lastMaintenanceDate?: Date;
    maintenance_Frequency?: string;
    nextMaintenanceDate: Date;

    // Ownership & QR Codes
    assetOwner?: string;
    clientQRCode?: string; // Max 64 chars
    clientAssetCode?: string; // Max 64 chars
    fmPartnerCode?: string; // Max 64 chars
    companyAssetCode?: string; // Max 64 chars
    alternatePartNumber?: string; // Max 64 chars

    // Dates
    purchaseDate: Date; // dd-mm-yyyy
    installDate?: Date; // Date of Installation
    lifeOfEquipment?: number; // Years (Max 3)
    endOfLife?: Date; // dd-mm-yyyy
    overhaulDate?: Date; // Date of Overhaul

    // Installation & Handover
    oem?: string; // OEM Name (Max 120 chars)
    installedBy?: string; // Max 120 chars
    warrantyApplicable?: boolean;
    warrantyExpiry?: Date; // Warranty Valid Date
    handoverIndicatedDate?: Date;
    handoverActualDate?: Date;

    // Insurance
    insuranceCompany?: string;
    insuranceAgent?: string;
    insuranceDate?: Date;

    // Financial
    cost: number;
    depreciationRate?: number; // Rate of Depreciation (%)
    replacementCost?: number;

    // Additional
    remarks?: string; // Max 255 chars
    image?: string;
    verificationStatus?: 'Verified' | 'Missing' | 'Damaged' | 'Unverified';
    lastVerified?: Date;
    contractId?: string; // Link to Contract

    // Legacy fields (kept for backward compatibility)
    yearOfInstallation?: number;
    criticalityLevel?: 'Critical' | 'High' | 'Medium' | 'Low';
    vendorForMaintenance?: string;
    sparePartsAvailable?: boolean;
    documentationUrl?: string;
}

export interface Task {
    id: number;
    taskId: string;
    title: string;
    description: string;
    category?: Category;
    assignedTo: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    location: string;
    completionNotes?: string;
    ticketId?: string; // Link to Ticket (Corrective Maintenance)
    // Enhanced fields for Daily Task-Log Sheet Module
    taskType?: 'Daily Checklist' | 'Maintenance' | 'Inspection' | 'Security Check' | 'Cleanup';
    checklistItems?: {
        id: string;
        item: string;
        completed: boolean;
        remarks?: string;
        verifiedBy?: string;
    }[];
    readings?: {
        id: string;
        parameterName: string;
        unit: string;
        value: number;
        normalRange?: string;
        remarks?: string;
    }[];
    startTime?: string;
    endTime?: string;
    completedBy?: string;
    supervisorApproval?: boolean;
    approvedBy?: string;
    photosAttached?: string[]; // URLs to photos
    defectsFound?: string;
    maintenanceRequired?: boolean;
    toolsUsed?: string[];
}

export interface Floor {
    id: string;
    name: string;
    level: number;
    area?: number;
    status?: string;
}

export interface Building {
    id: string;
    name: string;
    floors: Floor[];
    address: string;
    totalArea: number; // sq ft
}

export interface Site {
    id: number;
    name: string;
    region: string;
    city: string;
    buildings: Building[];
    image?: string;
    pmName?: string; // Property Manager Name
}

export interface Vendor {
    id: number;
    vendorId: string;
    name: string;
    serviceCategory: string;
    contactPerson: string;
    email: string;
    phone: string;
    rating: number; // 1-5
    status: 'Active' | 'Inactive';
    contractExpiry: Date;
}

export interface Contract {
    id: number;
    contractId: string;
    title: string;
    vendorName: string;
    vendorId: string;
    type: 'AMC' | 'One-Time' | 'Warranty' | 'Lease';
    startDate: Date;
    endDate: Date;
    value: number;
    status: 'Active' | 'Expired' | 'Renewing';
    documentUrl?: string;
}

export interface InventoryItem {
    id: number;
    itemId: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minLevel: number;
    unitPrice: number;
    location: string;
    lastRestocked: Date;
}

export interface WorkPermit {
    id: number;
    permitId: string;
    type: 'Hot Work' | 'Height Work' | 'Electrical' | 'Confined Space' | 'General' | 'Excavation' | 'Lifting and Hoisting';
    description: string;
    vendor: string;
    location: string;
    startDate: Date;
    endDate: Date;
    status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
    approver: string;
    jsaVerified: boolean; // Job Safety Analysis
    // Enhanced fields from Work Permit Module
    issuer?: string;
    issuedDate?: Date;
    workDescription?: string;
    riskAssessmentDone?: boolean;
    safetyPrecautions?: string;
    contractorName?: string;
    contractorContactNumber?: string;
    supervisorName?: string;
    equipmentUsed?: string;
    gasTestResults?: string;
    isolationDone?: boolean;
    personalProtectiveEquipment?: string[]; // hardhat, gloves, etc.
    medicalEmergencyPlan?: boolean;
    incidentOccurred?: boolean;
    incidentDetails?: string;
}

export interface JSA {
    id: number;
    permitId: number;
    hazards: string; // JSON string
    precautions: string; // JSON string
    ppeRequired: string; // JSON string
}

export interface Incident {
    id: number;
    incidentId: string;
    title: string;
    type: 'Fire' | 'Safety' | 'Security' | 'Technical' | 'Environment';
    severity: 'Critical' | 'Major' | 'Minor';
    location: string;
    reportedBy: string;
    date: Date;
    status: 'Open' | 'Investigating' | 'Closed';
    description: string;
    rca?: string;
}

export interface Audit {
    id: number;
    auditId: string;
    title: string;
    type: 'Safety' | 'Hygiene' | 'Security' | 'Statutory' | 'Process' | 'Internal' | 'External';
    auditor: string;
    scheduledDate: Date;
    status: 'Scheduled' | 'In Progress' | 'Completed';
    score?: number; // 0-100
    findingsCount: number;
    // Enhanced fields from Audit Module
    nonConformanceItems?: {
        id: string;
        description: string;
        severity: 'Critical' | 'Major' | 'Minor';
        correctiveActionRequired: string;
        targetDateForCorrection?: Date;
        status: 'Open' | 'Closed';
    }[];
    auditObservations?: {
        id: string;
        observation: string;
        category: string;
        riskLevel: 'High' | 'Medium' | 'Low';
    }[];
    scope?: string;
    criteria?: string;
    buildingCovered?: string[];
    internalAuditReport?: string;
    neverConformanceLog?: {
        itemId: string;
        description: string;
        detectionDate: Date;
        resolutionDeadline: Date;
        closureDate?: Date;
    }[];
}

export interface ComplianceItem {
    id: number;
    complianceId: string;
    title: string;
    authority: string;
    licenseNumber: string;
    issueDate: Date;
    expiryDate: Date;
    status: 'Compliant' | 'Expiring Soon' | 'Non-Compliant' | 'Expired';
    renewalDate: Date;
    // Enhanced fields from Compliance Module
    complianceType?: 'Legal' | 'Statutory' | 'Insurance' | 'Regulatory' | 'Internal Policy';
    documentUrl?: string;
    responsiblePerson?: string;
    renewalCost?: number;
    renewalVendor?: string;
    daysUntilExpiry?: number;
    criticality?: 'Critical' | 'High' | 'Medium' | 'Low';
    reminderSentDate?: Date;
    approvalRequired?: boolean;
    approvedBy?: string;
    notes?: string;
}

export interface UtilityReading {
    id: number;
    readingId: string;
    utilityType: 'Electricity' | 'Water' | 'Diesel' | 'Gas' | 'Biogas';
    meterId: string;
    readingDate: Date;
    previousReading: number;
    currentReading: number;
    consumption: number;
    unit: string; // kWh, KL, Liters
    tenantName: string;
    // Enhanced fields from Utility Billing Module
    meterLocation?: string;
    meterSerialNumber?: string;
    billingMonth?: string;
    ratePerUnit?: number;
    amount?: number;
    demand?: number; // for electrical
    powerFactor?: number;
    remarks?: string;
    verifiedBy?: string;
    readingTakenBy?: string;
}

export interface UtilityBill {
    id: number;
    billId: string;
    tenantName: string;
    billingMonth: string;
    amount: number;
    status: 'Generated' | 'Sent' | 'Paid' | 'Overdue';
    dueDate: Date;
    utilityType: 'Electricity' | 'Water' | 'CAM' | 'Diesel' | 'Gas';
    // Enhanced fields
    consumption?: number;
    unit?: string;
    rateApplied?: number;
    taxApplicable?: number;
    previousAmount?: number;
    balanceAmount?: number;
    paymentMethod?: string;
    paymentDate?: Date;
    referenceNumber?: string;
    remarks?: string;
}

export interface ESGMetric {
    id: number;
    month: string;
    electricityConsumption: number; // kWh
    waterConsumption: number; // KL
    wasteGenerated: number; // kg
    dieselConsumption: number; // Liters
    carbonFootprint: number; // kgCO2e (Calculated)
}

export interface CSATResponse {
    id: string;
    tenantName?: string;
    tenantPoC?: string;
    building?: string;
    ticketId?: string;
    rating: number; // 1-5
    overallSatisfaction?: number;
    serviceQuality?: number;
    responseTime?: number;
    professionalismScore?: number;
    comments?: string;
    comment?: string;
    date: Date;
    category?: string;
    technicianName?: string;
}

export interface NPSResponse {
    id: string;
    tenantName: string;
    score: number; // 0-10
    feedback?: string;
    date: Date;
}

export interface TransitionSnag {
    id: string;
    description: string;
    status: 'Open' | 'Closed';
    category: string;
}

export interface TransitionProject {
    id: string;
    name: string;
    type: 'Builder-to-FM' | 'FM-to-FM' | 'Tenant Handover';
    status: 'Planning' | 'In Progress' | 'Completed' | 'Delayed';
    progress: number; // 0-100
    startDate: Date;
    targetDate: Date;
    snagsOpen: number;
    snagsClosed: number;
    categories: {
        name: string;
        total: number;
        completed: number;
    }[];
    snagList?: TransitionSnag[];
    // Enhanced fields from Transition Module (HOTO Map)
    fromFacilityManager?: string;
    toFacilityManager?: string;
    projectManager?: string;
    buildingsInvolved?: string[];
    keysMaster?: {
        itemType: string; // e.g., "Office", "Storage", "Server Room"
        location: string;
        receivedBy: string;
        checkedBy: string;
        receivedDate: Date;
    }[];
    assetInventoryCoverage?: number; // percentage
    serviceContractCoverage?: number; // percentage
    documentationCompleteness?: number; // percentage
    readinessCheckPoints?: {
        checkpoint: string;
        status: 'Complete' | 'Pending';
        completedDate?: Date;
    }[];
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    date: Date;
    type: 'Info' | 'Alert' | 'Event' | 'Maintenance';
    priority: 'High' | 'Normal';
}

export interface Message {
    id: number;
    sender: string;
    subject: string;
    content: string;
    date: Date;
    isRead: boolean;
}

export interface Meeting {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    organizer: string;
    attendees: string[];
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    description?: string;
    momPoints?: {
        id: string;
        point: string;
        actionBy: string;
        status: 'Open' | 'Closed';
        dueDate: string;
    }[];
}
