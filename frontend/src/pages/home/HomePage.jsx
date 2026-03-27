import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeroCarousel from "../../components/home/HeroCarousel";
import CategoryGrid from "../../components/home/CategoryGrid";
import ProductRow from "../../components/home/ProductRow";
import { Blocks, ScanSearch, ShieldCheck, Sparkles, Leaf, Star, Truck, Shield, Users, Wallet } from "lucide-react";
import { listCategories } from "../../services/catalogService";
import { listProducts } from "../../services/productsService";
import { API_BASE_URL } from "../../services/apiClient";
import { NON_COMMERCIAL_DISCLAIMER } from "../../config/commerce";
import { getCoreContracts } from "../../config/web3";

import "./HomePage.css";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&h=320&q=80";

const heroSlides = [
  {
    title: "Handcrafted Bamboo & Wooden Essentials",
    subtitle: "Curated products for home, gifting, and everyday living.",
    ctaText: "Explore Products",
    ctaLink: "/products",
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "Sustainable Living, Made Beautiful",
    subtitle: "Eco-friendly picks with artisan-grade quality.",
    ctaText: "Shop Eco-Friendly",
    ctaLink: "/products",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "Gifting That Feels Premium",
    subtitle: "Festival and corporate gifting collections, ready to ship.",
    ctaText: "Browse Gifts",
    ctaLink: "/products",
    image:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
  }
];

const categoryTiles = [
  { key: "home-living", name: "Home & Living", icon: "HL", link: "/products" },
  { key: "gifts", name: "Gifts", icon: "G", link: "/products" },
  { key: "kitchen", name: "Kitchen & Dining", icon: "KD", link: "/products" },
  { key: "spiritual", name: "Spiritual & Cultural", icon: "SC", link: "/products" },
  { key: "fashion", name: "Fashion & Accessories", icon: "FA", link: "/products" },
  { key: "eco", name: "Eco-Friendly", icon: "ECO", link: "/products" }
];

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
    description: "Free delivery on orders above Rs 999"
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

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Interior Designer",
    content:
      "The quality of bamboo products is exceptional. Perfect for modern sustainable homes!",
    avatar: "P",
    rating: 5
  },
  {
    name: "Rahul Mehta",
    role: "Corporate Client",
    content:
      "Ordered 100 gift boxes for our employees. Beautiful packaging and timely delivery.",
    avatar: "R",
    rating: 5
  },
  {
    name: "Anjali Patel",
    role: "Home Maker",
    content:
      "Love my new kitchen set! Eco-friendly and beautiful. Will definitely order again.",
    avatar: "A",
    rating: 4
  }
];

const web3Signals = [
  {
    icon: <Wallet size={20} />,
    title: "Wallet Connect",
    description: "MetaMask and WalletConnect entry points are now part of the storefront."
  },
  {
    icon: <Blocks size={20} />,
    title: "6 Core Contracts",
    description: "ProductNFT, Marketplace, Escrow, Admin, Auction, and Offers are surfaced in UI."
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Escrow + Royalties",
    description: "Listings now read as royalty-aware, settlement-protected digital assets."
  },
  {
    icon: <ScanSearch size={20} />,
    title: "Explorer Feed",
    description: "Connected wallets can inspect recent transaction hashes directly from the site."
  }
];

