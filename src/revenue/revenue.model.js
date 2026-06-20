const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "Ks",
    },

    paymentMethod: String,

    type: {
      type: String,
      enum: ["booking_payment", "refund", "service_fee"],
      default: "booking_payment",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },

    transactionDate: {
      type: Date,
      default: Date.now,
    },

    notes: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Revenue", revenueSchema);
