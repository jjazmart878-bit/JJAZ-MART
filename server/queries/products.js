const db = require('../config/db');

const createProduct = async (title, slug, description, shortDescription, specifications, categoryId, price, originalPrice, quantity, images, isFeatured = false) => {
  const imageJson = images && images.length > 0 ? JSON.stringify(images) : '[]';
  const result = await db.query(
    `INSERT INTO products (title, slug, description, short_description, specifications, category_id, price, original_price, quantity, images, is_featured) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10) 
     RETURNING *`,
    [title, slug, description, shortDescription, specifications, categoryId, price, originalPrice, quantity, imageJson, isFeatured]
  );
  return result.rows[0];
};

const getProductById = async (id) => {
  const result = await db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
};

const getProductBySlug = async (slug) => {
  const result = await db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.slug = $1`,
    [slug]
  );
  return result.rows[0];
};

const getProducts = async (page = 1, limit = 12, categoryId = null, search = null, sortBy = 'created_at', sortOrder = 'DESC') => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.is_active = true
  `;
  const params = [];
  
  if (categoryId) {
    query += ` AND p.category_id = $${params.length + 1}`;
    params.push(categoryId);
  }
  
  if (search) {
    query += ` AND (p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }
  
  const validSortColumns = ['created_at', 'price', 'title'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY p.${sortColumn} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
};

const getAllProducts = async (page = 1, limit = 20, search = null) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (search) {
    query += ` AND (p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }
  
  query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
};

const getFeaturedProducts = async (limit = 10) => {
  const result = await db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.is_active = true AND p.is_featured = true 
     ORDER BY p.created_at DESC 
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const getProductsByCategory = async (categorySlug, page = 1, limit = 12) => {
  const offset = (page - 1) * limit;
  const result = await db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE c.slug = $1 AND p.is_active = true 
     ORDER BY p.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [categorySlug, limit, offset]
  );
  return result.rows;
};

const getRelatedProducts = async (productId, categoryId, limit = 10) => {
  const result = await db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id != $1 AND p.category_id = $2 AND p.is_active = true 
     ORDER BY p.created_at DESC 
     LIMIT $3`,
    [productId, categoryId, limit]
  );
  return result.rows;
};

const updateProduct = async (id, title, slug, description, shortDescription, specifications, categoryId, price, originalPrice, quantity, images, isActive, isFeatured) => {
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (title !== undefined && title !== null) { updates.push(`title = $${paramCount++}`); values.push(title); }
  if (slug !== undefined && slug !== null) { updates.push(`slug = $${paramCount++}`); values.push(slug); }
  if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
  if (shortDescription !== undefined) { updates.push(`short_description = $${paramCount++}`); values.push(shortDescription); }
  if (specifications !== undefined) { updates.push(`specifications = $${paramCount++}`); values.push(specifications); }
  if (categoryId !== undefined && categoryId !== null) { updates.push(`category_id = $${paramCount++}`); values.push(categoryId); }
  if (price !== undefined && price !== null) { updates.push(`price = $${paramCount++}`); values.push(price); }
  if (originalPrice !== undefined) { updates.push(`original_price = $${paramCount++}`); values.push(originalPrice); }
  if (quantity !== undefined) { updates.push(`quantity = $${paramCount++}`); values.push(quantity); }
  if (images !== undefined && images !== null) { updates.push(`images = $${paramCount++}`); values.push(JSON.stringify(images)); }
  if (isActive !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(isActive); }
  if (isFeatured !== undefined) { updates.push(`is_featured = $${paramCount++}`); values.push(isFeatured); }
  
  if (updates.length === 0) return null;
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  
  const result = await db.query(
    `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await db.query(
    `DELETE FROM products WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
};

const toggleProductActive = async (id) => {
  const result = await db.query(
    `UPDATE products SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const toggleProductFeatured = async (id) => {
  const result = await db.query(
    `UPDATE products SET is_featured = NOT is_featured, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const getProductCount = async () => {
  const result = await db.query(`SELECT COUNT(*) as count FROM products WHERE is_active = true`);
  return parseInt(result.rows[0].count);
};

const getTotalProductCount = async () => {
  const result = await db.query(`SELECT COUNT(*) as count FROM products`);
  return parseInt(result.rows[0].count);
};

const getActiveProducts = async (categoryId = null, search = null) => {
  let query = `SELECT COUNT(*) as count FROM products WHERE is_active = true`;
  const params = [];
  
  if (categoryId) {
    query += ` AND category_id = $1`;
    params.push(categoryId);
  }
  
  if (search) {
    query += categoryId ? ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})` : ` AND (title ILIKE $1 OR description ILIKE $1)`;
    params.push(`%${search}%`);
  }
  
  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
};

const getLowStockProducts = async (threshold = 10) => {
  const result = await db.query(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.quantity <= $1 AND p.is_active = true 
     ORDER BY p.quantity ASC 
     LIMIT 10`,
    [threshold]
  );
  return result.rows;
};

const updateProductQuantity = async (id, quantityChange) => {
  const result = await db.query(
    `UPDATE products SET quantity = quantity + $1 WHERE id = $2 RETURNING *`,
    [quantityChange, id]
  );
  return result.rows[0];
};

module.exports = {
  createProduct,
  getProductById,
  getProductBySlug,
  getProducts,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  toggleProductFeatured,
  getProductCount,
  getTotalProductCount,
  getLowStockProducts,
  updateProductQuantity
};