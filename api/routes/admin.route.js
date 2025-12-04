import express from "express";
import {
  getAdminPermissions,
  getProfiles,
  searchProfiles,
  deleteProfile,
  updateProfileStatus,
  getProfileDetails,
  getBookingsCount,
  getInterestsCount,
  getTotalEarnings,
  getInterests,
  searchInterests,
  deleteInterest,
  getProfileInterests,
  searchProfileInterests,
  deleteProfileInterest,
  getBookings,
  searchBookings,
  deleteBooking,
  processPayment,
  updatePackageStatus,
  updateExpiryDate,
  updateProfile,
  updateProfileImages,
  updateUserPassword
  
} from "../controllers/admin.controller.js";

import multer from "multer";
import path from "path";
import fs from "fs";


const router = express.Router();


// Configure multer storage
const userImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads', 'userimg');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: userImgStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin permission check route
router.get("/permissions/:userId", getAdminPermissions);

// Profile management routes
router.get("/profiles", getProfiles);
router.get("/profiles/search", searchProfiles);
router.delete("/profiles/:id", deleteProfile);
router.put("/profiles/:id/status", updateProfileStatus);
router.get("/profiles/:id", getProfileDetails);
router.put("/profiles/:id", updateProfile);
router.put("/profiles/:id/images", upload.single('image'), updateProfileImages);
router.put("/profiles/:id/password", updateUserPassword);


// Stats routes
router.get("/bookings/count", getBookingsCount);
router.get("/interests/count", getInterestsCount);
router.get("/earnings", getTotalEarnings);

//intrest
router.get("/interests", getInterests);
router.get("/interests/search", searchInterests);
router.delete("/interests/:id", deleteInterest);

//profile interest
router.get("/profile-interests", getProfileInterests);
router.get("/profile-interests/search", searchProfileInterests);
router.delete("/profile-interests/:id", deleteProfileInterest);

// Bookings routes
router.get("/bookings", getBookings);
router.get("/bookings/search", searchBookings);
router.delete("/bookings/:id", deleteBooking);
router.put("/bookings/:id/pay", processPayment);
router.put("/bookings/:id/status", updatePackageStatus);
router.put("/bookings/:id/expiry", updateExpiryDate);

export default router;