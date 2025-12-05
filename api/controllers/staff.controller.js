import Staff from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Add a new user (staff member)
export const add = async (req, res, next) => {
  const { email, password, name, status, tp, permissions, isActive } = req.body;

  try {
    const existingUser = await Staff.findOne({ email });

    if (existingUser) {
      return next(
        errorHandler(
          409,
          "A user already exists in the system with this email!"
        )
      );
    }

    if (!email || !password || !name || !tp) {
      return next(
        errorHandler(409, "Email, password, name, and status are required!")
      );
    }

    // Create new user
    const newUser = new Staff({
      email,
      password,
      name,
      tp,
      status: "admin",
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
};

// User sign-in
export const adminsignin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found!"));

    // Check if user is active
    if (!validUser.isActive) {
      return next(
        errorHandler(
          403,
          "Account is deactivated. Please contact administrator."
        )
      );
    }

    // Use the comparePassword method from the User model
    const validPassword = await validUser.comparePassword(password);
    if (!validPassword) return next(errorHandler(400, "Invalid Credentials!"));

    const token = jwt.sign(
      {
        id: validUser._id,
        status: validUser.status,
        permissions: validUser.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Remove password from response
    const userResponse = validUser.toObject();
    delete userResponse.password;

    const expiryDate = new Date(Date.now() + 3600000); // 1 hour

    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: expiryDate,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // CSRF protection
      })
      .status(200)
      .json({
        ...userResponse,
        id: validUser._id,
        accessToken: token, // Also sending token in response body for client-side storage if needed
      });
  } catch (error) {
    next(error);
  }
};

// Optional: Add a logout function
export const usersignout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "Signout successful!" });
  } catch (error) {
    next(error);
  }
};
// Get all staff members
export const getStaff = async (req, res, next) => {
  try {
    const { searchTerm, status, isActive } = req.query;
    const queryOptions = {};

    // Search by email or name
    if (searchTerm) {
      queryOptions.$or = [
        { email: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      queryOptions.status = status;
    }

    // Filter by active status
    if (isActive !== undefined) {
      queryOptions.isActive = isActive === "true";
    }

    // Get total count (without pagination for now, but can add later)
    const totalUsers = await Staff.countDocuments(queryOptions);

    // Get users - exclude password field
    const users = await Staff.find(queryOptions).select("-password");

    res.status(200).json({
      users,
      total: totalUsers,
      message: `Found ${totalUsers} user${totalUsers !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a staff member and their associated forms
export const Delete = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const existingStaff = await Staff.findById(userId);
    if (!existingStaff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found!" });
    }

    await Staff.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific staff member
export const Getmember = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const staffMember = await Staff.findById(userId);
    if (!staffMember) return next(errorHandler(404, "Staff member not found"));
    res.status(200).json(staffMember);
  } catch (error) {
    next(error);
  }
};

// Update a staff member details
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, tp } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone number if provided
    if (tp && tp.trim() !== "") {
      const phoneRegex = /^(0\d{9})$/; // Sri Lankan phone number: 10 digits starting with 0
      if (!phoneRegex.test(tp)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format. Use 10 digits starting with 0",
        });
      }
    }

    // Check if staff exists
    const existingStaff = await Staff.findById(id);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Check if email is being changed and already exists
    if (email !== existingStaff.email) {
      const emailExists = await Staff.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      tp: tp || existingStaff.tp,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      updateData.password = bcrypt.hashSync(password, 10);
    }

    // Update staff
    const updatedStaff = await Staff.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Remove password from response
    const { password: _, ...staffWithoutPassword } = updatedStaff._doc;

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      staff: staffWithoutPassword,
    });
  } catch (error) {
    console.error("Update staff error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle cast error (invalid ID)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID format",
      });
    }

    next(error);
  }
};

// Update a staff member
export const updatestaffprofile = async (req, res, next) => {
  try {
    if (req.body.contactNumber) {
      const mobileRegex = /^(071|076|077|075|078|070|074|072)\d{7}$/;
      if (!mobileRegex.test(req.body.contactNumber)) {
        return next(errorHandler(400, "Invalid mobile number format."));
      }
    }
    if (req.body.password) {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{5,}$/;

      if (!passwordRegex.test(req.body.password)) {
        return next(
          errorHandler(
            400,
            "Password should be at least 5 characters long and contain at least one uppercase letter, one digit, and one symbol (!@#$%^&*()_+)."
          )
        );
      }
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          employeeId: req.body.employeeId,
          departmentname: req.body.departmentname,
          Staffmembername: req.body.Staffmembername,
          contactNumber: req.body.contactNumber,
          position: req.body.position,
          profilePicture: req.body.profilePicture,
          isManager: req.body.isManager,
          password: req.body.password,
          application: req.body.application,
          interview_assesment_form: req.body.interview_assesment_form,
          ceo_recruitment_approval: req.body.ceo_recruitment_approval,
          offer_letter: req.body.offer_letter,
          appoinment_letter: req.body.appoinment_letter,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedStaff._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

/*export const forgetpassword = async (req, res, next) => {
  const { email } = req.body;
  try {
   
    const user = await Staff.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 401, message: "User not found" });
    }

    
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

  
    user.verifytoken = token;
    
    await user.save();
    

   
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "ystem Password Reset",
      text: `Use the following link to reset your password: http://localhost:5173/resetpassword/${user._id}/${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ status: 500, message: "Email not sent" });
      }
      
      res.status(201).json({ status: 201, message: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Forget password error:", error);
    next(error);
  }
};

export const resetpassword = async (req, res, next) => {
  const { id, token } = req.params;
  
  

  try {
    const validuser = await Staff.findOne({_id: id, verifytoken: token});
   
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);


    if (validuser && verifyToken.id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "User does not exist" });
    }
  } catch (error) {
    console.error("Error in resetpassword controller:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const updateResetPassword = async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
      const validuser = await Staff.findOne({ _id: id, verifytoken: token });
      const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

      if (validuser && verifyToken.id) {
          const newpassword = await bcryptjs.hash(password, 10);

          await User.findByIdAndUpdate(id, { password: newpassword });

          res.status(201).json({ status: 201, message: "Password updated successfully" });
      } else {
          res.status(401).json({ status: 401, message: "User does not exist or invalid token" });
      }
  } catch (error) {
      res.status(500).json({ status: 500, error: error.message });
  }

};*/

/*const transporter = nodemailer.createTransport({
  service: "gmail", // You can use any email service, this example is for Gmail
  auth: {
    user: process.env.EMAIL_USERNAME, // Your email from the .env file
    pass: process.env.EMAIL_PASSWORD, // Your app-specific password from the .env file
  },
});
*/
