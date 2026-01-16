import { ViewType, UserRole } from '../types';

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  icon: () => string;
  permissions: ViewType[];
  level: 'Executive' | 'Senior Management' | 'Management' | 'Technical Lead' | 'Technical' | 'Support';
  userCount?: number;
}

// Define all 21 user groups
export const USER_GROUPS: UserGroup[] = [
  // Executive Level
  {
    id: 'hod-asset-mgmt',
    name: 'Head of Department – Asset Management',
    description: 'Overall authority for asset management strategy and operations',
    icon: () => '👑',
    level: 'Executive',
    permissions: [
      ViewType.DASHBOARD, ViewType.COMPLEX_INFO, ViewType.TICKETS, ViewType.ASSETS,
      ViewType.PPM, ViewType.CONTRACTS, ViewType.ASSET_VERIFICATION, ViewType.INCIDENTS,
      ViewType.WORK_PERMITS, ViewType.AUDITS, ViewType.INVENTORY, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.VENDOR_CRM, ViewType.COMPLIANCE, ViewType.ESG,
      ViewType.TRANSITION, ViewType.UTILITY_BILLING
    ]
  },

  // Senior Management
  {
    id: 'cluster-lead',
    name: 'Cluster Lead',
    description: 'Manages multiple complexes and oversees operations',
    icon: () => '🏢',
    level: 'Senior Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.COMPLEX_INFO, ViewType.TICKETS, ViewType.ASSETS,
      ViewType.PPM, ViewType.CONTRACTS, ViewType.ASSET_VERIFICATION, ViewType.INCIDENTS,
      ViewType.WORK_PERMITS, ViewType.AUDITS, ViewType.INVENTORY, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.VENDOR_CRM, ViewType.COMPLIANCE, ViewType.UTILITY_BILLING
    ]
  },

  {
    id: 'qhsew-lead',
    name: 'QHSE&W Lead',
    description: 'Quality, Health, Safety, Environment & Wellness oversight',
    icon: () => '🛡️',
    level: 'Senior Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.COMPLEX_INFO, ViewType.TICKETS, ViewType.INCIDENTS,
      ViewType.WORK_PERMITS, ViewType.AUDITS, ViewType.COMPLIANCE, ViewType.FEEDBACK,
      ViewType.TASKS
    ]
  },

  // Management Level
  {
    id: 'campus-head',
    name: 'Campus Head',
    description: 'Manages campus operations, maintenance, and services',
    icon: () => '🏛️',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.COMPLEX_INFO, ViewType.TICKETS, ViewType.ASSETS,
      ViewType.PPM, ViewType.ASSET_VERIFICATION, ViewType.INCIDENTS, ViewType.WORK_PERMITS,
      ViewType.AUDITS, ViewType.INVENTORY, ViewType.TASKS, ViewType.FEEDBACK,
      ViewType.UTILITY_BILLING, ViewType.TRANSITION
    ]
  },

  {
    id: 'qhse-campus-head',
    name: 'QHSE Campus Head',
    description: 'Campus-level safety and compliance management',
    icon: () => '⚠️',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.WORK_PERMITS,
      ViewType.AUDITS, ViewType.COMPLIANCE, ViewType.TASKS, ViewType.FEEDBACK
    ]
  },

  {
    id: 'security-transport-head',
    name: 'Security & Transport Head',
    description: 'Oversees security operations and transportation services',
    icon: () => '🔒',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.WORK_PERMITS, ViewType.AUDITS
    ]
  },

  {
    id: 'horticulture-head',
    name: 'Horticulture Head',
    description: 'Manages landscaping and green space operations',
    icon: () => '🌿',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.TASKS, ViewType.FEEDBACK, ViewType.WORK_PERMITS, ViewType.AUDITS
    ]
  },

  {
    id: 'building-manager',
    name: 'Building Manager',
    description: 'Manages building operations, maintenance, and compliance',
    icon: () => '🏗️',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.ASSET_VERIFICATION, ViewType.INCIDENTS, ViewType.WORK_PERMITS,
      ViewType.INVENTORY, ViewType.TASKS, ViewType.FEEDBACK, ViewType.UTILITY_BILLING,
      ViewType.AUDITS, ViewType.COMPLIANCE
    ]
  },

  // Technical Lead Level
  {
    id: 'transport-lead',
    name: 'Transport Lead',
    description: 'Leads transportation operations and fleet management',
    icon: () => '🚗',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.TASKS, ViewType.FEEDBACK, ViewType.WORK_PERMITS
    ]
  },

  {
    id: 'security-campus-incharge',
    name: 'Security Campus Incharge',
    description: 'Responsible for campus-wide security operations',
    icon: () => '👮',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.AUDITS
    ]
  },

  {
    id: 'horticulture-campus-mgr',
    name: 'Horticulture Campus Manager',
    description: 'Manages green space and landscaping for specific campus',
    icon: () => '🌳',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.TASKS, ViewType.FEEDBACK, ViewType.WORK_PERMITS
    ]
  },

  // Technical Level - HVAC & Electrical
  {
    id: 'hvac-technician',
    name: 'HVAC Technician',
    description: 'Maintains heating, ventilation, and air conditioning systems',
    icon: () => '❄️',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  {
    id: 'electrician',
    name: 'Electrician',
    description: 'Handles electrical installations, maintenance, and repairs',
    icon: () => '⚡',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS, ViewType.UTILITY_BILLING
    ]
  },

  // Technical Level - Plumbing & Civil
  {
    id: 'plumber',
    name: 'Plumber',
    description: 'Manages water supply, drainage, and plumbing systems',
    icon: () => '🔧',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS, ViewType.UTILITY_BILLING
    ]
  },

  {
    id: 'mason',
    name: 'Mason',
    description: 'Performs masonry work and civil structure repairs',
    icon: () => '🧱',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  // Technical Level - Skilled Trades
  {
    id: 'fabricator',
    name: 'Fabricator',
    description: 'Fabricates metal and structural components',
    icon: () => '⚙️',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  {
    id: 'painter',
    name: 'Painter',
    description: 'Handles painting and surface finishing work',
    icon: () => '🎨',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  {
    id: 'carpenter',
    name: 'Carpenter',
    description: 'Performs carpentry and woodwork maintenance',
    icon: () => '🪛',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  // Safety & Support
  {
    id: 'fire-officer',
    name: 'Fire Officer',
    description: 'Manages fire safety systems and emergency preparedness',
    icon: () => '🚒',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.WORK_PERMITS,
      ViewType.AUDITS, ViewType.COMPLIANCE, ViewType.TASKS, ViewType.FEEDBACK
    ]
  },

  {
    id: 'fire-technician',
    name: 'Fire Technician',
    description: 'Maintains fire extinguishers and firefighting equipment',
    icon: () => '🧯',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  {
    id: 'shift-engineer',
    name: 'Shift Engineer',
    description: 'Oversees operations during assigned shifts',
    icon: () => '👷',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.INCIDENTS, ViewType.WORK_PERMITS, ViewType.TASKS, ViewType.FEEDBACK,
      ViewType.UTILITY_BILLING
    ]
  },

  // Housekeeping & Support Services
  {
    id: 'housekeeping-supervisor',
    name: 'Housekeeping – Supervisor',
    description: 'Supervises housekeeping operations and staff performance',
    icon: () => '🧹',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.TASKS, ViewType.FEEDBACK,
      ViewType.WORK_PERMITS, ViewType.INCIDENTS
    ]
  },

  {
    id: 'housekeeping-executive',
    name: 'Housekeeping – Executive',
    description: 'Executes housekeeping and facility cleaning services',
    icon: () => '🧼',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.TASKS, ViewType.INCIDENTS
    ]
  },

  // Security Personnel
  {
    id: 'male-security-guard',
    name: 'Male Security Guard',
    description: 'Provides security services and campus surveillance',
    icon: () => '👮‍♂️',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.WORK_PERMITS
    ]
  },

  {
    id: 'female-security-guard',
    name: 'Female Security Guard',
    description: 'Provides security services with gender-specific responsibilities',
    icon: () => '👮‍♀️',
    level: 'Technical',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.WORK_PERMITS
    ]
  },

  {
    id: 'security-supervisor',
    name: 'Security Supervisor',
    description: 'Supervises security staff and operations',
    icon: () => '🔐',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.WORK_PERMITS, ViewType.AUDITS
    ]
  },

  {
    id: 'security-officer',
    name: 'Security Officer',
    description: 'Manages security protocols and incident response',
    icon: () => '🛂',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.WORK_PERMITS, ViewType.AUDITS, ViewType.COMPLIANCE
    ]
  },

  {
    id: 'area-security-manager',
    name: 'Area Security Manager',
    description: 'Manages security across multiple areas and coordinates with authorities',
    icon: () => '🚔',
    level: 'Management',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.INCIDENTS, ViewType.TASKS,
      ViewType.FEEDBACK, ViewType.WORK_PERMITS, ViewType.AUDITS, ViewType.COMPLIANCE,
      ViewType.ASSET_VERIFICATION
    ]
  },

  {
    id: 'horticulture-supervisor',
    name: 'Horticulture Supervisor',
    description: 'Supervises horticultural staff and landscape maintenance',
    icon: () => '🌱',
    level: 'Technical Lead',
    permissions: [
      ViewType.DASHBOARD, ViewType.TICKETS, ViewType.ASSETS, ViewType.PPM,
      ViewType.TASKS, ViewType.FEEDBACK, ViewType.WORK_PERMITS, ViewType.INCIDENTS
    ]
  }
];

// Helper function to get group by ID
export const getGroupById = (id: string): UserGroup | undefined => {
  return USER_GROUPS.find(group => group.id === id);
};

// Helper function to get groups by level
export const getGroupsByLevel = (level: UserGroup['level']): UserGroup[] => {
  return USER_GROUPS.filter(group => group.level === level);
};

// Statistics
export const GROUP_STATISTICS = {
  total: USER_GROUPS.length,
  byLevel: {
    Executive: USER_GROUPS.filter(g => g.level === 'Executive').length,
    'Senior Management': USER_GROUPS.filter(g => g.level === 'Senior Management').length,
    Management: USER_GROUPS.filter(g => g.level === 'Management').length,
    'Technical Lead': USER_GROUPS.filter(g => g.level === 'Technical Lead').length,
    Technical: USER_GROUPS.filter(g => g.level === 'Technical').length,
    Support: USER_GROUPS.filter(g => g.level === 'Support').length,
  }
};
