import Staff from "../models/staff.model.js";
import jwt from "jsonwebtoken";

// @desc    Register new staff member (admin only)
// @route   POST /api/auth/register
// @access  Private (Admin only)
export const registerStaff = async (req, res) => {
  try {
    // Check if requesting user is admin
    const admin = await Staff.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to register staff",
      });
    }

    const { name, email, phone, password, role, district } = req.body;

    // Check if staff already exists
    const existingStaff = await Staff.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Staff with this email or phone already exists",
      });
    }

    // Create new staff
    const staff = new Staff({
      name,
      email,
      phone,
      password,
      role: role || "operator",
      district,
    });

    await staff.save();

    // Create token
    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        id: staff._id,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        district: staff.district,
      },
      message: "Staff member registered successfully",
    });
  } catch (error) {
    console.error("Register Staff Error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering staff",
      error: error.message,
    });
  }
};

// @desc    Login staff
// @route   POST /api/auth/login
// @access  Public
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for staff
    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if staff is active
    if (!staff.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last active
    staff.lastActive = new Date();
    await staff.save();

    // Create token
    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: staff._id,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        district: staff.district,
        lastActive: staff.lastActive,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Get current logged in staff
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff profile",
      error: error.message,
    });
  }
};

// @desc    Update staff profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, district, currentPassword, newPassword } =
      req.body;

    const staff = await Staff.findById(req.user.id).select("+password");

    // Check current password if changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set new password",
        });
      }

      const isMatch = await staff.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      staff.password = newPassword;
    }

    // Update other fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (phone) staff.phone = phone;
    if (district) staff.district = district;

    await staff.save();

    res.status(200).json({
      success: true,
      data: staff,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Get all staff members
// @route   GET /api/auth/staff
// @access  Private (Admin only)
export const getAllStaff = async (req, res) => {
  try {
    const admin = await Staff.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view all staff",
      });
    }

    const staff = await Staff.find().select("-password -__v");

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error("Get All Staff Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff",
      error: error.message,
    });
  }
};

// @desc    Update staff status (activate/deactivate)
// @route   PUT /api/auth/staff/:id/status
// @access  Private (Admin only)
export const updateStaffStatus = async (req, res) => {
  try {
    const admin = await Staff.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update staff status",
      });
    }

    const { isActive } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    staff.isActive = isActive;
    await staff.save();

    res.status(200).json({
      success: true,
      data: staff,
      message: `Staff member ${
        isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Update Staff Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating staff status",
      error: error.message,
    });
  }
};
