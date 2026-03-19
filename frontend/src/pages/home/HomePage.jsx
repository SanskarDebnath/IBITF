import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroCarousel from "../../components/home/HeroCarousel";
import CategoryGrid from "../../components/home/CategoryGrid";
import ProductRow from "../../components/home/ProductRow";
import { Sparkles, Leaf, Star, Truck, Shield, Users } from "lucide-react";
import { listCategories } from "../../services/catalogService";

import "./HomePage.css";

const heroSlides = [
  {
    title: "Handcrafted Bamboo & Wooden Essentials",
    subtitle: "Curated products for home, gifting, and everyday living.",
    ctaText: "Explore Products",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Sustainable Living, Made Beautiful",
    subtitle: "Eco-friendly picks with artisan-grade quality.",
    ctaText: "Shop Eco-Friendly",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Gifting That Feels Premium",
    subtitle: "Festival and corporate gifting collections, ready to ship.",
    ctaText: "Browse Gifts",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
  },
];

const categoryTiles = [
  { key: "home-living", name: "Home & Living", icon: "🪑", link: "/products" },
  { key: "gifts", name: "Gifts", icon: "🎁", link: "/products" },
  { key: "kitchen", name: "Kitchen & Dining", icon: "🍽️", link: "/products" },
  { key: "spiritual", name: "Spiritual & Cultural", icon: "🛕", link: "/products" },
  { key: "fashion", name: "Fashion & Accessories", icon: "👒", link: "/products" },
  { key: "eco", name: "Eco-Friendly", icon: "🌿", link: "/products" },
];

function buildCategoryTiles(categories) {
  return categories.map((category) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-");
    const initials = category.name
      .split(/\s*&\s*|\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");

    return {
      key: slug,
      name: category.name,
      icon: initials || category.name[0]?.toUpperCase() || "C",
      link: `/products?category=${slug}`
    };
  });
}

const features = [
  {
    icon: <Leaf size={32} />,
    title: "Sustainable Materials",
    description: "All products crafted from eco-friendly, renewable resources"
  },
  {
    icon: <Sparkles size={32} />,
    title: "Artisan Quality",
    description: "Handcrafted by skilled artisans with attention to detail"
  },
  {
    icon: <Truck size={32} />,
    title: "Free Shipping",
    description: "Free delivery on orders above ₹999"
  },
  {
    icon: <Shield size={32} />,
    title: "Secure Payment",
    description: "100% secure payment with SSL encryption"
  },
  {
    icon: <Users size={32} />,
    title: "Community Support",
    description: "Supporting local artisans and communities"
  },
  {
    icon: <Star size={32} />,
    title: "Premium Quality",
    description: "Rigorous quality checks for every product"
  }
];

