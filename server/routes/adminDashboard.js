const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getOrderStats,
  getRevenueStats,
  getDailyOrders,
  getRecentOrders,
  getOrderCount
} = require('../queries/orders');
const { getTotalProductCount, getLowStockProducts } = require('../queries/products');
const { getUserCount } = require('../queries/users');
const { getCategoryCount } = require('../queries/categories');

router.use(authenticateToken, isAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const orderStats = await getOrderStats();
    const revenue = await getRevenueStats();
    const totalProducts = await getTotalProductCount();
    const totalUsers = await getUserCount();
    const totalCategories = await getCategoryCount();
    const totalOrders = await getOrderCount();
    const recentOrders = await getRecentOrders(10);
    const lowStockProducts = await getLowStockProducts(10);
    
    res.json({
      stats: {
        totalOrders,
        totalRevenue: revenue,
        totalProducts,
        totalUsers,
        totalCategories,
        ordersByStatus: orderStats
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

router.get('/orders-chart', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dailyData = await getDailyOrders(parseInt(days));
    res.json(dailyData);
  } catch (error) {
    console.error('Get orders chart error:', error);
    res.status(500).json({ error: 'Failed to get chart data' });
  }
});

router.get('/revenue-chart', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dailyData = await getDailyOrders(parseInt(days));
    res.json(dailyData);
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ error: 'Failed to get revenue chart data' });
  }
});

module.exports = router;