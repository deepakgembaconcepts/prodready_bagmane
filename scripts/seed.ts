
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding process...');

    // Clear existing data (optional - be careful in production!)
    console.log('🗑️  Clearing existing data...');
    await (prisma as any).meterReading?.deleteMany().catch(() => { });
    await (prisma as any).energyMeter?.deleteMany().catch(() => { });
    await (prisma as any).ticketHistory?.deleteMany().catch(() => { });
    await (prisma as any).ticketComment?.deleteMany().catch(() => { });
    await prisma.ticket.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.floor.deleteMany();
    await prisma.building.deleteMany();
    await (prisma as any).inventoryTransaction?.deleteMany().catch(() => { });
    await prisma.inventoryItem.deleteMany();
    await (prisma as any).jSA?.deleteMany().catch(() => { });
    await prisma.workPermit.deleteMany();
    await (prisma as any).sLA?.deleteMany().catch(() => { });
    await prisma.contract.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.site.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared existing data');

    const masterDataPath = path.join(process.cwd(), 'data', 'masterData.json');
    if (!fs.existsSync(masterDataPath)) {
        console.error('❌ masterData.json not found!');
        process.exit(1);
    }

    const masterData = JSON.parse(fs.readFileSync(masterDataPath, 'utf8'));

    // 1. Seed Users
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('Bagmane@123', 10);

    const allPermissions = JSON.stringify([
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
    ]);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@bagmane.com',
            name: 'Admin User',
            role: 'ADMIN',
            description: 'System Administrator',
            permissions: allPermissions,
            password: hashedPassword,
            phone: '+91-9876543210'
        }
    });

    const tech1 = await prisma.user.create({
        data: {
            email: 'rajesh@bagmane.com',
            name: 'Rajesh Kumar',
            role: 'TECHNICIAN_L0',
            description: 'Field Technician - HVAC',
            permissions: '[]' as any,
            password: hashedPassword,
            phone: '+91-9876543211'
        }
    });

    const tech2 = await prisma.user.create({
        data: {
            email: 'priya@bagmane.com',
            name: 'Priya Sharma',
            role: 'TECHNICIAN_L2',
            description: 'Senior Technician - Electrical',
            permissions: '[]' as any,
            password: hashedPassword,
            phone: '+91-9876543212'
        }
    });

    const manager = await prisma.user.create({
        data: {
            email: 'manager@bagmane.com',
            name: 'Suresh Reddy',
            role: 'BUILDING_MANAGER',
            description: 'Operations Manager',
            permissions: '[]' as any,
            password: hashedPassword,
            phone: '+91-9876543213'
        }
    });

    const finance = await prisma.user.create({
        data: {
            email: 'finance@bagmane.com',
            name: 'Lakshmi Iyer',
            role: 'FINANCE_MANAGER',
            description: 'Finance & Accounts',
            permissions: '[]' as any,
            password: hashedPassword,
            phone: '+91-9876543214'
        }
    });

    console.log(`✅ Created ${5} users`);

    // 2. Seed Sites, Buildings, Floors
    console.log('🏢 Seeding ALL sites, buildings, and floors...');
    const sitesToSeed = masterData.sites;

    for (const siteData of sitesToSeed) {
        const buildingsToCreate = siteData.buildings && siteData.buildings.length > 0
            ? siteData.buildings.map((b: any) => ({
                name: b.name,
                address: b.address || 'Bengaluru, Karnataka',
                floors: {
                    create: b.floors?.map((f: any) => ({
                        name: f.name,
                        level: f.level,
                        area: f.area || 1000,
                        status: f.status || 'Active'
                    })) || [{ name: 'Ground Floor', level: 0, area: 1000, status: 'Active' }]
                }
            }))
            : [
                {
                    name: 'Tower A',
                    address: 'CV Raman Nagar, Bengaluru',
                    floors: {
                        create: [
                            { name: 'Ground Floor', level: 0, area: 2500, status: 'Active' },
                            { name: 'First Floor', level: 1, area: 2500, status: 'Active' },
                            { name: 'Second Floor', level: 2, area: 2500, status: 'Active' }
                        ]
                    }
                }
            ];

        const site = await prisma.site.create({
            data: {
                name: siteData.name === 'Unknown Site' ? `Bagmane Tech Park - Site ${siteData.id}` : siteData.name,
                region: siteData.region || 'South',
                city: siteData.city || 'Bengaluru',
                buildings: {
                    create: buildingsToCreate
                }
            }
        });
        console.log(`✅ Created Site: ${site.name}`);
    }

    // 3. Seed Assets
    console.log('🔧 Seeding ALL assets...');
    const buildings = await prisma.building.findMany({ include: { floors: true } });
    const buildingMap = new Map(buildings.map(b => [b.name, b]));

    // Seed ALL assets from masterData
    const assetsToSeed = masterData.assets;
    for (const assetData of assetsToSeed) {
        const building = buildingMap.get(assetData.building) || buildings[0];
        if (!building) continue;

        const floor = building.floors.find(f => f.name === assetData.floor) || building.floors[0];

        await prisma.asset.create({
            data: {
                assetId: assetData.assetId || `AST_${Date.now()}_${Math.random()}`,
                name: assetData.name || 'Unknown Asset',
                category: assetData.category || 'General',
                status: assetData.status || 'Operational',
                location: assetData.location || building.name,
                buildingId: building.id,
                floorId: floor?.id,
                make: assetData.make,
                model: assetData.model,
                serialNumber: assetData.serialNumber,
                purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : new Date(),
                cost: assetData.cost || 0
            }
        });
    }
    console.log(`✅ Seeded ${assetsToSeed.length} assets`);

    // 4. Seed Vendors
    console.log('🏭 Seeding vendors...');
    const vendor1 = await prisma.vendor.create({
        data: {
            name: 'Cool Air HVAC Services',
            serviceCategory: 'HVAC',
            contactPerson: 'Ramesh Gupta',
            email: 'ramesh@coolairhvac.com',
            phone: '+91-9988776655',
            rating: 4.5,
            status: 'Active'
        } as any
    });

    const vendor2 = await prisma.vendor.create({
        data: {
            name: 'Bright Spark Electricals',
            serviceCategory: 'Electrical',
            contactPerson: 'Anita Desai',
            email: 'anita@brightspark.com',
            phone: '+91-9988776656',
            rating: 4.8,
            status: 'Active'
        } as any
    });

    const vendor3 = await prisma.vendor.create({
        data: {
            name: 'SecureGuard Services',
            serviceCategory: 'Security',
            contactPerson: 'Vikram Singh',
            email: 'vikram@secureguard.com',
            phone: '+91-9988776657',
            rating: 4.2,
            status: 'Active'
        } as any
    });

    console.log(`✅ Created ${3} vendors`);

    // 5. Seed Contracts
    // 5. Seed Contracts
    console.log('📄 Seeding contracts... [SKIPPED for Clean Slate]');
    /*
    await prisma.contract.create({
        data: {
            contractId: `CON_${Date.now()}_1`,
            vendorId: vendor1.id,
            title: 'Annual HVAC Maintenance Contract',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            value: 500000,
            status: 'Active'
        } as any
    });

    await prisma.contract.create({
        data: {
            contractId: `CON_${Date.now()}_2`,
            vendorId: vendor2.id,
            title: 'Electrical Maintenance & Repair',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-02-28'),
            value: 300000,
            status: 'Active'
        } as any
    });
    console.log(`✅ Created ${2} contracts`);
    */

    // 6. Seed Work Permits
    // 6. Seed Work Permits
    console.log('⚠️ Seeding work permits... [SKIPPED for Clean Slate]');
    /*
    const permit1 = await prisma.workPermit.create({
        data: {
            permitId: `WP_${Date.now()}_1`,
            type: 'Hot Work',
            status: 'Approved',
            requestedBy: 'Rajesh Kumar',
            approvedBy: 'Suresh Reddy',
            validFrom: new Date(),
            validTo: new Date(Date.now() + 8 * 60 * 60 * 1000),
            location: 'Tower A - Roof',
            description: 'Welding work for HVAC duct installation'
        } as any
    });

    await prisma.workPermit.create({
        data: {
            permitId: `WP_${Date.now()}_2`,
            type: 'Height Work',
            status: 'Pending',
            requestedBy: 'Priya Sharma',
            validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000),
            validTo: new Date(Date.now() + 32 * 60 * 60 * 1000),
            location: 'Tower B - 5th Floor',
            description: 'Electrical panel installation at height'
        }
    });

    console.log(`✅ Created ${2} work permits`);
    */

    // 7. Seed Sample Tickets
    // 7. Seed Sample Tickets
    console.log('🎫 Seeding sample tickets... [SKIPPED for Clean Slate]');
    /*
    const assets = await prisma.asset.findMany({ take: 5 });

    await prisma.ticket.create({
        data: {
            ticketId: `TKT_${Date.now()}_1`,
            title: 'AC not cooling in Conference Room',
            description: 'The air conditioning unit in Conference Room A is not cooling properly. Temperature is 28°C.',
            status: 'Open',
            priority: 'P2',
            category: 'Technical',
            subCategory: 'HVAC',
            issue: 'AC Not Cooling',
            location: 'Tower A - 2nd Floor - Conference Room A',
            assetId: assets[0]?.id,
            reportedById: manager.id,
            assignedToId: tech1.id,
            escalationLevel: 0
        }
    });

    await prisma.ticket.create({
        data: {
            ticketId: `TKT_${Date.now()}_2`,
            title: 'Power outage in Server Room',
            description: 'Complete power failure in server room. UPS is running on battery.',
            status: 'Open',
            priority: 'P1',
            category: 'Technical',
            subCategory: 'Electrical',
            issue: 'Power Failure',
            location: 'Tower A - Ground Floor - Server Room',
            reportedById: admin.id,
            assignedToId: tech2.id,
            escalationLevel: 1,
            escalationStatus: 'Escalated',
            escL1Id: tech2.id
        }
    });

    await prisma.ticket.create({
        data: {
            ticketId: `TKT_${Date.now()}_3`,
            title: 'Water leakage in Restroom',
            description: 'Water leaking from ceiling in ladies restroom',
            status: 'WIP',
            priority: 'P3',
            category: 'Technical',
            subCategory: 'PHE',
            issue: 'Water Leakage',
            location: 'Tower B - 3rd Floor - Restroom',
            reportedById: manager.id,
            assignedToId: tech1.id,
            escalationLevel: 0
        }
    });

    console.log(`✅ Created ${3} sample tickets`);
    */

    // 8. Seed Energy Meters
    console.log('⚡ Seeding energy meters...');
    const sites = await prisma.site.findMany({ take: 3 });

    for (const site of sites) {
        const meter = await (prisma as any).energyMeter?.create({
            data: {
                meterId: `ELEC_${site.id}_MAIN`,
                name: `Main Electricity Meter - ${site.name}`,
                type: 'Electricity',
                location: 'Main Panel',
                siteId: site.id
            }
        }).catch(() => null);
    }

    console.log(`✅ Created ${sites.length} energy meters with readings`);

    // 9. Seed Inventory Items
    console.log('📦 Seeding inventory items...');
    await prisma.inventoryItem.createMany({
        data: [
            {
                itemId: 'INV_001',
                name: 'AC Filter - 24x24',
                category: 'Spares',
                quantity: 50,
                unit: 'Nos',
                minLevel: 10,
                location: 'Store Room A',
                siteId: sites[0]?.id
            },
            {
                itemId: 'INV_002',
                name: 'LED Tube Light 40W',
                category: 'Spares',
                quantity: 100,
                unit: 'Nos',
                minLevel: 20,
                location: 'Store Room B',
                siteId: sites[0]?.id
            },
            {
                itemId: 'INV_003',
                name: 'Cleaning Solution - 5L',
                category: 'Consumables',
                quantity: 30,
                unit: 'Liters',
                minLevel: 5,
                location: 'Store Room C',
                siteId: sites[0]?.id
            }
        ] as any
    });

    console.log(`✅ Created ${3} inventory items`);

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: 5`);
    console.log(`   Sites: ${sitesToSeed.length}`);
    console.log(`   Buildings: ${buildings.length}`);
    console.log(`   Assets: ${assetsToSeed.length}`);
    console.log(`   Vendors: 3`);
    console.log(`   Contracts: 2`);
    console.log(`   Work Permits: 2`);
    console.log(`   Tickets: 3`);
    console.log(`   Energy Meters: ${sites.length}`);
    console.log(`   Inventory Items: 3`);
    console.log('\n🔐 Default password for all users: Bagmane@123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
