const { pool } = require("../config/db");

async function checkout(userId, payload) {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const cartRes = await client.query(
      `
      select
        ci.id as item_id,
        ci.qty,
        p.id as product_id,
        p.title,
        p.price,
        p.stock
      from cart_items ci
      join products p on p.id = ci.product_id
      where ci.user_id = $1
      for update of p
      `,
      [userId]
    );

    if (!cartRes.rows.length) {
      const error = new Error("Cart is empty");
      error.status = 400;
      throw error;
    }

    const items = cartRes.rows;

    for (const item of items) {
      const stock = Number(item.stock || 0);
      const qty = Number(item.qty || 0);
      if (qty > stock) {
        const error = new Error(`Insufficient stock for "${item.title}"`);
        error.status = 400;
        throw error;
      }
    }

    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);

    const orderRes = await client.query(
      `
      insert into orders (user_id, total_amount, shipping_address, payment_method)
      values ($1, $2, $3, $4)
      returning id, user_id, total_amount, status, created_at
      `,
      [userId, total, payload.shippingAddress || null, payload.paymentMethod || null]
    );

    const order = orderRes.rows[0];

    const insertItemSql = `
      insert into order_items (order_id, product_id, title, price, qty, line_total)
      values ($1, $2, $3, $4, $5, $6)
    `;

    for (const item of items) {
      const lineTotal = Number(item.price) * Number(item.qty);
      await client.query(insertItemSql, [
        order.id,
        item.product_id,
        item.title,
        item.price,
        item.qty,
        lineTotal
      ]);

      await client.query(
        `
        update products
        set stock = stock - $1
        where id = $2
        `,
        [Number(item.qty), item.product_id]
      );
    }

    await client.query("delete from cart_items where user_id = $1", [userId]);
    await client.query("commit");

    return { orderId: order.id, total: order.total_amount };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function listOrders(userId) {
  const ordersRes = await pool.query(
    `
    select id, total_amount, status, created_at
    from orders
    where user_id = $1
    order by created_at desc
    `,
    [userId]
  );

  return ordersRes.rows;
}

async function getOrderById(userId, orderId) {
  const orderRes = await pool.query(
    `
    select id, total_amount, status, shipping_address, payment_method, created_at
    from orders
    where id = $1 and user_id = $2
    `,
    [orderId, userId]
  );

  const order = orderRes.rows[0];
  if (!order) return null;

  const itemsRes = await pool.query(
    `
    select id, product_id, title, price, qty, line_total
    from order_items
    where order_id = $1
    order by id asc
    `,
    [orderId]
  );

  return { ...order, items: itemsRes.rows };
}

const ordersService = { checkout, listOrders, getOrderById };
module.exports = { ordersService };
