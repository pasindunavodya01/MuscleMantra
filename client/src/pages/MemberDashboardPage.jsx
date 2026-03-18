import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { StripePaymentWrapper, StripeCheckoutButton } from "../components/StripePayment";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { getMemberQueryLink } from "../utils/whatsapp";

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
    .member-navbar {
      height: 60px;
    }
    .member-nav-container {
      padding: 0 12px;
    }
    .member-logo {
      font-size: 1.2rem;
    }
    .member-nav-right {
      gap: 8px;
    }
    .member-user-name {
      display: none;
    }
    .btn-logout {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    .member-tabs-container {
      padding: 0 12px;
      gap: 0;
      overflow-x: auto;
      scroll-behavior: smooth;
    }
    .tab-btn {
      padding: 12px 12px;
      font-size: 0.8rem;
      min-width: 80px;
    }
    .tab-btn i {
      margin-right: 4px;
    }
    .member-content {
      padding: 16px 12px;
    }
    .member-section {
      padding: 16px;
    }
    .section-title {
      font-size: 1.3rem;
      margin-bottom: 16px;
    }
    .membership-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .info-card {
      padding: 16px;
    }
    .form-group {
      margin-bottom: 12px;
    }
    .form-label {
      font-size: 0.8rem;
    }
    .form-input {
      padding: 10px;
      font-size: 14px;
    }
    .btn-primary {
      padding: 10px 16px;
      min-height: 44px;
      font-size: 0.9rem;
    }
    .table-container {
      font-size: 0.8rem;
      overflow-x: auto;
    }
    .table th,
    .table td {
      padding: 10px 8px;
    }
    .status-badge {
      font-size: 0.7rem;
      padding: 3px 8px;
    }
    .alert-error,
    .alert-success {
      padding: 12px;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .member-navbar {
      height: 56px;
    }
    .member-logo {
      font-size: 1rem;
    }
    .member-nav-container {
      padding: 0 8px;
    }
    .member-highlight {
      display: none;
    }
    .btn-logout {
      padding: 4px 8px;
      font-size: 0.75rem;
    }
    .member-tabs {
      top: 56px;
    }
    .member-tabs-container {
      padding: 0 8px;
      gap: 0;
    }
    .tab-btn {
      padding: 10px 8px;
      font-size: 0.7rem;
      min-width: 60px;
    }
    .tab-btn i {
      display: block;
      margin-bottom: 2px;
      margin-right: 0;
      font-size: 0.9rem;
    }
    .member-content {
      padding: 12px 8px;
    }
    .member-section {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 1.1rem;
      margin-bottom: 12px;
    }
    .membership-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .info-card {
      padding: 12px;
    }
    .info-label {
      font-size: 0.7rem;
    }
    .info-value {
      font-size: 1.3rem;
    }
    .form-group {
      margin-bottom: 10px;
    }
    .form-label {
      font-size: 0.75rem;
    }
    .form-input {
      padding: 8px;
      font-size: 13px;
    }
    .form-textarea {
      padding: 8px;
      font-size: 13px;
    }
    .btn-primary {
      width: 100%;
      padding: 10px 12px;
      min-height: 44px;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }
    .table {
      font-size: 0.75rem;
    }
    .table th,
    .table td {
      padding: 8px 6px;
    }
    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .status-badge {
      font-size: 0.65rem;
      padding: 2px 6px;
    }
    .alert-error,
    .alert-success {
      padding: 10px;
      font-size: 0.85rem;
      margin-bottom: 12px;
    }
    .loading {
      padding: 40px 12px;
      font-size: 1rem;
    }
    .qr-scanner {
      padding: 30px 12px;
    }
    .qr-input {
      max-width: 100%;
    }
    /* Achievement Badge Responsive */
    .achievement-grid {
      grid-template-columns: 1fr !important;
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
              <WhatsAppButton
                message={`Hi! I'm ${user?.name}, a member of Muscle Mantra Gym. I have a question about my membership.`}
                label=""
                showIcon={true}
                link={getMemberQueryLink(user?.name, "")}
                style={{
                  background: "#25D366",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  transition: "all 0.3s",
                  fontFamily: "'Roboto', sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              />
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
            <button 
              className={`tab-btn ${activeTab === "help" ? "active" : ""}`}
              onClick={() => setActiveTab("help")}
            >
              <i className="fas fa-question-circle" /> Help & Support
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
              {activeTab === "help" && (
                <HelpTab memberName={membership?.memberName || user?.name} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function OverviewTab({ membership }) {
  const [attendance, setAttendance] = useState([]);
  const [bmiRecords, setBmiRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceRes, bmiRes] = await Promise.all([
        api.get("/member/attendance"),
        api.get("/member/bmi")
      ]);
      
      const attendanceData = attendanceRes.data.attendance || [];
      const bmiData = bmiRes.data.bmi || [];
      
      setAttendance(attendanceData);
      setBmiRecords(bmiData);
      
      // Calculate statistics
      calculateStats(attendanceData, bmiData);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData, bmiData) => {
    // Weekly Attendance
    const weeklyData = calculateWeeklyAttendance(attendanceData);
    
    // Attendance Streak
    const streak = calculateAttendanceStreak(attendanceData);
    
    // BMI Stats
    const currentBMI = bmiData.length > 0 ? bmiData[0] : null;
    const previousBMI = bmiData.length > 1 ? bmiData[1] : null;
    const bmiTrend = calculateBMITrend(currentBMI, previousBMI);
    
    // Average Session Duration
    const avgDuration = calculateAverageSessionDuration(attendanceData);
    
    // Most Active Day
    const mostActiveDay = calculateMostActiveDay(attendanceData);
    
    // Monthly Attendance
    const monthlyCheckIns = calculateMonthlyAttendance(attendanceData);
    
    // Total hours this month
    const monthlyHours = calculateMonthlyHours(attendanceData);

    setStats({
      weeklyCheckIns: weeklyData.checkIns,
      weeklyDays: weeklyData.days,
      streak,
      currentBMI,
      previousBMI,
      bmiTrend,
      avgDuration,
      mostActiveDay,
      monthlyCheckIns,
      monthlyHours,
      totalCheckIns: attendanceData.length
    });
  };

  return (
    <>
      {/* Membership Info Section */}
      <div className="member-section">
        <h2 className="section-title">📋 Membership Details</h2>
        <div className="membership-grid">
          <InfoCard title="Member Code" value={membership.memberCode} />
          <InfoCard title="Plan" value={membership.plan.toUpperCase()} />
          <InfoCard 
            title="Status" 
            value={<StatusBadge status={membership.status} />} 
          />
          <InfoCard title="Phone" value={membership.phone || "N/A"} />
          <InfoCard title="Address" value={membership.address || "N/A"} />
          <InfoCard title="Join Date" value={formatDate(membership.joinDate)} />
          <InfoCard title="Expiry Date" value={formatDate(membership.expiryDate)} />
        </div>
      </div>

      {/* Statistics Section */}
      {loading ? (
        <div className="loading">Loading your statistics...</div>
      ) : stats ? (
        <>
          {/* Attendance Stats */}
          <div className="member-section">
            <h2 className="section-title">📊 Attendance Statistics</h2>
            <div className="membership-grid">
              <StatCard 
                icon="📅"
                title="This Week" 
                value={stats.weeklyCheckIns}
                subtitle={`${stats.weeklyDays} day${stats.weeklyDays !== 1 ? 's' : ''} attended`}
              />
              <StatCard 
                icon="🔥"
                title="Attendance Streak" 
                value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`}
                subtitle="Keep it up! 💪"
              />
              <StatCard 
                icon="⏱️"
                title="Avg Session" 
                value={stats.avgDuration || "N/A"}
                subtitle="Duration per visit"
              />
              <StatCard 
                icon="📈"
                title="Monthly Check-ins" 
                value={stats.monthlyCheckIns}
                subtitle={`${stats.monthlyHours} hours total`}
              />
              <StatCard 
                icon="⭐"
                title="Most Active Day" 
                value={stats.mostActiveDay || "N/A"}
                subtitle="Your peak gym day"
              />
              <StatCard 
                icon="🎯"
                title="Total Check-ins" 
                value={stats.totalCheckIns}
                subtitle="All time visits"
              />
            </div>
          </div>

          {/* BMI Stats */}
          {stats.currentBMI && (
            <div className="member-section">
              <h2 className="section-title">💪 BMI & Health Metrics</h2>
              <div className="membership-grid">
                <StatCard 
                  icon="⚖️"
                  title="Current BMI" 
                  value={stats.currentBMI.bmi.toFixed(1)}
                  subtitle={<span className={`bmi-category bmi-${stats.currentBMI.category}`}>
                    {stats.currentBMI.category}
                  </span>}
                />
                <StatCard 
                  icon="📊"
                  title="Weight" 
                  value={`${stats.currentBMI.weight} kg`}
                  subtitle={`Height: ${stats.currentBMI.height} cm`}
                />
                {stats.previousBMI && (
                  <StatCard 
                    icon={stats.bmiTrend.direction === 'down' ? '📉' : '📈'}
                    title="BMI Trend" 
                    value={stats.bmiTrend.change}
                    subtitle={stats.bmiTrend.message}
                  />
                )}
              </div>
            </div>
          )}

          {/* Achievement Badges */}
          <div className="member-section">
            <h2 className="section-title">🏆 Achievements</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px"
            }}>
              {stats.streak >= 7 && (
                <AchievementBadge 
                  icon="🔥" 
                  title="Week Warrior" 
                  description="7+ day streak"
                />
              )}
              {stats.streak >= 30 && (
                <AchievementBadge 
                  icon="💯" 
                  title="Consistency King" 
                  description="30+ day streak"
                />
              )}
              {stats.weeklyCheckIns >= 5 && (
                <AchievementBadge 
                  icon="⭐" 
                  title="Active Member" 
                  description="5+ visits/week"
                />
              )}
              {stats.monthlyHours >= 20 && (
                <AchievementBadge 
                  icon="💪" 
                  title="Gym Enthusiast" 
                  description="20+ hours/month"
                />
              )}
              {stats.totalCheckIns >= 100 && (
                <AchievementBadge 
                  icon="🎖️" 
                  title="Century Club" 
                  description="100+ total visits"
                />
              )}
              {stats.currentBMI && stats.currentBMI.category === 'normal' && (
                <AchievementBadge 
                  icon="✅" 
                  title="Health Star" 
                  description="Healthy BMI achieved"
                />
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

// Helper functions for statistics
function calculateWeeklyAttendance(attendance) {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const thisWeek = attendance.filter(record => {
    const date = new Date(record.date);
    return date >= weekAgo && date <= today;
  });
  
  const uniqueDays = new Set(thisWeek.map(r => r.date));
  
  return {
    checkIns: thisWeek.length,
    days: uniqueDays.size
  };
}

function calculateAttendanceStreak(attendance) {
  if (!attendance.length) return 0;
  
  const sortedDates = attendance
    .map(r => new Date(r.date))
    .sort((a, b) => b - a);
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const recordDate = new Date(sortedDates[i]);
    recordDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (recordDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateBMITrend(current, previous) {
  if (!current || !previous) {
    return { change: "N/A", message: "Need 2+ records", direction: "neutral" };
  }
  
  const change = (current.bmi - previous.bmi).toFixed(1);
  const direction = change > 0 ? "up" : change < 0 ? "down" : "stable";
  
  return {
    change: `${change > 0 ? '+' : ''}${change}`,
    message: direction === "down" ? "Good progress! 👍" : direction === "up" ? "Keep pushing! 💪" : "Stable",
    direction
  };
}

function calculateAverageSessionDuration(attendance) {
  if (!attendance.length) return "N/A";
  
  const durations = attendance
    .filter(r => r.checkOutTime)
    .map(r => {
      const checkIn = new Date(r.checkInTime);
      const checkOut = new Date(r.checkOutTime);
      return (checkOut - checkIn) / (1000 * 60); // minutes
    });
  
  if (!durations.length) return "N/A";
  
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const hours = Math.floor(avg / 60);
  const mins = Math.round(avg % 60);
  
  return `${hours}h ${mins}m`;
}

function calculateMostActiveDay(attendance) {
  if (!attendance.length) return "N/A";
  
  const dayCount = {};
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  attendance.forEach(record => {
    const date = new Date(record.date);
    const dayName = days[date.getDay()];
    dayCount[dayName] = (dayCount[dayName] || 0) + 1;
  });
  
  return Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
}

function calculateMonthlyAttendance(attendance) {
  const today = new Date();
  const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return attendance.filter(record => {
    const date = new Date(record.date);
    return date >= monthAgo && date <= today;
  }).length;
}

function calculateMonthlyHours(attendance) {
  const today = new Date();
  const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);
  
  let totalMinutes = 0;
  
  attendance.forEach(record => {
    const date = new Date(record.date);
    if (date >= monthAgo && date <= today && record.checkOutTime) {
      const checkIn = new Date(record.checkInTime);
      const checkOut = new Date(record.checkOutTime);
      totalMinutes += (checkOut - checkIn) / (1000 * 60);
    }
  });
  
  const hours = Math.round(totalMinutes / 60);
  return hours;
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="info-card">
      <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{icon}</div>
      <div className="info-label">{title}</div>
      <div className="info-value" style={{ fontSize: "1.3rem" }}>{value}</div>
      {subtitle && (
        <div style={{ 
          color: "#9e9e9e", 
          fontSize: "0.8rem", 
          marginTop: "8px",
          textTransform: "none"
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function AchievementBadge({ icon, title, description }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,87,34,0.15), rgba(118,255,3,0.1))",
      border: "2px solid rgba(118,255,3,0.3)",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(118,255,3,0.2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{icon}</div>
      <h4 style={{ color: "#76ff03", margin: "0 0 4px 0", fontWeight: "700" }}>{title}</h4>
      <p style={{ color: "#9e9e9e", margin: "0", fontSize: "0.8rem" }}>{description}</p>
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
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [description, setDescription] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadPayments();
  }, [reloadTrigger]);

  // Handle Stripe payment redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session");

    if (paymentStatus === "success" && sessionId) {
      // Verify payment with backend
      const verifyStripePayment = async () => {
        try {
          const response = await api.post("/stripe/payment/verify", {
            sessionId: sessionId
          });

          if (response.data.success) {
            setSuccess("✅ Payment processed successfully with Stripe! Payment saved.");
            setAmount("");
            setDescription("");
            setProofFile(null);
            document.getElementById("proofInput").value = "";
            loadPayments();
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          setError(err?.response?.data?.message || "Payment verification failed. Please contact admin.");
          // Clean up URL even on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      verifyStripePayment();
    } else if (paymentStatus === "cancelled") {
      setError("❌ Payment was cancelled. Please try again.");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proofFile && !amount) {
      setError("Please upload payment proof or select Stripe payment");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // For bank transfer or cash with proof
      if (proofFile || (amount && ["bank_transfer", "cash"].includes(paymentMethod))) {
        // Create payment record
        const createRes = await api.post("/member/payments", { 
          amount: parseFloat(amount) || 0, 
          paymentMethod,
          description,
          paymentType: "membership_renewal"
        });

        const paymentId = createRes.data.payment._id;

        // Upload proof if file provided
        if (proofFile) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              await api.post(`/member/payments/upload-proof/${paymentId}`, {
                proofBase64: event.target.result,
                fileName: proofFile.name
              });
              setSuccess("✅ Payment recorded! Admin will review your proof shortly.");
              setAmount("");
              setDescription("");
              setProofFile(null);
              document.getElementById("proofInput").value = "";
              loadPayments();
            } catch (err) {
              setError("Failed to upload proof. Please try again.");
            } finally {
              setSubmitting(false);
            }
          };
          reader.readAsArrayBuffer(proofFile);
        } else {
          setSuccess("Payment recorded! Admin will verify it.");
          setAmount("");
          setDescription("");
          setProofFile(null);
          loadPayments();
          setSubmitting(false);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit payment");
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status, reviewStatus) => {
    if (reviewStatus === "approved" || status === "completed") {
      return "status-active";
    } else if (reviewStatus === "rejected" || status === "rejected") {
      return "status-expired";
    } else {
      return "status-paused";
    }
  };

  const getStatusText = (payment) => {
    if (payment.reviewStatus === "approved") return "✅ Approved";
    if (payment.reviewStatus === "rejected") return "❌ Rejected";
    if (payment.reviewStatus === "pending_review") return "⏳ Pending Review";
    return payment.status || "Pending";
  };

  return (
    <>
      {/* Payment Instructions */}
      <div className="member-section" style={{
        background: "rgba(118,255,3,0.05)",
        border: "1px solid rgba(118,255,3,0.3)"
      }}>
        <h2 className="section-title" style={{ marginBottom: "12px" }}>💰 Payment Options</h2>
        <div style={{ color: "#bdbdbd", lineHeight: "1.8", fontSize: "0.95rem" }}>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ color: "#76ff03", fontWeight: "600", marginBottom: "8px" }}>Option 1: Manual Payment (Bank Transfer/Cash)</p>
            <p style={{ marginLeft: "16px", marginBottom: "0" }}>
              <strong>1.</strong> Enter amount & description<br/>
              <strong>2.</strong> Upload proof (screenshot/receipt)<br/>
              <strong>3.</strong> Submit for admin review<br/>
              <strong>4.</strong> Admin approves within 24 hours
            </p>
          </div>
          <div>
            <p style={{ color: "#64b5f6", fontWeight: "600", marginBottom: "8px" }}>Option 2: Stripe Payment (Instant)</p>
            <p style={{ marginLeft: "16px", marginBottom: "0" }}>
              <strong>1.</strong> Enter amount<br/>
              <strong>2.</strong> Select Stripe from methods<br/>
              <strong>3.</strong> Pay with credit/debit card<br/>
              <strong>4.</strong> Instant confirmation
            </p>
          </div>
        </div>
      </div>

      {/* Submit Payment */}
      <div className="member-section">
        <h2 className="section-title">💳 Submit Payment</h2>
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
              step="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">🛒 Payment Channel</label>
            <select
              className="form-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="bank_transfer">📋 Manual Review (Bank Transfer/Cash)</option>
              <option value="cash">📋 Manual Review (Cash Only)</option>
              <option value="online">📋 Manual Review (Online Transfer)</option>
              <option value="stripe">💳 Stripe (Instant Card Payment)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description/Membership Type</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly subscription renewal"
            />
          </div>

          {/* Manual Payment Section */}
          {paymentMethod !== "stripe" && (
            <div className="form-group">
              <label className="form-label">📎 Upload Payment Proof (Required)</label>
              <input
                id="proofInput"
                type="file"
                className="form-input"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                required={paymentMethod !== "stripe"}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  backgroundColor: "rgba(118,255,3,0.05)",
                  borderColor: "#76ff03"
                }}
              />
              <small style={{ color: "#9e9e9e", marginTop: "4px", display: "block" }}>
                Accepted: Images (JPG, PNG) or PDF. Max 5MB
              </small>
              {proofFile && (
                <div style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  background: "rgba(76,175,80,0.1)",
                  border: "1px solid rgba(76,175,80,0.3)",
                  borderRadius: "6px",
                  color: "#81c784",
                  fontSize: "0.9rem"
                }}>
                  ✓ {proofFile.name}
                </div>
              )}
            </div>
          )}

          {/* Stripe Section */}
          {paymentMethod === "stripe" && amount && parseFloat(amount) > 0 && (
            <div style={{
              background: "rgba(33,150,243,0.1)",
              border: "1px solid rgba(33,150,243,0.3)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px"
            }}>
              <div style={{ color: "#64b5f6", fontWeight: "600", marginBottom: "12px" }}>
                <i className="fas fa-credit-card"></i> Stripe Secure Payment
              </div>
              <StripePaymentWrapper>
                <StripeCheckoutButton
                  userId={user?.id}
                  amount={parseFloat(amount) || 0}
                  description={description || "Gym membership payment"}
                  membershipType="membership"
                  onError={(err) => setError(err)}
                  variant="primary"
                />
              </StripePaymentWrapper>
              <p style={{ color: "#9e9e9e", fontSize: "0.85rem", marginTop: "12px" }}>
                💡 You will be redirected to Stripe. After successful payment, your transaction will be recorded automatically.
              </p>
            </div>
          )}

          {paymentMethod !== "stripe" && (
            <button type="submit" className="btn-primary" disabled={submitting || !proofFile}>
              {submitting ? "Submitting..." : "Submit Payment for Review"}
            </button>
          )}
        </form>
      </div>

      {/* Payment History */}
      <div className="member-section">
        <h2 className="section-title">📜 Payment History</h2>
        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : payments.length === 0 ? (
          <p style={{ color: "#bdbdbd", textAlign: "center", padding: "20px" }}>
            No payments found. Make your first payment above.
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Review Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} style={{
                    background: payment.reviewStatus === "pending_review" ? "rgba(255,152,0,0.05)" : "transparent"
                  }}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td style={{ fontWeight: "600", color: "#76ff03" }}>Rs. {payment.amount.toFixed(2)}</td>
                    <td>
                      <span style={{
                        background: "rgba(255,87,34,0.1)",
                        color: "#ff5722",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: "600"
                      }}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeColor(payment.status, payment.reviewStatus)}`}>
                        {getStatusText(payment)}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#bdbdbd" }}>
                      {payment.reviewNotes ? (
                        <div title={payment.reviewNotes}>
                          {payment.reviewNotes.substring(0, 30)}
                          {payment.reviewNotes.length > 30 ? "..." : ""}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="member-section">
        <h3 style={{ color: "#fff", fontFamily: "'Oswald', sans-serif", marginBottom: "16px" }}>Status Guide</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }}>
          <div style={{ padding: "12px", background: "rgba(255,152,0,0.1)", borderRadius: "6px", borderLeft: "3px solid #ffb74d" }}>
            <div style={{ color: "#ffb74d", fontWeight: "600", fontSize: "0.9rem" }}>⏳ Pending Review</div>
            <div style={{ color: "#bdbdbd", fontSize: "0.8rem", marginTop: "4px" }}>Awaiting admin verification</div>
          </div>
          <div style={{ padding: "12px", background: "rgba(76,175,80,0.1)", borderRadius: "6px", borderLeft: "3px solid #81c784" }}>
            <div style={{ color: "#81c784", fontWeight: "600", fontSize: "0.9rem" }}>✅ Approved</div>
            <div style={{ color: "#bdbdbd", fontSize: "0.8rem", marginTop: "4px" }}>Payment confirmed</div>
          </div>
          <div style={{ padding: "12px", background: "rgba(244,67,54,0.1)", borderRadius: "6px", borderLeft: "3px solid #e57373" }}>
            <div style={{ color: "#e57373", fontWeight: "600", fontSize: "0.9rem" }}>❌ Rejected</div>
            <div style={{ color: "#bdbdbd", fontSize: "0.8rem", marginTop: "4px" }}>Please contact admin</div>
          </div>
        </div>
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

function HelpTab({ memberName }) {
  return (
    <>
      <div className="member-section">
        <h2 className="section-title">💬 Help & Support</h2>
        <p style={{ color: "#bdbdbd", marginBottom: "20px", lineHeight: "1.6" }}>
          Have questions about your membership, payments, or need assistance? 
          Connect with our gym team via WhatsApp for quick support.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        marginBottom: "32px"
      }}>
        {/* WhatsApp Button Card */}
        <div style={{
          background: "#181818",
          border: "1px solid #252525",
          borderRadius: "12px",
          padding: "24px",
          transition: "all 0.3s"
        }}>
          <div style={{ textAlign: "center" }}>
            <i className="fab fa-whatsapp" style={{
              fontSize: "3rem",
              color: "#25D366",
              marginBottom: "16px",
              display: "block"
            }} />
            <h3 style={{
              color: "#fff",
              marginBottom: "12px",
              fontFamily: "'Oswald', sans-serif"
            }}>
              Chat with Us
            </h3>
            <p style={{
              color: "#bdbdbd",
              marginBottom: "20px",
              fontSize: "0.95rem"
            }}>
              Get instant responses on WhatsApp
            </p>
            <WhatsAppButton
              label="Open WhatsApp"
              link={getMemberQueryLink(memberName, "")}
              onClick={() => {}}
              showIcon={true}
            />
          </div>
        </div>

        {/* FAQ Card */}
        <div style={{
          background: "#181818",
          border: "1px solid #252525",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <div style={{ textAlign: "center" }}>
            <i className="fas fa-question-circle" style={{
              fontSize: "3rem",
              color: "#ff5722",
              marginBottom: "16px",
              display: "block"
            }} />
            <h3 style={{
              color: "#fff",
              marginBottom: "12px",
              fontFamily: "'Oswald', sans-serif"
            }}>
              FAQ
            </h3>
            <p style={{
              color: "#bdbdbd",
              marginBottom: "20px",
              fontSize: "0.95rem"
            }}>
              Check common questions and answers
            </p>
            <button style={{
              background: "#ff5722",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s",
              fontFamily: "'Roboto', sans-serif"
            }} onClick={() => alert("FAQ section coming soon!")}>
              View FAQs
            </button>
          </div>
        </div>

        {/* Contact Card */}
        <div style={{
          background: "#181818",
          border: "1px solid #252525",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <div style={{ textAlign: "center" }}>
            <i className="fas fa-phone-alt" style={{
              fontSize: "3rem",
              color: "#4caf50",
              marginBottom: "16px",
              display: "block"
            }} />
            <h3 style={{
              color: "#fff",
              marginBottom: "12px",
              fontFamily: "'Oswald', sans-serif"
            }}>
              Call Us
            </h3>
            <p style={{
              color: "#bdbdbd",
              marginBottom: "20px",
              fontSize: "0.95rem"
            }}>
              Speak with our team directly
            </p>
            <a href="tel:+94767933556" style={{
              background: "#4caf50",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s",
              fontFamily: "'Roboto', sans-serif",
              textDecoration: "none",
              display: "inline-block"
            }}>
              +94 76 793 3556
            </a>
          </div>
        </div>
      </div>

      {/* Common Questions */}
      <div className="member-section">
        <h2 className="section-title">Common Questions</h2>
        <div style={{
          display: "grid",
          gap: "16px"
        }}>
          {[
            { q: "How do I renew my membership?", a: "Contact us via WhatsApp or call us. Our team will help you with the renewal process and plan options." },
            { q: "What payment methods are accepted?", a: "We accept cash, bank transfers, and online payments via Stripe card payments." },
            { q: "Can I pause my membership?", a: "Yes, members can pause their membership for a specific period. Contact admin via WhatsApp for details." },
            { q: "Do you offer training programs?", a: "Yes, our professional trainers offer personalized training programs. Inquire via WhatsApp for more details." }
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,87,34,0.05)",
              border: "1px solid rgba(255,87,34,0.2)",
              borderRadius: "8px",
              padding: "16px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}>
              <h4 style={{ color: "#ff5722", marginBottom: "8px", fontWeight: "600" }}>
                Q: {item.q}
              </h4>
              <p style={{ color: "#bdbdbd", fontSize: "0.9rem" }}>
                A: {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="member-section" style={{
        background: "rgba(118,255,3,0.05)",
        border: "1px solid rgba(118,255,3,0.3)"
      }}>
        <h2 className="section-title" style={{ color: "#76ff03" }}>💡 Quick Tips</h2>
        <ul style={{ color: "#bdbdbd", lineHeight: "1.8", marginLeft: "20px" }}>
          <li>Sync your attendance regularly by scanning the QR code at the gym</li>
          <li>Track your BMI progress consistently to monitor your fitness journey</li>
          <li>Update your contact information for better communication</li>
          <li>Check your membership expiry date and renew in time to avoid interruptions</li>
        </ul>
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
