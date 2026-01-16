
import { useState, useEffect } from 'react';
import type { Ticket, Asset, Site, Task, Vendor, Contract, InventoryItem, WorkPermit, Incident, Audit, ComplianceItem, UtilityReading, UtilityBill, ESGMetric, CSATResponse, NPSResponse, TransitionProject, Announcement, Message, Meeting, TransitionSnag, Building } from '../types';
import { Status, Priority, Category, AssetStatus, AssetCategory, TaskStatus, TaskPriority } from '../types';
import { bsocAssetsComplete } from '../data/bsocAssetsComplete';

const MOCK_TECHNICIANS = ['Rajesh Kumar', 'Sita Sharma', 'Amit Patel', 'Priya Singh', 'Vijay Verma'];
const MOCK_USERS = ['Anjali Mehta', 'Rohan Gupta', 'Kavita Reddy', 'Suresh Desai', 'Pooja Nair'];
// Building names matching Complex Info Master Data (from BTP data)
const MOCK_BUILDINGS = ['Bagmane Parin', 'Bagmane Laurel', 'Laurel 1', 'Tridib', 'Crown', 'Quay', 'Lakeview', 'Olympia'];
const MOCK_TENANTS = ['Google', 'Amazon', 'Microsoft', 'Oracle', 'Samsung', 'Intel'];
const MOCK_SUBCATEGORIES: { [key in Category]: string[] } = {
    [Category.Technical]: ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Asset Management'],
    [Category.SoftServices]: ['Housekeeping', 'Pest Control', 'Waste Management'],
    [Category.Civil]: ['Masonry', 'Carpentry', 'Painting'],
    [Category.Security]: ['Access Control', 'CCTV', 'Patrolling'],
    [Category.Horticulture]: ['Landscaping', 'Plant Care', 'Irrigation'],
    [Category.Admin]: ['Stationery', 'Meeting Room', 'Vendor Mgmt'],
};

const MOCK_SITES: Site[] = [
    {
        id: 'SITE-001',
        name: 'Bagmane Tech Park',
        region: 'South',
        city: 'Bangalore',
        buildings: [
            {
                id: 'BLD-A',
                name: 'Tower A',
                address: 'Main Avenue',
                totalArea: 250000,
                floors: [{ id: 'FL-G', name: 'Ground Floor', level: 0 }, { id: 'FL-1', name: '1st Floor', level: 1 }, { id: 'FL-2', name: '2nd Floor', level: 2 }]
            },
            {
                id: 'BLD-B',
                name: 'Tower B',
                address: 'Main Avenue',
                totalArea: 300000,
                floors: [{ id: 'FL-G', name: 'Ground Floor', level: 0 }, { id: 'FL-1', name: '1st Floor', level: 1 }]
            }
        ]
    },
    {
        id: 'SITE-002',
        name: 'Bagmane World Technology Center',
        region: 'South',
        city: 'Bangalore',
        buildings: [
            {
                id: 'BLD-C',
                name: 'Constellation',
                address: 'Outer Ring Road',
                totalArea: 450000,
                floors: [{ id: 'FL-G', name: 'Ground Floor', level: 0 }, { id: 'FL-1', name: '1st Floor', level: 1 }, { id: 'FL-2', name: '2nd Floor', level: 2 }, { id: 'FL-3', name: '3rd Floor', level: 3 }]
            }
        ]
    }
];

const MOCK_VENDORS: Vendor[] = [
    { id: 1, vendorId: 'VEN-001', name: 'CoolAir Solutions', serviceCategory: 'HVAC', contactPerson: 'Rahul Dravid', email: 'rahul@coolair.com', phone: '9876543210', rating: 4.5, status: 'Active', contractExpiry: new Date('2025-12-31') },
    { id: 2, vendorId: 'VEN-002', name: 'SecureGuard Services', serviceCategory: 'Security', contactPerson: 'Anil Kumble', email: 'anil@secureguard.com', phone: '9876543211', rating: 4.8, status: 'Active', contractExpiry: new Date('2025-06-30') },
    { id: 3, vendorId: 'VEN-003', name: 'CleanSweep Facilities', serviceCategory: 'Housekeeping', contactPerson: 'VVS Laxman', email: 'vvs@cleansweep.com', phone: '9876543212', rating: 3.9, status: 'Active', contractExpiry: new Date('2024-11-15') },
    { id: 4, vendorId: 'VEN-004', name: 'BrightSparks Electricals', serviceCategory: 'Electrical', contactPerson: 'Sourav Ganguly', email: 'dada@brightsparks.com', phone: '9876543213', rating: 4.2, status: 'Inactive', contractExpiry: new Date('2023-12-31') },
    { id: 5, vendorId: 'VEN-005', name: 'FlowTech Plumbing', serviceCategory: 'Plumbing', contactPerson: 'Sachin Tendulkar', email: 'sachin@flowtech.com', phone: '9876543214', rating: 4.6, status: 'Active', contractExpiry: new Date('2026-01-15') },
    { id: 6, vendorId: 'VEN-006', name: 'GreenScape Landscaping', serviceCategory: 'Landscaping', contactPerson: 'Rohit Sharma', email: 'rohit@greenscape.com', phone: '9876543215', rating: 4.3, status: 'Active', contractExpiry: new Date('2025-08-30') },
    { id: 7, vendorId: 'VEN-007', name: 'SafeShield Fire Safety', serviceCategory: 'Fire Safety', contactPerson: 'MS Dhoni', email: 'ms@safeshield.com', phone: '9876543216', rating: 4.9, status: 'Active', contractExpiry: new Date('2025-09-20') },
    { id: 8, vendorId: 'VEN-008', name: 'EverGlow Maintenance', serviceCategory: 'General Maintenance', contactPerson: 'Virat Kohli', email: 'virat@everglow.com', phone: '9876543217', rating: 4.4, status: 'Active', contractExpiry: new Date('2025-07-10') },
];