const rows = {
  recommended: [
    {
      id: "rec-001",
      name: "Bamboo Storage Basket",
      description: "Minimal, durable organizer for clean interiors.",
      price: 649,
      rating: 4.8,
      // image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "rec-002",
      name: "Wooden Table Décor",
      description: "Compact accent piece with artisan finish.",
      price: 799,
      rating: 4.9,
      // image: "https://images.unsplash.com/photo-1565791380715-23d7bec72519?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "rec-003",
      name: "Eco Cutlery Set",
      description: "Reusable daily-use essentials for dining.",
      price: 399,
      rating: 4.7,
      // image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "rec-004",
      name: "Bamboo Lamp Shade",
      description: "Warm ambient lighting for living spaces.",
      price: 1199,
      rating: 4.9,
      // image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
  ],
  bestSellers: [
    {
      id: "bs-001",
      name: "Wooden Serving Tray",
      description: "Premium tray for serving and presentation.",
      price: 899,
      rating: 4.9,
      // image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "bs-002",
      name: "Bamboo Cutting Board",
      description: "Sturdy board for everyday prep routines.",
      price: 499,
      rating: 4.7,
      // image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "bs-003",
      name: "Handmade Gift Box",
      description: "Curated gift set for premium moments.",
      price: 899,
      rating: 4.8,
      // image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "bs-004",
      name: "Ethnic Wall Hanging",
      description: "Cultural décor piece for home interiors.",
      price: 999,
      rating: 4.8,
      // image: "https://images.unsplash.com/photo-1561223370-16d6d4c7e9a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
  ],
  newArrivals: [
    {
      id: "na-001",
      name: "Bamboo Side Table",
      description: "Compact table for modern living spaces.",
      price: 1499,
      rating: 5.0,
      // image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "na-002",
      name: "Wooden Spoon Set",
      description: "Eco-friendly utensils with smooth finish.",
      price: 399,
      rating: 4.7,
      // image: "https://images.unsplash.com/photo-1525905705643-0eaae0308db6?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "na-003",
      name: "Traditional Artifact",
      description: "Heritage-inspired collectible piece.",
      price: 1499,
      rating: 4.9,
      // image: "https://images.unsplash.com/photo-1598300180338-6c5f6c37f8c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
    {
      id: "na-004",
      name: "Corporate Gift Pack",
      description: "Bulk-ready gifting with consistent quality.",
      price: 1599,
      rating: 4.8,
      // image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80",
    },
  ],
};

const categorySections = [
  {
    key: "home-living",
    title: "Home & Living",
    subtitle: "Transform your living spaces with natural elegance",
    products: [
      { id: "hl-001", name: "Bamboo Furniture Stand", description: "Sturdy bamboo build for daily utility.", price: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
      { id: "hl-002", name: "Wooden Wall Shelf", description: "Minimal shelf for décor and storage.", price: 999, rating: 4.7, image: "https://images.unsplash.com/photo-1565791380715-23d7bec72519?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
      { id: "hl-003", name: "Handcrafted Lamp", description: "Warm ambient lighting with artisan finish.", price: 1299, rating: 4.9, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
      { id: "hl-004", name: "Storage Organizer", description: "Practical organizer for tidy interiors.", price: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
    ],
  },
  {
    key: "gifts-handicrafts",
    title: "Gifts & Handicrafts",
    subtitle: "Thoughtful gifts that tell a story",
    products: [
      { id: "gh-001", name: "Festival Gift Set", description: "Ready-to-gift artisan collection.", price: 1199, rating: 4.9, image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
      { id: "gh-002", name: "Souvenir Showpiece", description: "Collectible with cultural character.", price: 799, rating: 4.7, image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
      { id: "gh-003", name: "Handmade Gift Box", description: "Premium handcrafted packaging and items.", price: 899, rating: 4.8, image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
      { id: "gh-004", name: "Corporate Bulk Gifting", description: "Consistent quality at scale for teams.", price: 1599, rating: 4.8, image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80" },
    ],
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Interior Designer",
    content: "The quality of bamboo products is exceptional. Perfect for modern sustainable homes!",
    avatar: "P",
    rating: 5
  },
  {
    name: "Rahul Mehta",
    role: "Corporate Client",
    content: "Ordered 100 gift boxes for our employees. Beautiful packaging and timely delivery.",
    avatar: "R",
    rating: 5
  },
  {
    name: "Anjali Patel",
    role: "Home Maker",
    content: "Love my new kitchen set! Eco-friendly and beautiful. Will definitely order again.",
    avatar: "A",
    rating: 4
  }
];

export default function HomePage() {
  const [homeCategoryTiles, setHomeCategoryTiles] = useState(categoryTiles);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await listCategories();
        if (!Array.isArray(categories) || categories.length === 0) return;

        setHomeCategoryTiles(buildCategoryTiles(categories));
      } catch (error) {
        console.warn("Failed to load home categories", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} intervalMs={3800} />

      {/* Features Section */}
      <section className="features-section" aria-label="Key features">
        <div className="features-container">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Introduction Section */}
      <section className="home-intro" aria-label="Marketplace introduction">
        <div className="intro-content">
          <span className="intro-badge">
            <Leaf size={16} />
            Sustainable Marketplace
          </span>
          <h1 className="intro-title">Discover Handcrafted Bamboo & Wooden Elegance</h1>
          <p className="intro-text">
            A curated collection of authentic, eco-friendly products crafted by skilled artisans.
            Each piece tells a story of tradition, sustainability, and exceptional craftsmanship.
          </p>
          <div className="intro-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Artisans</span>
            </div>
            <div className="stat">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Happy Customers</span>
            </div>
          </div>
          <div className="intro-actions">
            <Link to="/products" className="btn-primary">
              <Sparkles size={20} />
              Explore Collection
            </Link>
            <Link to="/about" className="btn-secondary">
              Our Story
            </Link>
          </div>
        </div>
        <div className="intro-image">
          <img
            src="https://images.unsplash.com/photo-1561212049-3c01fce7f40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Handcrafted bamboo products"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Browse by Category</h2>
          <p>Discover products curated for every aspect of your life</p>
        </div>
        <CategoryGrid categories={homeCategoryTiles} />
      </section>

      {/* Featured Products */}
      <ProductRow
        title="Recommended for You"
        subtitle="Handpicked based on your preferences"
        products={rows.recommended}
      />

      <ProductRow
        title="Best Sellers"
        subtitle="Most loved by our community"
        products={rows.bestSellers}
      />

      <ProductRow
        title="New Arrivals"
        subtitle="Fresh additions to our collection"
        products={rows.newArrivals}
      />

      {/* Category Specific Sections */}
      {categorySections.map((cat) => (
        <ProductRow
          key={cat.key}
          title={cat.title}
          subtitle={cat.subtitle}
          products={cat.products}
        />
      ))}

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Join thousands of satisfied customers</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}
                  <span>{testimonial.rating}.0</span>
                </div>
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Join thousands of customers who have discovered the beauty of sustainable living.</p>
          <div className="cta-actions">
            <Link to="/products" className="btn-primary">
              <Sparkles size={20} />
              Shop Now
            </Link>
            <Link to="/about" className="btn-outline">
              Learn About Sustainability
            </Link>
          </div>
        </div>
        <div className="cta-pattern">
          <div className="pattern-circle"></div>
          <div className="pattern-circle"></div>
          <div className="pattern-circle"></div>
        </div>
      </section>
    </div>
  );
}
