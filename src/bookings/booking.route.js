const express = require("express");
const router = express.Router();

const {
  createABooking,
  getBookingsByEmail,
  getSingleBooking,
  updateBookingStatus,
  deleteABooking,
  cancelBooking,
  calculatePricePreview,
  getAllBookings,
} = require("./booking.controller");

router.post("/price-preview", calculatePricePreview);

// Create Booking
router.post("/", createABooking);

//Get All Bookings
router.get("/", getAllBookings);

// Get Booking By Email
router.get("/email/:email", getBookingsByEmail);

// Get Single Booking Data
router.get("/:id", getSingleBooking);

//Get Booking Status
router.patch("/:id/status", updateBookingStatus);

//Get Cancel Booking
router.patch("/:id/cancel", cancelBooking);

//Get DeleteBooking
router.delete("/:id", deleteABooking);

module.exports = router;
