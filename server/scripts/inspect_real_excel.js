const XLSX = require('xlsx');

const EXCEL_PATH = 'C:\\Users\\ankit\\Desktop\\VM-NONCET\\college-predictor\\dataset\\Mumbai_Colleges_Database (1).xlsx';

const wb = XLSX.readFile(EXCEL_PATH);
const sheet = wb.Sheets[wb.SheetNames[0]];

const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log('Columns:', Object.keys(rows[0] || {}));
console.log('Sample row:', rows[1]);
