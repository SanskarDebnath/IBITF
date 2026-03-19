const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { checkout, listOrders, getOrder } = require("../controllers/orders.controller");

router.use(auth);
router.post("/checkout", checkout);
router.get("/", listOrders);
router.get("/:id", getOrder);

module.exports = router;
