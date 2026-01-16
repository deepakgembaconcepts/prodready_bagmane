
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const sites = await prisma.site.count();
    const buildings = await prisma.building.count();
    const assets = await prisma.asset.count();
    const users = await prisma.user.count();

    console.log('--- DB Stats ---');
    console.log(`Sites: ${sites}`);
    console.log(`Buildings: ${buildings}`);
    console.log(`Assets: ${assets}`);
    console.log(`Users: ${users}`);

    if (assets > 0) {
        const firstAsset = await prisma.asset.findFirst({ include: { building: true } });
        console.log('First Asset:', JSON.stringify(firstAsset, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
