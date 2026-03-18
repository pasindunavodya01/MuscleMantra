async function myMembership(req, res, next) {
  try {
    const membership = await req.app.locals.repo.getMembershipByUserId(req.user.id);
    if (!membership) return res.status(404).json({ message: "Membership not found" });
    return res.json({ membership });
  } catch (err) {
    next(err);
  }
}

async function updateMyDetails(req, res, next) {
  try {
    const { phone, address } = req.body;
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    
    const member = await req.app.locals.repo.updateMember(req.user.id, updateData);
    if (!member) return res.status(404).json({ message: "Member not found" });
    
    return res.json({ member });
  } catch (err) {
    next(err);
  }
}

async function getMyPayments(req, res, next) {
  try {
    const payments = await req.app.locals.repo.getPaymentsByUserId(req.user.id);
    return res.json({ payments });
  } catch (err) {
    next(err);
  }
}

async function createMyPayment(req, res, next) {
  try {
    const { amount, paymentMethod, description, paymentType } = req.body;
    
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }
    
    const payment = await req.app.locals.repo.createPayment({
      userId: req.user.id,
      amount,
      paymentMethod: paymentMethod || "online",
      description: description || "",
      status: "pending",
      reviewStatus: "pending_review",
      paymentType: paymentType || "general"
    });
    
    return res.json({ payment });
  } catch (err) {
    next(err);
  }
}

async function getMyAttendance(req, res, next) {
  try {
    const attendance = await req.app.locals.repo.getAttendanceByUserId(req.user.id);
    return res.json({ attendance });
  } catch (err) {
    next(err);
  }
}

async function checkInAttendance(req, res, next) {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode || !qrCode.trim()) {
      return res.status(400).json({ message: "QR code is required" });
    }

    // Validate QR code exists and is active
    const validQRCode = await req.app.locals.repo.validateQRCode(qrCode.trim());
    if (!validQRCode) {
      return res.status(400).json({ message: "Invalid or inactive QR code" });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    const existingAttendance = await req.app.locals.repo.getAttendanceByUserIdAndDate(req.user.id, today);
    
    if (existingAttendance) {
      // Check if user has already checked in with a QR code today
      if (!existingAttendance.checkOutTime) {
        // User is currently checked in - allow check-out
        const updatedAttendance = await req.app.locals.repo.updateAttendanceCheckOut(
          existingAttendance._id,
          new Date()
        );
        
        // Add user to QR code scan history only for check-out
        await req.app.locals.repo.addUserToQRCodeScan(validQRCode.id, req.user.id);
        
        return res.json({ 
          attendance: updatedAttendance, 
          message: "Check-out successful",
          status: "checkout"
        });
      } else {
        // Already checked in and checked out today
        return res.status(400).json({ 
          message: "You have already checked in and checked out today. Please try again tomorrow." 
        });
      }
    }
    
    // Create new check-in
    const attendance = await req.app.locals.repo.createAttendance({
      userId: req.user.id,
      checkInTime: new Date(),
      date: today
    });
    
    // Add user to QR code scan history for check-in
    await req.app.locals.repo.addUserToQRCodeScan(validQRCode.id, req.user.id);
    
    return res.json({ 
      attendance, 
      message: "Check-in successful",
      status: "checkin"
    });
  } catch (err) {
    next(err);
  }
}

async function getMyBMI(req, res, next) {
  try {
    const bmi = await req.app.locals.repo.getBMIByUserId(req.user.id);
    return res.json({ bmi });
  } catch (err) {
    next(err);
  }
}

async function createMyBMI(req, res, next) {
  try {
    const { weight, height, notes } = req.body;
    
    if (!weight || !height) {
      return res.status(400).json({ message: "Weight and height are required" });
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
      userId: req.user.id,
      weight,
      height,
      bmi: parseFloat(bmi.toFixed(2)),
      category,
      recordDate: new Date(),
      notes: notes || ""
    });
    
    return res.json({ bmi: bmiRecord });
  } catch (err) {
    next(err);
  }
}

async function uploadPaymentProof(req, res, next) {
  try {
    const { paymentId } = req.params;
    const { proofBase64, fileName } = req.body;

    if (!proofBase64) {
      return res.status(400).json({ message: "Payment proof is required" });
    }

    // Create a simple proof reference (in production, you'd upload to cloud storage)
    // For now, we'll store a reference with timestamp
    const proofReference = `proof_${Date.now()}_${fileName || 'payment.pdf'}`;
    
    const payment = await req.app.locals.repo.updatePayment(paymentId, {
      proofOfPayment: proofReference,
      reviewStatus: "pending_review",
      status: "pending"
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json({ 
      payment,
      message: "Payment proof uploaded successfully. Admin will review it shortly."
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  myMembership,
  updateMyDetails,
  getMyPayments,
  createMyPayment,
  uploadPaymentProof,
  getMyAttendance,
  checkInAttendance,
  getMyBMI,
  createMyBMI
};
