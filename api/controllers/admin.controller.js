import db from "../utils/dbconfig.js";
import bcrypt from "bcryptjs";

// Check if user has admin permissions
export const getAdminPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is admin (user_type_id = 1)
    const [user] = await db.execute(
      "SELECT user_type_id FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isAdmin = user[0].user_type_id === 1;

    res.status(200).json({ isAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all profiles
export const getProfiles = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id, member_id, first_name, last_name, email, 
        contact_no, whatsapp_no, d_o_b, age,gender, birth_place,
        address, birth_time, maritial_status, height, weight,
        complexion, physical_status, cast, religion, star_sign,
        family_value, family_type, family_status, fathers_name,
        fathers_occupation, mothers_name, mothers_occupation,
        brothers, sisters,mothers_native_place,fathers_native_place,married_brothers, married_sisters,more_family, country_of_birth, city_of_birth,
        country_of_resident, city_of_resident, country_of_citizenship,
        eating_habit, smoking_habit, drinking_habit, primary_school,
        secondary_school, education, occupation, annual_income,
        partner_country_of_resident, partner_resident_status,
        partner_education, partner_occupation, partner_annual_income,
        partner_marital_status, partner_minimum_age, partner_maximum_age,
        partner_minimum_height, partner_maximum_height, partner_physical_status,
        partner_mother_tongue, partner_religion, partner_star_sign,
        partner_cast, partner_eating_habit, partner_smoking_habit,
        partner_drinking_habit, status, profile_img, chart_img, img_1, img_2,
        created_at 
      FROM customers
      ORDER BY created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
};

// Search profiles
export const searchProfiles = async (req, res) => {
  try {
    const { search } = req.query;

    const [rows] = await db.execute(
      `SELECT 
        id, member_id, first_name, last_name, email, 
        contact_no, status, created_at 
       FROM customers 
       WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR contact_no LIKE ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to search profiles" });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if profile exists
    const [check] = await db.execute(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // First delete related booked packages
    await db.execute("DELETE FROM booked_packages WHERE customer_id = ?", [id]);

    // Then delete the customer
    const [result] = await db.execute("DELETE FROM customers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete profile" });
    }

    res.status(200).json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ 
      error: "Failed to delete profile",
      details: error.message 
    });
  }
};

// Update profile status
export const updateProfileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["single", "fixed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const [result] = await db.execute(
      "UPDATE customers SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile status" });
  }
};

// Update profile details
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // First check if profile exists
    const [check] = await db.execute(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Build the dynamic update query
    let updateQuery = "UPDATE customers SET ";
    const updateValues = [];
    const fieldsToUpdate = {};

    // Only include fields that are not null or undefined
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== null && updateFields[key] !== undefined) {
        fieldsToUpdate[key] = updateFields[key];
      }
    });

    // Build the SET clause dynamically
    const setClauses = [];
    Object.keys(fieldsToUpdate).forEach(key => {
      setClauses.push(`${key} = ?`);
      updateValues.push(fieldsToUpdate[key]);
    });

    // If no fields to update, return early
    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    updateQuery += setClauses.join(", ");
    updateQuery += ", updated_at = NOW() WHERE id = ?";
    updateValues.push(id);

    const [result] = await db.execute(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      updatedFields: Object.keys(fieldsToUpdate)
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      error: "Failed to update profile",
      details: error.message 
    });
  }
};

// Update profile images
export const updateProfileImages = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file; // Using multer single file upload

    if (!file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Check if profile exists
    const [check] = await db.execute(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (check.length === 0) {
      // Clean up the uploaded file if profile doesn't exist
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: "Profile not found" });
    }

    // Determine the field to update based on query parameter or body
    const imageType = req.body.type || 'profile_img';
    const validTypes = ['profile_img', 'chart_img', 'img_1', 'img_2'];
    
    if (!validTypes.includes(imageType)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "Invalid image type" });
    }

    // Construct the file path to store in database
    const filePath = `userimg/${file.filename}`;

    // Update the database
    const [result] = await db.execute(
      `UPDATE customers SET ${imageType} = ? WHERE id = ?`,
      [filePath, id]
    );

    if (result.affectedRows === 0) {
      fs.unlinkSync(file.path);
      return res.status(500).json({ error: "Failed to update profile images" });
    }

    // Get the updated profile to return the new image URL
    const [updatedProfile] = await db.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );

    res.status(200).json({ 
      success: true, 
      message: "Profile image updated successfully",
      imageUrl: filePath,
      profile: updatedProfile[0]
    });
    
  } catch (error) {
    console.error("Update profile images error:", error);
    // Clean up file if error occurred
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: "Failed to update profile images",
      details: error.message 
    });
  }
};

// Update user password
export const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

  

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in users table
    const [result] = await db.execute(
      "UPDATE customers SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
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


// Get profile details
export const getProfileDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT 
        id, member_id, first_name, last_name, email, contact_no, whatsapp_no, password,
        d_o_b, age,gender, birth_place, address, birth_time, maritial_status, height,
        weight, complexion, physical_status, cast, religion, star_sign,
        family_value, family_type, family_status, fathers_name, fathers_occupation,
        mothers_name, mothers_occupation, brothers, sisters,mothers_native_place,fathers_native_place,married_brothers, married_sisters,more_family,
        country_of_birth, city_of_birth, country_of_resident, city_of_resident,
        country_of_citizenship, eating_habit, smoking_habit, drinking_habit,
        primary_school, secondary_school, education, occupation,occupation_details, annual_income,
        profile_img,img_1,img_2,chart_img,
        partner_country_of_resident, partner_resident_status, partner_education,
        partner_occupation, partner_annual_income, partner_marital_status,
        partner_minimum_age, partner_maximum_age, partner_minimum_height,
        partner_maximum_height, partner_physical_status, partner_mother_tongue,
        partner_religion, partner_star_sign, partner_cast, partner_eating_habit,
        partner_smoking_habit, partner_drinking_habit,
        status, created_at
       FROM customers WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile details" });
  }
};


export const getBookingsCount = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT COUNT(*) as count FROM booked_packages");
    res.status(200).json({ count: rows[0].count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings count" });
  }
};

// Get interests count
export const getInterestsCount = async (req, res) => {
  try {
    // Corrected table name to 'intresteds'
    const [rows] = await db.execute("SELECT COUNT(*) as count FROM intresteds");
    
    res.status(200).json({ 
      success: true,
      count: rows[0].count 
    });
  } catch (error) {
    console.error("Error fetching interests count:", error);
    res.status(500).json({ 
      error: "Failed to fetch interests count",
      details: error.message 
    });
  }
};

// Get total earnings
export const getTotalEarnings = async (req, res) => {
  try {
    // Calculate total earnings by summing all income values
    const [result] = await db.execute(
      "SELECT SUM(CAST(income AS DECIMAL(10,2))) AS total FROM booked_packages"
    );

    // If no records found, return 0
    const totalEarnings = result[0].total || 0;

    res.status(200).json({ 
      success: true,
      amount: totalEarnings 
    });
  } catch (error) {
    console.error("Error fetching total earnings:", error);
    res.status(500).json({ 
      error: "Failed to fetch total earnings",
      details: error.message 
    });
  }
};

{/*---------------------------Intrest-----------------------------*/}


export const getInterests = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM intresteds ORDER BY created_at DESC");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interests" });
  }
};


export const searchInterests = async (req, res) => {
  try {
    const { search } = req.query;
    const [rows] = await db.execute(
      "SELECT * FROM intresteds WHERE name LIKE ? OR email LIKE ?",
      [`%${search}%`, `%${search}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to search interests" });
  }
};


export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM intresteds WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Interest not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete interest" });
  }
};

{/* ---------------------Profile Interest----------------*/}

// Get all profile interests
export const getProfileInterests = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM profile_intresteds 
      ORDER BY created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile interests" });
  }
};

