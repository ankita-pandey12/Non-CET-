/**
 * create-admin.js
 * Run once to create the admin account in MongoDB Atlas.
 *
 * Usage:
 *   cd server
 *   node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function main() {
  console.log('\n🔐  Creating Admin Account');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  // Change these if you want a different email/password
  const EMAIL    = 'admin@vidyarthimitra.com';
  const PASSWORD = 'Admin@1234';

  const existing = await Admin.findOne({ email: EMAIL });
  if (existing) {
    console.log('⚠️   Admin already exists:', EMAIL);
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = await Admin.create({ email: EMAIL, password: PASSWORD });
  console.log('\n✅  Admin created successfully!');
  console.log('   📧  Email   :', EMAIL);
  console.log('   🔑  Password:', PASSWORD);
  console.log('   🆔  ID      :', admin._id);
  console.log('\n👉  Login at: http://localhost:5173/login\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
