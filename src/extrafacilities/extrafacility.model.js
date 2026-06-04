const mongoose = require("mongoose");

const extraFacilitySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    label: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    desc: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const ExtraFacility = mongoose.model("ExtraFacility", extraFacilitySchema);
