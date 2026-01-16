
import { Category } from '../types';

export interface ChecklistItem {
    id: string;
    item: string;
    completed: boolean;
    remarks?: string;
}

export type ChecklistTemplate = Record<string, ChecklistItem[]>;

// Helper to create standard placeholder items for the PDF forms
const createStandardItems = (formName: string): ChecklistItem[] => [
    { id: '1', item: `Perform all checks as per ${formName}`, completed: false },
    { id: '2', item: 'Verify readings are within limits', completed: false },
    { id: '3', item: 'Check for any abnormal noise/vibration', completed: false },
    { id: '4', item: 'Ensure area is clean after work', completed: false },
];

export const CHECKLIST_TEMPLATES: Record<Category, ChecklistTemplate> = {
    [Category.Technical]: {
        // WTP & STP
        'STP Daily Operational Log (F-01-B)': createStandardItems('STP Daily Operational Log (F-01-B)'),
        'Water Flow Meter Reading Log': createStandardItems('Water Flow Meter Reading Log'),
        'STP Daily Operational Log-MBR (F-01-A)': createStandardItems('STP Daily Operational Log-MBR (F-01-A)'),
        'Water Tank Daily Check Log': createStandardItems('Water Tank Daily Check Log'),
        'WTP Pump Daily Checklist': createStandardItems('WTP Pump Daily Checklist'),
        'WTP Operational Log': createStandardItems('WTP Operational Log'),

        // Fire & Safety
        'Fire Shaft Daily Checklist': createStandardItems('Fire Shaft Daily Checklist'),
        'Fire Hose Cabinet Hourly Checklist': createStandardItems('Fire Hose Cabinet Hourly Checklist'),
        'Hydrant Pump Daily Checklist': createStandardItems('Hydrant Pump Daily Checklist'),
        'Sprinkler Pump Daily Checklist': createStandardItems('Sprinkler Pump Daily Checklist'),
        'Fire Engine Daily Checklist': createStandardItems('Fire Engine Daily Checklist'),
        'Fire Suppression System Daily Checklist': createStandardItems('Fire Suppression System Daily Checklist'),
        'Booster Pump Daily Checklist': createStandardItems('Booster Pump Daily Checklist'),
        'Fire Pumps & Sprinkler System Weekly': createStandardItems('Fire Pumps & Sprinkler System Weekly'),
        'FAPA Systems Daily Checklist': createStandardItems('FAPA Systems Daily Checklist'),
        'Jockey Pump Daily Checklist': createStandardItems('Jockey Pump Daily Checklist'),
        'Fire Detection & Alarm System Weekly': createStandardItems('Fire Detection & Alarm System Weekly'),
        'Fire Equipment Daily Checklist': createStandardItems('Fire Equipment Daily Checklist'),
        'Eye Wash Bottle Checklist': createStandardItems('Eye Wash Bottle Checklist'),

        // Electrical
        'RTCC Panel Daily Checklist': createStandardItems('RTCC Panel Daily Checklist'),
        'LT Panel Daily Check List': createStandardItems('LT Panel Daily Check List'),
        'Panel Daily check list (F-15)': createStandardItems('Panel Daily check list (F-15)'),
        'CCTV Daily Inspection Checklist': createStandardItems('CCTV Daily Inspection Checklist'),
        'Pumps Daily Checklist': createStandardItems('Pumps Daily Checklist'),
        'CCTV Log': createStandardItems('CCTV Log'),
        'HSD Yard Weekly Checklist': createStandardItems('HSD Yard Weekly Checklist'),
        'DG A-Check Log': createStandardItems('DG A-Check Log'),
        'DG Running Log': createStandardItems('DG Running Log'),
        'Elevator Daily Checklist': createStandardItems('Elevator Daily Checklist'),
        'UPS Daily Log': createStandardItems('UPS Daily Log'),

        // HVAC
        'Exhaust Fan Daily Checklist': createStandardItems('Exhaust Fan Daily Checklist'),
        'Chiller Pump Daily Checklist': createStandardItems('Chiller Pump Daily Checklist'),
        'Water Cooled Chiller Log': createStandardItems('Water Cooled Chiller Log'),
        'AHU Parameter Readings': createStandardItems('AHU Parameter Readings'),
        'Chiller Daily Checklist': createStandardItems('Chiller Daily Checklist'),
        'Chiller Pump Status Log': createStandardItems('Chiller Pump Status Log'),
        'AHU Daily Inspection Checklist': createStandardItems('AHU Daily Inspection Checklist'),
        'Air Cooled Chiller Log': createStandardItems('Air Cooled Chiller Log'),

        // Transformer & HT
        'Transformer Daily Log': createStandardItems('Transformer Daily Log'),
        'HT Panels Daily Check List': createStandardItems('HT Panels Daily Check List'),
        'HT Meter Cubicle Reading Log': createStandardItems('HT Meter Cubicle Reading Log'),
        'Transformer Daily Checklist': createStandardItems('Transformer Daily Checklist'),
    },
    [Category.SoftServices]: {
        'Restroom Cleaning Checklist': createStandardItems('Restroom Cleaning Checklist'),
        'Pantry Hygiene Checklist': createStandardItems('Pantry Hygiene Checklist'),
        'Common Area Cleaning': createStandardItems('Common Area Cleaning'),
        'Waste Disposal Log': createStandardItems('Waste Disposal Log'),
        'Deep Cleaning Schedule': createStandardItems('Deep Cleaning Schedule'),
    },
    [Category.Security]: {
        'Security Guard Handover Log': createStandardItems('Security Guard Handover Log'),
        'Visitor Management Log': createStandardItems('Visitor Management Log'),
        'Material Movement Log': createStandardItems('Material Movement Log'),
        'Key Management Log': createStandardItems('Key Management Log'),
        'Night Patrolling Log': createStandardItems('Night Patrolling Log'),
        'Vehicle Inspection Log': createStandardItems('Vehicle Inspection Log'),
    },
    [Category.Horticulture]: {
        'Garden Maintenance Checklist': createStandardItems('Garden Maintenance Checklist'),
        'Irrigation Schedule Log': createStandardItems('Irrigation Schedule Log'),
        'Indoor Plant Care Log': createStandardItems('Indoor Plant Care Log'),
        'Lawn Mowing Schedule': createStandardItems('Lawn Mowing Schedule'),
    },
    [Category.Civil]: {
        'Building Fabric Inspection': createStandardItems('Building Fabric Inspection'),
        'Plumbing Fixture Checklist': [
            { id: '1', item: 'Check for leaks', completed: false },
            { id: '2', item: 'Check water pressure', completed: false },
            { id: '3', item: 'Drainage check', completed: false },
        ],
        'Carpentry Works Log': createStandardItems('Carpentry Works Log'),
    },
    [Category.Admin]: {
        'Office Supplies Inventory': createStandardItems('Office Supplies Inventory'),
        'Meeting Room Readiness': createStandardItems('Meeting Room Readiness'),
    }
};

export const getTemplatesByCategory = (category: Category): Record<string, ChecklistItem[]> => {
    return CHECKLIST_TEMPLATES[category] || {};
};
