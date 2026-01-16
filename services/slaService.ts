/**
 * SLA Service - Dynamic calculation based on escalation rules
 * This service provides SLA information by matching ticket characteristics
 * to escalation rules, ensuring consistency between SLA times and escalation workflows
 */

import { ESCALATION_RULES, type EscalationRule } from './escalationService';
import type { Ticket } from '../types';

/**
 * Fallback SLA hours configuration for basic priority-based calculation
 * Used when escalation rules don't match
 */
export const DEFAULT_SLA_HOURS: Record<string, number> = {
  'P1': 4,
  'P2': 8,
  'P3': 24,
  'P4': 48,
};

/**
 * SLA Configuration per escalation level
 */
export interface SLAConfig {
  level: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  assignee: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
}

/**
 * Find escalation rule matching ticket characteristics
 */
export const findEscalationRule = (ticket: Ticket): EscalationRule | null => {
  if (!ESCALATION_RULES || ESCALATION_RULES.length === 0) {
    return null;
  }

  // Try exact match on all characteristics
  let rule = ESCALATION_RULES.find(r =>
    r.ticketType === ticket.ticketType &&
    r.issueType === ticket.issueType &&
    r.category === ticket.category &&
    r.subCategory === ticket.subcategory &&
    r.issue === ticket.description &&
    r.priority === ticket.priority &&
    r.status === 'ACTIVE'
  );

  // Fall back to match on priority, category, and issue
  if (!rule) {
    rule = ESCALATION_RULES.find(r =>
      r.category === ticket.category &&
      r.priority === ticket.priority &&
      r.status === 'ACTIVE'
    );
  }

  // Final fallback: match on priority and ticket type
  if (!rule) {
    rule = ESCALATION_RULES.find(r =>
      r.ticketType === ticket.ticketType &&
      r.priority === ticket.priority &&
      r.status === 'ACTIVE'
    );
  }

  return rule || null;
};

/**
 * Get SLA configuration for a specific escalation level
 */
export const getSLAForLevel = (rule: EscalationRule, level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5'): SLAConfig => {
  const levelNum = parseInt(level.replace('L', ''));
  
  switch (levelNum) {
    case 0:
      return {
        level: 'L0',
        responseTimeMinutes: rule.l0ResponseTime,
        resolutionTimeMinutes: rule.l0ResolutionTime,
        assignee: rule.l0Assignee,
        responseTimeHours: Math.round(rule.l0ResponseTime / 60 * 10) / 10,
        resolutionTimeHours: Math.round(rule.l0ResolutionTime / 60 * 10) / 10,
      };
    case 1:
      return {
        level: 'L1',
        responseTimeMinutes: rule.l1ResponseTime,
        resolutionTimeMinutes: rule.l1ResolutionTime,
        assignee: rule.l1Assignee,
        responseTimeHours: Math.round(rule.l1ResponseTime / 60 * 10) / 10,
        resolutionTimeHours: Math.round(rule.l1ResolutionTime / 60 * 10) / 10,
      };
    case 2:
      return {
        level: 'L2',
        responseTimeMinutes: rule.l2ResponseTime,
        resolutionTimeMinutes: rule.l2ResolutionTime,
        assignee: rule.l2Assignee,
        responseTimeHours: Math.round(rule.l2ResponseTime / 60 * 10) / 10,
        resolutionTimeHours: Math.round(rule.l2ResolutionTime / 60 * 10) / 10,
      };
    case 3:
      return {
        level: 'L3',
        responseTimeMinutes: rule.l3ResponseTime,
        resolutionTimeMinutes: rule.l3ResolutionTime,
        assignee: rule.l3Assignee,
        responseTimeHours: Math.round(rule.l3ResponseTime / 60 * 10) / 10,
        resolutionTimeHours: Math.round(rule.l3ResolutionTime / 60 * 10) / 10,
      };
    case 4:
      return {
        level: 'L4',
        responseTimeMinutes: rule.l4ResponseTime,
        resolutionTimeMinutes: rule.l4ResolutionTime,
        assignee: rule.l4Assignee,
        responseTimeHours: Math.round(rule.l4ResponseTime / 60 * 10) / 10,
        resolutionTimeHours: Math.round(rule.l4ResolutionTime / 60 * 10) / 10,
      };
    case 5:
      return {
        level: 'L5',
        responseTimeMinutes: rule.l5ResponseTime,
        resolutionTimeMinutes: rule.l5ResolutionTime,
        assignee: rule.l5Assignee,
        responseTimeHours: Math.round(rule.l5ResponseTime / 60 * 10) / 10,
        resolutionTimeHours: Math.round(rule.l5ResolutionTime / 60 * 10) / 10,
      };
    default:
      return {
        level,
        responseTimeMinutes: 0,
        resolutionTimeMinutes: 0,
        assignee: 'Unassigned',
        responseTimeHours: 0,
        resolutionTimeHours: 0,
      };
  }
};

