const mongoose = require("mongoose");

// One rate card per (orderType, zoneType) combination.
// zoneType is derived automatically at order time: pickupZone === deliveryZone -> "intra", else "inter".
const rateCardSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true,
    },

    zoneType: {
      type: String,
      enum: ["intra", "inter"],
      required: true,
    },

    baseCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    // Charged per kg of chargeable weight (higher of actual vs volumetric)
    pricePerKg: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedDays: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

rateCardSchema.index(
  { orderType: 1, zoneType: 1 },
  { unique: true }
);

module.exports = mongoose.model("RateCard", rateCardSchema);