// Search profile interests
export const searchProfileInterests = async (req, res) => {
  try {
    const { search } = req.query;

    const [rows] = await db.execute(
      `SELECT * FROM profile_intresteds 
       WHERE customer_name LIKE ? OR mem_id LIKE ? OR profile_name LIKE ? OR profile_mem_id LIKE ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to search profile interests" });
  }
};

// Delete profile interest
export const deleteProfileInterest = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if record exists
    const [check] = await db.execute(
      "SELECT id FROM profile_intresteds WHERE id = ?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Profile interest not found" });
    }

    const [result] = await db.execute(
      "DELETE FROM profile_intresteds WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete profile interest" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete profile interest error:", error);
    res.status(500).json({ 
      error: "Failed to delete profile interest",
      details: error.message 
    });
  }
};

{/*----------Package Booking----------------------*/}

// Get all bookings
export const getBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT bp.*, 
             c.first_name, 
             c.last_name, 
             c.contact_no, 
             c.whatsapp_no,
             c.package_plan
      FROM booked_packages bp
      JOIN customers c ON bp.customer_id = c.id
      ORDER BY bp.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};


// Search bookings
export const searchBookings = async (req, res) => {
  try {
    const { search } = req.query;
    const [rows] = await db.execute(
      `SELECT bp.*, c.first_name, c.last_name, c.contact_no, c.whatsapp_no 
       FROM booked_packages bp
       JOIN customers c ON bp.customer_id = c.id
       WHERE c.first_name LIKE ? OR c.last_name LIKE ? OR c.contact_no LIKE ? OR c.whatsapp_no LIKE ? OR bp.package LIKE ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to search bookings" });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM booked_packages WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

// Process payment
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullPayment } = req.body;

    // Get current booking
    const [booking] = await db.execute("SELECT * FROM booked_packages WHERE id = ?", [id]);
    if (booking.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (fullPayment) {
      // Update balance to 0 and add to install_amount
      const newInstallAmount = parseFloat(booking[0].install_amount) + parseFloat(booking[0].balance);
      await db.execute(
        "UPDATE booked_packages SET balance = '0', install_amount = ? WHERE id = ?",
        [newInstallAmount.toString(), id]
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// Update package status
export const updatePackageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Basic Plan", "Standard Plan", "Premium Plan", "Ultimate Plan"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Get the booking to find the customer
    const [booking] = await db.execute(
      "SELECT customer_id FROM booked_packages WHERE id = ?",
      [id]
    );

    if (!booking.length) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const customerId = booking[0].customer_id;

    // Update the booked package
    await db.execute(
      "UPDATE booked_packages SET package = ? WHERE id = ?",
      [status, id]
    );

    // Update the customer's current package plan
    await db.execute(
      "UPDATE customers SET package_plan = ? WHERE id = ?",
      [status, customerId]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message || "Failed to update package status" });
  }
};


// Update expiry date
export const updateExpiryDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { exp_date } = req.body;

    const [result] = await db.execute(
      "UPDATE booked_packages SET exp_date = ? WHERE id = ?",
      [exp_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update expiry date" });
  }
};