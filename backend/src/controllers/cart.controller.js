const { cartService } = require("../services/cart.service");

async function getCart(req, res, next) {
  try {
    const items = await cartService.listCart(req.user.sub);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

async function addCartItem(req, res, next) {
  try {
    await cartService.addItem(req.user.sub, req.body.productId, req.body.qty);
    const items = await cartService.listCart(req.user.sub);
    res.status(201).json(items);
  } catch (e) {
    next(e);
  }
}

async function updateCartItem(req, res, next) {
  try {
    await cartService.updateItem(req.user.sub, req.params.itemId, req.body.qty);
    const items = await cartService.listCart(req.user.sub);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

async function deleteCartItem(req, res, next) {
  try {
    await cartService.removeItem(req.user.sub, req.params.itemId);
    const items = await cartService.listCart(req.user.sub);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

module.exports = { getCart, addCartItem, updateCartItem, deleteCartItem };
