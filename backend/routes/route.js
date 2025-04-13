const express = require("express");
const axios = require("axios");
const Route = require("../models/Route");
const router = express.Router();
require("dotenv").config();

// Middleware to get userId from token (if using auth middleware)
const getUserId = (req) => {
  // Example: If using JWT-based auth
  return req.user?.id || null; // or however you attach user info
};

router.post("/", async (req, res) => {
  try {
    const { start, end } = req.body;
    const userId = getUserId(req); // You can change this as per your auth setup

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and End coordinates are required" });
    }

    const [startLng, startLat] = start;
    const [endLng, endLat] = end;

    // 1️⃣ Check MongoDB cache
    const existingRoute = await Route.findOne({
      "startLocation.lat": startLat,
      "startLocation.lng": startLng,
      "endLocation.lat": endLat,
      "endLocation.lng": endLng,
    });

    if (existingRoute) {
      return res.json({
        message: "Route fetched from DB",
        route: existingRoute,
      });
    }

    // 2️⃣ Fetch from OpenRouteService
    const apiKey = process.env.ORS_API_KEY;

    const orsResponse = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [startLng, startLat],
          [endLng, endLat],
        ],
        instructions: true,
        instructions_format: "text",
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const data = orsResponse.data;
    const routeFeature = data.features[0];
    const segment = routeFeature.properties.segments[0];
    const steps = segment.steps;

    const newRoute = new Route({
      startLocation: { lat: startLat, lng: startLng },
      endLocation: { lat: endLat, lng: endLng },
      distance: segment.distance,
      duration: segment.duration,
      waypoints: routeFeature.geometry.coordinates.map((coord) => ({
        lat: coord[1],
        lng: coord[0],
      })),
      steps: steps,
      segments: routeFeature.properties.segments, // optional: save full segment array
    });

    await newRoute.save();

    res.json({ message: "Route fetched & saved", route: newRoute });
  } catch (error) {
    console.error(
      "Error fetching route:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error fetching route" });
  }
});

module.exports = router;
