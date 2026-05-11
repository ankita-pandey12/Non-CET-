const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'C:\\Users\\ankit\\Desktop\\VM-NONCET\\college-predictor\\dataset\\Mumbai_Colleges_Database (1).xlsx';
const JSON_PATH = path.join(__dirname, '../data/colleges.json');

console.log('📖 Reading Excel dataset...');
const wb = XLSX.readFile(EXCEL_PATH);

// 1. Read Courses
const courseRows = XLSX.utils.sheet_to_json(wb.Sheets['Courses'], { defval: '' });
const coursesByCollege = {};
courseRows.forEach(r => {
  const cName = r.college_name?.toString().trim();
  if (!cName) return;
  if (!coursesByCollege[cName]) coursesByCollege[cName] = [];
  
  // Exclude empty courses
  if (r.course_name?.toString().trim() !== '') {
    coursesByCollege[cName].push({
      course_name: r.course_name?.toString().trim(),
      specialization: r.specialization?.toString().trim() || null,
      stream_category: r.stream_category?.toString().trim() || null,
      admission_type: r.admission_type?.toString().trim() || null,
      duration_years: parseInt(r.duration_years) || null,
      degree_type: r.degree_type?.toString().trim() || null,
      total_seats: parseInt(r.total_seats) || null,
      tuition_fees_per_year: r.tuition_fees_per_year?.toString() || null
    });
  }
});

// 2. Read Cutoffs
const cutoffRows = XLSX.utils.sheet_to_json(wb.Sheets['Cutoffs'], { defval: '' });
const cutoffsByCollege = {};
cutoffRows.forEach(r => {
  const cName = r.college_name?.toString().trim();
  if (!cName) return;
  if (!cutoffsByCollege[cName]) cutoffsByCollege[cName] = [];
  
  if (r.course_name?.toString().trim() !== '') {
    cutoffsByCollege[cName].push({
      course_name: r.course_name?.toString().trim(),
      specialization: r.specialization?.toString().trim() || null,
      academic_year: r.academic_year?.toString().trim() || null,
      category: r.category?.toString().trim() || null,
      domicile: r.domicile?.toString().trim() || null,
      round_number: r.round_number?.toString().trim() || null,
      cutoff_type: r.cutoff_type?.toString().trim() || null,
      cutoff_value: parseFloat(r.cutoff_value) || null
    });
  }
});

// 3. Read Seats
const seatRows = XLSX.utils.sheet_to_json(wb.Sheets['Seat Matrix'], { defval: '' });
const seatsByCollege = {};
seatRows.forEach(r => {
  const cName = r.college_name?.toString().trim();
  if (!cName) return;
  if (!seatsByCollege[cName]) seatsByCollege[cName] = [];
  
  if (r.course_name?.toString().trim() !== '') {
    seatsByCollege[cName].push({
      course_name: r.course_name?.toString().trim(),
      specialization: r.specialization?.toString().trim() || null,
      academic_year: r.academic_year?.toString().trim() || null,
      category: r.category?.toString().trim() || null,
      seats_available: parseInt(r.seats_available) || null
    });
  }
});

// 4. Update JSON
console.log('📂 Loading colleges.json...');
const colleges = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

let updatedCourses = 0;
let updatedCutoffs = 0;
let updatedSeats = 0;

colleges.forEach(col => {
  const name = col.college_name;
  
  // Overwrite the fake courses from the previous bad merge attempt, except for Ramdeobaba which we manually verified
  if (name === "Shri Ramdeobaba College of Engineering and Management") {
    // Keep manually added courses
    return;
  }

  // Clear existing
  col.courses = [];
  col.cutoffs = [];
  col.seats = [];
  
  // Merge new
  if (coursesByCollege[name]) {
    col.courses = coursesByCollege[name];
    updatedCourses++;
  }
  if (cutoffsByCollege[name]) {
    col.cutoffs = cutoffsByCollege[name];
    updatedCutoffs++;
  }
  if (seatsByCollege[name]) {
    col.seats = seatsByCollege[name];
    updatedSeats++;
  }
});

console.log('💾 Writing updated colleges.json...');
fs.writeFileSync(JSON_PATH, JSON.stringify(colleges, null, 2), 'utf-8');

console.log('✅ Done! Summary:');
console.log(`- Colleges updated with courses: ${updatedCourses}`);
console.log(`- Colleges updated with cutoffs: ${updatedCutoffs}`);
console.log(`- Colleges updated with seats:   ${updatedSeats}`);
