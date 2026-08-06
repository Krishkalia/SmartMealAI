const express = require('express');
const router = express.Router();
const cloudinaryService = require('../services/cloudinaryService');
const { protect } = require('../middleware/auth');

router.post('/upload', protect, async (req, res) => {
  try {
    const { media, folder = 'smartmeal_general' } = req.body;
    if (!media) {
      return res.status(400).json({ success: false, message: 'Media data is required' });
    }

    const secureUrl = await cloudinaryService.uploadMedia(media, folder);
    
    res.json({ success: true, url: secureUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: 'Failed to upload media' });
  }
});

module.exports = router;
