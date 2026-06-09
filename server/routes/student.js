const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// POST /api/students — Save student profile
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    const saved = await student.save();
    res.status(201).json({
      success: true,
      message: 'Profile saved successfully',
      data: saved,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/students — Get all profiles
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/students/:id — Get single profile
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/students/:id — Update student profile
router.put('/:id', async (req, res) => {
  try {
    // Exclude restricted fields like email if needed, but since email is read-only on frontend, it's fine
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/students/:id/save-college — Toggle save college
router.post('/:id/save-college', async (req, res) => {
  try {
    const { collegeId } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const index = student.savedColleges.indexOf(collegeId);
    if (index > -1) {
      student.savedColleges.splice(index, 1);
    } else {
      student.savedColleges.push(collegeId);
    }
    await student.save();
    res.json({ success: true, data: student.savedColleges });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/students/:id/view-college — Log recently viewed
router.post('/:id/view-college', async (req, res) => {
  try {
    const { collegeId } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.recentlyViewed = student.recentlyViewed.filter(id => id.toString() !== collegeId);
    student.recentlyViewed.unshift(collegeId);

    if (student.recentlyViewed.length > 10) {
      student.recentlyViewed = student.recentlyViewed.slice(0, 10);
    }

    await student.save();
    res.json({ success: true, data: student.recentlyViewed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/students/:id/dashboard-data — Get populated dashboard data
router.get('/:id/dashboard-data', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('savedColleges', 'college_name college_short_name city college_type views naac_grade')
      .populate('recentlyViewed', 'college_name college_short_name city college_type views naac_grade');
      
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
