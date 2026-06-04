const express = require("express");
const router = express.Router();

const {
  createExtraFacility,
  getAllExtraFacilities,
} = require("./extrafacility.controller");

// Admin creates facility
router.post("/", createExtraFacility);

// Customer gets all facilities
router.get("/", getAllExtraFacilities);

module.exports = router;
