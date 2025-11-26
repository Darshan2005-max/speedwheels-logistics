const express = require('express');
const router = express.Router();

// Endpoint to provide Google Maps API key to frontend
// This keeps the API key server-side only
router.get('/google-maps-key', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }
  
  res.json({ apiKey });
});

module.exports = router;
