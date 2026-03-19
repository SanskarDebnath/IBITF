const { wishlistService } = require("../services/wishlist.service");

async function listWishlist(req, res, next) {
  try {
    const items = await wishlistService.listWishlist(req.user.sub);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

async function addWishlistItem(req, res, next) {
  try {
    await wishlistService.addItem(req.user.sub, req.params.productId);
    const items = await wishlistService.listWishlist(req.user.sub);
    res.status(201).json(items);
  } catch (e) {
    next(e);
  }
}

async function deleteWishlistItem(req, res, next) {
  try {
    await wishlistService.removeItem(req.user.sub, req.params.productId);
    const items = await wishlistService.listWishlist(req.user.sub);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

module.exports = { listWishlist, addWishlistItem, deleteWishlistItem };
