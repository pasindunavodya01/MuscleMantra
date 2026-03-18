const bcrypt = require("bcryptjs");

async function overview(req, res, next) {
  try {
    const stats = await req.app.locals.repo.getAdminStats();
    return res.json({ stats });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await req.app.locals.repo.getAllUsers();
    return res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, memberData } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const existing = await req.app.locals.repo.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await req.app.locals.repo.createUser({ name, email: email.toLowerCase(), passwordHash, role });
    
    // If role is member and memberData provided, create member record
    if (role === "member" && memberData) {
      await req.app.locals.repo.createMember({
        userId: user.id,
        ...memberData
      });
    }
    
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, memberData } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    
    const user = await req.app.locals.repo.updateUser(id, updateData);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Update member data if provided
    if (role === "member" && memberData) {
      await req.app.locals.repo.updateMember(id, memberData);
    }
    
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await req.app.locals.repo.deleteUser(id);
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// Payment Management
async function getAllPayments(req, res, next) {
  try {
    const payments = await req.app.locals.repo.getAllPayments();
    return res.json({ payments });
  } catch (err) {
    next(err);
  }
}

async function createPayment(req, res, next) {
  try {
    const { userId, amount, paymentDate, paymentMethod, description, status } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const payment = await req.app.locals.repo.createPayment({
      userId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || "cash",
      description: description || "",
      status: status || "completed"
    });
    
    return res.json({ payment });
  } catch (err) {
    next(err);
  }
}

async function getUserPayments(req, res, next) {
  try {
    const { userId } = req.params;
    const payments = await req.app.locals.repo.getPaymentsByUserId(userId);
    return res.json({ payments });
  } catch (err) {
    next(err);
  }
}

// Attendance Management
async function getAllAttendance(req, res, next) {
  try {
    const { date } = req.query;
    const attendance = await req.app.locals.repo.getAllAttendance(date);
    return res.json({ attendance });
  } catch (err) {
    next(err);
  }
}

async function createAttendance(req, res, next) {
  try {
    const { userId, checkInTime, checkOutTime, date } = req.body;
    
    if (!userId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const attendance = await req.app.locals.repo.createAttendance({
      userId,
      checkInTime: checkInTime || new Date(),
      checkOutTime,
      date
    });
    
    return res.json({ attendance });
  } catch (err) {
    next(err);
  }
}

async function getUserAttendance(req, res, next) {
  try {
    const { userId } = req.params;
    const attendance = await req.app.locals.repo.getAttendanceByUserId(userId);
    return res.json({ attendance });
  } catch (err) {
    next(err);
  }
}

// BMI Management
async function getAllBMI(req, res, next) {
  try {
    const bmi = await req.app.locals.repo.getAllBMI();
    return res.json({ bmi });
  } catch (err) {
    next(err);
  }
}

async function createBMI(req, res, next) {
  try {
    const { userId, weight, height, recordDate, notes } = req.body;
    
    if (!userId || !weight || !height) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Determine category
    let category;
    if (bmi < 18.5) category = "underweight";
    else if (bmi < 25) category = "normal";
    else if (bmi < 30) category = "overweight";
    else category = "obese";
    
    const bmiRecord = await req.app.locals.repo.createBMI({
      userId,
      weight,
      height,
      bmi: parseFloat(bmi.toFixed(2)),
      category,
      recordDate: recordDate || new Date(),
      notes: notes || ""
    });
    
    return res.json({ bmi: bmiRecord });
  } catch (err) {
    next(err);
  }
}

async function getUserBMI(req, res, next) {
  try {
    const { userId } = req.params;
    const bmi = await req.app.locals.repo.getBMIByUserId(userId);
    return res.json({ bmi });
  } catch (err) {
    next(err);
  }
}

// QR Code Management
async function generateQRCode(req, res, next) {
  try {
    const qrCode = await req.app.locals.repo.createQRCode();
    return res.json({ qrCode, message: "New QR code generated successfully" });
  } catch (err) {
    next(err);
  }
}

async function getActiveQRCode(req, res, next) {
  try {
    const qrCode = await req.app.locals.repo.getActiveQRCode();
    if (!qrCode) return res.status(404).json({ message: "No active QR code" });
    return res.json({ qrCode });
  } catch (err) {
    next(err);
  }
}

async function deactivateQRCode(req, res, next) {
  try {
    const { id } = req.params;
    await req.app.locals.repo.deactivateQRCode(id);
    return res.json({ message: "QR code deactivated" });
  } catch (err) {
    next(err);
  }
}

async function getQRCodeHistory(req, res, next) {
  try {
    const history = await req.app.locals.repo.getQRCodeHistory();
    return res.json({ history });
  } catch (err) {
    next(err);
  }
}

// Payment Review Management
async function getPendingPayments(req, res, next) {
  try {
    const payments = await req.app.locals.repo.getPendingPayments();
    return res.json({ payments });
  } catch (err) {
    next(err);
  }
}

async function reviewPayment(req, res, next) {
  try {
    const { paymentId } = req.params;
    const { reviewStatus, reviewNotes } = req.body;

    if (!reviewStatus || !["approved", "rejected"].includes(reviewStatus)) {
      return res.status(400).json({ message: "Valid review status is required (approved/rejected)" });
    }

    const updateData = {
      reviewStatus,
      reviewNotes: reviewNotes || "",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      status: reviewStatus === "approved" ? "completed" : "rejected"
    };

    const payment = await req.app.locals.repo.updatePayment(paymentId, updateData);
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json({ 
      payment, 
      message: `Payment ${reviewStatus} successfully` 
    });
  } catch (err) {
    next(err);
  }
}

// Renewal Statistics
async function getRenewalStats(req, res, next) {
  try {
    const stats = await req.app.locals.repo.getRenewalStats();
    return res.json({ stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  overview, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllPayments,
  createPayment,
  getUserPayments,
  getPendingPayments,
  reviewPayment,
  getAllAttendance,
  createAttendance,
  getUserAttendance,
  getAllBMI,
  createBMI,
  getUserBMI,
  generateQRCode,
  getActiveQRCode,
  deactivateQRCode,
  getQRCodeHistory,
  getRenewalStats
};

