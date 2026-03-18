const express = require("express");
const { 
  myMembership, 
  updateMyDetails,
  getMyPayments,
  createMyPayment,
  uploadPaymentProof,
  getMyAttendance,
  checkInAttendance,
  getMyBMI,
  createMyBMI
} = require("../controllers/memberController");
const { requireAuth, requireRole } = require("../../middleware/auth");

const router = express.Router();

// All routes require member role
router.use(requireAuth, requireRole(["member"]));

// Membership
router.get("/me", myMembership);
router.put("/me", updateMyDetails);

// Payments
router.get("/payments", getMyPayments);
router.post("/payments", createMyPayment);
router.post("/payments/upload-proof/:paymentId", uploadPaymentProof);

// Attendance
router.get("/attendance", getMyAttendance);
router.post("/attendance/checkin", checkInAttendance);

// BMI
router.get("/bmi", getMyBMI);
router.post("/bmi", createMyBMI);

module.exports = router;

