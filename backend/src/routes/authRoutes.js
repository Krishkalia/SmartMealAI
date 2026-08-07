const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePreferences, toggleFavorite } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.post('/favorites', protect, toggleFavorite);

module.exports = router;
