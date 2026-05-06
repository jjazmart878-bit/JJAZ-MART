import { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../api';
import { motion } from 'framer-motion';
import ProductGrid from '../../components/common/ProductGrid';
import { ProductGridSkeleton } from '../../components/common/Skeleton';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
    minPrice: '',
    maxPrice: '',
    inStock: false,
  });
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { ...filters, page }],
    queryFn: () => productsAPI.getAll({ page, limit, ...filters }),
    keepPreviousData: true,
  });

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || { totalPages: 1 };
  const categories = categoriesData?.data || [];

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => v && params.set(k, v));
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      minPrice: '',
      maxPrice: '',
      inStock: false,
    });
    setSearchParams({});
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'created_at' && v !== 'DESC').length;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            {filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Products` : 'All Products'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pagination.total || products.length} products found
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterListIcon /> Filters
                  </Typography>
                  {activeFiltersCount > 0 && (
                    <Chip label={activeFiltersCount} size="small" color="primary" onClick={clearFilters} clickable />
                  )}
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'grey.400', mr: 1 }} />,
                  }}
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.slug}>{cat.name} ({cat.product_count})</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>Price Range</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Min"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Max"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <MenuItem value="created_at">Newest First</MenuItem>
                    <MenuItem value="price">Price: Low to High</MenuItem>
                    <MenuItem value="price_DESC">Price: High to Low</MenuItem>
                    <MenuItem value="title">Name: A to Z</MenuItem>
                  </Select>
                </FormControl>
              </Card>

              {categories.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Categories</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {categories.slice(0, 8).map((cat) => (
                      <Box
                        key={cat.id}
                        onClick={() => handleFilterChange('category', cat.slug)}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: filters.category === cat.slug ? 'primary.main' : 'transparent',
                          color: filters.category === cat.slug ? 'white' : 'text.primary',
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: filters.category === cat.slug ? 'primary.dark' : 'grey.100' },
                        }}
                      >
                        <Typography variant="body2">{cat.name}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>{cat.product_count} products</Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              )}
            </Box>
          </Grid>

          {/* Products Grid */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {products.length} of {pagination.total || 0} products
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('grid')}
                >
                  <ViewModuleIcon />
                </Button>
                <Button
                  size="small"
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('list')}
                >
                  <ViewListIcon />
                </Button>
              </Box>
            </Box>

            <ProductGrid products={products} loading={isLoading} columns={3} />

            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  sx={{ mr: 2 }}
                >
                  Previous
                </Button>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  Page {page} of {pagination.totalPages}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  sx={{ ml: 2 }}
                >
                  Next
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductsPage;