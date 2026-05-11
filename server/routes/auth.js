const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'college-predictor-secret-key-2026';

// Generate JWT
function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
}

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

// POST /api/auth/login — Login existing student
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({ success: false, message: 'No account found with this email' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const token = signToken(student._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: student,
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
    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
