import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useCart } from "../../app/providers/CartProvider";
import {
  BarChart3,
  CirclePlus,
  FolderPlus,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Package,
  PackagePlus,
  ReceiptText,
  Store,
  Menu,
  X,
  ChevronDown,
  Heart,
  TrendingUp,
  Home,
  Info,
  Mail,
  Leaf
} from "lucide-react";
import "./Header.css";

export default function Header() {
  const { isAuthenticated, role, loginAsBuyer, loginAsSeller, logout } = useAuth();
  const { items } = useCart();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSellerAddMenu, setShowSellerAddMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const isSellerPortal = isAuthenticated && role === "seller" && location.pathname.startsWith("/seller");

  // Calculate total items in cart
  const cartItemCount = items.reduce((total, item) => total + (item.qty || item.quantity || 0), 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
        setShowSellerAddMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-toggle')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowAccountDropdown(false);
    setShowSellerAddMenu(false);
    setShowMobileMenu(false);
  }, [location.pathname, location.hash]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileMenu(false);
    }
  };

  const handleQuickLogin = (type) => {
    if (type === 'buyer') {
      loginAsBuyer();
    } else {
      loginAsSeller();
    }
    setShowMobileMenu(false);
  };

  const userMenuItems = [
    {
      icon: <Settings size={18} />,
      label: "Settings",
      description: "Profile, addresses, and account preferences",
      path: "/account/profile"
    },
    {
      icon: <Package size={18} />,
      label: "My Orders",
      description: "View details, invoices, and delivery updates",
      path: "/account/orders"
    },
    {
      icon: <Heart size={18} />,
      label: "Wishlist",
      description: "Saved items you want to revisit later",
      path: "/account/wishlist"
    },
  ];

  const navigationItems = [
    { icon: <Home size={18} />, label: "Home", path: "/" },
    { icon: <Package size={18} />, label: "Products", path: "/products" },
    { icon: <Info size={18} />, label: "About", path: "/about" },
    { icon: <Mail size={18} />, label: "Contact", path: "/contact" },
  ];

  const buyerNavigationItems = navigationItems.map((item) => ({
    ...item,
    isActive:
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  }));

  const sellerPortalItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      path: "/seller/dashboard",
      isActive: location.pathname === "/seller/dashboard" && location.hash !== "#seller-kpis"
    },
    {
      icon: <BarChart3 size={18} />,
      label: "KPI",
      path: "/seller/kpis",
      isActive: location.pathname === "/seller/kpis"
    },
    {
      icon: <ReceiptText size={18} />,
      label: "Orders",
      path: "/seller/orders",
      isActive: location.pathname === "/seller/orders"
    },
    {
      icon: <Settings size={18} />,
      label: "Settings",
      path: "/seller/settings",
      isActive: location.pathname === "/seller/settings"
    }
  ];

  const handleLogout = () => {
    logout();
    setShowAccountDropdown(false);
    setShowSellerAddMenu(false);
    setShowMobileMenu(false);
    navigate("/auth/login");
  };

  if (isSellerPortal) {
    return (
      <>
        <header className="header seller-portal-header">
          <div className="header-container seller-portal-header__container">
            <Link to="/seller/dashboard" className="logo seller-portal-logo">
              <div className="logo-text">
                <span className="logo-primary">Tripureswari</span>
                <span className="seller-portal-label">Seller Portal</span>
              </div>
            </Link>

            <nav className="desktop-nav seller-portal-nav">
              {sellerPortalItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`seller-portal-nav__link${item.isActive ? " active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="seller-portal-actions">
              <div className="seller-portal-add-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className={`seller-portal-add${showSellerAddMenu ? " open" : ""}`}
                  onClick={() => setShowSellerAddMenu((prev) => !prev)}
                >
                  <CirclePlus size={18} />
                  <span>Add</span>
                  <ChevronDown size={16} className={`dropdown-arrow ${showSellerAddMenu ? "open" : ""}`} />
                </button>

                {showSellerAddMenu && (
                  <div className="seller-portal-add-menu">
                    <Link
                      to="/seller/products/new"
                      className="seller-portal-add-item"
                      onClick={() => setShowSellerAddMenu(false)}
                    >
                      <PackagePlus size={18} />
                      <span>Add Product</span>
                    </Link>
                    <Link
                      to="/seller/categories/new"
                      className="seller-portal-add-item"
                      onClick={() => setShowSellerAddMenu(false)}
                    >
                      <FolderPlus size={18} />
                      <span>Add Category</span>
                    </Link>
                  </div>
                )}
              </div>

              <button type="button" className="seller-portal-logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>

              <button
                className="mobile-menu-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </header>

        <div
          ref={mobileMenuRef}
          className={`mobile-menu seller-mobile-menu ${showMobileMenu ? "open" : ""}`}
        >
          <div className="mobile-menu-header">
            <div className="mobile-menu-logo">
              <Store size={20} />
              <div className="seller-mobile-menu__title">
                <span>Tripureswari</span>
                <small>Seller Portal</small>
              </div>
            </div>
            <button
              className="mobile-menu-close"
              onClick={() => setShowMobileMenu(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="mobile-nav seller-mobile-nav">
            {sellerPortalItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`mobile-nav-link${item.isActive ? " active" : ""}`}
                onClick={() => setShowMobileMenu(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="seller-mobile-section-label">Add</div>

            <Link
              to="/seller/products/new"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <PackagePlus size={18} />
              <span>Add Product</span>
            </Link>
            <Link
              to="/seller/categories/new"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <FolderPlus size={18} />
              <span>Add Category</span>
            </Link>
          </nav>

          <div className="mobile-auth-section seller-mobile-actions">
            <button
              onClick={handleLogout}
              className="mobile-logout-button seller-mobile-logout"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </>
    );
  }

  return (
      <>
      <header className="header buyer-header">
        <div className="header-container buyer-header__container">
          {/* Logo */}
          <Link to="/" className="logo buyer-logo">
            <div className="buyer-logo-mark">
              <Leaf size={18} />
            </div>
            <div className="logo-text buyer-logo-text">
              <span className="logo-primary buyer-logo-primary">Tripureswari</span>
              <span className="buyer-logo-tagline">Craft Marketplace</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="desktop-nav buyer-desktop-nav">
            {buyerNavigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link buyer-nav-link${item.isActive ? " active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {isAuthenticated && role === "seller" && (
              <Link to="/seller/dashboard" className="seller-link buyer-seller-link">
                <Store size={18} />
                <span>Seller Portal</span>
                <TrendingUp size={14} className="trending-icon" />
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="search-container buyer-search-container">
            <form onSubmit={handleSearch} className="search-form buyer-search-form">
              <div className="search-input-wrapper buyer-search-input-wrapper">
                <button
                  type="submit"
                  className="buyer-search-submit"
                  aria-label="Search"
                >
                  <Search size={18} className="search-icon" />
                </button>
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input buyer-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
             
          </div>

          {/* Right Side Actions */}
          <div className="actions buyer-actions">
            {/* Cart */}
            <Link to="/cart" className="cart-action buyer-cart-action">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <div className="cart-badge">{cartItemCount > 99 ? '99+' : cartItemCount}</div>
                )}
              </div>
              <span className="cart-text">Cart</span>
            </Link>

            {/* Auth Section */}
            <div className="auth-section" ref={dropdownRef}>
              {!isAuthenticated ? (
                <div className="auth-buttons buyer-auth-buttons">
                  <Link to="/auth/login" className="login-button buyer-login-button">
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                  <Link to="/auth/signup" className="signup-button buyer-signup-button">
                    <span>Sign Up</span>
                  </Link>

                  {/* Demo buttons */}

                </div>
              ) : (
                <div className="user-menu-wrapper">
                  <button
                    className={`user-menu-trigger buyer-user-menu-trigger${showAccountDropdown ? " open" : ""}`}
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    aria-expanded={showAccountDropdown}
                    aria-haspopup="menu"
                  >
                    <div className="user-avatar">
                      <User size={20} />
                    </div>
                    <div className="user-info">
                      <div className="user-role">{role === "seller" ? "Seller" : "Buyer"}</div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`dropdown-arrow ${showAccountDropdown ? 'open' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showAccountDropdown && (
                    <div className="dropdown-menu buyer-dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">
                          <User size={24} />
                        </div>
                      <div className="dropdown-user-info">
                        <div className="buyer-dropdown-kicker">Account Menu</div>
                        <div className="dropdown-name">
                          {role === 'seller' ? 'Seller Account' : 'Buyer Account'}
                        </div>
                        <div className="dropdown-email">
                          {role === 'seller' ? 'Manage your store and buyer profile' : 'Orders, wishlist, and profile shortcuts'}
                        </div>
                      </div>
                    </div>

                      <div className="buyer-dropdown-section-title">Quick access</div>
                      <div className="dropdown-items">
                        {userMenuItems.map((item, index) => (
                          <Link
                            key={index}
                            to={item.path}
                            className="dropdown-item buyer-dropdown-item"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <span className="buyer-dropdown-icon">{item.icon}</span>
                            <span className="buyer-dropdown-copy">
                              <span className="buyer-dropdown-label">{item.label}</span>
                              <span className="buyer-dropdown-description">{item.description}</span>
                            </span>
                          </Link>
                        ))}

                        {role === "seller" && (
                          <Link
                            to="/seller/dashboard"
                            className="dropdown-item buyer-dropdown-item seller-item"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <span className="buyer-dropdown-icon">
                              <Store size={18} />
                            </span>
                            <span className="buyer-dropdown-copy">
                              <span className="buyer-dropdown-label">Seller Dashboard</span>
                              <span className="buyer-dropdown-description">Switch to your store workspace</span>
                            </span>
                          </Link>
                        )}
                      </div>

                      <div className="dropdown-divider"></div>

                      <button
                        onClick={() => {
                          handleLogout();
                        }}
                        className="logout-button buyer-logout-button"
                      >
                        <span className="buyer-dropdown-icon buyer-dropdown-icon--logout">
                          <LogOut size={18} />
                        </span>
                        <span className="buyer-dropdown-copy">
                          <span className="buyer-dropdown-label">Logout</span>
                          <span className="buyer-dropdown-description">Sign out from this account</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle buyer-mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`mobile-menu buyer-mobile-menu ${showMobileMenu ? 'open' : ''}`}
      >
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <div className="buyer-logo-mark buyer-logo-mark--mobile">
              <Leaf size={16} />
            </div>
            <div className="buyer-mobile-menu__title">
              <span>Tripureswari</span>
              <small>Buyer End</small>
            </div>
          </div>
          <button
            className="mobile-menu-close"
            onClick={() => setShowMobileMenu(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mobile-menu-search buyer-mobile-menu-search">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <div className="mobile-search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
            </div>
          </form>
        </div>

        <nav className="mobile-nav buyer-mobile-nav">
          {buyerNavigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link buyer-mobile-nav-link${item.isActive ? " active" : ""}`}
              onClick={() => setShowMobileMenu(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          <Link
            to="/cart"
            className="mobile-nav-link buyer-mobile-nav-link cart-link"
            onClick={() => setShowMobileMenu(false)}
          >
            <div className="mobile-cart-icon">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <div className="mobile-cart-badge">{cartItemCount}</div>
              )}
            </div>
            <span>Cart ({cartItemCount})</span>
          </Link>

          {isAuthenticated && role === "seller" && (
            <Link
              to="/seller/dashboard"
              className="mobile-nav-link buyer-mobile-nav-link seller-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <Store size={20} />
              <span>Seller Portal</span>
            </Link>
          )}
        </nav>

        <div className="mobile-auth-section buyer-mobile-auth-section">
          {!isAuthenticated ? (
            <>
              <div className="mobile-auth-buttons">
                <Link
                  to="/auth/login"
                  className="mobile-login-button buyer-mobile-login-button"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User size={20} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/auth/signup"
                  className="mobile-signup-button buyer-mobile-signup-button"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>Sign Up</span>
                </Link>
              </div>

              <div className="mobile-demo-buttons">
                <p className="demo-label">Quick Demo:</p>
                <div className="demo-buttons-row">
                  <button
                    onClick={() => handleQuickLogin('buyer')}
                    className="mobile-demo-button buyer-demo"
                  >
                    Try as Buyer
                  </button>
                  <button
                    onClick={() => handleQuickLogin('seller')}
                    className="mobile-demo-button seller-demo"
                  >
                    Try as Seller
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mobile-user-info buyer-mobile-user-info">
                <div className="mobile-user-avatar">
                  <User size={24} />
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">
                    {role === 'seller' ? 'Seller Account' : 'My Account'}
                  </div>
                  <div className="mobile-user-role">{role}</div>
                </div>
              </div>

              <div className="mobile-user-menu">
                {userMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="mobile-menu-item buyer-mobile-menu-item"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                {role === "seller" && (
                  <Link
                    to="/seller/dashboard"
                    className="mobile-menu-item buyer-mobile-menu-item"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Store size={20} />
                    <span>Seller Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="mobile-logout-button buyer-mobile-logout"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {showMobileMenu && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
}
