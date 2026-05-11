const express = require('express');
const router = express.Router();
const path = require('path');

// Load college data once at startup
const colleges = require(path.join(__dirname, '..', 'data', 'colleges.json'));

// GET /api/colleges — Search & filter colleges
router.get('/', (req, res) => {
  try {
    const {
      search = '',
      city = '',
      course = '',
      collegeType = '',
      category = '',
      page = 1,
      limit = 20,
    } = req.query;

    let results = [...colleges];

    // Text search (name, short name, university)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (c) =>
          (c.college_name || '').toLowerCase().includes(q) ||
          (c.college_short_name || '').toLowerCase().includes(q) ||
          (c.university_name || '').toLowerCase().includes(q)
      );
    }

    // City filter
    if (city.trim()) {
      const cityQ = city.trim().toLowerCase();
      results = results.filter(
        (c) => (c.city || '').toLowerCase() === cityQ
      );
    }

    // College type filter
    if (collegeType.trim()) {
      const typeQ = collegeType.trim().toLowerCase();
      results = results.filter(
        (c) => (c.college_type || '').toLowerCase() === typeQ
      );
    }

    // Course filter — use word boundaries to avoid 'ba' matching 'bachelor'
    if (course.trim()) {
      const courseQ = course.trim().toLowerCase();
      
      // Map common UI dropdown values to regex patterns
      let regexStr = `\\b${courseQ.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`;
      if (courseQ === 'ba') regexStr = '\\b(ba|b\\\\.a\\\\.?|bachelor of arts)\\b';
      else if (courseQ === 'b.sc') regexStr = '\\b(b\\\\.?sc|bachelor of science)\\b';
      else if (courseQ === 'b.com') regexStr = '\\b(b\\\\.?com|bachelor of commerce)\\b';
      else if (courseQ === 'b.tech / b.e.' || courseQ === 'engineering') regexStr = '\\b(b\\\\.?tech|b\\\\.?e\\\\.?|bachelor of technology|bachelor of engineering|engineering)\\b';
      else if (courseQ === 'b.pharm') regexStr = '\\b(b\\\\.?pharm|bachelor of pharmacy)\\b';
      else if (courseQ === 'bba') regexStr = '\\b(bba|b\\\\.b\\\\.a\\\\.?|bachelor of business administration)\\b';
      else if (courseQ === 'bms') regexStr = '\\b(bms|b\\\\.m\\\\.s\\\\.?|bachelor of management studies)\\b';
      else if (courseQ === 'bca') regexStr = '\\b(bca|b\\\\.c\\\\.a\\\\.?|bachelor of computer applications)\\b';

      const courseRegex = new RegExp(regexStr, 'i');

      results = results.filter((c) => {
        if (c.courses && c.courses.length > 0) {
          return c.courses.some(
            (cr) =>
              courseRegex.test(cr.course_name || '') ||
              courseRegex.test(cr.specialization || '') ||
              courseRegex.test(cr.stream_category || '')
          );
        }
        // For Mumbai colleges without course data, check name/remarks
        return (
          courseRegex.test(c.college_name || '') ||
          courseRegex.test(c.remarks || '')
        );
      });
    }

    // Enrich with cutoff for user's category
    if (category.trim()) {
      const catQ = category.trim().toUpperCase();
      results = results.map((c) => {
        const relevantCutoffs = (c.cutoffs || []).filter(
          (cut) => (cut.category || '').toUpperCase() === catQ || (cut.category || '').toUpperCase() === 'OPEN'
        );
        return { ...c, relevantCutoffs };
      });
    }

    const total = results.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = results.slice(startIdx, startIdx + limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: paginated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/colleges/cities — Get unique city list
router.get('/cities', (req, res) => {
  const cities = [...new Set(colleges.map((c) => c.city).filter(Boolean))].sort();
  res.json({ success: true, data: cities });
});

// GET /api/colleges/types — Get unique college types
router.get('/types', (req, res) => {
  const types = [...new Set(colleges.map((c) => c.college_type).filter(Boolean))].sort();
  res.json({ success: true, data: types });
});

// GET /api/colleges/courses — Get unique course names
router.get('/courses', (req, res) => {
  const courseSet = new Set();
  colleges.forEach((c) => {
    if (c.courses) {
      c.courses.forEach((cr) => {
        if (cr.course_name) courseSet.add(cr.course_name);
      });
    }
  });
  res.json({ success: true, data: [...courseSet].sort() });
});

// GET /api/colleges/:index — Get single college by array index
router.get('/:index', (req, res) => {
  const idx = parseInt(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= colleges.length) {
    return res.status(404).json({ success: false, message: 'College not found' });
  }
  res.json({ success: true, data: colleges[idx] });
});

module.exports = router;