const MOCK_CONTRACTS: Contract[] = [
    { id: 1, contractId: 'CON-2024-001', title: 'Annual HVAC Maintenance', vendorName: 'CoolAir Solutions', vendorId: 'VEN-001', type: 'AMC', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), value: 1200000, status: 'Active' },
    { id: 2, contractId: 'CON-2024-002', title: 'Security Personnel Service', vendorName: 'SecureGuard Services', vendorId: 'VEN-002', type: 'AMC', startDate: new Date('2024-06-01'), endDate: new Date('2025-05-31'), value: 2400000, status: 'Active' },
    { id: 3, contractId: 'CON-2023-005', title: 'Deep Cleaning Services', vendorName: 'CleanSweep Facilities', vendorId: 'VEN-003', type: 'One-Time', startDate: new Date('2023-10-01'), endDate: new Date('2023-10-31'), value: 50000, status: 'Expired' },
    { id: 4, contractId: 'CON-2024-003', title: 'Plumbing & Water Systems', vendorName: 'FlowTech Plumbing', vendorId: 'VEN-005', type: 'AMC', startDate: new Date('2024-02-01'), endDate: new Date('2025-01-31'), value: 850000, status: 'Active' },
    { id: 5, contractId: 'CON-2024-004', title: 'Landscape & Garden Maintenance', vendorName: 'GreenScape Landscaping', vendorId: 'VEN-006', type: 'AMC', startDate: new Date('2024-03-15'), endDate: new Date('2025-03-14'), value: 600000, status: 'Active' },
    { id: 6, contractId: 'CON-2024-005', title: 'Fire Safety System Maintenance', vendorName: 'SafeShield Fire Safety', vendorId: 'VEN-007', type: 'AMC', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), value: 950000, status: 'Active' },
    { id: 7, contractId: 'CON-2023-006', title: 'Electrical Equipment Maintenance', vendorName: 'BrightSparks Electricals', vendorId: 'VEN-004', type: 'AMC', startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31'), value: 750000, status: 'Expired' },
    { id: 8, contractId: 'CON-2024-006', title: 'Building General Maintenance', vendorName: 'EverGlow Maintenance', vendorId: 'VEN-008', type: 'AMC', startDate: new Date('2024-05-01'), endDate: new Date('2025-04-30'), value: 1100000, status: 'Active' },
];

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Test data matching the Helpdesk escalation list CSV structure
const HELPDESK_TEST_DATA = [
    {
        category: Category.Technical,
        subcategory: 'Electrical',
        issue: 'Power outage / no power supply',
        priority: Priority.P4,
        ticketType: 'Reactive',
        issueType: 'Client Complaint',
        description: 'Electrical power outage reported in office area',
        title: 'Power Outage - Urgent',
        l0ResponseTime: 60,
        l0ResolutionTime: 240,
        l0Assignee: 'Electrical Team L0',
        l1ResponseTime: 45,
        l1ResolutionTime: 180,
        l1Assignee: 'Senior Electrical Engineer',
        l2ResponseTime: 30,
        l2ResolutionTime: 120,
        l2Assignee: 'Electrical Manager',
        l3ResponseTime: 20,
        l3ResolutionTime: 90,
        l3Assignee: 'Electrical Director',
        l4ResponseTime: 15,
        l4ResolutionTime: 60,
        l4Assignee: 'Operations Manager',
        l5ResponseTime: 10,
        l5ResolutionTime: 30,
        l5Assignee: 'Facility Director',
    },
    {
        category: Category.Technical,
        subcategory: 'HVAC',
        issue: 'AHU / FCU not cooling / heating',
        priority: Priority.P3,
        ticketType: 'Reactive',
        issueType: 'Client Complaint',
        description: 'HVAC system not providing cooling in conference area',
        title: 'HVAC Cooling Failure',
        l0ResponseTime: 90,
        l0ResolutionTime: 300,
        l0Assignee: 'HVAC Team L0',
        l1ResponseTime: 60,
        l1ResolutionTime: 240,
        l1Assignee: 'HVAC Technician',
        l2ResponseTime: 45,
        l2ResolutionTime: 180,
        l2Assignee: 'HVAC Lead',
        l3ResponseTime: 30,
        l3ResolutionTime: 120,
        l3Assignee: 'HVAC Manager',
        l4ResponseTime: 20,
        l4ResolutionTime: 90,
        l4Assignee: 'Technical Manager',
        l5ResponseTime: 15,
        l5ResolutionTime: 60,
        l5Assignee: 'Facility Director',
    },
    {
        category: Category.SoftServices,
        subcategory: 'Housekeeping',
        issue: 'Cleaning not done / delayed',
        priority: Priority.P2,
        ticketType: 'Reactive',
        issueType: 'Observation',
        description: 'Housekeeping cleaning not completed on schedule',
        title: 'Delayed Housekeeping',
        l0ResponseTime: 120,
        l0ResolutionTime: 360,
        l0Assignee: 'Housekeeping Supervisor',
        l1ResponseTime: 90,
        l1ResolutionTime: 300,
        l1Assignee: 'Housekeeping Team Lead',
        l2ResponseTime: 60,
        l2ResolutionTime: 240,
        l2Assignee: 'Housekeeping Manager',
        l3ResponseTime: 45,
        l3ResolutionTime: 180,
        l3Assignee: 'Services Manager',
        l4ResponseTime: 30,
        l4ResolutionTime: 120,
        l4Assignee: 'Operations Manager',
        l5ResponseTime: 20,
        l5ResolutionTime: 90,
        l5Assignee: 'Facility Director',
    },
    {
        category: Category.Security,
        subcategory: 'Access Control',
        issue: 'Card / system access issue',
        priority: Priority.P3,
        ticketType: 'Reactive',
        issueType: 'Client Complaint',
        description: 'Access card not working at building entrance',
        title: 'Access Control Failure',
        l0ResponseTime: 60,
        l0ResolutionTime: 180,
        l0Assignee: 'Security Team L0',
        l1ResponseTime: 45,
        l1ResolutionTime: 150,
        l1Assignee: 'Access Control Technician',
        l2ResponseTime: 30,
        l2ResolutionTime: 120,
        l2Assignee: 'Security Lead',
        l3ResponseTime: 20,
        l3ResolutionTime: 90,
        l3Assignee: 'Security Manager',
        l4ResponseTime: 15,
        l4ResolutionTime: 60,
        l4Assignee: 'Operations Manager',
        l5ResponseTime: 10,
        l5ResolutionTime: 30,
        l5Assignee: 'Facility Director',
    },
    {
        category: Category.Horticulture,
        subcategory: 'Landscaping',
        issue: 'Landscape maintenance required',
        priority: Priority.P4,
        ticketType: 'Proactive',
        issueType: 'Service Request',
        description: 'Landscaping area requires routine maintenance and trimming',
        title: 'Landscape Maintenance',
        l0ResponseTime: 240,
        l0ResolutionTime: 720,
        l0Assignee: 'Landscaping Team',
        l1ResponseTime: 180,
        l1ResolutionTime: 600,
        l1Assignee: 'Landscaping Supervisor',
        l2ResponseTime: 120,
        l2ResolutionTime: 480,
        l2Assignee: 'Landscaping Lead',
        l3ResponseTime: 90,
        l3ResolutionTime: 360,
        l3Assignee: 'Services Manager',
        l4ResponseTime: 60,
        l4ResolutionTime: 240,
        l4Assignee: 'Operations Manager',
        l5ResponseTime: 45,
        l5ResolutionTime: 180,
        l5Assignee: 'Facility Director',
    },
];

