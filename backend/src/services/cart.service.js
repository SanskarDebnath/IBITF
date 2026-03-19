const { pool } = require("../config/db");

async function listCart(userId) {
  const sql = `
    select
      ci.id as item_id,
      ci.qty,
      p.id as product_id,
      p.title,
      p.price,
      p.image,
      p.stock,
      p.status
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.user_id = $1
    order by ci.created_at desc
  `;
  const { rows } = await pool.query(sql, [userId]);
  return rows;
}

async function addItem(userId, productId, qty) {
  const productRes = await pool.query(
    "select id, stock from products where id = $1 and status = 'active'",
    [productId]
  );
  if (!productRes.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  const addQty = Math.max(Number(qty || 1), 1);
  const upsertSql = `
    insert into cart_items (user_id, product_id, qty)
    values ($1, $2, $3)
    on conflict (user_id, product_id)
    do update set qty = cart_items.qty + excluded.qty
    returning id
  `;
  const { rows } = await pool.query(upsertSql, [userId, productId, addQty]);
  return rows[0];
}

async function updateItem(userId, itemId, qty) {
  const quantity = Number(qty);
  if (!Number.isFinite(quantity)) {
    const error = new Error("Quantity is required");
    error.status = 400;
    throw error;
  }

  if (quantity <= 0) {
    await pool.query("delete from cart_items where id = $1 and user_id = $2", [itemId, userId]);
    return null;
  }

  const { rows } = await pool.query(
    "update cart_items set qty = $1 where id = $2 and user_id = $3 returning id",
    [quantity, itemId, userId]
  );
  if (!rows[0]) {
    const error = new Error("Cart item not found");
    error.status = 404;
    throw error;
  }
  return rows[0];
}

async function removeItem(userId, itemId) {
  const { rowCount } = await pool.query(
    "delete from cart_items where id = $1 and user_id = $2",
    [itemId, userId]
  );
  if (!rowCount) {
    const error = new Error("Cart item not found");
    error.status = 404;
    throw error;
  }
  return true;
}

async function clearCart(userId) {
  await pool.query("delete from cart_items where user_id = $1", [userId]);
}

const cartService = { listCart, addItem, updateItem, removeItem, clearCart };
module.exports = { cartService };
