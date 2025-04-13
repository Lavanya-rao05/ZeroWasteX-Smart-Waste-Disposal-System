const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  wasteType: { type: String },
  urgency: { type: String, enum: ["low", "medium", "high"], default: "low" },
  weight: { type: String, default: "" }, // could also be Number if you want
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["resident", "collector", "admin"],
      default: "resident",
    },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center" },
    lastWastePickup: { type: Date, default: null },
    isAvailable: { type: Boolean, default: true },
    nextReminder: { type: Date, default: null },
    addresses: [addressSchema],
  },
  { timestamps: true }
);



module.exports = mongoose.model("User", UserSchema);
