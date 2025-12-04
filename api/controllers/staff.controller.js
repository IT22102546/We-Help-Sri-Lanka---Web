import db from "../utils/dbconfig.js";
import bcrypt from "bcryptjs";

// Get all staff members
export const getStaffMembers = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.*, ut.user_type 
      FROM users u 
      JOIN user_types ut ON u.user_type_id = ut.id 
      WHERE u.user_type_id = 3 
      ORDER BY u.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff members" });
  }
};

// Search staff members
export const searchStaffMembers = async (req, res) => {
  try {
    const { search } = req.query;

    const [rows] = await db.execute(
      `SELECT u.*, ut.user_type 
       FROM users u 
       JOIN user_types ut ON u.user_type_id = ut.id 
       WHERE u.user_type_id = 3 
       AND (u.name LIKE ? OR u.email LIKE ? OR u.tp LIKE ?)`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to search staff members" });
  }
};

// Get staff details by ID
export const getStaffDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT u.*, ut.user_type 
       FROM users u 
       JOIN user_types ut ON u.user_type_id = ut.id 
       WHERE u.id = ? AND u.user_type_id = 3`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff details" });
  }
};

// Create new staff member
export const createStaffMember = async (req, res) => {
  try {
    const { name, email, password, tp } = req.body;

    // Check if email already exists
    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff member (user_type_id = 3 for Staff)
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, tp, user_type_id, created_at, updated_at) VALUES (?, ?, ?, ?, 3, NOW(), NOW())",
      [name, email, hashedPassword, tp]
    );

    // Get the newly created staff member
    const [newStaff] = await db.execute(
      `SELECT u.*, ut.user_type 
       FROM users u 
       JOIN user_types ut ON u.user_type_id = ut.id 
       WHERE u.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      staff: newStaff[0]
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ 
      error: "Failed to create staff member",
      details: error.message 
    });
  }
};

// Update staff member
export const updateStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, tp } = req.body;

    // Check if staff member exists
    const [check] = await db.execute(
      "SELECT id FROM users WHERE id = ? AND user_type_id = 3",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Check if email already exists (excluding current staff member)
    const [existingEmail] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Update staff member
    const [result] = await db.execute(
      "UPDATE users SET name = ?, email = ?, tp = ?, updated_at = NOW() WHERE id = ?",
      [name, email, tp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to update staff member" });
    }

    // Get updated staff member
    const [updatedStaff] = await db.execute(
      `SELECT u.*, ut.user_type 
       FROM users u 
       JOIN user_types ut ON u.user_type_id = ut.id 
       WHERE u.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      staff: updatedStaff[0]
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ 
      error: "Failed to update staff member",
      details: error.message 
    });
  }
};

// Update staff password
export const updateStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const [result] = await db.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ? AND user_type_id = 3",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ 
      error: "Failed to update password",
      details: error.message 
    });
  }
};

// Delete staff member
export const deleteStaffMember = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if staff member exists
    const [check] = await db.execute(
      "SELECT id FROM users WHERE id = ? AND user_type_id = 3",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Delete staff member
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ? AND user_type_id = 3",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete staff member" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Staff member deleted successfully" 
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ 
      error: "Failed to delete staff member",
      details: error.message 
    });
  }
};

// Get staff count
export const getStaffCount = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as count FROM users WHERE user_type_id = 3"
    );
    
    res.status(200).json({ 
      success: true,
      count: rows[0].count 
    });
  } catch (error) {
    console.error("Error fetching staff count:", error);
    res.status(500).json({ 
      error: "Failed to fetch staff count",
      details: error.message 
    });
  }
};