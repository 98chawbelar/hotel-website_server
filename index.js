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
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/status/admin.stats");
const bookingRoutes = require("./src/bookings/booking.route");
const roomRoutes = require("./src/rooms/room.route");
const facilityRoutes = require("./src/facilities/facility.route");
const extraFacilityRoutes = require("./src/extrafacilities/extrafacility.route");

app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/extrafacilities", extraFacilityRoutes);

async function main() {
  await mongoose.connect(process.env.DB_URL);
  app.use("/", (req, res) => {
    res.send("Kandaw101Hotel Server is running!");
  });
}

main()
  .then(() => console.log("Mongodb connect successfully!"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Kandaw101Hotel app listening on port ${port}`);
});
