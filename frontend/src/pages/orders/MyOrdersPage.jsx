import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  CreditCard,
  MapPin,
  PackageSearch,
  ReceiptText,
  Search,
  ShoppingBag,
  Truck,
  Wallet,
  X
} from "lucide-react";
import { getOrder, listOrders } from "../../services/ordersService";
import "./MyOrdersPage.css";

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

const preferredStatuses = ["placed", "pending", "processing", "shipped", "delivered", "cancelled"];
const statusLabels = {
  placed: "Placed",
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
  refunded: "Refunded",
  returned: "Returned"
};
const trackingStepDefinitions = [
  {
    key: "placed",
    label: "Order placed",
    description: "Your order has been confirmed and is now in the system."
  },
  {
    key: "processing",
    label: "Preparing shipment",
    description: "The seller is packing your items and getting them ready."
  },
  {
    key: "shipped",
    label: "On the way",
    description: "Your package has left the seller and is moving through transit."
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "The shipment has reached the delivery address."
  }
];

function normalizeStatus(status) {
  return (status || "placed").toLowerCase();
}

function addDays(dateValue, days) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date;
}

function buildTrackingData(order) {
  const status = normalizeStatus(order?.status);
  const progressIndexMap = {
    placed: 0,
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    refunded: 3,
    returned: 3
  };
  const isTerminalIssue = ["cancelled", "failed"].includes(status);
  const currentIndex = progressIndexMap[status] ?? 0;
  const estimatedDelivery = addDays(order?.created_at, 5);

  const steps = trackingStepDefinitions.map((step, index) => {
    const projectedDate =
      index === 0
        ? order?.created_at
        : index === 1
          ? addDays(order?.created_at, 1)
          : index === 2
            ? addDays(order?.created_at, 2)
            : estimatedDelivery;

    let state = "upcoming";

    if (isTerminalIssue) {
      state = index === 0 ? "complete" : index === 1 ? "current-error" : "upcoming";
    } else if (status === "delivered" || status === "refunded" || status === "returned") {
      state = "complete";
    } else if (index < currentIndex) {
      state = "complete";
    } else if (index === currentIndex) {
      state = "current";
    }

    return {
      ...step,
      state,
      projectedDate
    };
  });

  return {
    status,
    statusLabel: statusLabels[status] || status,
    estimatedDelivery,
    isTerminalIssue,
    notice: isTerminalIssue
      ? "This order is no longer moving because it was cancelled or failed."
      : status === "delivered"
        ? "This order has been delivered successfully."
        : "Tracking is based on the current order status recorded in your account.",
    steps
  };
}

