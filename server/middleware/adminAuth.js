const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'college-predictor-secret-key-2026');
    
    // Check if user exists in Admin collection
    let user = await require('../models/Admin').findById(decoded.id);
    
    // If not in Admin collection, check if they are a promoted Student
    if (!user) {
      const student = await require('../models/Student').findById(decoded.id);
      if (student && student.isAdmin) {
        user = student;
      }
    }

    if (!user) {
      return res.status(403).json({ success: false, message: 'Admin access denied' });
    }

    req.admin = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

module.exports = adminAuth;
