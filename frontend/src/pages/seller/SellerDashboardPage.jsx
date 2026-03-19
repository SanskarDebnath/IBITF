import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  FolderPlus,
  PackagePlus,
  ReceiptText,
  ShoppingBag,
  Store
} from "lucide-react";
import { getSellerDashboard } from "../../services/sellerService";
import "./SellerForms.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const initialSummary = {
  seller: null,
  totalProducts: 0,
  totalStock: 0,
  totalOrders: 0,
  totalItemsSold: 0,
  totalRevenue: 0,
  totalCategories: 0,
  recentOrders: []
};

export default function SellerDashboardPage() {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getSellerDashboard();
        setSummary({ ...initialSummary, ...data });
      } catch (err) {
        setError(err.message || "Failed to load seller dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Products Added",
      value: summary.totalProducts,
      hint: `${summary.totalStock} units in stock`,
      icon: <Boxes size={20} />
    },
    {
      label: "Items Sold",
      value: summary.totalItemsSold,
      hint: "Total units sold from your listings",
      icon: <ShoppingBag size={20} />
    },
    {
      label: "Orders Received",
      value: summary.totalOrders,
      hint: "Unique customer orders",
      icon: <ReceiptText size={20} />
    },
    {
      label: "Categories",
      value: summary.totalCategories,
      hint: "Available for product listing",
      icon: <FolderPlus size={20} />
    }
  ];

  return (
    <div className="seller-dashboard-page">
      <section className="seller-dashboard-hero">
        <div>
          <div className="seller-dashboard-eyebrow">
            <Store size={16} />
            <span>Seller Portal</span>
          </div>
          <h1>{summary.seller?.shopName || "Seller Dashboard"}</h1>
          <p>
            Track how many products you added, how many units you sold, and how many orders
            came in from one place.
          </p>
        </div>

        <div className="seller-dashboard-actions">
          <Link className="seller-primary-btn" to="/seller/products/new">
            <PackagePlus size={18} />
            <span>Add Product</span>
          </Link>
          <Link className="seller-secondary-btn seller-secondary-btn--dark" to="/seller/categories/new">
            <FolderPlus size={18} />
            <span>Add Category</span>
          </Link>
          <Link className="seller-secondary-btn seller-secondary-btn--dark" to="/seller/orders">
            <ReceiptText size={18} />
            <span>View Orders</span>
          </Link>
          <Link className="seller-secondary-btn seller-secondary-btn--dark" to="/seller/kpis">
            <BarChart3 size={18} />
            <span>Open KPI Center</span>
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="seller-panel">
          <p className="seller-empty-text">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="seller-panel">
          <div className="seller-alert error">{error}</div>
          <div className="seller-form-actions">
            <Link className="seller-primary-btn" to="/seller/onboarding">
              Complete Seller Profile
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section id="seller-kpis" className="seller-kpi-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="seller-kpi-card">
                <div className="seller-kpi-icon">{stat.icon}</div>
                <div className="seller-kpi-value">{stat.value}</div>
                <h2>{stat.label}</h2>
                <p>{stat.hint}</p>
              </article>
            ))}
          </section>

          <section className="seller-dashboard-panels">
            <article className="seller-panel">
              <div className="seller-panel-header">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Your latest incoming orders.</p>
                </div>
                <Link className="seller-text-link" to="/seller/orders">
                  See all
                </Link>
              </div>

              {summary.recentOrders.length === 0 ? (
                <p className="seller-empty-text">No orders yet. Your first order will appear here.</p>
              ) : (
                <div className="seller-order-snippet-list">
                  {summary.recentOrders.map((order) => (
                    <div key={order.order_id} className="seller-order-snippet">
                      <div>
                        <strong>Order #{order.order_id}</strong>
                        <span>{dateFormatter.format(new Date(order.created_at))}</span>
                      </div>
                      <div>
                        <span className={`seller-status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                        <span>{order.items_count} items</span>
                        <strong>{currencyFormatter.format(order.order_total)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="seller-panel">
              <div className="seller-panel-header">
                <div>
                  <h2>Store Snapshot</h2>
                  <p>Quick performance numbers for your shop.</p>
                </div>
              </div>

              <div className="seller-snapshot-list">
                <div className="seller-snapshot-item">
                  <span>Total Revenue</span>
                  <strong>{currencyFormatter.format(summary.totalRevenue)}</strong>
                </div>
                <div className="seller-snapshot-item">
                  <span>Total Stock</span>
                  <strong>{summary.totalStock}</strong>
                </div>
                <div className="seller-snapshot-item">
                  <span>Store Status</span>
                  <strong className="seller-status-text">{summary.seller?.status || "active"}</strong>
                </div>
              </div>

              <div className="seller-quick-links">
                <Link className="seller-quick-link" to="/seller/products">
                  <span>Manage Products</span>
                  <Boxes size={18} />
                </Link>
                <Link className="seller-quick-link" to="/seller/products/new">
                  <span>Create New Listing</span>
                  <PackagePlus size={18} />
                </Link>
                <Link className="seller-quick-link" to="/seller/categories/new">
                  <span>Create New Category</span>
                  <FolderPlus size={18} />
                </Link>
                <Link className="seller-quick-link" to="/seller/orders">
                  <span>Review Orders</span>
                  <CircleDollarSign size={18} />
                </Link>
                <Link className="seller-quick-link" to="/seller/kpis">
                  <span>Open KPI Center</span>
                  <BarChart3 size={18} />
                </Link>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
