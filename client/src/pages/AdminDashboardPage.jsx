import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { StripePaymentWrapper, StripeCheckoutButton } from "../components/StripePayment";
import { WhatsAppAnnouncementModal, WhatsAppButton } from "../components/WhatsAppButton";
import { getAnnouncementLink, openWhatsApp } from "../utils/whatsapp";

const PRIMARY = "#ff5722";
const SECONDARY = "#212121";
const DARK_BG = "#121212";
const ACCENT_GREEN = "#76ff03";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [bmiRecords, setBmiRecords] = useState([]);
  const [expiredMembers, setExpiredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [announceModalOpen, setAnnounceModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    // Always load users for dropdowns in other tabs
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "overview") {
        const res = await api.get("/admin/overview");
        setStats(res.data.stats);
      } else if (activeTab === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data.users);
      } else if (activeTab === "payments") {
        const res = await api.get("/admin/payments");
        setPayments(res.data.payments);
      } else if (activeTab === "attendance") {
        const res = await api.get("/admin/attendance");
        setAttendance(res.data.attendance);
      } else if (activeTab === "bmi") {
        const res = await api.get("/admin/bmi");
        setBmiRecords(res.data.bmi);
      } else if (activeTab === "expired-members") {
        const res = await api.get("/admin/expired-members");
        setExpiredMembers(res.data.expiredMembers || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AdminStyles />
      <div className="admin-dashboard">
        {/* Navbar */}
        <nav className="admin-navbar">
          <div className="admin-nav-container">
            <div className="admin-logo">
              Muscle Mantra <span className="admin-highlight">Admin</span>
            </div>
            <div className="admin-nav-right">
              <span className="admin-user-name">{user?.name}</span>
              <button className="admin-btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Tabs */}
        <div className="admin-tabs">
          <div className="admin-tabs-container">
            {[
              { id: "overview", icon: "fa-chart-line", label: "Overview" },
              { id: "pay-review", icon: "fa-file-invoice", label: "Payment Review" },
              { id: "users", icon: "fa-users", label: "Users" },
              { id: "payments", icon: "fa-credit-card", label: "Payment History" },
              { id: "expired-members", icon: "fa-times-circle", label: "Expired Members" },
              { id: "attendance", icon: "fa-calendar-check", label: "Attendance" },
              { id: "qrcode", icon: "fa-qrcode", label: "QR Code" },
              { id: "bmi", icon: "fa-weight", label: "BMI Tracking" },
              { id: "announce", icon: "fa-bullhorn", label: "WhatsApp Announce" }
            ].map(tab => (
              <button
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`fas ${tab.icon}`} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {error && <div className="admin-alert-error">{error}</div>}
          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab stats={stats} />}
              {activeTab === "pay-review" && <PaymentReviewTab onRefresh={loadData} />}
              {activeTab === "users" && <UsersTab users={users} onRefresh={loadData} />}
              {activeTab === "payments" && <PaymentsTab payments={payments} users={users} onRefresh={loadData} />}
              {activeTab === "expired-members" && <ExpiredMembersTab expiredMembers={expiredMembers} onRefresh={loadData} />}
              {activeTab === "attendance" && <AttendanceTab attendance={attendance} users={users} onRefresh={loadData} />}
              {activeTab === "qrcode" && <QRCodeTab onRefresh={loadData} />}
              {activeTab === "bmi" && <BMITab bmiRecords={bmiRecords} users={users} onRefresh={loadData} />}
              {activeTab === "announce" && <AnnouncementTab users={users} onOpenModal={() => setAnnounceModalOpen(true)} />}
            </>
          )}
        </div>

        {/* WhatsApp Announcement Modal */}
        <WhatsAppAnnouncementModal
          isOpen={announceModalOpen}
          onClose={() => setAnnounceModalOpen(false)}
          onSend={(message, recipients) => {
            const link = getAnnouncementLink(message, recipients);
            openWhatsApp(link);
            setAnnounceModalOpen(false);
          }}
        />

        {/* Footer */}
        <footer className="admin-footer">
          <p className="admin-footer-text">
            Designed and developed By <span className="admin-footer-eco">Eco</span>Mind Software Solutions
          </p>
        </footer>
      </div>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ stats }) {
  if (!stats) return <div className="admin-loading">Loading statistics...</div>;

  return (
    <div className="admin-stats-grid">
      <StatCard title="Total Users" value={stats.totalUsers} icon="fa-users" color="#2196f3" />
      <StatCard title="Total Members" value={stats.totalMembers} icon="fa-id-card" color="#9c27b0" />
      <StatCard title="Active Members" value={stats.activeMembers} icon="fa-check-circle" color="#4caf50" />
      <StatCard title="Paused Members" value={stats.pausedMembers} icon="fa-pause-circle" color="#ff9800" />
      <StatCard title="Expired Members" value={stats.expiredMembers} icon="fa-times-circle" color="#f44336" />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: `${color}20`, color }}>
        <i className={`fas ${icon}`} />
      </div>
      <div className="admin-stat-content">
        <div className="admin-stat-label">{title}</div>
        <div className="admin-stat-value">{value}</div>
      </div>
    </div>
  );
}

