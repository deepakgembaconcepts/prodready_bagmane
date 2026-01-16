/**
 * SLA Matrix Service
 * Implements the exact escalation matrix from the diagram
 * L0-L5 with specific response and resolution times
 */

export interface SLALevel {
  level: string;
  technician: string;
  responseTimeMins: number;
  resolutionTimeMins: number;
}

export interface EscalationRule {
  level: number;
  responseTimeHours: number;
  responseTimeMins: number;
  resolutionTimeHours: number;
  resolutionTimeMins: number;
}

// Fixed SLA Matrix from the diagram
export const SLA_MATRIX: SLALevel[] = [
  {
    level: 'L0',
    technician: 'Assigned L0 Technician',
    responseTimeMins: 30,
    resolutionTimeMins: 1440, // 24 hours
  },
  {
    level: 'L1',
    technician: 'Escalated L1 Technician',
    responseTimeMins: 120, // 2 hours
    resolutionTimeMins: 2880, // 48 hours
  },
  {
    level: 'L2',
    technician: 'Escalated L2 Technician',
    responseTimeMins: 240, // 4 hours
    resolutionTimeMins: 4320, // 72 hours
  },
  {
    level: 'L3',
    technician: 'Escalated L3 Technician',
    responseTimeMins: 720, // 12 hours
    resolutionTimeMins: 5160, // 86 hours
  },
  {
    level: 'L4',
    technician: 'Escalated L4 Technician',
    responseTimeMins: 1800, // 30 hours
    resolutionTimeMins: 6600, // 110 hours
  },
  {
    level: 'L5',
    technician: 'Escalated L5 Technician',
    responseTimeMins: 2160, // 36 hours
    resolutionTimeMins: 8040, // 134 hours
  },
];

/**
 * Get SLA level by index (0-5)
 */
export function getSLALevel(levelIndex: number): SLALevel {
  return SLA_MATRIX[Math.min(Math.max(levelIndex, 0), 5)];
}

/**
 * Get all SLA levels
 */
export function getAllSLALevels(): SLALevel[] {
  return SLA_MATRIX;
}

/**
 * Format minutes to readable time
 */
export function formatTimeFromMins(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  
  if (hours === 0) {
    return `${minutes}min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
}

/**
 * Calculate next escalation level based on resolution time
 * If ticket not resolved in L0 SLA (24hrs), escalate to L1, etc.
 */
export function getNextEscalationLevel(
  currentLevelIndex: number,
  hoursSinceCreation: number
): number {
  // L0 SLA is 24 hours - if exceeded, escalate to L1
  if (currentLevelIndex === 0 && hoursSinceCreation > 24) {
    return 1;
  }
  // Continue escalating if SLA times are exceeded
  if (currentLevelIndex < 5) {
    const currentSLA = getSLALevel(currentLevelIndex);
    const slaHours = currentSLA.resolutionTimeMins / 60;
    if (hoursSinceCreation > slaHours) {
      return currentLevelIndex + 1;
    }
  }
  return currentLevelIndex;
}

/**
 * Get escalation path from creation time
 */
export function getEscalationPath(createdAt: Date): {
  currentLevel: number;
  timeSinceCreation: number;
  escalationHistory: Array<{ level: number; escalatedAt: Date }>;
} {
  const now = new Date();
  const timeDiffMs = now.getTime() - createdAt.getTime();
  const timeSinceCreationHours = timeDiffMs / (1000 * 60 * 60);
  
  let currentLevel = 0;
  const escalationHistory = [];

  // Simulate escalation path
  for (let i = 0; i < 6; i++) {
    const sla = getSLALevel(i);
    const escalationHours = sla.resolutionTimeMins / 60;
    
    if (timeSinceCreationHours > escalationHours) {
      currentLevel = i + 1;
      escalationHistory.push({
        level: i,
        escalatedAt: new Date(createdAt.getTime() + escalationHours * 60 * 60 * 1000),
      });
    } else {
      break;
    }
  }

  return {
    currentLevel: Math.min(currentLevel, 5),
    timeSinceCreation: timeSinceCreationHours,
    escalationHistory,
  };
}

/**
 * Check if ticket SLA is breached
 */
export function isSLABreached(createdAt: Date, status: string, levelIndex: number): boolean {
  if (status === 'Resolved' || status === 'Closed') {
    return false;
  }

  const sla = getSLALevel(levelIndex);
  const now = new Date();
  const timeDiffMs = now.getTime() - createdAt.getTime();
  const timeDiffMins = timeDiffMs / (1000 * 60);

  return timeDiffMins > sla.responseTimeMins;
}

/**
 * Get SLA status color
 */
export function getSLAStatusColor(
  createdAt: Date,
  status: string,
  levelIndex: number
): 'green' | 'yellow' | 'red' {
  if (status === 'Resolved' || status === 'Closed') {
    return 'green';
  }

  const sla = getSLALevel(levelIndex);
  const now = new Date();
  const timeDiffMs = now.getTime() - createdAt.getTime();
  const timeDiffMins = timeDiffMs / (1000 * 60);
  const responseTimeMins = sla.responseTimeMins;

  if (timeDiffMins > responseTimeMins) {
    return 'red'; // SLA breached
  }
  if (timeDiffMins > responseTimeMins * 0.8) {
    return 'yellow'; // Warning
  }
  return 'green'; // On track
}
