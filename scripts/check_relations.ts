
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkRelations() {
    const buildingsWithSite = await prisma.building.count({
        where: {
            siteId: { not: undefined } // Check if siteId is populated
        }
    });

    const buildingsTotal = await prisma.building.count();

    console.log(`Buildings Linked to Sites: ${buildingsWithSite} / ${buildingsTotal}`);

    // Check sample
    const sample = await prisma.building.findFirst({
        include: { site: true, floors: true }
    });
    console.log('Sample Building:', JSON.stringify(sample, null, 2));
}

checkRelations()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
