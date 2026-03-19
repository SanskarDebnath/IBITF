const router = require("express").Router();
const ctrl = require("../controllers/products.controller");

router.get("/", ctrl.listProducts);
router.get("/:id", ctrl.getProductById);

module.exports = router;
