const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, planController.generatePlan);
router.get('/common-pantry', protect, planController.getCommonPantry);
router.post('/scan-pantry', protect, planController.scanPantry);
router.get('/user/history', protect, planController.getUserPlans);
router.get('/:id', protect, planController.getPlan);
router.put('/:id/refresh-meal', protect, planController.refreshMeal);
router.post('/substitute-options', protect, planController.getSubstituteOptions);
router.put('/:id/swap-ingredient', protect, planController.swapIngredient);
router.post('/:id/manual-item', protect, planController.addManualItem);

module.exports = router;
