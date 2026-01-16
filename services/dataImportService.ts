/**
 * Data Import Service
 * Handles importing escalation rules, checklists, and other structured data
 * from CSV and Excel files in the "Fields needed in each Module" folders
 */

import type { Ticket } from '../types';

export interface EscalationRuleImport {
  ticketType: string;
  issueType: string;
  category: string;
  subCategory: string;
  issue: string;
  priority: string;
  l0ResponseTime: number;
  l0ResolutionTime: number;
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

export interface ChecklistTemplate {
  id: string;
  name: string;
  category: string;
  items: ChecklistItem[];
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
  source: string;
}

export interface ChecklistItem {
  id: string;
  number: number;
  description: string;
  parameterType: string;
  normalRange?: string;
  unit?: string;
  criticality: 'Critical' | 'Major' | 'Minor';
  instructions?: string;
}

/**
 * Parse CSV string into array of objects
 * Handles the escalation list CSV format
 */
export const parseEscalationCSV = (csvContent: string): EscalationRuleImport[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rules: EscalationRuleImport[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length < headers.length) continue;

    const rule: EscalationRuleImport = {
      ticketType: values[0] || '',
      issueType: values[1] || '',
      category: values[2] || '',
      subCategory: values[3] || '',
      issue: values[4] || '',
      priority: values[5] || '',
      l0ResponseTime: parseInt(values[6]) || 0,
      l0ResolutionTime: parseInt(values[7]) || 0,
      l0Assignee: values[8] || '',
      l1ResponseTime: parseInt(values[9]) || 0,
      l1ResolutionTime: parseInt(values[10]) || 0,
      l1Assignee: values[11] || '',
      l2ResponseTime: parseInt(values[12]) || 0,
      l2ResolutionTime: parseInt(values[13]) || 0,
      l2Assignee: values[14] || '',
      l3ResponseTime: parseInt(values[15]) || 0,
      l3ResolutionTime: parseInt(values[16]) || 0,
      l3Assignee: values[17] || '',
      l4ResponseTime: parseInt(values[18]) || 0,
      l4ResolutionTime: parseInt(values[19]) || 0,
      l4Assignee: values[20] || '',
      l5ResponseTime: parseInt(values[21]) || 0,
      l5ResolutionTime: parseInt(values[22]) || 0,
      l5Assignee: values[23] || '',
      status: values[24] || 'ACTIVE',
      clientEscalation: values[25]?.toLowerCase() === 'true',
      tenantEscalation: values[26]?.toLowerCase() === 'true',
    };

    rules.push(rule);
  }

  return rules;
};

/**
 * Sample data for checklists extracted from the specification documents
 * These represent the templates from Security Checklist, Technical Daily Task, etc.
 */
export const SECURITY_PATROL_CHECKLIST: ChecklistTemplate = {
  id: 'SEC-001',
  name: 'Security Patrol Checklist',
  category: 'Security',
  frequency: 'Daily',
  source: 'Security Checklist Module',
  items: [
    {
      id: 'sec-001',
      number: 1,
      description: 'Perimeter fence inspection for damage or breaches',
      parameterType: 'Visual Inspection',
      criticality: 'Critical',
      instructions: 'Walk entire perimeter, check for holes, damage, or suspicious activity',
    },
    {
      id: 'sec-002',
      number: 2,
      description: 'Main gate locks and access control verification',
      parameterType: 'Functional Test',
      criticality: 'Critical',
      instructions: 'Test locks on all gates, verify access card system functional',
    },
    {
      id: 'sec-003',
      number: 3,
      description: 'CCTV cameras operational status check',
      parameterType: 'Functional Test',
      criticality: 'Critical',
      instructions: 'Check all camera feeds, verify recording is active',
    },
    {
      id: 'sec-004',
      number: 4,
      description: 'Security cabin and guard room inspection',
      parameterType: 'Visual Inspection',
      criticality: 'Major',
      instructions: 'Check cleanliness, supplies, incident log up to date',
    },
    {
      id: 'sec-005',
      number: 5,
      description: 'Visitor log review and sign-in verification',
      parameterType: 'Document Review',
      criticality: 'Major',
      instructions: 'Review all visitor entries, verify authorization and exit logs',
    },
  ],
};

