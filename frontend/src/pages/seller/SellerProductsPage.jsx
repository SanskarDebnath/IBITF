import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageSearch,
  PackageX,
  Plus,
  Search
} from "lucide-react";
import { listSellerProducts } from "../../services/sellerService";
import "./SellerForms.css";

const LOW_STOCK_LIMIT = 5;
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const fallbackImage = "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

function resolveImage(image) {
  if (!image) return fallbackImage;
  if (image.startsWith("http") || image.startsWith("data:") || image.startsWith("blob:")) {
    return image;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${image.startsWith("/") ? image : `/${image}`}`;
}

function getStockState(stock) {
  const qty = Number(stock || 0);
  if (qty <= 0) return "out";
  if (qty <= LOW_STOCK_LIMIT) return "low";
  return "healthy";
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await listSellerProducts();
        setProducts(data || []);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const summary = useMemo(() => {
    return products.reduce(
      (accumulator, product) => {
        const stockState = getStockState(product.stock);
        accumulator.total += 1;
        if ((product.status || "").toLowerCase() === "active") accumulator.active += 1;
        if (stockState === "low") accumulator.lowStock += 1;
        if (stockState === "out") accumulator.outOfStock += 1;
        return accumulator;
      },
      { total: 0, active: 0, lowStock: 0, outOfStock: 0 }
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const nextProducts = products.filter((product) => {
      const stockState = getStockState(product.stock);
      const matchesQuery =
        !normalizedQuery ||
        product.title?.toLowerCase().includes(normalizedQuery) ||
        product.description?.toLowerCase().includes(normalizedQuery) ||
        product.category_name?.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || (product.status || "").toLowerCase() === statusFilter;
      const matchesStock = stockFilter === "all" || stockState === stockFilter;

      return matchesQuery && matchesStatus && matchesStock;
    });

    nextProducts.sort((left, right) => {
      switch (sortBy) {
        case "price-desc":
          return Number(right.price || 0) - Number(left.price || 0);
        case "price-asc":
          return Number(left.price || 0) - Number(right.price || 0);
        case "stock-asc":
          return Number(left.stock || 0) - Number(right.stock || 0);
        case "title":
          return (left.title || "").localeCompare(right.title || "");
        default:
          return Number(right.id || 0) - Number(left.id || 0);
      }
    });

    return nextProducts;
  }, [products, searchQuery, statusFilter, stockFilter, sortBy]);

  return (
    <div className="seller-products-page">
      <div className="seller-products-header">
        <div>
          <h1>Manage Products</h1>
          <p>Search listings, catch low stock, and keep your catalog clean.</p>
        </div>
        <Link className="seller-primary-btn" to="/seller/products/new">
          <Plus size={18} />
          <span>Add Product</span>
        </Link>
      </div>

      <section className="seller-kpi-grid">
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon"><Boxes size={20} /></div>
          <div className="seller-kpi-value">{summary.total}</div>
          <h2>Total Listings</h2>
          <p>All products in your seller catalog.</p>
        </article>
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon"><CheckCircle2 size={20} /></div>
          <div className="seller-kpi-value">{summary.active}</div>
          <h2>Active Products</h2>
          <p>Listings currently visible for buyers.</p>
        </article>
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon"><AlertTriangle size={20} /></div>
          <div className="seller-kpi-value">{summary.lowStock}</div>
          <h2>Low Stock</h2>
          <p>{LOW_STOCK_LIMIT} units or less remaining.</p>
        </article>
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon"><PackageX size={20} /></div>
          <div className="seller-kpi-value">{summary.outOfStock}</div>
          <h2>Out of Stock</h2>
          <p>Listings that need replenishment.</p>
        </article>
      </section>

      <section className="seller-panel seller-toolbar-panel">
        <div className="seller-toolbar-grid">
          <label className="seller-toolbar-field seller-toolbar-field--search">
            <span>Search Products</span>
            <div className="seller-search-input">
              <Search size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, category, or description"
              />
            </div>
          </label>

          <label className="seller-toolbar-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="seller-toolbar-field">
            <span>Stock</span>
            <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
              <option value="all">All stock states</option>
              <option value="healthy">Healthy</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>

          <label className="seller-toolbar-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="title">Title A-Z</option>
              <option value="price-desc">Price high to low</option>
              <option value="price-asc">Price low to high</option>
              <option value="stock-asc">Lowest stock first</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <div className="seller-panel">
          <p className="seller-empty-text">Loading products...</p>
        </div>
      ) : error ? (
        <div className="seller-panel">
          <div className="seller-alert error">{error}</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="seller-panel seller-empty-state-card">
          <PackageSearch size={28} />
          <h2>No matching products</h2>
          <p>Try changing your search or filters, or add a new listing.</p>
        </div>
      ) : (
        <div className="seller-products-grid seller-products-grid--enhanced">
          {filteredProducts.map((product) => {
            const stockState = getStockState(product.stock);
            const stockLabel = stockState === "out" ? "Out of stock" : stockState === "low" ? "Low stock" : "Healthy stock";

            return (
              <article key={product.id} className="seller-product-card seller-product-card--enhanced">
                <div className="seller-product-card__media">
                  <img
                    src={resolveImage(product.image)}
                    alt={product.title}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>

                <div className="seller-product-card__body">
                  <div className="seller-product-card__top">
                    <div>
                      <h3>{product.title}</h3>
                      <div className="seller-product-meta">{product.category_name || "Uncategorized"}</div>
                    </div>
                    <span className={`seller-status-badge status-${(product.status || "inactive").toLowerCase()}`}>
                      {product.status}
                    </span>
                  </div>

                  <div className="seller-product-card__stats">
                    <div>
                      <span>Price</span>
                      <strong>{currencyFormatter.format(Number(product.price || 0))}</strong>
                    </div>
                    <div>
                      <span>Stock</span>
                      <strong>{product.stock}</strong>
                    </div>
                  </div>

                  <div className="seller-product-card__foot">
                    <span className={`seller-stock-pill seller-stock-pill--${stockState}`}>{stockLabel}</span>
                    <Link className="seller-secondary-btn" to={`/seller/products/${product.id}/edit`}>
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
