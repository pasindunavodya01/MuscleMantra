import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
              { id: "users", icon: "fa-users", label: "Users" },
              { id: "payments", icon: "fa-credit-card", label: "Payments" },
              { id: "attendance", icon: "fa-calendar-check", label: "Attendance" },
              { id: "qrcode", icon: "fa-qrcode", label: "QR Code" },
              { id: "bmi", icon: "fa-weight", label: "BMI Tracking" }
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
              {activeTab === "users" && <UsersTab users={users} onRefresh={loadData} />}
              {activeTab === "payments" && <PaymentsTab payments={payments} users={users} onRefresh={loadData} />}
              {activeTab === "attendance" && <AttendanceTab attendance={attendance} users={users} onRefresh={loadData} />}
              {activeTab === "qrcode" && <QRCodeTab onRefresh={loadData} />}
              {activeTab === "bmi" && <BMITab bmiRecords={bmiRecords} users={users} onRefresh={loadData} />}
            </>
          )}
        </div>
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

// Users Tab Component
function UsersTab({ users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "member",
    memberCode: "", phone: "", plan: "basic", status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  });

  const handleCreate = () => {
    setEditUser(null);
    setFormData({
      name: "", email: "", password: "", role: "member",
      memberCode: `GM-${String(users.length + 1).padStart(4, "0")}`,
      phone: "", plan: "basic", status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
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
                  <label>Plan</label>
                  <select
                    value={formData.plan}
                    onChange={e => setFormData({ ...formData, plan: e.target.value })}
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
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
                    onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
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
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Add Payment</h3>
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
                <option value="online">Online</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
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
            <button type="submit" className="admin-btn-primary">
              Create Payment
            </button>
          </div>
        </form>
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
        .admin-tabs-container {
          padding: 0 12px;
        }
        .admin-tab {
          padding: 12px 16px;
          font-size: 0.85rem;
        }
        .admin-content {
          padding: 20px 12px;
        }
        .admin-stats-grid {
          grid-template-columns: 1fr;
        }
        .admin-form-row {
          grid-template-columns: 1fr;
        }
        .admin-table-container {
          font-size: 0.85rem;
        }
        .admin-table th,
        .admin-table td {
          padding: 10px 8px;
        }
      }
    `}</style>
  );
}
