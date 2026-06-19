const express = require("express");

const router = express.Router();

const {
  createExtraFacility,
  getAllExtraFacilities,
  updateExtraFacility,
  deleteExtraFacility,
} = require("./extrafacility.controller");

const verifyAdminToken = require("../middleware/verifyAdminToken");

router.post("/", verifyAdminToken, createExtraFacility);

router.get("/", getAllExtraFacilities);

router.put("/:id", verifyAdminToken, updateExtraFacility);

router.delete("/:id", verifyAdminToken, deleteExtraFacility);

module.exports = router;
