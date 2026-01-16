
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const MASTER_DATA_PATH = path.join(ROOT_DIR, 'data', 'masterData.json');

// File Paths
const SITE_MASTER_PATH = path.join(ROOT_DIR, 'Fields needed in each Module', 'Complex info module', 'BTP Site Details.xlsx');
const ASSET_MASTER_PATH = path.join(ROOT_DIR, 'Fields needed in each Module', 'Asset Module', 'BSOC Asset List 26062025 V1.1.csv');
const HELPDESK_MASTER_PATH = path.join(ROOT_DIR, 'Fields needed in each Module', 'Helpdesk Module', 'Helpdesk - Category and Subcategory data on Ticket Creation.csv');

// Helper to read Excel/CSV
const readWorkbook = (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${filePath}`);
        return null;
    }
    return XLSX.readFile(filePath);
};

const parseSites = () => {
    const wb = readWorkbook(SITE_MASTER_PATH);
    if (!wb) return [];

    // Assuming first sheet contains data
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);

    // Transform to application Site format
    // Use map to aggregate by Site -> Buildings -> Floors if needed, 
    // but for now keeping it flat or simple hierarchy based on available columns

    // Simplistic transformation for now
    return rows.map((row, idx) => ({
        id: `site_${idx}`,
        name: row['Site Name'] || row['Campus'] || 'Unknown Site',
        city: row['City'] || 'Bengaluru',
        region: row['Region'] || 'South',
        buildings: [] // Populated if building data is separate rows
    }));
};

// Helper to parse CSV line with quotes
const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
};

const parseAssets = () => {
    if (!fs.existsSync(ASSET_MASTER_PATH)) {
        console.warn(`Warning: File not found: ${ASSET_MASTER_PATH}`);
        return [];
    }

    const content = fs.readFileSync(ASSET_MASTER_PATH, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    // Map headers to indices
    const indices = {
        name: headers.findIndex(h => h.includes('Asset Name')),
        assetId: headers.findIndex(h => h.includes('Parent Asset Code') || h.includes('Asset Code')),
        category: headers.findIndex(h => h.includes('Category')),
        status: headers.findIndex(h => h.includes('Status')),
        cost: headers.findIndex(h => h.includes('Cost') || h.includes('Purchase Price')),
        building: headers.findIndex(h => h.includes('Building')),
        floor: headers.findIndex(h => h.includes('Floor')),
        serial: headers.findIndex(h => h.includes('Serial No')),
        make: headers.findIndex(h => h.includes('Make')),
        model: headers.findIndex(h => h.includes('Model'))
    };

    console.log('DEBUG: CSV Indices:', indices);

    return lines.slice(1).map((line, idx) => {
        const row = parseCSVLine(line);
        if (row.length < 5) return null; // Skip invalid lines

        const getName = (idx) => idx !== -1 ? row[idx] : null;

        // Map Status 'Working' -> 'Operational'
        let status = getName(indices.status) || 'Operational';
        if (status === 'Working') status = 'Operational';

        // Construct Location
        const bldg = getName(indices.building);
        const floor = getName(indices.floor);
        const location = bldg && floor ? `${bldg} - ${floor}` : (bldg || 'Unknown');

        return {
            id: idx + 1,
            assetId: getName(indices.assetId) || `AST-${idx}`,
            name: getName(indices.name) || 'Unknown Asset',
            category: getName(indices.category) || 'General',
            location: location,
            status: status,
            cost: parseFloat(getName(indices.cost)) || 0,
            serialNumber: getName(indices.serial) || 'N/A',
            make: getName(indices.make),
            model: getName(indices.model),
            building: bldg || 'Unknown'
        };
    }).filter(a => a !== null).slice(0, 1000);
};

const parseHelpdesk = () => {
    const wb = readWorkbook(HELPDESK_MASTER_PATH);
    if (!wb) return [];

    const ws = wb.Sheets[wb.SheetNames[0]];
    // The CSV has a title row "Nature of Request / Complaint,,,,", so real headers are on row 2 (index 1)
    const rows = XLSX.utils.sheet_to_json(ws, { range: 1 });

    // Tree structure: Category -> Subcategory -> Issue
    const categories = {};

    rows.forEach(row => {
        const cat = row['Category'];
        const sub = row['Sub Category'] || row['Subcategory'] || row['Su-category'];

        if (cat) {
            if (!categories[cat]) categories[cat] = new Set();
            if (sub) categories[cat].add(sub);
        }
    });

    return Object.keys(categories).map(cat => ({
        name: cat,
        subcategories: Array.from(categories[cat])
    }));
};

const main = () => {
    console.log('Initializing Master Data...');

    const sites = parseSites();
    console.log(`Parsed ${sites.length} sites.`);

    const assets = parseAssets();
    console.log(`Parsed ${assets.length} assets.`);

    const helpdesk = parseHelpdesk();
    console.log(`Parsed ${helpdesk.length} helpdesk categories.`);

    const masterData = {
        sites,
        assets,
        helpdesk,
        lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(MASTER_DATA_PATH, JSON.stringify(masterData, null, 2));
    console.log(`Master data written to ${MASTER_DATA_PATH}`);
};

main();
