require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const coll = mongoose.connection.collection('colleges');
  
  // Check sample data
  const sample = await coll.findOne({});
  console.log('Sample college_name:', sample?.college_name);
  console.log('Sample city:', sample?.city);
  console.log('Sample university_name:', sample?.university_name);
  
  // Try regex search instead
  const res = await coll.find({ college_name: { $regex: 'Pune', $options: 'i' } }).limit(3).toArray();
  console.log('\nRegex search "Pune" in college_name:', res.length, 'results');
  res.forEach(r => console.log(' -', r.college_name, '|', r.city));
  
  // Try text search with quotes
  const res2 = await coll.find({ $text: { $search: '"Engineering"' } }).limit(3).toArray();
  console.log('\nText search "Engineering" (quoted):', res2.length, 'results');
  res2.forEach(r => console.log(' -', r.college_name));
  
  await mongoose.disconnect();
  process.exit(0);
});
