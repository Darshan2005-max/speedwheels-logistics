const express = require('express');
const router = express.Router();

// Predefined vehicle models with realistic commercial rates (₹ per km)
const VEHICLE_MODELS = {
  mini: { name: 'Mini Truck (2.5T)', baseRate: 25, fuelRate: 10 },
  lorry: { name: 'Lorry (10T)', baseRate: 45, fuelRate: 18 },
  container20: { name: 'Container (20ft)', baseRate: 65, fuelRate: 25 },
  container40: { name: 'Container (40ft)', baseRate: 95, fuelRate: 35 }
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

    // Calculate distance and get route data using Google Maps APIs
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    let distanceKm, durationText, pickupCoords, dropCoords, routePolyline;

    try {
      const axios = require('axios');
      
      // Get geocoded coordinates for pickup location
      const pickupGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickup)}&key=${apiKey}`;
      const pickupGeoResponse = await axios.get(pickupGeoUrl);
      
      if (pickupGeoResponse.data.status === 'OK' && pickupGeoResponse.data.results.length > 0) {
        const pickupLocation = pickupGeoResponse.data.results[0].geometry.location;
        pickupCoords = { lat: pickupLocation.lat, lng: pickupLocation.lng };
      } else {
        throw new Error('Failed to geocode pickup location');
      }

      // Get geocoded coordinates for drop location
      const dropGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(drop)}&key=${apiKey}`;
      const dropGeoResponse = await axios.get(dropGeoUrl);
      
      if (dropGeoResponse.data.status === 'OK' && dropGeoResponse.data.results.length > 0) {
        const dropLocation = dropGeoResponse.data.results[0].geometry.location;
        dropCoords = { lat: dropLocation.lat, lng: dropLocation.lng };
      } else {
        throw new Error('Failed to geocode drop location');
      }

      // Get route and distance using Directions API
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(drop)}&key=${apiKey}`;
      const directionsResponse = await axios.get(directionsUrl);
      
      if (directionsResponse.data.status === 'OK' && directionsResponse.data.routes.length > 0) {
        const route = directionsResponse.data.routes[0];
        const leg = route.legs[0];
        
        distanceKm = (leg.distance.value / 1000).toFixed(1);
        durationText = leg.duration.text;
        routePolyline = route.overview_polyline.points;
      } else {
        throw new Error('Google Maps Directions API failed');
      }
    } catch (err) {
      // Fallback: Use mock data for testing
      console.warn('⚠️ Google Maps API unavailable, using mock data');
      
      // Simple mock: generate random distance between 100-1500 km
      const mockDistance = Math.floor(Math.random() * 1400) + 100;
      distanceKm = mockDistance.toFixed(1);
      
      // Mock duration: ~50 km/hr average
      const hours = Math.floor(mockDistance / 50);
      const mins = Math.floor((mockDistance % 50) * 1.2);
      durationText = `${hours} hours ${mins} mins`;
      
      // Mock coordinates (Delhi and Mumbai as example)
      pickupCoords = { lat: 28.6139, lng: 77.2090 };
      dropCoords = { lat: 19.0760, lng: 72.8777 };
      routePolyline = null;
    }

    // Calculate distance-based fees
    const baseFee = Math.round(model.baseRate * distanceKm);
    const fuelCost = Math.round(model.fuelRate * distanceKm);
    
    // Driver allowance scales with distance (₹2,000 base + ₹500 per 500km)
    const driverFee = Math.round(2000 + (distanceKm / 500) * 500);
    
    // Toll estimate scales with distance (approximately ₹2 per km for highways)
    const toll = Math.round(distanceKm * 2);
    
    const total = Math.round(baseFee + fuelCost + driverFee + toll);
    const advance = Math.round(total * 0.3);

    res.json({
      model: model.name,
      distanceKm,
      duration: durationText,
      base: baseFee,
      fuelCost,
      driverFee,
      toll,
      total,
      advance,
      pickupCoords,
      dropCoords,
      routePolyline
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
