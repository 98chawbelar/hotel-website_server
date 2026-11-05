const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://kandaw-101-hotel.vercel.app"],
    credentials: true,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection cache for Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.DB_URL) {
    throw new Error("DB_URL is not configured");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.DB_URL, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully!");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};

// Ensure MongoDB is connected before API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);

    res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again.",
    });
  }
});

// Routes
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

// Root route
app.get("/", (req, res) => {
  res.send("Kandaw101Hotel Server is running!");
});

// Export Express app for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Kandaw101Hotel app listening on port ${port}`);
  });
}
