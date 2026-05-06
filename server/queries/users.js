const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (email, passwordHash, fullName, phone) => {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, full_name, phone) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, email, full_name, phone, role, avatar_url, created_at`,
    [email, passwordHash, fullName, phone]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await db.query(
    `SELECT id, email, full_name as "fullName", phone, role, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateUser = async (id, fullName, phone, avatarUrl) => {
  const result = await db.query(
    `UPDATE users 
     SET full_name = COALESCE($2, full_name), 
         phone = COALESCE($3, phone), 
         avatar_url = COALESCE($4, avatar_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 
     RETURNING id, email, full_name, phone, role, avatar_url`,
    [id, fullName, phone, avatarUrl]
  );
  return result.rows[0];
};

const updatePassword = async (id, newPasswordHash) => {
  const result = await db.query(
    `UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
    [id, newPasswordHash]
  );
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await db.query(
    `SELECT id, email, full_name, phone, role, avatar_url, created_at 
     FROM users ORDER BY created_at DESC`
  );
  return result.rows;
};

const getUserCount = async () => {
  const result = await db.query(`SELECT COUNT(*) as count FROM users`);
  return parseInt(result.rows[0].count);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updatePassword,
  getAllUsers,
  getUserCount
};