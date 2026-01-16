// Index file for all application services
// Centralized export point for all services and utilities

export * from './geminiService';
export * from './escalationService';
export * from './dailyTaskService';
export * from './auditService';
export * from './workPermitService';
export * from './complianceService';
export * from './feedbackService';
export * from './helpdeskWorkflowService';
export * from './contractVendorService';
export * from './workPermitJSAService';
export * from './dailyTaskUtilityService';
export * from './inventoryAssetService';

// Type exports
export type { EscalationRule } from './escalationService';
export type { ChecklistTemplate, DailyLogEntry } from './dailyTaskService';
export type { 
    AuditPlan, 
    AuditSchedule, 
    NonConformance, 
    AuditObservation,
    InternalAuditReport,
    AuditObservationTracker
} from './auditService';
export type {
    JSA,
    PermitAuditRecord,
    WorkPermitIssuer,
    WorkPermitAuthorizer,
    WorkPermitActivity,
    PermitTracker,
    LockOutTagOut
} from './workPermitService';
export type {
    ComplianceCategory,
    MaintenanceSchedule,
    MaintenanceRecord,
    MaintenanceChecklist,
    PPMContract,
    ComplianceCheckpoint
} from './complianceService';
export type {
    CSATSurvey,
    CSATResponse,
    NPSSurvey,
    NPSResponse,
    FeedbackDashboardMetrics
} from './feedbackService';
export type {
    TicketWorkflow,
    EscalationTimingConfig,
    HelpdeskTicketEnhanced,
    EscalationEntry
} from './helpdeskWorkflowService';
export type {
    ContractEnhanced,
    RenewalRecord,
    VendorMaster,
    ContractDashboardMetrics
} from './contractVendorService';
export type {
    JSAForm,
    HazardEntry,
    RiskAssessmentEntry,
    ControlMeasure,
    WorkPermitMerged,
    PermitExtension,
    EmergencyContact,
    WorkPermitDashboardMetrics
} from './workPermitJSAService';
export type {
    DailyTask,
    ChecklistItem,
    TaskReading,
    TaskApprovalFlow,
    UtilityBillingSetup,
    TenantUtilityShare,
    UtilityBillingDashboard,
    TaskDepartment
} from './dailyTaskUtilityService';
export type {
    StockTransferRequest,
    TransferItem,
    AssetWithQRCode,
    OperationalAgeDashboard,
    AssetDashboard
} from './inventoryAssetService';
