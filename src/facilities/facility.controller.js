const Facility = require("./facility.model");

// CREATE FACILITY
const createFacility = async (req, res) => {
  try {
    images = req.files.map((file) => {
      return `/uploads/${file.filename}`;
    });

    const newFacility = await Facility.create({
      name: req.body.name,
      description: req.body.description,
      link: req.body.link || "",
      order: Number(req.body.order) || 0,
      images,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Facility created successfully",
      data: newFacility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL FACILITIES
const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Facilities fetched successfully",
      data: facilities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE FACILITY (by slug)
const getSingleFacility = async (req, res) => {
  try {
    const facility = await Facility.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Facility fetched successfully",
      data: facility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE FACILITY
const updateFacility = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      link: req.body.link || "",
      order: Number(req.body.order) || 0,
    };

    // replace images only if new files uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.filename);
    }

    const updatedFacility = await Facility.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedFacility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Facility updated successfully",
      data: updatedFacility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createFacility,
  getAllFacilities,
  getSingleFacility,
  updateFacility,
};
