const express = require("express");
const router = express.Router();

const {
  createFacility,
  getAllFacilities,
  getSingleFacility,
  updateFacility,
} = require("./facility.controller");

const verifyAdminToken = require("../middleware/verifyAdminToken");
const upload = require("../middleware/upload");

router.post("/", upload.array("images", 20), verifyAdminToken, createFacility);

router.get("/", getAllFacilities);

router.get("/:slug", getSingleFacility);

router.put(
  "/edit/:id",
  verifyAdminToken,
  upload.array("images", 20),
  updateFacility,
);

module.exports = router;
