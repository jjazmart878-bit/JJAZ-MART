const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/db');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT o.*, 
        u.full_name as user_name,
        u.email as user_email,
        a.label as address_label, a.full_address, a.city, a.state, a.pincode,
        (SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'title', p.title, 'quantity', oi.quantity, 'price', oi.price, 'images', p.images::text))
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = o.id) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT o.*, 
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        a.label as address_label,
        a.full_address,
        a.city as address_city,
        a.state as address_state,
        a.pincode as address_pincode
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.id = $1 AND o.user_id = $2`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = result.rows[0];
    
    const itemsResult = await db.query(
      `SELECT oi.*, p.title, p.images 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );
    
    order.items = itemsResult.rows;
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;
    
    const orderResult = await db.query('SELECT status FROM orders WHERE id = $1 AND user_id = $2', [id, userId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const currentStatus = orderResult.rows[0].status;
    
    if (currentStatus === 'shipped' || currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return res.status(400).json({ error: 'This order cannot be cancelled' });
    }
    
    const cancelNote = ' | Cancelled by user: ' + (reason || 'No reason provided');
    await db.query(
      `UPDATE orders SET status = 'cancelled', notes = COALESCE(notes, '') || $1 WHERE id = $2`,
      [cancelNote, id]
    );
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;