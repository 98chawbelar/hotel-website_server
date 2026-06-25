const mongoose = require("mongoose");
const calculateBookingPrice = require("../utils/calculateBookingPrice");
const Booking = require("./booking.model");
const Room = require("../rooms/room.model");
const Revenue = require("../revenue/revenue.model");
const sendBookingConfirmation = require("../services/bookingEmail.service");

// CHECK ROOM AVAILABILITY
const isRoomAvailable = async (roomId, checkIn, checkOut, session = null) => {
  const query = Booking.findOne({
    room: roomId,

    bookingStatus: {
      $in: ["pending", "confirmed", "checked_in"],
    },

    "stay.checkIn": {
      $lt: checkOut,
    },

    "stay.checkOut": {
      $gt: checkIn,
    },
  });

  if (session) {
    query.session(session);
  }

  const conflict = await query;

  return !conflict;
};

// CREATE BOOKING
const createABooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      room,
      guest,
      stay,
      extras = [],
      specialRequests,
      payment,
    } = req.body;

    // VALIDATION
    if (!room) {
      return res.status(400).json({
        message: "Room required",
      });
    }

    if (!guest?.firstName || !guest?.lastName || !guest?.email) {
      return res.status(400).json({
        message: "Guest information required",
      });
    }

    if (!stay?.checkIn || !stay?.checkOut) {
      return res.status(400).json({
        message: "Stay dates required",
      });
    }

    const checkIn = new Date(stay.checkIn);
    const checkOut = new Date(stay.checkOut);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        message: "Invalid booking dates",
      });
    }

    // FIND ROOM
    const roomData = await Room.findById(room).session(session);

    if (!roomData) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // CAPACITY CHECK
    const totalGuests = (stay.adults || 0) + (stay.children || 0);

    if (totalGuests > roomData.capacity.adults) {
      return res.status(400).json({
        message: "Guest limit exceeded",
      });
    }

    // CHECK AVAILABILITY
    const available = await isRoomAvailable(room, checkIn, checkOut, session);

    if (!available) {
      return res.status(409).json({
        message: "Room already booked",
      });
    }

    // CALCULATE PRICE
    const extrasTotal = extras.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    const pricing = await calculateBookingPrice({
      roomPrice: roomData.basePrice,
      checkIn,
      checkOut,
      extrasTotal,
    });

    // CREATE BOOKING
    const booking = new Booking({
      bookingCode: "BK-" + Date.now() + "-" + Math.floor(Math.random() * 999),

      room,

      guest: {
        ...guest,
        email: guest.email.toLowerCase(),
      },

      stay: {
        ...stay,
        nights: pricing.nights,
      },

      extras,

      specialRequests,

      pricing: {
        roomPrice: pricing.roomPrice,
        weeklyDiscount: pricing.weeklyDiscount || 0,
        monthlyDiscount: pricing.monthlyDiscount || 0,

        discountAmount:
          (pricing.weeklyDiscount || 0) + (pricing.monthlyDiscount || 0),

        taxAmount: pricing.taxAmount || 0,
        serviceFeeAmount: pricing.serviceFeeAmount || 0,

        extrasTotal: pricing.extrasTotal,
        subtotal: pricing.subtotal,
        totalPrice: pricing.totalPrice,
        currency: pricing.currency,
      },

      payment: {
        method: payment?.method || "cash",
        status: "pending",
      },

      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
        },
      ],
    });

    await booking.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    await session.abortTransaction();

    console.log(error);

    res.status(500).json({
      message: "Booking failed",
    });
  } finally {
    session.endSession();
  }
};

// PRICE PREVIEW
const calculatePricePreview = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, extrasTotal = 0 } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const pricing = await calculateBookingPrice({
      roomPrice: room.basePrice,
      checkIn,
      checkOut,
      extrasTotal,
    });

    res.json(pricing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL BOOKINGS
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET BOOKINGS BY EMAIL
const getBookingsByEmail = async (req, res) => {
  try {
    const bookings = await Booking.find({
      "guest.email": req.params.email.toLowerCase(),
    })
      .populate("room")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE BOOKING
const getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET BOOKING BY CODE
const getBookingByCode = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingCode: req.params.code,
    }).populate("room");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE STATUS
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const { bookingStatus, paymentStatus } = req.body;

    // BOOKING STATUS
    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;

      booking.statusHistory.push({
        status: bookingStatus,
        changedAt: new Date(),
      });
    }

    // PAYMENT STATUS
    if (paymentStatus) {
      booking.payment.status = paymentStatus;

      if (paymentStatus === "paid") {
        booking.payment.paidAt = new Date();
      }
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate(
      "room",
    );

    // CREATE REVENUE + SEND EMAIL
    if (paymentStatus === "paid") {
      const existingRevenue = await Revenue.findOne({
        booking: booking._id,
      });

      if (!existingRevenue) {
        await Revenue.create({
          booking: booking._id,
          room: booking.room,
          amount: booking.pricing.totalPrice,
          paymentMethod: booking.payment.method,
          status: "completed",
          type: "booking_payment",
        });
      }

      await sendBookingConfirmation(populatedBooking);
    }

    res.json({
      message: "Booking updated successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// CANCEL BOOKING (SOFT DELETE)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    // SAFE BODY
    const body = req.body || {};

    booking.bookingStatus = "cancelled";

    booking.cancellation = {
      cancelledBy: body.cancelledBy || "guest",

      reason: body.reason || "Booking cancelled",

      refundAmount: Number(body.refundAmount || 0),

      cancelledAt: new Date(),
    };

    booking.statusHistory.push({
      status: "cancelled",
      changedAt: new Date(),
    });

    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// RESEND EMAIL
const resendBookingEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.payment.status !== "paid") {
      return res.status(400).json({
        message: "Email can only be sent after payment",
      });
    }

    await sendBookingConfirmation(booking);

    res.json({
      message: "Email resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN PERMANENT DELETE
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      message: "Booking permanently deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createABooking,
  calculatePricePreview,
  getAllBookings,
  getBookingsByEmail,
  getSingleBooking,
  getBookingByCode,
  updateBookingStatus,
  cancelBooking,
  resendBookingEmail,
  deleteBooking,
};
