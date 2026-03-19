const { sellerService } = require("../services/seller.service");

async function onboard(req, res, next) {
  try {
    const seller = await sellerService.onboard(req.user.sub, req.body);
    res.status(201).json(seller);
  } catch (e) {
    next(e);
  }
}

async function getSettings(req, res, next) {
  try {
    const settings = await sellerService.getSettings(req.user.sub);
    res.json(settings);
  } catch (e) {
    next(e);
  }
}

async function getDashboardSummary(req, res, next) {
  try {
    const summary = await sellerService.getDashboardSummary(req.user.sub);
    res.json(summary);
  } catch (e) {
    next(e);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await sellerService.updateSettings(req.user.sub, req.body);
    res.json(settings);
  } catch (e) {
    next(e);
  }
}

async function getKpis(req, res, next) {
  try {
    const kpis = await sellerService.getKpis(req.user.sub);
    res.json(kpis);
  } catch (e) {
    next(e);
  }
}

async function listProducts(req, res, next) {
  try {
    const products = await sellerService.listProducts(req.user.sub);
    res.json(products);
  } catch (e) {
    next(e);
  }
}

async function addProduct(req, res, next) {
  try {
    const product = await sellerService.addProduct(req.user.sub, req.body);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
}

async function addCategory(req, res, next) {
  try {
    const category = await sellerService.addCategory(req.user.sub, req.body);
    res.status(201).json(category);
  } catch (e) {
    next(e);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await sellerService.updateProduct(req.user.sub, req.params.id, req.body);
    res.json(product);
  } catch (e) {
    next(e);
  }
}

async function listOrders(req, res, next) {
  try {
    const orders = await sellerService.listOrders(req.user.sub);
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

async function listPayouts(req, res, next) {
  try {
    const payouts = await sellerService.listPayouts(req.user.sub);
    res.json(payouts);
  } catch (e) {
    next(e);
  }
}

module.exports = {
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
