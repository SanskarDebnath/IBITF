import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  CreditCard,
  Gift,
  Star,
  Heart,
  MapPin,
  Shield,
  Badge,
  Phone,
  Mail,
  Edit2,
  Save,
  LogOut,
  Package,
  Award,
  Settings,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { getMyProfile, updateMyProfile } from "../../services/usersService";
import "./ProfilePage.css";

const memberSinceFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric"
});

function mapProfile(profile, fallback = {}) {
  return {
    firstName: profile?.firstName || fallback.firstName || "",
    lastName: profile?.lastName || fallback.lastName || "",
    gender: profile?.gender || fallback.gender || "other",
    email: profile?.email || fallback.email || "",
    mobile: profile?.mobile || fallback.mobile || "",
    avatar: fallback.avatar || "",
    joinDate: profile?.createdAt
      ? memberSinceFormatter.format(new Date(profile.createdAt))
      : fallback.joinDate || "-",
    orders: fallback.orders || 0,
    wishlist: fallback.wishlist || 0,
    addresses: fallback.addresses || 0,
    verified: profile?.isVerified ?? fallback.verified ?? false
  };
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const initial = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      gender: "other",
      email: user?.email || "",
      mobile: "",
      avatar: "",
      joinDate: "-",
      orders: 0,
      wishlist: 0,
      addresses: 0,
      verified: false
    }),
    [user?.email]
  );

  const [profile, setProfile] = useState(initial);
  const [editPersonal, setEditPersonal] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editMobile, setEditMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();
        setProfile((previous) => mapProfile(response, previous));
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (key) => (e) => {
    setProfile((p) => ({ ...p, [key]: e.target.value }));
    setError("");
    setMessage("");
  };

  const persistProfile = async (section) => {
    setSavingSection(section);
    setError("");
    setMessage("");

    try {
      const response = await updateMyProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        email: profile.email,
        mobile: profile.mobile
      });

      setProfile((previous) => mapProfile(response, previous));
      updateUser({
        name: [response?.firstName, response?.lastName].filter(Boolean).join(" ").trim(),
        email: response?.email,
        role: response?.role
      });
      setMessage("Profile updated successfully.");
      return true;
    } catch (err) {
      setError(err.message || "Failed to update profile");
      return false;
    } finally {
      setSavingSection("");
    }
  };

  const savePersonal = async () => {
    const ok = await persistProfile("personal");
    if (ok) setEditPersonal(false);
  };
  const saveEmail = async () => {
    const ok = await persistProfile("email");
    if (ok) setEditEmail(false);
  };
  const saveMobile = async () => {
    const ok = await persistProfile("mobile");
    if (ok) setEditMobile(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const sidebarSections = [
    {
      title: "MY ORDERS",
      items: [
        { icon: <ShoppingBag size={20} />, label: "Orders", path: "/account/orders" },
        { icon: <Package size={20} />, label: "Returns & Cancellations", path: "/account/orders?status=cancelled" }
      ]
    },
    {
      title: "ACCOUNT SETTINGS",
      items: [
        { icon: <Badge size={20} />, label: "Profile Information", path: "/account/profile", active: true },
        { icon: <MapPin size={20} />, label: "Manage Addresses", path: "/account/addresses" },
        { icon: <Shield size={20} />, label: "Privacy & Security", path: "/account/security" },
        { icon: <Award size={20} />, label: "PAN Card Information", path: "/account/pan" }
      ]
    },
    {
      title: "PAYMENTS",
      items: [
        { icon: <Gift size={20} />, label: "Gift Cards", path: "/account/gift-cards" },
        { icon: <CreditCard size={20} />, label: "Saved Cards", path: "/account/saved-cards" },
        { icon: <Settings size={20} />, label: "Payment Methods", path: "/account/payments" }
      ]
    },
    {
      title: "MY ACTIVITY",
      items: [
        { icon: <Heart size={20} />, label: "My Wishlist", path: "/account/wishlist" },
        { icon: <Star size={20} />, label: "Reviews & Ratings", path: "/account/reviews" },
        // { icon: <Bell size={20} />, label: "Notifications", path: "/account/notifications" },
        // { icon: <Gift size={20} />, label: "My Coupons", path: "/account/coupons" }
      ]
    }
  ];

  const stats = [
    { label: "Total Orders", value: profile.orders, color: "#d97706" },
    { label: "Wishlist Items", value: profile.wishlist, color: "#ef4444" },
    { label: "Saved Addresses", value: profile.addresses, color: "#10b981" },
    { label: "Member Since", value: profile.joinDate, color: "#3b82f6" }
  ];

  if (loading) {
    return (
      <div className="profile-container-wrapper">
        <div className="profile-main-container">
          <section className="profile-info-card">
            <p className="profile-card-subtitle">Loading profile...</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container-wrapper">
      {/* Header Section */}
      <div className="profile-header-section">
        <div className="profile-hero-banner">
          <div className="hero-banner-content">
            <h1>My Account</h1>
            <p>Manage your profile, orders, and preferences</p>
          </div>
          <div className="hero-banner-pattern">
            <div className="pattern-dot"></div>
            <div className="pattern-dot"></div>
            <div className="pattern-dot"></div>
          </div>
        </div>
      </div>

      <div className="profile-main-container">
        {/* LEFT SIDEBAR */}
        <aside className="profile-sidebar-panel">
          {/* User Card */}
            <div className="profile-user-card">
              <div className="profile-avatar-container">
                <div className="profile-avatar-circle">
                <span className="material-symbols-outlined">person_alert</span>
                </div>
              {profile.verified && (
                <div className="profile-verified-badge">
                  <Shield size={12} />
                </div>
              )}
            </div>
            <div className="profile-user-info">
              <h3 className="profile-user-name">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="profile-user-email">{profile.email}</p>
            </div>
            <div className="profile-user-stats">
              {stats.map((stat, index) => (
                <div key={index} className="profile-stat-item">
                  <div className="profile-stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="profile-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="profile-sidebar-nav">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="profile-sidebar-block">
                <h4 className="profile-sidebar-title">{section.title}</h4>
                <div className="profile-sidebar-items">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`profile-nav-link ${item.active ? 'profile-nav-active' : ''}`}
                    >
                      <div className="profile-nav-icon">
                        {item.icon}
                      </div>
                      <span className="profile-nav-text">{item.label}</span>
                      {item.active && (
                        <div className="profile-nav-indicator"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <button className="profile-logout-btn" onClick={handleLogout} type="button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="profile-content-area">
          {error ? (
            <section className="profile-info-card">
              <p className="profile-card-subtitle">{error}</p>
            </section>
          ) : null}
          {message ? (
            <section className="profile-info-card">
              <p className="profile-card-subtitle">{message}</p>
            </section>
          ) : null}

          {/* Personal Information */}
          <section className="profile-info-card">
            <div className="profile-card-header">
              <div className="profile-header-content">
                <User size={24} className="profile-header-icon" />
                <div>
                  <h2>Personal Information</h2>
                  <p className="profile-card-subtitle">Update your name and personal details</p>
                </div>
              </div>
              {!editPersonal ? (
                <button className="profile-edit-btn" type="button" onClick={() => setEditPersonal(true)}>
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <button
                  className="profile-save-btn"
                  type="button"
                  onClick={savePersonal}
                  disabled={savingSection === "personal"}
                >
                  <Save size={16} />
                  {savingSection === "personal" ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label className="profile-form-label">
                  First Name
                  <span className="profile-required">*</span>
                </label>
                <input
                  className="profile-form-input"
                  value={profile.firstName}
                  onChange={handleChange("firstName")}
                  disabled={!editPersonal}
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  Last Name
                  <span className="profile-required">*</span>
                </label>
                <input
                  className="profile-form-input"
                  value={profile.lastName}
                  onChange={handleChange("lastName")}
                  disabled={!editPersonal}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Gender</label>
              <div className="profile-radio-group">
                <label className={`profile-radio-option ${profile.gender === "male" ? 'profile-radio-selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={profile.gender === "male"}
                    onChange={handleChange("gender")}
                    disabled={!editPersonal}
                    className="profile-radio-input"
                  />
                  <div className="profile-radio-custom"></div>
                  <span>Male</span>
                </label>

                <label className={`profile-radio-option ${profile.gender === "female" ? 'profile-radio-selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={profile.gender === "female"}
                    onChange={handleChange("gender")}
                    disabled={!editPersonal}
                    className="profile-radio-input"
                  />
                  <div className="profile-radio-custom"></div>
                  <span>Female</span>
                </label>

                <label className={`profile-radio-option ${profile.gender === "other" ? 'profile-radio-selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={profile.gender === "other"}
                    onChange={handleChange("gender")}
                    disabled={!editPersonal}
                    className="profile-radio-input"
                  />
                  <div className="profile-radio-custom"></div>
                  <span>Other</span>
                </label>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <div className="profile-contact-cards">
            {/* Email Address */}
            <section className="profile-info-card">
              <div className="profile-card-header">
                <div className="profile-header-content">
                  <Mail size={24} className="profile-header-icon" />
                  <div>
                    <h2>Email Address</h2>
                    <p className="profile-card-subtitle">Primary email for account notifications</p>
                  </div>
                </div>
              {!editEmail ? (
                <button className="profile-edit-btn" type="button" onClick={() => setEditEmail(true)}>
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <button
                  className="profile-save-btn"
                  type="button"
                  onClick={saveEmail}
                  disabled={savingSection === "email"}
                >
                  <Save size={16} />
                  {savingSection === "email" ? "Saving..." : "Save"}
                </button>
              )}
            </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  Email Address
                  <span className="profile-required">*</span>
                </label>
                <input
                  className="profile-form-input"
                  type="email"
                  value={profile.email}
                  onChange={handleChange("email")}
                  disabled={!editEmail}
                />
                <p className="profile-form-hint">We'll send account updates to this email</p>
              </div>
            </section>

            {/* Mobile Number */}
            <section className="profile-info-card">
              <div className="profile-card-header">
                <div className="profile-header-content">
                  <Phone size={24} className="profile-header-icon" />
                  <div>
                    <h2>Mobile Number</h2>
                    <p className="profile-card-subtitle">Primary contact number</p>
                  </div>
                </div>
              {!editMobile ? (
                <button className="profile-edit-btn" type="button" onClick={() => setEditMobile(true)}>
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <button
                  className="profile-save-btn"
                  type="button"
                  onClick={saveMobile}
                  disabled={savingSection === "mobile"}
                >
                  <Save size={16} />
                  {savingSection === "mobile" ? "Saving..." : "Save"}
                </button>
              )}
            </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  Mobile Number
                  <span className="profile-required">*</span>
                </label>
                <input
                  className="profile-form-input"
                  type="tel"
                  value={profile.mobile}
                  onChange={handleChange("mobile")}
                  disabled={!editMobile}
                />
                <p className="profile-form-hint">Used for order updates and OTP verification</p>
              </div>
            </section>
          </div>

          {/* FAQs */}
          <section className="profile-info-card profile-faq-card">
            <div className="profile-card-header">
              <div className="profile-header-content">
                <HelpCircle size={24} className="profile-header-icon" />
                <div>
                  <h2>Frequently Asked Questions</h2>
                  <p className="profile-card-subtitle">Common queries about profile updates</p>
                </div>
              </div>
            </div>

            <div className="profile-faq-list">
              <div className="profile-faq-item">
                <h3 className="profile-faq-question">
                  What happens when I update my email address or mobile number?
                </h3>
                <p className="profile-faq-answer">
                  Your login identifier will be updated accordingly. Future communications and account
                  alerts will be routed to the updated contact details.
                </p>
              </div>

              <div className="profile-faq-item">
                <h3 className="profile-faq-question">
                  When will my account be updated with the new email or mobile number?
                </h3>
                <p className="profile-faq-answer">
                  Your profile will reflect the new contact information after successful verification
                  and confirmation via OTP or email link.
                </p>
              </div>

              <div className="profile-faq-item">
                <h3 className="profile-faq-question">
                  What happens to my existing account history after updates?
                </h3>
                <p className="profile-faq-answer">
                  Your order history, preferences, and saved settings remain intact. Only your contact
                  identifiers are updated, ensuring a seamless transition.
                </p>
              </div>

              <div className="profile-faq-item">
                <h3 className="profile-faq-question">
                  Can I revert to my old contact information?
                </h3>
                <p className="profile-faq-answer">
                  Yes, you can revert within 24 hours of making the change. After that, the change
                  becomes permanent and requires verification to update again.
                </p>
              </div>
            </div>
          </section>

          {/* Security Note */}
          <div className="profile-security-note">
            <Shield size={20} />
            <div>
              <h4>Your Security Matters</h4>
              <p>All profile changes are secured with encryption and require verification</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