// Helper function to calculate expiry date based on plan
function calculateExpiryDate(joinDate, plan) {
  const date = new Date(joinDate);
  const dayOfMonth = date.getDate();
  
  // Calculate expiry date based on plan duration
  let monthsToAdd = 0;
  if (plan === "1-month") monthsToAdd = 1;
  else if (plan === "3-months") monthsToAdd = 3;
  else if (plan === "6-months") monthsToAdd = 6;
  else if (plan === "1-year") monthsToAdd = 12;
  
  const expiryDate = new Date(date);
  expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);
  
  // Set to the same day of the month for expiry
  expiryDate.setDate(Math.min(dayOfMonth, new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 0).getDate()));
  
  return expiryDate.toISOString().split("T")[0];
}

// Users Tab Component
function UsersTab({ users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "member",
    memberCode: "", phone: "", plan: "1-month", status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    expiryDate: calculateExpiryDate(new Date().toISOString().split("T")[0], "1-month")
  });

  const handleCreate = () => {
    setEditUser(null);
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      name: "", email: "", password: "", role: "member",
      memberCode: `GM-${String(users.length + 1).padStart(4, "0")}`,
      phone: "", plan: "1-month", status: "active",
      joinDate: today,
      expiryDate: calculateExpiryDate(today, "1-month")
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({ ...user, password: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      if (formData.role === "member") {
        payload.memberData = {
          memberCode: formData.memberCode,
          phone: formData.phone,
          plan: formData.plan,
          status: formData.status,
          joinDate: new Date(formData.joinDate),
          expiryDate: new Date(formData.expiryDate)
        };
      }

      if (editUser) {
        await api.put(`/admin/users/${editUser.id}`, payload);
      } else {
        payload.password = formData.password;
        await api.post("/admin/users", payload);
      }
      
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>User Management</h2>
        <button className="admin-btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus" /> Add User
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`admin-badge admin-badge-${user.role}`}>{user.role}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="admin-btn-icon" onClick={() => handleEdit(user)}>
                    <i className="fas fa-edit" />
                  </button>
                  <button className="admin-btn-icon admin-btn-danger" onClick={() => handleDelete(user.id)}>
                    <i className="fas fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          isEdit={!!editUser}
        />
      )}
    </div>
  );
}

