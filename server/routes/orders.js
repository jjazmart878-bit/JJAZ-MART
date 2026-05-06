const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  generateOrderNumber,
  createOrder, 
  addOrderItem,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  getOrdersByUserId,
  updateOrderStatus,
  cancelOrder
} = require('../queries/orders');
const { getProductById, updateProductQuantity } = require('../queries/products');
const { getAddressForOrder } = require('../queries/addresses');
const { validate, orderSchema } = require('../middleware/validation');
const { generateToken } = require('../middleware/auth');

router.post('/', authenticateToken, validate(orderSchema), async (req, res) => {
  try {
    const { items, shippingAddressId, paymentMethod, notes } = req.body;

    const address = await getAddressForOrder(shippingAddressId);
    if (!address) {
      return res.status(400).json({ error: 'Invalid shipping address' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      if (!product.is_active) {
        return res.status(400).json({ error: `Product ${product.title} is not available` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
      }

      totalAmount += parseFloat(product.price) * item.quantity;
      orderItems.push({
        productId: product.id,
        product,
        quantity: item.quantity,
        price: product.price
      });
    }

    const orderNumber = generateOrderNumber();
    const order = await createOrder(
      req.user.id,
      orderNumber,
      totalAmount,
      shippingAddressId,
      paymentMethod,
      notes
    );

    for (const item of orderItems) {
      await addOrderItem(order.id, item.productId, item.quantity, item.price);
      await updateProductQuantity(item.productId, -item.quantity);
    }

    const fullOrder = await getOrderById(order.id);
    const orderItemsWithProducts = await getOrderItems(order.id);

    res.status(201).json({
      ...fullOrder,
      items: orderItemsWithProducts
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const orders = await getOrdersByUserId(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      status
    );
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id);
        return { ...order, items };
      })
    );
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.get('/number/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const items = await getOrderItems(order.id);
    
    res.json({ order: { ...order, items } });
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await getOrderById(parseInt(id));
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const items = await getOrderItems(order.id);
    
    res.json({ ...order, items });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await getOrderById(parseInt(id));
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }
    
    const cancelledOrder = await cancelOrder(parseInt(id));
    
    res.json(cancelledOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;