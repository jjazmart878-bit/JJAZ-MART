const db = require('../config/db');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const createOrder = async (userId, orderNumber, totalAmount, shippingAddressId, paymentMethod, notes) => {
  const result = await db.query(
    `INSERT INTO orders (user_id, order_number, total_amount, shipping_address_id, payment_method, notes) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [userId, orderNumber, totalAmount, shippingAddressId, paymentMethod, notes]
  );
  return result.rows[0];
};

const addOrderItem = async (orderId, productId, quantity, price) => {
  const result = await db.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [orderId, productId, quantity, price]
  );
  return result.rows[0];
};

const updateProductQuantity = async (productId, quantityChange) => {
  const result = await db.query(
    `UPDATE products SET quantity = quantity + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [productId, quantityChange]
  );
  return result.rows[0];
};

const getOrderById = async (id) => {
  const result = await db.query(
    `SELECT o.*, 
     a.label as address_label, a.full_address, a.city, a.state, a.pincode,
     u.email, u.full_name as user_name, u.phone as user_phone
     FROM orders o
     LEFT JOIN addresses a ON o.shipping_address_id = a.id
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.id = $1`,
    [id]
  );
  return result.rows[0];
};

const getOrderByNumber = async (orderNumber) => {
  const result = await db.query(
    `SELECT o.*, 
     a.label as address_label, a.full_address, a.city, a.state, a.pincode,
     u.email, u.full_name as user_name, u.phone as user_phone
     FROM orders o
     LEFT JOIN addresses a ON o.shipping_address_id = a.id
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.order_number = $1`,
    [orderNumber]
  );
  return result.rows[0];
};

const getOrderItems = async (orderId) => {
  const result = await db.query(
    `SELECT oi.*, p.title, p.slug, p.images::text as images 
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return result.rows;
};

const getOrdersByUserId = async (userId, page = 1, limit = 10, status = null) => {
  const offset = (page - 1) * limit;
  let query = `SELECT * FROM orders WHERE user_id = $1`;
  const params = [userId];
  
  if (status) {
    query += ` AND status = $${params.length + 1}`;
    params.push(status);
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
};

const getAllOrders = async (page = 1, limit = 20, status = null, search = null) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT o.*, u.email as user_email, u.full_name as user_name, u.phone as user_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (status) {
    query += ` AND o.status = $${params.length + 1}`;
    params.push(status);
  }
  
  if (search) {
    query += ` AND (o.order_number ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }
  
  query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
};

const updateOrderStatus = async (id, status, paymentStatus = null) => {
  let query = `
    UPDATE orders 
    SET status = $2, updated_at = CURRENT_TIMESTAMP
  `;
  const params = [id, status];
  
  if (paymentStatus) {
    query += `, payment_status = $${params.length + 1}`;
    params.push(paymentStatus);
  }
  
  query += ` WHERE id = $1 RETURNING *`;
  
  const result = await db.query(query, params);
  return result.rows[0];
};

const cancelOrder = async (id) => {
  const orderItems = await getOrderItems(id);
  
  for (const item of orderItems) {
    await updateProductQuantity(item.product_id, item.quantity);
  }
  
  const result = await db.query(
    `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const getOrderStats = async () => {
  const totalOrders = await db.query(`SELECT COUNT(*) as count FROM orders`);
  const pendingOrders = await db.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`);
  const confirmedOrders = await db.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'processing'`);
  const shippedOrders = await db.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'`);
  const deliveredOrders = await db.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'`);
  const cancelledOrders = await db.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'`);
  
  return {
    total: parseInt(totalOrders.rows[0].count),
    pending: parseInt(pendingOrders.rows[0].count),
    confirmed: parseInt(confirmedOrders.rows[0].count),
    shipped: parseInt(shippedOrders.rows[0].count),
    delivered: parseInt(deliveredOrders.rows[0].count),
    cancelled: parseInt(cancelledOrders.rows[0].count)
  };
};

const getRevenueStats = async () => {
  const result = await db.query(
    `SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
     FROM orders 
     WHERE status IN ('shipped', 'delivered')`
  );
  return parseFloat(result.rows[0].total_revenue);
};

const getDailyOrders = async (days = 30) => {
  const result = await db.query(
    `SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue
     FROM orders 
     WHERE created_at >= NOW() - INTERVAL '${days} days' AND status != 'cancelled'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`
  );
  return result.rows;
};

const getRecentOrders = async (limit = 10) => {
  const result = await db.query(
    `SELECT o.*, u.email, u.full_name as user_name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const getOrderCount = async () => {
  const result = await db.query(`SELECT COUNT(*) as count FROM orders`);
  return parseInt(result.rows[0].count);
};

module.exports = {
  generateOrderNumber,
  createOrder,
  addOrderItem,
  updateProductQuantity,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getRevenueStats,
  getDailyOrders,
  getRecentOrders,
  getOrderCount
};