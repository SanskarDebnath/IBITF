const { catalogService } = require("../services/catalog.service");

async function listCategories(req, res, next) {
  try {
    const data = await catalogService.listCategories();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { listCategories };
