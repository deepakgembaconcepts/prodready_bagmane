/**
 * Category Service
 * Manages helpdesk categories and subcategories based on the actual Helpdesk Excel file
 */

export interface CategoryData {
  category: string;
  subcategories: string[];
}

export interface EscalationInfo {
  averagePriority: string;
  totalRules: number;
  commonIssues: string[];
}

// Categories and subcategories based on Helpdesk - Category and Subcategory data on Ticket Creation.csv
const HELPDESK_CATEGORIES: CategoryData[] = [
  {
    category: 'Technical',
    subcategories: ['Electrical', 'HVAC', 'PHE', 'Civil', 'EHS']
  },
  {
    category: 'Soft Services',
    subcategories: ['Housekeeping', 'Pest Control']
  },
  {
    category: 'Security Services',
    subcategories: ['Access Control']
  },
  {
    category: 'Horticulture',
    subcategories: ['Landscape Upkeep']
  },
  {
    category: 'Transport',
    subcategories: ['Transport']
  },
  {
    category: 'Admin',
    subcategories: ['Office Support']
  }
];

let cachedCategories: CategoryData[] | null = null;

/**
 * Get all categories with their subcategories
 */
export function getCategoriesWithSubcategories(): CategoryData[] {
  if (cachedCategories) {
    return cachedCategories;
  }

  cachedCategories = HELPDESK_CATEGORIES;
  return cachedCategories;
}

/**
 * Get all unique category names
 */
export function getCategories(): string[] {
  return getCategoriesWithSubcategories().map(c => c.category);
}

/**
 * Get subcategories for a specific category
 */
export function getSubcategories(category: string): string[] {
  const categoryData = getCategoriesWithSubcategories().find(c => c.category === category);
  return categoryData?.subcategories || [];
}

/**
 * Get default priority for a category/subcategory combination
 * Returns a string like "P1 - Critical", "P2 - High", etc.
 */
export function getDefaultPriority(category: string, subcategory: string): string {
  // Priority mapping based on subcategory type
  const priorityMap: { [key: string]: string } = {
    // Technical - Electrical (usually P2-P3)
    'Electrical': 'P2 - High',
    // Technical - HVAC (usually P2-P3)
    'HVAC': 'P2 - High',
    // Technical - Plumbing/PHE (usually P2-P3)
    'PHE': 'P2 - High',
    // Technical - Civil (usually P3-P4)
    'Civil': 'P3 - Medium',
    // Technical - EHS (usually P1-P2)
    'EHS': 'P1 - Critical',
    // Soft Services - Housekeeping (usually P4)
    'Housekeeping': 'P4 - Low',
    // Soft Services - Pest Control (usually P3)
    'Pest Control': 'P3 - Medium',
    // Security Services - Access Control (usually P1-P2)
    'Access Control': 'P1 - Critical',
    // Horticulture - Landscape (usually P4)
    'Landscape Upkeep': 'P4 - Low',
    // Transport (usually P2-P3)
    'Transport': 'P3 - Medium',
    // Admin - Office Support (usually P4)
    'Office Support': 'P4 - Low'
  };

  return priorityMap[subcategory] || 'P3 - Medium';
}

/**
 * Get escalation info for a category/subcategory
 */
export function getEscalationInfo(category: string, subcategory: string): EscalationInfo {
  const priority = getDefaultPriority(category, subcategory);
  
  // Sample common issues based on subcategory
  const commonIssuesMap: { [key: string]: string[] } = {
    'Electrical': ['Power outage', 'Light not working', 'Switch issue', 'UPS failure', 'Wiring damage'],
    'HVAC': ['No cooling', 'Chiller issue', 'Filter cleaning', 'Noise complaint', 'Gas leak'],
    'PHE': ['No water supply', 'Leakage', 'Tap not working', 'Blocked drain', 'Overflow'],
    'Civil': ['Wall crack', 'Paint needed', 'Door repair', 'Floor damage', 'Leakage'],
    'EHS': ['Hazardous waste', 'E-waste disposal'],
    'Housekeeping': ['Debris removal', 'Cleaning delayed', 'Stain removal', 'Restroom supply', 'Deep clean'],
    'Pest Control': ['Mosquito issue', 'Cockroach', 'Termite', 'Fogging needed', 'Animal complaint'],
    'Access Control': ['Card not working', 'Unauthorized entry', 'CCTV issue', 'Guard absent', 'Key lock issue'],
    'Landscape Upkeep': ['Lawn not maintained', 'Plant replacement', 'Irrigation issue', 'Tree trimming', 'Pest infestation'],
    'Transport': ['Vehicle booking', 'Shuttle delay', 'Driver unavailable', 'Vehicle breakdown'],
    'Office Support': ['Courier dispatch', 'Stationery', 'Printing issue', 'Pantry supply', 'Meeting room setup']
  };

  const commonIssues = commonIssuesMap[subcategory] || ['General issue'];

  return {
    averagePriority: priority,
    totalRules: 1,
    commonIssues: commonIssues.slice(0, 5)
  };
}
