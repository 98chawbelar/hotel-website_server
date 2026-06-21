const Admin = require("./admin.model");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_EXPIRE = "24h";

// ================= REGISTER ADMIN =================
const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({
      username,
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const admin = new Admin({
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
};

// ================= LOGIN ADMIN =================
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({
      username,
    }).select("+password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRE,
      },
    );

    res.status(200).json({
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= GET PROFILE =================
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

// ================= GET ALL ADMINS =================
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({
      role: "admin",
    }).select("-password");

    res.status(200).json(admins);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch admins",
    });
  }
};

// ================= CHANGE PASSWORD =================
const changePassword = async (req, res) => {
  try {
    const { password } = req.body;

    const admin = await Admin.findById(req.user.id).select("+password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    admin.password = password;

    await admin.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
};

// ================= UPLOAD AVATAR =================
const uploadAvatar = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
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
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getProfile,
  getAllAdmins,
  changePassword,
  uploadAvatar,
};
