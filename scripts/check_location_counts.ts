
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const siteCount = await prisma.site.count();
    const buildingCount = await prisma.building.count();
    const floorCount = await prisma.floor.count();

    console.log(`Sites: ${siteCount}`);
    console.log(`Buildings: ${buildingCount}`);
    console.log(`Floors: ${floorCount}`);
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
