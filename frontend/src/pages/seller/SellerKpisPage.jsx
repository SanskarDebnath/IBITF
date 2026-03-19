import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  FolderClock,
  PackageSearch,
  RotateCcw,
  ShoppingBag,
  Store,
  TrendingUp,
  UserRoundPlus,
  Users
} from "lucide-react";
import { getSellerKpis } from "../../services/sellerService";
import "./SellerForms.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2
});

const initialData = {
  seller: null,
  summary: {
    totalProducts: 0,
    totalStock: 0,
    inventoryValue: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    totalRevenue: 0,
    uniqueCustomers: 0,
    engagedShoppers: 0,
    defectOrders: 0,
    returnedOrders: 0,
    lateOrders: 0,
    repeatCustomers: 0,
    estimatedAverageInventoryUnits: 0,
    shippingSlaDays: 3
  },
  charts: {
    monthlyPerformance: [],
    statusBreakdown: [],
    topProducts: []
  },
  kpis: {}
};

const qualityMeta = {
  exact: {
    label: "Exact",
    className: "seller-kpi-badge--exact"
  },
  estimated: {
    label: "Estimated",
    className: "seller-kpi-badge--estimated"
  },
  observed: {
    label: "Observed",
    className: "seller-kpi-badge--observed"
  },
  status_based: {
    label: "Status-Based",
    className: "seller-kpi-badge--status"
  },
  needs_data: {
    label: "Needs Data",
    className: "seller-kpi-badge--missing"
  }
};

const formatMetricValue = (metricKey, metricValue) => {
  if (metricValue === null || metricValue === undefined) {
    return "Not tracked";
  }

  if (
    metricKey === "averageOrderValue" ||
    metricKey === "customerAcquisitionCost" ||
    metricKey === "customerLifetimeValue"
  ) {
    return currencyFormatter.format(metricValue);
  }

  if (
    metricKey === "salesConversionRate" ||
    metricKey === "orderDefectRate" ||
    metricKey === "returnRate" ||
    metricKey === "lateShipmentRate"
  ) {
    return `${numberFormatter.format(metricValue)}%`;
  }

  return numberFormatter.format(metricValue);
};