const generateMockTicket = (id: number): Ticket => {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const testData = HELPDESK_TEST_DATA[(id - 1) % HELPDESK_TEST_DATA.length];
    const status = getRandom(Object.values(Status));

    return {
        id,
        ticketId: `HD-${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}-${String(id).padStart(4, '0')}`,
        createdBy: getRandom(MOCK_USERS),
        contactEmail: 'tenant@example.com',
        category: testData.category,
        subcategory: testData.subcategory,
        issue: testData.issue,
        status,
        runningTAT: '0d 0h 0m',
        assignedLevel: status === Status.Open ? 'L0' : (status === Status.WIP ? 'L1' : 'L2'),
        technicianName: getRandom(MOCK_TECHNICIANS),
        priority: testData.priority,
        createdAt,
        description: testData.description,
        building: getRandom(MOCK_BUILDINGS),
        title: testData.title,
        ticketType: testData.ticketType,
        issueType: testData.issueType,
        l0ResponseTime: testData.l0ResponseTime,
        l0ResolutionTime: testData.l0ResolutionTime,
        l0Assignee: testData.l0Assignee,
        l1ResponseTime: testData.l1ResponseTime,
        l1ResolutionTime: testData.l1ResolutionTime,
        l1Assignee: testData.l1Assignee,
        l2ResponseTime: testData.l2ResponseTime,
        l2ResolutionTime: testData.l2ResolutionTime,
        l2Assignee: testData.l2Assignee,
        l3ResponseTime: testData.l3ResponseTime,
        l3ResolutionTime: testData.l3ResolutionTime,
        l3Assignee: testData.l3Assignee,
        l4ResponseTime: testData.l4ResponseTime,
        l4ResolutionTime: testData.l4ResolutionTime,
        l4Assignee: testData.l4Assignee,
        l5ResponseTime: testData.l5ResponseTime,
        l5ResolutionTime: testData.l5ResolutionTime,
        l5Assignee: testData.l5Assignee,
        clientEscalation: false,
        tenantEscalation: false,
        rootCauseAnalysis: status === Status.Resolved ? 'Issue identified and resolved.' : undefined,
    };
};

