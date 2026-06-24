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
  cancelBooking,
  deleteBooking,
  resendBookingEmail,
} = require("./booking.controller");

router.post("/price-preview", calculatePricePreview);

// Create Booking
router.post("/", createABooking);
router.post("/:id/resend-email", resendBookingEmail);

//Get All Bookings
router.get("/", getAllBookings);
router.get("/email/:email", getBookingsByEmail);
router.get("/code/:code", getBookingByCode);
router.get("/:id", getSingleBooking);

router.patch("/:id/status", updateBookingStatus);
router.patch("/:id/cancel", cancelBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