export const HVAC_DAILY_CHECKLIST: ChecklistTemplate = {
  id: 'HVAC-001',
  name: 'HVAC Daily Monitoring',
  category: 'Maintenance',
  frequency: 'Daily',
  source: 'Technical Daily Task Module',
  items: [
    {
      id: 'hvac-001',
      number: 1,
      description: 'AHU Filter pressure drop reading',
      parameterType: 'Pressure Reading',
      unit: 'mmWC',
      normalRange: '0-100',
      criticality: 'Critical',
      instructions: 'Record filter pressure drop, replace if >150 mmWC',
    },
    {
      id: 'hvac-002',
      number: 2,
      description: 'Chiller inlet/outlet temperature',
      parameterType: 'Temperature Reading',
      unit: '°C',
      normalRange: '6-8',
      criticality: 'Critical',
      instructions: 'Record inlet and outlet temps, alert if variation >2°C',
    },
    {
      id: 'hvac-003',
      number: 3,
      description: 'Compressor vibration and noise check',
      parameterType: 'Vibration Check',
      criticality: 'Major',
      instructions: 'Listen for abnormal sounds, check mounting bolts tight',
    },
    {
      id: 'hvac-004',
      number: 4,
      description: 'Refrigerant pressure verification',
      parameterType: 'Pressure Reading',
      unit: 'PSI',
      normalRange: '200-350',
      criticality: 'Critical',
      instructions: 'Check high and low side pressures, log values',
    },
  ],
};

export const FIRE_SAFETY_CHECKLIST: ChecklistTemplate = {
  id: 'FIRE-001',
  name: 'Fire Safety Daily Checklist',
  category: 'Safety',
  frequency: 'Daily',
  source: 'Fire & Safety Daily Task Module',
  items: [
    {
      id: 'fire-001',
      number: 1,
      description: 'Fire extinguisher visual inspection and pressure gauge check',
      parameterType: 'Visual Inspection',
      criticality: 'Critical',
      instructions: 'Check all extinguishers, verify green zone on pressure gauge',
    },
    {
      id: 'fire-002',
      number: 2,
      description: 'Fire alarm panel status and light indicators',
      parameterType: 'Functional Test',
      criticality: 'Critical',
      instructions: 'Verify all lights green, check battery backup operational',
    },
    {
      id: 'fire-003',
      number: 3,
      description: 'Emergency exit routes clear and accessible',
      parameterType: 'Visual Inspection',
      criticality: 'Critical',
      instructions: 'Walk all escape routes, ensure no obstructions or locked exits',
    },
    {
      id: 'fire-004',
      number: 4,
      description: 'Fire hydrant and hose station accessibility',
      parameterType: 'Visual Inspection',
      criticality: 'Major',
      instructions: 'Check hydrants clear, test hose connections for leaks',
    },
    {
      id: 'fire-005',
      number: 5,
      description: 'Sprinkler system heads clear and functional',
      parameterType: 'Visual Inspection',
      criticality: 'Major',
      instructions: 'Check heads not blocked, verify water supply pressure',
    },
  ],
};

