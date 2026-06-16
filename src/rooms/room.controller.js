const fs = require("fs");
const path = require("path");
const Room = require("./room.model");

// Create Room
const postARoom = async (req, res) => {
  try {
    const newRoom = new Room({
      ...req.body,
      capacity: req.body.capacity,
      image: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : "",
    });

    await newRoom.save();

    res.status(200).send({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("Error creating room", error);
    res.status(500).send({
      message: "Failed to create room",
    });
  }
};

// Get All Rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });

    res.status(200).send(rooms);
  } catch (error) {
    console.error("Error fetching rooms", error);
    res.status(500).send({
      message: "Failed to fetch rooms",
    });
  }
};

// Get Single Room
const getSingleRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).send({
        message: "Room not found!",
      });
    }

    res.status(200).send(room);
  } catch (error) {
    console.error("Error fetching room", error);
    res.status(500).send({
      message: "Failed to fetch room",
    });
  }
};

// Update Room
const updateRoom = async (req, res) => {
  try {
    console.log("BODY =>", req.body);
    console.log("FILE =>", req.file);
    console.log("ID =>", req.params.id);

    const { id } = req.params;

    // old room
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).send({
        message: "Room not found!",
      });
    }

    // =========================
    // DELETE OLD IMAGE
    // =========================
    if (req.file && room.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads",
        path.basename(room.image),
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // =========================
    // PARSE CAPACITY
    // =========================
    let capacity = room.capacity;

    if (req.body.capacity) {
      capacity = JSON.parse(req.body.capacity);
    }

    // =========================
    // IMAGE URL
    // =========================
    const image = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : room.image;

    // =========================
    // UPDATE DATA
    // =========================
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        location: req.body.location,
        price: Number(req.body.price),
        beds: Number(req.body.beds),
        size: req.body.size,
        status: req.body.status,
        capacity,
        image,
      },
      {
        new: true,
      },
    );

    res.status(200).send({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed to update room",
    });
  }
};

// Delete Room
const deleteARoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).send({
        message: "Room not found!",
      });
    }

    // =========================
    // DELETE IMAGE FILE
    // =========================
    if (room.image) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        path.basename(room.image),
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // =========================
    // DELETE ROOM
    // =========================
    await Room.findByIdAndDelete(id);

    res.status(200).send({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room", error);

    res.status(500).send({
      message: "Failed to delete room",
    });
  }
};

module.exports = {
  postARoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteARoom,
};
