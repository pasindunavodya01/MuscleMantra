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
  let activeQRCode = null;
  const qrCodeHistory = [];

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
        plan: u.member.plan || "basic",
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
    }
  };
}

module.exports = { createMemoryRepo };

