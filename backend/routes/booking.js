const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// POST /api/booking
router.post("/", async (req, res) => {
  try {
    const bookingData = req.body;

    if (!bookingData.vehicle || !bookingData.route || !bookingData.total) {
      return res.status(400).json({ error: "Missing booking details" });
    }

    const db = admin.firestore();
    bookingData.createdAt = new Date();

    const ref = await db.collection("bookings").add(bookingData);
    res.json({ message: "Booking stored successfully ✅", id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/booking
router.get("/", async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("bookings").get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
