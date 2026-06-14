const mongoose = require('mongoose');

// ── Sub-schemas (mirrors the JSON data structure from colleges.json) ──────────

const courseDetailSchema = new mongoose.Schema({
  course_name:        { type: String, default: '' },
  specialization:     { type: String, default: '' },
  stream_category:    { type: String, default: '' },
  admission_type:     { type: String, default: '' },
  duration_years:     { type: Number, default: null },
  degree_type:        { type: String, default: '' },     // UG / PG / Diploma / Ph.D
  total_seats:        { type: Number, default: null },
  tuition_fees_per_year: { type: Number, default: null },
}, { _id: false });

const cutoffSchema = new mongoose.Schema({
  course_name:    { type: String, default: '' },
  specialization: { type: String, default: '' },
  academic_year:  { type: String, default: '' },
  category:       { type: String, default: '' },
  domicile:       { type: String, default: '' },
  round_number:   { type: mongoose.Schema.Types.Mixed, default: null },
  cutoff_type:    { type: String, default: '' },
  cutoff_value:   { type: mongoose.Schema.Types.Mixed, default: null },
}, { _id: false });

// ── Main College Schema ───────────────────────────────────────────────────────

const collegeSchema = new mongoose.Schema(
  {
    // ── 1. Basic Identification ──────────────────────────────────
    college_name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    college_short_name: { type: String, trim: true, default: '' },
    established_year:   { type: Number, default: null },
    logo:               { type: String, default: '' },

    // ── 2. Affiliation & Type ────────────────────────────────────
    university_name: {
      type: String,
      required: [true, 'Affiliated university is required'],
      trim: true,
    },
    college_type: {
      type: String,
      default: '',
    },
    minority_status: {
      type: String,
      default: 'Non-minority',
    },
    minority_community: { type: String, trim: true, default: '' },

    // ── 3. Location ──────────────────────────────────────────────
    address:  { type: String, trim: true, default: '' },
    city:     { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    pin_code: { type: String, trim: true, default: '' },

    // ── 4. Contact ───────────────────────────────────────────────
    email:   { type: String, trim: true, lowercase: true, default: '' },
    website: { type: String, trim: true, default: '' },
    phone:   { type: String, trim: true, default: '' },

    // ── 5. Accreditation ─────────────────────────────────────────
    naac_grade: { type: String, default: '' },
    naac_cgpa:  { type: Number, default: null },
    regulatory_approvals: { type: [String], default: [] },

    // ── 6. Courses & Cutoffs (rich data from JSON / admin entry) ──
    courses:  { type: [courseDetailSchema], default: [] },
    cutoffs:  { type: [cutoffSchema], default: [] },
    seats:    { type: mongoose.Schema.Types.Mixed, default: null },
    remarks:  { type: String, default: '' },

    // ── 7. Streams (admin-form tags) ─────────────────────────────
    streams: { type: [String], default: [] },

    // ── Meta ──────────────────────────────────────────────────────
    is_active: { type: Boolean, default: true },
    added_by:  { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    source:    { type: String, enum: ['json_seed', 'admin_form'], default: 'admin_form' },
    views:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Field indexes for filter queries (text index created manually via seed script)
collegeSchema.index({ city: 1 });
collegeSchema.index({ college_type: 1 });
collegeSchema.index({ streams: 1 });
collegeSchema.index({ 'courses.course_name': 1 });
collegeSchema.index({ createdAt: -1 });
collegeSchema.index({ is_active: 1 });

module.exports = mongoose.model('College', collegeSchema);
