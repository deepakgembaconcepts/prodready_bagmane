
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
// Copied from userData.ts to avoid TS compilation requirement for this setup script

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copied from userData.ts to avoid TS compilation requirement for this setup script
const rawUsers = [
    { id: 1, name: 'Admin / System Owner', role: 'Admin', email: 'admin@bagmane.com' },
    { id: 2, name: 'Building Manager', role: 'Building Manager', email: 'manager@bagmane.com' },
    { id: 3, name: 'Rajesh (L0 Tech)', role: 'L0 Technician', email: 'rajesh@bagmane.com' },
    { id: 6, name: 'Suresh (L2 Expert)', role: 'L2 Technician', email: 'suresh@bagmane.com' },
    { id: 4, name: 'Tenant', role: 'Tenant', email: 'tenant@bagmane.com' },
    { id: 5, name: 'Finance Manager', role: 'Finance Manager', email: 'finance@bagmane.com' },
];

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Bagmane@123';

async function generateUsers() {
    console.log('Generating secure user store...');

    const secureUsers = [];

    // Hardcoded permissions from types.ts ViewType enum
    const allPermissions = [
        'DASHBOARD', 'SITE_HIERARCHY', 'COMPLEX_INFO', 'TICKETS', 'ASSETS',
        'ASSET_REGISTRY', 'ASSET_DASHBOARD', 'PPM', 'CONTRACTS', 'ASSET_VERIFICATION',
        'INCIDENTS', 'WORK_PERMITS', 'AUDITS', 'INVENTORY', 'TASKS',
        'FEEDBACK', 'CSAT_MODULE', 'NPS_MODULE', 'TENANT_PORTAL', 'VENDOR_CRM',
        'COMPLIANCE', 'ESG', 'TRANSITION', 'UTILITY_BILLING', 'USER_GROUPS',
        'TASKS_TECHNICAL', 'TASKS_SOFT_SERVICES', 'TASKS_SECURITY', 'TASKS_HORTICULTURE',
        'WORK_PERMITS_DASHBOARD', 'JSA_MANAGEMENT', 'ASSET_QR_CODES', 'ASSET_OPERATIONAL_AGE',
        'STOCK_TRANSFER', 'CSAT_DASHBOARD', 'NPS_DASHBOARD', 'WORK_PERMIT_DASHBOARD',
        'WORK_PERMIT_APPROVAL', 'STOCK_TRANSFER_DASHBOARD', 'INVENTORY_DASHBOARD',
        'TICKET_DASHBOARD', 'CONTRACT_VENDOR', 'CLIENT_CONNECT_MEETINGS',
        'HELPDESK_DASHBOARD', 'ESCALATION_TIMELINE'
    ];

    const rolePermissions = {
        'Admin': allPermissions,
        'Building Manager': allPermissions, // Give BM full access for now too
        'L2 Technician': ['DASHBOARD', 'TICKETS', 'ASSETS', 'PPM', 'TASKS', 'INCIDENTS', 'WORK_PERMITS', 'INVENTORY'],
        'L0 Technician': ['DASHBOARD', 'TICKETS', 'TASKS'],
        'Tenant': ['TENANT_PORTAL', 'CLIENT_CONNECT_MEETINGS'],
        'Finance Manager': ['DASHBOARD', 'UTILITY_BILLING', 'CONTRACTS', 'ASSET_REGISTRY', 'BY_BUILDING_BILLING']
    };

    for (const user of rawUsers) {
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
        secureUsers.push({
            ...user,
            password: hashedPassword,
            permissions: rolePermissions[user.role] || []
        });
        console.log(`✓ Processed ${user.name} (${user.role}) - ${rolePermissions[user.role]?.length || 0} permissions`);
    }

    const outputPath = path.join(__dirname, '../data/users.json');
    fs.writeFileSync(outputPath, JSON.stringify(secureUsers, null, 2));
    console.log(`\nSuccessfully created users.json at ${outputPath}`);
    console.log(`Default Password for all users: ${DEFAULT_PASSWORD}`);
}

generateUsers().catch(console.error);
