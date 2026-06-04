const Facility = require("./facility.model");

// Create Facility
const createFacility = async (req, res) => {
  try {
    const newFacility = new Facility(req.body);

    const savedFacility = await newFacility.save();

    res.status(201).json({
      message: "Facility created successfully",
      facility: savedFacility,
    });
  } catch (error) {
    console.error("Error creating facility:", error);

    res.status(500).json({
      message: "Failed to create facility",
    });
  }
};

// Get All Facilities
const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find().sort({
      createdAt: -1,
    });

    res.status(200).json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);

    res.status(500).json({
      message: "Failed to fetch facilities",
    });
  }
};

// Get Single Facility
const getSingleFacility = async (req, res) => {
  try {
    const { id } = req.params;

    const facility = await Facility.findById(id);

    if (!facility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    res.status(200).json(facility);
  } catch (error) {
    console.error("Error fetching facility:", error);

    res.status(500).json({
      message: "Failed to fetch facility",
    });
  }
};

// Update Facility
const updateFacility = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedFacility = await Facility.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedFacility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    res.status(200).json({
      message: "Facility updated successfully",
      facility: updatedFacility,
    });
  } catch (error) {
    console.error("Error updating facility:", error);

    res.status(500).json({
      message: "Failed to update facility",
    });
  }
};

// Delete Facility
const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFacility = await Facility.findByIdAndDelete(id);

    if (!deletedFacility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    res.status(200).json({
      message: "Facility deleted successfully",
      facility: deletedFacility,
    });
  } catch (error) {
    console.error("Error deleting facility:", error);

    res.status(500).json({
      message: "Failed to delete facility",
    });
  }
};

module.exports = {
  createFacility,
  getAllFacilities,
  getSingleFacility,
  updateFacility,
  deleteFacility,
};
