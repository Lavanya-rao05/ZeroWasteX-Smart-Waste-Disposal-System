const express = require("express");
const WasteNotification = require("../models/WasteNotification");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const router = express.Router();

// ✅ 1. Create a Waste Pickup Request
router.post("/", async (req, res) => {
  try {
    console.log("Received Request:", req.body);
    const { user, center, address } = req.body;

    if (!user || !center || !address) {
      return res
        .status(400)
        .json({ error: "User, center, and address are required" });
    }

    const newRequest = new WasteNotification({ user, center, address });
    await newRequest.save();

    res
      .status(201)
      .json({ message: "Waste pickup request created", request: newRequest });
  } catch (error) {
    console.error("Error creating waste request:", error);
    res.status(500).json({ error: "Error creating waste request" });
  }
});

// ✅ 2. Get All Pending Waste Pickup Requests
router.get("/pending", async (req, res) => {
  try {
    const requests = await WasteNotification.find({ status: "pending" })
      .populate("user", "name email")
      .populate("center", "name location");

    res.json(requests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ 3. Assign a Collector to a Request
router.put("/:id/assign", async (req, res) => {
  try {
    const { assignedCollector } = req.body;
    const requestId = req.params.id;

    if (!assignedCollector) {
      return res.status(400).json({ error: "Collector ID is required" });
    }

    const updatedRequest = await WasteNotification.findByIdAndUpdate(
      requestId,
      { assignedCollector },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Waste pickup request not found" });
    }

    res.json({ message: "Collector assigned", request: updatedRequest });
  } catch (error) {
    console.error("Error assigning collector:", error);
    res.status(500).json({ error: "Server error while assigning collector" });
  }
});

// ✅ 4. Mark Request as "Collected"
router.put("/:id/collected", async (req, res) => {
  try {
    const requestId = req.params.id;

    const updatedRequest = await WasteNotification.findByIdAndUpdate(
      requestId,
      { status: "collected", updatedAt: new Date() }, // ✅ Ensure `updatedAt` updates
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Waste pickup request not found" });
    }

    res.json({ message: "Waste marked as collected", request: updatedRequest });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Error updating status" });
  }
});

// ✅ 5. Fetch Users Who Haven’t Given Waste in 7 Days

router.get("/inactive-users", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    console.log("🔹 Today:", today);
    console.log("🔹 Seven Days Ago:", sevenDaysAgo);

    // 🔹 1. Get last waste collection date from WasteNotification
    const lastPickupDates = await WasteNotification.aggregate([
      { $match: { status: "collected" } },
      {
        $group: {
          _id: "$user",
          lastPickup: { $max: "$updatedAt" }, // Latest collection date
        },
      },
    ]);

    console.log("🔹 Last Pickup Dates:", lastPickupDates); // Debugging

    // Convert lastPickupDates to a Set of inactive resident IDs
    const inactiveUserIds = new Set(
      lastPickupDates
        .filter((user) => {
          console.log(
            `🟡 Checking user ${user._id}: Last Pickup = ${user.lastPickup}`
          );
          return new Date(user.lastPickup) < sevenDaysAgo; // ✅ Correct comparison
        })
        .map((user) => user._id.toString())
    );

    console.log("🛑 Inactive User IDs:", [...inactiveUserIds]); // Debugging

    // 🔹 2. Fetch only residents (exclude collectors/admins)
    const allResidents = await User.find(
      { role: "resident" },
      "_id name email lastWastePickup"
    );

    console.log("🔹 All Residents:", allResidents);

    // Filter inactive residents: (1) Never gave waste OR (2) Last pickup > 7 days ago
    const inactiveResidents = allResidents.filter((user) => {
      const lastPickupDate = new Date(user.lastWastePickup); // Convert to Date
      const isInactive = isNaN(lastPickupDate) || lastPickupDate < sevenDaysAgo; // Correct condition

      console.log(
        `🔍 Checking ${user.name}: Last Pickup = ${user.lastWastePickup}, Inactive = ${isInactive}`
      );
      return isInactive;
    });

    console.log("🛑 Final Inactive Residents:", inactiveResidents); // Debugging

    // 🔹 3. Send email notifications to inactive residents
    inactiveResidents.forEach((user) => {
      sendEmail(
        user.email,
        "⚠️ Waste Collection Reminder",
        `Hello ${user.name}, it's been a week since your last waste pickup. Please schedule your waste collection!`
      );
    });

    res.json({ message: "Notifications sent", users: inactiveResidents });
  } catch (error) {
    console.error("❌ Error fetching inactive residents:", error);
    res.status(500).json({ error: "Error fetching inactive residents" });
  }
});

module.exports = router;