const generateMockAsset = (id: number): Asset => {
    const purchaseDate = new Date(Date.now() - Math.random() * 365 * 5 * 24 * 60 * 60 * 1000);
    const warrantyExpiry = new Date(purchaseDate);
    warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + Math.floor(Math.random() * 3) + 1);

    const category = getRandom(Object.values(AssetCategory));
    const building = getRandom(MOCK_BUILDINGS);
    const floors = ['Ground', '1st Floor', '2nd Floor', '3rd Floor', 'Basement', 'Terrace'];
    const subCategories: { [key: string]: string[] } = {
        [AssetCategory.HVAC]: ['Ventilation', 'Cooling', 'Heating', 'Compressor', 'Pump'],
        [AssetCategory.Electrical]: ['Distribution', 'Lighting', 'Power', 'Transformer', 'Panel'],
        [AssetCategory.Plumbing]: ['Pipe', 'Valve', 'Pump', 'Tank', 'Fixture'],
        [AssetCategory.FireSafety]: ['Alarm', 'Extinguisher', 'Equipment', 'Light', 'System'],
        [AssetCategory.IT]: ['Motor', 'Fan', 'Compressor', 'Pump', 'Unit'],
    };

    const statuses = [AssetStatus.Operational, AssetStatus.Operational, AssetStatus.Operational,
    AssetStatus.InMaintenance, AssetStatus.Breakdown];
    const makes = ['Siemens', 'ABB', 'Schneider', 'Grundfos', 'Trane', 'Carrier', 'Daikin', 'Bharat Heavy', 'Excel'];
    const locations = ['LT Room', 'Mechanical Room', 'Chiller Room', 'Server Room', 'Floor'];

    return {
        id,
        assetId: `AST-${building.substring(0, 3).toUpperCase()}-${String(id).padStart(4, '0')}`,
        campus: 'BSOC',
        building,
        name: `${category} Unit - ${Math.floor(Math.random() * 100)}`,
        category,
        subCategory: getRandom(subCategories[category] || ['General']),
        assetType: getRandom(subCategories[category] || ['Equipment']),
        serviceType: 'Technical',
        status: getRandom(statuses),
        critical: Math.random() > 0.7,
        wing: getRandom(['East', 'West', 'North', 'South']),
        floor: getRandom(floors),
        room: Math.random() > 0.5 ? getRandom(locations) : undefined,
        location: `${building}, ${getRandom(floors)}`,
        quantity: 1,
        make: getRandom(makes),
        model: `Model-${Math.floor(Math.random() * 999)}`,
        serialNumber: `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        capacity: `${Math.floor(Math.random() * 500) + 10}`,
        uom: getRandom(['WATTS', 'HP', 'AMPS', 'GPM', 'TR']),
        maintenancePolicy: 'Schedule planned',
        purchaseDate,
        installDate: new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        lifeOfEquipment: Math.floor(Math.random() * 15) + 10,
        oem: getRandom(makes),
        installedBy: getRandom(makes),
        warrantyApplicable: Math.random() > 0.5,
        warrantyExpiry,
        cost: Math.floor(Math.random() * 500000) + 10000,
        replacementCost: Math.floor(Math.random() * 750000) + 50000,
        remarks: 'Standard equipment',
        lastMaintenanceDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + (Math.random() * 90 + 10) * 24 * 60 * 60 * 1000),
        verificationStatus: Math.random() > 0.5 ? 'Verified' : 'Unverified',
        lastVerified: new Date(),
    };
};

const TASK_TITLES = [
    'Daily UPS Reading Log', 'Morning Generator Check', 'Restroom Cleaning Inspection',
    'Server Room AC Monitoring', 'Perimeter Security Check', 'Fire Extinguisher Pressure Check',
    'Lobby Lighting Inspection', 'Water Pump Reading', 'Pantry Inventory Check'
];

const generateMockTask = (id: number): Task => {
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    return {
        id,
        taskId: `TSK-${String(id).padStart(5, '0')}`,
        title: getRandom(TASK_TITLES),
        description: 'Perform standard daily checklist verification and log readings.',
        category: getRandom(Object.values(Category)),
        assignedTo: getRandom(MOCK_TECHNICIANS),
        status: getRandom(Object.values(TaskStatus)),
        priority: getRandom(Object.values(TaskPriority)),
        dueDate: today,
        location: getRandom(MOCK_BUILDINGS)
    }
}

const INVENTORY_ITEMS = [
    { name: 'LED Tube 18W', category: 'Electrical', unit: 'Pcs', price: 250 },
    { name: 'Ball Valve 1"', category: 'Plumbing', unit: 'Pcs', price: 450 },
    { name: 'Air Filter 20x20', category: 'HVAC', unit: 'Set', price: 1200 },
    { name: 'Door Closer', category: 'Civil', unit: 'Pcs', price: 1500 },
    { name: 'Teflon Tape', category: 'Plumbing', unit: 'Roll', price: 20 },
    { name: 'MCB 32A', category: 'Electrical', unit: 'Pcs', price: 350 },
    { name: 'Paper Towels', category: 'Housekeeping', unit: 'Box', price: 1200 },
    { name: 'Liquid Soap', category: 'Housekeeping', unit: 'Ltr', price: 150 },
];

const generateMockInventory = (id: number): InventoryItem => {
    const itemTemplate = getRandom(INVENTORY_ITEMS);
    const quantity = Math.floor(Math.random() * 100);
    const minLevel = Math.floor(Math.random() * 20) + 5;
    return {
        id,
        itemId: `INV-${String(id).padStart(4, '0')}`,
        name: itemTemplate.name,
        category: itemTemplate.category,
        quantity: quantity,
        unit: itemTemplate.unit,
        minLevel: minLevel,
        unitPrice: itemTemplate.price,
        location: 'Central Store',
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    };
}

const PERMIT_TYPES = ['Hot Work', 'Height Work', 'Electrical', 'Confined Space', 'General'] as const;

const generateMockPermit = (id: number): WorkPermit => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7));
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 8);

    // Ensure first 5 permits are Pending for testing approval workflow
    let status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
    if (id <= 5) {
        status = 'Pending';
    } else {
        status = getRandom(['Pending', 'Approved', 'Active', 'Completed', 'Rejected']);
    }

    return {
        id,
        permitId: `PTW-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
        type: getRandom([...PERMIT_TYPES]),
        description: 'Scheduled maintenance activity requiring safety authorization.',
        vendor: getRandom(MOCK_VENDORS).name,
        location: getRandom(MOCK_BUILDINGS),
        startDate: startDate,
        endDate: endDate,
        status: status,
        approver: 'Safety Officer',
        jsaVerified: true,
    }
}

