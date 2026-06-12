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
    const { id } = req.params;

    const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });

    if (!updatedRoom) {
      return res.status(404).send({
        message: "Room not found!",
      });
    }

    res.status(200).send({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room", error);
    res.status(500).send({
      message: "Failed to update room",
    });
  }
};

// Delete Room
const deleteARoom = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).send({
        message: "Room not found!",
      });
    }

    res.status(200).send({
      message: "Room deleted successfully",
      room: deletedRoom,
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
