const express = require('express');
const router = express.Router();

// Predefined vehicle models with rates (₹ per km and fuel cost)
const VEHICLE_MODELS = {
  mini: { name: 'Mini Truck (2.5T)', baseRate: 12, fuelRate: 4 },
  lorry: { name: 'Lorry (10T)', baseRate: 20, fuelRate: 7 },
  container20: { name: 'Container (20ft)', baseRate: 30, fuelRate: 9 },
  container40: { name: 'Container (40ft)', baseRate: 45, fuelRate: 12 }
};

// POST /api/estimate
router.post('/', async (req, res) => {
  try {
    const { modelId, pickup, drop } = req.body;

    if (!modelId || !pickup || !drop) {
      return res.status(400).json({ error: 'modelId, pickup, and drop locations are required' });
    }

    const model = VEHICLE_MODELS[modelId];
    if (!model) return res.status(400).json({ error: 'Invalid vehicle model selected' });

    // Calculate distance using Google Maps API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickup)}&destinations=${encodeURIComponent(drop)}&key=${apiKey}`;
    
    const axios = require('axios');
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
      return res.status(400).json({ error: 'Unable to calculate distance. Please check addresses.' });
    }

    const distanceMeters = data.rows[0].elements[0].distance.value;
    const distanceKm = (distanceMeters / 1000).toFixed(1);
    const durationText = data.rows[0].elements[0].duration.text;

    const driverFee = +process.env.BASE_DRIVER_FEE || 800;
    const toll = +process.env.BASE_TOLL_ESTIMATE || 200;

    const base = Math.round(model.baseRate * distanceKm);
    const fuelCost = Math.round(model.fuelRate * distanceKm);
    const total = Math.round(base + fuelCost + driverFee + toll);
    const advance = Math.round(total * 0.3);

    res.json({
      model: model.name,
      distanceKm,
      duration: durationText,
      base,
      fuelCost,
      driverFee,
      toll,
      total,
      advance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
