const ExtraFacility = require("./extrafacility.model");

// Create

const createExtraFacility = async (req, res) => {
  try {
    const facility = await ExtraFacility.create(req.body);

    res.status(201).json({
      message: "Extra facility created successfully",

      facility,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Customer List
const getAllExtraFacilities = async (req, res) => {
  try {
    const facilities = await ExtraFacility.find({
      isActive: true,
    })
      .sort({
        order: 1,
      })
      .lean();

    res.json(facilities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update

const updateExtraFacility = async (req, res) => {
  try {
    const facility = await ExtraFacility.findByIdAndUpdate(
      req.params.id,

      req.body,

      {
        new: true,
        runValidators: true,
      },
    );

    if (!facility) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      message: "Updated",

      facility,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Disable

const deleteExtraFacility = async (req, res) => {
  try {
    await ExtraFacility.findByIdAndUpdate(
      req.params.id,

      {
        isActive: false,
      },
    );

    res.json({
      message: "Extra facility disabled",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createExtraFacility,

  getAllExtraFacilities,

  updateExtraFacility,

  deleteExtraFacility,
};
