import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Shield,
  Smartphone,
  CreditCard,
  Package,
  Truck,
  Heart
} from "lucide-react";
import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const initialRole = searchParams.get("role") === "seller" ? "seller" : "buyer";
  const [signupMethod, setSignupMethod] = useState("email"); // "email" or "phone"
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: initialRole,
    acceptTerms: false,
    marketingConsent: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: false },
    { label: "Contains uppercase letter", met: false },
    { label: "Contains lowercase letter", met: false },
    { label: "Contains number", met: false },
    { label: "Contains special character", met: false }
  ];

  const checkPasswordStrength = (password) => {
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];

    const metCount = requirements.filter(Boolean).length;
    let strength = "weak";
    let color = "#ef4444";

    if (metCount >= 4) {
      strength = "strong";
      color = "#10b981";
    } else if (metCount >= 3) {
      strength = "medium";
      color = "#f59e0b";
    }

    return { strength, color, metCount, total: 5 };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    const newErrors = {};

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      if (!newErrors.password) newErrors.password = "Include an uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      if (!newErrors.password) newErrors.password = "Include a lowercase letter";
    }
    if (!/\d/.test(password)) {
      if (!newErrors.password) newErrors.password = "Include a number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      if (!newErrors.password) newErrors.password = "Include a special character";
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (signupMethod === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Please fix password requirements";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };
      const result = await register(payload);
      navigate("/auth/verify-otp", {
        state: {
          identifier: formData.email,
          method: "email",
          otp: result?.otp || ""
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const features = [
    { icon: <Package size={20} />, text: "Shop authentic handicrafts" },
    { icon: <Truck size={20} />, text: "Free shipping over ₹999" },
    { icon: <Shield size={20} />, text: "Secure payment & SSL encrypted" },
    { icon: <Heart size={20} />, text: "Support artisan communities" }
  ];

  return (
    <div className="signup-container">
      {/* Left Panel - Form */}
      <div className="signup-form-panel">
        <div className="signup-form-wrapper">
          <div className="signup-header">
            <Link to="/" className="signup-logo">
              {/* <span className="logo-text">Bamboo<span className="logo-accent">Craft</span></span> */}
            </Link>
            <h1>Sign in or create account</h1>
            <p className="signup-subtitle">Join thousands of customers discovering authentic handicrafts</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Signup Method Toggle */}
          <div className="signup-method-toggle">
            <button
              type="button"
              className={`method-btn ${signupMethod === "email" ? "active" : ""}`}
              onClick={() => setSignupMethod("email")}
            >
              <Mail size={18} />
              <span>Email</span>
            </button>
            <button
              type="button"
              className={`method-btn ${signupMethod === "phone" ? "active" : ""}`}
              onClick={() => setSignupMethod("phone")}
            >
              <Smartphone size={18} />
              <span>Phone</span>
            </button>
          </div>

          <div className="signup-method-toggle">
            <button
              type="button"
              className={`method-btn ${formData.role === "buyer" ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, role: "buyer" }))}
            >
              <User size={18} />
              <span>Buyer</span>
            </button>
            <button
              type="button"
              className={`method-btn ${formData.role === "seller" ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, role: "seller" }))}
            >
              <Package size={18} />
              <span>Seller</span>
            </button>
          </div>

            {/* Email/Phone Input */}
            {signupMethod === "email" ? (
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Phone Number
                  <span className="required">*</span>
                </label>
                <div className="phone-input-wrapper">
                  <div className="country-code">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    placeholder="1234567890"
                    maxLength="10"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Name Fields */}
            <div className="name-fields">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  First Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? "error" : ""}`}
                  placeholder="John"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Last Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? "error" : ""}`}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password
                <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {formData.password && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.metCount / passwordStrength.total) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <div className="strength-label">
                    <span>Password strength:</span>
                    <span className="strength-text" style={{ color: passwordStrength.color }}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="password-requirements">
                <h4 className="requirements-title">Password must contain:</h4>
                <ul className="requirements-list">
                  {passwordRequirements.map((req, index) => {
                    const requirements = [
                      formData.password.length >= 8,
                      /[A-Z]/.test(formData.password),
                      /[a-z]/.test(formData.password),
                      /\d/.test(formData.password),
                      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                    ];
                    const isMet = requirements[index];

                    return (
                      <li key={index} className={`requirement-item ${isMet ? "met" : ""}`}>
                        {isMet ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{req.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Confirm Password
                <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-group checkbox-group">
              <label className={`checkbox-label ${errors.acceptTerms ? "error" : ""}`}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <div className="checkbox-custom"></div>
                <span className="checkbox-text">
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and{" "}
                  <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                  <span className="required">*</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.acceptTerms}</span>
                </div>
              )}
            </div>



            {/* Submit Button */}
            <button
              type="submit"
              className="signup-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>Or continue with</span>
            </div>

            {/* Social Signup */}
            <div className="social-signup">
              <button type="button" className="social-btn google">
                <img src="https://www.google.com/favicon.ico" alt="Google" />
                <span>Google</span>
              </button>
              <button type="button" className="social-btn facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Login Link */}
            <div className="login-link">
              <span>Already have an account?</span>
              <Link to="/auth/login" className="login-link-btn">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
