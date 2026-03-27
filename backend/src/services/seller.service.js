const { pool } = require("../config/db");

let ensureProductColumnsPromise = null;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(toNumber(value) * factor) / factor;
}

function percent(numerator, denominator, digits = 1) {
  if (!denominator) return 0;
  return round((toNumber(numerator) / toNumber(denominator)) * 100, digits);
}

function ratio(numerator, denominator, digits = 2) {
  if (!denominator) return 0;
  return round(toNumber(numerator) / toNumber(denominator), digits);
}

function monthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addUtcMonths(date, offset) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function formatMonthLabel(date) {
  const month = date.toLocaleString("en-IN", {
    month: "short",
    timeZone: "UTC"
  });
  return `${month} ${String(date.getUTCFullYear()).slice(-2)}`;
}

function ensureProductColumns() {
  if (!ensureProductColumnsPromise) {
    ensureProductColumnsPromise = pool
      .query("alter table products add column if not exists specifications text")
      .catch((error) => {
        ensureProductColumnsPromise = null;
        throw error;
      });
  }

  return ensureProductColumnsPromise;
}

async function getSellerByUserId(userId) {
  const res = await pool.query("select * from sellers where user_id = $1", [userId]);
  return res.rows[0] || null;
}

function normalizeSpecifications(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function mapSellerSettingsRow(row) {
  if (!row) return null;

  return {
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      role: row.user_role,
      isVerified: row.user_is_verified,
      createdAt: row.user_created_at
    },
    seller: {
      id: row.seller_id,
      shopName: row.shop_name,
      phone: row.phone,
      address: row.address,
      status: row.seller_status,
      createdAt: row.seller_created_at
    }
  };
}

async function onboard(userId, payload) {
  const existing = await getSellerByUserId(userId);
  if (existing) return existing;

  const insertRes = await pool.query(
    `
    insert into sellers (user_id, shop_name, phone, address, status)
    values ($1, $2, $3, $4, 'active')
    returning id, user_id, shop_name, phone, address, status
    `,
    [userId, payload.shopName, payload.phone || null, payload.address || null]
  );

  await pool.query("update users set role = 'seller' where id = $1", [userId]);

  return insertRes.rows[0];
}

async function listProducts(userId) {
  await ensureProductColumns();
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const { rows } = await pool.query(
    `
    select p.id, p.title, p.description, p.specifications, p.price, p.stock, p.image, p.status, c.name as category_name
    from products p
    left join categories c on c.id = p.category_id
    where p.seller_id = $1
    order by p.created_at desc
    `,
    [seller.id]
  );

  return rows;
}

async function getSettings(userId) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const { rows } = await pool.query(
    `
    select
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      u.is_verified as user_is_verified,
      u.created_at as user_created_at,
      s.id as seller_id,
      s.shop_name,
      s.phone,
      s.address,
      s.status as seller_status,
      s.created_at as seller_created_at
    from users u
    join sellers s on s.user_id = u.id
    where u.id = $1
    limit 1
    `,
    [userId]
  );

  return mapSellerSettingsRow(rows[0]);
}

async function getDashboardSummary(userId) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const [productsRes, ordersRes, categoriesRes, recentOrdersRes] = await Promise.all([
    pool.query(
      `
      select
        count(*)::int as total_products,
        coalesce(sum(stock), 0)::int as total_stock
      from products
      where seller_id = $1
      `,
      [seller.id]
    ),
    pool.query(
      `
      select
        count(distinct oi.order_id)::int as total_orders,
        coalesce(sum(oi.qty), 0)::int as total_items_sold,
        coalesce(sum(oi.line_total), 0)::numeric(12,2) as total_revenue
      from order_items oi
      join products p on p.id = oi.product_id
      where p.seller_id = $1
      `,
      [seller.id]
    ),
    pool.query("select count(*)::int as total_categories from categories"),
    pool.query(
      `
      select
        o.id as order_id,
        o.status,
        o.created_at,
        sum(oi.qty)::int as items_count,
        sum(oi.line_total)::numeric(12,2) as order_total
      from order_items oi
      join orders o on o.id = oi.order_id
      join products p on p.id = oi.product_id
      where p.seller_id = $1
      group by o.id, o.status, o.created_at
      order by o.created_at desc
      limit 5
      `,
      [seller.id]
    )
  ]);

  return {
    seller: {
      id: seller.id,
      shopName: seller.shop_name,
      status: seller.status
    },
    totalProducts: productsRes.rows[0]?.total_products || 0,
    totalStock: productsRes.rows[0]?.total_stock || 0,
    totalOrders: ordersRes.rows[0]?.total_orders || 0,
    totalItemsSold: ordersRes.rows[0]?.total_items_sold || 0,
    totalRevenue: Number(ordersRes.rows[0]?.total_revenue || 0),
    totalCategories: categoriesRes.rows[0]?.total_categories || 0,
    recentOrders: recentOrdersRes.rows.map((order) => ({
      ...order,
      order_total: Number(order.order_total || 0)
    }))
  };
}

