import {
  Target,
  Users,
  Shield,
  Sparkles,
  TrendingUp,
  Globe,
  Heart,
  Award,
  CheckCircle,
  Store,
  ShoppingBag,
  BarChart,
  HandHeart,
  Globe2,
  ShieldCheck,
  Package,
  Truck,
  ShoppingCart,
  ArrowRight
} from "lucide-react";

import "./AboutPage.css";

export default function AboutPage() {
  const artisanBenefits = [
    { icon: HandHeart, text: "Direct partnership with fair compensation" },
    { icon: ShieldCheck, text: "Preservation of traditional craftsmanship" },
    { icon: TrendingUp, text: "Access to global marketplace" },
    { icon: Globe2, text: "Marketing and logistics support" }
  ];

  const buyerBenefits = [
    { icon: ShoppingBag, text: "Authentic Tripura handicrafts & handlooms" },
    { icon: CheckCircle, text: "Verified product authenticity" },
    { icon: Shield, text: "Secure digital payments" },
    { icon: Truck, text: "Transparent supply chain tracking" }
  ];

  const productHighlights = [
    {
      id: 1,
      name: "Tripura Silk Saree",
      category: "Handloom",
      description: "Traditional Rignai patterns with natural dyes",
      image: "https://images.unsplash.com/photo-1579273166098-d6a06630f380?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "Bamboo Craft",
      category: "Handicraft",
      description: "Sustainable bamboo furniture and decor",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w-400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Tribal Jewelry",
      category: "Handmade",
      description: "Traditional Tripura tribal silver jewelry",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Cane Products",
      category: "Handicraft",
      description: "Eco-friendly cane baskets and furniture",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"
    }
  ];

  const values = [
    {
      icon: HandHeart,
      title: "Artisan Empowerment",
      description: "Ensuring fair compensation and sustainable livelihoods for skilled artisans"
    },
    {
      icon: ShieldCheck,
      title: "Authenticity",
      description: "Preserving genuine traditional craftsmanship and techniques"
    },
    {
      icon: Globe2,
      title: "Global Reach",
      description: "Bringing Tripura's heritage to conscious buyers worldwide"
    },
    {
      icon: TrendingUp,
      title: "Sustainable Growth",
      description: "Building ethical commerce that benefits communities"
    }
  ];

  const collaborationPartners = [
    "Artisan Cooperatives",
    "Craft Communities",
    "Heritage Institutions",
    "Skill Development Centers",
    "Government Initiatives"
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Preserving Heritage,
            <span className="gradient-text"> Empowering Artisans</span>
          </h1>
          <p className="hero-subtitle">
            TRIPURESWARI CRAFT PRIVATE LIMITED brings the rich heritage of Tripura's
            handicraft and handloom products to the global marketplace through
            ethical commerce and technology.
          </p>
          <div className="video-links">
            <a href="https://youtu.be/hCI5mgwrDys" className="video-link" target="_blank" rel="noopener noreferrer">
              <div className="video-icon">▶</div>
              <span>English Introduction</span>
            </a>
            <a href="https://youtu.be/tMo-W6I4v40" className="video-link" target="_blank" rel="noopener noreferrer">
              <div className="video-icon">▶</div>
              <span>Kokborok Video</span>
            </a>
            <a href="https://youtu.be/onT1pJroBbw" className="video-link" target="_blank" rel="noopener noreferrer">
              <div className="video-icon">▶</div>
              <span>Workshop Tour</span>
            </a>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-statement">
        <div className="statement-content">
          <div className="statement-icon">
            <HandHeart size={48} />
          </div>
          <h2>Our Purpose</h2>
          <p className="statement-text">
            A purpose-driven e-commerce brand dedicated to bringing the rich heritage
            of Tripura's handicraft and handloom products to the global marketplace.
            We work directly with skilled artisans and craft communities to ensure
            authentic sourcing, fair compensation, and the preservation of traditional craftsmanship.
          </p>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="products-section">
        <div className="section-header">
          <h2>Featured Craft Collection</h2>
          <p>Discover authentic Tripura handicrafts and handlooms</p>
        </div>
        <div className="products-grid">
          {productHighlights.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <span className="product-category">{product.category}</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="products-cta">
          <a href="/products" className="browse-all-btn">
            <ShoppingBag size={20} />
            Browse All Products
          </a>
        </div>
      </section>

      {/* Technology & Approach */}
      <section className="tech-section">
        <div className="section-header">
          <h2>Technology-Enabled Heritage</h2>
          <p>Modern solutions for traditional crafts</p>
        </div>
        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon">
              <ShieldCheck size={32} />
            </div>
            <h3>Secure Digital Payments</h3>
            <p>Multiple secure payment options with complete transaction transparency</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">
              <Package size={32} />
            </div>
            <h3>Transparent Supply Chain</h3>
            <p>Track your product's journey from artisan to your doorstep</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">
              <TrendingUp size={32} />
            </div>
            <h3>Intelligent Discovery</h3>
            <p>Smart recommendations based on craft techniques and heritage</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">
              <Users size={32} />
            </div>
            <h3>Trustworthy Experience</h3>
            <p>Verified artisans and authentic products with quality assurance</p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="benefits-section">
        <div className="benefits-grid">
          {/* For Artisans */}
          <div className="benefits-card artisan-card">
            <div className="benefits-card-header">
              <div className="benefits-icon">
                <HandHeart size={32} />
              </div>
              <h3>For Artisans</h3>
              <p className="benefits-subtitle">
                Empowering traditional craft communities
              </p>
            </div>
            <ul className="benefits-list">
              {artisanBenefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  <benefit.icon size={20} className="benefit-icon" />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For Buyers */}
          <div className="benefits-card buyer-card">
            <div className="benefits-card-header">
              <div className="benefits-icon">
                <ShoppingCart size={32} />
              </div>
              <h3>For Conscious Buyers</h3>
              <p className="benefits-subtitle">
                Authentic heritage products
              </p>
            </div>
            <ul className="benefits-list">
              {buyerBenefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  <benefit.icon size={20} className="benefit-icon" />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="collaboration-section">
        <div className="section-header">
          <h2>Our Collaborative Network</h2>
          <p>Building sustainable partnerships for heritage preservation</p>
        </div>
        <div className="collaboration-content">
          <p className="collaboration-description">
            We collaborate closely with artisans, craft communities, and institutions
            to provide value-added services including logistics, marketing, product
            authentication, customer support, and skill development.
          </p>
          <div className="partners-grid">
            {collaborationPartners.map((partner, index) => (
              <div key={index} className="partner-badge">
                <Users size={20} />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-header">
          <h2>Our Core Values</h2>
          <p>Principles guiding our heritage preservation journey</p>
        </div>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-item">
              <div className="value-icon">
                <value.icon size={32} />
              </div>
              <h4>{value.title}</h4>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Statement */}
      <section className="vision-section">
        <div className="vision-content">
          <Award size={48} className="vision-icon" />
          <h2>Our Vision</h2>
          <p className="vision-text">
            Through innovation, ethical commerce, and community engagement, we strive
            to build a sustainable ecosystem that uplifts artisans and brings genuine
            handcrafted products to conscious buyers worldwide.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Join Our Heritage Journey</h2>
          <p>
            Discover authentic Tripura crafts or partner with us to preserve traditional
            artistry for future generations.
          </p>
          <div className="cta-buttons">
            <a href="/products" className="cta-btn primary">
              <ShoppingBag size={20} />
              Shop Authentic Crafts
            </a>
            <a href="/sell" className="cta-btn secondary">
              <HandHeart size={20} />
              Partner as Artisan
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
