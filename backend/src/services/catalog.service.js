const { pool } = require("../config/db");

async function listCategories() {
  const { rows } = await pool.query("select id, name from categories order by name asc");
  return rows;
}

const catalogService = { listCategories };
module.exports = { catalogService };
