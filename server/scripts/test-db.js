const { env } = require("../src/config/env");
const { connectMongo } = require("../src/loaders/mongoose");
const User = require("../src/models/User");
const Member = require("../src/models/Member");
const Payment = require("../src/models/Payment");
const Attendance = require("../src/models/Attendance");
const BMI = require("../src/models/BMI");

async function testDB() {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo(env.mongoUri);
    console.log("✅ Connected successfully!");

    console.log("\nCounting documents...");
    const userCount = await User.countDocuments();
    const memberCount = await Member.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const bmiCount = await BMI.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Members: ${memberCount}`);
    console.log(`Payments: ${paymentCount}`);
    console.log(`Attendance: ${attendanceCount}`);
    console.log(`BMI Records: ${bmiCount}`);

    console.log("\nFetching sample data...");
    const users = await User.find().limit(3);
    console.log("Sample users:", users.map(u => ({ name: u.name, email: u.email, role: u.role })));

    const payments = await Payment.find().populate("userId", "name email").limit(3);
    console.log("Sample payments:", payments.map(p => ({ 
      user: p.userId?.name, 
      amount: p.amount, 
      date: p.paymentDate 
    })));

    console.log("\n✅ Database test completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database test failed:", err);
    process.exit(1);
  }
}

testDB();
