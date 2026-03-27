const { usersService } = require("../services/users.service");

async function getMe(req, res, next) {
  try {
    const profile = await usersService.getById(req.user.sub);
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const profile = await usersService.updateById(req.user.sub, req.body || {});
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

module.exports = { getMe, updateMe };
