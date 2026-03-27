import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";
import { useWishlist } from "../../app/providers/WishlistProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useWeb3 } from "../../app/providers/useWeb3";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package,
  Leaf,
  Users,
  TrendingUp,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Blocks,
  Wallet,
  ExternalLink
} from "lucide-react";
import { HIDE_PRODUCT_PRICES, NON_COMMERCIAL_DISCLAIMER } from "../../config/commerce";
import { getCoreContracts, getExplorerAddressUrl, getProductWeb3Profile } from "../../config/web3";
import "./ProductDetailsPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const fallbackImage = "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const RECENTLY_VIEWED_KEY = "recentlyViewedProducts";
const DEFAULT_SPECIFICATIONS = {
  material: "Not specified",
  color: "Not specified",
  dimensions: "Not specified",
  weight: "Not specified",
  careInstructions: "Not specified"
};
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildImageUrl = (imagePath) => {
  if (!imagePath) return fallbackImage;
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

const parseSpecifications = (rawSpecifications) => {
  if (!rawSpecifications) return DEFAULT_SPECIFICATIONS;

  if (typeof rawSpecifications === "object" && !Array.isArray(rawSpecifications)) {
    return Object.keys(rawSpecifications).length ? rawSpecifications : DEFAULT_SPECIFICATIONS;
  }

  const text = String(rawSpecifications || "").trim();
  if (!text) return DEFAULT_SPECIFICATIONS;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.keys(parsed).length ? parsed : DEFAULT_SPECIFICATIONS;
    }
  } catch {
    // Fall back to line-based parsing.
  }

  const entries = {};
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line, index) => {
      const [rawKey, ...rawValueParts] = line.split(":");
      const value = rawValueParts.join(":").trim();
      if (!value) {
        entries[`Detail ${index + 1}`] = rawKey.trim();
        return;
      }
      entries[rawKey.trim()] = value;
    });

  return Object.keys(entries).length ? entries : DEFAULT_SPECIFICATIONS;
};

const formatPrice = (value) => currencyFormatter.format(Number(value || 0));

const normalizeProduct = (apiProduct) => {
  const price = toNumber(apiProduct?.price, 0);
  const stock = toNumber(apiProduct?.stock, 0);
  const imageUrl = buildImageUrl(apiProduct?.image);
  const sellerShopName = apiProduct?.seller_shop_name?.trim();
  const sellerAddress = apiProduct?.seller_address?.trim();
  const sellerStatus = apiProduct?.seller_status?.trim();

  return {
    id: apiProduct?.id,
    name: apiProduct?.title || "Untitled product",
    category: apiProduct?.category_name || "Uncategorized",
    subCategory: "",
    price,
    originalPrice: null,
    discount: null,
    description: apiProduct?.description || "No description available.",
    features: [],
    images: [imageUrl],
    rating: 4.0,
    reviewCount: 0,
    inStock: stock > 0,
    stockCount: stock,
    tags: apiProduct?.status === "active" ? ["Available"] : [],
    deliveryInfo: {
      freeShipping: true,
      estimatedDelivery: "3-5 business days",
      returns: "30-day easy returns",
      warranty: "1-year quality guarantee"
    },
    artisanInfo: {
      shopName: sellerShopName || "Marketplace Seller",
      address: sellerAddress || "Address not provided by the seller.",
      status: sellerStatus || "active"
    },
    specifications: parseSpecifications(apiProduct?.specifications)
  };
};
// const reviews = [
//   {
//     id: 1,
//     user: "Priya Sharma",
//     rating: 5,
//     date: "2 weeks ago",
//     comment: "Beautiful basket! The quality is exceptional and it looks stunning in my living room. Perfect for storing blankets.",
//     verified: true
//   },
//   {
//     id: 2,
//     user: "Raj Mehta",
//     rating: 4,
//     date: "1 month ago",
//     comment: "Good product, sturdy construction. The size is perfect for what I needed. Delivery was prompt.",
//     verified: true
//   },
//   {
//     id: 3,
//     user: "Anjali Patel",
//     rating: 5,
//     date: "3 days ago",
//     comment: "Love the natural look! It's exactly as described and adds a nice touch to my home decor.",
//     verified: false
//   },
//   {
//     id: 4,
//     user: "Kiran Das",
//     rating: 4,
//     date: "1 week ago",
//     comment: "Nice craftsmanship and smooth finish. Packaging was secure and arrived on time.",
//     verified: true
//   },
//   {
//     id: 5,
//     user: "Meera Nair",
//     rating: 5,
//     date: "5 days ago",
//     comment: "Looks premium and fits perfectly in my entryway. Highly recommended!",
//     verified: true
//   },
//   {
//     id: 6,
//     user: "Amit Roy",
//     rating: 4,
//     date: "3 weeks ago",
//     comment: "Great value for money. The color matches the photos.",
//     verified: false
//   },
//   {
//     id: 7,
//     user: "Sneha Kapoor",
//     rating: 5,
//     date: "2 days ago",
//     comment: "Absolutely love it. Will order again for gifting.",
//     verified: true
//   }
// ];

