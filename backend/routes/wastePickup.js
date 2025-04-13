
const express = require("express");
const router = express.Router();

router.get("/inactive-users", async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find users who have **not** requested pickup in the last 7 days
        const inactiveUsers = await WastePickup.aggregate([
            {
                $group: {
                    _id: "$userId",
                    lastPickup: { $max: "$requestedAt" }
                }
            },
            {
                $match: { lastPickup: { $lt: sevenDaysAgo } }
            }
        ]);

        res.json(inactiveUsers);
    } catch (error) {
        console.error("Error finding inactive users:", error);
        res.status(500).json({ error: "Error finding inactive users" });
    }
});
