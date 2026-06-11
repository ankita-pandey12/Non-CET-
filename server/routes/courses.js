const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const adminAuth = require('../middleware/adminAuth');

// Helper to slugify course name
const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')           // Replace spaces with -
  .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
  .replace(/\-\-+/g, '-')         // Replace multiple - with single -
  .replace(/^-+/, '')             // Trim - from start of text
  .replace(/-+$/, '');            // Trim - from end of text

// GET /api/courses - List all courses with optional search/category filters
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(filter).sort({ name: 1 });
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Failed to fetch courses:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/courses - Create a new course (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, category, duration, eligibility, entranceExams, careerPaths } = req.body;
    
    if (!name || !category || !duration) {
      return res.status(400).json({ success: false, message: 'Name, category, and duration are required' });
    }

    const slug = slugify(name);

    // Check if course already exists
    const existing = await Course.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Course with this name or slug already exists' });
    }

    const course = await Course.create({
      name,
      category,
      duration: Number(duration),
      slug,
      eligibility: eligibility || '',
      entranceExams: entranceExams || [],
      careerPaths: careerPaths || []
    });

    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (err) {
    console.error('Failed to create course:', err);
    res.status(500).json({ success: false, message: 'Failed to create course', error: err.message });
  }
});

// PUT /api/courses/:id - Update a course (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, category, duration, eligibility, entranceExams, careerPaths } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (name) {
      course.name = name;
      course.slug = slugify(name);
    }
    if (category) course.category = category;
    if (duration) course.duration = Number(duration);
    if (eligibility !== undefined) course.eligibility = eligibility;
    if (entranceExams) course.entranceExams = entranceExams;
    if (careerPaths) course.careerPaths = careerPaths;

    await course.save();
    res.json({ success: true, message: 'Course updated successfully', data: course });
  } catch (err) {
    console.error('Failed to update course:', err);
    res.status(500).json({ success: false, message: 'Failed to update course', error: err.message });
  }
});

// DELETE /api/courses/:id - Delete a course (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Failed to delete course:', err);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: err.message });
  }
});

module.exports = router;
