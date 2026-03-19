const router = require("express").Router();

router.get("/me", (req, res) => {
  res.status(501).json({ message: "Not implemented" });
});

module.exports = router;
