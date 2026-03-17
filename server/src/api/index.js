const express = require("express");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const qrcodeRoutes = require("./routes/qrcodeRoutes");
const stripeRoutes = require("./routes/stripeRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/member", memberRoutes);
router.use("/", qrcodeRoutes);
router.use("/stripe", stripeRoutes);

module.exports = router;

