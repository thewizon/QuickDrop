const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Set by admin when creating an order on a customer's behalf; otherwise same as customer
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pickupZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },

    deliveryZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },

    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["Prepaid", "COD"],
      required: true,
    },

    // Package dimensions in cm
    length: { type: Number, required: true, min: 0.1 },
    breadth: { type: Number, required: true, min: 0.1 },
    height: { type: Number, required: true, min: 0.1 },

    actualWeight: {
      type: Number,
      required: true,
      min: 0.01,
    },

    volumetricWeight: {
      type: Number,
      required: true,
    },

    // Higher of actualWeight vs volumetricWeight - what the customer is billed on
    chargeableWeight: {
      type: Number,
      required: true,
    },

    zoneType: {
      type: String,
      enum: ["intra", "inter"],
      required: true,
    },

    // Snapshot of pricing at order creation (so later rate-card edits don't retroactively change past orders)
    baseCharge: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    codSurcharge: { type: Number, required: true, default: 0 },
    deliveryCharge: { type: Number, required: true },

    estimatedDays: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "created",
        "assigned",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "rescheduled",
        "cancelled",
      ],
      default: "created",
    },

    // Populated when a delivery attempt fails
    failureReason: {
      type: String,
      default: null,
    },

    // Customer-requested new delivery date after a failed attempt
    rescheduledDate: {
      type: Date,
      default: null,
    },

    // How many delivery attempts have been made
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
