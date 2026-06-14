const express = require('express');
const router = express.Router();
const College = require('../models/College');
const SearchLog = require('../models/SearchLog');

// Helper to match courses dot-insensitively (e.g. BA and B.A)
const makeDotInsensitivePattern = (str) => {
  const clean = str.replace(/\./g, '');
  if (!clean) return '';
  return clean.split('').map(char => `${char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\.?`).join('');
};

// ── GET /api/colleges — Search & filter colleges from MongoDB ─────────────────
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      city = '',
      course = '',
      collegeType = '',
      category = '',
      streams = '',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));

    // Build the MongoDB filter
    const filter = { is_active: { $ne: false } };

    // Text / name search — use regex for partial matches & abbreviations
    if (search.trim()) {
      const q = search.trim();
      SearchLog.create({ query: q }).catch(err => console.error('Search log error:', err));
      const re = { $regex: q, $options: 'i' };
      filter.$or = [
        { college_name: re },
        { college_short_name: re },
        { university_name: re },
        { city: re },
        { remarks: re },
      ];
    }

    // City filter (case-insensitive exact)
    if (city.trim()) {
      const cities = city.split(',').map(c => c.trim()).filter(Boolean);
      if (cities.length > 0) {
        filter.city = { $in: cities.map(c => new RegExp(`^${c}$`, 'i')) };
      }
    }

    // College type filter
    if (collegeType.trim()) {
      const types = collegeType.split(',').map(c => c.trim()).filter(Boolean);
      if (types.length > 0) {
        filter.college_type = { $in: types.map(t => new RegExp(`^${t}$`, 'i')) };
      }
    }

    // Stream filter (admin-tagged streams array)
    if (streams.trim()) {
      filter.streams = { $in: [streams.trim()] };
    }

    // Course filter — search courses sub-documents
    if (course.trim()) {
      const courses = course.split(',').map(c => c.trim()).filter(Boolean);
      if (courses.length > 0) {
        filter['courses.course_name'] = {
          $in: courses.map(c => {
            const pattern = makeDotInsensitivePattern(c);
            return new RegExp(pattern || c, 'i');
          })
        };
      }
    }

    const total = await College.countDocuments(filter);

    let query = College.find(filter).select('-__v -added_by').sort({ college_name: 1 });

    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);

    let results = await query.lean();

    // Enrich with category-relevant cutoffs
    if (category.trim()) {
      const catQ = category.trim().toUpperCase();
      results = results.map((c) => {
        const relevantCutoffs = (c.cutoffs || []).filter(
          (cut) =>
            (cut.category || '').toUpperCase() === catQ ||
            (cut.category || '').toUpperCase() === 'OPEN'
        );
        return { ...c, relevantCutoffs };
      });
    }

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: results,
    });
  } catch (err) {
    console.error('College search error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── GET /api/colleges/cities — Distinct city list ────────────────────────────
router.get('/cities', async (req, res) => {
  try {
    const cities = await College.distinct('city', { is_active: { $ne: false }, city: { $ne: '' } });
    const normalized = [...new Set(cities.map(c => {
      const clean = c.trim().toLowerCase();
      return clean.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }))];
    res.json({ success: true, data: normalized.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities', error: err.message });
  }
});

// ── GET /api/colleges/types — Distinct college types ─────────────────────────
router.get('/types', async (req, res) => {
  try {
    const types = await College.distinct('college_type', { is_active: { $ne: false }, college_type: { $ne: '' } });
    res.json({ success: true, data: types.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch types', error: err.message });
  }
});

// ── GET /api/colleges/courses — Distinct course names ────────────────────────
router.get('/courses', async (req, res) => {
  try {
    const courseNames = await College.distinct('courses.course_name', { is_active: { $ne: false } });
    const normalized = [...new Set(courseNames.map(c => {
      let name = c.trim();
      const upper = name.toUpperCase().replace(/\./g, '');
      if (upper === 'BA') return 'B.A';
      if (upper === 'BSC') return 'B.Sc';
      if (upper === 'BCOM') return 'B.Com';
      if (upper === 'BTECH') return 'B.Tech';
      if (upper === 'BE') return 'B.E';
      if (upper === 'BARCH') return 'B.Arch';
      if (upper === 'BBA') return 'BBA';
      if (upper === 'BCA') return 'BCA';
      return name;
    }))];
    res.json({ success: true, data: normalized.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: err.message });
  }
});

// ── GET /api/colleges/streams — Distinct stream tags ─────────────────────────
router.get('/streams', async (req, res) => {
  try {
    const streamList = await College.distinct('streams', { is_active: { $ne: false } });
    res.json({ success: true, data: streamList.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch streams', error: err.message });
  }
});

// ── GET /api/colleges/:id — Get single college by MongoDB _id ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).select('-__v');
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
