import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  Star,
  Truck,
  Leaf,
  Heart,
  ShoppingCart,
  X,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles,
  Package
} from "lucide-react";
import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";
import { useWishlist } from "../../app/providers/WishlistProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { listProducts } from "../../services/productsService";
import { listCategories } from "../../services/catalogService";
import { HIDE_PRODUCT_PRICES, NON_COMMERCIAL_DISCLAIMER } from "../../config/commerce";
import "./CatalogPage.css";

// Demo products data
const demoProducts = [
  {
    id: "p1",
    name: "Handmade Bamboo Vase",
    price: 799,
    originalPrice: 999,
    discount: 20,
    category: "home-living",
    subcategory: "decor",
    rating: 4.8,
    reviewCount: 42,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Elegant bamboo vase for floral arrangements and home decor.",
    tags: ["Bamboo", "Home Decor", "Eco-Friendly"],
    inStock: true,
    delivery: "Free delivery",
    bestSeller: true
  },
  {
    id: "p2",
    name: "Artisan Handwoven Bag",
    price: 1299,
    originalPrice: 1599,
    discount: 19,
    category: "fashion",
    subcategory: "accessories",
    rating: 4.9,
    reviewCount: 67,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Handwoven natural fiber bag with traditional patterns.",
    tags: ["Handwoven", "Fashion", "Traditional"],
    inStock: true,
    delivery: "Free delivery",
    bestSeller: true
  },
  {
    id: "p3",
    name: "Wooden Serving Tray Set",
    price: 1199,
    originalPrice: 1499,
    discount: 20,
    category: "kitchen",
    subcategory: "serving",
    rating: 4.7,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Set of 3 carved wooden trays for elegant serving.",
    tags: ["Wooden", "Kitchen", "Handcrafted"],
    inStock: true,
    delivery: "Free delivery",
    bestSeller: false
  },
  {
    id: "p4",
    name: "Bamboo Lamp Shade",
    price: 899,
    originalPrice: 1199,
    discount: 25,
    category: "home-living",
    subcategory: "lighting",
    rating: 4.8,
    reviewCount: 124,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Natural bamboo lampshade creating warm ambient lighting.",
    tags: ["Bamboo", "Lighting", "Eco-Friendly"],
    inStock: true,
    delivery: "Free delivery",
    bestSeller: true
  },
  {
    id: "p5",
    name: "Traditional Wall Hanging",
    price: 1599,
    originalPrice: 1999,
    discount: 20,
    category: "spiritual",
    subcategory: "decor",
    rating: 4.9,
    reviewCount: 56,
    image: "https://images.unsplash.com/photo-1561223370-16d6d4c7e9a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Intricately designed traditional wall art piece.",
    tags: ["Traditional", "Wall Decor", "Handcrafted"],
    inStock: true,
    delivery: "3-5 days",
    bestSeller: false
  },
  {
    id: "p6",
    name: "Eco Cutlery Set",
    price: 499,
    originalPrice: 699,
    discount: 29,
    category: "kitchen",
    subcategory: "utensils",
    rating: 4.6,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Sustainable bamboo cutlery set for everyday use.",
    tags: ["Bamboo", "Kitchen", "Eco-Friendly"],
    inStock: true,
    delivery: "Free delivery",
    bestSeller: true
  },
  {
    id: "p7",
    name: "Handcrafted Gift Box",
    price: 999,
    originalPrice: 1299,
    discount: 23,
    category: "gifts",
    subcategory: "packaging",
    rating: 4.9,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Premium handmade gift box with artisan detailing.",
    tags: ["Gift", "Premium", "Handcrafted"],
    inStock: true,
    delivery: "Gift wrap available",
    bestSeller: true
  },
  {
    id: "p8",
    name: "Bamboo Furniture Stand",
    price: 1899,
    originalPrice: 2399,
    discount: 21,
    category: "home-living",
    subcategory: "furniture",
    rating: 4.7,
    reviewCount: 78,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
    description: "Sturdy bamboo stand for plants or decorative items.",
    tags: ["Bamboo", "Furniture", "Eco-Friendly"],
    inStock: false,
    delivery: "Restocking soon",
    bestSeller: false
  }
];