async function updateSettings(userId, payload) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const name = payload?.name?.trim();
  const shopName = payload?.shopName?.trim();
  const phone = payload?.phone?.trim() || null;
  const address = payload?.address?.trim() || null;

  if (!name) {
    const error = new Error("Account name is required");
    error.status = 400;
    throw error;
  }

  if (!shopName) {
    const error = new Error("Shop name is required");
    error.status = 400;
    throw error;
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      const error = new Error("Phone number must contain 10 to 15 digits");
      error.status = 400;
      throw error;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("begin");

    await client.query("update users set name = $1 where id = $2", [name, userId]);
    await client.query(
      `
      update sellers
      set shop_name = $1,
          phone = $2,
          address = $3
      where user_id = $4
      `,
      [shopName, phone, address, userId]
    );

    const updatedRes = await client.query(
      `
      select
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.is_verified as user_is_verified,
        u.created_at as user_created_at,
        s.id as seller_id,
        s.shop_name,
        s.phone,
        s.address,
        s.status as seller_status,
        s.created_at as seller_created_at
      from users u
      join sellers s on s.user_id = u.id
      where u.id = $1
      limit 1
      `,
      [userId]
    );

    await client.query("commit");
    return mapSellerSettingsRow(updatedRes.rows[0]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function getKpis(userId) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const [
    inventoryRes,
    ordersRes,
    engagementRes,
    repeatCustomersRes,
    monthlyPerformanceRes,
    statusBreakdownRes,
    topProductsRes
  ] = await Promise.all([
    pool.query(
      `
      select
        count(*)::int as total_products,
        coalesce(sum(stock), 0)::int as total_stock,
        coalesce(sum(price * stock), 0)::numeric(12,2) as inventory_value
      from products
      where seller_id = $1
      `,
      [seller.id]
    ),
    pool.query(
      `
      select
        count(distinct o.id)::int as total_orders,
        coalesce(sum(oi.qty), 0)::int as total_items_sold,
        coalesce(sum(oi.line_total), 0)::numeric(12,2) as total_revenue,
        count(distinct o.user_id)::int as unique_customers,
        count(distinct case
          when lower(o.status) in ('cancelled', 'failed', 'returned', 'refunded')
          then o.id
        end)::int as defect_orders,
        count(distinct case
          when lower(o.status) in ('returned', 'refunded', 'cancelled')
          then o.id
        end)::int as returned_orders,
        count(distinct case
          when lower(o.status) in ('placed', 'pending', 'processing')
            and o.created_at < now() - interval '3 days'
          then o.id
        end)::int as late_orders
      from order_items oi
      join orders o on o.id = oi.order_id
      join products p on p.id = oi.product_id
      where p.seller_id = $1
      `,
      [seller.id]
    ),
    pool.query(
      `
      select count(distinct engaged.user_id)::int as engaged_shoppers
      from (
        select o.user_id
        from orders o
        join order_items oi on oi.order_id = o.id
        join products p on p.id = oi.product_id
        where p.seller_id = $1

        union

        select ci.user_id
        from cart_items ci
        join products p on p.id = ci.product_id
        where p.seller_id = $1

        union

        select wi.user_id
        from wishlist_items wi
        join products p on p.id = wi.product_id
        where p.seller_id = $1
      ) engaged
      `,
      [seller.id]
    ),
    pool.query(
      `
      select count(*)::int as repeat_customers
      from (
        select o.user_id
        from orders o
        join order_items oi on oi.order_id = o.id
        join products p on p.id = oi.product_id
        where p.seller_id = $1
        group by o.user_id
        having count(distinct o.id) > 1
      ) repeat_buyers
      `,
      [seller.id]
    ),
    pool.query(
      `
      select
        date_trunc('month', o.created_at) as month_start,
        count(distinct o.id)::int as total_orders,
        coalesce(sum(oi.qty), 0)::int as total_items_sold,
        coalesce(sum(oi.line_total), 0)::numeric(12,2) as total_revenue
      from order_items oi
      join orders o on o.id = oi.order_id
      join products p on p.id = oi.product_id
      where p.seller_id = $1
        and o.created_at >= date_trunc('month', now()) - interval '5 months'
      group by 1
      order by 1 asc
      `,
      [seller.id]
    ),
    pool.query(
      `
      select
        lower(o.status) as status,
        count(distinct o.id)::int as total_orders
      from order_items oi
      join orders o on o.id = oi.order_id
      join products p on p.id = oi.product_id
      where p.seller_id = $1
      group by lower(o.status)
      order by total_orders desc, status asc
      `,
      [seller.id]
    ),
    pool.query(
      `
      select
        p.id as product_id,
        p.title,
        coalesce(sum(oi.qty), 0)::int as total_units_sold,
        coalesce(sum(oi.line_total), 0)::numeric(12,2) as total_revenue
      from order_items oi
      join products p on p.id = oi.product_id
      where p.seller_id = $1
      group by p.id, p.title
      order by total_units_sold desc, total_revenue desc, p.title asc
      limit 5
      `,
      [seller.id]
    )
  ]);

  const inventory = inventoryRes.rows[0] || {};
  const orders = ordersRes.rows[0] || {};
  const engagement = engagementRes.rows[0] || {};
  const repeatCustomers = repeatCustomersRes.rows[0] || {};

  const totalProducts = toNumber(inventory.total_products);
  const totalStock = toNumber(inventory.total_stock);
  const inventoryValue = toNumber(inventory.inventory_value);
  const totalOrders = toNumber(orders.total_orders);
  const totalItemsSold = toNumber(orders.total_items_sold);
  const totalRevenue = toNumber(orders.total_revenue);
  const uniqueCustomers = toNumber(orders.unique_customers);
  const defectOrders = toNumber(orders.defect_orders);
  const returnedOrders = toNumber(orders.returned_orders);
  const lateOrders = toNumber(orders.late_orders);
  const engagedShoppers = toNumber(engagement.engaged_shoppers);
  const repeatCustomerCount = toNumber(repeatCustomers.repeat_customers);
  const estimatedAverageInventoryUnits = round(totalStock + totalItemsSold / 2, 2);
  const shippingSlaDays = 3;
  const currentMonth = new Date();
  const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const monthlyMap = new Map(
    monthlyPerformanceRes.rows.map((row) => {
      const monthDate = new Date(row.month_start);
      return [
        monthKey(monthDate),
        {
          revenue: toNumber(row.total_revenue),
          orders: toNumber(row.total_orders),
          itemsSold: toNumber(row.total_items_sold)
        }
      ];
    })
  );
  const monthlyPerformance = Array.from({ length: 6 }, (_value, index) => {
    const monthDate = addUtcMonths(monthStart, index - 5);
    const key = monthKey(monthDate);
    const monthData = monthlyMap.get(key) || { revenue: 0, orders: 0, itemsSold: 0 };

    return {
      key,
      label: formatMonthLabel(monthDate),
      revenue: monthData.revenue,
      orders: monthData.orders,
      itemsSold: monthData.itemsSold
    };
  });
  const statusBreakdown = statusBreakdownRes.rows.map((row) => ({
    status: row.status || "placed",
    count: toNumber(row.total_orders)
  }));
  const topProducts = topProductsRes.rows.map((row) => ({
    productId: row.product_id,
    title: row.title || "Untitled product",
    unitsSold: toNumber(row.total_units_sold),
    revenue: toNumber(row.total_revenue)
  }));

  return {
    seller: {
      id: seller.id,
      shopName: seller.shop_name,
      status: seller.status
    },
    summary: {
      totalProducts,
      totalStock,
      inventoryValue,
      totalOrders,
      totalItemsSold,
      totalRevenue,
      uniqueCustomers,
      engagedShoppers,
      defectOrders,
      returnedOrders,
      lateOrders,
      repeatCustomers: repeatCustomerCount,
      estimatedAverageInventoryUnits,
      shippingSlaDays
    },
    charts: {
      monthlyPerformance,
      statusBreakdown,
      topProducts
    },
    kpis: {
      salesConversionRate: {
        value: percent(uniqueCustomers, engagedShoppers),
        quality: "estimated",
        note: "Unique buyers divided by engaged shoppers across orders, carts, and wishlists."
      },
      orderDefectRate: {
        value: percent(defectOrders, totalOrders),
        quality: "estimated",
        note: "Estimated from cancelled, failed, refunded, or returned orders."
      },
      averageOrderValue: {
        value: totalOrders ? round(totalRevenue / totalOrders, 2) : 0,
        quality: "exact",
        note: "Average revenue per completed order line total."
      },
      inventoryTurnoverRatio: {
        value: ratio(totalItemsSold, estimatedAverageInventoryUnits),
        quality: "estimated",
        note: "Units sold divided by estimated average inventory units."
      },
      customerAcquisitionCost: {
        value: null,
        quality: "needs_data",
        note: "Marketing spend is not tracked yet, so CAC cannot be calculated."
      },
      customerLifetimeValue: {
        value: uniqueCustomers ? round(totalRevenue / uniqueCustomers, 2) : 0,
        quality: "observed",
        note: "Observed revenue per unique customer based on current order history."
      },
      returnRate: {
        value: percent(returnedOrders, totalOrders),
        quality: "status_based",
        note: "Returned, refunded, or cancelled orders divided by total orders."
      },
      gmroi: {
        value: null,
        quality: "needs_data",
        note: "Product cost is not tracked yet, so GMROI cannot be calculated."
      },
      lateShipmentRate: {
        value: percent(lateOrders, totalOrders),
        quality: "estimated",
        note: "Open orders older than 3 days are treated as late shipments."
      }
    }
  };
}

async function addProduct(userId, payload) {
  await ensureProductColumns();
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const insertRes = await pool.query(
    `
    insert into products (seller_id, category_id, title, description, specifications, price, stock, image, status)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning id, title, description, specifications, price, stock, image, status
    `,
    [
      seller.id,
      payload.categoryId || null,
      payload.title,
      payload.description || null,
      normalizeSpecifications(payload.specifications),
      payload.price,
      payload.stock || 0,
      payload.image || null,
      payload.status || "active"
    ]
  );

  return insertRes.rows[0];
}

async function addCategory(userId, payload) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const name = payload?.name?.trim();
  if (!name) {
    const error = new Error("Category name is required");
    error.status = 400;
    throw error;
  }

  const existingRes = await pool.query(
    "select id, name from categories where lower(name) = lower($1) limit 1",
    [name]
  );

  if (existingRes.rows[0]) {
    const error = new Error("Category already exists");
    error.status = 409;
    throw error;
  }

  const insertRes = await pool.query(
    "insert into categories (name) values ($1) returning id, name",
    [name]
  );

  return insertRes.rows[0];
}

