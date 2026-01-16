
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const ASSET_MASTER_PATH = path.join(ROOT_DIR, 'Fields needed in each Module', 'Asset Module', 'BSOC Asset List 26062025 V1.1.xlsx');

const inspect = () => {
    try {
        const wb = XLSX.readFile(ASSET_MASTER_PATH);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Get array of arrays

        if (rows.length > 0) {
            console.log('Headers found in Asset Excel:');
            console.log(rows[0]);

            // Also check second row to see data sample for context
            if (rows.length > 1) {
                console.log('Sample Data (Row 2):');
                console.log(rows[1]);
            }
        } else {
            console.log('No rows found in Excel file.');
        }
    } catch (error) {
        console.error('Error reading Excel:', error.message);
    }
};

inspect();
