const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const College = require('../models/College');
const SearchLog = require('../models/SearchLog');
const adminAuth = require('../middleware/adminAuth');

// Get overall stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const students = await Student.find();
    const totalColleges = await College.countDocuments();
    
    // Active users
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await Student.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });

    // Most viewed colleges
    const topViewedColleges = await College.find()
      .sort({ views: -1 })
      .limit(5)
      .select('college_name views')
      .lean();

    // Top searched queries
    const topSearched = await SearchLog.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Search trends (last 7 days grouped by date)
    const searchTrends = await SearchLog.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          searches: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate aggregate statistics
    const streamCounts = {};
    const boardCounts = {};
    const categoryCounts = {};

    students.forEach(s => {
      if (s.stream) streamCounts[s.stream] = (streamCounts[s.stream] || 0) + 1;
      if (s.board) boardCounts[s.board] = (boardCounts[s.board] || 0) + 1;
      if (s.category) categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });

    const formatData = (counts) => Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        activeUsers,
        totalColleges: totalColleges,
        studentsByStream: formatData(streamCounts),
        studentsByBoard: formatData(boardCounts),
        studentsByCategory: formatData(categoryCounts),
        topViewedColleges,
        topSearched: topSearched.map(item => ({ query: item._id, count: item.count })),
        searchTrends: searchTrends.map(item => ({ date: item._id, searches: item.searches }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Get all students
router.get('/students', adminAuth, async (req, res) => {
  try {
    const students = await Student.find()
      .select('-__v')
      .sort('-createdAt');
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Promote a student to admin
router.put('/students/:id/make-admin', adminAuth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student promoted to admin', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to promote student' });
  }
});

// Remove admin privileges from a student
router.put('/students/:id/remove-admin', adminAuth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isAdmin: false },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Admin privileges removed successfully', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove admin privileges' });
  }
});

module.exports = router;
