// controllers/auth.controller.js (updated with more debugging)
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const adminSignIn = async (req, res, next) => {
  const { email, password } = req.body;

  console.log('\n=== ADMIN LOGIN ATTEMPT ===');
  console.log('Email:', email);
  console.log('Password length:', password?.length);

  if (!email || !password) {
    console.log('Missing credentials');
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  try {
    // Find user by email
    console.log('Looking for user:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password!" 
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      status: user.status,
      isActive: user.isActive,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Check if user is admin or superAdmin
    if (!['superAdmin', 'admin'].includes(user.status)) {
      console.log('❌ User status not allowed:', user.status);
      return res.status(403).json({ 
        success: false,
        message: "Access denied! Admin privileges required." 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account inactive');
      return res.status(403).json({ 
        success: false,
        message: "Account is deactivated. Contact administrator." 
      });
    }

    // Verify password
    console.log('Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password!" 
      });
    }

    // Create token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
      status: user.status,
      permissions: user.permissions
    };

    console.log('Creating JWT token with secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'sndnt', { 
      expiresIn: "8h" 
    });

    // Remove password from user object
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      status: user.status,
      permissions: user.permissions,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('✅ Login successful for:', user.email);
    
    res.status(200).json({ 
      success: true,
      message: "Login successful!",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("❌ Admin Sign In Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};