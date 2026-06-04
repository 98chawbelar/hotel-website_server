const express = require("express");
const router = express.Router();

const Booking = require("../bookings/booking.model");
const Room = require("../rooms/room.model");

// ================= ADMIN DASHBOARD STATS =================
router.get("/", async (req, res) => {
  try {
    // ================= TOTAL BOOKINGS =================
    const totalBookings = await Booking.countDocuments();

    // ================= TOTAL ROOMS =================
    const totalRooms = await Room.countDocuments();

    // ================= TOTAL REVENUE =================
    const revenueResult = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // ================= ROOM STATUS =================
    const roomStats = await Room.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // ================= AVAILABLE ROOMS =================
    const availableRooms =
      roomStats.find((room) => room._id === "available")?.count || 0;

    // ================= RESERVED ROOMS =================
    const reservedRooms =
      roomStats.find((room) => room._id === "reserved")?.count || 0;

    // ================= MONTHLY REVENUE =================
    const monthlyRevenue = await Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          totalRevenue: {
            $sum: "$totalPrice",
          },
          totalBookings: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // ================= RESPONSE =================
    res.status(200).json({
      totalBookings,
      totalRooms,
      availableRooms,
      reservedRooms,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);

    res.status(500).json({
      message: "Failed to fetch admin stats",
    });
  }
});

module.exports = router;