const relatedProducts = [
  {
    id: "bamboo-lamp-003",
    name: "Bamboo Lamp Shade",
    price: 1199,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "wooden-shelf-004",
    name: "Wooden Wall Shelf",
    price: 999,
    image: "https://images.unsplash.com/photo-1565791380715-23d7bec72519?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "eco-cutlery-005",
    name: "Eco Cutlery Set",
    price: 399,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.6
  },
  {
    id: "gift-box-006",
    name: "Handmade Gift Box",
    price: 899,
    image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.9
  }
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { account: connectedAccount, chainConfig, chainId, isConnected: isWalletConnected } = useWeb3();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailStatus, setThumbnailStatus] = useState({});
  const [relatedStatus, setRelatedStatus] = useState({});
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const currentImage = product?.images?.[selectedImage] || fallbackImage;
  const web3Profile = product ? getProductWeb3Profile(product) : null;
  const productContracts = web3Profile
    ? getCoreContracts().filter((contract) => web3Profile.contractKeys.includes(contract.key))
    : [];
  const walletExplorerUrl = getExplorerAddressUrl(chainId, connectedAccount);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        setProduct(normalizeProduct(data));
      } catch (err) {
        setLoadError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setRecentlyViewed(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  useEffect(() => {
    if (!currentImage) {
      setMainImageLoaded(false);
      setMainImageError(true);
      return undefined;
    }

    let cancelled = false;
    const preloadImage = new Image();

    setMainImageLoaded(false);
    setMainImageError(false);

    const markLoaded = () => {
      if (cancelled) return;
      setMainImageLoaded(true);
      setMainImageError(false);
    };

    const markError = () => {
      if (cancelled) return;
      setMainImageLoaded(false);
      setMainImageError(true);
    };

    preloadImage.onload = markLoaded;
    preloadImage.onerror = markError;
    preloadImage.src = currentImage;

    if (preloadImage.complete) {
      if (preloadImage.naturalWidth > 0) {
        markLoaded();
      } else {
        markError();
      }
    }

    return () => {
      cancelled = true;
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [currentImage]);

  useEffect(() => {
    if (!product?.images?.length) {
      setThumbnailStatus({});
      return undefined;
    }

    let cancelled = false;
    setThumbnailStatus(
      product.images.reduce((accumulator, _image, index) => {
        accumulator[index] = "loading";
        return accumulator;
      }, {})
    );

    product.images.forEach((image, index) => {
      const preloadImage = new Image();

      const markLoaded = () => {
        if (cancelled) return;
        setThumbnailStatus((prev) => ({ ...prev, [index]: "loaded" }));
      };

      const markError = () => {
        if (cancelled) return;
        setThumbnailStatus((prev) => ({ ...prev, [index]: "error" }));
      };

      preloadImage.onload = markLoaded;
      preloadImage.onerror = markError;
      preloadImage.src = image;

      if (preloadImage.complete) {
        if (preloadImage.naturalWidth > 0) {
          markLoaded();
        } else {
          markError();
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.images]);

  useEffect(() => {
    if (!product || typeof window === "undefined") return;

    const nextEntry = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.images?.[0] || fallbackImage
    };

    try {
      const stored = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const safeItems = Array.isArray(parsed) ? parsed : [];
      const nextItems = [
        nextEntry,
        ...safeItems.filter((item) => String(item?.id) !== String(product.id))
      ].slice(0, 5);

      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextItems));
      setRecentlyViewed(nextItems);
    } catch {
      // Ignore local storage errors and keep the page usable.
    }
  }, [product]);

  // useEffect(() => {
  //   const updateReviewsPerView = () => {
  //     const width = window.innerWidth;
  //     if (width <= 640) {
  //       setReviewsPerView(1);
  //     } else if (width <= 1024) {
  //       setReviewsPerView(2);
  //     } else {
  //       setReviewsPerView(3);
  //     }
  //   };

  //   updateReviewsPerView();
  //   window.addEventListener("resize", updateReviewsPerView);
  //   return () => window.removeEventListener("resize", updateReviewsPerView);
  // }, []);

  // useEffect(() => {
  //   const maxIndex = Math.max(0, reviews.length - reviewsPerView);
  //   if (reviewIndex > maxIndex) {
  //     setReviewIndex(maxIndex);
  //   }
  // }, [reviewsPerView, reviewIndex]);

  const handleThumbnailLoad = (index) => {
    setThumbnailStatus((prev) => ({ ...prev, [index]: "loaded" }));
  };

  const handleThumbnailError = (index) => {
    setThumbnailStatus((prev) => ({ ...prev, [index]: "error" }));
  };

  const handleRelatedLoad = (relatedId) => {
    setRelatedStatus((prev) => ({ ...prev, [relatedId]: "loaded" }));
  };

  const handleRelatedError = (relatedId) => {
    setRelatedStatus((prev) => ({ ...prev, [relatedId]: "error" }));
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.images[0]
    });
    showToast(`Added ${quantity} ${product.name} to cart`, "success");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const isInWishlist = wishlistItems.some((item) => item.productId === product?.id);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      showToast("Please login to manage wishlist", "error");
      return;
    }
    if (isInWishlist) {
      await removeFromWishlist(product.id);
      showToast("Removed from wishlist", "info");
    } else {
      await addToWishlist(product.id);
      showToast("Added to wishlist", "success");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on BambooCraft!`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "info");
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const nextImage = () => {
    setSelectedImage(prev => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  const recentProducts = recentlyViewed.filter((item) => String(item.id) !== String(product?.id)).slice(0, 4);

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="product-details-loading">
        <p>{loadError || "Product not found"}</p>
        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Link to="/products" className="back-to-products">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      {/* Breadcrumb */}
      <nav className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/products">Products</Link>
        <span> / </span>
        <Link to={`/products?category=${product.category.toLowerCase().replace(' ', '-')}`}>
          {product.category}
        </Link>
        <span> / </span>
        <span className="current">{product.name}</span>
      </nav>
      <div className="commerce-disclaimer">{NON_COMMERCIAL_DISCLAIMER}</div>

      {/* Main Product Section */}
      <div className="product-details-main">
        {/* Left Column - Images */}
        <div className="product-images-section">
          <div className="product-main-image">
            <button
              className="image-nav-btn prev"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            {!mainImageLoaded && !mainImageError && (
              <div className="image-loading-overlay">
                <div className="ios-spinner"></div>
              </div>
            )}
            {mainImageError ? (
              <div className="image-fallback">IMG</div>
            ) : (
              <img
                src={currentImage}
                alt={product.name}
                className={`main-product-img ${mainImageLoaded ? "loaded" : "loading"}`}
                onLoad={() => setMainImageLoaded(true)}
                onError={() => setMainImageError(true)}
              />
            )}
            <button
              className="image-nav-btn next"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {product.discount && (
              <div className="product-discount-badge">
                -{product.discount}% OFF
              </div>
            )}

            {product.tags && product.tags.includes("Best Seller") && (
              <div className="product-tag best-seller">
                <TrendingUp size={14} />
                Best Seller
              </div>
            )}

            {product.tags && product.tags.includes("Eco-Friendly") && (
              <div className="product-tag eco-friendly">
                <Leaf size={14} />
                Eco-Friendly
              </div>
            )}
          </div>

          <div className="product-thumbnails">
            {product.images.map((img, index) => (
              (() => {
                const thumbState = thumbnailStatus[index];
                const isThumbLoading = thumbState !== "loaded" && thumbState !== "error";

                return (
              <button
                key={index}
                className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <div className={`thumbnail-image ${isThumbLoading ? "loading" : ""}`}>
                  {isThumbLoading && <div className="ios-spinner"></div>}
                  {thumbState === "error" ? (
                    <div className="image-fallback small">IMG</div>
                  ) : (
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      onLoad={() => handleThumbnailLoad(index)}
                      onError={() => handleThumbnailError(index)}
                      className={thumbState === "loaded" ? "loaded" : "loading"}
                    />
                  )}
                </div>
              </button>
                );
              })()
            ))}
          </div>
        </div>

        {/* Middle Column - Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <div className="product-category">
              <span>{product.category}</span>
              {product.subCategory && (
                <>
                  <span> • </span>
                  <span>{product.subCategory}</span>
                </>
              )}
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'filled' : 'empty'}
                    fill={i < Math.floor(product.rating) ? "#fbbf24" : "#e5e7eb"}
                  />
                ))}
              </div>
              <span className="rating-value">{product.rating}</span>
              <span className="rating-count">({product.reviewCount} reviews)</span>
              {product.inStock ? (
                <span className="stock-status in-stock">
                  <Check size={14} />
                  In Stock
                </span>
              ) : (
                <span className="stock-status out-stock">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="product-price-section">
            <div className="price-display">
              {HIDE_PRODUCT_PRICES ? (
                <span className="price-unavailable">Price will be shown after commercial launch.</span>
              ) : (
                <>
                  <span className="current-price">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                      <span className="discount-percent">Save {product.discount}%</span>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="delivery-info">
              <div className="delivery-item">
                <Truck size={18} />
                <div>
                  <span className="delivery-title">Free Delivery</span>
                  <span className="delivery-subtitle">{product.deliveryInfo?.estimatedDelivery || "3-5 days"}</span>
                </div>
              </div>

              <div className="delivery-item">
                <RotateCcw size={18} />
                <div>
                  <span className="delivery-title">Easy Returns</span>
                  <span className="delivery-subtitle">{product.deliveryInfo?.returns || "30 days"}</span>
                </div>
              </div>

              <div className="delivery-item">
                <Shield size={18} />
                <div>
                  <span className="delivery-title">Warranty</span>
                  <span className="delivery-subtitle">{product.deliveryInfo?.warranty || "1 year"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="product-description">
            <p>{product.description}</p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="product-features">
              <h3>Key Features</h3>
              <ul className="features-list">
                {product.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").trim()}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Info */}
          {product.artisanInfo && (
            <div className="artisan-info">
              <div className="artisan-header">
                <Users size={20} />
                <h3>Seller Details</h3>
              </div>
              <div className="artisan-details">
                <div className="artisan-item">
                  <span className="artisan-label">Shop Name:</span>
                  <span className="artisan-value">{product.artisanInfo.shopName}</span>
                </div>
                <div className="artisan-item">
                  <span className="artisan-label">Address:</span>
                  <span className="artisan-value">{product.artisanInfo.address}</span>
                </div>
                <div className="artisan-item">
                  <span className="artisan-label">Status:</span>
                  <span className="artisan-value artisan-value--status">
                    {product.artisanInfo.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {web3Profile && (
            <div className="product-web3-panel">
              <div className="product-web3-panel__header">
                <div className="product-web3-panel__badge">
                  <Blocks size={20} />
                </div>
                <div>
                  <h3>Web3 Provenance</h3>
                  <p>
                    This listing is framed for NFT minting, royalty routing, escrow protection, and
                    future auction or offer execution.
                  </p>
                </div>
              </div>

              <div className="product-web3-grid">
                <div className="product-web3-metric">
                  <span>Token standard</span>
                  <strong>{web3Profile.tokenStandard}</strong>
                </div>
                <div className="product-web3-metric">
                  <span>Creator royalty</span>
                  <strong>{web3Profile.royaltyPercent}%</strong>
                </div>
                <div className="product-web3-metric">
                  <span>Settlement rail</span>
                  <strong>{web3Profile.settlementRail}</strong>
                </div>
                <div className="product-web3-metric">
                  <span>Listing mode</span>
                  <strong>{web3Profile.editionLabel}</strong>
                </div>
              </div>

              <div className="product-web3-chip-row">
                {productContracts.map((contract) => (
                  <span key={contract.key} className={`product-web3-chip priority-${contract.priority.toLowerCase()}`}>
                    {contract.name} {contract.priority}
                  </span>
                ))}
              </div>

              <div className="product-web3-footer">
                <div className="product-web3-footer__copy">
                  <Wallet size={18} />
                  <span>
                    {isWalletConnected
                      ? `Wallet linked on ${chainConfig.name}.`
                      : "Connect a wallet to inspect explorer activity from inside the marketplace."}
                  </span>
                </div>

                {isWalletConnected ? (
                  <a href={walletExplorerUrl || "#"} target="_blank" rel="noreferrer">
                    <span>Open wallet explorer</span>
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <Link to="/web3">
                    <span>Connect wallet</span>
                    <ExternalLink size={16} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Purchase Box */}
        <div className="purchase-section">
          <div className="purchase-card">
            <div className="purchase-header">
              <h3>Purchase Options</h3>
              <div className="stock-info">
                <Package size={16} />
                <span>
                  {product.inStock
                    ? `${product.stockCount || 'Limited'} units available`
                    : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input"
                  aria-label="Quantity"
                />
                <button
                  className="quantity-btn"
                  onClick={incrementQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="price-summary">
              {HIDE_PRODUCT_PRICES ? (
                <div className="price-row total">
                  <span>Total:</span>
                  <span className="total-price">Price hidden until commercial launch</span>
                </div>
              ) : (
                <>
                  <div className="price-row">
                    <span>Price ({quantity} items):</span>
                    <span className="item-price">{formatPrice(product.price * quantity)}</span>
                  </div>
                  {product.originalPrice && (
                    <div className="price-row">
                      <span>You Save:</span>
                      <span className="savings">{formatPrice((product.originalPrice - product.price) * quantity)}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>Total:</span>
                    <span className="total-price">{formatPrice(product.price * quantity)}</span>
                  </div>
                </>
              )}
            </div>

            {web3Profile && (
              <div className="purchase-web3-callout">
                <div className="purchase-web3-callout__icon">
                  <Wallet size={18} />
                </div>
                <div>
                  <strong>Web3-ready purchase path</strong>
                  <span>
                    {web3Profile.settlementRail} with {web3Profile.royaltyPercent}% creator royalty
                    and upgrade paths for offers and auctions.
                  </span>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>

              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                <span>Buy Now</span>
              </button>
            </div>

            <div className="secondary-actions">
              <button
                className={`product-wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
                onClick={handleWishlist}
              >
                <Heart size={18} fill={isInWishlist ? "#ef4444" : "none"} />
                <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                className="share-btn"
                onClick={handleShare}
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {recentProducts.length > 0 && (
        <div className="recently-viewed-section">
          <div className="section-header">
            <h2>Recently Viewed</h2>
            <Link to="/products" className="view-all-link">
              Browse More
            </Link>
          </div>

          <div className="recently-viewed-grid">
            {recentProducts.map((item) => (
              <Link key={item.id} to={`/products/${item.id}`} className="recently-viewed-card">
                <div className="recently-viewed-card__image">
                  <img
                    src={item.image || fallbackImage}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="recently-viewed-card__body">
                  <span className="recently-viewed-card__category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <strong>{HIDE_PRODUCT_PRICES ? "Price hidden" : formatPrice(item.price)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      <div className="related-products-section">
        <div className="section-header">
          <h2>You May Also Like</h2>
          <Link to="/products" className="view-all-link">
            View All Products
          </Link>
        </div>

        <div className="related-products-grid">
          {relatedProducts.map((related) => (
            (() => {
              const relatedState = relatedStatus[related.id];
              const isRelatedLoading = relatedState !== "loaded" && relatedState !== "error";

              return (
            <div key={related.id} className="related-product-card">
              <Link to={`/products/${related.id}`} className="related-product-link">
                <div className="related-product-image">
                  {isRelatedLoading && (
                    <div className="image-loading-overlay">
                      <div className="ios-spinner"></div>
                    </div>
                  )}
                  {relatedState === "error" ? (
                    <div className="image-fallback">IMG</div>
                  ) : (
                    <img
                      src={related.image}
                      alt={related.name}
                      onLoad={() => handleRelatedLoad(related.id)}
                      onError={() => handleRelatedError(related.id)}
                      className={relatedState === "loaded" ? "loaded" : "loading"}
                    />
                  )}
                </div>
                <div className="related-product-info">
                  <h4>{related.name}</h4>
                  <div className="related-product-rating">
                    <Star size={14} fill="#fbbf24" />
                    <span>{related.rating}</span>
                  </div>
                  <div className="related-product-price">
                    {HIDE_PRODUCT_PRICES ? "Price hidden" : formatPrice(related.price)}
                  </div>
                </div>
              </Link>
              <button
                className="quick-add-btn"
                onClick={() => addToCart({
                  id: related.id,
                  name: related.name,
                  price: related.price,
                  qty: 1,
                  image: related.image
                })}
              >
                <ShoppingCart size={16} />
                <span>Quick Add</span>
              </button>
            </div>
              );
            })()
          ))}
        </div>
      </div>
    </div>
  );
}
