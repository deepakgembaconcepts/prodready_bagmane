#!/usr/bin/env node

/**
 * Initialize Escalation Data
 * Reads escalation CSV file and generates JSON for the server
 * Run this before starting the development server
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the CSV file
const csvPath = path.join(__dirname, '../Fields needed in each Module/Helpdesk Module/Helpdesk - Category and Subcategory data on Ticket Creation.csv');
const outputPath = path.join('/tmp', 'escalation_rules.json');

console.log('📋 Initializing Escalation Rules Data...');
console.log(`📂 Reading CSV from: ${csvPath}`);

try {
  // Read CSV file
  let csvContent = fs.readFileSync(csvPath, 'utf8');

  // Remove BOM if present
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.slice(1);
  }

  // Parse CSV manually
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    console.error('❌ CSV file is empty or has no data');
    process.exit(1);
  }

  // Skip comment rows (rows that start with "Nature of Request" or similar)
  let dataStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Category')) {
      dataStartIndex = i;
      break;
    }
  }

  if (dataStartIndex >= lines.length - 1) {
    console.error('❌ Could not find header row in CSV');
    process.exit(1);
  }

  // Parse header (accounting for spaces in column names)
  const headerLine = lines[dataStartIndex];
  const headers = headerLine.split(',').map(h => h.trim());

  // Create a map of header index to column name
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  console.log(`📝 Headers found: ${headers.join(', ')}`);

  // Transform data to match EscalationRule interface
  const escalationRules = [];

  // Check if this is the Helpdesk CSV
  const subCategoryKey = headers.find(h => h === 'Su-category' || h === 'Su-Category' || h === 'Sub Category');
  const isHelpDeskCSV = headers.includes('Category') && subCategoryKey && headers.includes('Issue');

  console.log(`🔍 Detected CSV type: ${isHelpDeskCSV ? 'Helpdesk' : 'Escalation'}`);
  console.log(`📍 Starting data parsing from line ${dataStartIndex + 1}...`);

  for (let i = dataStartIndex + 1; i < lines.length; i++) {
    try {
      const line = lines[i];
      if (!line.trim()) continue;

      // Split CSV respecting quoted values
      const values = parseCSVLine(line);

      const category = (values[headerMap['Category']] || '').trim();
      const subCategory = (values[headerMap[subCategoryKey]] || '').trim();
      const issue = (values[headerMap['Issue']] || '').trim();

      if (!category || !subCategory || !issue) {
        console.log(`⏭️  Skipping row ${i + 1} (missing category/subcategory/issue)`);
        continue;
      }

      const rule = {
        category: category,
        subCategory: subCategory,
        issue: issue,
        priority: (values[headerMap['Priority']] || 'P3').trim(),
        l0ResponseTime: parseInt(values[headerMap['L0 Response Time']]) || 30,
        l0ResolutionTime: parseInt(values[headerMap['L0 ResoultionTime']]) || 1440,
        l1ResponseTime: parseInt(values[headerMap['L1 Response Time']]) || 120,
        l1ResolutionTime: parseInt(values[headerMap['L1 ResoultionTime']]) || 2880,
        l2ResponseTime: parseInt(values[headerMap['L2 Response Time']]) || 240,
        l2ResolutionTime: parseInt(values[headerMap['L2 ResoultionTime']]) || 4320,
        l3ResponseTime: parseInt(values[headerMap['L3 Response Time']]) || 720,
        l3ResolutionTime: parseInt(values[headerMap['L3 ResoultionTime']]) || 5160,
      };

      escalationRules.push(rule);
      console.log(`✅ Parsed row ${i + 1}: ${category} > ${subCategory} > ${issue}`);
    } catch (err) {
      console.warn(`⚠️  Error parsing row ${i + 1}:`, err.message);
    }
  }

  if (escalationRules.length === 0) {
    console.error('❌ No valid rules were parsed from CSV');
    process.exit(1);
  }

  // Write JSON file as backup
  fs.writeFileSync(outputPath, JSON.stringify(escalationRules, null, 2));
  console.log(`💾 Saved backup to: ${outputPath}`);



  // Seed Database
  console.log('🔄 Seeding database...');

  try {
    // Clear existing rules
    await prisma.escalationRule.deleteMany();
    console.log('🗑️  Cleared existing rules from DB');

    // Batch insert
    // Note: createMany is not supported in SQLite, so we iterate
    // If using Postgres, createMany is more efficient
    let count = 0;
    for (const rule of escalationRules) {
      await prisma.escalationRule.create({ data: rule });
      count++;
      if (count % 10 === 0) process.stdout.write('.');
    }
    console.log('');

    console.log(`✅ Successfully seeded ${count} rules into database!`);

  } catch (dbError) {
    console.error('❌ Database seeding failed:', dbError);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  // Display sample rules
  if (escalationRules.length > 0) {
    console.log('\n📋 Sample Rules:');
    escalationRules.slice(0, 3).forEach((rule, i) => {
      console.log(`  ${i + 1}. ${rule.ticketType} - ${rule.category} - ${rule.priority}`);
    });
  }

  process.exit(0);
} catch (error) {
  console.error('❌ Error initializing escalation data:', error.message);
  process.exit(1);
}

/**
 * Parse CSV line respecting quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current);
  return values;
}
