const db = require('../config/db');

const getAddressesByUserId = async (userId) => {
  const result = await db.query(
    `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getAddressById = async (id, userId) => {
  const result = await db.query(
    `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
};

const getDefaultAddress = async (userId) => {
  const result = await db.query(
    `SELECT * FROM addresses WHERE user_id = $1 AND is_default = true`,
    [userId]
  );
  return result.rows[0];
};

const createAddress = async (userId, label, fullAddress, city, state, pincode, isDefault = false) => {
  if (isDefault) {
    await db.query(
      `UPDATE addresses SET is_default = false WHERE user_id = $1`,
      [userId]
    );
  }
  
  const result = await db.query(
    `INSERT INTO addresses (user_id, label, full_address, city, state, pincode, is_default) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [userId, label, fullAddress, city, state, pincode, isDefault]
  );
  return result.rows[0];
};

const updateAddress = async (id, userId, label, fullAddress, city, state, pincode, isDefault) => {
  if (isDefault) {
    await db.query(
      `UPDATE addresses SET is_default = false WHERE user_id = $1`,
      [userId]
    );
  }
  
  const result = await db.query(
    `UPDATE addresses 
     SET label = COALESCE($3, label),
         full_address = COALESCE($4, full_address),
         city = COALESCE($5, city),
         state = COALESCE($6, state),
         pincode = COALESCE($7, pincode),
         is_default = COALESCE($8, is_default)
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId, label, fullAddress, city, state, pincode, isDefault]
  );
  return result.rows[0];
};

const deleteAddress = async (id, userId) => {
  const result = await db.query(
    `DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0];
};

const setDefaultAddress = async (id, userId) => {
  await db.query(
    `UPDATE addresses SET is_default = false WHERE user_id = $1`,
    [userId]
  );
  const result = await db.query(
    `UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0];
};

const getAddressForOrder = async (id) => {
  const result = await db.query(
    `SELECT * FROM addresses WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAddressesByUserId,
  getAddressById,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressForOrder
};