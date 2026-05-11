const XLSX = require('xlsx');

const EXCEL_PATH = 'C:\\Users\\ankit\\Desktop\\VM-NONCET\\college-predictor\\dataset\\Mumbai_Colleges_Database (1).xlsx';

const wb = XLSX.readFile(EXCEL_PATH);
console.log('Sheets:', wb.SheetNames);

for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (rows.length > 0) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log('Columns:', Object.keys(rows[0]));
    console.log('Sample row:', rows[0]);
  }
}
