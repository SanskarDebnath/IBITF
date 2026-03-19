const { pool } = require("../config/db");

async function listWishlist(userId) {
  const sql = `
    select
      w.id as item_id,
      p.id as product_id,
      p.title,
      p.description,
      p.price,
      p.image,
      p.stock,
      p.status,
      c.name as category_name
    from wishlist_items w
    join products p on p.id = w.product_id
    left join categories c on c.id = p.category_id
    where w.user_id = $1
    order by w.created_at desc
  `;
  const { rows } = await pool.query(sql, [userId]);
  return rows;
}

async function addItem(userId, productId) {
  const productRes = await pool.query(
    "select id from products where id = $1",
    [productId]
  );
  if (!productRes.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  await pool.query(
    "insert into wishlist_items (user_id, product_id) values ($1, $2) on conflict do nothing",
    [userId, productId]
  );
}

async function removeItem(userId, productId) {
  await pool.query(
    "delete from wishlist_items where user_id = $1 and product_id = $2",
    [userId, productId]
  );
}

const wishlistService = { listWishlist, addItem, removeItem };
module.exports = { wishlistService };
