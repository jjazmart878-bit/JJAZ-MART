const db = require('../config/db');

const createCategory = async (name, slug, description, imageUrl, parentId = null, icon = null) => {
  const result = await db.query(
    `INSERT INTO categories (name, slug, description, image_url, parent_id, icon) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [name, slug, description, imageUrl, parentId, icon]
  );
  return result.rows[0];
};

const getCategoryById = async (id) => {
  const result = await db.query(
    `SELECT * FROM categories WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const getCategoryBySlug = async (slug) => {
  const result = await db.query(
    `SELECT * FROM categories WHERE slug = $1`,
    [slug]
  );
  return result.rows[0];
};

const getCategoryBySlugWithProducts = async (slug, page = 1, limit = 12) => {
  const offset = (page - 1) * limit;
  const categoryResult = await db.query(
    `SELECT * FROM categories WHERE slug = $1`,
    [slug]
  );
  
  if (categoryResult.rows.length === 0) return null;
  
  const category = categoryResult.rows[0];
  
  const productsResult = await db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.category_id = $1 AND p.is_active = true 
     ORDER BY p.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [category.id, limit, offset]
  );
  
  return {
    ...category,
    products: productsResult.rows
  };
};

const getAllCategories = async () => {
  const result = await db.query(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = true) as product_count 
     FROM categories c 
     ORDER BY c.name ASC`
  );
  return result.rows;
};

const getActiveCategories = async () => {
  const result = await db.query(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = true) as product_count 
     FROM categories c 
     WHERE c.is_active = true 
     ORDER BY c.name ASC`
  );
  return result.rows;
};

const getCategoriesWithProductCount = async () => {
  const result = await db.query(
    `SELECT c.*, 
     COALESCE(
       (SELECT json_agg(p) FROM (SELECT p.id, p.title, p.slug, p.price, p.images FROM products p WHERE p.category_id = c.id AND p.is_active = true ORDER BY p.created_at DESC LIMIT 4) p),
       '[]'::json
     ) as products 
     FROM categories c 
     WHERE c.is_active = true 
     ORDER BY c.name ASC`
  );
  return result.rows;
};

const updateCategory = async (id, name, slug, description, imageUrl, parentId, isActive, icon) => {
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (name !== undefined && name !== null) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (slug !== undefined && slug !== null) {
    updates.push(`slug = $${paramCount++}`);
    values.push(slug);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description);
  }
  if (imageUrl !== undefined) {
    updates.push(`image_url = $${paramCount++}`);
    values.push(imageUrl);
  }
  if (parentId !== undefined && parentId !== null) {
    updates.push(`parent_id = $${paramCount++}`);
    values.push(parentId);
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(isActive);
  }
  if (icon !== undefined) {
    updates.push(`icon = $${paramCount++}`);
    values.push(icon);
  }
  
  if (updates.length === 0) return null;
  
  values.push(id);
  const result = await db.query(
    `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

const deleteCategory = async (id) => {
  await db.query(
    `UPDATE products SET category_id = NULL WHERE category_id = $1`,
    [id]
  );
  await db.query(
    `UPDATE categories SET parent_id = NULL WHERE parent_id = $1`,
    [id]
  );
  const result = await db.query(
    `DELETE FROM categories WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
};

const getCategoryCount = async () => {
  const result = await db.query(`SELECT COUNT(*) as count FROM categories`);
  return parseInt(result.rows[0].count);
};

const getSubcategories = async (parentId) => {
  const result = await db.query(
    `SELECT * FROM categories WHERE parent_id = $1 AND is_active = true ORDER BY name`,
    [parentId]
  );
  return result.rows;
};

module.exports = {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  getCategoryBySlugWithProducts,
  getAllCategories,
  getActiveCategories,
  getCategoriesWithProductCount,
  updateCategory,
  deleteCategory,
  getCategoryCount,
  getSubcategories
};