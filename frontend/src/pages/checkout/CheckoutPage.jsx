import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { checkout as checkoutOrder } from "../../services/ordersService";
import {
  ArrowLeft,
  CreditCard,
  Package,
  User,
  MapPin,
  Shield,
  Lock,
  Truck,
  CheckCircle,
  ShoppingBag,
  AlertCircle,
  Smartphone,
  Wallet
} from "lucide-react";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { items, total, clearCart, reloadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(isAuthenticated ? 2 : 1); // Skip to payment if logged in
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // Default to card
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    upiId: "",
    saveInfo: false
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: "Shipping", icon: MapPin },
    { id: 2, title: "Payment", icon: CreditCard },
    { id: 3, title: "Review", icon: CheckCircle }
  ];

  const shippingOptions = [
    { id: "standard", name: "Standard Shipping", cost: 49, delivery: "5-7 business days" },
    { id: "express", name: "Express Shipping", cost: 149, delivery: "2-3 business days" },
    { id: "nextDay", name: "Next Day Delivery", cost: 299, delivery: "Next business day" }
  ];

  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }

  }, [items, navigate, orderPlaced]);

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
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1 && !isAuthenticated) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    }

    if (step === 2) {
      if (paymentMethod === "card") {
        if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
        else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = "Card number must be 16 digits";
        if (!formData.cardName.trim()) newErrors.cardName = "Name on card is required";
        if (!formData.expiry.trim()) newErrors.expiry = "Expiry date is required";
        else if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = "Use MM/YY format";
        if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
        else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = "CVV must be 3-4 digits";
      } else if (paymentMethod === "upi") {
        if (!formData.upiId.trim()) newErrors.upiId = "UPI ID is required";
        else if (!/[\w\.\-_]{3,}@[\w]{3,}/.test(formData.upiId)) newErrors.upiId = "Invalid UPI ID format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (isAuthenticated && currentStep === 1) {
        // Skip shipping step if logged in
        setCurrentStep(3);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 3));
      }
    }
  };

  const handlePrevStep = () => {
    if (isAuthenticated && currentStep === 3) {
      // Go back to payment step if logged in (skip shipping)
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const placeOrder = async () => {
    if (!validateStep(3)) return;

    setIsProcessing(true);
    try {
      await checkoutOrder({
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod
      });

      setOrderPlaced(true);
      clearCart();
      await reloadCart();

      setTimeout(() => {
        navigate("/checkout/success");
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 5);
  };

  const calculateTotal = () => {
    const subtotal = total;
    const shipping = selectedShipping.cost;
    const tax = subtotal * 0.18;
    return subtotal + shipping + tax;
  };

  const renderPaymentMethodForm = () => {
    switch (paymentMethod) {
      case "card":
        return (
          <>
            <div className="form-group">
              <label>Card Number *</label>
              <div className="card-input-wrapper">
                <CreditCard size={20} className="card-icon" />
                <input
                  type="text"
                  name="cardNumber"
                  value={formatCardNumber(formData.cardNumber)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (value.length <= 16) {
                      handleInputChange({
                        ...e,
                        target: { ...e.target, name: 'cardNumber', value: value }
                      });
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={errors.cardNumber ? 'error' : ''}
                />
              </div>
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>

            <div className="form-group">
              <label>Name on Card *</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="Enter name as on card"
                className={errors.cardName ? 'error' : ''}
              />
              {errors.cardName && <span className="error-message">{errors.cardName}</span>}
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="text"
                  name="expiry"
                  value={formatExpiry(formData.expiry)}
                  onChange={(e) => {
                    handleInputChange({
                      ...e,
                      target: { ...e.target, name: 'expiry', value: e.target.value }
                    });
                  }}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={errors.expiry ? 'error' : ''}
                />
                {errors.expiry && <span className="error-message">{errors.expiry}</span>}
              </div>

              <div className="form-group">
                <label>CVV *</label>
                <div className="cvv-input-wrapper">
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className={errors.cvv ? 'error' : ''}
                  />
                  <Shield size={16} className="cvv-icon" />
                </div>
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleInputChange}
                />
                <span>Save card information for future purchases</span>
              </label>
            </div>
          </>
        );

      case "upi":
        return (
          <>
            <div className="form-group">
              <label>UPI ID *</label>
              <div className="card-input-wrapper">
                <Smartphone size={20} className="card-icon" />
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="yourname@upi"
                  className={errors.upiId ? 'error' : ''}
                />
              </div>
              {errors.upiId && <span className="error-message">{errors.upiId}</span>}
              <p className="upi-hint">Enter your UPI ID (e.g., username@okicici, username@oksbi)</p>
            </div>

            <div className="upi-methods">
              <p className="upi-subtitle">Popular UPI Apps:</p>
              <div className="upi-apps">
                <div className="upi-app">Google Pay</div>
                <div className="upi-app">PhonePe</div>
                <div className="upi-app">Paytm</div>
                <div className="upi-app">Amazon Pay</div>
              </div>
            </div>
          </>
        );

      case "cod":
        return (
          <div className="cod-info">
            <div className="cod-icon">
              <Wallet size={48} />
            </div>
            <h3>Cash on Delivery</h3>
            <p className="cod-description">
              Pay with cash when your order is delivered. An extra ₹50 cash handling fee will be added to your order.
            </p>
            <div className="cod-features">
              <div className="cod-feature">
                <CheckCircle size={18} />
                <span>No online payment required</span>
              </div>
              <div className="cod-feature">
                <CheckCircle size={18} />
                <span>Pay when you receive the order</span>
              </div>
              <div className="cod-feature">
                <CheckCircle size={18} />
                <span>Contactless delivery available</span>
              </div>
            </div>
            <div className="cod-note">
              <AlertCircle size={16} />
              <span>You need to have exact change ready for the delivery agent</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="success-animation">
          <CheckCircle size={80} />
        </div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been confirmed and is being processed.</p>
        <p>Redirecting to order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Progress Steps */}
      <div className="checkout-progress">
        {steps.map((step, index) => (
          <div key={step.id} className="progress-step">
            <div className={`step-indicator ${currentStep >= step.id ? 'active' : ''} ${isAuthenticated && step.id === 1 ? 'skipped' : ''}`}>
              {isAuthenticated && step.id === 1 ? <CheckCircle size={20} /> : <step.icon size={20} />}
            </div>
            <span className="step-title">{step.title}</span>
            {index < steps.length - 1 && (
              <div className="step-connector"></div>
            )}
          </div>
        ))}
      </div>

      {isAuthenticated && currentStep === 1 && (
        <div className="logged-in-skip">
          <CheckCircle size={24} />
          <div>
            <h3>Shipping information loaded from your profile</h3>
            <p>Using your saved address for delivery</p>
          </div>
          <button className="btn-primary" onClick={() => setCurrentStep(2)}>
            Continue to Payment
          </button>
        </div>
      )}

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Step 1: Shipping Information (only for non-logged in users) */}
          {currentStep === 1 && !isAuthenticated && (
            <div className="checkout-step">
              <div className="step-header">
                <MapPin size={24} />
                <h2>Shipping Information</h2>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP code"
                    className={errors.zipCode ? 'error' : ''}
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <div className="checkout-step">
              <div className="step-header">
                <CreditCard size={24} />
                <h2>Payment Details</h2>
              </div>

              <div className="payment-methods">
                <div
                  className={`payment-method ${paymentMethod === "card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard size={20} />
                  <span>Credit/Debit Card</span>
                </div>
                <div
                  className={`payment-method ${paymentMethod === "upi" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <Smartphone size={20} />
                  <span>UPI</span>
                </div>
                <div
                  className={`payment-method ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <Wallet size={20} />
                  <span>Cash on Delivery</span>
                </div>
              </div>

              {renderPaymentMethodForm()}

              {paymentMethod !== "cod" && (
                <div className="security-note">
                  <Lock size={16} />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <div className="checkout-step">
              <div className="step-header">
                <CheckCircle size={24} />
                <h2>Review Your Order</h2>
              </div>

              <div className="order-review-section">
                <div className="review-section">
                  <h3>
                    <User size={20} />
                    Contact Information
                  </h3>
                  <p>{formData.firstName} {formData.lastName}</p>
                  <p>{formData.email}</p>
                  <p>{formData.phone}</p>
                </div>

                <div className="review-section">
                  <h3>
                    <MapPin size={20} />
                    Shipping Address
                  </h3>
                  <p>{formData.address}</p>
                  <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                  <p>{formData.country}</p>
                </div>

                <div className="review-section">
                  <h3>
                    {paymentMethod === "card" && <CreditCard size={20} />}
                    {paymentMethod === "upi" && <Smartphone size={20} />}
                    {paymentMethod === "cod" && <Wallet size={20} />}
                    Payment Method
                  </h3>
                  {paymentMethod === "card" && (
                    <>
                      <p>Card ending in {formData.cardNumber.slice(-4)}</p>
                      <p>{formData.cardName}</p>
                      <p>Expires {formData.expiry}</p>
                    </>
                  )}
                  {paymentMethod === "upi" && (
                    <p>UPI ID: {formData.upiId}</p>
                  )}
                  {paymentMethod === "cod" && (
                    <p>Cash on Delivery</p>
                  )}
                </div>
              </div>

              <div className="shipping-options">
                <h3>Shipping Method</h3>
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`shipping-option ${selectedShipping.id === option.id ? 'selected' : ''}`}
                    onClick={() => setSelectedShipping(option)}
                  >
                    <div className="shipping-option-content">
                      <div className="shipping-option-name">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping.id === option.id}
                          onChange={() => setSelectedShipping(option)}
                        />
                        <span>{option.name}</span>
                      </div>
                      <div className="shipping-option-details">
                        <span className="delivery-time">{option.delivery}</span>
                        <span className="shipping-cost">₹{option.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="terms-section">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>
                    I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="step-navigation">
            {currentStep > 1 && (
              <button className="btn-secondary" onClick={handlePrevStep}>
                <ArrowLeft size={18} />
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button className="btn-primary" onClick={handleNextStep}>
                Continue to {currentStep === 1 ? 'Payment' : 'Review'}
              </button>
            ) : (
              <button
                className="btn-primary place-order-btn"
                onClick={placeOrder}
                disabled={isProcessing || items.length === 0}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {paymentMethod === "cod" ? (
                      `Place Order (Pay on Delivery)`
                    ) : (
                      `Place Order & Pay ₹${calculateTotal().toFixed(2)}`
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary">
          <div className="summary-header">
            <ShoppingBag size={24} />
            <h2>Order Summary</h2>
          </div>

          <div className="order-items">
            <h3>Items ({items.length})</h3>
            <div className="items-list">
              {items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <div className="image-placeholder">
                      {item.name.charAt(0)}
                    </div>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <div className="item-price">
                      ₹{item.price} × {item.qty}
                    </div>
                  </div>
                  <div className="item-total">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-breakdown">
            <div className="breakdown-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Shipping</span>
              <span>₹{selectedShipping.cost.toFixed(2)}</span>
            </div>
            {paymentMethod === "cod" && (
              <div className="breakdown-row">
                <span>Cash Handling Fee</span>
                <span>₹50.00</span>
              </div>
            )}
            <div className="breakdown-row">
              <span>Tax (18%)</span>
              <span>₹{(total * 0.18).toFixed(2)}</span>
            </div>
            <div className="breakdown-divider"></div>
            <div className="breakdown-row total-row">
              <span><strong>Total</strong></span>
              <span className="total-amount">
                ₹{(calculateTotal() + (paymentMethod === "cod" ? 50 : 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="secure-checkout-badge">
            <Shield size={20} />
            <div>
              <span>Secure Checkout</span>
              <small>SSL Encrypted • 100% Safe</small>
            </div>
          </div>

          <div className="support-note">
            <AlertCircle size={16} />
            <span>
              Need help? <a href="/contact">Contact Support</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
