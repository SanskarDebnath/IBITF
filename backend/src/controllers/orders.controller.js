const { ordersService } = require("../services/orders.service");

async function checkout(req, res, next) {
  try {
    const result = await ordersService.checkout(req.user.sub, req.body || {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function listOrders(req, res, next) {
  try {
    const orders = await ordersService.listOrders(req.user.sub);
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.user.sub, req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (e) {
    next(e);
  }
}

module.exports = { checkout, listOrders, getOrder };
