const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/json";

router.post("/route", async (req, res) => {
    try {
        const { start, end } = req.body;

        if (!start || !end || start.length !== 2 || end.length !== 2) {
            return res.status(400).json({ error: "Invalid coordinates format." });
        }

        const response = await axios.post(
            ORS_URL,
            {
                coordinates: [start, end],
                instructions: true,
                radiuses: [1000.0, 1000.0],  // Expands search radius
            },
            {
                headers: { Authorization: `Bearer ${ORS_API_KEY}` },
            }
        );

        const data = response.data;

        if (!data.routes || data.routes.length === 0) {
            return res.status(404).json({ error: "No route found. Check the locations." });
        }

        // Extracting route details
        const route = data.routes[0];
        const distance_km = (route.summary.distance / 1000).toFixed(2);
        const duration_min = (route.summary.duration / 60).toFixed(2);
        const steps = route.segments[0].steps.map((step) => step.instruction);

        res.json({ distance_km, duration_min, steps });

    } catch (error) {
        console.error("Route Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch route. Try again." });
    }
});

module.exports = router;
