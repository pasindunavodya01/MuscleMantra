const fs = require("node:fs");
const path = require("node:path");

const bcrypt = require("bcryptjs");

const { env } = require("../src/config/env");
const { connectMongo } = require("../src/loaders/mongoose");
const User = require("../src/models/User");
const Member = require("../src/models/Member");
const Payment = require("../src/models/Payment");
const Attendance = require("../src/models/Attendance");
const BMI = require("../src/models/BMI");

async function seed() {
  const seedPath = path.resolve(__dirname, "..", "src", "data", "seed.json");
  const raw = fs.readFileSync(seedPath, "utf8");
  const data = JSON.parse(raw);

  await connectMongo(env.mongoUri);

  // Clear existing data
  await Promise.all([
    Member.deleteMany({}),
    User.deleteMany({}),
    Payment.deleteMany({}),
    Attendance.deleteMany({}),
    BMI.deleteMany({})
  ]);

  console.log("Creating users and members...");
  const userIds = [];

  for (const u of data.users || []) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await User.create({
      name: u.name,
      email: u.email.toLowerCase(),
      passwordHash,
      role: u.role
    });

    userIds.push({ id: user._id, role: u.role, name: u.name });

    if (u.member) {
      await Member.create({
        userId: user._id,
        memberCode: u.member.memberCode,
        phone: u.member.phone || "",
        plan: u.member.plan || "basic",
        status: u.member.status || "active",
        joinDate: new Date(u.member.joinDate),
        expiryDate: new Date(u.member.expiryDate)
      });
    }
  }

  console.log("Creating sample payments...");
  const memberUsers = userIds.filter(u => u.role === "member");
  
  for (const user of memberUsers) {
    // Create 2-3 payment records per member
    const numPayments = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numPayments; i++) {
      const daysAgo = Math.floor(Math.random() * 90) + (i * 30);
      await Payment.create({
        userId: user.id,
        amount: [3000, 5000, 8000][Math.floor(Math.random() * 3)],
        paymentDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        paymentMethod: ["cash", "card", "bank_transfer", "online"][Math.floor(Math.random() * 4)],
        description: `Monthly membership payment`,
        status: "completed"
      });
    }
  }

  console.log("Creating sample attendance records...");
  for (const user of memberUsers) {
    // Create attendance for last 30 days (random 15-25 days)
    const numDays = Math.floor(Math.random() * 11) + 15;
    for (let i = 0; i < numDays; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const checkInHour = Math.floor(Math.random() * 4) + 6; // 6-10 AM
      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, Math.floor(Math.random() * 60), 0);
      
      const checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(checkInTime.getHours() + Math.floor(Math.random() * 2) + 1); // 1-3 hours later
      
      await Attendance.create({
        userId: user.id,
        checkInTime,
        checkOutTime,
        date: dateStr
      });
    }
  }

  console.log("Creating sample BMI records...");
  for (const user of memberUsers) {
    // Create 2-4 BMI records showing progress
    const numRecords = Math.floor(Math.random() * 3) + 2;
    let weight = 70 + Math.floor(Math.random() * 30); // Starting weight 70-100kg
    const height = 160 + Math.floor(Math.random() * 30); // Height 160-190cm
    
    for (let i = 0; i < numRecords; i++) {
      const daysAgo = (numRecords - i - 1) * 30; // Monthly records
      const recordDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Simulate weight loss/gain over time
      if (i > 0) {
        weight = weight + (Math.random() * 4 - 2); // +/- 2kg variation
      }
      
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      
      let category;
      if (bmi < 18.5) category = "underweight";
      else if (bmi < 25) category = "normal";
      else if (bmi < 30) category = "overweight";
      else category = "obese";
      
      await BMI.create({
        userId: user.id,
        weight: parseFloat(weight.toFixed(1)),
        height,
        bmi: parseFloat(bmi.toFixed(2)),
        category,
        recordDate,
        notes: i === 0 ? "Initial measurement" : `Progress check ${i}`
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log(`Created ${userIds.length} users`);
  console.log(`Created ${memberUsers.length} members`);
  console.log("Sample data includes payments, attendance, and BMI records");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

