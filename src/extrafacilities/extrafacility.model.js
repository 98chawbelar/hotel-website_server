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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    pricingType: {
      type: String,
      enum: ["per_booking", "per_night", "per_person"],
      default: "per_booking",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
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
