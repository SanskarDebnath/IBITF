import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  FolderPlus,
  PackageSearch,
  ReceiptText,
  Search,
  ShoppingBag,
  Truck
} from "lucide-react";
import { listSellerOrders } from "../../services/sellerService";
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

const priorityStatuses = ["placed", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function SellerOrdersPage() {
  const [orderLines, setOrderLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await listSellerOrders();
        setOrderLines(data || []);
      } catch (err) {
        setError(err.message || "Failed to load seller orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const orders = useMemo(() => {
    const groupedOrders = orderLines.reduce((accumulator, line) => {
      const orderId = line.order_id;

      if (!accumulator[orderId]) {
        accumulator[orderId] = {
          orderId,
          createdAt: line.created_at,
          status: (line.status || "placed").toLowerCase(),
          totalItems: 0,
          totalAmount: 0,
          lines: []
        };
      }

      accumulator[orderId].totalItems += Number(line.qty || 0);
      accumulator[orderId].totalAmount += Number(line.line_total || 0);
      accumulator[orderId].lines.push(line);

      return accumulator;
    }, {});

    return Object.values(groupedOrders).sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  }, [orderLines]);

  const availableStatuses = useMemo(() => {
    const dynamicStatuses = Array.from(new Set(orders.map((order) => order.status)));
    return [...new Set([...priorityStatuses, ...dynamicStatuses])];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        String(order.orderId).includes(normalizedQuery) ||
        order.lines.some((line) => {
          const productId = String(line.product_id || "");
          const title = (line.title || "").toLowerCase();
          return productId.includes(normalizedQuery) || title.includes(normalizedQuery);
        });

      return matchesStatus && matchesQuery;
    });
  }, [orders, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    return filteredOrders.reduce(
      (accumulator, order) => {
        accumulator.totalOrders += 1;
        accumulator.totalItems += order.totalItems;
        accumulator.totalRevenue += order.totalAmount;
        accumulator.statusCounts[order.status] = (accumulator.statusCounts[order.status] || 0) + 1;
        return accumulator;
      },
      { totalOrders: 0, totalItems: 0, totalRevenue: 0, statusCounts: {} }
    );
  }, [filteredOrders]);

  return (
    <div className="seller-orders-page">
      <div className="seller-products-header">
        <div>
          <h1>Seller Orders</h1>
          <p>Review incoming orders, filter by status, and search by product or order ID.</p>
        </div>
        <div className="seller-dashboard-actions">
          <Link className="seller-secondary-btn" to="/seller/categories/new">
            <FolderPlus size={18} />
            <span>Add Category</span>
          </Link>
          <Link className="seller-primary-btn" to="/seller/products/new">
            <Boxes size={18} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      <section className="seller-orders-summary">
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon">
            <ReceiptText size={20} />
          </div>
          <div className="seller-kpi-value">{summary.totalOrders}</div>
          <h2>Visible Orders</h2>
          <p>Orders matching your current filters.</p>
        </article>
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="seller-kpi-value">{summary.totalItems}</div>
          <h2>Items Ordered</h2>
          <p>Total quantity across the visible orders.</p>
        </article>
        <article className="seller-kpi-card">
          <div className="seller-kpi-icon">
            <Truck size={20} />
          </div>
          <div className="seller-kpi-value">{currencyFormatter.format(summary.totalRevenue)}</div>
          <h2>Order Revenue</h2>
          <p>Revenue from the order items shown below.</p>
        </article>
      </section>

      <section className="seller-panel seller-toolbar-panel">
        <div className="seller-toolbar-grid seller-toolbar-grid--orders">
          <label className="seller-toolbar-field seller-toolbar-field--search">
            <span>Search Orders</span>
            <div className="seller-search-input">
              <Search size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by order ID, product ID, or product title"
              />
            </div>
          </label>

          <label className="seller-toolbar-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="seller-status-chip-row">
          {availableStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`seller-status-chip${statusFilter === status ? " active" : ""}`}
              onClick={() => setStatusFilter((current) => (current === status ? "all" : status))}
            >
              <span className={`seller-status-badge status-${status}`}>{status}</span>
              <strong>{summary.statusCounts[status] || 0}</strong>
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="seller-panel">
          <p className="seller-empty-text">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="seller-panel">
          <div className="seller-alert error">{error}</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="seller-panel seller-empty-state-card">
          <PackageSearch size={28} />
          <h2>No orders found</h2>
          <p>Try changing your status filter or search query.</p>
        </div>
      ) : (
        <div className="seller-order-list">
          {filteredOrders.map((order) => (
            <article key={order.orderId} className="seller-order-card">
              <div className="seller-order-card__header">
                <div>
                  <h2>Order #{order.orderId}</h2>
                  <p>{dateFormatter.format(new Date(order.createdAt))}</p>
                </div>
                <div className="seller-order-card__meta">
                  <span className={`seller-status-badge status-${order.status}`}>{order.status}</span>
                  <strong>{currencyFormatter.format(order.totalAmount)}</strong>
                </div>
              </div>

              <div className="seller-order-items">
                {order.lines.map((line) => (
                  <div key={line.order_item_id} className="seller-order-item">
                    <div>
                      <strong>{line.title}</strong>
                      <span>Product ID: {line.product_id}</span>
                    </div>
                    <div>
                      <span>Qty: {line.qty}</span>
                      <strong>{currencyFormatter.format(Number(line.line_total || 0))}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
