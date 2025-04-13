const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

router.get("/route", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Start and End coordinates are required" });
    }

    const apiKey = process.env.ORS_API_KEY;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

    const response = await axios.get(url);

    // Extracting relevant data
    const routeData = response.data.features[0].properties.segments[0];
    const routeCoordinates = response.data.features[0].geometry.coordinates;

    const formattedResponse = {
      distance: routeData.distance, // Distance in meters
      duration: routeData.duration, // Duration in seconds
      steps: routeData.steps.map(step => ({
        instruction: step.instruction,
        distance: step.distance,
        duration: step.duration
      })),
      routeCoordinates // List of latitude & longitude points
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching optimized route:", error.message);
    res.status(500).json({ error: "Error fetching optimized route" });
  }
});

module.exports = router;
