const mongoose = require("mongoose");

const extraFacilitySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "",
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    desc: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    pricingType: {
      type: String,
      enum: ["per_booking", "per_night", "per_person"],
      default: "per_booking",
    },

    maxQuantity: {
      type: Number,
      default: 1,
    },

    availableFor: {
      type: String,
      enum: ["all", "room", "guest"],
      default: "all",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ExtraFacility", extraFacilitySchema);