const generateMockIncident = (id: number): Incident => {
    return {
        id,
        incidentId: `INC-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
        title: getRandom(['Fire Alarm Triggered', 'Water Leakage in Server Room', 'Slip and Fall', 'Unauthorized Access', 'Diesel Spillage']),
        type: getRandom(['Fire', 'Safety', 'Security', 'Technical', 'Environment']),
        severity: getRandom(['Critical', 'Major', 'Minor']),
        location: getRandom(MOCK_BUILDINGS),
        reportedBy: getRandom(MOCK_USERS),
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        status: getRandom(['Open', 'Investigating', 'Closed']),
        description: 'Detailed description of the incident occurrence and initial observations.',
        rca: Math.random() > 0.7 ? 'Investigation complete. Root cause identified as equipment failure.' : undefined
    };
}

const generateMockAudit = (id: number): Audit => {
    const status = getRandom(['Scheduled', 'In Progress', 'Completed'] as const);
    return {
        id,
        auditId: `AUD-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
        title: getRandom(['Monthly Fire Safety Audit', 'Quarterly Hygiene Check', 'Security Protocol Review', 'Electrical Safety Audit']),
        type: getRandom(['Safety', 'Hygiene', 'Security', 'Statutory', 'Process']),
        auditor: 'Internal Quality Team',
        scheduledDate: new Date(Date.now() + (Math.random() * 30 - 15) * 24 * 60 * 60 * 1000),
        status: status,
        score: status === 'Completed' ? Math.floor(Math.random() * 30) + 70 : undefined,
        findingsCount: status === 'Completed' ? Math.floor(Math.random() * 10) : 0
    };
}

const generateMockComplianceItem = (id: number): ComplianceItem => {
    const expiryDate = new Date(Date.now() + (Math.random() * 180 - 30) * 24 * 60 * 60 * 1000);
    const issueDate = new Date(expiryDate);
    issueDate.setFullYear(issueDate.getFullYear() - 1);

    let status: ComplianceItem['status'] = 'Compliant';
    const now = new Date();
    const daysToExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysToExpiry < 0) status = 'Expired';
    else if (daysToExpiry < 60) status = 'Expiring Soon';

    return {
        id,
        complianceId: `CMP-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
        title: getRandom(['Fire NOC', 'Lift License', 'Pollution Control Board Consent', 'Elevator Safety Certificate', 'Waste Disposal Authorization', 'DG Set Approval']),
        authority: getRandom(['Fire Department', 'State Electrical Inspectorate', 'Pollution Control Board', 'Municipal Corporation']),
        licenseNumber: `LIC-${Math.random().toString(36).substring(7).toUpperCase()}`,
        issueDate: issueDate,
        expiryDate: expiryDate,
        status: status,
        renewalDate: new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
}

const generateMockUtilityReading = (id: number): UtilityReading => {
    const utilityType = getRandom(['Electricity', 'Water', 'Diesel'] as const);
    const unit = utilityType === 'Electricity' ? 'kWh' : utilityType === 'Water' ? 'KL' : 'Liters';
    const prev = Math.floor(Math.random() * 10000);
    const current = prev + Math.floor(Math.random() * 500) + 50;
    return {
        id,
        readingId: `MTR-${String(id).padStart(5, '0')}`,
        utilityType,
        meterId: `M-${Math.floor(Math.random() * 1000)}`,
        readingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        previousReading: prev,
        currentReading: current,
        consumption: current - prev,
        unit,
        tenantName: getRandom(MOCK_TENANTS)
    };
}

const generateMockUtilityBill = (id: number): UtilityBill => {
    const status = getRandom(['Generated', 'Sent', 'Paid', 'Overdue'] as const);
    return {
        id,
        billId: `INV-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
        tenantName: getRandom(MOCK_TENANTS),
        billingMonth: getRandom(['January', 'February', 'March', 'April', 'May']),
        amount: Math.floor(Math.random() * 50000) + 5000,
        status,
        dueDate: new Date(Date.now() + (Math.random() * 20 - 5) * 24 * 60 * 60 * 1000),
        utilityType: getRandom(['Electricity', 'Water', 'CAM'] as const)
    }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const generateMockESGData = (): ESGMetric[] => {
    return MONTHS.map((month, index) => {
        const electricity = Math.floor(Math.random() * 5000) + 40000;
        const water = Math.floor(Math.random() * 500) + 2000;
        const waste = Math.floor(Math.random() * 100) + 500;
        const diesel = Math.floor(Math.random() * 500) + 100;
        const carbon = (electricity * 0.85) + (diesel * 2.68);
        return {
            id: index,
            month,
            electricityConsumption: electricity,
            waterConsumption: water,
            wasteGenerated: waste,
            dieselConsumption: diesel,
            carbonFootprint: Math.round(carbon)
        };
    });
}

