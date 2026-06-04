const express = require("express");
const router = express.Router();

const {
  createFacility,
  getAllFacilities,
  getSingleFacility,
  updateFacility,
  deleteFacility,
} = require("./facility.controller");

router.post("/", createFacility);

router.get("/", getAllFacilities);

router.get("/:id", getSingleFacility);

router.put("/:id", updateFacility);

router.delete("/:id", deleteFacility);

module.exports = router;
