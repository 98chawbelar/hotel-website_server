const mongoose = require("mongoose");
const calculateBookingPrice = require("../utils/calculateBookingPrice");
const Booking = require("./booking.model");
const Room = require("../rooms/room.model");

// Check Room Availability
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

// Create Booking
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

    // validation

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

    // find room

    const roomData = await Room.findById(room).session(session);

    if (!roomData) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // capacity check

    const totalGuests = (stay.adults || 0) + (stay.children || 0);

    if (totalGuests > roomData.capacity.adults) {
      return res.status(400).json({
        message: "Guest limit exceeded",
      });
    }

    // check availability

    const available = await isRoomAvailable(room, checkIn, checkOut, session);

    if (!available) {
      return res.status(409).json({
        message: "Room already booked",
      });
    }

    // calculate price
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

        discountAmount: pricing.discountAmount || 0,

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

    await booking.save({
      session,
    });

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

// Preview Price
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

// Get All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()

      .populate("room")

      .sort({
        createdAt: -1,
      });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Booking By Email
const getBookingsByEmail = async (req, res) => {
  try {
    const bookings = await Booking.find({
      "guest.email": req.params.email.toLowerCase(),
    })
      .populate("room")
      .sort({
        createdAt: -1,
      });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Booking
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

// Update Status
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.bookingStatus = req.body.bookingStatus;

    booking.statusHistory.push({
      status: req.body.bookingStatus,

      changedAt: new Date(),
    });

    await booking.save();

    res.json({
      message: "Status updated",

      booking,
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

  updateBookingStatus,
};
