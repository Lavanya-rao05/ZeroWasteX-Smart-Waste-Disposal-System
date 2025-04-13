const Pickup = require("../models/Pickup");

// 👇 Function to handle pickup request
exports.requestPickup = async (req, res) => {
  try {
    const { address, wasteType, urgency, latitude, longitude } = req.body;

    if (!address || !wasteType || !latitude || !longitude) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const pickup = new Pickup({
      user: req.user.id,
      address,
      wasteType,
      urgency,
      latitude,
      longitude,
      status: "pending",
    });
    

    await pickup.save();

    res.status(201).json({
      message: "Pickup request submitted & collector assigned!",
      request: pickup,
    });
  } catch (error) {
    console.error("Pickup request error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
