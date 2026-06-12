const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    location: String,
    image: String,
    price: Number,
    status: {
      type: String,
      enum: ["available", "reserved"],
      default: "available",
    },
    capacity: {
      adults: Number,
      child: Number,
    },

    checkIn: String,
    checkOut: String,

    beds: Number,
    size: String,

    facilities: [
      {
        title: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
