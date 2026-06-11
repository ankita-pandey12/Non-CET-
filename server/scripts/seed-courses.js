/**
 * seed-courses.js
 * ────────────────
 * Seeding script to import all courses from courses.json into MongoDB.
 *
 * Usage:
 *   cd server
 *   node scripts/seed-courses.js [--drop]
 *
 * Options:
 *   --drop   Clears the courses collection before seeding
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path     = require('path');
const Course   = require('../models/Course');

const JSON_PATH = path.join(__dirname, '..', 'data', 'courses.json');

const args = process.argv.slice(2);
const DROP = args.includes('--drop');

async function main() {
  console.log('\n🌱  Course Seeder — Non-CET College Predictor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!process.env.MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  // Connect
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  MongoDB connected:', process.env.MONGODB_URI);

  // Optionally drop the collection first
  if (DROP) {
    await Course.deleteMany({});
    console.log('🗑️   Cleared existing courses collection');
  }

  // Load JSON
  const raw = require(JSON_PATH);
  console.log(`📦  Loaded ${raw.length} courses from courses.json`);

  let inserted = 0;
  let skipped = 0;

  for (const item of raw) {
    const existing = await Course.findOne({ name: item.name });
    if (existing) {
      skipped++;
    } else {
      await Course.create({
        name: item.name,
        category: item.category,
        duration: item.duration,
        slug: item.slug,
        eligibility: item.eligibility || '',
        entranceExams: item.entranceExams || [],
        careerPaths: item.careerPaths || []
      });
      inserted++;
    }
  }

  console.log(`\n✅  Seeding complete!`);
  console.log(`   📥  Inserted: ${inserted}`);
  console.log(`   ⏭️   Skipped (already exist): ${skipped}`);
  console.log(`   📊  Total in DB: ${await Course.countDocuments()}\n`);

  await mongoose.disconnect();
  console.log('🔌  MongoDB disconnected\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Seeder failed:', err.message);
  process.exit(1);
});