const generateMockCSAT = (id: number): CSATResponse => {
    const base = Math.random() > 0.25 ? 4 : 3; // skew positive
    const clamp = (n: number) => Math.max(1, Math.min(5, n));
    const rating = clamp(base + (Math.random() > 0.6 ? 1 : 0) - (Math.random() > 0.9 ? 1 : 0));
    const comments = [
        "Great service, very quick.",
        "Technician was polite but arrived late.",
        "Issue resolved satisfactorily.",
        "Excellent response time!",
        "Could be better.",
        "No complaints.",
        "Very professional.",
        "Still facing minor issues."
    ];

    // Slight variations around the overall rating for detailed dimensions
    const overallSatisfaction = rating;
    const serviceQuality = clamp(rating + (Math.random() > 0.7 ? 1 : 0) - (Math.random() > 0.95 ? 1 : 0));
    const responseTime = clamp(rating + (Math.random() > 0.6 ? 1 : 0) - (Math.random() > 0.85 ? 1 : 0));
    const professionalismScore = clamp(rating + (Math.random() > 0.75 ? 1 : 0) - (Math.random() > 0.9 ? 1 : 0));

    return {
        id: `CSAT-${id}`,
        tenantName: getRandom(MOCK_TENANTS),
        tenantPoC: getRandom(MOCK_USERS),
        building: getRandom(MOCK_BUILDINGS),
        ticketId: `HD-${new Date().getFullYear()}-0${Math.ceil(Math.random() * 5)}-00${id}`,
        rating,
        overallSatisfaction,
        serviceQuality,
        responseTime,
        professionalismScore,
        comments: getRandom(comments),
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        category: getRandom(Object.values(Category)),
        technicianName: getRandom(MOCK_TECHNICIANS)
    };
}

const generateMockNPS = (id: number): NPSResponse => {
    // Bias towards Promoters and Passives for realism
    const score = Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 9 : Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 7 : Math.floor(Math.random() * 7);
    const feedback = [
        "Facilities are world class.",
        "Parking is always an issue.",
        "Love the greenery.",
        "Security is too strict sometimes.",
        "Good experience overall.",
        "Cafeteria needs improvement.",
        "Maintenance team is very responsive.",
        "Everything is good."
    ];

    return {
        id: `NPS-${id}`,
        tenantName: getRandom(MOCK_TENANTS),
        score,
        feedback: getRandom(feedback),
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    };
}

const MOCK_TRANSITION_PROJECTS: TransitionProject[] = [
    {
        id: 'HOTO-2024-001',
        name: 'Tower D - Builder Handover',
        type: 'Builder-to-FM',
        status: 'In Progress',
        progress: 65,
        startDate: new Date('2024-04-01'),
        targetDate: new Date('2024-07-31'),
        snagsOpen: 142,
        snagsClosed: 89,
        categories: [
            { name: 'Civil Works', total: 150, completed: 90 },
            { name: 'Electrical Systems', total: 80, completed: 60 },
            { name: 'HVAC', total: 40, completed: 15 },
            { name: 'Fire Safety', total: 60, completed: 45 },
            { name: 'Documentation', total: 20, completed: 5 }
        ],
        snagList: []
    },
    {
        id: 'HOTO-2024-002',
        name: 'Admin Block - Facility Upgrade',
        type: 'FM-to-FM',
        status: 'Planning',
        progress: 15,
        startDate: new Date('2024-06-01'),
        targetDate: new Date('2024-08-15'),
        snagsOpen: 0,
        snagsClosed: 0,
        categories: [
            { name: 'Assets Inventory', total: 200, completed: 30 },
            { name: 'Key Management', total: 50, completed: 0 },
            { name: 'Service Contracts', total: 10, completed: 2 }
        ],
        snagList: []
    },
    {
        id: 'HOTO-2024-003',
        name: 'Food Court - Tenant Handover',
        type: 'Tenant Handover',
        status: 'Delayed',
        progress: 85,
        startDate: new Date('2024-03-01'),
        targetDate: new Date('2024-05-30'),
        snagsOpen: 24,
        snagsClosed: 156,
        categories: [
            { name: 'Interiors', total: 80, completed: 75 },
            { name: 'MEP Connections', total: 40, completed: 38 },
            { name: 'Safety Audit', total: 10, completed: 6 }
        ],
        snagList: []
    }
];

const generateMockAnnouncements = (): Announcement[] => [
    { id: 1, title: 'Scheduled Power Maintenance', content: 'Power backup testing scheduled for this Saturday, 2 PM to 4 PM.', date: new Date(), type: 'Alert', priority: 'High' },
    { id: 2, title: 'Cafeteria Menu Update', content: 'New continental section opening in the main cafeteria starting Monday.', date: new Date(Date.now() - 86400000), type: 'Info', priority: 'Normal' },
    { id: 3, title: 'Fire Drill', content: 'Annual fire evacuation drill planned for next Friday. Attendance mandatory.', date: new Date(Date.now() + 172800000), type: 'Event', priority: 'High' },
];

const generateMockMessages = (): Message[] => [
    { id: 1, sender: 'Facility Manager', subject: 'Re: HVAC Issue', content: 'Dear Tenant, the issue reported has been resolved. Please confirm.', date: new Date(), isRead: false },
    { id: 2, sender: 'Helpdesk', subject: 'Ticket HD-2024-05-01-0023 Update', content: 'Technician is on the way to your location.', date: new Date(Date.now() - 3600000), isRead: true },
    { id: 3, sender: 'Admin Team', subject: 'Parking Allocation', content: 'Your request for additional parking slots has been approved.', date: new Date(Date.now() - 86400000 * 2), isRead: true },
];

const generateMockMeetings = (): Meeting[] => [
    {
        id: 'MTG-001',
        title: 'Monthly Facility Review',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        location: 'Conference Room B',
        organizer: 'Building Manager',
        attendees: ['Google Tenant Rep', 'Amazon Tenant Rep', 'Facility Manager'],
        status: 'Scheduled',
        momPoints: [
            { id: '1', point: 'Review HVAC performance in Block A', actionBy: 'Facility Team', status: 'Open', dueDate: '2024-05-15' },
            { id: '2', point: 'Discuss cafeteria hygiene audit results', actionBy: 'Admin', status: 'Closed', dueDate: '2024-05-10' }
        ]
    },
    {
        id: 'MTG-002',
        title: 'Security Protocol Briefing',
        date: new Date(Date.now() - 86400000 * 3), // 3 days ago
        startTime: '14:00',
        endTime: '15:00',
        location: 'Main Auditorium',
        organizer: 'Security Head',
        attendees: ['All Tenant Reps', 'Security Staff'],
        status: 'Completed',
        momPoints: [
            { id: '1', point: 'Update visitor management system access', actionBy: 'IT Team', status: 'Closed', dueDate: '2024-05-01' },
            { id: '2', point: 'Issue new ID cards for night shift staff', actionBy: 'Security', status: 'Open', dueDate: '2024-05-20' }
        ]
    }
];

