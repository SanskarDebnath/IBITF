import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Database,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Store,
  UserRound
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { getSellerSettings, updateSellerSettings } from "../../services/sellerService";
import "./SellerForms.css";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const initialSettings = {
  user: {
    id: null,
    name: "",
    email: "",
    role: "seller",
    isVerified: false,
    createdAt: null
  },
  seller: {
    id: null,
    shopName: "",
    phone: "",
    address: "",
    status: "pending",
    createdAt: null
  }
};

function mapFormData(settings) {
  return {
    name: settings?.user?.name || "",
    shopName: settings?.seller?.shopName || "",
    phone: settings?.seller?.phone || "",
    address: settings?.seller?.address || ""
  };
}

function FieldCode({ children }) {
  return <code className="seller-inline-code">{children}</code>;
}

export default function SellerSettingsPage() {
  const { updateUser } = useAuth();
  const [settings, setSettings] = useState(initialSettings);
  const [formData, setFormData] = useState(mapFormData(initialSettings));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getSellerSettings();
        const nextSettings = {
          user: { ...initialSettings.user, ...(response?.user || {}) },
          seller: { ...initialSettings.seller, ...(response?.seller || {}) }
        };
        setSettings(nextSettings);
        setFormData(mapFormData(nextSettings));
      } catch (err) {
        setError(err.message || "Failed to load seller settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const isDirty = useMemo(() => {
    const baseline = mapFormData(settings);
    return Object.keys(baseline).some((key) => (formData[key] || "") !== (baseline[key] || ""));
  }, [formData, settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await updateSellerSettings(formData);
      const nextSettings = {
        user: { ...initialSettings.user, ...(response?.user || {}) },
        seller: { ...initialSettings.seller, ...(response?.seller || {}) }
      };

      setSettings(nextSettings);
      setFormData(mapFormData(nextSettings));
      updateUser({
        name: nextSettings.user.name,
        email: nextSettings.user.email,
        role: nextSettings.user.role
      });
      setMessage("Seller settings updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update seller settings");
    } finally {
      setSaving(false);
    }
  };

  const overviewCards = [
    {
      label: "Seller Status",
      value: settings.seller.status || "pending",
      hint: "Stored in sellers.status",
      icon: <Store size={20} />
    },
    {
      label: "Email Verified",
      value: settings.user.isVerified ? "Verified" : "Pending",
      hint: "Stored in users.is_verified",
      icon: <ShieldCheck size={20} />
    },
    {
      label: "Seller Since",
      value: settings.seller.createdAt ? dateFormatter.format(new Date(settings.seller.createdAt)) : "-",
      hint: "Stored in sellers.created_at",
      icon: <CalendarDays size={20} />
    },
    {
      label: "Account Role",
      value: settings.user.role || "seller",
      hint: "Stored in users.role",
      icon: <BadgeCheck size={20} />
    }
  ];

  const mappingRows = [
    {
      icon: <Mail size={18} />,
      field: <FieldCode>users.email</FieldCode>,
      description: "Login email. Read-only here.",
      value: settings.user.email || "-"
    },
    {
      icon: <UserRound size={18} />,
      field: <FieldCode>users.name</FieldCode>,
      description: "Seller account display name.",
      value: settings.user.name || "-"
    },
    {
      icon: <Store size={18} />,
      field: <FieldCode>sellers.shop_name</FieldCode>,
      description: "Public-facing shop name.",
      value: settings.seller.shopName || "-"
    },
    {
      icon: <Phone size={18} />,
      field: <FieldCode>sellers.phone</FieldCode>,
      description: "Primary seller contact number.",
      value: settings.seller.phone || "-"
    },
    {
      icon: <MapPin size={18} />,
      field: <FieldCode>sellers.address</FieldCode>,
      description: "Business or pickup address.",
      value: settings.seller.address || "-"
    }
  ];

  if (loading) {
    return (
      <div className="seller-panel seller-settings-state">
        <p className="seller-empty-text">Loading seller settings...</p>
      </div>
    );
  }

  return (
    <div className="seller-settings-page">
      <section className="seller-dashboard-hero seller-dashboard-hero--settings">
        <div>
          <div className="seller-dashboard-eyebrow">
            <Database size={16} />
            <span>DB-Backed Settings</span>
          </div>
          <h1>{settings.seller.shopName || "Seller Settings"}</h1>
          <p>
            Manage the seller fields stored in your account. This page updates the live{" "}
            <FieldCode>users</FieldCode> and <FieldCode>sellers</FieldCode> records for the
            logged-in seller.
          </p>
        </div>
      </section>

      <section className="seller-kpi-overview-grid">
        {overviewCards.map((card) => (
          <article key={card.label} className="seller-kpi-card">
            <div className="seller-kpi-icon">{card.icon}</div>
            <div className="seller-kpi-value seller-kpi-value--compact">{card.value}</div>
            <h2>{card.label}</h2>
            <p>{card.hint}</p>
          </article>
        ))}
      </section>

      <div className="seller-settings-layout">
        <form className="seller-panel seller-form seller-settings-form" onSubmit={handleSubmit}>
          <div className="seller-panel-header">
            <div>
              <h2>Edit Seller Profile</h2>
              <p>These are the editable fields currently backed by the database.</p>
            </div>
            <button
              type="submit"
              className="seller-primary-btn"
              disabled={saving || !isDirty}
            >
              <Save size={18} />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

          <div className="seller-settings-section">
            <div className="seller-settings-section__title">
              <UserRound size={18} />
              <span>Account Record</span>
            </div>
            <div className="seller-form-grid">
              <label className="seller-settings-field">
                Account Name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seller account name"
                  required
                />
                <span className="seller-field-hint">
                  Updates <FieldCode>users.name</FieldCode>.
                </span>
              </label>
              <label className="seller-settings-field">
                Email Address
                <input
                  value={settings.user.email || ""}
                  readOnly
                  className="seller-readonly-input"
                />
                <span className="seller-field-hint">
                  Read-only from <FieldCode>users.email</FieldCode>.
                </span>
              </label>
            </div>
          </div>

          <div className="seller-settings-section">
            <div className="seller-settings-section__title">
              <Store size={18} />
              <span>Shop Record</span>
            </div>
            <div className="seller-form-grid">
              <label className="seller-settings-field">
                Shop Name
                <input
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Your store name"
                  required
                />
                <span className="seller-field-hint">
                  Updates <FieldCode>sellers.shop_name</FieldCode>.
                </span>
              </label>
              <label className="seller-settings-field">
                Phone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 to 15 digit phone number"
                />
                <span className="seller-field-hint">
                  Updates <FieldCode>sellers.phone</FieldCode>.
                </span>
              </label>
            </div>

            <label className="seller-settings-field seller-settings-field--wide">
              Address
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Business or pickup address"
              />
              <span className="seller-field-hint">
                Updates <FieldCode>sellers.address</FieldCode>.
              </span>
            </label>
          </div>

          {error && <div className="seller-alert error">{error}</div>}
          {message && <div className="seller-alert success">{message}</div>}
        </form>

        <div className="seller-settings-sidebar">
          <article className="seller-panel">
            <div className="seller-panel-header seller-panel-header--stack">
              <div>
                <h2>Database Snapshot</h2>
                <p>Read-only metadata from the current seller account.</p>
              </div>
            </div>

            <div className="seller-snapshot-list">
              <div className="seller-snapshot-item">
                <span>User ID</span>
                <strong>{settings.user.id ?? "-"}</strong>
              </div>
              <div className="seller-snapshot-item">
                <span>Seller ID</span>
                <strong>{settings.seller.id ?? "-"}</strong>
              </div>
              <div className="seller-snapshot-item">
                <span>Account Created</span>
                <strong>
                  {settings.user.createdAt ? dateFormatter.format(new Date(settings.user.createdAt)) : "-"}
                </strong>
              </div>
              <div className="seller-snapshot-item">
                <span>Seller Profile Created</span>
                <strong>
                  {settings.seller.createdAt ? dateFormatter.format(new Date(settings.seller.createdAt)) : "-"}
                </strong>
              </div>
              <div className="seller-snapshot-item">
                <span>Current Status</span>
                <strong className="seller-status-text">{settings.seller.status || "pending"}</strong>
              </div>
            </div>
          </article>

          <article className="seller-panel">
            <div className="seller-panel-header seller-panel-header--stack">
              <div>
                <h2>Field Mapping</h2>
                <p>What this page edits in the database.</p>
              </div>
            </div>

            <div className="seller-settings-mapping">
              {mappingRows.map((row) => (
                <div key={row.description} className="seller-settings-mapping__item">
                  {row.icon}
                  <div>
                    <strong>{row.field}</strong>
                    <span>{row.description}</span>
                    <span><strong>Current value:</strong> {row.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
