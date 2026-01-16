/**
 * Escalation Mapping Service
 * Handles parsing and querying escalation rules from CSV data
 */

export interface EscalationMapping {
  ticketType: string;
  issueType: string;
  category: string;
  subCategory: string;
  issue: string;
  priority: string;
  l0ResponseTime: number;      // in minutes
  l0ResolutionTime: number;    // in minutes
  l0Assignee: string;
  l1ResponseTime: number;
  l1ResolutionTime: number;
  l1Assignee: string;
  l2ResponseTime: number;
  l2ResolutionTime: number;
  l2Assignee: string;
  l3ResponseTime: number;
  l3ResolutionTime: number;
  l3Assignee: string;
  l4ResponseTime: number;
  l4ResolutionTime: number;
  l4Assignee: string;
  l5ResponseTime: number;
  l5ResolutionTime: number;
  l5Assignee: string;
  status: string;
  clientEscalation: boolean;
  tenantEscalation: boolean;
}

export interface EscalationLevel {
  level: string;
  responseTime: number;
  resolutionTime: number;
  assignee: string;
}

// Load escalation rules from JSON (populated from CSV)
let escalationRules: EscalationMapping[] = [];

// Initialize with loaded rules
export const initializeEscalationRules = (rules: EscalationMapping[]) => {
  escalationRules = rules;
};

// Get all unique values for dropdowns
export const getTicketTypes = (): string[] => {
  return [...new Set(escalationRules.map(r => r.ticketType))].sort();
};

export const getIssueTypes = (ticketType?: string): string[] => {
  const filtered = ticketType 
    ? escalationRules.filter(r => r.ticketType === ticketType)
    : escalationRules;
  return [...new Set(filtered.map(r => r.issueType))].sort();
};

export const getCategories = (ticketType?: string, issueType?: string): string[] => {
  let filtered = escalationRules;
  
  if (ticketType) {
    filtered = filtered.filter(r => r.ticketType === ticketType);
  }
  if (issueType) {
    filtered = filtered.filter(r => r.issueType === issueType);
  }
  
  return [...new Set(filtered.map(r => r.category))].sort();
};

export const getSubCategories = (
  ticketType?: string,
  issueType?: string,
  category?: string
): string[] => {
  let filtered = escalationRules;
  
  if (ticketType) filtered = filtered.filter(r => r.ticketType === ticketType);
  if (issueType) filtered = filtered.filter(r => r.issueType === issueType);
  if (category) filtered = filtered.filter(r => r.category === category);
  
  return [...new Set(filtered.map(r => r.subCategory))].sort();
};

export const getIssues = (
  ticketType?: string,
  issueType?: string,
  category?: string,
  subCategory?: string
): string[] => {
  let filtered = escalationRules;
  
  if (ticketType) filtered = filtered.filter(r => r.ticketType === ticketType);
  if (issueType) filtered = filtered.filter(r => r.issueType === issueType);
  if (category) filtered = filtered.filter(r => r.category === category);
  if (subCategory) filtered = filtered.filter(r => r.subCategory === subCategory);
  
  return [...new Set(filtered.map(r => r.issue))].sort();
};

export const getPriorities = (
  ticketType?: string,
  issueType?: string,
  category?: string,
  subCategory?: string,
  issue?: string
): string[] => {
  let filtered = escalationRules;
  
  if (ticketType) filtered = filtered.filter(r => r.ticketType === ticketType);
  if (issueType) filtered = filtered.filter(r => r.issueType === issueType);
  if (category) filtered = filtered.filter(r => r.category === category);
  if (subCategory) filtered = filtered.filter(r => r.subCategory === subCategory);
  if (issue) filtered = filtered.filter(r => r.issue === issue);
  
  return [...new Set(filtered.map(r => r.priority))].sort();
};

/**
 * Find escalation mapping for a ticket
 */
export const findEscalationMapping = (
  ticketType: string,
  issueType: string,
  category: string,
  subCategory: string,
  issue: string,
  priority: string
): EscalationMapping | null => {
  return escalationRules.find(r =>
    r.ticketType === ticketType &&
    r.issueType === issueType &&
    r.category === category &&
    r.subCategory === subCategory &&
    r.issue === issue &&
    r.priority === priority
  ) || null;
};

/**
 * Get SLA times for a specific escalation level
 */
export const getSLAForLevel = (
  mapping: EscalationMapping,
  level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
): EscalationLevel => {
  const levelMap: Record<string, keyof EscalationMapping> = {
    'L0': 'l0ResponseTime',
    'L1': 'l1ResponseTime',
    'L2': 'l2ResponseTime',
    'L3': 'l3ResponseTime',
    'L4': 'l4ResponseTime',
    'L5': 'l5ResponseTime',
  };

  const resolutionMap: Record<string, keyof EscalationMapping> = {
    'L0': 'l0ResolutionTime',
    'L1': 'l1ResolutionTime',
    'L2': 'l2ResolutionTime',
    'L3': 'l3ResolutionTime',
    'L4': 'l4ResolutionTime',
    'L5': 'l5ResolutionTime',
  };

  const assigneeMap: Record<string, keyof EscalationMapping> = {
    'L0': 'l0Assignee',
    'L1': 'l1Assignee',
    'L2': 'l2Assignee',
    'L3': 'l3Assignee',
    'L4': 'l4Assignee',
    'L5': 'l5Assignee',
  };

  return {
    level,
    responseTime: (mapping[levelMap[level]] as number) || 0,
    resolutionTime: (mapping[resolutionMap[level]] as number) || 0,
    assignee: (mapping[assigneeMap[level]] as string) || '',
  };
};

/**
 * Get all escalation levels for a mapping
 */
export const getEscalationPath = (mapping: EscalationMapping): EscalationLevel[] => {
  return ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'].map(level =>
    getSLAForLevel(mapping, level as 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5')
  );
};

/**
 * Format time in minutes to human-readable format
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Get escalation statistics
 */
export const getEscalationStats = () => {
  return {
    totalMappings: escalationRules.length,
    uniqueTicketTypes: [...new Set(escalationRules.map(r => r.ticketType))].length,
    uniqueIssueTypes: [...new Set(escalationRules.map(r => r.issueType))].length,
    uniqueCategories: [...new Set(escalationRules.map(r => r.category))].length,
    uniqueSubCategories: [...new Set(escalationRules.map(r => r.subCategory))].length,
    uniqueIssues: [...new Set(escalationRules.map(r => r.issue))].length,
    priorities: [...new Set(escalationRules.map(r => r.priority))].sort(),
  };
};

/**
 * Get rules by ticket type for dashboard
 */
export const getRulesByTicketType = (ticketType: string): EscalationMapping[] => {
  return escalationRules.filter(r => r.ticketType === ticketType);
};

/**
 * Get rules by priority
 */
export const getRulesByPriority = (priority: string): EscalationMapping[] => {
  return escalationRules.filter(r => r.priority === priority);
};

/**
 * Search escalation rules
 */
export const searchEscalationRules = (query: string): EscalationMapping[] => {
  const lowerQuery = query.toLowerCase();
  return escalationRules.filter(r =>
    r.ticketType.toLowerCase().includes(lowerQuery) ||
    r.issueType.toLowerCase().includes(lowerQuery) ||
    r.category.toLowerCase().includes(lowerQuery) ||
    r.subCategory.toLowerCase().includes(lowerQuery) ||
    r.issue.toLowerCase().includes(lowerQuery) ||
    r.priority.toLowerCase().includes(lowerQuery)
  );
};
