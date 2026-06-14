require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { sendOtp } = require('../utils/otpService');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
    
    console.log('Testing sendOtp with email: test@example.com');
    const res = await sendOtp('test@example.com');
    console.log('Result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await mongoose.connection.close();
  }
}

test();
