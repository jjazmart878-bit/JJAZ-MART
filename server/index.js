require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { initDatabase } = require('./queries/schema');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const adminProductRoutes = require('./routes/adminProducts');
const adminCategoryRoutes = require('./routes/adminCategories');
const adminOrderRoutes = require('./routes/adminOrders');
const adminDashboardRoutes = require('./routes/adminDashboard');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
const userOrdersRoutes = require('./routes/userOrders');

const app = express();
const PORT = process.env.PORT || 5000;

// Keep server alive - respond to external pings
app.get('/api/ping', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Note: For free Render plan, use external cron service like https://cron-job.org
// to ping your app every 10 minutes: https://your-app.onrender.com/api/ping

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/my-orders', userOrdersRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    await initDatabase();
    
    try {
      await db.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(20)`);
    } catch (e) {}
    try {
      await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT`);
    } catch (e) {}
    
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();