async function updateProduct(userId, productId, payload) {
  await ensureProductColumns();
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const updateRes = await pool.query(
    `
    update products
    set title = $1,
        description = $2,
        specifications = $3,
        price = $4,
        stock = $5,
        image = $6,
        status = $7,
        category_id = $8
    where id = $9 and seller_id = $10
    returning id, title, description, specifications, price, stock, image, status
    `,
    [
      payload.title,
      payload.description || null,
      normalizeSpecifications(payload.specifications),
      payload.price,
      payload.stock || 0,
      payload.image || null,
      payload.status || "active",
      payload.categoryId || null,
      productId,
      seller.id
    ]
  );

  if (!updateRes.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  return updateRes.rows[0];
}

async function listOrders(userId) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const { rows } = await pool.query(
    `
    select
      o.id as order_id,
      o.created_at,
      o.status,
      oi.id as order_item_id,
      oi.product_id,
      oi.title,
      oi.price,
      oi.qty,
      oi.line_total
    from order_items oi
    join orders o on o.id = oi.order_id
    join products p on p.id = oi.product_id
    where p.seller_id = $1
    order by o.created_at desc
    `,
    [seller.id]
  );

  return rows;
}

async function listPayouts(userId) {
  const seller = await getSellerByUserId(userId);
  if (!seller) {
    const error = new Error("Seller profile not found");
    error.status = 404;
    throw error;
  }

  const { rows } = await pool.query(
    `
    select
      date_trunc('month', o.created_at) as month,
      sum(oi.line_total) as total_sales
    from order_items oi
    join orders o on o.id = oi.order_id
    join products p on p.id = oi.product_id
    where p.seller_id = $1
    group by 1
    order by 1 desc
    `,
    [seller.id]
  );

  return rows;
}

const sellerService = {
  onboard,
  getSettings,
  getDashboardSummary,
  updateSettings,
  getKpis,
  listProducts,
  addProduct,
  addCategory,
  updateProduct,
  listOrders,
  listPayouts
};

module.exports = { sellerService };
