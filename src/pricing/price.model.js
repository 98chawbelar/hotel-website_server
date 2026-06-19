const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: "Ks",
    },

    weeklyDiscountPercent: {
      type: Number,
      default: 5,
    },

    monthlyDiscountPercent: {
      type: Number,
      default: 10,
    },

    taxPercent: {
      type: Number,
      default: 0,
    },

    serviceFeePercent: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Price", priceSchema);
