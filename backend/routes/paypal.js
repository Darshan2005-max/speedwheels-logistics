const express = require('express');
const router = express.Router();

// GET /api/paypal/config - Return PayPal Client ID
router.get('/config', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

module.exports = router;
