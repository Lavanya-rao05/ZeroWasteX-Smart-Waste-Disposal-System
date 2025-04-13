const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const User = require("../models/User");
const PickupRequest = require("../models/PickupRequest");
const Center = require("../models/Center"); 

const router = express.Router();

// 🟢 1. Get total users (residents & collectors)
router.get(
  "/users-stats",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const totalResidents = await User.countDocuments({ role: "resident" });
      const totalCollectors = await User.countDocuments({ role: "collector" });

      res.json({ totalResidents, totalCollectors });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// 🟢 2. Get pending vs. completed pickups
router.get(
  "/pickup-stats",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const pending = await PickupRequest.countDocuments({ status: "pending" });
      const completed = await PickupRequest.countDocuments({
        status: "completed",
      });

      res.json({ pending, completed });
    } catch (error) {
      console.error("Error fetching pickup stats:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// 🟢 3. Get active pickup requests for map visualization
router.get(
  "/active-pickups",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const activePickups = await PickupRequest.find({ status: "pending" })
        .populate("user", "name address") // Populate resident name & address
        .lean(); // Converts Mongoose objects to plain JS objects
      
      console.log(
        "Active Pickups Data:",
        JSON.stringify(activePickups, null, 2)
      );
      res.json(activePickups);
    } catch (error) {
      console.error("Error fetching active pickups:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
router.get("/inactive-collectors", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all collectors
    const allCollectors = await User.find({ role: "collector" });

    // Get all completed pickups within the last 7 days
    const recentPickups = await PickupRequest.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: sevenDaysAgo } // Only consider recent pickups
        }
      },
      {
        $group: {
          _id: "$assignedCollector", // Group by collector
          lastCompletedAt: { $max: "$completedAt" } // Get the most recent completion
        }
      }
    ]);

    // Convert to a Set for quick lookup
    const activeCollectorIds = new Set(recentPickups.map(p => p._id.toString()));

    // Filter inactive collectors
    const inactiveCollectors = allCollectors.filter(collector => 
      !activeCollectorIds.has(collector._id.toString()) // If collector ID is NOT in active list
    );

    res.json({ inactiveCollectors });
  } catch (error) {
    console.error("Error fetching inactive collectors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/// GET Center-wise Analytics
router.get("/center-analytics", async (req, res) => {
  try {
    const centers = await Center.find();

    const analytics = await Promise.all(
      centers.map(async (center) => {
        const centerId = center._id;

        // Count only users with role = 'collector' under this center
        const totalCollectors = center.collectors.length;

        const activePickups = await PickupRequest.countDocuments({
          center: centerId,
          status: "pending",
        });

        const completedPickups = await PickupRequest.countDocuments({
          center: centerId,
          status: "completed",
        });

        return {
          centerName: center.name,
          totalCollectors,
          activePickups,
          completedPickups,
        };
      })
    );

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching center analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/admin.js

router.get("/center-rankings", async (req, res) => {
  try {
    const centers = await Center.find();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const centerStats = await Promise.all(
      centers.map(async (center) => {
        const completedCount = await PickupRequest.countDocuments({
          center: center._id,
          status: "completed",
          completedAt: { $gte: oneWeekAgo },
        });

        return {
          centerId: center._id,
          centerName: center.name,
          completedPickups: completedCount,
        };
      })
    );

    // Sort by completed pickups
    const sorted = [...centerStats].sort((a, b) => b.completedPickups - a.completedPickups);

    const topCenters = sorted.slice(0, 3);
    const bottomCenters = sorted.slice(-3);

    res.json({ topCenters, bottomCenters });
  } catch (error) {
    console.error("Error fetching center rankings:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
