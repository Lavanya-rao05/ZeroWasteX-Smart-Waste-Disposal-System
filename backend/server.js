require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Import Routes
const mapRoutes = require("./routes/mapRoutes");
const wasteNotificationRoutes = require("./routes/wasteNotification");
const routeRoutes = require("./routes/route");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/UserRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const pickupRoutes = require("./routes/pickupRoutes"); // Ensure the correct filename
const residentRoutes = require("./routes/residentRoutes"); // Ensure correct filename
const wasteRoutes = require("./routes/wasteRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://zerowastex.netlify.app"], // Allow frontend origin
    credentials: true, // Allow cookies and authentication headers
  })
);

// Debugging: Check if environment variables are loaded
console.log("ORS API Key:", process.env.ORS_API_KEY);
console.log("MongoDB URI:", process.env.MONGO_URI ? "Loaded" : "Not Loaded");

// Routes
app.use("/api/maps", mapRoutes);
app.use("/api/wasteNotification", wasteNotificationRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // This must be present
app.use("/api/pickup", pickupRoutes); // Ensure this is present
app.use("/api/residents", residentRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", protectedRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Waste Disposal API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
