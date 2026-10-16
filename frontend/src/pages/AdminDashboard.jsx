import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAdminStats,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  createService,
  updateService,
  deleteService,
  createBarber,
  updateBarber,
  deleteBarber,
  getAllUsers,
  getServices,
  getBarbers,
} from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalUsers: 0,
    totalBarbers: 0,
    totalServices: 0,
    totalRevenue: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [users, setUsers] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Service Modal State (Add & Edit)
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    icon: "✂️",
  });

  // Barber Modal State (Add & Edit)
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [editingBarberId, setEditingBarberId] = useState(null);
  const [barberForm, setBarberForm] = useState({
    name: "",
    specialization: "",
    rating: "4.8",
    experience: "5",
    location: "Madurai",
    image: "",
  });

  const showNotification = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, bookingsRes, servicesRes, barbersRes, usersRes] = await Promise.all([
        getAdminStats(token),
        getAllBookings(token),
        getServices(),
        getBarbers(),
        getAllUsers(token),
      ]);

      if (statsRes.data && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
      setBookings(bookingsRes.data.bookings || []);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : servicesRes.data.services || []);
      setBarbers(Array.isArray(barbersRes.data) ? barbersRes.data : barbersRes.data.barbers || []);
      const rawUsers = usersRes.data.users || [];
      setUsers(rawUsers.filter((u) => u.role !== "admin"));
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        window.location.replace("/admin/login");
        return;
      }
      showNotification("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle status update
  const handleStatusChange = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      await updateBookingStatus(bookingId, newStatus, token);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      showNotification(`Booking status updated to ${newStatus}`);
      // Refresh stats in background
      getAdminStats(token).then((res) => {
        if (res.data?.stats) setStats(res.data.stats);
      });
    } catch (err) {
      console.error("Error updating status:", err);
      showNotification(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    setActionLoading(true);
    try {
      await deleteBooking(bookingId, token);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      showNotification("Booking deleted successfully");
    } catch (err) {
      console.error("Error deleting booking:", err);
      showNotification(err.response?.data?.message || "Failed to delete booking", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Add Service Modal
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceForm({ name: "", description: "", price: "", duration: "", icon: "✂️" });
    setShowServiceModal(true);
  };

  // Open Edit Service Modal
  const handleOpenEditService = (service) => {
    setEditingServiceId(service._id || service.id);
    setServiceForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price !== undefined ? service.price : "",
      duration: service.duration !== undefined ? service.duration : "",
      icon: service.icon || "✂️",
    });
    setShowServiceModal(true);
  };

  // Handle saving service (Add or Edit)
  const handleSaveService = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        duration: Number(serviceForm.duration),
        icon: serviceForm.icon || "✂️",
      };

      if (editingServiceId) {
        await updateService(editingServiceId, payload, token);
        showNotification("Service updated successfully!");
      } else {
        await createService(payload, token);
        showNotification("Service added successfully!");
      }

      setShowServiceModal(false);
      setEditingServiceId(null);
      setServiceForm({ name: "", description: "", price: "", duration: "", icon: "✂️" });
      fetchData();
    } catch (err) {
      console.error("Error saving service:", err);
      showNotification(err.response?.data?.message || "Failed to save service", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deleting service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to remove this service?")) return;
    setActionLoading(true);
    try {
      await deleteService(serviceId, token);
      setServices((prev) => prev.filter((s) => (s._id || s.id) !== serviceId));
      showNotification("Service deleted successfully");
    } catch (err) {
      console.error("Error deleting service:", err);
      showNotification(err.response?.data?.message || "Failed to delete service", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Add Barber Modal
  const handleOpenAddBarber = () => {
    setEditingBarberId(null);
    setBarberForm({ name: "", specialization: "", rating: "4.8", experience: "5", location: "Madurai", image: "" });
    setShowBarberModal(true);
  };

  // Open Edit Barber Modal
  const handleOpenEditBarber = (barber) => {
    setEditingBarberId(barber._id || barber.id);
    setBarberForm({
      name: barber.name || "",
      specialization: barber.specialization || "",
      rating: barber.rating !== undefined ? barber.rating : "4.8",
      experience: barber.experience !== undefined ? barber.experience : "5",
      location: barber.location || "Madurai",
      image: barber.image || "",
    });
    setShowBarberModal(true);
  };

  // Handle saving barber (Add or Edit)
  const handleSaveBarber = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: barberForm.name,
        specialization: barberForm.specialization,
        rating: Number(barberForm.rating),
        experience: Number(barberForm.experience),
        location: barberForm.location || "Madurai",
        image: barberForm.image || "",
      };

      if (editingBarberId) {
        await updateBarber(editingBarberId, payload, token);
        showNotification("Barber updated successfully!");
      } else {
        await createBarber(payload, token);
        showNotification("Barber added successfully!");
      }

      setShowBarberModal(false);
      setEditingBarberId(null);
      setBarberForm({ name: "", specialization: "", rating: "4.8", experience: "5", location: "Madurai", image: "" });
      fetchData();
    } catch (err) {
      console.error("Error saving barber:", err);
      showNotification(err.response?.data?.message || "Failed to save barber", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deleting barber
  const handleDeleteBarber = async (barberId) => {
    if (!window.confirm("Are you sure you want to remove this barber?")) return;
    setActionLoading(true);
    try {
      await deleteBarber(barberId, token);
      setBarbers((prev) => prev.filter((b) => (b._id || b.id) !== barberId));
      showNotification("Barber deleted successfully");
    } catch (err) {
      console.error("Error deleting barber:", err);
      showNotification(err.response?.data?.message || "Failed to delete barber", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const customerName = b.user?.name || "Guest";
    const barber = b.barber || "";
    const service = b.service || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchLower) ||
      barber.toLowerCase().includes(searchLower) ||
      service.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const navTabs = [
    { id: "bookings", icon: "📅", label: "Appointments", count: bookings.length },
    { id: "services", icon: "✂️", label: "Services", count: services.length },
    { id: "barbers", icon: "💈", label: "Barbers & Stylists", count: barbers.length },
    { id: "users", icon: "👥", label: "Customers", count: users.length },
  ];

  const tabTitles = {
    bookings: "Appointments Management",
    services: "Services Catalog",
    barbers: "Barbers & Stylists",
    users: "Customer Directory",
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-badge">⚡ Control Center</div>
            
            {/* Bold, Unique, Luxury Styled Shop Name with 3D Animated Barber Pole */}
            <div className="admin-brand-card">
              <div className="admin-brand-icon-box" title="Authentic 3D Rotating Barber Pole">
                <div className="barber-pole-cylinder">
                  <div className="barber-pole-stripes"></div>
                  <div className="barber-pole-glass"></div>
                  <div className="barber-pole-cap-top"></div>
                  <div className="barber-pole-cap-bottom"></div>
                </div>
              </div>
              <div className="admin-brand-text-wrap">
                <div className="admin-brand-title">
                  <span className="brand-word-main">BARBER</span>
                  <span className="brand-word-accent">BOOK</span>
                </div>
                <div className="admin-brand-subtitle">
                  LUXURY MEN'S SALON
                </div>
              </div>
            </div>

            <div className="admin-sidebar-status">System Online</div>
          </div>

          <div className="admin-sidebar-section-title">Navigation</div>
          <nav className="admin-sidebar-nav">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`admin-sidebar-item ${isActive ? "active" : ""}`}
                >
                  <div className="admin-sidebar-item-left">
                    <span className="admin-sidebar-item-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  <span className="admin-sidebar-item-badge">{tab.count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">{user?.name || "Admin"}</div>
              <div className="admin-sidebar-user-role">{user?.role?.toUpperCase() || "ADMIN"}</div>
            </div>
          </div>
          <div className="admin-sidebar-footer-links">
            <Link to="/" className="admin-sidebar-footer-btn" title="View Customer Website">
              <span>🏠 User Site</span>
            </Link>
            <Link to="/profile" className="admin-sidebar-footer-btn">
              <span>👤 Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="admin-sidebar-footer-btn logout"
            >
              <span>🚪 Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰ Menu
            </button>
            <div>
              <div className="admin-topbar-shop-badge">
                <div className="topbar-pole-mini" title="Rotating Barber Pole">
                  <div className="barber-pole-stripes"></div>
                  <div className="barber-pole-glass"></div>
                </div>
                <span className="scissor-snip-icon">✂️</span>
                <span className="admin-topbar-shop-name">
                  BARBER<span className="topbar-accent">BOOK</span>
                </span>
                <span className="admin-topbar-shop-tag">SALON PORTAL</span>
              </div>
              <h1 style={{ fontSize: "1.75rem", margin: "6px 0 0", color: "#111", fontWeight: 800 }}>
                {tabTitles[activeTab] || "Admin Dashboard"}
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Animated Salon Crest Banner */}
            <div className="admin-salon-crest-badge" title="BarberBook Active Operations">
              <span className="crest-scissor-anim">✂️</span>
              <div className="crest-mini-pole">
                <div className="barber-pole-stripes"></div>
                <div className="barber-pole-glass"></div>
              </div>
              <span className="crest-razor-anim">🪒</span>
            </div>
            {activeTab === "services" && (
              <button
                onClick={handleOpenAddService}
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
              >
                + Add Service
              </button>
            )}
            {activeTab === "barbers" && (
              <button
                onClick={handleOpenAddBarber}
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
              >
                + Add Barber
              </button>
            )}
            <Link
              to="/"
              className="btn btn-outline"
              style={{
                padding: "8px 16px",
                fontSize: "0.9rem",
                border: "1px solid #f59e0b",
                background: "#fef3c7",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#92400e",
                fontWeight: 700,
                borderRadius: "6px",
                boxShadow: "0 1px 3px rgba(245, 158, 11, 0.2)"
              }}
              title="Return to customer website"
            >
              🌐 Go to User Page (Website)
            </Link>
            <button
              onClick={fetchData}
              className="btn btn-outline"
              style={{ padding: "8px 16px", fontSize: "0.9rem", border: "1px solid #ccc", background: "#fff" }}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {message.text && (
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "6px",
              marginBottom: "1.5rem",
              background: message.type === "error" ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
              color: message.type === "error" ? "#dc2626" : "#16a34a",
              border: `1px solid ${message.type === "error" ? "#f87171" : "#86efac"}`,
              fontWeight: "500",
            }}
          >
            {message.text}
          </div>
        )}

        {/* ================= TAB: BOOKINGS (APPOINTMENTS MANAGEMENT) ================= */}
        {activeTab === "bookings" && (
          <section>
            {/* KPI Stat Cards (Appointments Overview) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1.2rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ fontSize: "1.4rem" }}>📅</span>
                <div style={{ marginTop: "6px", fontSize: "1.6rem", fontWeight: "bold", color: "#111" }}>
                  {stats.totalBookings}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Total Appointments</div>
              </div>

              <div style={{ background: "#fefce8", padding: "18px", borderRadius: "10px", border: "1px solid #fef08a", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ fontSize: "1.4rem" }}>⏳</span>
                <div style={{ marginTop: "6px", fontSize: "1.6rem", fontWeight: "bold", color: "#ca8a04" }}>
                  {stats.pendingBookings}
                </div>
                <div style={{ color: "#854d0e", fontSize: "0.85rem" }}>Pending Confirmation</div>
              </div>

              <div style={{ background: "#f0fdf4", padding: "18px", borderRadius: "10px", border: "1px solid #bbf7d0", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ fontSize: "1.4rem" }}>✅</span>
                <div style={{ marginTop: "6px", fontSize: "1.6rem", fontWeight: "bold", color: "#16a34a" }}>
                  {stats.confirmedBookings + stats.completedBookings}
                </div>
                <div style={{ color: "#166534", fontSize: "0.85rem" }}>Confirmed / Done</div>
              </div>

              <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ fontSize: "1.4rem" }}>💰</span>
                <div style={{ marginTop: "6px", fontSize: "1.6rem", fontWeight: "bold", color: "#111" }}>
                  ₹{stats.totalRevenue}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Est. Booked Revenue</div>
              </div>

              <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                <span style={{ fontSize: "1.4rem" }}>👥</span>
                <div style={{ marginTop: "6px", fontSize: "1.6rem", fontWeight: "bold", color: "#111" }}>
                  {stats.totalUsers}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Registered Customers</div>
              </div>
            </div>
            {/* Filter and Search */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>Filter Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                  <option value="all">All Appointments ({bookings.length})</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Search by customer, barber, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "280px" }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>Loading appointments...</div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <h3>No appointments found</h3>
                <p style={{ color: "#666" }}>Try adjusting your search or status filter.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                      <th style={{ padding: "14px 16px" }}>Customer</th>
                      <th style={{ padding: "14px 16px" }}>Service</th>
                      <th style={{ padding: "14px 16px" }}>Barber</th>
                      <th style={{ padding: "14px 16px" }}>Schedule</th>
                      <th style={{ padding: "14px 16px" }}>Status</th>
                      <th style={{ padding: "14px 16px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <strong style={{ display: "block" }}>{b.user?.name || "Customer"}</strong>
                          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{b.user?.email}</span>
                          {b.user?.phone && (
                            <span style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af" }}>
                              📞 {b.user?.phone}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <strong>{b.service}</strong>
                          {b.notes && (
                            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                              Note: "{b.notes}"
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>✂️ {b.barber}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div><strong>{b.date}</strong></div>
                          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{b.time}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            disabled={actionLoading}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              cursor: "pointer",
                              border: "1px solid #d1d5db",
                              background:
                                b.status === "confirmed"
                                  ? "#dcfce7"
                                  : b.status === "completed"
                                  ? "#e0e7ff"
                                  : b.status === "cancelled"
                                  ? "#fee2e2"
                                  : "#fef9c3",
                              color:
                                b.status === "confirmed"
                                  ? "#166534"
                                  : b.status === "completed"
                                  ? "#3730a3"
                                  : b.status === "cancelled"
                                  ? "#991b1b"
                                  : "#854d0e",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() => handleDeleteBooking(b._id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                            title="Delete booking"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ================= TAB: SERVICES ================= */}
        {activeTab === "services" && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2>Salon Services Catalog</h2>
              <button
                onClick={handleOpenAddService}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.95rem" }}
              >
                + Add New Service
              </button>
            </div>

            {/* Service Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {services.map((service) => (
                <div
                  key={service._id || service.id}
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "20px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{service.icon || "✂️"}</div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem" }}>{service.name}</h3>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "12px" }}>{service.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                      <span>⏱ {service.duration} mins</span>
                      <strong style={{ color: "#111", fontSize: "1.1rem" }}>₹{service.price}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenEditService(service)}
                      style={{
                        color: "#1e40af",
                        background: "#dbeafe",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "5px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "0.2s",
                      }}
                      title="Edit Service"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id || service.id)}
                      style={{
                        color: "#dc2626",
                        background: "#fee2e2",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "5px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "0.2s",
                      }}
                      title="Delete Service"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Modal (Add / Edit) */}
            {showServiceModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2000,
                  padding: "1rem",
                }}
              >
                <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", maxWidth: "500px", width: "100%" }}>
                  <h3 style={{ marginBottom: "1rem" }}>
                    {editingServiceId ? "✏️ Edit Salon Service" : "✨ Add New Salon Service"}
                  </h3>
                  <form onSubmit={handleSaveService}>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Service Name</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="e.g. Royal Beard Grooming"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Description</label>
                      <textarea
                        required
                        rows="2"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="Detailed service description..."
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Price (₹)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                          placeholder="e.g. 350"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Duration (mins)</label>
                        <input
                          type="number"
                          required
                          min="5"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                          placeholder="e.g. 40"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Icon Emoji</label>
                      <input
                        type="text"
                        value={serviceForm.icon}
                        onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="✂️ or 🧔 or ✨"
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowServiceModal(false);
                          setEditingServiceId(null);
                        }}
                        className="btn btn-outline"
                        style={{ padding: "8px 16px", border: "1px solid #ccc" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: "8px 20px" }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Saving..." : editingServiceId ? "Update Service" : "Save Service"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= TAB: BARBERS ================= */}
        {activeTab === "barbers" && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2>Salon Barbers & Stylists</h2>
              <button
                onClick={handleOpenAddBarber}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.95rem" }}
              >
                + Add New Barber
              </button>
            </div>

            {/* Barbers Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {barbers.map((barber) => (
                <div
                  key={barber._id || barber.id}
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "20px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          background: "#111",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          overflow: "hidden",
                          border: "2px solid #e5e7eb",
                        }}
                      >
                        {barber.image ? (
                          <img
                            src={barber.image}
                            alt={barber.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          barber.name ? barber.name.charAt(0) : "B"
                        )}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{barber.name}</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{barber.specialization}</p>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                      <span>⭐ {barber.rating} Rating</span>
                      <span>{barber.experience} Years Exp.</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "6px" }}>📍 {barber.location || "Madurai"}</p>
                  </div>

                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenEditBarber(barber)}
                      style={{
                        color: "#1e40af",
                        background: "#dbeafe",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "5px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "0.2s",
                      }}
                      title="Edit Barber"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBarber(barber._id || barber.id)}
                      style={{
                        color: "#dc2626",
                        background: "#fee2e2",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "5px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "0.2s",
                      }}
                      title="Delete Barber"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Barber Modal (Add / Edit) */}
            {showBarberModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2000,
                  padding: "1rem",
                }}
              >
                <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                  <h3 style={{ marginBottom: "1rem" }}>
                    {editingBarberId ? "✏️ Edit Barber Specialist" : "✨ Add New Barber Specialist"}
                  </h3>
                  <form onSubmit={handleSaveBarber}>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Full Name</label>
                      <input
                        type="text"
                        required
                        value={barberForm.name}
                        onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Specialization</label>
                      <input
                        type="text"
                        required
                        value={barberForm.specialization}
                        onChange={(e) => setBarberForm({ ...barberForm, specialization: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="e.g. Master Beard Stylist"
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Rating (1-5)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          required
                          value={barberForm.rating}
                          onChange={(e) => setBarberForm({ ...barberForm, rating: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Experience (Years)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={barberForm.experience}
                          onChange={(e) => setBarberForm({ ...barberForm, experience: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Location</label>
                      <input
                        type="text"
                        value={barberForm.location}
                        onChange={(e) => setBarberForm({ ...barberForm, location: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="e.g. Madurai"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Photo URL (Optional)</label>
                      <input
                        type="url"
                        value={barberForm.image}
                        onChange={(e) => setBarberForm({ ...barberForm, image: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="https://..."
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBarberModal(false);
                          setEditingBarberId(null);
                        }}
                        className="btn btn-outline"
                        style={{ padding: "8px 16px", border: "1px solid #ccc" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: "8px 20px" }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Saving..." : editingBarberId ? "Update Barber" : "Save Barber"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= TAB: CUSTOMERS ================= */}
        {activeTab === "users" && (
          <section>
            <h2 style={{ marginBottom: "1.5rem" }}>Registered Customers ({users.length})</h2>
            <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                    <th style={{ padding: "14px 16px" }}>Customer Name</th>
                    <th style={{ padding: "14px 16px" }}>Email</th>
                    <th style={{ padding: "14px 16px" }}>Phone</th>
                    <th style={{ padding: "14px 16px" }}>Role</th>
                    <th style={{ padding: "14px 16px" }}>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "30px 16px", textAlign: "center", color: "#9ca3af" }}>
                        No registered customers found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "14px 16px", fontWeight: "600" }}>{u.name}</td>
                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>{u.email}</td>
                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>{u.phone || "Not provided"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              background: "#e0f2fe",
                              color: "#0369a1",
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#9ca3af", fontSize: "0.85rem" }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
