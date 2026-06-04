const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    country: String,

    checkIn: Date,
    checkOut: Date,

    adults: Number,
    children: Number,

    extras: [String],

    specialRequests: String,

    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    totalPrice: Number,

    bookingStatus: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
