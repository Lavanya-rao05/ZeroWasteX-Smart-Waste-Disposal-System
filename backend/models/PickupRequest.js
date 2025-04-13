const mongoose = require("mongoose");

const PickupRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center" }, // ✅ Ensure center is included
    assignedCollector: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    address: { type: String, required: true },
    wasteType: { type: String, required: true },
    urgency: { type: String, enum: ["low", "medium", "high"], required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
    
});

module.exports = mongoose.model("PickupRequest", PickupRequestSchema);
