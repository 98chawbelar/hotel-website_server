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

    child: Number,

    extras: [String],

    specialRequests: String,

    paymentMethod: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    pricing: {
      nights: Number,
      roomPrice: Number,
      subtotal: Number,
      discount: Number,
      extrasTotal: Number,
      totalPrice: Number,
      currency: String,
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
