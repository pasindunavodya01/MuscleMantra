const Member = require("../models/Member");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const BMI = require("../models/BMI");
const QRCode = require("../models/QRCode");

function createMongoRepo() {
  return {
    async getUserByEmail(email) {
      const user = await User.findOne({ email: email.toLowerCase() }).select("_id name email role passwordHash");
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash: user.passwordHash
      };
    },
    async getUserById(id) {
      const user = await User.findById(id).select("_id name email role");
      if (!user) return null;
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    },
    async getMembershipByUserId(id) {
      const m = await Member.findOne({ userId: id }).select("memberCode phone address plan status joinDate expiryDate");
      if (!m) return null;
      return {
        memberCode: m.memberCode,
        phone: m.phone,
        address: m.address,
        plan: m.plan,
        status: m.status,
        joinDate: m.joinDate,
        expiryDate: m.expiryDate
      };
    },
    async getAdminStats() {
      const [totalUsers, totalMembers, activeMembers, pausedMembers, expiredMembers] = await Promise.all([
        User.countDocuments({}),
        Member.countDocuments({}),
        Member.countDocuments({ status: "active" }),
        Member.countDocuments({ status: "paused" }),
        Member.countDocuments({ status: "expired" })
      ]);

      return {
        totalUsers,
        totalMembers,
        activeMembers,
        pausedMembers,
        expiredMembers
      };
    },
    
    // User Management
    async getAllUsers() {
      const users = await User.find({}).select("_id name email role createdAt").sort({ createdAt: -1 });
      return users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }));
    },
    async createUser(data) {
      const user = await User.create(data);
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    },
    async updateUser(id, data) {
      const user = await User.findByIdAndUpdate(id, data, { new: true }).select("_id name email role");
      if (!user) return null;
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    },
    async deleteUser(id) {
      await User.findByIdAndDelete(id);
      await Member.deleteOne({ userId: id });
      await Payment.deleteMany({ userId: id });
      await Attendance.deleteMany({ userId: id });
      await BMI.deleteMany({ userId: id });
      return true;
    },
    
    // Member Management
    async createMember(data) {
      const member = await Member.create(data);
      return member;
    },
    async updateMember(userId, data) {
      const member = await Member.findOneAndUpdate({ userId }, data, { new: true });
      return member;
    },
    async getMemberByUserId(userId) {
      return await Member.findOne({ userId });
    },
    
    // Payment Management
    async getAllPayments() {
      const payments = await Payment.find({})
        .populate("userId", "name email")
        .sort({ paymentDate: -1 });
      return payments;
    },
    async createPayment(data) {
      const payment = await Payment.create(data);
      return payment;
    },
    async getPaymentsByUserId(userId) {
      return await Payment.find({ userId }).sort({ paymentDate: -1 });
    },
    
    // Attendance Management
    async getAllAttendance(date) {
      const query = date ? { date } : {};
      const attendance = await Attendance.find(query)
        .populate("userId", "name email")
        .sort({ checkInTime: -1 });
      return attendance;
    },
    async createAttendance(data) {
      const attendance = await Attendance.create(data);
      return attendance;
    },
    async getAttendanceByUserId(userId, limit = 30) {
      return await Attendance.find({ userId }).sort({ checkInTime: -1 }).limit(limit);
    },
    async getAttendanceByUserIdAndDate(userId, date) {
      return await Attendance.findOne({ userId, date });
    },
    
    // BMI Management
    async getAllBMI() {
      const bmi = await BMI.find({})
        .populate("userId", "name email")
        .sort({ recordDate: -1 });
      return bmi;
    },
    async createBMI(data) {
      const bmi = await BMI.create(data);
      return bmi;
    },
    async getBMIByUserId(userId, limit = 10) {
      return await BMI.find({ userId }).sort({ recordDate: -1 }).limit(limit);
    },

    // QR Code Management
    async createQRCode() {
      // Deactivate any existing active QR codes
      await QRCode.updateMany({ isActive: true }, { isActive: false });
      
      // Create new QR code
      const qrCode = await QRCode.create({
        isActive: true
      });
      return { id: qrCode._id.toString(), code: qrCode.code };
    },

    async getActiveQRCode() {
      const qrCode = await QRCode.findOne({ isActive: true });
      if (!qrCode) return null;
      return { id: qrCode._id.toString(), code: qrCode.code, isActive: qrCode.isActive };
    },

    async validateQRCode(code) {
      const qrCode = await QRCode.findOne({ code, isActive: true });
      return qrCode ? { id: qrCode._id.toString(), code: qrCode.code } : null;
    },

    async addUserToQRCodeScan(qrCodeId, userId) {
      const qrCode = await QRCode.findByIdAndUpdate(
        qrCodeId,
        { $addToSet: { scannedBy: userId } },
        { new: true }
      );
      return qrCode;
    },

    async deactivateQRCode(qrCodeId) {
      const qrCode = await QRCode.findByIdAndUpdate(qrCodeId, { isActive: false }, { new: true });
      return qrCode;
    },

    async getQRCodeHistory(limit = 10) {
      return await QRCode.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("scannedBy", "name email");
    }
  };
}

module.exports = { createMongoRepo };

