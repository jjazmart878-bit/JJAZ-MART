require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { initDatabase } = require('./queries/schema');
const nodemailer = require('nodemailer');

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

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('Testing email connection...');
    console.log('SMTP Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('SMTP User:', process.env.EMAIL_USER);
    
    await transporter.verify();
    console.log('SMTP connection successful!');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"JJAZ MART" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER,
      subject: 'Test Email from JJAZ MART',
      text: 'This is a test email to verify SMTP is working.'
    });

    console.log('Test email sent, Message ID:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Test email failed:', error);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    res.status(500).json({ success: false, error: error.message, code: error.code });
  }
});

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