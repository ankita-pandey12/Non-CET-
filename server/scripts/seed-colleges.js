/**
 * seed-colleges.js
 * ─────────────────
 * One-time script to import all colleges from colleges.json into MongoDB.
 *
 * Usage:
 *   cd server
 *   node scripts/seed-colleges.js
 *
 * Options:
 *   --drop   Clears the colleges collection before seeding (full re-import)
 *   --skip   Only inserts colleges not already in DB (by college_name)
 *
 * Default behaviour: --skip (safe for re-runs)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path     = require('path');
const College  = require('../models/College');

const JSON_PATH = path.join(__dirname, '..', 'data', 'colleges.json');

const args  = process.argv.slice(2);
const DROP  = args.includes('--drop');
const FORCE = args.includes('--force'); // re-insert even if exists

async function main() {
  console.log('\n🌱  College Seeder — Non-CET College Predictor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Connect
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  MongoDB connected:', process.env.MONGODB_URI);

  // Optionally drop the collection first
  if (DROP) {
    await College.deleteMany({});
    console.log('🗑️   Cleared existing colleges collection');
  }

  // Load JSON
  const raw = require(JSON_PATH);
  console.log(`📦  Loaded ${raw.length} colleges from colleges.json`);

  // Map JSON fields → College schema fields
  const docs = raw.map((c) => ({
    college_name:       c.college_name       || '',
    college_short_name: c.college_short_name || '',
    dte_code:           c.dte_code           || '',
    established_year:   c.established_year   || null,

    university_name:    c.university_name    || '',
    college_type:       c.college_type       || '',
    minority_status:    c.minority_status    || 'Non-minority',
    minority_community: c.minority_community || '',

    address:    c.address    || '',
    city:       c.city       || '',
    district:   c.district   || '',
    pin_code:   c.pin_code   ? String(c.pin_code) : '',

    email:   c.email   || '',
    website: c.website || '',
    phone:   c.phone   || '',

    naac_grade: c.naac_grade || '',
    naac_cgpa:  c.naac_cgpa  || null,
    regulatory_approvals: c.regulatory_approvals || [],

    courses: (c.courses || []).map((cr) => ({
      course_name:          cr.course_name          || '',
      specialization:       cr.specialization       || '',
      stream_category:      cr.stream_category      || '',
      admission_type:       cr.admission_type       || '',
      duration_years:       cr.duration_years       || null,
      degree_type:          cr.degree_type          || '',
      total_seats:          cr.total_seats          || null,
      tuition_fees_per_year:cr.tuition_fees_per_year|| null,
    })),

    cutoffs: (c.cutoffs || []).map((ct) => ({
      course_name:    ct.course_name    || '',
      specialization: ct.specialization || '',
      academic_year:  ct.academic_year  || '',
      category:       ct.category       || '',
      domicile:       ct.domicile       || '',
      round_number:   ct.round_number   || null,
      cutoff_type:    ct.cutoff_type    || '',
      cutoff_value:   ct.cutoff_value   ?? null,
    })),

    seats:   c.seats   || null,
    remarks: c.remarks || '',

    // Derive streams from stream_category values in courses
    streams: [...new Set(
      (c.courses || [])
        .map((cr) => cr.stream_category)
        .filter(Boolean)
    )],

    source:    'json_seed',
    is_active: true,
  }));

  // Insert in batches
  const BATCH = 50;
  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);

    if (FORCE || DROP) {
      // Bulk insert directly
      try {
        const result = await College.insertMany(batch, { ordered: false });
        inserted += result.length;
      } catch (e) {
        if (e.code === 11000) {
          // Duplicate key — count separately
          inserted += (e.result?.nInserted || 0);
          skipped  += batch.length - (e.result?.nInserted || 0);
        } else {
          throw e;
        }
      }
    } else {
      // Upsert by college_name (safe re-run)
      for (const doc of batch) {
        const existing = await College.findOne({ college_name: doc.college_name });
        if (existing) {
          skipped++;
        } else {
          await College.create(doc);
          inserted++;
        }
      }
    }

    const done = Math.min(i + BATCH, docs.length);
    process.stdout.write(`\r   Progress: ${done}/${docs.length}`);
  }

  console.log(`\n\n✅  Seeding complete!`);
  console.log(`   📥  Inserted: ${inserted}`);
  console.log(`   ⏭️   Skipped (already exist): ${skipped}`);
  console.log(`   📊  Total in DB: ${await College.countDocuments()}`);

  // Build text index if not exists
  try {
    await College.collection.createIndex(
      { college_name: 'text', college_short_name: 'text', university_name: 'text', city: 'text' },
      { name: 'college_text_search', weights: { college_name: 10, college_short_name: 5, university_name: 3, city: 1 } }
    );
    console.log('🔍  Text search index ensured');
  } catch (e) {
    console.log('ℹ️   Text index already exists or could not be created:', e.message);
  }

  await mongoose.disconnect();
  console.log('🔌  MongoDB disconnected\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Seeder failed:', err.message);
  process.exit(1);
});
