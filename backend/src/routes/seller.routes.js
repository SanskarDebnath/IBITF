const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/requireRole");
const {
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
} = require("../controllers/seller.controller");

router.use(auth);
router.post("/onboard", onboard);

router.get("/settings", requireRole("seller", "admin"), getSettings);
router.patch("/settings", requireRole("seller", "admin"), updateSettings);
router.get("/dashboard", requireRole("seller", "admin"), getDashboardSummary);
router.get("/kpis", requireRole("seller", "admin"), getKpis);
router.get("/products", requireRole("seller", "admin"), listProducts);
router.post("/products", requireRole("seller", "admin"), addProduct);
router.post("/categories", requireRole("seller", "admin"), addCategory);
router.patch("/products/:id", requireRole("seller", "admin"), updateProduct);
router.get("/orders", requireRole("seller", "admin"), listOrders);
router.get("/payouts", requireRole("seller", "admin"), listPayouts);

module.exports = router;
