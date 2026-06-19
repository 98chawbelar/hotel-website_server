const fs = require("fs");
const path = require("path");
const slugify = require("slugify");
const Room = require("./room.model");

// Create Room
const postARoom = async (req, res) => {
  try {
    let capacity = {};

    if (req.body.capacity) {
      try {
        capacity = JSON.parse(req.body.capacity);
      } catch {
        return res.status(400).json({
          message: "Invalid capacity format",
        });
      }
    }

    const images =
      req.files?.map((file, index) => ({
        url: `${process.env.APP_URL}/uploads/${file.filename}`,
        isPrimary: index === 0,
      })) || [];

    const room = await Room.create({
      ...req.body,

      slug: `${slugify(req.body.name, {
        lower: true,
        strict: true,
      })}-${Date.now()}`,

      capacity,

      images,
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create room",
    });
  }
};

// Get All Rooms
const getAllRooms = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const query = {
      isActive: true,
    };

    if (req.query.search) {
      query.name = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    if (req.query.roomType) {
      query.roomType = req.query.roomType;
    }

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Room.countDocuments(query),
    ]);

    res.status(200).json({
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch rooms",
    });
  }
};

// Get Single Room
const getSingleRoom = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch room",
    });
  }
};

// Update Room
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    let capacity = room.capacity;

    if (req.body.capacity) {
      try {
        capacity = JSON.parse(req.body.capacity);
      } catch {
        return res.status(400).json({
          message: "Invalid capacity format",
        });
      }
    }

    let images = room.images;

    if (req.files?.length) {
      images = req.files.map((file, index) => ({
        url: `${process.env.APP_URL}/uploads/${file.filename}`,
        isPrimary: index === 0,
      }));
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        capacity,
        images,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update room",
    });
  }
};

// Soft Delete Room
const deleteARoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    await Room.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    res.status(200).json({
      message: "Room archived successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to archive room",
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
