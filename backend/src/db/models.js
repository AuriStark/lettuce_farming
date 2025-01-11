const mongoose = require("mongoose");

const cropType = {
  type: String,
  enum: ["lettuce", "radish"],
  default: "lettuce",
};

const jobSchema = mongoose.Schema({
  name: String,

  operation: {
    type: String,
    enum: ["seeding", "watering"],
    default: "seeding",
  },

  fieldBondary: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },

  seedingDetails: {
    cropType: cropType,
    depth: Number,
    plantDistance: Number,
  },

  wateringDetails: {
    cropType: cropType,
    amountMl: Number,
    amountMs: Number,
    heightAboveGround: Number,
    interval: Number,
    scheduledAt: Date,
    activated: { type: Boolean, default: true },
    executedDates: [Date],
  },

  sensingDetail: {
    depth: Number,
    interval: Number,
  },

  createdAt: { type: Date, default: Date.now },
  executedAt: Date,

  executed: { type: Boolean, default: false },

  progress: { type: Number, default: 0 },
});

const seedSchema = mongoose.Schema({
  cropType: cropType,
  position: {
    x: Number,
    y: Number,
    z: Number,
  },
  humidityValue: Number,
  lastHumdityMeasureTime: { type: Date, default: Date.now },
  seededtime: { type: Date, default: Date.now },
});

const userSchema = mongoose.Schema({
  name: String,
  picture: String,

  allowedField: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },

  zSafe: Number,
  zSeedSafe: Number,
  humidityInterval: Number,

  seederPos: {
    x: Number,
    y: Number,
    z: Number,
  },

  defaultValues: {
    radish: {
      wateringAmount: Number,
      wateringDistanceAbeveTheGround: Number,
      wateringInterval: Number,
    },
    lettuce: {
      wateringAmount: Number,
      wateringDistanceAbeveTheGround: Number,
      wateringInterval: Number,
    },
  },
});

const JobModel = mongoose.model("Job", jobSchema);
const seedModel = mongoose.model("seed", seedSchema);
const userModel = mongoose.model("user", userSchema);
module.exports = { JobModel, seedModel, userModel };