/**
 * Get SLA configuration for a ticket
 * Uses escalation rules if available, falls back to priority-based configuration
 */
export const getSLAForTicket = (ticket: Ticket): SLAConfig | null => {
  const rule = findEscalationRule(ticket);
  if (!rule) {
    return null;
  }
  return getSLAForLevel(rule, ticket.assignedLevel as 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5');
};

/**
 * Check if ticket SLA is breached
 */
export const isSLABreached = (ticket: Ticket): boolean => {
  if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
    return false;
  }

  const sla = getSLAForTicket(ticket);
  if (!sla) {
    // Fall back to hardcoded priority-based SLA
    const priorityHours = DEFAULT_SLA_HOURS[ticket.priority] || 48;
    const elapsed = (new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    return elapsed > priorityHours;
  }

  // Check against escalation rule resolution time
  const elapsedMinutes = (new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60);
  return elapsedMinutes > sla.resolutionTimeMinutes;
};

/**
 * Calculate SLA status for dashboard display
 */
export interface SLAStatus {
  breached: boolean;
  remainingMinutes: number;
  remainingHours: number;
  resolutionTimeHours: number;
  percentageUsed: number;
  status: 'On Track' | 'Warning' | 'Critical';
}

export const calculateSLAStatus = (ticket: Ticket): SLAStatus => {
  const now = new Date();
  const elapsedMinutes = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60);

  const sla = getSLAForTicket(ticket);
  const slaMinutes = sla?.resolutionTimeMinutes || (DEFAULT_SLA_HOURS[ticket.priority] || 48) * 60;
  
  const remainingMinutes = slaMinutes - elapsedMinutes;
  const remainingHours = Math.max(0, Math.round(remainingMinutes / 60 * 10) / 10);
  const resolutionTimeHours = Math.round(slaMinutes / 60 * 10) / 10;
  const percentageUsed = Math.min(100, Math.round((elapsedMinutes / slaMinutes) * 100));

  let status: 'On Track' | 'Warning' | 'Critical' = 'On Track';
  if (remainingMinutes <= 0) {
    status = 'Critical';
  } else if (percentageUsed >= 75) {
    status = 'Warning';
  }

  return {
    breached: remainingMinutes <= 0,
    remainingMinutes: Math.max(0, remainingMinutes),
    remainingHours,
    resolutionTimeHours,
    percentageUsed,
    status,
  };
};

/**
 * Get next escalation level based on current level
 */
export const getNextEscalationLevel = (currentLevel: string): string => {
  const levelMap: Record<string, string> = {
    'L0': 'L1',
    'L1': 'L2',
    'L2': 'L3',
    'L3': 'L4',
    'L4': 'L5',
    'L5': 'L5', // Max level
  };
  return levelMap[currentLevel] || 'L5';
};

/**
 * Check if a ticket should auto-escalate based on response time
 */
export const shouldAutoEscalate = (ticket: Ticket): boolean => {
  const sla = getSLAForTicket(ticket);
  if (!sla) {
    return false;
  }

  const elapsedMinutes = (new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60);
  return elapsedMinutes > sla.responseTimeMinutes;
};

/**
 * Get all possible escalation levels for a ticket with their SLAs
 */
export const getEscalationPath = (ticket: Ticket): SLAConfig[] => {
  const rule = findEscalationRule(ticket);
  if (!rule) {
    return [];
  }

  const levels: (typeof ticket.assignedLevel)[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
  return levels
    .map(level => getSLAForLevel(rule, level as any))
    .filter(sla => sla.resolutionTimeMinutes > 0);
};
