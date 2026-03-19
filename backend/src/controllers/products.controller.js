const { productsService } = require("../services/products.service");

async function listProducts(req, res, next) {
  try {
    const data = await productsService.list(req.query);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await productsService.getById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (e) {
    next(e);
  }
}

module.exports = { listProducts, getProductById };
