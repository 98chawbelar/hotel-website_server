const ExtraFacility = require("./extrafacility.model");

// Create Facility
const createExtraFacility = async (req, res) => {
  try {
    const facility = new ExtraFacility(req.body);

    const savedFacility = await facility.save();

    res.status(201).json({
      message: "Extra facility created successfully",
      facility: savedFacility,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create extra facility",
    });
  }
};

// Get All Facilities
const getAllExtraFacilities = async (req, res) => {
  try {
    const facilities = await ExtraFacility.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(facilities);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch facilities",
    });
  }
};

module.exports = {
  createExtraFacility,
  getAllExtraFacilities,
};
