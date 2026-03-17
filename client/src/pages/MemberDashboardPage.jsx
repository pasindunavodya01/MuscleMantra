import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { StripePaymentWrapper, StripeCheckoutButton } from "../components/StripePayment";

const PRIMARY = "#ff5722";
const SECONDARY = "#212121";
const DARK_BG = "#121212";
const ACCENT_GREEN = "#76ff03";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@300;400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

  .dashboard-container {
    min-height: 100vh;
    background: ${DARK_BG};
    font-family: 'Roboto', sans-serif;
  }

  /* Navbar */
  .member-navbar {
    background: ${SECONDARY};
    height: 70px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0,0,0,.5);
  }
  .member-nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .member-logo {
    font-size: 1.5rem;
    font-weight: bold;
    font-family: 'Oswald', sans-serif;
    color: #f5f5f5;
  }
  .member-highlight {
    color: ${PRIMARY};
  }
  .member-nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .member-user-name {
    color: #bdbdbd;
    font-size: 0.9rem;
  }
  .btn-logout {
    background: rgba(255,255,255,0.1);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
    font-family: 'Roboto', sans-serif;
  }
  .btn-logout:hover {
    background: ${PRIMARY};
    border-color: ${PRIMARY};
    transform: translateY(-2px);
  }

  /* Tabs */
  .member-tabs {
    background: #1a1a1a;
    border-bottom: 2px solid #2a2a2a;
    position: sticky;
    top: 70px;
    z-index: 99;
  }
  .member-tabs-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }
  .tab-btn {
    background: transparent;
    color: #bdbdbd;
    border: none;
    padding: 16px 24px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
    font-family: 'Roboto', sans-serif;
  }
  .tab-btn:hover {
    color: ${PRIMARY};
    background: rgba(255,87,34,0.05);
  }
  .tab-btn.active {
    color: ${PRIMARY};
    border-bottom-color: ${PRIMARY};
    background: rgba(255,87,34,0.1);
  }
  .tab-btn i {
    margin-right: 8px;
  }

  /* Content */
  .member-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  .loading {
    text-align: center;
    color: #bdbdbd;
    padding: 60px 20px;
    font-size: 1.1rem;
  }
  .alert-error {
    background: rgba(244,67,54,0.1);
    border: 1px solid rgba(244,67,54,0.3);
    color: #ff8a80;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }
  .alert-success {
    background: rgba(76,175,80,0.1);
    border: 1px solid rgba(76,175,80,0.3);
    color: #81c784;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  /* Stats Grid */
  .membership-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }
  .info-card {
    background: ${SECONDARY};
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s;
    border: 1px solid #2a2a2a;
  }
  .info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .info-label {
    color: #bdbdbd;
    font-size: 0.85rem;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .info-value {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'Oswald', sans-serif;
  }

  /* Status Badge */
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  .status-active {
    background: rgba(76,175,80,0.2);
    color: #81c784;
  }
  .status-paused {
    background: rgba(255,152,0,0.2);
    color: #ffb74d;
  }
  .status-expired {
    background: rgba(244,67,54,0.2);
    color: #e57373;
  }

  /* Section */
  .member-section {
    background: ${SECONDARY};
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #2a2a2a;
    margin-bottom: 24px;
  }
  .section-title {
    font-family: 'Oswald', sans-serif;
    font-size: 1.5rem;
    color: #fff;
    text-transform: uppercase;
    margin: 0 0 20px 0;
  }

  /* Form */
  .form-group {
    margin-bottom: 20px;
  }
  .form-label {
    display: block;
    color: #bdbdbd;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    color: #fff;
    padding: 10px 14px;
    font-size: 0.95rem;
    font-family: 'Roboto', sans-serif;
    transition: all 0.3s;
  }
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: ${PRIMARY};
    box-shadow: 0 0 0 3px rgba(255,87,34,0.1);
  }
  .form-textarea {
    resize: vertical;
  }

  /* Buttons */
  .btn-primary {
    background: ${PRIMARY};
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: all 0.3s;
    font-family: 'Roboto', sans-serif;
  }
  .btn-primary:hover {
    background: #e64a19;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255,87,34,0.4);
  }
  .btn-primary:disabled {
    background: #424242;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Table */
  .table-container {
    overflow-x: auto;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  .table thead {
    background: #1a1a1a;
  }
  .table th {
    padding: 14px 16px;
    text-align: left;
    color: ${PRIMARY};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #2a2a2a;
  }
  .table td {
    padding: 14px 16px;
    color: #e0e0e0;
    border-bottom: 1px solid #2a2a2a;
  }
  .table tbody tr {
    transition: background 0.2s;
  }
  .table tbody tr:hover {
    background: rgba(255,87,34,0.05);
  }

  /* QR Scanner */
  .qr-scanner {
    text-align: center;
    padding: 40px 20px;
  }
  .qr-input {
    max-width: 400px;
    margin: 0 auto 20px;
  }

  /* BMI Category Badge */
  .bmi-category {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  .bmi-underweight {
    background: rgba(33,150,243,0.2);
    color: #64b5f6;
  }
  .bmi-normal {
    background: rgba(76,175,80,0.2);
    color: #81c784;
  }
  .bmi-overweight {
    background: rgba(255,152,0,0.2);
    color: #ffb74d;
  }
  .bmi-obese {
    background: rgba(244,67,54,0.2);
    color: #e57373;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .member-tabs-container {
      padding: 0 12px;
    }
    .tab-btn {
      padding: 12px 16px;
      font-size: 0.85rem;
    }
    .member-content {
      padding: 20px 12px;
    }
    .membership-grid {
      grid-template-columns: 1fr;
    }
    .table-container {
      font-size: 0.85rem;
    }
    .table th,
    .table td {
      padding: 10px 8px;
    }
  }
`;

export default function MemberDashboardPage() {
  const { user, logout, isBooting } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [membership, setMembership] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qrCodeFromScan, setQrCodeFromScan] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentsReloadTrigger, setPaymentsReloadTrigger] = useState(0);

  useEffect(() => {
    loadMembership();
    setPaymentVerified(false);
  }, []);

  useEffect(() => {
    if (isBooting) return; // Wait for user to load
    if (paymentVerified) return; // Already verified in this session
    
    // Check for Stripe payment redirect
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const sessionId = params.get("session");
    
    if (paymentStatus === "success" && sessionId) {
      // Verify and save Stripe payment to database
      verifyStripePayment(sessionId);
      setPaymentVerified(true);
      setActiveTab("payments");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if QR code was passed from external scanner
    const code = params.get("code");
    if (code) {
      setQrCodeFromScan(code);
      setActiveTab("attendance");
      // Flag this as a fresh QR code that hasn't been used
      sessionStorage.setItem("qrCodeFromScan", code);
      sessionStorage.setItem("qrCodeUsed", "false");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isBooting, paymentVerified]);

  const loadMembership = async () => {
    try {
      const res = await api.get("/member/me");
      setMembership(res.data.membership);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load membership");
    }
  };

  const verifyStripePayment = async (sessionId) => {
    try {
      // Call verify endpoint to save payment to database
      const response = await api.post("/stripe/payment/verify", {
        sessionId: sessionId
      });
      
      if (response.data.success) {
        setSuccess("Payment verified and saved successfully! 💳");
        // Trigger PaymentsTab to reload
        setPaymentsReloadTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
      setError(err?.response?.data?.message || "Failed to verify payment");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        {/* Navbar */}
        <nav className="member-navbar">
          <div className="member-nav-container">
            <div className="member-logo">
              Muscle Mantra <span className="member-highlight">Member</span>
            </div>
            <div className="member-nav-right">
              <span className="member-user-name">{user?.name}</span>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Tabs */}
        <div className="member-tabs">
          <div className="member-tabs-container">
            <button 
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-chart-line" /> Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              <i className="fas fa-user-edit" /> Update Details
            </button>
            <button 
              className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              <i className="fas fa-credit-card" /> Payments
            </button>
            <button 
              className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              <i className="fas fa-calendar-check" /> Attendance
            </button>
            <button 
              className={`tab-btn ${activeTab === "bmi" ? "active" : ""}`}
              onClick={() => setActiveTab("bmi")}
            >
              <i className="fas fa-weight" /> BMI Tracker
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="member-content">
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          {!membership ? (
            <div className="loading">Loading membership details...</div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab membership={membership} />
              )}
              {activeTab === "details" && (
                <DetailsTab 
                  membership={membership} 
                  onUpdate={loadMembership}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              )}
              {activeTab === "payments" && (
                <PaymentsTab 
                  setError={setError}
                  setSuccess={setSuccess}
                  reloadTrigger={paymentsReloadTrigger}
                />
              )}
              {activeTab === "attendance" && (
                <AttendanceTab 
                  setError={setError}
                  setSuccess={setSuccess}
                  initialQrCode={qrCodeFromScan}
                  onQrUsed={() => setQrCodeFromScan("")}
                />
              )}
              {activeTab === "bmi" && (
                <BMITab 
                  setError={setError}
                  setSuccess={setSuccess}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function OverviewTab({ membership }) {
  return (
    <div className="membership-grid">
      <InfoCard title="Member Code" value={membership.memberCode} />
      <InfoCard title="Plan" value={membership.plan} />
      <InfoCard 
        title="Status" 
        value={<StatusBadge status={membership.status} />} 
      />
      <InfoCard title="Phone" value={membership.phone || "N/A"} />
      <InfoCard title="Address" value={membership.address || "N/A"} />
      <InfoCard title="Join Date" value={formatDate(membership.joinDate)} />
      <InfoCard title="Expiry Date" value={formatDate(membership.expiryDate)} />
    </div>
  );
}

function DetailsTab({ membership, onUpdate, setError, setSuccess }) {
  const [phone, setPhone] = useState(membership.phone || "");
  const [address, setAddress] = useState(membership.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await api.put("/member/me", { phone, address });
      setSuccess("Details updated successfully");
      onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-section">
      <h2 className="section-title">Update Your Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Details"}
        </button>
      </form>
    </div>
  );
}

function PaymentsTab({ setError, setSuccess, reloadTrigger }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadPayments();
  }, [reloadTrigger]);

  const loadPayments = async () => {
    try {
      const res = await api.get("/member/payments");
      setPayments(res.data.payments);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit form if using Stripe through the button component
    if (paymentMethod === "stripe") {
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      await api.post("/member/payments", { 
        amount: parseFloat(amount), 
        paymentMethod,
        description 
      });
      setSuccess("Payment submitted successfully");
      setAmount("");
      setDescription("");
      loadPayments();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="member-section">
        <h2 className="section-title">Make a Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount (Rs.)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="online">Online</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting || paymentMethod === "stripe" && (!amount || amount <= 0)}>
            {submitting ? "Submitting..." : paymentMethod === "stripe" ? "Pay with Stripe" : "Submit Payment"}
          </button>
          {paymentMethod === "stripe" && amount && parseFloat(amount) > 0 && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ color: "#bdbdbd", fontSize: "0.9rem" }}>
                Or use Stripe directly:
              </p>
              <StripePaymentWrapper>
                <StripeCheckoutButton
                  userId={user?.id}
                  amount={parseFloat(amount) || 0}
                  description={description || "Gym membership payment"}
                  membershipType="membership"
                  onSuccess={() => {
                    setSuccess("Payment processed successfully!");
                    setAmount("");
                    setDescription("");
                    loadPayments();
                  }}
                  onError={(err) => setError(err)}
                  variant="primary"
                />
              </StripePaymentWrapper>
            </div>
          )}
        </form>
      </div>

      <div className="member-section">
        <h2 className="section-title">Payment History</h2>
        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : payments.length === 0 ? (
          <p style={{ color: "#bdbdbd" }}>No payments found</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>Rs. {payment.amount.toFixed(2)}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      <span className={`status-badge status-${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function AttendanceTab({ setError, setSuccess, initialQrCode = "", onQrUsed }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [currentQRInfo, setCurrentQRInfo] = useState(null);
  const hasAutoCheckedIn = useRef(false);
  const qrCodeRef = useRef(initialQrCode);

  useEffect(() => {
    loadAttendance();
    loadCurrentQRCode();
  }, []);

  // Handle auto-check-in from QR scan, but only once per fresh QR code
  useEffect(() => {
    if (initialQrCode && !checking && !hasAutoCheckedIn.current) {
      const qrUsed = sessionStorage.getItem("qrCodeUsed");
      // Only auto-submit if this is a fresh QR code (not previously used)
      if (qrUsed !== "true") {
        hasAutoCheckedIn.current = true;
        sessionStorage.setItem("qrCodeUsed", "true");
        qrCodeRef.current = initialQrCode;
        handleCheckInWithCode(initialQrCode);
      }
    }
  }, []);

  const loadAttendance = async () => {
    try {
      const res = await api.get("/member/attendance");
      setAttendance(res.data.attendance);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentQRCode = async () => {
    try {
      const res = await api.get("/qrcode/current");
      if (res.data?.qrCode) {
        setCurrentQRInfo(res.data.qrCode);
      }
    } catch (err) {
      console.log("No active QR code available");
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    handleCheckInWithCode(qrCode);
  };

  const handleCheckInWithCode = async (code) => {
    // Prevent empty submissions
    if (!code || !code.trim()) {
      setError("Please provide a QR code");
      return;
    }

    setChecking(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await api.post("/member/attendance/checkin", { qrCode: code.trim() });
      setSuccess(res.data.message);
      setQrCode(""); // Clear the input immediately
      qrCodeRef.current = ""; // Clear the ref as well
      
      // Clear sessionStorage after successful check-in
      sessionStorage.removeItem("qrCodeFromScan");
      sessionStorage.removeItem("qrCodeUsed");
      
      if (onQrUsed) onQrUsed();
      loadAttendance();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to check in");
      // Don't clear the input on error so user can retry
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div className="member-section">
        <h2 className="section-title">Check In</h2>
        {currentQRInfo && (
          <div style={{
            background: "rgba(76,175,80,0.1)",
            border: "1px solid rgba(76,175,80,0.3)",
            color: "#81c784",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            <i className="fas fa-qrcode" style={{ marginRight: "8px" }} />
            Current QR code is available. You can scan it with your device or enter it below.
          </div>
        )}
        <div className="qr-scanner">
          <p style={{ color: "#bdbdbd", marginBottom: "20px" }}>
            Scan the QR code at the gym entrance with your device scanner, or paste the code below to mark your attendance.
          </p>
          <form onSubmit={handleCheckIn}>
            <div className="form-group qr-input">
              <input
                type="text"
                className="form-input"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Paste or scan QR code"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" disabled={checking}>
              {checking ? "Checking In..." : "Check In"}
            </button>
          </form>
        </div>
      </div>

      <div className="member-section">
        <h2 className="section-title">Attendance History</h2>
        {loading ? (
          <div className="loading">Loading attendance...</div>
        ) : attendance.length === 0 ? (
          <p style={{ color: "#bdbdbd" }}>No attendance records found</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const checkIn = new Date(record.checkInTime);
                  const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
                  const duration = checkOut ? Math.round((checkOut - checkIn) / (1000 * 60)) : null;
                  
                  return (
                    <tr key={record._id}>
                      <td>{record.date}</td>
                      <td>{formatTime(record.checkInTime)}</td>
                      <td>{record.checkOutTime ? formatTime(record.checkOutTime) : "-"}</td>
                      <td>{duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function BMITab({ setError, setSuccess }) {
  const [bmiRecords, setBmiRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBMI();
  }, []);

  const loadBMI = async () => {
    try {
      const res = await api.get("/member/bmi");
      setBmiRecords(res.data.bmi);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load BMI records");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      await api.post("/member/bmi", { 
        weight: parseFloat(weight), 
        height: parseFloat(height),
        notes 
      });
      setSuccess("BMI record added successfully");
      setWeight("");
      setHeight("");
      setNotes("");
      loadBMI();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add BMI record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="member-section">
        <h2 className="section-title">Track Your BMI</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input
              type="number"
              className="form-input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight in kg"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input
              type="number"
              className="form-input"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Enter your height in cm"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add BMI Record"}
          </button>
        </form>
      </div>

      <div className="member-section">
        <h2 className="section-title">BMI History</h2>
        {loading ? (
          <div className="loading">Loading BMI records...</div>
        ) : bmiRecords.length === 0 ? (
          <p style={{ color: "#bdbdbd" }}>No BMI records found</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight (kg)</th>
                  <th>Height (cm)</th>
                  <th>BMI</th>
                  <th>Category</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {bmiRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDate(record.recordDate)}</td>
                    <td>{record.weight}</td>
                    <td>{record.height}</td>
                    <td>{record.bmi}</td>
                    <td>
                      <span className={`bmi-category bmi-${record.category}`}>
                        {record.category}
                      </span>
                    </td>
                    <td>{record.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="info-card">
      <div className="info-label">{title}</div>
      <div className="info-value">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = `status-badge status-${status}`;
  return <span className={className}>{status}</span>;
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return "N/A";
  }
}

function formatTime(d) {
  try {
    return new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "N/A";
  }
}
