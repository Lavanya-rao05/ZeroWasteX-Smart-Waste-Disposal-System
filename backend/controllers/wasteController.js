const axios = require("axios");
require("dotenv").config();

const getOptimizedRoute = async (req, res) => {
    try {
        const { start, end } = req.body;  // Accept coordinates from request

        const response = await axios.post(
            "https://api.openrouteservice.org/v2/directions/driving-car",
            {
                coordinates: [start, end],
                instructions: true,
                radiuses: [3000.0, 3000.0]
            },
            {
                headers: { Authorization: process.env.ORS_API_KEY }
            }
        );

        const route = response.data.routes[0];
        return res.json({
            distance_km: (route.summary.distance / 1000).toFixed(2),
            duration_min: (route.summary.duration / 60).toFixed(2),
            steps: route.segments[0].steps.map((step) => step.instruction)
        });

    } catch (error) {
        console.error("Route API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "No route found. Try adjusting location or radius." });
    }
};

module.exports = { getOptimizedRoute };
