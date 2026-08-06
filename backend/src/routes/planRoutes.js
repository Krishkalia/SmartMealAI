const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, planController.generatePlan);
router.post('/scan-pantry', protect, planController.scanPantry);
router.get('/user/history', protect, planController.getUserPlans);
router.get('/:id', protect, planController.getPlan);

module.exports = router;
