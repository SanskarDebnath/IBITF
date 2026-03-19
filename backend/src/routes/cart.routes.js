const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { getCart, addCartItem, updateCartItem, deleteCartItem } = require("../controllers/cart.controller");

router.use(auth);
router.get("/", getCart);
router.post("/items", addCartItem);
router.patch("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", deleteCartItem);

module.exports = router;
