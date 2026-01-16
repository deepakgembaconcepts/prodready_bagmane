
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const userCount = await prisma.user.count();
    const assetCount = await prisma.asset.count();
    const siteCount = await prisma.site.count();
    const ticketCount = await prisma.ticket.count();
    const contractCount = await prisma.contract.count();

    console.log(`--- System Status Check ---`);
    console.log(`Users: ${userCount}`);
    console.log(`Assets: ${assetCount}`);
    console.log(`Sites: ${siteCount}`);
    console.log(`Tickets (Transactional): ${ticketCount}`);
    console.log(`Contracts (Transactional): ${ticketCount}`);
    console.log(`---------------------------`);
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