const formatStatusLabel = (status) =>
  (status || "placed")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export default function SellerKpisPage() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadKpis = async () => {
      try {
        const response = await getSellerKpis();
        setData({
          seller: response?.seller || null,
          summary: { ...initialData.summary, ...(response?.summary || {}) },
          charts: { ...initialData.charts, ...(response?.charts || {}) },
          kpis: response?.kpis || {}
        });
      } catch (err) {
        setError(err.message || "Failed to load seller KPIs");
      } finally {
        setLoading(false);
      }
    };

    loadKpis();
  }, []);

  const { summary, charts, kpis } = data;

  const overviewCards = [
    {
      label: "Products Listed",
      value: numberFormatter.format(summary.totalProducts),
      hint: `${summary.totalStock} units currently in your inventory`,
      icon: <Boxes size={20} />
    },
    {
      label: "Seller Revenue",
      value: currencyFormatter.format(summary.totalRevenue),
      hint: "Revenue from your products only",
      icon: <CircleDollarSign size={20} />
    },
    {
      label: "Orders for Your Shop",
      value: numberFormatter.format(summary.totalOrders),
      hint: `${summary.totalItemsSold} units sold from your catalog`,
      icon: <ShoppingBag size={20} />
    },
    {
      label: "Customers",
      value: numberFormatter.format(summary.uniqueCustomers),
      hint: `${summary.repeatCustomers} repeat customers`,
      icon: <Users size={20} />
    }
  ];

  const maxMonthlyRevenue = Math.max(...charts.monthlyPerformance.map((item) => item.revenue || 0), 0);
  const totalStatusOrders = charts.statusBreakdown.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );
  const maxTopProductUnits = Math.max(...charts.topProducts.map((item) => item.unitsSold || 0), 0);

  const metricSections = [
    {
      title: "Sales & Customers",
      description: "Demand, customer quality, and average spend per purchase.",
      metrics: [
        {
          key: "salesConversionRate",
          label: "Sales Conversion Rate",
          icon: <TrendingUp size={20} />,
          support: `${summary.uniqueCustomers} buyers from ${summary.engagedShoppers} engaged shoppers`
        },
        {
          key: "averageOrderValue",
          label: "Average Order Value",
          icon: <CircleDollarSign size={20} />,
          support: `${summary.totalOrders} orders created ${currencyFormatter.format(summary.totalRevenue)} in revenue`
        },
        {
          key: "customerAcquisitionCost",
          label: "Customer Acquisition Cost",
          icon: <UserRoundPlus size={20} />,
          support: `${summary.uniqueCustomers} customers acquired so far`
        },
        {
          key: "customerLifetimeValue",
          label: "Customer Lifetime Value",
          icon: <Users size={20} />,
          support: `${summary.repeatCustomers} repeat customers in current history`
        }
      ]
    },
    {
      title: "Inventory & Margin",
      description: "How efficiently your stock is moving and what still needs cost tracking.",
      metrics: [
        {
          key: "inventoryTurnoverRatio",
          label: "Inventory Turnover Ratio",
          icon: <PackageSearch size={20} />,
          support: `${summary.totalItemsSold} units sold against ${numberFormatter.format(summary.estimatedAverageInventoryUnits)} estimated average units`
        },
        {
          key: "gmroi",
          label: "GMROI",
          icon: <Boxes size={20} />,
          support: `${currencyFormatter.format(summary.inventoryValue)} stock value on hand`
        }
      ]
    },
    {
      title: "Order Quality & Fulfilment",
      description: "Operational quality signals based on current order statuses.",
      metrics: [
        {
          key: "orderDefectRate",
          label: "Order Defect Rate",
          icon: <AlertTriangle size={20} />,
          support: `${summary.defectOrders} flagged orders out of ${summary.totalOrders}`
        },
        {
          key: "returnRate",
          label: "Return Rate",
          icon: <RotateCcw size={20} />,
          support: `${summary.returnedOrders} returned, refunded, or cancelled orders`
        },
        {
          key: "lateShipmentRate",
          label: "Late Shipment Rate",
          icon: <FolderClock size={20} />,
          support: `${summary.lateOrders} orders older than ${summary.shippingSlaDays} days still open`
        }
      ]
    }
  ];

  return (
    <div className="seller-kpis-page">
      <section className="seller-dashboard-hero seller-dashboard-hero--kpis">
        <div>
          <div className="seller-dashboard-eyebrow">
            <Store size={16} />
            <span>KPI Center</span>
          </div>
          <h1>{data.seller?.shopName || "Seller KPIs"}</h1>
          <p>
            Follow seller-specific metrics for your own products, orders, customers, inventory,
            and fulfilment from one page.
          </p>
        </div>

        <div className="seller-dashboard-actions">
          <Link className="seller-secondary-btn seller-secondary-btn--dark" to="/seller/dashboard">
            Dashboard
          </Link>
          <Link className="seller-secondary-btn seller-secondary-btn--dark" to="/seller/orders">
            Orders
          </Link>
          <Link className="seller-primary-btn" to="/seller/products/new">
            <ArrowRight size={18} />
            <span>Add Product</span>
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="seller-panel">
          <p className="seller-empty-text">Loading KPI dashboard...</p>
        </div>
      ) : error ? (
        <div className="seller-panel">
          <div className="seller-alert error">{error}</div>
        </div>
      ) : (
        <>
          <section className="seller-kpi-overview-grid">
            {overviewCards.map((card) => (
              <article key={card.label} className="seller-kpi-card">
                <div className="seller-kpi-icon">{card.icon}</div>
                <div className="seller-kpi-value">{card.value}</div>
                <h2>{card.label}</h2>
                <p>{card.hint}</p>
              </article>
            ))}
          </section>

          <section className="seller-kpi-legend">
            {Object.entries(qualityMeta).map(([key, item]) => (
              <span key={key} className={`seller-kpi-badge ${item.className}`}>
                {item.label}
              </span>
            ))}
          </section>

          <section className="seller-kpi-note-panel">
            <p>
              Every number and graph on this page is based only on <strong>{data.seller?.shopName || "your shop"}</strong>
              {" "}and the products attached to this seller account. Metrics tagged as <strong>Estimated</strong>
              {" "}or <strong>Status-Based</strong> use the seller data currently stored in orders,
              carts, wishlists, and inventory. CAC and GMROI need marketing spend and product cost
              tracking before they can be exact.
            </p>
          </section>

          <section className="seller-chart-grid">
            <article className="seller-panel seller-chart-panel">
              <div className="seller-panel-header seller-panel-header--stack">
                <div>
                  <h2>Monthly Revenue Trend</h2>
                  <p>Last 6 months of seller-only revenue and order volume.</p>
                </div>
              </div>

              {charts.monthlyPerformance.every((item) => Number(item.revenue || 0) === 0) ? (
                <p className="seller-empty-text">No seller orders yet for the monthly trend chart.</p>
              ) : (
                <div className="seller-monthly-chart">
                  {charts.monthlyPerformance.map((item) => {
                    const revenue = Number(item.revenue || 0);
                    const orders = Number(item.orders || 0);
                    const barHeight = maxMonthlyRevenue > 0 ? Math.max((revenue / maxMonthlyRevenue) * 100, 10) : 0;

                    return (
                      <div key={item.key} className="seller-monthly-chart__item">
                        <div className="seller-monthly-chart__meta">
                          <strong>{currencyFormatter.format(revenue)}</strong>
                          <span>{orders} orders</span>
                        </div>
                        <div className="seller-monthly-chart__track">
                          <div
                            className="seller-monthly-chart__bar"
                            style={{ height: `${barHeight}%` }}
                            title={`${item.label}: ${currencyFormatter.format(revenue)}`}
                          />
                        </div>
                        <span className="seller-monthly-chart__label">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="seller-panel seller-chart-panel">
              <div className="seller-panel-header seller-panel-header--stack">
                <div>
                  <h2>Order Status Mix</h2>
                  <p>Status distribution for orders that include your products.</p>
                </div>
              </div>

              {charts.statusBreakdown.length === 0 ? (
                <p className="seller-empty-text">No seller orders yet for the status chart.</p>
              ) : (
                <div className="seller-status-chart">
                  {charts.statusBreakdown.map((item) => {
                    const count = Number(item.count || 0);
                    const percentage = totalStatusOrders > 0 ? (count / totalStatusOrders) * 100 : 0;

                    return (
                      <div key={item.status} className="seller-status-chart__row">
                        <div className="seller-status-chart__header">
                          <strong>{formatStatusLabel(item.status)}</strong>
                          <span>
                            {count} orders | {numberFormatter.format(percentage)}%
                          </span>
                        </div>
                        <div className="seller-status-chart__track">
                          <div
                            className={`seller-status-chart__fill status-${item.status}`}
                            style={{ width: `${Math.max(percentage, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="seller-panel seller-chart-panel seller-chart-panel--wide">
              <div className="seller-panel-header seller-panel-header--stack">
                <div>
                  <h2>Top Selling Products</h2>
                  <p>Best performing products from this seller account only.</p>
                </div>
              </div>

              {charts.topProducts.length === 0 ? (
                <p className="seller-empty-text">No seller order lines yet for the top products chart.</p>
              ) : (
                <div className="seller-top-products-chart">
                  {charts.topProducts.map((item) => {
                    const unitsSold = Number(item.unitsSold || 0);
                    const width = maxTopProductUnits > 0 ? (unitsSold / maxTopProductUnits) * 100 : 0;

                    return (
                      <div key={item.productId} className="seller-top-products-chart__row">
                        <div className="seller-top-products-chart__header">
                          <strong>{item.title}</strong>
                          <span>
                            {unitsSold} sold | {currencyFormatter.format(item.revenue || 0)}
                          </span>
                        </div>
                        <div className="seller-top-products-chart__track">
                          <div
                            className="seller-top-products-chart__fill"
                            style={{ width: `${Math.max(width, 6)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </section>

          <div className="seller-kpi-sections">
            {metricSections.map((section) => (
              <section key={section.title} className="seller-panel">
                <div className="seller-panel-header seller-panel-header--stack">
                  <div>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                </div>

                <div className="seller-kpi-detail-grid">
                  {section.metrics.map((metric) => {
                    const metricData = kpis[metric.key];
                    const quality = qualityMeta[metricData?.quality] || qualityMeta.estimated;

                    return (
                      <article key={metric.key} className="seller-kpi-detail-card">
                        <div className="seller-kpi-detail-card__header">
                          <div className="seller-kpi-icon">{metric.icon}</div>
                          <span className={`seller-kpi-badge ${quality.className}`}>
                            {quality.label}
                          </span>
                        </div>
                        <h3>{metric.label}</h3>
                        <div className="seller-kpi-detail-value">
                          {formatMetricValue(metric.key, metricData?.value)}
                        </div>
                        <p>{metricData?.note || "No description available."}</p>
                        <div className="seller-kpi-support">{metric.support}</div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
