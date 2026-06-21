const express = require("express");
const upload = require("../middleware/upload");

const verifyAdminToken = require("../middleware/verifyAdminToken");

const {
  postARoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteARoom,
  getArchivedRooms,
  restoreRoom,
  permanentDeleteRoom,
} = require("./room.controller");

const router = express.Router();

// Create Room
router.post(
  "/create-room",
  verifyAdminToken,
  upload.array("images", 20),
  postARoom,
);

// Get All Rooms
router.get("/", getAllRooms);

// Archived Rooms
router.get("/archived/all", verifyAdminToken, getArchivedRooms);

// Get Single Room
router.get("/:id", getSingleRoom);

// Update Rooms
router.put(
  "/edit/:id",
  verifyAdminToken,
  upload.array("images", 20),
  updateRoom,
);

// Soft Delete Rooms
router.delete("/:id", verifyAdminToken, deleteARoom);

// Restore Archived Rooms
router.patch("/restore/:id", verifyAdminToken, restoreRoom);
// Permanent Delete Rooms
router.delete("/permanent-delete/:id", verifyAdminToken, permanentDeleteRoom);

module.exports = router;
