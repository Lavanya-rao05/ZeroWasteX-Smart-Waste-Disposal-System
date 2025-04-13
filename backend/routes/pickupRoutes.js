const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const PickupRequest = require("../models/PickupRequest");
const Center = require("../models/Center");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();
const ORS_API_KEY = process.env.ORS_API_KEY;

const validUrgencies = ["low", "medium", "high"];
const validStatuses = ["pending", "assigned", "completed", "canceled"];

router.get(
  "/saved-addresses",
  authenticate,
  authorize(["resident"]),
  async (req, res) => {
    const user = await User.findById(req.user.id);

    // Map to return more fields (you can expand this further if needed)
    const enrichedAddresses = user.addresses.map((addr) => ({
      ...addr.toObject(), // Include original address
      wasteType: addr.wasteType || "", // default empty string if missing
      urgency: addr.urgency || "low", // default to low
      weight: addr.weight || "", // optional weight
    }));

    res.json({ addresses: enrichedAddresses });
  }
);

// ✅ Request Pickup
router.post(
  "/request-pickup",
  authenticate,
  authorize(["resident"]),
  async (req, res) => {
    try {
      const { address, wasteType, urgency, latitude, longitude } = req.body;

      if (!address || !wasteType || !latitude || !longitude) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // 🔥 Validate urgency
      const validatedUrgency = validUrgencies.includes(urgency)
        ? urgency
        : "medium";

      // 1️⃣ Find the nearest center
      const nearestCenter = await Center.findOne({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: 10000, // 5 km radius
          },
        },
      });

      if (!nearestCenter) {
        return res
          .status(404)
          .json({ error: "No collection centers found nearby." });
      }

      console.log("Assigned Center:", nearestCenter);

      // 2️⃣ Find the nearest available collector linked to the center
      const nearestCollector = await User.findOne({
        _id: { $in: nearestCenter.collectors },
        role: "collector",
        isAvailable: true,
      }).sort({ lastWastePickup: 1 });

      if (!nearestCollector) {
        return res
          .status(404)
          .json({ error: "No available collectors at this center." });
      }

      console.log("Assigned Collector:", nearestCollector);

      // 3️⃣ Create the pickup request
      const newRequest = new PickupRequest({
        user: req.user.id,
        center: nearestCenter._id,
        assignedCollector: nearestCollector._id,
        address,
        wasteType,
        urgency: validatedUrgency,
        location: { type: "Point", coordinates: [longitude, latitude] },
        status: "pending",
        requestedAt: new Date(),
      });

      // ✅ Save the request to the database
      // ✅ Save the request to the database
      const savedRequest = await newRequest.save();
      await User.findByIdAndUpdate(req.user.id, {
        lastWastePickup: new Date(),
      });

      // 🔒 Save address to user if it's not already there
      const user = await User.findById(req.user.id);
      const alreadyExists = user.addresses.some(
        (a) =>
          a.address === address &&
          a.latitude === latitude &&
          a.longitude === longitude
      );

      if (!alreadyExists) {
        user.addresses.push({
          address,
          latitude,
          longitude,
          wasteType,
          urgency,
          weight: req.body.weight,
        });
        await user.save();
      }

      console.log("Saved Pickup Request:", savedRequest);

      // ✅ Update collector availability BEFORE sending the response
      nearestCollector.isAvailable = false;
      await nearestCollector.save();

      // 🔥 Log response before sending
      const responsePayload = {
        message: "Pickup request submitted & collector assigned!",
        request: savedRequest,
        assignedCollector: nearestCollector,
        center: nearestCenter,
      };

      console.log(
        "Response Payload:",
        JSON.stringify(responsePayload, null, 2)
      );

      // ✅ Send only ONE response
      res.status(201).json(responsePayload);
    } catch (error) {
      console.error("Error requesting pickup:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

// ✅ Collector Completes Pickup
router.put(
  "/complete-pickup/:id",
  authenticate,
  authorize(["collector", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const pickupRequest = await PickupRequest.findById(id)
        .populate("user", "name address")
        .populate("assignedCollector", "name isAvailable")
        .populate("center", "name location");

      if (!pickupRequest) {
        return res.status(404).json({ error: "Pickup request not found" });
      }

      if (pickupRequest.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Pickup already completed or canceled" });
      }

      // ✅ Mark the request as completed
      pickupRequest.status = "completed";
      pickupRequest.completedAt = new Date();
      await pickupRequest.save();

      // ✅ Set collector to available
      const collector = await User.findById(pickupRequest.assignedCollector);
      if (collector) {
        collector.isAvailable = true;
        await collector.save();
      }

      res
        .status(200)
        .json({ message: "Pickup completed!", request: pickupRequest });
    } catch (error) {
      console.error("Error completing pickup:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

// ✅ Get optimized route (ORS API)
router.post(
  "/get-directions",
  authenticate,
  authorize(["collector", "admin"]),
  async (req, res) => {
    try {
      const { start, end, profile } = req.body;

      if (!start || !end || !profile) {
        return res
          .status(400)
          .json({ error: "Start, end coordinates, and profile are required" });
      }

      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/${profile}`,
        {
          params: {
            api_key: ORS_API_KEY,
            coordinates: `${start[0]},${start[1]}|${end[0]},${end[1]}`,
            instructions: true,
          },
        }
      );

      res.json({ message: "Route fetched successfully", route: response.data });
    } catch (error) {
      console.error("Error fetching directions:", error);

      if (error.response) {
        res.status(error.response.status).json({
          error: "Failed to get route",
          details: error.response.data,
        });
      } else {
        res.status(500).json({ error: "Server error", details: error.message });
      }
    }
  }
);

// ✅ Apply middleware to protect the route
router.get(
  "/history",
  authenticate,
  authorize(["resident"]),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Fetch user's lastWastePickup date
      const user = await User.findById(userId).select("lastWastePickup");

      // Fetch pickup history
      const pickups = await PickupRequest.find({ user: userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        pickups,
        lastWastePickup: user ? user.lastWastePickup : null, // ✅ Send lastWastePickup in response
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  }
);

router.get("/:collectorId/completed-pickups", async (req, res) => {
  try {
    const { collectorId } = req.params;

    console.log("Incoming request for collector:", collectorId);

    const completedPickups = await PickupRequest.find({
      assignedCollector: collectorId,
      status: "completed",
    }).populate("user", "name"); // <-- Check 'user' field is correct

    console.log("Completed pickups:", completedPickups);

    res.json(completedPickups);
  } catch (err) {
    console.error("Error fetching completed pickups:", err);
    res.status(500).json({ error: err.message }); // show real error
  }
});

// ✅ Fetch pickups assigned to the logged-in collector
router.get(
  "/collector",
  authenticate,
  authorize(["collector"]),
  async (req, res) => {
    try {
      const collectorId = req.user.id;

      // ✅ Now assignedCollector exists, this will return correct results
      const pickups = await PickupRequest.find({
        assignedCollector: collectorId,
        status: { $in: ["pending", "assigned"] },
      })
        .populate("user", "name address")
        .populate("center", "name location")
        .sort({ requestedAt: -1 });

      res.status(200).json(pickups);
    } catch (error) {
      console.error("Error fetching collector pickups:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

// Use auth to get collector ID just like your /collector route
router.get(
  "/collector/stats",
  authenticate,
  authorize(["collector"]),
  async (req, res) => {
    try {
      const collectorId = req.user.id;
      const collectorObjectId = new mongoose.Types.ObjectId(collectorId);

      const monthlyStats = await PickupRequest.aggregate([
        {
          $match: {
            assignedCollector: collectorObjectId,
            completedAt: { $ne: null },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$completedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const statusBreakdown = await PickupRequest.aggregate([
        { $match: { assignedCollector: collectorObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({ monthlyStats, statusBreakdown });
    } catch (err) {
      console.error("Error fetching pickup stats:", err);
      res.status(500).json({ error: "Stats fetch failed" });
    }
  }
);

// GET /api/pickup/usage (Weekly Version)
router.get("/usage", async (req, res) => {
  try {
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 6 * 7); // Last 6 weeks

    // Group users by week
    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: sixWeeksAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%U", date: "$createdAt" }, // %U = week number
          },
          residents: { $sum: 1 },
        },
      },
    ]);

    // Group pickups by week
    const pickupStats = await PickupRequest.aggregate([
      { $match: { completedAt: { $gte: sixWeeksAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%U", date: "$completedAt" },
          },
          pickups: { $sum: 1 },
        },
      },
    ]);

    // Combine both stats
    const combined = {};
    userStats.forEach((entry) => {
      combined[entry._id] = {
        week: entry._id,
        residents: entry.residents,
        pickups: 0,
      };
    });
    pickupStats.forEach((entry) => {
      if (!combined[entry._id]) {
        combined[entry._id] = {
          week: entry._id,
          residents: 0,
          pickups: entry.pickups,
        };
      } else {
        combined[entry._id].pickups = entry.pickups;
      }
    });

    const result = Object.values(combined).sort((a, b) =>
      a.week.localeCompare(b.week)
    );

    res.json(result);
  } catch (err) {
    console.error("Weekly analytics error:", err);
    res.status(500).json({ error: "Weekly analytics fetch failed" });
  }
});

router.get(
  "/center/:centerId",
  authenticate,
  authorize(["admin", "collector"]),
  async (req, res) => {
    try {
      const { centerId } = req.params;

      const pickups = await PickupRequest.find({ center: centerId })
        .populate("user", "name address")
        .populate("assignedCollector", "name isAvailable")
        .sort({ requestedAt: -1 });

      res.status(200).json({ pickups });
    } catch (error) {
      console.error("Error fetching center pickups:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

// ✅ Get collectors of a center with availability
router.get(
  "/center/:centerId/collectors",
  authenticate,
  authorize(["admin", "collector"]),
  async (req, res) => {
    try {
      const centerId = req.params.centerId;
      const collectors = await User.find({
        center: centerId,
        role: "collector",
      }).select("name isAvailable");
      res.status(200).json(collectors);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Get pickup summary by center
router.get(
  "/center/:centerId/summary",
  authenticate,
  authorize(["admin", "collector"]),
  async (req, res) => {
    const { centerId } = req.params;
    try {
      const allPickups = await PickupRequest.find({ center: centerId });
      const summary = {
        total: allPickups.length,
        active: allPickups.filter((p) => p.status === "assigned").length,
        pending: allPickups.filter((p) => p.status === "pending").length,
        completed: allPickups.filter((p) => p.status === "completed").length,
      };
      res.status(200).json(summary);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
