const Booking = require("./booking.model");

//Check Overlap Helper
const isRoomAvailable = async (roomId, checkIn, checkOut) => {
  const conflict = await Booking.findOne({
    room: roomId,
    bookingStatus: { $ne: "cancelled" },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      },
    ],
  });
  return !conflict;
};

// Create Booking
const createABooking = async (req, res) => {
  try {
    const { room, checkIn, checkOut, email, adults } = req.body;

    // 1. validation
    if (!room || !checkIn || !checkOut || !email) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({
        message: "Check-out must be after check-in",
      });
    }

    if (adults <= 0) {
      return res.status(400).json({
        message: "Invalid guest count",
      });
    }

    // 2. availability check
    const available = await isRoomAvailable(
      room,
      new Date(checkIn),
      new Date(checkOut),
    );

    if (!available) {
      return res.status(409).json({
        message: "Room already booked for selected dates",
      });
    }

    const newBooking = new Booking(req.body);

    const savedBooking = await newBooking.save();

    res.status(200).json({
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking", error);

    res.status(500).json({
      message: "Failed to create booking",
    });
  }
};

// Get Bookings By Email
const getBookingsByEmail = async (req, res) => {
  const email = req.params.email;

  try {
    const bookings = await Booking.find({ email })
      .populate("room")
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(404).json({
        message: "No bookings found for this email",
      });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings", error);

    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
};

// Get Single Booking
const getSingleBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("room");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking", error);

    res.status(500).json({
      message: "Failed to fetch booking",
    });
  }
};

// Update Booking Status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus },
      { new: true },
    );

    if (!updatedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking", error);

    res.status(500).json({
      message: "Failed to update booking",
    });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "cancelled",
      },
      {
        new: true,
      },
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking", error);

    res.status(500).json({
      message: "Failed to cancel booking",
    });
  }
};

// Delete Booking
const deleteABooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking deleted successfully",
      booking: deletedBooking,
    });
  } catch (error) {
    console.error("Error deleting booking", error);

    res.status(500).json({
      message: "Failed to delete booking",
    });
  }
};

module.exports = {
  createABooking,
  getBookingsByEmail,
  getSingleBooking,
  updateBookingStatus,
  cancelBooking,
  deleteABooking,
};
