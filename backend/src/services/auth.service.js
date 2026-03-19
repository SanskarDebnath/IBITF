const crypto = require("crypto");
const { pool } = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

async function register({ email, password, firstName, lastName, role }) {
  const existing = await pool.query("select id from users where email = $1", [email]);
  if (existing.rows.length) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const name = `${firstName || ""} ${lastName || ""}`.trim() || "User";
  const passwordHash = await hashPassword(password);

  const insertUserSql = `
    insert into users (name, email, password_hash, role, is_verified)
    values ($1, $2, $3, $4, false)
    returning id, name, email, role, is_verified, created_at
  `;
  const { rows } = await pool.query(insertUserSql, [name, email, passwordHash, role || "buyer"]);
  const user = rows[0];

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query(
    "insert into otp_codes (user_id, code, expires_at) values ($1, $2, $3)",
    [user.id, code, expiresAt]
  );

  return { user, otp: code };
}

async function verifyOtp({ email, code }) {
  const userRes = await pool.query("select id, is_verified from users where email = $1", [email]);
  const user = userRes.rows[0];
  if (!user) {
    const error = new Error("Account not found");
    error.status = 404;
    throw error;
  }

  if (user.is_verified) {
    return { message: "Already verified" };
  }

  const otpRes = await pool.query(
    "select id, code, expires_at from otp_codes where user_id = $1 order by created_at desc limit 1",
    [user.id]
  );
  const otp = otpRes.rows[0];
  if (!otp || otp.code !== code) {
    const error = new Error("Invalid OTP");
    error.status = 400;
    throw error;
  }

  if (new Date(otp.expires_at).getTime() < Date.now()) {
    const error = new Error("OTP expired");
    error.status = 400;
    throw error;
  }

  await pool.query("update users set is_verified = true where id = $1", [user.id]);
  await pool.query("delete from otp_codes where user_id = $1", [user.id]);

  return { message: "Account verified" };
}

async function login({ email, password }) {
  const userRes = await pool.query(
    "select id, name, email, role, password_hash, is_verified from users where email = $1",
    [email]
  );
  const user = userRes.rows[0];
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  if (!user.is_verified) {
    const error = new Error("Please verify your account");
    error.status = 403;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    "insert into refresh_tokens (user_id, token, expires_at) values ($1, $2, $3)",
    [user.id, refreshToken, expiresAt]
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    const error = new Error("Refresh token required");
    error.status = 400;
    throw error;
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }

  const tokenRes = await pool.query(
    "select id, user_id, expires_at from refresh_tokens where token = $1",
    [refreshToken]
  );
  const stored = tokenRes.rows[0];
  if (!stored) {
    const error = new Error("Refresh token not found");
    error.status = 401;
    throw error;
  }
  if (new Date(stored.expires_at).getTime() < Date.now()) {
    const error = new Error("Refresh token expired");
    error.status = 401;
    throw error;
  }

  const userRes = await pool.query(
    "select id, name, email, role from users where id = $1",
    [payload.sub]
  );
  const user = userRes.rows[0];
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const accessToken = signAccessToken(user);
  return { accessToken };
}

async function forgotPassword({ email }) {
  const userRes = await pool.query("select id from users where email = $1", [email]);
  const user = userRes.rows[0];
  if (!user) {
    return { message: "If the account exists, a reset token was created" };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await pool.query(
    "insert into password_resets (user_id, token, expires_at) values ($1, $2, $3)",
    [user.id, token, expiresAt]
  );

  return { message: "Reset token created", resetToken: token };
}

async function resetPassword({ token, password }) {
  const resetRes = await pool.query(
    "select id, user_id, expires_at, used from password_resets where token = $1",
    [token]
  );
  const reset = resetRes.rows[0];
  if (!reset || reset.used) {
    const error = new Error("Invalid reset token");
    error.status = 400;
    throw error;
  }
  if (new Date(reset.expires_at).getTime() < Date.now()) {
    const error = new Error("Reset token expired");
    error.status = 400;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  await pool.query("update users set password_hash = $1 where id = $2", [passwordHash, reset.user_id]);
  await pool.query("update password_resets set used = true where id = $1", [reset.id]);

  return { message: "Password updated" };
}

const authService = {
  register,
  verifyOtp,
  login,
  refresh,
  forgotPassword,
  resetPassword
};

module.exports = { authService };