const categories = [
  { id: "all", name: "All Products", icon: <Package size={18} />, count: 8 },
  { id: "home-living", name: "Home & Living", icon: <Sparkles size={18} />, count: 4 },
  { id: "kitchen", name: "Kitchen & Dining", icon: <DollarSign size={18} />, count: 2 },
  { id: "gifts", name: "Gifts", icon: <Heart size={18} />, count: 1 },
  { id: "spiritual", name: "Spiritual & Cultural", icon: <Leaf size={18} />, count: 1 },
  { id: "fashion", name: "Fashion & Accessories", icon: <TrendingUp size={18} />, count: 1 }
];

const filters = {
  price: [
    { label: "Under ₹500", value: "0-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "Over ₹2000", value: "2000-10000" }
  ],
  rating: [
    { label: "4.5 & above", value: "4.5" },
    { label: "4.0 & above", value: "4.0" },
    { label: "3.5 & above", value: "3.5" },
    { label: "3.0 & above", value: "3.0" }
  ],
  availability: [
    { label: "In Stock", value: "in-stock" },
    { label: "Out of Stock", value: "out-of-stock" }
  ],
  tags: [
    { label: "Bamboo", value: "bamboo" },
    { label: "Eco-Friendly", value: "eco-friendly" },
    { label: "Handcrafted", value: "handcrafted" },
    { label: "Traditional", value: "traditional" },
    { label: "Best Seller", value: "best-seller" }
  ]
};

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Customer Rating", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Best Selling", value: "best-selling" }
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState(demoProducts);
  const [categoryOptions, setCategoryOptions] = useState(categories);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  // Get filter values from URL
  const selectedCategory = searchParams.get("category") || "all";
  const selectedSort = searchParams.get("sort") || "recommended";
  const selectedPrice = searchParams.get("price") || "";
  const selectedRating = searchParams.get("rating") || "";
  const selectedAvailability = searchParams.get("availability") || "";
  const selectedTags = searchParams.getAll("tag") || [];

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  // Filter products
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          listProducts(),
          listCategories()
        ]);

        if (Array.isArray(productsData) && productsData.length) {
          const mappedProducts = productsData.map((p) => ({
            id: p.id,
            name: p.title,
            price: Number(p.price || 0),
            originalPrice: null,
            discount: null,
            category: (p.category_name || "all").toLowerCase().replace(/\\s+/g, "-"),
            subcategory: "",
            rating: 4.7,
            reviewCount: 10,
            image: p.image || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
            description: p.description || "No description available.",
            tags: [p.category_name || "Handcrafted"],
            inStock: Number(p.stock || 0) > 0,
            delivery: "Free delivery",
            bestSeller: false
          }));
          setProducts(mappedProducts);
        }

        if (Array.isArray(categoriesData) && categoriesData.length) {
          const mappedCategories = [
            { id: "all", name: "All Products", icon: <Package size={18} />, count: productsData.length || 0 },
            ...categoriesData.map((c) => ({
              id: c.name.toLowerCase().replace(/\\s+/g, "-"),
              name: c.name,
              icon: <Sparkles size={18} />,
              count: productsData.filter((p) => (p.category_name || "").toLowerCase() === c.name.toLowerCase()).length
            }))
          ];
          setCategoryOptions(mappedCategories);
        }
      } catch (err) {
        console.warn("Failed to load catalog data", err);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setWishlist(wishlistItems.map((item) => item.productId));
  }, [wishlistItems]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Price filter
      if (selectedPrice) {
        const [min, max] = selectedPrice.split("-").map(Number);
        if (max && (product.price < min || product.price > max)) return false;
        if (!max && product.price < min) return false;
      }

      // Rating filter
      if (selectedRating && product.rating < parseFloat(selectedRating)) {
        return false;
      }

      // Availability filter
      if (selectedAvailability === "in-stock" && !product.inStock) return false;
      if (selectedAvailability === "out-of-stock" && product.inStock) return false;

      // Tags filter
      if (selectedTags.length > 0) {
        const productTags = product.tags.map(tag => tag.toLowerCase());
        const hasMatchingTag = selectedTags.some(tag =>
          productTags.includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, selectedPrice, selectedRating, selectedAvailability, selectedTags]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];

    switch (selectedSort) {
      case "price-asc":
        return products.sort((a, b) => a.price - b.price);
      case "price-desc":
        return products.sort((a, b) => b.price - a.price);
      case "rating":
        return products.sort((a, b) => b.rating - a.rating);
      case "newest":
        return products.reverse();
      case "best-selling":
        return products.sort((a, b) => {
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
          return b.reviewCount - a.reviewCount;
        });
      default:
        return products;
    }
  }, [filteredProducts, selectedSort]);

  // Handle filter changes
  const handleCategoryChange = (categoryId) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("category", categoryId);
      return params;
    });
  };

  const handleSortChange = (sortValue) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("sort", sortValue);
      return params;
    });
  };

  const handleFilterChange = (filterType, value) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);

      if (filterType === "price") {
        if (value) params.set("price", value);
        else params.delete("price");
      } else if (filterType === "rating") {
        if (value) params.set("rating", value);
        else params.delete("rating");
      } else if (filterType === "availability") {
        if (value) params.set("availability", value);
        else params.delete("availability");
      } else if (filterType === "tag") {
        const currentTags = params.getAll("tag");
        if (currentTags.includes(value)) {
          params.delete("tag");
          currentTags.filter(tag => tag !== value).forEach(tag => params.append("tag", tag));
        } else {
          params.append("tag", value);
        }
      }

      return params;
    });
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image
    });
    showToast(`Added ${product.name} to cart`, "success");
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      showToast("Please login to manage wishlist", "error");
      return;
    }

    const isAdding = !wishlist.includes(productId);
    if (isAdding) {
      await addToWishlist(productId);
    } else {
      await removeFromWishlist(productId);
    }
    showToast(isAdding ? "Added to wishlist" : "Removed from wishlist", isAdding ? "success" : "info");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      else params.delete("q");
      return params;
    });
  };

  // Active filters count
  const activeFiltersCount = [
    selectedPrice,
    selectedRating,
    selectedAvailability,
    ...selectedTags
  ].filter(Boolean).length;

  return (
    <div className="catalog-container">
      {/* Hero Banner */}
      <div className="catalog-hero">
        <div className="catalog-hero-content">
          <h1>Discover Handcrafted Treasures</h1>
          <p>Explore our curated collection of authentic bamboo and wooden handicrafts</p>
          <div className="catalog-disclaimer">{NON_COMMERCIAL_DISCLAIMER}</div>
        </div>
        <div className="catalog-hero-pattern">
          <div className="pattern-dot"></div>
          <div className="pattern-dot"></div>
          <div className="pattern-dot"></div>
        </div>
      </div>

      <div className="catalog-main">
        {/* Categories Sidebar */}
        <aside className="catalog-sidebar">
          <div className="categories-section">
            <h3 className="sidebar-title">
              <Package size={20} />
              Categories
            </h3>
            <div className="categories-list">
              {categoryOptions.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filters-section">
            <div className="filters-header">
              <h3 className="sidebar-title">
                <Filter size={20} />
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Price Range</h4>
              <div className="filter-options">
                {filters.price.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === option.value}
                      onChange={() => handleFilterChange("price", option.value)}
                      className="filter-input"
                    />
                    <div className="filter-option-custom"></div>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Customer Rating</h4>
              <div className="filter-options">
                {filters.rating.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === option.value}
                      onChange={() => handleFilterChange("rating", option.value)}
                      className="filter-input"
                    />
                    <div className="filter-option-custom"></div>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Availability</h4>
              <div className="filter-options">
                {filters.availability.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="radio"
                      name="availability"
                      checked={selectedAvailability === option.value}
                      onChange={() => handleFilterChange("availability", option.value)}
                      className="filter-input"
                    />
                    <div className="filter-option-custom"></div>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Product Tags</h4>
              <div className="tag-options">
                {filters.tags.map(tag => (
                  <button
                    key={tag.value}
                    className={`tag-btn ${selectedTags.includes(tag.value) ? 'active' : ''}`}
                    onClick={() => handleFilterChange("tag", tag.value)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-info">
            <div className="info-card">
              <Truck size={24} />
              <div>
                <h4>Free Delivery</h4>
                <p>On orders above ₹999</p>
              </div>
            </div>
            <div className="info-card">
              <Leaf size={24} />
              <div>
                <h4>Eco-Friendly</h4>
                <p>Sustainable materials</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="catalog-content">
          {/* Search and Controls */}
          <div className="catalog-controls">
            <form onSubmit={handleSearch} className="catalog-search">
              <div className="search-input-wrapper">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search products, categories, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
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
              <button
                className="mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
                type="button"
              >
                <SlidersHorizontal size={20} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-count">{activeFiltersCount}</span>
                )}
              </button>
            </form>

            <div className="catalog-sort">
              <div className="sort-select">
                <label>Sort by:</label>
                <select
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sort-dropdown"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="dropdown-arrow" />
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="mobile-filters-panel">
              <div className="mobile-filters-header">
                <h3>Filters</h3>
                <button
                  className="close-filters"
                  onClick={() => setShowFilters(false)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mobile-filters-content">
                {/* Mobile filters content would go here */}
                <p>Filters would appear here in mobile view</p>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="results-info">
            <div className="results-count">
              <span className="count-number">{sortedProducts.length}</span>
              <span className="count-text">products found</span>
            </div>
            {activeFiltersCount > 0 && (
              <div className="active-filters">
                <span>Active filters:</span>
                <div className="filter-chips">
                  {selectedPrice && (
                    <span className="filter-chip">
                      Price: {filters.price.find(p => p.value === selectedPrice)?.label}
                      <button onClick={() => handleFilterChange("price", "")}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedRating && (
                    <span className="filter-chip">
                      Rating: {selectedRating}+
                      <button onClick={() => handleFilterChange("rating", "")}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedAvailability && (
                    <span className="filter-chip">
                      {selectedAvailability === "in-stock" ? "In Stock" : "Out of Stock"}
                      <button onClick={() => handleFilterChange("availability", "")}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="filter-chip">
                      {tag}
                      <button onClick={() => handleFilterChange("tag", tag)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid/List */}
          {sortedProducts.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <Search size={48} />
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="reset-filters-btn" onClick={clearAllFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={`products-${viewMode}`}>
              {sortedProducts.map(product => (
                <div key={product.id} className={`product-card ${viewMode}`}>
                  <div className="product-image-container">
                    <Link to={`/products/${product.id}`} className="product-image-link">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                      {product.discount && (
                        <div className="product-discount">
                          -{product.discount}%
                        </div>
                      )}
                      {product.bestSeller && (
                        <div className="product-badge best-seller">
                          <TrendingUp size={12} />
                          Best Seller
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="product-badge out-of-stock">
                          <Clock size={12} />
                          Out of Stock
                        </div>
                      )}
                    </Link>
                    <button
                      className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        size={20}
                        fill={wishlist.includes(product.id) ? "#ef4444" : "none"}
                      />
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-header">
                      <Link to={`/products/${product.id}`} className="product-title">
                        {product.name}
                      </Link>
                      <div className="product-rating">
                        <Star size={14} fill="#fbbf24" />
                        <span className="rating-value">{product.rating}</span>
                        <span className="rating-count">({product.reviewCount})</span>
                      </div>
                    </div>

                    <p className="product-description">
                      {viewMode === 'grid'
                        ? product.description.substring(0, 60) + "..."
                        : product.description
                      }
                    </p>

                    <div className="product-meta">
                      <div className="product-tags">
                        {product.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="product-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="product-delivery">
                        <Truck size={14} />
                        <span>{product.delivery}</span>
                      </div>
                    </div>

                    <div className="product-footer">
                      <div className="product-price">
                        {HIDE_PRODUCT_PRICES ? (
                          <span className="current-price">Price hidden</span>
                        ) : (
                          <>
                            <span className="current-price">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="original-price">₹{product.originalPrice}</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="product-actions">
                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart size={16} />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More (if implemented) */}
          {sortedProducts.length > 0 && (
            <div className="load-more-section">
              <button className="load-more-btn">
                Load More Products
              </button>
            </div>
          )}

          {/* Featured Categories */}
          <div className="featured-categories">
            <h3 className="featured-title">Shop by Category</h3>
            <div className="categories-grid">
              {categoryOptions.slice(1).map(category => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="featured-category"
                >
                  <div className="category-icon-large">
                    {category.icon}
                  </div>
                  <div className="category-info">
                    <h4>{category.name}</h4>
                    <span className="category-products">{category.count} products</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
