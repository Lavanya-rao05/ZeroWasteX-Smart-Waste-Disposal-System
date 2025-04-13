const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  distance: Number,
  duration: Number,
  type: Number,
  instruction: String,
  name: String,
  way_points: [Number]
});

const SegmentSchema = new mongoose.Schema({
  distance: Number,
  duration: Number,
  steps: [StepSchema]
});

const RouteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  segments: [SegmentSchema],
  startLocation: {
    type: {
      lat: Number,
      lng: Number
    },
    required: true
  },
  endLocation: {
    type: {
      lat: Number,
      lng: Number
    },
    required: true
  },
  waypoints: [{
    lat: Number,
    lng: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);
