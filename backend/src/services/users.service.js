const { pool } = require("../config/db");

let ensureProfileColumnsPromise = null;

function ensureProfileColumns() {
  if (!ensureProfileColumnsPromise) {
    ensureProfileColumnsPromise = (async () => {
      await pool.query("alter table users add column if not exists gender text");
      await pool.query("alter table users add column if not exists mobile text");
    })().catch((error) => {
      ensureProfileColumnsPromise = null;
      throw error;
    });
  }

  return ensureProfileColumnsPromise;
}

function mapUserRow(row) {
  if (!row) return null;

  const fullName = String(row.name || "").trim();
  const [firstName = "", ...rest] = fullName ? fullName.split(/\s+/) : [""];
  const lastName = rest.join(" ");

  return {
    id: row.id,
    firstName,
    lastName,
    name: fullName,
    email: row.email,
    gender: row.gender || "",
    mobile: row.mobile || "",
    role: row.role,
    isVerified: row.is_verified,
    createdAt: row.created_at
  };
}

function parseGender(value) {
  if (value === undefined) return undefined;
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) return "";
  if (normalized === "male" || normalized === "female" || normalized === "other") {
    return normalized;
  }

  const error = new Error("Gender must be male, female, or other");
  error.status = 400;
  throw error;
}

function parseMobile(value) {
  if (value === undefined) return undefined;

  const normalized = String(value || "").trim();
  if (!normalized) return "";

  const digits = normalized.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    const error = new Error("Mobile number must contain 10 to 15 digits");
    error.status = 400;
    throw error;
  }

  return normalized;
}

function parseEmail(value) {
  if (value === undefined) return undefined;

  const normalized = String(value || "").trim();
  if (!normalized) {
    const error = new Error("Email is required");
    error.status = 400;
    throw error;
  }

  const isValidEmail = /\S+@\S+\.\S+/.test(normalized);
  if (!isValidEmail) {
    const error = new Error("Email is invalid");
    error.status = 400;
    throw error;
  }

  return normalized;
}

async function getRawById(userId) {
  const { rows } = await pool.query(
    `
    select id, name, email, role, is_verified, created_at, gender, mobile
    from users
    where id = $1
    limit 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getById(userId) {
  await ensureProfileColumns();
  const row = await getRawById(userId);
  return mapUserRow(row);
}

async function updateById(userId, payload) {
  await ensureProfileColumns();
  const current = await getRawById(userId);
  if (!current) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const currentName = String(current.name || "").trim();
  const [defaultFirstName = "", ...defaultRest] = currentName ? currentName.split(/\s+/) : [""];
  const defaultLastName = defaultRest.join(" ");

  const nextFirstName =
    payload.firstName === undefined ? defaultFirstName : String(payload.firstName || "").trim();
  const nextLastName =
    payload.lastName === undefined ? defaultLastName : String(payload.lastName || "").trim();
  const nextName = `${nextFirstName} ${nextLastName}`.trim() || currentName || "User";

  const nextEmail = parseEmail(payload.email) ?? current.email;
  const nextGender = parseGender(payload.gender);
  const nextMobile = parseMobile(payload.mobile);

  try {
    const { rows } = await pool.query(
      `
      update users
      set name = $1,
          email = $2,
          gender = $3,
          mobile = $4
      where id = $5
      returning id, name, email, role, is_verified, created_at, gender, mobile
      `,
      [
        nextName,
        nextEmail,
        nextGender === undefined ? current.gender : nextGender || null,
        nextMobile === undefined ? current.mobile : nextMobile || null,
        userId
      ]
    );

    return mapUserRow(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      const conflictError = new Error("Email already registered");
      conflictError.status = 409;
      throw conflictError;
    }
    throw error;
  }
}

const usersService = { getById, updateById };
module.exports = { usersService };
