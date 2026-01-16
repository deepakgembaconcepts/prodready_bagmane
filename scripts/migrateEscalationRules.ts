import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting escalation rules migration...');

    const rulesPath = path.join('/tmp', 'escalation_rules.json');

    if (!fs.existsSync(rulesPath)) {
        console.error(`❌ Escalation rules file not found at ${rulesPath}`);
        process.exit(1);
    }

    const rulesData = fs.readFileSync(rulesPath, 'utf8');
    const rules = JSON.parse(rulesData);

    console.log(`📊 Found ${rules.length} escalation rules to migrate`);

    let imported = 0;
    let skipped = 0;

    for (const rule of rules) {
        try {
            await prisma.escalationRule.create({
                data: {
                    category: rule.category,
                    subCategory: rule.subCategory,
                    issue: rule.issue,
                    priority: rule.priority,
                    l0ResponseTime: rule.l0ResponseTime,
                    l0ResolutionTime: rule.l0ResolutionTime,
                    l1ResponseTime: rule.l1ResponseTime,
                    l1ResolutionTime: rule.l1ResolutionTime,
                    l2ResponseTime: rule.l2ResponseTime,
                    l2ResolutionTime: rule.l2ResolutionTime,
                    l3ResponseTime: rule.l3ResponseTime,
                    l3ResolutionTime: rule.l3ResolutionTime
                }
            });
            imported++;
        } catch (error) {
            // Skip duplicates
            if (error.code === 'P2002') {
                skipped++;
            } else {
                console.error(`Error importing rule:`, error.message);
            }
        }
    }

    console.log(`✅ Migration complete!`);
    console.log(`   Imported: ${imported} rules`);
    console.log(`   Skipped: ${skipped} duplicates`);
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
