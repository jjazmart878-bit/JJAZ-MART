const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoryCount
} = require('../queries/categories');

// All routes accessible with auth
router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Create category body:', req.body);
    const body = req.body || {};
    const { name, slug, description, image_url, parentId, icon } = body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const categorySlug = slug || String(name).toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    
    const existing = await getCategoryBySlug(categorySlug);
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    const category = await createCategory(
      String(name), 
      categorySlug, 
      description ? String(description) : null, 
      image_url ? String(image_url) : null, 
      parentId || null, 
      icon ? String(icon) : null
    );
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const body = req.body || {};
    const { name, slug, description, image_url, parentId, isActive, icon } = body;
    const category = await updateCategory(
      req.params.id, 
      name ? String(name) : null, 
      slug ? String(slug) : null, 
      description ? String(description) : null, 
      image_url ? String(image_url) : null, 
      parentId || null, 
      isActive, 
      icon ? String(icon) : null
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

router.get('/count/all', async (req, res) => {
  try {
    const count = await getCategoryCount();
    res.json({ count });
  } catch (error) {
    console.error('Get count error:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

module.exports = router;