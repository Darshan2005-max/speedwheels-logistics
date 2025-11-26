require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 8080;

// Initialize Firebase
try {
  const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (servicePath) {
    const serviceAccount = require(servicePath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase initialized successfully");
  } else {
    console.warn(
      "⚠️ Firebase key path missing in .env — skipping initialization"
    );
  }
} catch (err) {
  console.error("❌ Firebase initialization failed:", err.message);
}

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));

// ✅ Register routes (only once)
console.log("📦 Loading routes...");
app.use("/api/estimate", require("./routes/estimate"));
console.log("✅ /api/estimate route registered");

app.use("/api/booking", require("./routes/booking"));
console.log("✅ /api/booking route registered");

app.use("/api/paypal", require("./routes/paypal"));
console.log("✅ /api/paypal route registered");

app.use("/api/config", require("./routes/config"));
console.log("✅ /api/config route registered");

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running fine ✅" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 SpeedWheels Logistics backend running on port ${port}`);
});
