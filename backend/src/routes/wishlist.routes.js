const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { listWishlist, addWishlistItem, deleteWishlistItem } = require("../controllers/wishlist.controller");

router.use(auth);
router.get("/", listWishlist);
router.post("/:productId", addWishlistItem);
router.delete("/:productId", deleteWishlistItem);

module.exports = router;
