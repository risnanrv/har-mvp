// routes/api.js
const express = require('express');
const router = express.Router();
const harController = require('../controllers/harController');

// Route to generate HAR file
router.post('/har', harController.generateHar);

module.exports = router;