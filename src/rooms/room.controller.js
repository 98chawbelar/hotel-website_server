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
      } catch (error) {
        return res.status(400).json({
          message: "Invalid capacity format",
        });
      }
    }

    const images =
      req.files?.map((file) => {
        return `/uploads/${file.filename}`;
      }) || [];

    const room = await Room.create({
      ...req.body,

      slug: `${slugify(req.body.name, {
        lower: true,
        strict: true,
      })}-${Date.now()}`,

      capacity,

      images,

      isActive: true,
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

// Get All Active Rooms
const getAllRooms = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const query = {
      isActive: true,
    };

    // Search by name
    if (req.query.search) {
      query.name = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    // Filter by room type
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
      } catch (error) {
        return res.status(400).json({
          message: "Invalid capacity format",
        });
      }
    }

    let images = room.images;

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images
      if (room.images?.length > 0) {
        room.images.forEach((image) => {
          try {
            const filename = image.split("/uploads/")[1];

            if (!filename) return;

            const filePath = path.join(__dirname, "../../uploads", filename);

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.log("Image delete error:", error);
          }
        });
      }

      // Save new images
      images = req.files.map((file) => {
        return `/uploads/${file.filename}`;
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,

      {
        ...req.body,

        slug: req.body.name
          ? `${slugify(req.body.name, {
              lower: true,
              strict: true,
            })}-${Date.now()}`
          : room.slug,

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

// Get Archived Rooms
const getArchivedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      isActive: false,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      rooms,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch archived rooms",
    });
  }
};

// Restore Room
const restoreRoom = async (req, res) => {
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
        isActive: true,
      },
      {
        new: true,
      },
    );

    res.status(200).json({
      message: "Room restored successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to restore room",
    });
  }
};

// Permanent Delete Room
const permanentDeleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Delete images from uploads folder
    if (room.images?.length > 0) {
      room.images.forEach((image) => {
        try {
          const filename = image.split("/uploads/")[1];

          if (!filename) return;

          const filePath = path.join(__dirname, "../../uploads", filename);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.log("Image delete error:", error);
        }
      });
    }
    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Room permanently deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to permanently delete room",
    });
  }
};

module.exports = {
  postARoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteARoom,
  getArchivedRooms,
  restoreRoom,
  permanentDeleteRoom,
};
