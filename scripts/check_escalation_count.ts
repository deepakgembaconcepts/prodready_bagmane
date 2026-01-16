
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.escalationRule.count();
    console.log(`Escalation Rules in DB: ${count}`);
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
