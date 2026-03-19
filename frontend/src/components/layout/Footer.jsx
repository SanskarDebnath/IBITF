import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Shield,
  Truck,
  CreditCard,
  Leaf
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { label: "Our Story", path: "/about" },
      { label: "Meet the Artisans", path: "/artisans" },
      { label: "Sustainability", path: "/sustainability" },
      { label: "Press & Media", path: "/press" },
      { label: "Careers", path: "/careers" }
    ],
    shop: [
      { label: "All Products", path: "/products" },
      { label: "Best Sellers", path: "/products?sort=best-selling" },
      { label: "New Arrivals", path: "/products?sort=newest" },
      { label: "Gift Collections", path: "/products?category=gifts" },
      { label: "Sale", path: "/products?price=0-1000&sort=price-asc" }
    ],
    help: [
      { label: "FAQ", path: "/faq" },
      { label: "Shipping Info", path: "/shipping" },
      { label: "Returns & Exchanges", path: "/returns" },
      { label: "Size Guide", path: "/size-guide" },
      { label: "Contact Support", path: "/contact" }
    ],
    policy: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Cookie Policy", path: "/cookies" },
      { label: "Accessibility", path: "/accessibility" }
    ]
  };

  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", url: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", url: "#" },
    { icon: <Twitter size={20} />, label: "Twitter", url: "#" },
    { icon: <Youtube size={20} />, label: "YouTube", url: "#" }
  ];

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-text">Tripureswari</span>
              <span className="logo-tagline">Sustainable Handcrafts</span>
            </div>
            <p className="brand-description">
              A marketplace for authentic bamboo and wooden handicrafts, connecting you with
              skilled artisans and sustainable products.
            </p>

            <div className="newsletter">
              <h4 className="newsletter-title">Join Our Newsletter</h4>
              <p className="newsletter-subtitle">Get updates on new products and exclusive offers</p>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-button">
                  Subscribe
                </button>
              </form>
            </div>

            <div className="social-links">
              <h4 className="social-title">Follow Us</h4>
              <div className="social-icons">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    className="social-icon"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-links">
            <div className="links-section">
              <h4 className="links-title">Shop</h4>
              <ul className="links-list">
                {footerLinks.shop.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="links-section">
              <h4 className="links-title">About</h4>
              <ul className="links-list">
                {footerLinks.about.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="links-section">
              <h4 className="links-title">Help</h4>
              <ul className="links-list">
                {footerLinks.help.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="links-section">
              <h4 className="links-title">Legal</h4>
              <ul className="links-list">
                {footerLinks.policy.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-contact">
            <div className="contact-section">
              <h4 className="contact-title">
                <Mail size={18} />
                Contact Us
              </h4>
              <div className="contact-info">
                <a href="mailto:support@tripureswari.com" className="contact-link">
                  support@tripureswari.com
                </a>
                <a href="tel:+911234567890" className="contact-link">
                  +91 123 456 7890
                </a>
              </div>
            </div>

            <div className="contact-section">
              <h4 className="contact-title">
                <MapPin size={18} />
                Office Address
              </h4>
              <address className="contact-address">
                Agartala, Tripura
                <br />
                India
              </address>
            </div>

            <div className="payment-methods">
              <h4 className="payment-title">We Accept</h4>
              <div className="payment-icons">
                <span className="payment-icon">
                  <CreditCard size={22} />
                </span>
                <span className="payment-icon">
                  <Shield size={22} />
                </span>
                <span className="payment-icon">
                  <Truck size={22} />
                </span>
                <span className="payment-icon">
                  <Leaf size={22} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="bottom-container">
          <div className="copyright">
            © {currentYear} Tripureswari Marketplace. All rights reserved.
          </div>

          <div className="bottom-links">
            <Link to="/sitemap" className="bottom-link">Sitemap</Link>
            <Link to="/affiliate" className="bottom-link">Affiliate Program</Link>
            <Link to="/auth/signup?role=seller" className="bottom-link">Become a Seller</Link>
            <Link to="/wholesale" className="bottom-link">Wholesale Inquiries</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
