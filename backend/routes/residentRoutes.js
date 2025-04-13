const express = require("express");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get residents who haven't given waste for 7+ days
router.get("/no-pickup", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0); // Set time to midnight

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7); // Subtract 7 days

        console.log("Checking residents with last pickup before:", sevenDaysAgo.toISOString());

        const users = await User.find({
            role: "resident",
            $or: [
                { lastWastePickup: { $exists: true, $type: "date", $lt: sevenDaysAgo } }, // Pickups older than 7 days
                { lastWastePickup: null } // Never given waste
            ]
        });

        console.log("Residents found:", users.map(user => ({
            name: user.name, lastWastePickup: user.lastWastePickup
        })));

        res.json({ residents: users });
    } catch (error) {
        console.error("Error fetching residents:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get count of inactive residents (no pickup in last 7 days)
router.get("/inactive-count", async (req, res) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setUTCHours(0, 0, 0, 0); // Normalize to midnight for consistency
  
      const inactiveUsers = await User.find({
        role: "resident",
        $or: [
          { lastWastePickup: { $exists: false } }, // Never picked up
          { lastWastePickup: null }, // Explicit null check
          { lastWastePickup: { $lt: sevenDaysAgo } }, // Older than 7 days
        ],
      });
  
      res.json({ inactiveCount: inactiveUsers.length });
    } catch (error) {
      console.error("Error fetching inactive residents count:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  


module.exports = router;
