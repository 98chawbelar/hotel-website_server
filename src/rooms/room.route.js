const express = require("express");
const Room = require("./room.model");
const upload = require("../middleware/upload");
const {
  postARoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteARoom,
} = require("./room.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const router = express.Router();

// post a room
router.post("/create-room", upload.single("image"), postARoom);

// get all rooms
router.get("/", getAllRooms);

// single room endpoint
router.get("/:id", getSingleRoom);

// update a room endpoint
router.put("/edit/:id", verifyAdminToken, updateRoom);

// delete a room endpoint
router.delete("/:id", verifyAdminToken, deleteARoom);

module.exports = router;
