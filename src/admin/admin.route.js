const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("./admin.model");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const upload = require("../middleware/upload");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// ================= REGISTER ADMIN =================
router.post("/register", async (req, res) => {
  try {
    console.log("REGISTER BODY", req.body);
    const { username, password } = req.body;

    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const admin = new User({
      username,
      password,
      role: "admin",
    });

    await admin.save();

    res.status(201).json({
      message: "Admin registered successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ================= LOGIN ADMIN =================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username,
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    console.log("LOGIN BODY:", req.body);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ================= PROFILE =================
router.get("/profile", verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

// ================= ALL ADMINS =================
router.get("/all-admins", verifyAdminToken, async (req, res) => {
  try {
    const admins = await User.find({
      role: "admin",
    }).select("-password");

    res.status(200).json(admins);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch admins",
    });
  }
});

// ================= CHANGE PASSWORD =================
router.put("/change-password", verifyAdminToken, async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password = password;

    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
});

// ================= UPLOAD AVATAR =================
router.put(
  "/avatar",
  verifyAdminToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const admin = await User.findById(req.user.id);

      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
        });
      }

      admin.avatar = `/uploads/${req.file.filename}`;

      await admin.save();

      res.status(200).json({
        message: "Profile image updated successfully",
        avatar: admin.avatar,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Upload failed",
      });
    }
  },
);

module.exports = router;
