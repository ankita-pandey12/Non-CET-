const express = require('express');
const router = express.Router();
const College = require('../models/College');
const adminAuth = require('../middleware/adminAuth');

// ── POST /api/admin/colleges — Add a new college ─────────────────────────────
router.post('/', adminAuth, async (req, res) => {
  try {
    const data = req.body;

    // The admin form sends courses as [{stream, course}] pairs.
    // Map them to the rich course schema used across the app.
    const mappedCourses = (data.courses || []).map((c) => ({
      course_name:     c.course  || c.course_name || '',
      stream_category: c.stream  || c.stream_category || '',
      specialization:  c.specialization || '',
      admission_type:  c.admission_type || '',
      duration_years:  c.duration_years || null,
      degree_type:     c.degree_type || '',
      total_seats:     c.total_seats || null,
    }));

    const college = await College.create({
      ...data,
      courses:   mappedCourses,
      source:    'admin_form',
      added_by:  req.admin._id,
    });
    res.status(201).json({ success: true, message: 'College added successfully', data: college });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to add college', error: err.message });
  }
});

// ── GET /api/admin/colleges — List all colleges (admin view) ─────────────────
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search
      ? { $text: { $search: search } }
      : {};
    const total = await College.countDocuments(query);
    const colleges = await College.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-__v');
    res.json({ success: true, total, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch colleges', error: err.message });
  }
});

// ── GET /api/admin/colleges/:id — Get single college ────────────────────────
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const college = await College.findById(req.params.id).select('-__v');
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch college', error: err.message });
  }
});

// ── PUT /api/admin/colleges/:id — Update a college ───────────────────────────
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const data = req.body;

    // Map courses from frontend format ({stream, course}) to Mongoose schema format
    if (data.courses) {
      data.courses = data.courses.map((c) => ({
        course_name:     c.course  || c.course_name || '',
        stream_category: c.stream  || c.stream_category || '',
        specialization:  c.specialization || '',
        admission_type:  c.admission_type || '',
        duration_years:  c.duration_years || null,
        degree_type:     c.degree_type || '',
        total_seats:     c.total_seats || null,
      }));
    }

    const college = await College.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, message: 'College updated successfully', data: college });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to update college', error: err.message });
  }
});

// ── DELETE /api/admin/colleges/:id — Delete a college ────────────────────────
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, message: 'College deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete college', error: err.message });
  }
});

module.exports = router;
