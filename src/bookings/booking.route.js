const express = require("express");
const router = express.Router();

const {
  createABooking,
  getBookingsByEmail,
  getSingleBooking,
  updateBookingStatus,
  calculatePricePreview,
  getAllBookings,
  getBookingByCode,
} = require("./booking.controller");

router.post("/price-preview", calculatePricePreview);

// Create Booking
router.post("/", createABooking);

//Get All Bookings
router.get("/", getAllBookings);

// Get Booking By Email
router.get("/email/:email", getBookingsByEmail);

// Get Booking By Code
router.get("/code/:code", getBookingByCode);

// Get Single Booking Data
router.get("/:id", getSingleBooking);

//Get Booking Status
router.patch("/:id/status", updateBookingStatus);

module.exports = router;
