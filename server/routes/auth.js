const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { sendOtp, verifyOtp } = require('../utils/otpService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'college-predictor-secret-key-2026';

// Generate JWT
function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/send-otp — Send verification code
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already exists
    const existing = await Student.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    const result = await sendOtp(email.trim().toLowerCase());
    if (result.success) {
      return res.json({ success: true, message: result.message });
    } else {
      return res.status(400).json({ success: false, message: result.message, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/auth/verify-otp — Verify verification code
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const result = await verifyOtp(email.trim().toLowerCase(), code.trim());
    if (result.success) {
      return res.json({ success: true, message: result.message });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


// POST /api/auth/register — Register new student
router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    const student = new Student(req.body);
    const saved = await student.save();
    const token = signToken(saved._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: saved,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login — Login existing admin or student
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // First check Admin
    const admin = await require('../models/Admin').findOne({ email }).select('+password');
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        const token = signToken(admin._id);
        return res.json({
          success: true,
          message: 'Admin login successful',
          token,
          data: { ...admin.toObject(), role: 'admin' },
        });
      }
    }

    // Fallback to Student
    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({ success: false, message: 'No account found with this email or invalid password' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    student.lastLogin = new Date();
    await student.save();

    const token = signToken(student._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: { ...student.toObject(), role: student.isAdmin ? 'admin' : 'student' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/auth/me — Get current logged-in user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check Admin first
    const admin = await require('../models/Admin').findById(decoded.id);
    if (admin) {
      return res.json({ success: true, data: { ...admin.toObject(), role: 'admin' } });
    }

    // Check Student
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { ...student.toObject(), role: student.isAdmin ? 'admin' : 'student' } });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
