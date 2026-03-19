const { pool } = require("../config/db");

async function list(query) {
  const { search, category, minPrice, maxPrice, sort } = query;

  const params = [];
  const where = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(p.title ilike $${params.length} or p.description ilike $${params.length})`);
  }

  if (category) {
    params.push(category);
    where.push(`c.name = $${params.length}`);
  }

  if (minPrice) {
    params.push(Number(minPrice));
    where.push(`p.price >= $${params.length}`);
  }

  if (maxPrice) {
    params.push(Number(maxPrice));
    where.push(`p.price <= $${params.length}`);
  }

  const whereSql = where.length ? `where ${where.join(" and ")}` : "";

  let orderBy = "p.created_at desc";
  if (sort === "price-asc") orderBy = "p.price asc";
  if (sort === "price-desc") orderBy = "p.price desc";
  if (sort === "oldest") orderBy = "p.created_at asc";

  const sql = `
    select
      p.id,
      p.title,
      p.description,
      p.price,
      p.stock,
      p.image,
      p.status,
      c.name as category_name
    from products p
    left join categories c on c.id = p.category_id
    ${whereSql}
    order by ${orderBy}
    limit 100
  `;

  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getById(id) {
  const sql = `
    select
      p.*,
      c.name as category_name,
      s.shop_name as seller_shop_name,
      s.address as seller_address,
      s.status as seller_status
    from products p
    left join categories c on c.id = p.category_id
    left join sellers s on s.id = p.seller_id
    where p.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
}

const productsService = { list, getById };
module.exports = { productsService };
