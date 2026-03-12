const express = require("express");
const { 
  overview, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllPayments,
  createPayment,
  getUserPayments,
  getAllAttendance,
  createAttendance,
  getUserAttendance,
  getAllBMI,
  createBMI,
  getUserBMI,
  generateQRCode,
  getActiveQRCode,
  deactivateQRCode,
  getQRCodeHistory
} = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../../middleware/auth");

const router = express.Router();

// All routes require admin role
router.use(requireAuth, requireRole(["admin"]));

// Overview
router.get("/overview", overview);

// User Management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Payment Management
router.get("/payments", getAllPayments);
router.post("/payments", createPayment);
router.get("/payments/user/:userId", getUserPayments);

// Attendance Management
router.get("/attendance", getAllAttendance);
router.post("/attendance", createAttendance);
router.get("/attendance/user/:userId", getUserAttendance);

// BMI Management
router.get("/bmi", getAllBMI);
router.post("/bmi", createBMI);
router.get("/bmi/user/:userId", getUserBMI);

// QR Code Management
router.post("/qrcode/generate", generateQRCode);
router.get("/qrcode/active", getActiveQRCode);
router.delete("/qrcode/:id", deactivateQRCode);
router.get("/qrcode/history", getQRCodeHistory);

module.exports = router;

