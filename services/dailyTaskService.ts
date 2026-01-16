// Daily Task-Log Sheet Module Data Service
// Manages checklist templates, readings, and daily logs

import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

export interface ChecklistTemplate {
    id: string;
    name: string;
    category: 'Security' | 'Maintenance' | 'Facilities' | 'Housekeeping' | 'Safety';
    building: string;
    items: ChecklistItem[];
    createdDate: Date;
    updatedDate: Date;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
}

export interface ChecklistItem {
    id: string;
    itemNumber: number;
    description: string;
    parameterType?: 'Checkbox' | 'Reading' | 'Text' | 'Photo';
    normalRange?: string;
    unit?: string;
    criticality: 'Critical' | 'High' | 'Medium' | 'Low';
    instructions?: string;
}

export interface DailyLogEntry {
    taskId: string;
    checklistTemplateId: string;
    logDate: Date;
    startTime: string;
    endTime: string;
    performedBy: string;
    checkedBy?: string;
    readings: ReadingEntry[];
    checklistResponses: ChecklistResponse[];
    photosAttached?: string[];
    defectsFound?: string;
    maintenanceRequired: boolean;
    followUpActions?: string;
    supervisorApprovalDate?: Date;
    supervisorApprovedBy?: string;
}

export interface ReadingEntry {
    parameterName: string;
    unit: string;
    value: number;
    normalRange?: string;
    remarks?: string;
    flagged: boolean;
}

export interface ChecklistResponse {
    itemId: string;
    itemDescription: string;
    completed: boolean;
    remarks?: string;
    verifiedBy?: string;
    timestamp: Date;
}

// Daily checklist templates for various areas
export const DAILY_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
    {
        id: 'SECURITY-001',
        name: 'Security Patrolling Checklist',
        category: 'Security',
        building: 'Tower A',
        frequency: 'Daily',
        createdDate: new Date('2025-01-01'),
        updatedDate: new Date('2025-12-16'),
        items: [
            {
                id: 'SEC-001',
                itemNumber: 1,
                description: 'Check all entry gates locked and secured',
                parameterType: 'Checkbox',
                criticality: 'Critical',
            },
            {
                id: 'SEC-002',
                itemNumber: 2,
                description: 'Inspect CCTV cameras operational',
                parameterType: 'Checkbox',
                criticality: 'Critical',
            },
            {
                id: 'SEC-003',
                itemNumber: 3,
                description: 'Verify all access control cards active',
                parameterType: 'Checkbox',
                criticality: 'High',
            },
            {
                id: 'SEC-004',
                itemNumber: 4,
                description: 'Check fire extinguisher locations accessible',
                parameterType: 'Checkbox',
                criticality: 'Critical',
            },
            {
                id: 'SEC-005',
                itemNumber: 5,
                description: 'Inspect emergency lights functioning',
                parameterType: 'Checkbox',
                criticality: 'Critical',
            },
        ],
    },
    {
        id: 'HVAC-001',
        name: 'HVAC Daily Monitoring',
        category: 'Maintenance',
        building: 'Tower A',
        frequency: 'Daily',
        createdDate: new Date('2025-01-01'),
        updatedDate: new Date('2025-12-16'),
        items: [
            {
                id: 'HVAC-001',
                itemNumber: 1,
                description: 'AHU Unit 1 - Suction Temperature',
                parameterType: 'Reading',
                unit: '°C',
                normalRange: '18-24',
                criticality: 'Critical',
            },
            {
                id: 'HVAC-002',
                itemNumber: 2,
                description: 'AHU Unit 1 - Discharge Temperature',
                parameterType: 'Reading',
                unit: '°C',
                normalRange: '12-16',
                criticality: 'Critical',
            },
            {
                id: 'HVAC-003',
                itemNumber: 3,
                description: 'AHU Unit 1 - Filter Pressure Drop',
                parameterType: 'Reading',
                unit: 'mmWC',
                normalRange: '20-40',
                criticality: 'High',
            },
            {
                id: 'HVAC-004',
                itemNumber: 4,
                description: 'Condenser Fan Running - Visual Inspection',
                parameterType: 'Checkbox',
                criticality: 'High',
            },
        ],
    },
    {
        id: 'HOUSEKEEPING-001',
        name: 'Common Area Cleaning Checklist',
        category: 'Housekeeping',
        building: 'Tower A',
        frequency: 'Daily',
        createdDate: new Date('2025-01-01'),
        updatedDate: new Date('2025-12-16'),
        items: [
            {
                id: 'HK-001',
                itemNumber: 1,
                description: 'Lobby Floor - Swept and Mopped',
                parameterType: 'Checkbox',
                criticality: 'High',
            },
            {
                id: 'HK-002',
                itemNumber: 2,
                description: 'Toilets - Cleaned and Sanitized',
                parameterType: 'Checkbox',
                criticality: 'Critical',
            },
            {
                id: 'HK-003',
                itemNumber: 3,
                description: 'Trash Bins - Emptied and Replaced',
                parameterType: 'Checkbox',
                criticality: 'High',
            },
            {
                id: 'HK-004',
                itemNumber: 4,
                description: 'Glass Windows - Cleaned',
                parameterType: 'Checkbox',
                criticality: 'Medium',
            },
        ],
    },
];

