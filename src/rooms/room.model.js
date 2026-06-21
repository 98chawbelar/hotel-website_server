const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    basePrice: {
      type: Number,
      required: true,
    },

    priceConfig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Price",
    },

    roomNumber: {
      type: String,
      unique: true,
    },

    roomType: {
      type: String,
      enum: [
        "Superior King",
        "Superior Twin",
        "Deluxe King",
        "Deluxe Twin",
        "Family",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "maintenance", "cleaning"],
      default: "available",
    },

    capacity: {
      adults: {
        type: Number,
        required: true,
        min: 1,
      },

      child: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    checkIn: {
      type: String,
    },

    checkOut: {
      type: String,
    },

    beds: {
      type: Number,
      default: 1,
    },

    size: {
      type: String,
    },

    facilitiesConfig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facilities",
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

module.exports = mongoose.model("Room", roomSchema);
