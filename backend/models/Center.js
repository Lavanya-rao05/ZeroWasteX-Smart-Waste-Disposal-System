const mongoose = require("mongoose");

const CenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // ✅ Use MongoDB GeoJSON format for location
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

    collectors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Create a geospatial index for faster lookup
CenterSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Center", CenterSchema);