/**
 * Get checklist template by ID
 */
export function getChecklistTemplate(templateId: string): ChecklistTemplate | undefined {
    return DAILY_CHECKLIST_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get all templates for a building
 */
export function getChecklistsForBuilding(building: string): ChecklistTemplate[] {
    return DAILY_CHECKLIST_TEMPLATES.filter(t => t.building === building);
}

/**
 * Get templates for a specific category
 */
export function getChecklistsByCategory(category: string): ChecklistTemplate[] {
    return DAILY_CHECKLIST_TEMPLATES.filter(t => t.category === category);
}

/**
 * Create task from checklist template
 */
export function createTaskFromChecklist(
    templateId: string,
    assignedTo: string,
    location: string,
    dueDate: Date
): Task {
    const template = getChecklistTemplate(templateId);
    if (!template) throw new Error('Template not found');

    const checklistItems = template.items.map((item, index) => ({
        id: `${templateId}-item-${index}`,
        item: item.description,
        completed: false,
        remarks: '',
    }));

    return {
        id: 0, // Will be assigned by system
        taskId: '', // Will be generated
        title: template.name,
        description: `Daily checklist for ${template.name} - ${template.building}`,
        assignedTo,
        status: TaskStatus.Pending,
        priority: TaskPriority.High,
        dueDate,
        location: location || template.building,
        taskType: 'Daily Checklist',
        checklistItems,
        startTime: new Date().toLocaleTimeString(),
    };
}

/**
 * Validate checklist completion
 * Returns true if all critical items are completed
 */
export function validateChecklistCompletion(entries: ChecklistResponse[], template: ChecklistTemplate): {
    valid: boolean;
    incompleteCriticalItems: ChecklistItem[];
} {
    const incompleteCriticalItems = template.items.filter(item => {
        if (item.criticality === 'Critical') {
            const response = entries.find(e => e.itemId === item.id);
            return !response || !response.completed;
        }
        return false;
    });

    return {
        valid: incompleteCriticalItems.length === 0,
        incompleteCriticalItems,
    };
}

/**
 * Generate daily log from task completion
 */
export function generateDailyLogFromTask(task: Task, performedBy: string): DailyLogEntry {
    const readings = (task.readings || []).map(r => ({
        parameterName: r.parameterName,
        unit: r.unit,
        value: r.value,
        normalRange: r.normalRange,
        remarks: r.remarks,
        flagged: r.remarks ? r.remarks.toLowerCase().includes('alert') : false,
    }));

    const checklistResponses = (task.checklistItems || []).map(item => ({
        itemId: item.id,
        itemDescription: item.item,
        completed: item.completed,
        remarks: item.remarks,
        verifiedBy: item.verifiedBy,
        timestamp: new Date(),
    }));

    return {
        taskId: task.taskId,
        checklistTemplateId: '', // To be filled
        logDate: new Date(),
        startTime: task.startTime || new Date().toLocaleTimeString(),
        endTime: task.endTime || new Date().toLocaleTimeString(),
        performedBy,
        checkedBy: task.supervisorApproval ? task.approvedBy : undefined,
        readings,
        checklistResponses,
        photosAttached: task.photosAttached,
        defectsFound: task.defectsFound,
        maintenanceRequired: task.maintenanceRequired || false,
        followUpActions: task.completionNotes,
        supervisorApprovalDate: new Date(),
        supervisorApprovedBy: task.approvedBy,
    };
}
