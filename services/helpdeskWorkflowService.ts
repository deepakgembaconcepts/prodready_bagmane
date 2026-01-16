/**
 * Helpdesk Ticket Workflow Service
 * Enforces: Open → WIP → Resolved status flow
 * Manual priority setting (P1-P4)
 * Escalation logic: L0 → L1 → L2 based on time
 */

export interface TicketWorkflow {
  ticketId: string;
  currentStatus: 'Open' | 'WIP' | 'Resolved';
  canTransitionTo: ('WIP' | 'Resolved')[];
  statusHistory: {
    status: 'Open' | 'WIP' | 'Resolved';
    timestamp: Date;
    changedBy: string;
    reason?: string;
  }[];
}

export interface EscalationTimingConfig {
  level: 'L0' | 'L1' | 'L2';
  escalateAfterMinutes: number; // 0=L0, 240=4h for L0→L1, 480=8h for L1→L2, etc.
  maxResolutionMinutes: number;
}

export interface HelpdeskTicketEnhanced {
  ticketId: string;
  status: 'Open' | 'WIP' | 'Resolved';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low'; // Manually set
  currentAssignmentLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  assignedTechnician: string;
  createdAt: Date;
  openedAt?: Date;
  wipStartedAt?: Date;
  resolvedAt?: Date;
  nextEscalationTime?: Date;
  priorityManuallySet: boolean;
  prioritySetBy?: string;
  prioritySetAt?: Date;
  escalationChain: EscalationEntry[];
}

export interface EscalationEntry {
  level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  assignee: string;
  assignedAt: Date;
  escalatedAt?: Date; // When moved to next level
  responseTimeMinutes?: number;
  resolutionTimeMinutes?: number;
}

/**
 * Helpdesk Ticket Workflow Service
 */
export class HelpdeskWorkflowService {
  /**
   * Validate transition from current status to new status
   * Enforces: Open → WIP → Resolved (no direct Open → Resolved)
   */
  static isValidTransition(fromStatus: 'Open' | 'WIP' | 'Resolved', toStatus: 'Open' | 'WIP' | 'Resolved'): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'Open': ['WIP'],
      'WIP': ['Resolved'],
      'Resolved': [], // No transition from Resolved
    };

    return validTransitions[fromStatus]?.includes(toStatus) ?? false;
  }

  /**
   * Get allowed transitions for current status
   */
  static getAllowedTransitions(currentStatus: 'Open' | 'WIP' | 'Resolved'): ('Open' | 'WIP' | 'Resolved')[] {
    const transitions: { [key: string]: ('Open' | 'WIP' | 'Resolved')[] } = {
      'Open': ['WIP'],
      'WIP': ['Resolved'],
      'Resolved': [],
    };
    return transitions[currentStatus] ?? [];
  }

  /**
   * Attempt to transition ticket status
   * Throws error if transition is invalid
   */
  static async transitionTicket(
    ticketId: string,
    toStatus: 'Open' | 'WIP' | 'Resolved',
    changedBy: string,
    reason?: string
  ): Promise<TicketWorkflow> {
    const response = await fetch(`/api/helpdesk/tickets/${ticketId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toStatus,
        changedBy,
        reason,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid status transition');
    }

    return response.json();
  }

  /**
   * Set ticket priority manually (P1-P4)
   * Admin must explicitly select priority
   */
  static async setPriority(
    ticketId: string,
    priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low',
    setBy: string,
    justification?: string
  ): Promise<HelpdeskTicketEnhanced> {
    const response = await fetch(`/api/helpdesk/tickets/${ticketId}/priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priority,
        setBy,
        justification,
      }),
    });

    if (!response.ok) throw new Error('Failed to set ticket priority');
    return response.json();
  }

  /**
   * Get ticket with full workflow history
   */
  static async getTicketWorkflow(ticketId: string): Promise<HelpdeskTicketEnhanced> {
    const response = await fetch(`/api/helpdesk/tickets/${ticketId}/workflow`);
    if (!response.ok) throw new Error('Failed to fetch ticket workflow');
    return response.json();
  }

  /**
   * Get all tickets by status
   */
  static async getTicketsByStatus(status: 'Open' | 'WIP' | 'Resolved'): Promise<HelpdeskTicketEnhanced[]> {
    const response = await fetch(`/api/helpdesk/tickets?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
  }
}

/**
 * Escalation Service - Auto-escalate based on time thresholds
 * L0: 0-4h
 * L1: 4h-8h
 * L2: 8h-16h
 */
export class EscalationAutomationService {
  private static ESCALATION_CONFIG: EscalationTimingConfig[] = [
    { level: 'L0', escalateAfterMinutes: 0, maxResolutionMinutes: 240 }, // 4 hours
    { level: 'L1', escalateAfterMinutes: 240, maxResolutionMinutes: 480 }, // +4 hours (8h total)
    { level: 'L2', escalateAfterMinutes: 480, maxResolutionMinutes: 960 }, // +8 hours (16h total)
  ];

  /**
   * Calculate next escalation time based on creation time and priority
   */
  static calculateNextEscalation(ticketCreatedAt: Date, priority: string, currentLevel: 'L0' | 'L1' | 'L2' = 'L0'): Date | null {
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    const config = this.ESCALATION_CONFIG.find(c => c.level === currentLevel);

    if (!config) return null;

    const escalationMinutes = config.escalateAfterMinutes / priorityMultiplier;
    return new Date(ticketCreatedAt.getTime() + escalationMinutes * 60 * 1000);
  }

  /**
   * Get priority multiplier (higher priority = faster escalation)
   * P1: 0.5x (faster)
   * P2: 1x (normal)
   * P3: 1.5x (slower)
   * P4: 2x (slowest)
   */
  private static getPriorityMultiplier(priority: string): number {
    const multipliers: { [key: string]: number } = {
      'P1 - Critical': 0.5,
      'P2 - High': 1,
      'P3 - Medium': 1.5,
      'P4 - Low': 2,
    };
    return multipliers[priority] ?? 1;
  }

  /**
   * Check if ticket should be escalated now
   */
  static shouldEscalate(ticket: HelpdeskTicketEnhanced): boolean {
    if (!ticket.nextEscalationTime) return false;
    return new Date() >= ticket.nextEscalationTime;
  }

  /**
   * Auto-escalate ticket to next level
   */
  static async escalateTicket(
    ticketId: string,
    fromLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4',
    toLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5',
    reason: string
  ): Promise<HelpdeskTicketEnhanced> {
    const response = await fetch(`/api/helpdesk/tickets/${ticketId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromLevel,
        toLevel,
        reason,
        escalatedBy: 'System Auto-Escalation',
      }),
    });

    if (!response.ok) throw new Error('Failed to escalate ticket');
    return response.json();
  }

  /**
   * Get all tickets due for escalation
   */
  static async getTicketsDueForEscalation(): Promise<HelpdeskTicketEnhanced[]> {
    const response = await fetch('/api/helpdesk/tickets/escalation/due');
    if (!response.ok) throw new Error('Failed to fetch escalation-due tickets');
    return response.json();
  }

  /**
   * Process all pending escalations (run periodically)
   */
  static async processPendingEscalations(): Promise<{ escalated: number; errors: number }> {
    const response = await fetch('/api/helpdesk/escalations/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to process escalations');
    return response.json();
  }

  /**
   * Get escalation chain for ticket
   */
  static async getEscalationChain(ticketId: string): Promise<EscalationEntry[]> {
    const response = await fetch(`/api/helpdesk/tickets/${ticketId}/escalation-chain`);
    if (!response.ok) throw new Error('Failed to fetch escalation chain');
    return response.json();
  }
}
