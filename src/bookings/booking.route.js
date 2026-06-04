const express = require("express");
const router = express.Router();

const {
  createABooking,
  getBookingsByEmail,
  getSingleBooking,
  updateBookingStatus,
  deleteABooking,
  cancelBooking,
} = require("./booking.controller");

// Create Booking
router.post("/", createABooking);

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
