import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardSeller } from "../../services/sellerService";
import "./SellerForms.css";

export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: "",
    phone: "",
    address: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await onboardSeller(formData);
      setMessage("Seller profile created");
      setTimeout(() => navigate("/seller/products"), 800);
    } catch (err) {
      setError(err.message || "Onboarding failed");
    }
  };

  return (
    <div className="seller-form-page">
      <div className="seller-form-header">
        <div>
          <h1>Seller Onboarding</h1>
          <p>Create your shop profile to start listing products.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="seller-form">
        <label>
          Shop Name
          <input name="shopName" value={formData.shopName} onChange={handleChange} required />
        </label>
        <div className="seller-form-grid">
          <label>
            Phone
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </label>
          <label>
            Address
            <input name="address" value={formData.address} onChange={handleChange} />
          </label>
        </div>
        {error && <div className="seller-alert error">{error}</div>}
        {message && <div className="seller-alert success">{message}</div>}
        <div className="seller-form-actions">
          <button type="button" className="seller-secondary-btn" onClick={() => navigate("/")}>Cancel</button>
          <button type="submit" className="seller-primary-btn">Create Seller Profile</button>
        </div>
      </form>
    </div>
  );
}
