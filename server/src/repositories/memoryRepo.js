const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { v4: uuidv4 } = require("uuid");

const bcrypt = require("bcryptjs");

function stableIdFromEmail(email) {
  return crypto.createHash("sha1").update(email.toLowerCase()).digest("hex").slice(0, 24);
}

function createMemoryRepo() {
  const seedPath = path.resolve(__dirname, "..", "data", "seed.json");
  const raw = fs.readFileSync(seedPath, "utf8");
  const seed = JSON.parse(raw);

  const usersById = new Map();
  const usersByEmail = new Map();
  const membershipByUserId = new Map();
  const qrCodesById = new Map();
  const paymentsById = new Map();
  const attendanceById = new Map();
  const bmiById = new Map();
  let activeQRCode = null;
  const qrCodeHistory = [];
  let paymentIdCounter = 1;
  let attendanceIdCounter = 1;
  let bmiIdCounter = 1;

  for (const u of seed.users || []) {
    const id = stableIdFromEmail(u.email);
    const passwordHash = bcrypt.hashSync(u.password, 10);
    const user = {
      id,
      name: u.name,
      email: u.email.toLowerCase(),
      role: u.role,
      passwordHash
    };

    usersById.set(id, user);
    usersByEmail.set(user.email, user);

    if (u.member) {
      membershipByUserId.set(id, {
        memberCode: u.member.memberCode,
        phone: u.member.phone || "",
        plan: u.member.plan || "1-month",
        status: u.member.status || "active",
        joinDate: u.member.joinDate,
        expiryDate: u.member.expiryDate
      });
    }
  }

  return {
    async getUserByEmail(email) {
      return usersByEmail.get(email.toLowerCase()) || null;
    },
    async getUserById(id) {
      const u = usersById.get(id);
      if (!u) return null;
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    },
    async getMembershipByUserId(id) {
      return membershipByUserId.get(id) || null;
    },
    async getAdminStats() {
      const allUsers = Array.from(usersById.values());
      const allMembers = Array.from(membershipByUserId.values());
      return {
        totalUsers: allUsers.length,
        totalMembers: allMembers.length,
        activeMembers: allMembers.filter((m) => m.status === "active").length,
        pausedMembers: allMembers.filter((m) => m.status === "paused").length,
        expiredMembers: allMembers.filter((m) => m.status === "expired").length
      };
    },
    // QR Code Management
    async createQRCode() {
      const code = uuidv4();
      const qrCode = {
        id: code,
        code: code,
        isActive: true,
        createdAt: new Date(),
        scannedBy: []
      };
      
      // Deactivate previous active QR code
      if (activeQRCode) {
        activeQRCode.isActive = false;
        qrCodeHistory.push(activeQRCode);
      }
      
      qrCodesById.set(code, qrCode);
      activeQRCode = qrCode;
      
      return { id: qrCode.id, code: qrCode.code };
    },
    async getActiveQRCode() {
      if (!activeQRCode) return null;
      return { id: activeQRCode.id, code: activeQRCode.code, isActive: activeQRCode.isActive };
    },
    async validateQRCode(code) {
      const qrCode = qrCodesById.get(code);
      if (qrCode && qrCode.isActive) {
        return { id: qrCode.id, code: qrCode.code };
      }
      return null;
    },
    async addUserToQRCodeScan(qrCodeId, userId) {
      const qrCode = qrCodesById.get(qrCodeId);
      if (qrCode && !qrCode.scannedBy.includes(userId)) {
        qrCode.scannedBy.push(userId);
      }
      return qrCode;
    },
    async deactivateQRCode(qrCodeId) {
      const qrCode = qrCodesById.get(qrCodeId);
      if (qrCode) {
        qrCode.isActive = false;
      }
      return qrCode;
    },
    async getQRCodeHistory(limit = 10) {
      const allQRCodes = Array.from(qrCodesById.values());
      return allQRCodes.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    },
    // User Management
    async getAllUsers() {
      return Array.from(usersById.values()).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }));
    },
    async createUser({ name, email, passwordHash, role }) {
      const id = uuidv4();
      const user = { id, name, email, passwordHash, role };
      usersById.set(id, user);
      usersByEmail.set(email.toLowerCase(), user);
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
    async updateUser(id, updateData) {
      const user = usersById.get(id);
      if (!user) return null;
      
      if (updateData.name) user.name = updateData.name;
      if (updateData.email) {
        usersByEmail.delete(user.email);
        user.email = updateData.email;
        usersByEmail.set(user.email, user);
      }
      if (updateData.role) user.role = updateData.role;
      
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
    async deleteUser(id) {
      const user = usersById.get(id);
      if (user) {
        usersById.delete(id);
        usersByEmail.delete(user.email);
        membershipByUserId.delete(id);
      }
    },
    async createMember(memberData) {
      const { userId, ...data } = memberData;
      membershipByUserId.set(userId, {
        memberCode: data.memberCode || uuidv4(),
        phone: data.phone || "",
        plan: data.plan || "1-month",
        status: data.status || "active",
        joinDate: data.joinDate || new Date(),
        expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      return membershipByUserId.get(userId);
    },
    async updateMember(userId, memberData) {
      const existing = membershipByUserId.get(userId) || {};
      const updated = { ...existing, ...memberData };
      membershipByUserId.set(userId, updated);
      return updated;
    },
    async getExpiredMembers() {
      const now = new Date();
      const expiredMembers = [];
      
      for (const [userId, membership] of membershipByUserId) {
        const expiryDate = new Date(membership.expiryDate);
        if (expiryDate < now) {
          const user = usersById.get(userId);
          expiredMembers.push({
            _id: userId,
            userId: { name: user?.name, email: user?.email },
            ...membership
          });
        }
      }
      
      return expiredMembers.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    },
    // Payment Management
    async getAllPayments() {
      return Array.from(paymentsById.values());
    },
    async createPayment(paymentData) {
      const id = String(paymentIdCounter++);
      const payment = {
        id,
        ...paymentData,
        createdAt: paymentData.paymentDate || new Date()
      };
      paymentsById.set(id, payment);
      return payment;
    },
    async getPaymentsByUserId(userId) {
      return Array.from(paymentsById.values()).filter(p => p.userId === userId);
    },
    // Attendance Management
    async getAllAttendance(date) {
      let records = Array.from(attendanceById.values());
      if (date) {
        records = records.filter(r => {
          const recordDate = new Date(r.date).toDateString();
          const filterDate = new Date(date).toDateString();
          return recordDate === filterDate;
        });
      }
      return records;
    },
    async createAttendance(attendanceData) {
      const id = String(attendanceIdCounter++);
      const record = {
        id,
        ...attendanceData,
        createdAt: new Date()
      };
      attendanceById.set(id, record);
      return record;
    },
    async getAttendanceByUserId(userId) {
      return Array.from(attendanceById.values()).filter(a => a.userId === userId);
    },
    // BMI Management
    async getAllBMI() {
      return Array.from(bmiById.values());
    },
    async createBMI(bmiData) {
      const id = String(bmiIdCounter++);
      const record = {
        id,
        ...bmiData,
        createdAt: new Date()
      };
      bmiById.set(id, record);
      return record;
    },
    async getBMIByUserId(userId) {
      return Array.from(bmiById.values()).filter(b => b.userId === userId);
    }
  };
}

module.exports = { createMemoryRepo };

