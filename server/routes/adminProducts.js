const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { validate, productSchema } = require('../middleware/validation');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  toggleProductFeatured
} = require('../queries/products');

router.use(authenticateToken, isAdmin);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const products = await getAllProducts(parseInt(page), parseInt(limit), search);
    
    const { getTotalProductCount } = require('../queries/products');
    const total = await getTotalProductCount();
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const { title, slug, description, short_description, specifications, category_id, price, original_price, quantity, images, is_active, is_featured } = body;
    
    if (!title || !price || !category_id) {
      return res.status(400).json({ error: 'Title, price, and category are required' });
    }
    
    const productSlug = slug || String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    
    const product = await createProduct(
      String(title), 
      productSlug, 
      description ? String(description) : null, 
      short_description ? String(short_description) : null,
      specifications ? String(specifications) : null, 
      Number(category_id), 
      Number(price), 
      original_price ? Number(original_price) : null, 
      quantity ? Number(quantity) : 0, 
      images && images.length ? images : [], 
      is_featured === true
    );
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(parseInt(id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { title, slug, description, short_description, specifications, category_id, price, original_price, quantity, images, is_active, is_featured } = body;
    
    const product = await updateProduct(
      parseInt(id),
      title ? String(title) : null,
      slug ? String(slug) : null,
      description ? String(description) : null,
      short_description ? String(short_description) : null,
      specifications !== undefined ? (specifications ? String(specifications) : null) : null,
      category_id ? Number(category_id) : null,
      price ? Number(price) : null,
      original_price ? Number(original_price) : null,
      quantity !== undefined ? Number(quantity) : null,
      images && images.length ? images : null,
      is_active !== undefined ? is_active : null,
      is_featured !== undefined ? is_featured : null
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProduct(parseInt(id));
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.put('/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await toggleProductActive(parseInt(id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Toggle product active error:', error);
    res.status(500).json({ error: 'Failed to toggle product status' });
  }
});

router.put('/:id/toggle-featured', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await toggleProductFeatured(parseInt(id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Toggle product featured error:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

module.exports = router;