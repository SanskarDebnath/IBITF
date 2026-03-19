const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/catalog", require("./catalog.routes"));
router.use("/products", require("./products.routes"));
router.use("/cart", require("./cart.routes"));
router.use("/wishlist", require("./wishlist.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/seller", require("./seller.routes"));

module.exports = router;
