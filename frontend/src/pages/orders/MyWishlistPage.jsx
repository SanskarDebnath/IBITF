import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";
import { useWishlist } from "../../app/providers/WishlistProvider";
import { Heart, ShoppingCart, X } from "lucide-react";
import "./MyWishlistPage.css";

export default function MyWishlistPage() {
  const { addToCart } = useCart();
  const { items, loading, removeFromWishlist, reloadWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredItems = useMemo(() => {
    if (selectedFilter === "in-stock") return items.filter((item) => item.inStock);
    if (selectedFilter === "out-of-stock") return items.filter((item) => !item.inStock);
    return items;
  }, [items, selectedFilter]);

  const removeItem = async (productId) => {
    await removeFromWishlist(productId);
    await reloadWishlist();
    showToast("Removed from wishlist", "info");
  };

  const moveToCart = async (item) => {
    if (!item.inStock) {
      showToast("This item is currently out of stock", "error");
      return;
    }
    await addToCart({ id: item.productId, name: item.name, price: item.price, qty: 1 });
    await removeFromWishlist(item.productId);
    await reloadWishlist();
    showToast("Moved to cart successfully!", "success");
  };

  const addAllToCart = async () => {
    const inStockItems = items.filter((item) => item.inStock);
    if (inStockItems.length === 0) {
      showToast("No items in stock to add to cart", "error");
      return;
    }
    for (const item of inStockItems) {
      await addToCart({ id: item.productId, name: item.name, price: item.price, qty: 1 });
      await removeFromWishlist(item.productId);
    }
    await reloadWishlist();
    showToast(`Added ${inStockItems.length} items to cart`, "success");
  };

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div className="wishlist-hero">
          <div className="wishlist-hero-content">
            <div className="wishlist-hero-icon">
              <Heart size={40} />
            </div>
            <h1>My Wishlist</h1>
            <p>Save items you love for later</p>
          </div>
        </div>
      </div>

      <div className="wishlist-main">
        <aside className="wishlist-sidebar">
          <div className="wishlist-sidebar-card">
            <h3 className="wishlist-sidebar-title">Filters</h3>
            <div className="wishlist-filters">
              <button
                className={`wishlist-filter-btn ${selectedFilter === "all" ? "active" : ""}`}
                onClick={() => setSelectedFilter("all")}
              >
                <span>All Items ({items.length})</span>
              </button>
              <button
                className={`wishlist-filter-btn ${selectedFilter === "in-stock" ? "active" : ""}`}
                onClick={() => setSelectedFilter("in-stock")}
              >
                <span>In Stock ({items.filter((i) => i.inStock).length})</span>
              </button>
              <button
                className={`wishlist-filter-btn ${selectedFilter === "out-of-stock" ? "active" : ""}`}
                onClick={() => setSelectedFilter("out-of-stock")}
              >
                <span>Out of Stock ({items.filter((i) => !i.inStock).length})</span>
              </button>
            </div>
          </div>

          <div className="wishlist-sidebar-card">
            <h3 className="wishlist-sidebar-title">Quick Actions</h3>
            <div className="wishlist-actions">
              <button
                className="wishlist-action-btn primary"
                onClick={addAllToCart}
                disabled={items.filter((i) => i.inStock).length === 0}
              >
                <ShoppingCart size={18} />
                <span>Add All to Cart</span>
              </button>
              <Link to="/products" className="wishlist-action-btn secondary">
                <ShoppingCart size={18} />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        </aside>

        <main className="wishlist-content">
          <div className="wishlist-content-header">
            <div className="wishlist-header-info">
              <h2>Saved Items</h2>
              <p className="wishlist-subtitle">
                {filteredItems.length} of {items.length} items
              </p>
            </div>
          </div>

          {loading ? (
            <div className="wishlist-empty-state">Loading wishlist...</div>
          ) : filteredItems.length === 0 ? (
            <div className="wishlist-empty-state">
              <div className="wishlist-empty-icon">
                <Heart size={64} />
              </div>
              <h3>Your wishlist is empty</h3>
              <p className="wishlist-empty-text">Add items you love and revisit them anytime.</p>
              <Link to="/products" className="wishlist-browse-btn">
                <ShoppingCart size={18} />
                <span>Browse Products</span>
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {filteredItems.map((item) => (
                <div
                  key={item.productId}
                  className="wishlist-item-card"
                  onClick={() => navigate(`/products/${item.productId}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/products/${item.productId}`);
                    }
                  }}
                >
                  <div className="wishlist-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" className="wishlist-item-img loaded" />
                    ) : (
                      <div className="wishlist-image-fallback">IMG</div>
                    )}
                    <button
                      type="button"
                      className="wishlist-item-remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeItem(item.productId);
                      }}
                      aria-label="Remove from wishlist"
                      title="Remove"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="wishlist-item-body">
                    <div className="wishlist-item-header">
                      <h3 className="wishlist-item-title">{item.name}</h3>
                    </div>
                    <p className="wishlist-item-description">{item.description}</p>
                    <div className="wishlist-item-price-section">
                      <div className="wishlist-item-price">
                        <span className="wishlist-item-current">₹{item.price}</span>
                      </div>
                      <div className={`wishlist-item-stock ${item.inStock ? "in-stock" : "out-stock"}`}>
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>
                    <div className="wishlist-item-actions">
                      <button
                        type="button"
                        className="wishlist-item-move-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveToCart(item);
                        }}
                        disabled={!item.inStock}
                      >
                        <ShoppingCart size={18} />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
