const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { getMe, updateMe } = require("../controllers/users.controller");

router.use(auth);
router.get("/me", getMe);
router.patch("/me", updateMe);

module.exports = router;
