
export interface FrsItem {
    id: string;
    text: string;
    completed: boolean;
    planned?: boolean;
}

export interface FrsModule {
    id: string;
    title: string;
    description: string;
    items: FrsItem[];
}

export interface FrsPhase {
    id: string;
    title: string;
    modules: FrsModule[];
}

export const frsData: FrsPhase[] = [
    {
        id: 'phase1',
        title: 'Phase 1: Core Operations & Foundation',
        modules: [
            {
                id: 'mod2',
                title: 'Module 2: Helpdesk & Ticketing',
                description: 'Manages reactive and proactive complaints with strict SLA tracking.',
                items: [
                    { id: '2.1', text: 'Multi-Channel Ticket Creation (Call, WhatsApp, Email, Portal)', completed: true },
                    { id: '2.2', text: 'Structured Complaint Categorization', completed: true },
                    { id: '2.3', text: 'Enforce Mandatory fields for Ticket Creation', completed: true },
                    { id: '2.4', text: 'SLA & Escalation Management', completed: true },
                    { id: '2.5', text: 'Ticket Status Workflow (Open -> WIP -> Resolved -> Closed)', completed: true },
                    { id: '2.7', text: 'Ticket Dashboard & Analytics', completed: true },
                ],
            },
            {
                id: 'mod3',
                title: 'Module 3: Asset Management (Lifecycle & QR Tracking)',
                description: 'Lifecycle management of physical assets from acquisition to decommissioning.',
                items: [
                    { id: '3.1', text: 'Asset Listing & Multi-Level Filtering', completed: true },
                    { id: '3.2', text: 'Bulk & Manual Asset Data Entry', completed: true },
                    { id: '3.3', text: 'QR Code Generation & Offline Scanning', completed: true },
                    { id: '3.4', text: 'Asset Status Management & Validation', completed: true },
                    { id: '3.6', text: 'Asset Operational Status Dashboard', completed: true },
                ],
            },
            {
                id: 'mod1',
                title: 'Module 1: Site Hierarchy & Master Data',
                description: 'Serves as the master data repository for organizational and property details.',
                items: [
                    { id: '1.1', text: 'Cascading Site Hierarchy Navigation (Region, City, Campus)', completed: true },
                    { id: '1.2', text: 'Comprehensive Site Details Data Entry Form', completed: true },
                    { id: '1.4', text: 'Bulk Upload for Site Data via Excel', completed: true },
                    { id: '1.5', text: 'Multi-filter Site Details Dashboard', completed: true },
                ],
            },
            {
                id: 'mod11',
                title: 'Module 11: Daily Task Management',
                description: 'Assigns daily tasks to technicians and tracks completion with evidence.',
                items: [
                    { id: '11.1', text: 'Daily Task Assignment Form & Notifications', completed: true },
                    { id: '11.2', text: 'Task Execution & Evidence Capture (Mobile/Web)', completed: true },
                    { id: '11.3', text: 'Task Supervisor Approval Workflow', completed: true },
                    { id: '11.4', text: 'Daily Task Dashboard for productivity tracking', completed: true },
                ],
            },
        ],
    },
    {
        id: 'phase2',
        title: 'Phase 2: Proactive & Compliance Management',
        modules: [
            {
                id: 'mod4',
                title: 'Module 4: Maintenance Management (PPM)',
                description: 'Schedules and executes Preventive Maintenance (PPM) with evidence capture.',
                items: [
                    { id: '4.1', text: 'Maintenance Scheduling & Look-Ahead Alerts', completed: true },
                    { id: '4.2', text: 'Offline Checklist Support via Excel Upload', completed: true },
                    { id: '4.3', text: 'Corrective Maintenance Workflow from Breakdown', completed: true },
                    { id: '4.4', text: 'PPM Scheduling & Dashboard', completed: true },
                ],
            },
            {
                id: 'mod5',
                title: 'Module 5: Contract Management',
                description: 'Manages vendor contracts, warranties, and renewal processes.',
                items: [
                    { id: '5.1', text: 'Vendor Master Management', completed: true },
                    { id: '5.2', text: 'Contract Creation & Lifecycle Management', completed: true },
                    { id: '5.3', text: 'Contract Renewal & Proactive Alert Management', completed: true },
                    { id: '5.4', text: 'Asset-Contract Linkage', completed: true },
                ],
            },
             {
                id: 'mod8',
                title: 'Module 8: Work Permit Management',
                description: 'Manages work authorization permits for high-risk activities.',
                items: [
                    { id: '8.1', text: 'Work Permit Creation with Mandatory Fields', completed: true },
                    { id: '8.2', text: 'Multi-level Permit Approval Workflow', completed: true },
                    { id: '8.3', text: 'Permit Execution Tracking', completed: true },
                    { id: '8.5', text: 'Work Permit Dashboard', completed: true },
                ],
            },
            {
                id: 'mod9',
                title: 'Module 9: Audit Management',
                description: 'Tracks compliance audits, licensing, and regulatory requirements.',
                items: [
                    { id: '9.1', text: 'Audit Scheduling & Planning Lifecycle', completed: true },
                    { id: '9.2', text: 'Audit Finding Capture & Classification', completed: true },
                    { id: '9.3', text: 'Remediation Action Assignment and Tracking', completed: true },
                    { id: '9.4', text: 'Audit Reporting & Compliance Dashboard', completed: true },
                ],
            },
             {
                id: 'mod6',
                title: 'Module 6: Asset Verification (Audit & QR Scanning)',
                description: 'Enables auditors to verify physical asset inventory against system records.',
                items: [
                    { id: '6.1', text: 'Audit Planning & Scheduling (Full, Sampling, Spot Check)', completed: true },
                    { id: '6.2', text: 'QR Scanning & Offline Verification', completed: true },
                    { id: '6.3', text: 'Audit Variance Analysis & Remediation Workflow', completed: true },
                    { id: '6.4', text: 'Audit Dashboard & Reporting', completed: true },
                ],
            },
        ],
    },
    {
        id: 'phase3',
        title: 'Phase 3: Tenant & Stakeholder Engagement',
        modules: [
            {
                id: 'mod14',
                title: 'Module 14: Client Connect (Tenant Portal)',
                description: 'Self-service tenant hub for raising tickets, viewing status, and receiving notifications.',
                items: [
                    { id: '14.1', text: 'Tenant Self-Service Ticket Portal', completed: true },
                    { id: '14.2', text: 'Real-Time Ticket Status Tracking with Timeline', completed: true },
                    { id: '14.3', text: 'Announcements & Communications Board', completed: true },
                    { id: '14.5', text: 'Unified Messaging & Communication Inbox', completed: true },
                ],
            },
            {
                id: 'mod12',
                title: 'Module 12: Feedback Management - CSAT',
                description: 'Post-ticket surveys to capture customer satisfaction (CSAT) metrics.',
                items: [
                    { id: '12.1', text: 'CSAT Survey Auto-Trigger & Delivery', completed: true },
                    { id: '12.2', text: 'Capture Structured CSAT Survey Questions', completed: true },
                    { id: '12.3', text: 'CSAT Analytics Dashboard', completed: true },
                ],
            },
            {
                id: 'mod13',
                title: 'Module 13: Feedback Management - NPS',
                description: 'Measures Net Promoter Score (NPS) to track overall facility satisfaction.',
                items: [
                    { id: '13.1', text: 'NPS Survey Campaign Distribution', completed: true },
                    { id: '13.2', text: 'NPS Scoring & Feedback Capture', completed: true },
                    { id: '13.3', text: 'NPS Dashboard & Improvement Tracking', completed: true },
                ],
            },
             {
                id: 'mod7',
                title: 'Module 7: Incident Management',
                description: 'Manages work-related incidents triggered by tickets, breakdowns, or permit violations.',
                items: [
                    { id: '7.1', text: 'Incident Creation & Tracking Across Lifecycle', completed: true },
                    { id: '7.2', text: 'Root Cause Analysis (RCA) & Corrective Actions', completed: true },
                    { id: '7.3', text: 'Incident Dashboard & Compliance Reporting', completed: true },
                ],
            },
        ],
    },
    {
        id: 'phase4',
        title: 'Phase 4: Analytics, Financials & Advanced Ops',
        modules: [
             {
                id: 'mod18',
                title: 'Module 18: Utility Billing',
                description: 'Generates tenant invoices based on consumption data and allocates shared costs.',
                items: [
                    { id: '18.1', text: 'Tenant Billing Calculation (Metered & Allocated)', completed: true },
                    { id: '18.2', text: 'Invoice Generation & Automated Delivery', completed: true },
                    { id: '18.3', text: 'Payment Tracking & Collections Management', completed: true },
                    { id: '18.5', text: 'Billing Dashboard & Financial Reports', completed: true },
                ],
            },
            {
                id: 'mod10',
                title: 'Module 10: Inventory Management',
                description: 'Manages spare parts and consumables with stock level tracking and reorder alerts.',
                items: [
                    { id: '10.1', text: 'Inventory Master Maintenance', completed: true },
                    { id: '10.2', text: 'Stock Level Tracking & Reorder Alerts', completed: true },
                    { id: '10.3', text: 'Inventory Consumption Tracking', completed: true },
                    { id: '10.5', text: 'Inventory Analytics Dashboard', completed: true },
                ],
            },
            {
                id: 'mod16',
                title: 'Module 16: ESG & Sustainability',
                description: 'Tracks sustainability metrics (energy, water, waste) and generates ESG reports.',
                items: [
                    { id: '16.1', text: 'Utility Consumption Tracking', completed: true },
                    { id: '16.2', text: 'Automated Carbon Footprint Calculation', completed: true },
                    { id: '16.3', text: 'ESG Dashboard & Reporting', completed: true },
                    { id: '16.4', text: 'Sustainability Initiatives Tracking & ROI', completed: true },
                ],
            },
             {
                id: 'mod15',
                title: 'Module 15: Compliance Management',
                description: 'Tracks licenses, certifications, and regulatory requirements with renewal alerts.',
                items: [
                    { id: '15.1', text: 'Compliance Requirement Master Checklist', completed: true },
                    { id: '15.2', text: 'License & Certification Tracking with Alerts', completed: true },
                    { id: '15.3', text: 'Compliance Dashboard', completed: true },
                    { id: '15.4', text: 'Evidence Management & Audit Trail', completed: true },
                ],
            },
            {
                id: 'mod17',
                title: 'Module 17: Transition Management (HOTO)',
                description: 'Manages facility handover processes (HOTO) and asset inventory reconciliation.',
                items: [
                    { id: '17.1', text: 'Transition Planning & Workflow Support', completed: true },
                    { id: '17.2', text: 'Asset Inventory Reconciliation during Handover', completed: true },
                    { id: '17.4', text: 'Transition Milestones & Sign-Off Tracking', completed: true },
                ],
            },
        ],
    },
];
