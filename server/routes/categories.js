const express = require('express');
const router = express.Router();
const { 
  getAllCategories, 
  getActiveCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  getCategoriesWithProductCount
} = require('../queries/categories');

router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const categories = active 
      ? await getActiveCategories() 
      : await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, description, imageUrl, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const categorySlug = slug || name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await createCategory(name, categorySlug, description, imageUrl, parentId);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.get('/with-products', async (req, res) => {
  try {
    const categories = await getCategoriesWithProductCount();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

module.exports = router;