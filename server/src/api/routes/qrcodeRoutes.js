const express = require("express");
const { requireAuth, requireRole } = require("../../middleware/auth");

const router = express.Router();

// Public endpoint - Get the current active QR code (for external scanners)
router.get("/qrcode/current", async (req, res, next) => {
  try {
    const qrCode = await req.app.locals.repo.getActiveQRCode();
    if (!qrCode) {
      return res.status(404).json({ message: "No active QR code available" });
    }
    return res.json({ qrCode });
  } catch (err) {
    next(err);
  }
});

// Public endpoint - Handle external QR code scanner redirect
// Scanner will hit: /api/qrcode/scan?code=UUID
// This endpoint will redirect to login page or member dashboard with code
router.get("/qrcode/scan", async (req, res, next) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: "QR code is required" });
    }
    
    // Validate the QR code exists and is active
    const validQRCode = await req.app.locals.repo.validateQRCode(code);
    if (!validQRCode) {
      // Redirect to an error page if invalid
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=Invalid%20QR%20code`);
    }
    
    // Redirect to member dashboard or login with the code
    // If user is not logged in, they'll be redirected to login with the code preserved
    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/member?code=${code}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