export const useMockData = () => {
    const [tickets, setTickets] = useState<Ticket[]>(() =>
        Array.from({ length: 50 }, (_, i) => generateMockTicket(i + 1))
    );

    const [assets, setAssets] = useState<Asset[]>(() => {
        // Load 90 complete BSOC assets with all fields populated
        return bsocAssetsComplete.map((asset, idx) => ({
            ...asset,
            id: idx + 1,
        }));
    });

    const [tasks, setTasks] = useState<Task[]>(() =>
        Array.from({ length: 25 }, (_, i) => generateMockTask(i + 1))
    );

    const [inventory, setInventory] = useState<InventoryItem[]>(() =>
        Array.from({ length: 50 }, (_, i) => generateMockInventory(i + 1))
    );

    const [permits, setPermits] = useState<WorkPermit[]>(() =>
        Array.from({ length: 25 }, (_, i) => generateMockPermit(i + 1))
    );

    const [incidents, setIncidents] = useState<Incident[]>(() =>
        Array.from({ length: 20 }, (_, i) => generateMockIncident(i + 1))
    );

    const [audits, setAudits] = useState<Audit[]>(() =>
        Array.from({ length: 25 }, (_, i) => generateMockAudit(i + 1))
    );

    const [compliances, setCompliances] = useState<ComplianceItem[]>(() =>
        Array.from({ length: 30 }, (_, i) => generateMockComplianceItem(i + 1))
    );

    const [utilityReadings, setUtilityReadings] = useState<UtilityReading[]>(() =>
        Array.from({ length: 40 }, (_, i) => generateMockUtilityReading(i + 1))
    );

    const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(() =>
        Array.from({ length: 35 }, (_, i) => generateMockUtilityBill(i + 1))
    );

    const [esgMetrics, setEsgMetrics] = useState<ESGMetric[]>(() => generateMockESGData());

    const [csatResponses, setCsatResponses] = useState<CSATResponse[]>(() =>
        Array.from({ length: 80 }, (_, i) => generateMockCSAT(i + 1))
    );

    const [npsResponses, setNpsResponses] = useState<NPSResponse[]>(() =>
        Array.from({ length: 60 }, (_, i) => generateMockNPS(i + 1))
    );

    const [transitionProjects, setTransitionProjects] = useState<TransitionProject[]>(MOCK_TRANSITION_PROJECTS);

    const [announcements, setAnnouncements] = useState<Announcement[]>(generateMockAnnouncements());
    const [messages, setMessages] = useState<Message[]>(generateMockMessages());
    const [meetings, setMeetings] = useState<Meeting[]>(generateMockMeetings());

    // Escalation rules are now handled by slaMatrixService
    // No need to fetch from API - using fixed SLA matrix

    const [sites, setSites] = useState<Site[]>(MOCK_SITES);
    const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
    const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);

    useEffect(() => {
        const interval = setInterval(() => {
            setTickets(prevTickets =>
                prevTickets.map(ticket => {
                    if (ticket.status === Status.Closed || ticket.status === Status.Lapsed) {
                        return ticket;
                    }
                    const now = new Date();
                    const diff = now.getTime() - ticket.createdAt.getTime();
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((diff / 1000 / 60) % 60);
                    return { ...ticket, runningTAT: `${days}d ${hours}h ${minutes}m` };
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const addTicket = (newTicketData: Omit<Ticket, 'id' | 'ticketId' | 'createdAt' | 'runningTAT'>): Ticket => {
        const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
        const createdAt = new Date();
        const newTicket: Ticket = {
            ...newTicketData,
            id: newId,
            ticketId: `HD-${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}-${String(newId).padStart(4, '0')}`,
            createdAt: createdAt,
            runningTAT: '0d 0h 0m',
            status: Status.Open,
            assignedLevel: 'L0',
            technicianName: 'Unassigned',
        };
        setTickets(prev => [newTicket, ...prev]);
        return newTicket;
    };

    const addAsset = (newAssetData: Omit<Asset, 'id' | 'assetId' | 'nextMaintenanceDate'>) => {
        const newId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
        const buildingCode = newAssetData.building.substring(0, 3).toUpperCase();
        const newAsset: Asset = {
            ...newAssetData,
            id: newId,
            assetId: `AST-${buildingCode}-${String(newId).padStart(4, '0')}`,
            nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            verificationStatus: 'Unverified'
        };
        setAssets(prev => [newAsset, ...prev]);
    };

    const updateAssetVerification = (assetId: number, status: 'Verified' | 'Missing' | 'Damaged') => {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, verificationStatus: status, lastVerified: new Date() } : a));
    }

    const updateAssetStatus = (assetId: number, newStatus: AssetStatus) => {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: newStatus } : a));
    }

    const addTask = (newTaskData: Omit<Task, 'id' | 'taskId'>): Task => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const newTask: Task = {
            ...newTaskData,
            id: newId,
            taskId: `TSK-${String(newId).padStart(5, '0')}`,
        }
        setTasks(prev => [newTask, ...prev]);
        return newTask;
    }

    const updateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }

    const addSite = (newSiteData: Omit<Site, 'id' | 'buildings'>) => {
        const newId = `SITE-${String(sites.length + 1).padStart(3, '0')}`;
        const newSite: Site = {
            ...newSiteData,
            id: newId,
            buildings: []
        };
        setSites(prev => [newSite, ...prev]);
    }

    const addBuildingToSite = (siteId: string, buildingName: string, floors: number) => {
        const siteIndex = sites.findIndex(s => s.id === siteId);
        if (siteIndex === -1) return;

        const newBuilding: Building = {
            id: `BLD-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            name: buildingName,
            address: 'Main Campus Area',
            totalArea: 200000,
            floors: Array.from({ length: floors }, (_, i) => ({ id: `FL-${i}`, name: i === 0 ? 'Ground' : `${i} Floor`, level: i }))
        };

        const updatedSites = [...sites];
        updatedSites[siteIndex].buildings.push(newBuilding);
        setSites(updatedSites);
    }

    const addVendor = (newVendorData: Omit<Vendor, 'id' | 'vendorId'>) => {
        const newId = vendors.length > 0 ? Math.max(...vendors.map(v => v.id)) + 1 : 1;
        const newVendor: Vendor = {
            ...newVendorData,
            id: newId,
            vendorId: `VEN-${String(newId).padStart(3, '0')}`
        };
        setVendors(prev => [newVendor, ...prev]);
    }

    const addContract = (newContractData: Omit<Contract, 'id' | 'contractId'>) => {
        const newId = contracts.length > 0 ? Math.max(...contracts.map(c => c.id)) + 1 : 1;
        const newContract: Contract = {
            ...newContractData,
            id: newId,
            contractId: `CON-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`
        };
        setContracts(prev => [newContract, ...prev]);
    }

    const addInventoryItem = (newItemData: Omit<InventoryItem, 'id' | 'itemId'>) => {
        const newId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
        const newItem: InventoryItem = {
            ...newItemData,
            id: newId,
            itemId: `INV-${String(newId).padStart(4, '0')}`
        };
        setInventory(prev => [newItem, ...prev]);
    }

    const addWorkPermit = (newPermitData: Omit<WorkPermit, 'id' | 'permitId'>) => {
        const newId = permits.length > 0 ? Math.max(...permits.map(p => p.id)) + 1 : 1;
        const newPermit: WorkPermit = {
            ...newPermitData,
            id: newId,
            permitId: `PTW-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`
        };
        setPermits(prev => [newPermit, ...prev]);
    }

    const addIncident = (newIncidentData: Omit<Incident, 'id' | 'incidentId'>) => {
        const newId = incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1;
        const newIncident: Incident = {
            ...newIncidentData,
            id: newId,
            incidentId: `INC-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`
        };
        setIncidents(prev => [newIncident, ...prev]);
    }

    const addAudit = (newAuditData: Omit<Audit, 'id' | 'auditId'>) => {
        const newId = audits.length > 0 ? Math.max(...audits.map(a => a.id)) + 1 : 1;
        const newAudit: Audit = {
            ...newAuditData,
            id: newId,
            auditId: `AUD-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`,
            findingsCount: 0
        };
        setAudits(prev => [newAudit, ...prev]);
    }

    const addComplianceItem = (newItemData: Omit<ComplianceItem, 'id' | 'complianceId'>) => {
        const newId = compliances.length > 0 ? Math.max(...compliances.map(c => c.id)) + 1 : 1;
        const newItem: ComplianceItem = {
            ...newItemData,
            id: newId,
            complianceId: `CMP-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`
        };
        setCompliances(prev => [newItem, ...prev]);
    }

    const addUtilityReading = (newReadingData: Omit<UtilityReading, 'id' | 'readingId' | 'consumption'>) => {
        const newId = utilityReadings.length > 0 ? Math.max(...utilityReadings.map(r => r.id)) + 1 : 1;
        const consumption = newReadingData.currentReading - newReadingData.previousReading;
        const newReading: UtilityReading = {
            ...newReadingData,
            id: newId,
            readingId: `MTR-${String(newId).padStart(5, '0')}`,
            consumption: consumption > 0 ? consumption : 0
        };
        setUtilityReadings(prev => [newReading, ...prev]);
    }

    const addSnagToProject = (projectId: string, description: string, category: string) => {
        setTransitionProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const newSnag: TransitionSnag = {
                    id: `SN-${Math.floor(Math.random() * 1000)}`,
                    description,
                    status: 'Open',
                    category
                };
                return {
                    ...p,
                    snagsOpen: p.snagsOpen + 1,
                    snagList: [...(p.snagList || []), newSnag]
                };
            }
            return p;
        }));
    }

    const updateProjectProgress = (projectId: string, newProgress: number) => {
        setTransitionProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, progress: newProgress } : p
        ));
    }

    return {
        tickets, setTickets, addTicket,
        assets, setAssets, addAsset, updateAssetVerification, updateAssetStatus,
        sites, addSite, addBuildingToSite,
        tasks, addTask, updateTaskStatus,
        vendors, addVendor,
        contracts, addContract,
        inventory, addInventoryItem,
        permits, addWorkPermit,
        incidents, setIncidents, addIncident,
        audits, addAudit,
        compliances, addComplianceItem,
        utilityReadings, addUtilityReading,
        utilityBills,
        esgMetrics,
        csatResponses,
        setCsatResponses,
        npsResponses,
        setNpsResponses,
        transitionProjects,
        addSnagToProject,
        updateProjectProgress,
        announcements,
        messages,
        meetings
    };
};
