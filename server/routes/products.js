const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductBySlug, 
  getProductById,
  getFeaturedProducts, 
  getProductsByCategory,
  getRelatedProducts 
} = require('../queries/products');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sortBy, sortOrder } = req.query;
    
    let categoryId = null;
    if (category) {
      const { getCategoryBySlug } = require('../queries/categories');
      const cat = await getCategoryBySlug(category);
      categoryId = cat ? cat.id : null;
    }
    
    const products = await getProducts(
      parseInt(page),
      parseInt(limit),
      categoryId,
      search,
      sortBy,
      sortOrder
    );
    
    res.json({ products, pagination: { page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get products error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await getFeaturedProducts(parseInt(limit));
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to get featured products' });
  }
});

router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const { getCategoryBySlugWithProducts } = require('../queries/categories');
    const category = await getCategoryBySlugWithProducts(slug, parseInt(page), parseInt(limit));
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

router.get('/related/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const product = await getProductById(parseInt(id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const related = await getRelatedProducts(product.id, product.category_id, parseInt(limit));
    res.json(related);
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({ error: 'Failed to get related products' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

module.exports = router;