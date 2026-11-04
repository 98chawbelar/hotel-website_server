const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://kandaw-101-hotel.vercel.app"],
    credentials: true,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
const adminAuthRoutes = require("./src/admin/admin.route");
const adminRoutes = require("./src/status/admin.stats");
const bookingRoutes = require("./src/bookings/booking.route");
const roomRoutes = require("./src/rooms/room.route");
const facilityRoutes = require("./src/facilities/facility.route");
const revenueRoutes = require("./src/revenue/revenue.route");
const extraFacilityRoutes = require("./src/extrafacilities/extrafacility.route");

app.use("/api/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/extrafacilities", extraFacilityRoutes);

// root route
app.get("/", (req, res) => {
  res.send("Kandaw101Hotel Server is running!");
});

// MongoDB connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Export Express app for Vercel
module.exports = app;

// Local development server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Kandaw101Hotel app listening on port ${port}`);
  });
}
