const mongoose = require("mongoose");

// Admin-configurable COD surcharge, one entry per order type (B2B / B2C)
const codConfigSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true,
      unique: true,
    },

    // Flat surcharge added to the delivery charge when paymentType === "COD"
    surchargeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CodConfig", codConfigSchema);