export const ELECTRICAL_CHECKLIST: ChecklistTemplate = {
  id: 'ELEC-001',
  name: 'Electrical Daily Checklist',
  category: 'Maintenance',
  frequency: 'Daily',
  source: 'Technical Daily Task Module - Electrical',
  items: [
    {
      id: 'elec-001',
      number: 1,
      description: 'Main switchboard temperature and cooling fan operation',
      parameterType: 'Temperature Reading',
      unit: '°C',
      normalRange: '<50',
      criticality: 'Critical',
      instructions: 'Check surface temperature, ensure cooling fan running',
    },
    {
      id: 'elec-002',
      number: 2,
      description: 'Generator fuel level and battery condition',
      parameterType: 'Level Check',
      unit: '%',
      normalRange: '>75',
      criticality: 'Critical',
      instructions: 'Check fuel, test battery under load, log readings',
    },
    {
      id: 'elec-003',
      number: 3,
      description: 'UPS battery health status and load percentage',
      parameterType: 'Functional Test',
      unit: '%',
      normalRange: '0-75',
      criticality: 'Critical',
      instructions: 'Check health percentage, verify load balanced across units',
    },
    {
      id: 'elec-004',
      number: 4,
      description: 'DB panel earth leakage breaker trip test',
      parameterType: 'Functional Test',
      criticality: 'Major',
      instructions: 'Press test button on every ELCB, should trip and reset',
    },
  ],
};

export const WATER_SYSTEM_CHECKLIST: ChecklistTemplate = {
  id: 'WATER-001',
  name: 'Water System Daily Checklist',
  category: 'Maintenance',
  frequency: 'Daily',
  source: 'Technical Daily Task Module - WTP & STP',
  items: [
    {
      id: 'water-001',
      number: 1,
      description: 'Overhead tank water level and clarity',
      parameterType: 'Level Reading',
      unit: 'Cubic meters',
      normalRange: '80-100%',
      criticality: 'Critical',
      instructions: 'Check tank level, verify water clarity and color',
    },
    {
      id: 'water-002',
      number: 2,
      description: 'Water supply pump pressure and flow rate',
      parameterType: 'Pressure Reading',
      unit: 'Bar',
      normalRange: '2-4',
      criticality: 'Critical',
      instructions: 'Record pressure and flow, check for leaks',
    },
    {
      id: 'water-003',
      number: 3,
      description: 'RO plant TDS inlet and outlet readings',
      parameterType: 'Quality Measurement',
      unit: 'PPM',
      normalRange: '100-150 outlet',
      criticality: 'Major',
      instructions: 'Record TDS values, replace filters if outlet >200',
    },
    {
      id: 'water-004',
      number: 4,
      description: 'STP effluent treatment process monitoring',
      parameterType: 'Process Monitoring',
      criticality: 'Critical',
      instructions: 'Check aeration, clarifier level, sludge handling',
    },
  ],
};

/**
 * Get all available checklist templates
 */
export const getAllChecklistTemplates = (): ChecklistTemplate[] => {
  return [
    SECURITY_PATROL_CHECKLIST,
    HVAC_DAILY_CHECKLIST,
    FIRE_SAFETY_CHECKLIST,
    ELECTRICAL_CHECKLIST,
    WATER_SYSTEM_CHECKLIST,
  ];
};

/**
 * Get checklist template by ID
 */
export const getChecklistTemplate = (templateId: string): ChecklistTemplate | null => {
  const templates = getAllChecklistTemplates();
  return templates.find(t => t.id === templateId) || null;
};

/**
 * Get all checklists for a specific building/category
 */
export const getChecklistsForBuilding = (building: string): ChecklistTemplate[] => {
  // In production, this would filter based on building-specific configuration
  return getAllChecklistTemplates();
};

/**
 * Statistics and metadata about available data
 */
export const DATA_IMPORT_STATS = {
  escalationRulesAvailable: 676, // From escalationList.csv
  securityChecklistItems: 5,
  hvacChecklistItems: 4,
  fireChecklistItems: 5,
  electricalChecklistItems: 4,
  waterChecklistItems: 4,
  totalChecklistTemplates: 5,
  sourceModules: [
    'Helpdesk Module (Escalation Rules)',
    'Security Checklist',
    'Technical Daily Task',
    'Fire & Safety Daily Task',
    'Electrical Checklist',
    'Water System (WTP & STP)',
    'Audit Module',
    'Work Permit Module',
    'Compliance Module',
    'Maintenance Module',
    'Utility Billing Module',
  ],
};

export default {
  parseEscalationCSV,
  getAllChecklistTemplates,
  getChecklistTemplate,
  getChecklistsForBuilding,
  DATA_IMPORT_STATS,
};
