const router = require("express").Router();
const { listCategories } = require("../controllers/catalog.controller");

router.get("/categories", listCategories);

module.exports = router;
