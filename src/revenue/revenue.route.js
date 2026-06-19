const express = require("express");

const router = express.Router();

const { getRevenueAnalytics } = require("./revenue.controller");

router.get("/", getRevenueAnalytics);

module.exports = router;
