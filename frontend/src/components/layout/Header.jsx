import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";
import { useWeb3 } from "../../app/providers/useWeb3";
import { getExplorerAddressUrl, shortenAddress } from "../../config/web3";
import {
  BarChart3,
  Blocks,
  CirclePlus,
  FolderPlus,
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
  Leaf,
  Wallet,
  ExternalLink
} from "lucide-react";
import { NON_COMMERCIAL_DISCLAIMER } from "../../config/commerce";
import "./Header.css";

export default function Header() {
  const { isAuthenticated, role, loginAsBuyer, loginAsSeller, logout } = useAuth();
  const { items } = useCart();
  const { showToast } = useToast();
  const {
    account: connectedAccount,
    chainConfig,
    chainId,
    connectMetaMask,
    connectWalletConnect,
    disconnectWallet,
    isConnected: isWalletConnected,
    status: walletStatus,
    walletConnectEnabled
  } = useWeb3();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSellerAddMenu, setShowSellerAddMenu] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const walletDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const isSellerPortal = isAuthenticated && role === "seller" && location.pathname.startsWith("/seller");
  const explorerAddressUrl = getExplorerAddressUrl(chainId, connectedAccount);

  // Calculate total items in cart
  const cartItemCount = items.reduce((total, item) => total + (item.qty || item.quantity || 0), 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
        setShowSellerAddMenu(false);
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target)) {
        setShowWalletDropdown(false);
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
    setShowWalletDropdown(false);
    setShowMobileMenu(false);
  }, [location.pathname, location.hash]);

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
    { icon: <Blocks size={18} />, label: "Web3", path: "/web3" },
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
    setShowWalletDropdown(false);
    setShowMobileMenu(false);
    navigate("/auth/login");
  };

  const handleWalletAction = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) {
        showToast(successMessage, "success");
      }
    } catch (error) {
      showToast(error?.message || "Wallet action failed.", "error");
    } finally {
      setShowWalletDropdown(false);
    }
  };

  const walletMenu = (
    <div className="wallet-menu" ref={walletDropdownRef}>
      <button
        type="button"
        className={`wallet-trigger${showWalletDropdown ? " open" : ""}${isWalletConnected ? " connected" : ""}`}
        onClick={() => setShowWalletDropdown((prev) => !prev)}
        aria-expanded={showWalletDropdown}
        aria-haspopup="menu"
      >
        <span className="wallet-trigger__icon">
          <Wallet size={18} />
        </span>
        <span className="wallet-trigger__copy">
          <strong>{isWalletConnected ? shortenAddress(connectedAccount, 6, 4) : "Wallet"}</strong>
          <small>{isWalletConnected ? chainConfig.shortName : "MetaMask / WalletConnect"}</small>
        </span>
        <ChevronDown size={16} className={`dropdown-arrow ${showWalletDropdown ? "open" : ""}`} />
      </button>

      {showWalletDropdown && (
        <div className="wallet-dropdown" role="menu">
          <Link
            to="/web3"
            className="wallet-dropdown__hub"
            onClick={() => setShowWalletDropdown(false)}
          >
            <span className="wallet-dropdown__hub-icon">
              <Blocks size={18} />
            </span>
            <span className="wallet-dropdown__hub-copy">
              <strong>Open Web3 Hub</strong>
              <small>Contracts, activity feed, explorer links</small>
            </span>
          </Link>

          {!isWalletConnected ? (
            <>
              <button
                type="button"
                className="wallet-dropdown__action wallet-dropdown__action--primary"
                onClick={() =>
                  handleWalletAction(connectMetaMask, "MetaMask connected.")
                }
                disabled={walletStatus === "connecting"}
              >
                <Wallet size={18} />
                <span>{walletStatus === "connecting" ? "Connecting..." : "Connect MetaMask"}</span>
              </button>
              <button
                type="button"
                className="wallet-dropdown__action"
                onClick={() =>
                  handleWalletAction(connectWalletConnect, "WalletConnect session opened.")
                }
                disabled={walletStatus === "connecting" || !walletConnectEnabled}
              >
                <Blocks size={18} />
                <span>{walletConnectEnabled ? "WalletConnect" : "WalletConnect needs project ID"}</span>
              </button>
            </>
          ) : (
            <>
              <div className="wallet-dropdown__summary">
                <div>
                  <span>Connected wallet</span>
                  <strong>{shortenAddress(connectedAccount, 8, 6)}</strong>
                </div>
                <div>
                  <span>Network</span>
                  <strong>{chainConfig.name}</strong>
                </div>
              </div>

              {explorerAddressUrl && (
                <a
                  href={explorerAddressUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="wallet-dropdown__explorer"
                >
                  <span>View on {chainConfig.explorerName}</span>
                  <ExternalLink size={16} />
                </a>
              )}

              <button
                type="button"
                className="wallet-dropdown__action wallet-dropdown__action--danger"
                onClick={() =>
                  handleWalletAction(disconnectWallet, "Wallet disconnected.")
                }
              >
                <Wallet size={18} />
                <span>Disconnect wallet</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

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
              <Link to="/" className="seller-portal-home">
                <Home size={18} />
                <span>Home</span>
              </Link>

              {walletMenu}

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
        <div className="seller-portal-disclaimer">{NON_COMMERCIAL_DISCLAIMER}</div>

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
            <Link
              to="/web3"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <Blocks size={18} />
              <span>Web3 Hub</span>
            </Link>

            <Link
              to="/"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

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
            <div className="mobile-wallet-panel">
              <div className="mobile-wallet-panel__header">
                <Wallet size={18} />
                <span>{isWalletConnected ? shortenAddress(connectedAccount, 8, 6) : "Wallet access"}</span>
              </div>
              <p>{isWalletConnected ? chainConfig.name : "Connect MetaMask or WalletConnect from the Web3 hub."}</p>
              <Link
                to="/web3"
                className="mobile-wallet-panel__link"
                onClick={() => setShowMobileMenu(false)}
              >
                Open Web3 Hub
              </Link>
            </div>

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

          {/* Right Side Actions */}
          <div className="actions buyer-actions">
            {walletMenu}

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
          <div className="mobile-wallet-panel buyer-mobile-wallet-panel">
            <div className="mobile-wallet-panel__header">
              <Wallet size={18} />
              <span>{isWalletConnected ? shortenAddress(connectedAccount, 8, 6) : "Wallet access"}</span>
            </div>
            <p>{isWalletConnected ? `${chainConfig.name} connected` : "Connect MetaMask or WalletConnect from the Web3 hub."}</p>
            <Link
              to="/web3"
              className="mobile-wallet-panel__link"
              onClick={() => setShowMobileMenu(false)}
            >
              Open Web3 Hub
            </Link>
          </div>

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
