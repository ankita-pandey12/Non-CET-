const express = require('express');
const router = express.Router();
const { askAgent } = require('../controllers/chatController');

router.post('/', askAgent);

module.exports = router;
