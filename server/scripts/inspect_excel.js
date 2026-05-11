const XLSX = require('xlsx');

const EXCEL_PATH = 'C:\\Users\\ankit\\Desktop\\VM-proj2\\VIDYARTHIMITRA_NON-CET\\data\\courses_name(non_cet).xlsx';

const wb = XLSX.readFile(EXCEL_PATH);
const sheet = wb.Sheets[wb.SheetNames[0]];

// Show raw first 5 rows to understand structure
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('\n=== First 5 rows (raw) ===');
for (let i = 0; i < Math.min(5, raw.length); i++) {
  console.log(`Row ${i}:`, raw[i]);
}

// Now parse using row index 1 as header (same as Python header=1)
const rows = XLSX.utils.sheet_to_json(sheet, { range: 1, defval: '' });
console.log('\n=== Column names (using row 1 as header) ===');
console.log(Object.keys(rows[0] || {}));
console.log('\n=== Sample row ===');
console.log(rows[0]);
console.log(rows[1]);
