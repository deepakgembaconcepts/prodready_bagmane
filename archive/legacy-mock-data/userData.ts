
import { ViewType, UserRole } from '../types';
import type { User } from '../types';

// Simple emoji icons for demonstration
const AdminIcon = () => '👑';
const ManagerIcon = () => '👔';
const TechnicianIcon = () => '🛠️';
const TenantIcon = () => '👤';
const FinanceIcon = () => '💼';

const ADMIN_PERMISSIONS = [
    ViewType.DASHBOARD, ViewType.SITE_HIERARCHY, ViewType.COMPLEX_INFO, ViewType.TICKETS, ViewType.ASSETS, 
    ViewType.ASSET_QR_CODES, ViewType.ASSET_OPERATIONAL_AGE,
    ViewType.PPM, ViewType.CONTRACTS, ViewType.VENDOR_CRM, ViewType.CONTRACT_VENDOR,
    ViewType.ASSET_VERIFICATION, ViewType.INCIDENTS, 
    ViewType.WORK_PERMITS, ViewType.WORK_PERMIT_DASHBOARD, ViewType.JSA_MANAGEMENT,
    ViewType.AUDITS, ViewType.INVENTORY, ViewType.STOCK_TRANSFER, ViewType.STOCK_TRANSFER_DASHBOARD,
    ViewType.TASKS, ViewType.TASKS_TECHNICAL, ViewType.TASKS_SOFT_SERVICES, ViewType.TASKS_SECURITY, ViewType.TASKS_HORTICULTURE,
    ViewType.FEEDBACK, ViewType.CSAT_MODULE, ViewType.CSAT_DASHBOARD, ViewType.NPS_MODULE, ViewType.NPS_DASHBOARD,
    ViewType.TENANT_PORTAL, ViewType.COMPLIANCE, 
    ViewType.ESG, ViewType.TRANSITION, ViewType.UTILITY_BILLING, ViewType.USER_GROUPS
];

const MANAGER_PERMISSIONS = [
    ViewType.DASHBOARD, ViewType.SITE_HIERARCHY, ViewType.COMPLEX_INFO, ViewType.TICKETS, ViewType.ASSETS, 
    ViewType.ASSET_QR_CODES, ViewType.ASSET_OPERATIONAL_AGE,
    ViewType.PPM, ViewType.CONTRACTS, ViewType.VENDOR_CRM, ViewType.CONTRACT_VENDOR,
    ViewType.ASSET_VERIFICATION, ViewType.INCIDENTS, 
    ViewType.WORK_PERMITS, ViewType.WORK_PERMIT_DASHBOARD, ViewType.JSA_MANAGEMENT,
    ViewType.AUDITS, ViewType.INVENTORY, ViewType.STOCK_TRANSFER, ViewType.STOCK_TRANSFER_DASHBOARD,
    ViewType.TASKS, ViewType.TASKS_TECHNICAL, ViewType.TASKS_SOFT_SERVICES, ViewType.TASKS_SECURITY, ViewType.TASKS_HORTICULTURE,
    ViewType.FEEDBACK, ViewType.CSAT_MODULE, ViewType.CSAT_DASHBOARD, ViewType.NPS_MODULE, ViewType.NPS_DASHBOARD,
    ViewType.COMPLIANCE, ViewType.UTILITY_BILLING, 
    ViewType.ESG, ViewType.TRANSITION, ViewType.USER_GROUPS
];

export const users: User[] = [
  {
    id: 1,
    name: 'Admin / System Owner',
    role: UserRole.ADMIN,
    description: 'Full access to all modules and system settings.',
    icon: AdminIcon,
    permissions: ADMIN_PERMISSIONS,
  },
  {
    id: 2,
    name: 'Building Manager',
    role: UserRole.BUILDING_MANAGER,
    description: 'Oversees operations, approvals, and reporting.',
    icon: ManagerIcon,
    permissions: MANAGER_PERMISSIONS,
  },
  {
    id: 3,
    name: 'Rajesh (L0 Tech)',
    role: UserRole.TECHNICIAN_L0,
    description: 'First line of response.',
    icon: TechnicianIcon,
    permissions: [ViewType.DASHBOARD, ViewType.TASKS, ViewType.TICKETS],
  },
  {
    id: 6,
    name: 'Suresh (L2 Expert)',
    role: UserRole.TECHNICIAN_L2,
    description: 'Expert technician for escalated issues.',
    icon: TechnicianIcon,
    permissions: [ViewType.DASHBOARD, ViewType.TASKS, ViewType.TICKETS, ViewType.ASSETS, ViewType.WORK_PERMITS],
  },
  {
    id: 4,
    name: 'Tenant',
    role: UserRole.TENANT,
    description: 'Submits new tickets and tracks their status.',
    icon: TenantIcon,
    permissions: [ViewType.DASHBOARD, ViewType.TENANT_PORTAL],
  },
  {
    id: 5,
    name: 'Finance Manager',
    role: UserRole.FINANCE_MANAGER,
    description: 'Manages billing, contracts, and financial reports.',
    icon: FinanceIcon,
    permissions: [ViewType.DASHBOARD, ViewType.VENDOR_CRM, ViewType.CONTRACTS, ViewType.COMPLIANCE, ViewType.UTILITY_BILLING],
  },
];

export const userPermissions: Record<UserRole, ViewType[]> = users.reduce((acc, user) => {
    acc[user.role] = user.permissions;
    return acc;
}, {} as Record<UserRole, ViewType[]>);