export default function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get("status") || "all").toLowerCase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [activeModal, setActiveModal] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [orderDetailsCache, setOrderDetailsCache] = useState({});

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await listOrders();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || "Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const availableStatuses = useMemo(() => {
    const dynamicStatuses = Array.from(new Set(orders.map((order) => (order.status || "placed").toLowerCase())));
    return [...new Set([...preferredStatuses, ...dynamicStatuses])];
  }, [orders]);

  useEffect(() => {
    const nextStatus = (searchParams.get("status") || "all").toLowerCase();
    setStatusFilter(nextStatus);
  }, [searchParams]);

  useEffect(() => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (statusFilter === "all") {
        nextParams.delete("status");
      } else {
        nextParams.set("status", statusFilter);
      }
      return nextParams;
    }, { replace: true });
  }, [setSearchParams, statusFilter]);

  useEffect(() => {
    if (!activeModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveModal(null);
        setModalError("");
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const orderStatus = (order.status || "placed").toLowerCase();
      const matchesStatus = statusFilter === "all" || orderStatus === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        String(order.id).includes(normalizedQuery) ||
        orderStatus.includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const summary = useMemo(() => {
    return filteredOrders.reduce(
      (accumulator, order) => {
        const orderStatus = (order.status || "placed").toLowerCase();
        accumulator.totalOrders += 1;
        accumulator.totalSpend += Number(order.total_amount || 0);
        if (["placed", "pending", "processing"].includes(orderStatus)) accumulator.openOrders += 1;
        if (orderStatus === "delivered") accumulator.deliveredOrders += 1;
        return accumulator;
      },
      { totalOrders: 0, totalSpend: 0, openOrders: 0, deliveredOrders: 0 }
    );
  }, [filteredOrders]);

  const activeOrderSummary = useMemo(
    () => filteredOrders.find((order) => String(order.id) === String(activeOrderId))
      || orders.find((order) => String(order.id) === String(activeOrderId))
      || null,
    [activeOrderId, filteredOrders, orders]
  );

  const activeOrderData = selectedOrder || activeOrderSummary;
  const trackingData = activeOrderData ? buildTrackingData(activeOrderData) : null;
  const selectedItemCount = selectedOrder?.items?.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  ) || 0;

  const closeModal = () => {
    setActiveModal(null);
    setModalError("");
  };

  const openOrderModal = async (orderId, modalType) => {
    setActiveModal(modalType);
    setActiveOrderId(orderId);
    setModalError("");

    const cachedOrder = orderDetailsCache[orderId];
    if (cachedOrder) {
      setSelectedOrder(cachedOrder);
      setModalLoading(false);
      return;
    }

    setSelectedOrder(null);
    setModalLoading(true);

    try {
      const order = await getOrder(orderId);
      setSelectedOrder(order);
      setOrderDetailsCache((previous) => ({
        ...previous,
        [orderId]: order
      }));
    } catch (err) {
      setModalError(err.message || "Failed to load order details");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="my-orders-page">
      <section className="my-orders-hero">
        <div>
          <span className="my-orders-eyebrow">Buyer Dashboard</span>
          <h1>My Orders</h1>
          <p>Track every purchase, filter by status, and jump into order details quickly.</p>
        </div>
        <Link to="/products" className="my-orders-hero__link">
          Continue Shopping
        </Link>
      </section>

      <section className="my-orders-summary">
        <article className="my-orders-summary-card">
          <div className="my-orders-summary-card__icon">
            <ShoppingBag size={20} />
          </div>
          <strong>{summary.totalOrders}</strong>
          <span>Total Orders</span>
        </article>
        <article className="my-orders-summary-card">
          <div className="my-orders-summary-card__icon">
            <Wallet size={20} />
          </div>
          <strong>{currencyFormatter.format(summary.totalSpend)}</strong>
          <span>Order Spend</span>
        </article>
        <article className="my-orders-summary-card">
          <div className="my-orders-summary-card__icon">
            <Clock3 size={20} />
          </div>
          <strong>{summary.openOrders}</strong>
          <span>Open Orders</span>
        </article>
        <article className="my-orders-summary-card">
          <div className="my-orders-summary-card__icon">
            <Truck size={20} />
          </div>
          <strong>{summary.deliveredOrders}</strong>
          <span>Delivered</span>
        </article>
      </section>

      <section className="my-orders-toolbar">
        <label className="my-orders-search">
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by order ID or status"
          />
        </label>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="my-orders-empty">
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="my-orders-empty my-orders-empty--error">
          <p>{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="my-orders-empty">
          <PackageSearch size={28} />
          <h2>No orders found</h2>
          <p>Try a different status filter or start shopping to place your first order.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      ) : (
        <div className="my-orders-grid">
          {filteredOrders.map((order) => {
            const orderStatus = (order.status || "placed").toLowerCase();

            return (
              <article key={order.id} className="my-orders-card">
                <div className="my-orders-card__header">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>{dateFormatter.format(new Date(order.created_at))}</p>
                  </div>
                  <span className={`my-orders-status status-${orderStatus}`}>{orderStatus}</span>
                </div>

                <div className="my-orders-card__stats">
                  <div>
                    <span>Total</span>
                    <strong>{currencyFormatter.format(Number(order.total_amount || 0))}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{orderStatus}</strong>
                  </div>
                </div>

                <div className="my-orders-card__actions">
                  <button
                    type="button"
                    className="my-orders-card__button my-orders-card__button--primary"
                    onClick={() => openOrderModal(order.id, "details")}
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    className="my-orders-card__button my-orders-card__button--secondary"
                    onClick={() => openOrderModal(order.id, "tracking")}
                  >
                    Track Order
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeModal && (
        <div className="my-orders-modal-backdrop" onClick={closeModal}>
          <div className="my-orders-modal" onClick={(event) => event.stopPropagation()}>
            <div className="my-orders-modal__header">
              <div>
                <span className="my-orders-modal__eyebrow">
                  {activeModal === "details" ? "Order Details" : "Track Order"}
                </span>
                <h2>Order #{activeOrderId}</h2>
                {activeOrderData && (
                  <p>
                    Placed on {dateFormatter.format(new Date(activeOrderData.created_at))}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="my-orders-modal__close"
                onClick={closeModal}
                aria-label="Close order modal"
              >
                <X size={20} />
              </button>
            </div>

            {modalLoading ? (
              <div className="my-orders-modal__state">
                <p>Loading order information...</p>
              </div>
            ) : modalError ? (
              <div className="my-orders-modal__state my-orders-modal__state--error">
                <CircleAlert size={20} />
                <p>{modalError}</p>
              </div>
            ) : activeModal === "details" ? (
              selectedOrder ? (
                <div className="my-orders-modal__body">
                  <div className="my-orders-modal__summary">
                    <article className="my-orders-modal__summary-card">
                      <span>Total</span>
                      <strong>{currencyFormatter.format(Number(selectedOrder.total_amount || 0))}</strong>
                    </article>
                    <article className="my-orders-modal__summary-card">
                      <span>Items</span>
                      <strong>{selectedItemCount}</strong>
                    </article>
                    <article className="my-orders-modal__summary-card">
                      <span>Status</span>
                      <strong>{statusLabels[normalizeStatus(selectedOrder.status)] || selectedOrder.status}</strong>
                    </article>
                  </div>

                  <section className="my-orders-modal__section">
                    <div className="my-orders-modal__section-head">
                      <h3>Ordered Items</h3>
                      <span>{selectedOrder.items?.length || 0} products</span>
                    </div>

                    <div className="my-orders-modal__items">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="my-orders-modal__item">
                          <div>
                            <strong>{item.title}</strong>
                            <span>Product ID: {item.product_id}</span>
                          </div>
                          <div className="my-orders-modal__item-meta">
                            <span>{currencyFormatter.format(Number(item.price || 0))} x {item.qty}</span>
                            <strong>{currencyFormatter.format(Number(item.line_total || 0))}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="my-orders-modal__grid">
                    <section className="my-orders-modal__info-card">
                      <div className="my-orders-modal__info-title">
                        <MapPin size={18} />
                        <h3>Shipping Address</h3>
                      </div>
                      <p>{selectedOrder.shipping_address || "No shipping address was saved for this order."}</p>
                    </section>

                    <section className="my-orders-modal__info-card">
                      <div className="my-orders-modal__info-title">
                        <CreditCard size={18} />
                        <h3>Payment & Timeline</h3>
                      </div>
                      <dl className="my-orders-modal__facts">
                        <div>
                          <dt>Payment</dt>
                          <dd>{selectedOrder.payment_method || "Not specified"}</dd>
                        </div>
                        <div>
                          <dt>Created</dt>
                          <dd>{dateFormatter.format(new Date(selectedOrder.created_at))}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{statusLabels[normalizeStatus(selectedOrder.status)] || selectedOrder.status}</dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="my-orders-modal__state">
                  <p>No order details found.</p>
                </div>
              )
            ) : activeModal === "tracking" && trackingData ? (
              <div className="my-orders-modal__body">
                <div className="my-orders-track__hero">
                  <div>
                    <span className={`my-orders-status status-${trackingData.status}`}>
                      {trackingData.statusLabel}
                    </span>
                    <h3>
                      {trackingData.isTerminalIssue
                        ? "Order movement stopped"
                        : trackingData.status === "delivered"
                          ? "Package delivered"
                          : "Shipment is in progress"}
                    </h3>
                    <p>{trackingData.notice}</p>
                  </div>

                  <div className="my-orders-track__eta">
                    <span>Estimated delivery</span>
                    <strong>
                      {trackingData.estimatedDelivery
                        ? dateFormatter.format(trackingData.estimatedDelivery)
                        : "Pending"}
                    </strong>
                  </div>
                </div>

                <section className="my-orders-modal__section">
                  <div className="my-orders-modal__section-head">
                    <h3>Tracking Timeline</h3>
                    <span>Based on your current order status</span>
                  </div>

                  <div className="my-orders-track__timeline">
                    {trackingData.steps.map((step, index) => (
                      <div
                        key={step.key}
                        className={`my-orders-track__step state-${step.state}`}
                      >
                        <div className="my-orders-track__marker">{index + 1}</div>
                        <div className="my-orders-track__content">
                          <h4>{step.label}</h4>
                          <p>{step.description}</p>
                          <span>
                            {step.state === "complete"
                              ? `Completed ${step.projectedDate ? dateFormatter.format(new Date(step.projectedDate)) : ""}`.trim()
                              : step.state === "current"
                                ? `Current stage as of ${step.projectedDate ? dateFormatter.format(new Date(step.projectedDate)) : "today"}`
                                : step.state === "current-error"
                                  ? `Order interrupted after ${dateFormatter.format(new Date(activeOrderData.created_at))}`
                                  : `Expected around ${step.projectedDate ? dateFormatter.format(new Date(step.projectedDate)) : "later"}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="my-orders-modal__grid">
                  <section className="my-orders-modal__info-card">
                    <div className="my-orders-modal__info-title">
                      <ReceiptText size={18} />
                      <h3>Order Snapshot</h3>
                    </div>
                    <dl className="my-orders-modal__facts">
                      <div>
                        <dt>Order total</dt>
                        <dd>{currencyFormatter.format(Number(activeOrderData.total_amount || 0))}</dd>
                      </div>
                      <div>
                        <dt>Current status</dt>
                        <dd>{trackingData.statusLabel}</dd>
                      </div>
                      <div>
                        <dt>Placed on</dt>
                        <dd>{dateFormatter.format(new Date(activeOrderData.created_at))}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="my-orders-modal__info-card">
                    <div className="my-orders-modal__info-title">
                      <CalendarDays size={18} />
                      <h3>Delivery Address</h3>
                    </div>
                    <p>{selectedOrder?.shipping_address || "Delivery address will appear here when saved with the order."}</p>
                  </section>
                </div>
              </div>
            ) : (
              <div className="my-orders-modal__state">
                <p>No order data found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
