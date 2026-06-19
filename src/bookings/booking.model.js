const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    guest: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
      },

      country: String,
    },

    stay: {
      checkIn: {
        type: Date,
        required: true,
      },

      checkOut: {
        type: Date,
        required: true,
      },

      nights: {
        type: Number,
        required: true,
        min: 1,
      },

      adults: {
        type: Number,
        required: true,
        min: 1,
      },

      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    bookingSource: {
      type: String,
      enum: ["website", "phone", "walk_in", "facebook", "admin"],
      default: "website",
    },

    extras: [
      {
        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    specialRequests: {
      type: String,
      maxlength: 2000,
    },

    pricing: {
      roomPrice: {
        type: Number,
        required: true,
      },

      discountPercent: {
        type: Number,
        default: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
      },

      taxPercent: {
        type: Number,
        default: 0,
      },

      taxAmount: {
        type: Number,
        default: 0,
      },

      serviceFeePercent: {
        type: Number,
        default: 0,
      },

      serviceFeeAmount: {
        type: Number,
        default: 0,
      },

      extrasTotal: {
        type: Number,
        default: 0,
      },

      subtotal: {
        type: Number,
        required: true,
      },

      totalPrice: {
        type: Number,
        required: true,
      },

      currency: {
        type: String,
        default: "MMK",
      },
    },

    payment: {
      method: {
        type: String,
        enum: ["cash", "kbzpay", "wavepay", "stripe", "bank_transfer"],
        default: "cash",
      },

      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partial_refund"],
        default: "pending",
      },

      paidAt: Date,

      transactionId: String,

      refundAmount: {
        type: Number,
        default: 0,
      },
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ],
      default: "pending",
      index: true,
    },

    cancellation: {
      reason: String,

      cancelledAt: Date,

      cancelledBy: {
        type: String,
        enum: ["guest", "admin"],
      },

      refundAmount: {
        type: Number,
        default: 0,
      },
    },

    internalNotes: {
      type: String,
      maxlength: 3000,
    },

    statusHistory: [
      {
        status: String,

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    revenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Revenue",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({
  room: 1,
  "stay.checkIn": 1,
  "stay.checkOut": 1,
});

bookingSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model("Booking", bookingSchema);
