const Facility = require("./facility.model");

// CREATE

const createFacility = async (req, res) => {
  try {
    const images = req.files ? req.files.map((file) => file.filename) : [];

    const facility = await Facility.create({
      name: req.body.name,

      description: req.body.description,

      link: req.body.link || "",

      order: Number(req.body.order || 0),

      images,
    });

    res.status(201).json({
      message: "Facility created successfully",

      facility,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL

const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({
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

// SINGLE

const getSingleFacility = async (req, res) => {
  try {
    const facility = await Facility.findOne({
      slug: req.params.slug,

      isActive: true,
    });

    if (!facility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    res.json(facility);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE

const updateFacility = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,

      description: req.body.description,

      link: req.body.link,

      order: Number(req.body.order || 0),
    };

    if (req.files && req.files.length) {
      updateData.images = req.files.map((file) => file.filename);
    }

    const facility = await Facility.findByIdAndUpdate(
      req.params.id,

      updateData,

      {
        new: true,

        runValidators: true,
      },
    );

    res.json({
      message: "Facility updated",

      facility,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE

const deleteFacility = async (req, res) => {
  try {
    await Facility.findByIdAndUpdate(
      req.params.id,

      {
        isActive: false,
      },
    );

    res.json({
      message: "Facility disabled",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
