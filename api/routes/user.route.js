import express from "express";
import {
  getMatchingProfiles,
  getUser,
  getUsers,
  updateUser,
  createBookedPackage,
  getUserPackage,
  uploadUserImage,
  getMatchingUsers,
  updateUserStatus,
  createInterested
} from "../controllers/user.controller.js";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ===== Ensure "uploads/receipts" directory exists =====
const receiptsDir = path.join(process.cwd(), "uploads", "receipts");
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
  console.log("Created directory: uploads/receipts");
}

// ===== Ensure "uploads/userimg" directory exists =====
const userImgDir = path.join(process.cwd(), "uploads", "userimg");
if (!fs.existsSync(userImgDir)) {
  fs.mkdirSync(userImgDir, { recursive: true });
  console.log("Created directory: uploads/userimg");
}

// ===== Multer Storage Configs =====

// Receipt storage
const receiptsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, receiptsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// User image storage
const userImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads', 'userimg'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadUserImg = multer({ 
  storage: userImgStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
  { name: 'profile_img', maxCount: 1 },
  { name: 'img_1', maxCount: 1 },
  { name: 'img_2', maxCount: 1 },
  { name: 'chart_img', maxCount: 1 }
]);


const uploadReceipt = multer({ storage: receiptsStorage });



// ===== Routes =====

// Receipt image upload route
router.post(
  "/booked-packages",
  uploadReceipt.single("recipt_img"),
  createBookedPackage
);



// Other user routes
router.put("/update/:id", uploadUserImg, updateUser);
router.get("/getuser/:id", getUser);
router.get("/matching-profiles/:userId", getMatchingProfiles);
router.get("/users", getUsers);
router.get("/matchingusers", getMatchingUsers);
router.get("/user-pkg/:id", getUserPackage);
router.get("/user-pkg/:id", getUserPackage);
router.put("/:id/status", updateUserStatus);
router.post("/interested", createInterested);

export default router;