function UserModal({ formData, setFormData, onSubmit, onClose, isEdit }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isEdit ? "Edit User" : "Add New User"}</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {!isEdit && (
            <div className="admin-form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}

          <div className="admin-form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === "member" && (
            <>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Member Code</label>
                  <input
                    type="text"
                    value={formData.memberCode}
                    onChange={e => setFormData({ ...formData, memberCode: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Plan Duration</label>
                  <select
                    value={formData.plan}
                    onChange={e => {
                      const newPlan = e.target.value;
                      setFormData({
                        ...formData,
                        plan: newPlan,
                        expiryDate: calculateExpiryDate(formData.joinDate, newPlan)
                      });
                    }}
                  >
                    <option value="1-month">1 Month</option>
                    <option value="3-months">3 Months</option>
                    <option value="6-months">6 Months</option>
                    <option value="1-year">1 Year</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={e => {
                      const newJoinDate = e.target.value;
                      setFormData({
                        ...formData,
                        joinDate: newJoinDate,
                        expiryDate: calculateExpiryDate(newJoinDate, formData.plan)
                      });
                    }}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Expiry Date (Auto-calculated)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    disabled
                    style={{ background: "#0a0a0a", cursor: "not-allowed" }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="admin-form-actions">
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Review Tab Component
function PaymentReviewTab({ onRefresh }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewalStats, setRenewalStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        api.get("/admin/payments/pending"),
        api.get("/admin/stats/renewals")
      ]);
      setPayments(paymentsRes.data.payments || []);
      setRenewalStats(statsRes.data.stats || {});
    } catch (err) {
      console.error("Failed to load payment data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (paymentId, status) => {
    setProcessing(true);
    try {
      await api.put(`/admin/payments/${paymentId}/review`, {
        reviewStatus: status,
        reviewNotes
      });
      setSelectedPayment(null);
      setReviewNotes("");
      loadData();
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to review payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Renewal Statistics */}
      {renewalStats && (
        <div className="admin-section" style={{
          background: "linear-gradient(135deg, rgba(76,175,80,0.1), rgba(118,255,3,0.05))",
          border: "1px solid rgba(118,255,3,0.3)",
          marginBottom: "24px"
        }}>
          <h2 className="admin-stat-title" style={{ color: "#76ff03", marginBottom: "16px" }}>
            📊 Renewal Statistics
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            <RenewalStatCard 
              icon="✅" 
              label="Renewed This Month" 
              value={renewalStats.renewedThisMonth || 0}
              color="#4caf50"
            />
            <RenewalStatCard 
              icon="⏳" 
              label="Pending Review" 
              value={payments.length}
              color="#ff9800"
            />
            <RenewalStatCard 
              icon="❌" 
              label="Not Renewed" 
              value={renewalStats.notRenewed || 0}
              color="#f44336"
            />
            <RenewalStatCard 
              icon="💰" 
              label="Pending Amount" 
              value={`Rs. ${(renewalStats.pendingAmount || 0).toFixed(2)}`}
              color="#2196f3"
            />
          </div>
        </div>
      )}

      {/* Pending Payments for Review */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>🔍 Pending Payment Reviews ({payments.length})</h2>
          <button className="admin-btn-secondary" onClick={loadData}>
            <i className="fas fa-sync" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#81c784"
          }}>
            <i className="fas fa-check-circle" style={{ fontSize: "2rem", marginBottom: "12px", display: "block" }}></i>
            All payments have been reviewed!
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "16px"
          }}>
            {payments.map(payment => (
              <div key={payment._id} style={{
                background: "#1a1a1a",
                border: "1px solid #3a3a3a",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.3s",
                borderLeft: "4px solid #ff5722",
                position: "relative"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,87,34,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              onClick={() => setSelectedPayment(payment)}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <div style={{ color: "#bdbdbd", fontSize: "0.9rem" }}>Member</div>
                    <div style={{ color: "#fff", fontWeight: "600" }}>
                      {payment.userId?.name || "Unknown"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#bdbdbd", fontSize: "0.9rem" }}>Amount</div>
                    <div style={{ color: "#76ff03", fontWeight: "600", fontSize: "1.2rem" }}>
                      Rs. {payment.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ color: "#9e9e9e", fontSize: "0.85rem", marginBottom: "12px" }}>
                  <i className="fas fa-calendar" style={{ marginRight: "6px" }}></i>
                  {new Date(payment.paymentDate).toLocaleDateString()}
                  <span style={{ marginLeft: "12px" }}>
                    <i className="fas fa-credit-card" style={{ marginRight: "6px" }}></i>
                    {payment.paymentMethod}
                  </span>
                </div>

                {payment.proofOfPayment && (
                  <div style={{
                    background: "rgba(76,175,80,0.1)",
                    border: "1px solid rgba(76,175,80,0.3)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    color: "#81c784",
                    fontSize: "0.9rem",
                    marginBottom: "12px"
                  }}>
                    <i className="fas fa-file-check"></i> Proof: {payment.proofOfPayment}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="admin-btn-primary"
                    style={{ flex: 1, marginBottom: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPayment(payment);
                    }}
                  >
                    ✅ Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedPayment && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Review Payment - {selectedPayment.userId?.name}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
            </div>
            <div style={{ padding: "20px", color: "#bdbdbd" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ color: "#9e9e9e", fontSize: "0.9rem", marginBottom: "4px" }}>Amount</div>
                <div style={{ color: "#76ff03", fontSize: "1.5rem", fontWeight: "600" }}>
                  Rs. {selectedPayment.amount.toFixed(2)}
                </div>
              </div>

              {selectedPayment.description && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ color: "#9e9e9e", fontSize: "0.9rem", marginBottom: "4px" }}>Description</div>
                  <div>{selectedPayment.description}</div>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <div style={{ color: "#9e9e9e", fontSize: "0.9rem", marginBottom: "4px" }}>Payment Method</div>
                <div>{selectedPayment.paymentMethod}</div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ color: "#9e9e9e", fontSize: "0.9rem", display: "block", marginBottom: "8px" }}>
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this payment review..."
                  style={{
                    width: "100%",
                    background: "#0a0a0a",
                    border: "1px solid #3a3a3a",
                    borderRadius: "6px",
                    color: "#fff",
                    padding: "10px",
                    fontFamily: "'Roboto', sans-serif",
                    minHeight: "80px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="admin-btn-secondary"
                  onClick={() => setSelectedPayment(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    flex: 1,
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.3s"
                  }}
                  disabled={processing}
                  onClick={() => handleReview(selectedPayment._id, "rejected")}
                  onMouseEnter={(e) => e.target.style.background = "#d32f2f"}
                  onMouseLeave={(e) => e.target.style.background = "#f44336"}
                >
                  ❌ Reject
                </button>
                <button
                  className="admin-btn-primary"
                  style={{ flex: 1 }}
                  disabled={processing}
                  onClick={() => handleReview(selectedPayment._id, "approved")}
                >
                  ✅ Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RenewalStatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: `${color}15`,
      border: `1px solid ${color}30`,
      borderRadius: "10px",
      padding: "16px",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{icon}</div>
      <div style={{ color: "#9e9e9e", fontSize: "0.9rem", marginBottom: "4px" }}>{label}</div>
      <div style={{ color: color, fontWeight: "600", fontSize: "1.3rem" }}>{value}</div>
    </div>
  );
}

// Payments Tab Component
function PaymentsTab({ payments, users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: "", amount: "", paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash", description: "", status: "completed"
  });

  const handleCreate = () => {
    setFormData({
      userId: "", amount: "", paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "cash", description: "", status: "completed"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/payments", {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentDate: new Date(formData.paymentDate)
      });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create payment");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Payment Management</h2>
        <button className="admin-btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus" /> Add Payment
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment._id}>
                <td>{payment.userId?.name || "N/A"}</td>
                <td>Rs. {payment.amount.toFixed(2)}</td>
                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td><span className="admin-badge">{payment.paymentMethod}</span></td>
                <td><span className={`admin-badge admin-badge-${payment.status}`}>{payment.status}</span></td>
                <td>{payment.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PaymentModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          users={users}
        />
      )}
    </div>
  );
}

function PaymentModal({ formData, setFormData, onSubmit, onClose, users }) {
  const [stripeSuccess, setStripeSuccess] = useState(false);

  const handleStripeSuccess = () => {
    setStripeSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Add Payment</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        {stripeSuccess ? (
          <div className="admin-alert-success">
            <i className="fas fa-check-circle"></i> Payment processed successfully!
          </div>
        ) : (
          <form onSubmit={onSubmit} className="admin-form">
            <div className="admin-form-group">
              <label>User</label>
              <select
                value={formData.userId}
                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                required
              >
                <option value="">Select User</option>
                {users.filter(u => u.role === "member").map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Amount (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  disabled={formData.paymentMethod === "stripe"}
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="admin-form-actions">
              <button type="button" className="admin-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              {formData.paymentMethod === "stripe" && formData.userId && formData.amount ? (
                <StripePaymentWrapper>
                  <StripeCheckoutButton
                    userId={formData.userId}
                    amount={parseFloat(formData.amount)}
                    description={formData.description || "Gym membership payment"}
                    membershipType="membership"
                    onSuccess={handleStripeSuccess}
                    onError={(err) => alert(err)}
                    variant="primary"
                  />
                </StripePaymentWrapper>
              ) : (
                <button type="submit" className="admin-btn-primary">
                  Create Payment
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Attendance Tab Component
function AttendanceTab({ attendance, users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: "", date: new Date().toISOString().split("T")[0],
    checkInTime: new Date().toISOString().slice(0, 16), checkOutTime: ""
  });

  const handleCreate = () => {
    setFormData({
      userId: "", date: new Date().toISOString().split("T")[0],
      checkInTime: new Date().toISOString().slice(0, 16), checkOutTime: ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/attendance", {
        userId: formData.userId,
        date: formData.date,
        checkInTime: new Date(formData.checkInTime),
        checkOutTime: formData.checkOutTime ? new Date(formData.checkOutTime) : null
      });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create attendance");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Attendance Tracking</h2>
        <button className="admin-btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus" /> Add Attendance
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(record => {
              const checkIn = new Date(record.checkInTime);
              const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
              const duration = checkOut ? Math.round((checkOut - checkIn) / (1000 * 60)) : null;
              
              return (
                <tr key={record._id}>
                  <td>{record.userId?.name || "N/A"}</td>
                  <td>{record.date}</td>
                  <td>{checkIn.toLocaleTimeString()}</td>
                  <td>{checkOut ? checkOut.toLocaleTimeString() : "-"}</td>
                  <td>{duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AttendanceModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          users={users}
        />
      )}
    </div>
  );
}

function AttendanceModal({ formData, setFormData, onSubmit, onClose, users }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Add Attendance</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} className="admin-form">
          <div className="admin-form-group">
            <label>User</label>
            <select
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="">Select User</option>
              {users.filter(u => u.role === "member").map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Check In Time</label>
              <input
                type="datetime-local"
                value={formData.checkInTime}
                onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Check Out Time (Optional)</label>
              <input
                type="datetime-local"
                value={formData.checkOutTime}
                onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              Create Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// BMI Tab Component
function BMITab({ bmiRecords, users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: "", weight: "", height: "",
    recordDate: new Date().toISOString().split("T")[0], notes: ""
  });

  const handleCreate = () => {
    setFormData({
      userId: "", weight: "", height: "",
      recordDate: new Date().toISOString().split("T")[0], notes: ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/bmi", {
        ...formData,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        recordDate: new Date(formData.recordDate)
      });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create BMI record");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>BMI Tracking</h2>
        <button className="admin-btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus" /> Add BMI Record
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
              <th>BMI</th>
              <th>Category</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {bmiRecords.map(record => (
              <tr key={record._id}>
                <td>{record.userId?.name || "N/A"}</td>
                <td>{new Date(record.recordDate).toLocaleDateString()}</td>
                <td>{record.weight}</td>
                <td>{record.height}</td>
                <td>{record.bmi}</td>
                <td><span className={`admin-badge admin-badge-${record.category}`}>{record.category}</span></td>
                <td>{record.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <BMIModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          users={users}
        />
      )}
    </div>
  );
}

function BMIModal({ formData, setFormData, onSubmit, onClose, users }) {
  const calculatePreviewBMI = () => {
    if (formData.weight && formData.height) {
      const heightM = formData.height / 100;
      const bmi = formData.weight / (heightM * heightM);
      return bmi.toFixed(2);
    }
    return null;
  };

  const previewBMI = calculatePreviewBMI();

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Add BMI Record</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} className="admin-form">
          <div className="admin-form-group">
            <label>User</label>
            <select
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="">Select User</option>
              {users.filter(u => u.role === "member").map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>
          </div>

          {previewBMI && (
            <div className="admin-bmi-preview">
              <strong>Calculated BMI:</strong> {previewBMI}
            </div>
          )}

          <div className="admin-form-group">
            <label>Record Date</label>
            <input
              type="date"
              value={formData.recordDate}
              onChange={e => setFormData({ ...formData, recordDate: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Optional notes about this measurement..."
            />
          </div>

          <div className="admin-form-actions">
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              Create BMI Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// QR Code Tab Component
function QRCodeTab({ onRefresh }) {
  const [activeQRCode, setActiveQRCode] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    loadQRCodeData();
  }, []);

  const loadQRCodeData = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get("/admin/qrcode/active").catch(() => null),
        api.get("/admin/qrcode/history")
      ]);
      if (activeRes?.data?.qrCode) {
        setActiveQRCode(activeRes.data.qrCode);
        // Generate QR code URL - Using a simple approach with external service
        const code = activeRes.data.qrCode.code;
        const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const baseUrl = backendUrl.replace("/api", ""); // Remove /api to get base URL
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          `${baseUrl}/api/qrcode/scan?code=${code}`
        )}`;
        setQrCodeUrl(qrUrl);
      }
      if (historyRes?.data?.history) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error("Failed to load QR code data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCode = async () => {
    setGeneratingQR(true);
    try {
      const res = await api.post("/admin/qrcode/generate");
      setActiveQRCode(res.data.qrCode);
      const code = res.data.qrCode.code;
      const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const baseUrl = backendUrl.replace("/api", ""); // Remove /api to get base URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `${baseUrl}/api/qrcode/scan?code=${code}`
      )}`;
      setQrCodeUrl(qrUrl);
      loadQRCodeData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to generate QR code");
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDeactivateQRCode = async () => {
    if (!activeQRCode) return;
    if (!confirm("Are you sure you want to deactivate this QR code?")) return;
    
    try {
      await api.delete(`/admin/qrcode/${activeQRCode.id}`);
      setActiveQRCode(null);
      setQrCodeUrl("");
      loadQRCodeData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to deactivate QR code");
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading QR code data...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Attendance QR Code Management</h2>
      </div>

      {/* Active QR Code Section */}
      <div style={{ background: "#1a1a1a", padding: "24px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #2a2a2a" }}>
        <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "16px" }}>
          {activeQRCode ? "Current Active QR Code" : "No Active QR Code"}
        </h3>
        
        {activeQRCode && qrCodeUrl ? (
          <div style={{ textAlign: "center" }}>
            <img 
              src={qrCodeUrl} 
              alt="Current QR Code" 
              style={{ maxWidth: "300px", marginBottom: "16px", borderRadius: "8px" }}
            />
            <p style={{ color: "#bdbdbd", marginBottom: "16px" }}>
              <strong>Code:</strong> {activeQRCode.code}
            </p>
            <p style={{ color: "#76ff03", marginBottom: "16px" }}>
              Members can scan this code to mark their attendance
            </p>
            <button 
              className="admin-btn-secondary" 
              onClick={handleDeactivateQRCode}
              style={{ marginRight: "12px" }}
            >
              <i className="fas fa-ban" /> Deactivate QR Code
            </button>
            <button 
              className="admin-btn-primary" 
              onClick={handleGenerateQRCode}
              disabled={generatingQR}
            >
              <i className="fas fa-sync" /> Generate New QR Code
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: "#bdbdbd", marginBottom: "16px" }}>
              No active QR code. Generate one to start accepting attendance check-ins.
            </p>
            <button 
              className="admin-btn-primary" 
              onClick={handleGenerateQRCode}
              disabled={generatingQR}
            >
              {generatingQR ? "Generating..." : "Generate QR Code"}
            </button>
          </div>
        )}
      </div>

      {/* History Section */}
      <div>
        <h3 style={{ color: "#fff", marginBottom: "16px" }}>QR Code History</h3>
        {history.length === 0 ? (
          <p style={{ color: "#bdbdbd" }}>No QR code history</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Scanned By</th>
                  <th>Scans</th>
                </tr>
              </thead>
              <tbody>
                {history.map(qr => (
                  <tr key={qr._id}>
                    <td>{qr.code}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        background: qr.isActive ? "rgba(76,175,80,0.2)" : "rgba(244,67,54,0.2)",
                        color: qr.isActive ? "#81c784" : "#e57373"
                      }}>
                        {qr.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(qr.createdAt).toLocaleString()}</td>
                    <td>{qr.scannedBy?.length || 0} users</td>
                    <td>{qr.scannedBy?.map(u => u.name).join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles Component
function AdminStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@300;400;700&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

      .admin-dashboard {
        min-height: 100vh;
        background: ${DARK_BG};
        font-family: 'Roboto', sans-serif;
        display: flex;
        flex-direction: column;
      }

      /* Navbar */
      .admin-navbar {
        background: ${SECONDARY};
        height: 70px;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,.5);
      }
      .admin-nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .admin-logo {
        font-size: 1.5rem;
        font-weight: bold;
        font-family: 'Oswald', sans-serif;
        color: #f5f5f5;
      }
      .admin-highlight {
        color: ${PRIMARY};
      }
      .admin-nav-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .admin-user-name {
        color: #bdbdbd;
        font-size: 0.9rem;
      }
      .admin-btn-logout {
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
      .admin-btn-logout:hover {
        background: ${PRIMARY};
        border-color: ${PRIMARY};
        transform: translateY(-2px);
      }

      /* Tabs */
      .admin-tabs {
        background: #1a1a1a;
        border-bottom: 2px solid #2a2a2a;
        position: sticky;
        top: 70px;
        z-index: 99;
      }
      .admin-tabs-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: #ff5722 #1a1a1a;
      }
      .admin-tabs-container::-webkit-scrollbar {
        height: 8px;
      }
      .admin-tabs-container::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 10px;
      }
      .admin-tabs-container::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #ff5722 0%, #76ff03 100%);
        border-radius: 10px;
        border: 2px solid #1a1a1a;
        transition: all 0.3s ease;
      }
      .admin-tabs-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #e64a19 0%, #66e600 100%);
        box-shadow: 0 0 8px rgba(255, 87, 34, 0.4);
      }
      .admin-tab {
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
      .admin-tab:hover {
        color: ${PRIMARY};
        background: rgba(255,87,34,0.05);
      }
      .admin-tab.active {
        color: ${PRIMARY};
        border-bottom-color: ${PRIMARY};
        background: rgba(255,87,34,0.1);
      }
      .admin-tab i {
        margin-right: 8px;
      }

      /* Content */
      .admin-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px 24px;
        flex: 1;
        width: 100%;
      }
      .admin-loading {
        text-align: center;
        color: #bdbdbd;
        padding: 60px 20px;
        font-size: 1.1rem;
      }
      .admin-alert-error {
        background: rgba(244,67,54,0.1);
        border: 1px solid rgba(244,67,54,0.3);
        color: #ff8a80;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
      }

      /* Stats Grid */
      .admin-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
      }
      .admin-stat-card {
        background: ${SECONDARY};
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s;
        border: 1px solid #2a2a2a;
      }
      .admin-stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      }
      .admin-stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
      }
      .admin-stat-content {
        flex: 1;
      }
      .admin-stat-label {
        color: #bdbdbd;
        font-size: 0.85rem;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .admin-stat-value {
        color: #fff;
        font-size: 2rem;
        font-weight: 700;
        font-family: 'Oswald', sans-serif;
      }

      /* Section */
      .admin-section {
        background: ${SECONDARY};
        border-radius: 12px;
        padding: 24px;
        border: 1px solid #2a2a2a;
      }
      .admin-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .admin-section-header h2 {
        font-family: 'Oswald', sans-serif;
        font-size: 1.8rem;
        color: #fff;
        text-transform: uppercase;
        margin: 0;
      }

      /* Buttons */
      .admin-btn-primary {
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
      .admin-btn-primary:hover {
        background: #e64a19;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255,87,34,0.4);
      }
      .admin-btn-secondary {
        background: #424242;
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
      .admin-btn-secondary:hover {
        background: #616161;
      }
      .admin-btn-icon {
        background: rgba(255,255,255,0.05);
        color: #bdbdbd;
        border: 1px solid rgba(255,255,255,0.1);
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
        margin-right: 6px;
      }
      .admin-btn-icon:hover {
        background: ${PRIMARY};
        color: #fff;
        border-color: ${PRIMARY};
      }
      .admin-btn-danger:hover {
        background: #f44336;
        border-color: #f44336;
      }

      /* Table */
      .admin-table-container {
        overflow-x: auto;
      }
      .admin-table {
        width: 100%;
        border-collapse: collapse;
      }
      .admin-table thead {
        background: #1a1a1a;
      }
      .admin-table th {
        padding: 14px 16px;
        text-align: left;
        color: ${PRIMARY};
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #2a2a2a;
      }
      .admin-table td {
        padding: 14px 16px;
        color: #e0e0e0;
        border-bottom: 1px solid #2a2a2a;
      }
      .admin-table tbody tr {
        transition: background 0.2s;
      }
      .admin-table tbody tr:hover {
        background: rgba(255,87,34,0.05);
      }

      /* Badge */
      .admin-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        background: rgba(255,255,255,0.1);
        color: #bdbdbd;
      }
      .admin-badge-admin {
        background: rgba(156,39,176,0.2);
        color: #ce93d8;
      }
      .admin-badge-member {
        background: rgba(33,150,243,0.2);
        color: #64b5f6;
      }
      .admin-badge-active {
        background: rgba(76,175,80,0.2);
        color: #81c784;
      }
      .admin-badge-paused {
        background: rgba(255,152,0,0.2);
        color: #ffb74d;
      }
      .admin-badge-expired {
        background: rgba(244,67,54,0.2);
        color: #e57373;
      }
      .admin-badge-completed {
        background: rgba(76,175,80,0.2);
        color: #81c784;
      }
      .admin-badge-pending {
        background: rgba(255,152,0,0.2);
        color: #ffb74d;
      }
      .admin-badge-failed {
        background: rgba(244,67,54,0.2);
        color: #e57373;
      }
      .admin-badge-normal {
        background: rgba(76,175,80,0.2);
        color: #81c784;
      }
      .admin-badge-underweight {
        background: rgba(33,150,243,0.2);
        color: #64b5f6;
      }
      .admin-badge-overweight {
        background: rgba(255,152,0,0.2);
        color: #ffb74d;
      }
      .admin-badge-obese {
        background: rgba(244,67,54,0.2);
        color: #e57373;
      }

      /* Modal */
      .admin-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }
      .admin-modal {
        background: ${SECONDARY};
        border-radius: 12px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid #2a2a2a;
      }
      .admin-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #2a2a2a;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .admin-modal-header h3 {
        font-family: 'Oswald', sans-serif;
        font-size: 1.5rem;
        color: #fff;
        text-transform: uppercase;
        margin: 0;
      }
      .admin-modal-close {
        background: none;
        border: none;
        color: #bdbdbd;
        font-size: 2rem;
        cursor: pointer;
        line-height: 1;
        transition: color 0.3s;
      }
      .admin-modal-close:hover {
        color: ${PRIMARY};
      }

      /* Form */
      .admin-form {
        padding: 24px;
      }
      .admin-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .admin-form-group {
        margin-bottom: 20px;
      }
      .admin-form-group label {
        display: block;
        color: #bdbdbd;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .admin-form-group input,
      .admin-form-group select,
      .admin-form-group textarea {
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
      .admin-form-group input:focus,
      .admin-form-group select:focus,
      .admin-form-group textarea:focus {
        outline: none;
        border-color: ${PRIMARY};
        box-shadow: 0 0 0 3px rgba(255,87,34,0.1);
      }
      .admin-form-group textarea {
        resize: vertical;
      }
      .admin-form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #2a2a2a;
      }
      .admin-bmi-preview {
        background: rgba(118,255,3,0.1);
        border: 1px solid rgba(118,255,3,0.3);
        color: ${ACCENT_GREEN};
        padding: 12px 16px;
        border-radius: 6px;
        margin-bottom: 20px;
        font-size: 0.95rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .admin-navbar {
          height: 60px;
        }
        .admin-nav-container {
          padding: 0 12px;
        }
        .admin-logo {
          font-size: 1.2rem;
        }
        .admin-nav-right {
          gap: 8px;
        }
        .admin-user-name {
          display: none;
        }
        .admin-btn-logout {
          padding: 6px 12px;
          font-size: 0.8rem;
        }
        .admin-tabs {
          top: 60px;
        }
        .admin-tabs-container {
          padding: 0 12px;
          gap: 0;
          overflow-x: auto;
          scroll-behavior: smooth;
        }
        .admin-tab {
          padding: 12px 12px;
          font-size: 0;
          min-width: 70px;
        }
        .admin-tab i {
          margin-right: 0;
          font-size: 1rem;
          display: block;
        }
        .admin-content {
          padding: 16px 12px;
        }
        .admin-section {
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .admin-section-header {
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .admin-section-header h2 {
          font-size: 1.3rem;
        }
        .admin-stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .admin-stat-card {
          padding: 16px;
          gap: 12px;
          flex-direction: column;
          text-align: center;
        }
        .admin-stat-icon {
          width: 50px;
          height: 50px;
          font-size: 1.5rem;
        }
        .admin-stat-value {
          font-size: 1.5rem;
        }
        .admin-form-row {
          grid-template-columns: 1fr;
        }
        .admin-form-group {
          margin-bottom: 16px;
        }
        .admin-form-group label {
          font-size: 0.8rem;
        }
        .admin-form-group input,
        .admin-form-group select,
        .admin-form-group textarea {
          padding: 8px 10px;
          font-size: 0.9rem;
        }
        .admin-table-container {
          font-size: 0.8rem;
        }
        .admin-table th,
        .admin-table td {
          padding: 10px 6px;
        }
        .admin-badge {
          font-size: 0.7rem;
          padding: 3px 8px;
        }
        .admin-btn-primary,
        .admin-btn-secondary {
          padding: 8px 12px;
          font-size: 0.85rem;
          min-height: 40px;
        }
        .admin-alert-error,
        .admin-alert-success {
          padding: 12px;
          font-size: 0.9rem;
        }
        .admin-modal {
          max-height: calc(100vh - 40px);
        }
        .admin-modal-header {
          padding: 16px;
        }
        .admin-modal-header h3 {
          font-size: 1.3rem;
        }
        .admin-form {
          padding: 16px;
        }
        .admin-form-actions {
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
        }
      }

      @media (max-width: 480px) {
        .admin-navbar {
          height: 56px;
        }
        .admin-logo {
          font-size: 1rem;
        }
        .admin-nav-container {
          padding: 0 8px;
        }
        .admin-highlight {
          display: none;
        }
        .admin-btn-logout {
          padding: 4px 8px;
          font-size: 0.7rem;
        }
        .admin-tabs {
          top: 56px;
        }
        .admin-tabs-container {
          padding: 0 8px;
          gap: 0;
        }
        .admin-tab {
          padding: 8px 6px;
          font-size: 0;
          min-width: 50px;
        }
        .admin-tab i {
          display: block;
          margin-bottom: 0;
          margin-right: 0;
          font-size: 1rem;
        }
        .admin-content {
          padding: 12px 8px;
        }
        .admin-section {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .admin-section-header {
          margin-bottom: 12px;
        }
        .admin-section-header h2 {
          font-size: 1rem;
        }
        .admin-stats-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .admin-stat-card {
          padding: 12px;
          gap: 10px;
        }
        .admin-stat-icon {
          width: 40px;
          height: 40px;
          font-size: 1.2rem;
        }
        .admin-stat-label {
          font-size: 0.7rem;
        }
        .admin-stat-value {
          font-size: 1.2rem;
        }
        .admin-form-row {
          grid-template-columns: 1fr;
        }
        .admin-form-group {
          margin-bottom: 12px;
        }
        .admin-form-group label {
          font-size: 0.7rem;
        }
        .admin-form-group input,
        .admin-form-group select,
        .admin-form-group textarea {
          padding: 6px 8px;
          font-size: 12px;
        }
        .admin-table {
          font-size: 0.7rem;
        }
        .admin-table th,
        .admin-table td {
          padding: 6px 4px;
        }
        .admin-badge {
          font-size: 0.6rem;
          padding: 2px 6px;
        }
        .admin-btn-primary,
        .admin-btn-secondary {
          width: 100%;
          padding: 8px 12px;
          font-size: 0.8rem;
          min-height: 40px;
          margin-bottom: 6px;
        }
        .admin-btn-icon {
          padding: 4px 6px;
          font-size: 0.8rem;
        }
        .admin-alert-error,
        .admin-alert-success {
          padding: 10px;
          font-size: 0.8rem;
          margin-bottom: 12px;
        }
        .admin-modal-overlay {
          padding: 12px;
        }
        .admin-modal {
          max-height: calc(100vh - 24px);
          border-radius: 10px;
        }
        .admin-modal-header {
          padding: 12px;
        }
        .admin-modal-header h3 {
          font-size: 1.1rem;
        }
        .admin-form {
          padding: 12px;
        }
        .admin-form-actions {
          flex-direction: column-reverse;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
        }
        .admin-form-actions button {
          width: 100%;
        }
      }

      /* Stripe Payment Styles */
      .admin-alert-success {
        background: rgba(76,175,80,0.1);
        border: 1px solid rgba(76,175,80,0.3);
        color: #81c784;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
        text-align: center;
        font-weight: 600;
      }

      .stripe-btn {
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
        width: 100%;
      }

      .stripe-btn:hover:not(:disabled) {
        background: #e64a19;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255,87,34,0.4);
      }

      .stripe-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .stripe-btn-primary {
        background: ${PRIMARY};
      }

      .stripe-card-form {
        padding: 16px 0;
      }

      .stripe-card-element {
        border: 1px solid #2a2a2a;
        border-radius: 6px;
        padding: 12px;
        background: #1a1a1a;
        margin-bottom: 16px;
      }

      .stripe-error {
        color: #ff8a80;
        font-size: 0.9rem;
        margin-bottom: 12px;
      }

      .stripe-receipt {
        margin-top: 16px;
        padding: 12px;
        background: rgba(76,175,80,0.1);
        border: 1px solid rgba(76,175,80,0.3);
        border-radius: 6px;
        color: #81c784;
      }

      .stripe-receipt-link {
        color: #81c784;
        text-decoration: underline;
        font-weight: 600;
      }

      .stripe-receipt-link:hover {
        color: #a5d6a7;
      }

      /* Footer */
      .admin-footer {
        background: ${SECONDARY};
        border-top: 1px solid #2a2a2a;
        padding: 24px 0;
        margin-top: 40px;
        text-align: center;
        position: relative;
      }
      .admin-footer-text {
        margin: 0;
        font-size: 0.9rem;
        color: #bdbdbd;
      }
      .admin-footer-eco {
        color: #22c55e;
        font-weight: 600;
      }
    `}</style>
  );
}

// Expired Members Tab Component
function ExpiredMembersTab({ expiredMembers, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleRenewMembership = async (userId) => {
    if (!confirm("Renew membership? Membership status will be set to 'active'.")) return;
    try {
      setLoading(true);
      // Call API to renew membership (will be implemented in backend)
      alert("Please update the member's plan and join date through the Users tab to renew membership.");
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to renew membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>❌ Expired Memberships</h2>
          <p style={{ color: "#bdbdbd", marginTop: "8px", fontSize: "0.95rem" }}>
            Members whose memberships have expired and need renewal
          </p>
        </div>
        <button className="admin-btn-secondary" onClick={onRefresh} disabled={loading}>
          <i className="fas fa-sync" /> Refresh
        </button>
      </div>

      {expiredMembers.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "rgba(76,175,80,0.05)",
          borderRadius: "12px",
          color: "#81c784",
          border: "1px solid rgba(76,175,80,0.3)"
        }}>
          <i className="fas fa-check-circle" style={{ fontSize: "2.5rem", marginBottom: "12px", display: "block" }}></i>
          <strong>All members have active memberships!</strong>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Expired Date</th>
                <th>Days Expired</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expiredMembers.map(member => {
                const expiryDate = new Date(member.expiryDate);
                const today = new Date();
                const daysExpired = Math.floor((today - expiryDate) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={member._id} style={{ borderLeft: "4px solid #f44336" }}>
                    <td><strong>{member.memberCode}</strong></td>
                    <td>{member.userId?.name || "N/A"}</td>
                    <td>{member.phone || "-"}</td>
                    <td>
                      <span style={{ 
                        background: "rgba(255,152,0,0.2)", 
                        color: "#ffb74d", 
                        padding: "4px 8px", 
                        borderRadius: "4px",
                        fontSize: "0.85rem"
                      }}>
                        {member.plan === "1-month" && "1 Month"}
                        {member.plan === "3-months" && "3 Months"}
                        {member.plan === "6-months" && "6 Months"}
                        {member.plan === "1-year" && "1 Year"}
                      </span>
                    </td>
                    <td style={{ color: "#f44336" }}>
                      <strong>{expiryDate.toLocaleDateString()}</strong>
                    </td>
                    <td style={{ color: "#f44336" }}>
                      <strong>{daysExpired} days</strong>
                    </td>
                    <td>
                      <button 
                        className="admin-btn-icon"
                        onClick={() => handleRenewMembership(member.userId?._id)}
                        title="Edit member to renew"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-sync" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Announcement Tab Component
function AnnouncementTab({ users, onOpenModal }) {
  const memberNames = users
    .filter(u => u.role === "member")
    .map(u => u.name)
    .join(", ") || "No members yet";

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>📢 WhatsApp Announcements</h2>
          <p style={{ color: "#bdbdbd", marginTop: "8px", fontSize: "0.95rem" }}>
            Send important announcements to gym members via WhatsApp
          </p>
        </div>
        <WhatsAppButton
          label="Send Announcement"
          onClick={onOpenModal}
          showIcon={true}
        />
      </div>

      <div style={{ marginTop: "32px" }}>
        <div style={{
          background: "#181818",
          border: "1px solid #252525",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}>
          <h3 style={{ marginBottom: "16px", color: "#fff" }}>📋 Member List</h3>
          <p style={{ color: "#bdbdbd", lineHeight: "1.6" }}>
            <strong>Total Members:</strong> {users.filter(u => u.role === "member").length}
          </p>
          <p style={{ color: "#bdbdbd", marginTop: "12px", fontSize: "0.9rem", lineHeight: "1.6" }}>
            <strong>Members:</strong> {memberNames}
          </p>
        </div>

        <div style={{
          background: "rgba(37,211,102,0.1)",
          border: "1px solid rgba(37,211,102,0.3)",
          borderRadius: "12px",
          padding: "20px",
          color: "#81c784",
        }}>
          <i className="fas fa-info-circle" style={{ marginRight: "8px" }} />
          <strong style={{ color: "#fff" }}>How it works:</strong>
          <ol style={{ marginLeft: "24px", marginTop: "8px", lineHeight: "1.8" }}>
            <li>Click "Send Announcement" above</li>
            <li>Write your message and specify recipients</li>
            <li>Click "Send via WhatsApp"</li>
            <li>Share the WhatsApp message with members individually or in group chats</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
