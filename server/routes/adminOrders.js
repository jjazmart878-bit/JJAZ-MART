const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getAllOrders,
  getOrderById,
  getOrderItems,
  updateOrderStatus,
  getOrderStats,
  getRevenueStats,
  getDailyOrders,
  getRecentOrders
} = require('../queries/orders');
const { getTotalProductCount } = require('../queries/products');
const { getUserCount } = require('../queries/users');

router.use(authenticateToken, isAdmin);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const orders = await getAllOrders(parseInt(page), parseInt(limit), status, search);
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const orderStats = await getOrderStats();
    const revenue = await getRevenueStats();
    const totalProducts = await getTotalProductCount();
    const totalUsers = await getUserCount();
    const recentOrders = await getRecentOrders(5);
    
    res.json({
      orders: orderStats,
      revenue,
      products: totalProducts,
      users: totalUsers,
      recentOrders
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(parseInt(id));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const items = await getOrderItems(parseInt(id));
    res.json({ ...order, items });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dailyOrders = await getDailyOrders(parseInt(days));
    res.json(dailyOrders);
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ error: 'Failed to get chart data' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(parseInt(id));
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = await getOrderItems(order.id);
    
    res.json({ ...order, items });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await updateOrderStatus(parseInt(id), status, paymentStatus);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;