const emptyRows = {
  recommended: [],
  bestSellers: [],
  newArrivals: []
};

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_PRODUCT_IMAGE;
  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  const normalized = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_ORIGIN}${normalized}`;
};

const normalizeProduct = (product) => ({
  id: product.id,
  name: product.title || "Untitled product",
  description: product.description || "No description available.",
  price: toNumber(product.price, 0),
  rating: toNumber(product.rating, 4.7),
  image: buildImageUrl(product.image),
  category: product.category_name || "Uncategorized",
  categoryKey: slugify(product.category_name || "uncategorized"),
  stock: toNumber(product.stock, 0),
  createdAt: product.created_at || product.createdAt || ""
});

const buildCategoryTiles = (categories) =>
  categories.map((category) => {
    const slug = slugify(category.name);
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

const takeProducts = (source, count) => source.slice(0, Math.min(count, source.length));

const buildHomeRows = (products) => {
  if (!products.length) return emptyRows;

  const rowSize = Math.min(4, products.length);
  const bestSellers = [...products].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.stock - a.stock;
  });

  const newArrivals = [...products].sort((a, b) => {
    const aTime = Date.parse(a.createdAt || "");
    const bTime = Date.parse(b.createdAt || "");

    if (Number.isFinite(aTime) && Number.isFinite(bTime) && bTime !== aTime) {
      return bTime - aTime;
    }

    const aId = Number(a.id);
    const bId = Number(b.id);
    if (Number.isFinite(aId) && Number.isFinite(bId) && bId !== aId) {
      return bId - aId;
    }

    return 0;
  });

  return {
    recommended: takeProducts(products, rowSize),
    bestSellers: takeProducts(bestSellers, rowSize),
    newArrivals: takeProducts(newArrivals, rowSize)
  };
};

const buildCategorySections = (categories, products) =>
  categories
    .map((category) => {
      const slug = slugify(category.name);
      const categoryProducts = products
        .filter((product) => product.categoryKey === slug)
        .slice(0, 4);

      return {
        key: slug,
        title: category.name,
        subtitle: `Fresh picks in ${category.name}`,
        products: categoryProducts
      };
    })
    .filter((section) => section.products.length > 0)
    .slice(0, 2);

export default function HomePage() {
  const [homeCategoryTiles, setHomeCategoryTiles] = useState(categoryTiles);
  const [homeRows, setHomeRows] = useState(emptyRows);
  const [categorySections, setCategorySections] = useState([]);
  const coreContracts = useMemo(() => getCoreContracts(), []);

  useEffect(() => {
    const loadHomeData = async () => {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        listCategories(),
        listProducts()
      ]);

      const categories =
        categoriesResult.status === "fulfilled" && Array.isArray(categoriesResult.value)
          ? categoriesResult.value
          : [];

      const rawProducts =
        productsResult.status === "fulfilled" && Array.isArray(productsResult.value)
          ? productsResult.value
          : [];

      if (categories.length > 0) {
        setHomeCategoryTiles(buildCategoryTiles(categories));
      }

      if (rawProducts.length > 0) {
        const normalizedProducts = rawProducts
          .map(normalizeProduct)
          .filter((product) => product.id !== undefined && product.id !== null);

        setHomeRows(buildHomeRows(normalizedProducts));
        setCategorySections(buildCategorySections(categories, normalizedProducts));
      }
    };

    loadHomeData().catch((error) => {
      console.warn("Failed to load home page data", error);
    });
  }, []);

  const hasAnyProducts = useMemo(
    () => Object.values(homeRows).some((rowProducts) => rowProducts.length > 0),
    [homeRows]
  );

  return (
    <div className="home-container">
      <HeroCarousel slides={heroSlides} intervalMs={3800} />
      <div className="home-commerce-disclaimer">{NON_COMMERCIAL_DISCLAIMER}</div>

      <section className="web3-signal-section" aria-label="Web3 marketplace signals">
        <div className="web3-signal-shell">
          <div className="web3-signal-copy">
            <span className="web3-signal-kicker">Marketplace Upgrade</span>
            <h2>Not just a catalog anymore. The frontend now reads like a Web3 marketplace shell.</h2>
            <p>
              Wallet entry, contract registry, NFT provenance, and explorer access now sit beside
              the standard commerce flow.
            </p>
            <div className="web3-signal-actions">
              <Link to="/web3" className="btn-primary">
                <Wallet size={20} />
                Open Web3 Hub
              </Link>
              <div className="web3-contract-inline">
                <strong>{coreContracts.length}</strong>
                <span>core contracts surfaced</span>
              </div>
            </div>
          </div>

          <div className="web3-signal-grid">
            {web3Signals.map((signal) => (
              <article key={signal.title} className="web3-signal-card">
                <div className="web3-signal-card__icon">{signal.icon}</div>
                <h3>{signal.title}</h3>
                <p>{signal.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section" aria-label="Key features">
        <div className="features-container">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

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

      <section className="categories-section">
        <div className="section-header">
          <h2>Browse by Category</h2>
          <p>Discover products curated for every aspect of your life</p>
        </div>
        <CategoryGrid categories={homeCategoryTiles} />
      </section>

      {homeRows.recommended.length > 0 && (
        <ProductRow
          title="Recommended for You"
          subtitle="Handpicked based on live catalog data"
          products={homeRows.recommended}
        />
      )}

      {homeRows.bestSellers.length > 0 && (
        <ProductRow
          title="Best Sellers"
          subtitle="Top-rated products in our marketplace"
          products={homeRows.bestSellers}
        />
      )}

      {homeRows.newArrivals.length > 0 && (
        <ProductRow
          title="New Arrivals"
          subtitle="Latest additions from our backend catalog"
          products={homeRows.newArrivals}
        />
      )}

      {categorySections.map((cat) => (
        <ProductRow
          key={cat.key}
          title={cat.title}
          subtitle={cat.subtitle}
          products={cat.products}
        />
      ))}

      {!hasAnyProducts && (
        <section className="categories-section" aria-label="No products available">
          <div className="section-header">
            <h2>No products available right now</h2>
            <p>Products will appear here when the backend catalog returns data.</p>
          </div>
        </section>
      )}

      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Join thousands of satisfied customers</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
                <div className="testimonial-rating">
                  {"\u2605".repeat(testimonial.rating)}
                  <span>{testimonial.rating}.0</span>
                </div>
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </section>

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
