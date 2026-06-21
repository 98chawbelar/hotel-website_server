const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const verifyAdminToken = require("../middleware/verifyAdminToken");

const {
  registerAdmin,
  loginAdmin,
  getProfile,
  getAllAdmins,
  changePassword,
  uploadAvatar,
} = require("./admin.controller");

// PUBLIC
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// PROTECTED
router.get("/profile", verifyAdminToken, getProfile);

router.get("/all-admins", verifyAdminToken, getAllAdmins);

router.put("/change-password", verifyAdminToken, changePassword);

router.put("/avatar", verifyAdminToken, upload.single("avatar"), uploadAvatar);

module.exports = router;
