/**
 * merge_courses.js
 * Reads courses from the courses_name(non_cet).xlsx Excel file
 * and merges them into colleges.json by matching college_name.
 *
 * Run: node scripts/merge_courses.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'C:\\Users\\ankit\\Desktop\\VM-proj2\\VIDYARTHIMITRA_NON-CET\\data\\courses_name(non_cet).xlsx';
const COLLEGES_JSON_PATH = path.join(__dirname, '../data/colleges.json');

// ─── Load Excel ────────────────────────────────────────────────────────────────
console.log('📖 Reading Excel file...');
const wb = XLSX.readFile(EXCEL_PATH, { sheetRows: 0 });
const sheet = wb.Sheets[wb.SheetNames[0]];

// The Python loader used header=1 (0-indexed), meaning row index 1 is the header
// Use row index 1 as header (row 0 is blank, row 1 is the actual header)
const rows = XLSX.utils.sheet_to_json(sheet, { range: 1, defval: '' });

console.log(`   Found ${rows.length} rows in Excel`);

// ─── Build a map: collegeName → [courses] ─────────────────────────────────────
const courseMap = {};

for (const row of rows) {
  const collegeName = (row['College Name'] || '').toString().trim();
  const courseName  = (row['Course'] || '').toString().trim();
  const district    = (row['District'] || '').toString().trim();

  if (!collegeName || !courseName) continue;

  if (!courseMap[collegeName]) courseMap[collegeName] = [];

  courseMap[collegeName].push({
    course_name: courseName,
    specialization: null,
    stream_category: district || null,
    admission_type: null,
    duration_years: null,
    degree_type: courseName,
    total_seats: null,
    tuition_fees_per_year: null,
  });
}

console.log(`\n✅ Parsed courses for ${Object.keys(courseMap).length} unique colleges from Excel`);

// ─── Load colleges.json ───────────────────────────────────────────────────────
console.log('\n📂 Loading colleges.json...');
const colleges = JSON.parse(fs.readFileSync(COLLEGES_JSON_PATH, 'utf-8'));
console.log(`   Total colleges in JSON: ${colleges.length}`);

// ─── Fuzzy match helper ───────────────────────────────────────────────────────
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function bestMatch(excelName, collegeList) {
  const normExcel = normalize(excelName);
  for (const col of collegeList) {
    if (normalize(col.college_name) === normExcel) return col;
  }
  // Partial match: one contains the other
  for (const col of collegeList) {
    const normCol = normalize(col.college_name);
    if (normCol.includes(normExcel) || normExcel.includes(normCol)) return col;
  }
  return null;
}

// ─── Merge ────────────────────────────────────────────────────────────────────
let updatedCount = 0;
let skippedCount = 0;
let alreadyHasCourses = 0;

for (const [excelCollegeName, courses] of Object.entries(courseMap)) {
  const matched = bestMatch(excelCollegeName, colleges);

  if (!matched) {
    skippedCount++;
    continue;
  }

  // Only merge if courses array is currently empty
  if (matched.courses && matched.courses.length > 0) {
    alreadyHasCourses++;
    continue;
  }

  matched.courses = courses;
  updatedCount++;
}

// ─── Save ─────────────────────────────────────────────────────────────────────
console.log('\n💾 Writing updated colleges.json...');
fs.writeFileSync(COLLEGES_JSON_PATH, JSON.stringify(colleges, null, 2), 'utf-8');

console.log('\n═══════════════════════════════════════');
console.log('📊 Merge Summary');
console.log('═══════════════════════════════════════');
console.log(`✅ Updated colleges with courses:  ${updatedCount}`);
console.log(`⏭  Already had courses (skipped): ${alreadyHasCourses}`);
console.log(`❌ No match found in JSON:         ${skippedCount}`);
console.log('═══════════════════════════════════════');
console.log('\nDone! colleges.json has been updated.\n');
