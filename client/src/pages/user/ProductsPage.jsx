import { useState } from 'react';
import React from 'react';
import { Box, Container, Typography, Grid, Card, TextField, Chip, Button, IconButton, Badge, useMediaQuery, useTheme, Avatar, Drawer } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SortIcon from '@mui/icons-material/Sort';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGrid from '../../components/common/ProductGrid';
import { ProductGridSkeleton } from '../../components/common/Skeleton';

const getCategoryColor = (slug) => {
  const colors = {
    'fruits-vegetables': '#22c55e',
    'dairy-eggs': '#3b82f6',
    'bakery-beverages': '#f59e0b',
    'snacks-munchies': '#ef4444',
    'rice-pulses': '#8b5cf6',
    'cooking-oil': '#eab308',
    'masala-spices': '#f97316',
    'personal-care': '#ec4899',
    'household': '#06b6d4',
    'default': '#22c55e',
  };
  return colors[slug] || colors.default;
};

const CategoryImage = ({ category, isActive, size = 44 }) => {
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=${getCategoryColor(category.slug).replace('#', '')}&color=fff&size=${size}&bold=true`;
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        bgcolor: isActive ? getCategoryColor(category.slug) : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isActive ? 'none' : '2px solid #e5e7eb',
        transition: 'all 0.2s',
        boxShadow: isActive ? `0 2px 8px ${getCategoryColor(category.slug)}40` : 'none',
      }}
    >
      {category.image_url ? (
        <Box
          component="img"
          src={category.image_url}
          alt={category.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <Typography
        sx={{
          display: category.image_url ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          fontSize: size === 60 ? '1.25rem' : size === 44 ? '1rem' : '0.8rem',
          fontWeight: 700,
          color: 'white',
          textTransform: 'uppercase',
        }}
      >
        {category.name.charAt(0)}
      </Typography>
    </Box>
  );
};

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  
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

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', searchValue);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'created_at' && v !== 'DESC').length;

  const FilterContent = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SortIcon sx={{ fontSize: 18, color: '#22c55e' }} />
          Sort By
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {[
            { value: 'created_at_DESC', label: 'Newest First' },
            { value: 'price_ASC', label: 'Price: Low to High' },
            { value: 'price_DESC', label: 'Price: High to Low' },
            { value: 'title_ASC', label: 'Name: A to Z' },
          ].map((sort) => {
            const [sortBy, sortOrder] = sort.value.split('_');
            const isActive = filters.sortBy === sortBy && filters.sortOrder === sortOrder;
            return (
              <Box
                key={sort.value}
                onClick={() => {
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: isActive ? '#f0fdf4' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? '#22c55e' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f0fdf4', borderColor: '#22c55e' },
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#22c55e' : 'text.primary' }}>
                  {sort.label}
                </Typography>
                {isActive && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ height: 1, bgcolor: 'divider', my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon sx={{ fontSize: 18, color: '#22c55e' }} />
          Price Range
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Min"
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            InputProps={{ sx: { fontSize: '0.875rem' } }}
          />
          <Typography sx={{ color: 'text.secondary' }}>-</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Max"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            InputProps={{ sx: { fontSize: '0.875rem' } }}
          />
        </Box>
      </Box>

      <Box sx={{ height: 1, bgcolor: 'divider', my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ fontSize: 18, color: '#22c55e' }} />
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box
            onClick={() => handleFilterChange('category', '')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: !filters.category ? '#22c55e' : 'grey.50',
              color: !filters.category ? 'white' : 'text.primary',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: !filters.category ? '#16a34a' : 'grey.100' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: !filters.category ? 'rgba(255,255,255,0.2)' : '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShoppingCartIcon sx={{ fontSize: 16, color: !filters.category ? 'white' : '#22c55e' }} />
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: !filters.category ? 600 : 400 }}>
                All Categories
              </Typography>
            </Box>
            {!filters.category && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />}
          </Box>
          {categories.map((cat) => {
            const isActive = filters.category === cat.slug;
            return (
              <Box
                key={cat.id}
                onClick={() => handleFilterChange('category', cat.slug)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: isActive ? '#22c55e' : 'grey.50',
                  color: isActive ? 'white' : 'text.primary',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: isActive ? '#16a34a' : 'grey.100' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CategoryImage category={cat} isActive={isActive} size={32} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}>
                    {cat.name}
                  </Typography>
                </Box>
                {isActive && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: '#22c55e' }} />
          Filters
          {activeFiltersCount > 0 && (
            <Chip label={activeFiltersCount} size="small" sx={{ bgcolor: '#22c55e', color: 'white', height: 20, fontSize: '0.75rem' }} />
          )}
        </Typography>
        <IconButton onClick={() => setShowSidebar(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <FilterContent />
      </Box>
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        display: 'flex', 
        gap: 1.5,
        bgcolor: isMobile ? 'white' : 'transparent',
      }}>
        <Button 
          fullWidth
          variant="outlined"
          onClick={clearFilters}
          sx={{ 
            borderColor: 'divider', 
            color: 'text.primary',
            ...(isMobile && { bgcolor: 'white' }),
          }}
        >
          Clear All
        </Button>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={() => setShowSidebar(false)}
          sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header - Always visible */}
      <Box sx={{ 
        position: 'sticky', 
        top: isMobile ? 64 : 0, 
        zIndex: 10, 
        bgcolor: 'white', 
        py: 1.5, 
        px: 2,
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        borderBottom: isMobile ? '1px solid' : 'none',
        borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {isMobile && (
            <IconButton 
              onClick={() => setShowSidebar(true)}
              sx={{ p: 0.75 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'grey.400', mr: 1, fontSize: 20 }} />,
              endAdornment: searchValue && (
                <IconButton size="small" onClick={() => { setSearchValue(''); handleFilterChange('search', ''); }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiInputBase-input': { fontSize: '0.9rem', py: 1 },
            }}
          />
          {!isMobile && (
            <Badge badgeContent={activeFiltersCount} color="primary" sx={{ '& .MuiBadge-badge': { bgcolor: '#22c55e' } }}>
              <Button 
                variant={activeFiltersCount > 0 ? 'contained' : 'outlined'} 
                size="small" 
                onClick={() => setShowSidebar(true)}
                startIcon={<FilterListIcon />}
                sx={{ 
                  bgcolor: activeFiltersCount > 0 ? '#22c55e' : 'transparent',
                  borderColor: 'divider',
                  color: activeFiltersCount > 0 ? 'white' : 'text.primary',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  '&:hover': { bgcolor: '#16a34a' },
                }}
              >
                Filter
              </Button>
            </Badge>
          )}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 0, md: 3 }, py: { xs: 1, md: 2 } }}>
        <Grid container spacing={0}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Grid item md={3} lg={2.5}>
              <Box sx={{ 
                position: 'sticky', 
                top: 80, 
                height: 'calc(100vh - 100px)', 
                overflowY: 'auto',
                pr: 2,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 2 },
              }}>
                <Card sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Categories
                    </Typography>
                  </Box>
                  
                  <Box
                    onClick={() => handleFilterChange('category', '')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      bgcolor: !filters.category ? '#22c55e' : 'transparent',
                      color: !filters.category ? 'white' : 'text.primary',
                      border: '1px solid',
                      borderColor: !filters.category ? '#22c55e' : 'divider',
                      transition: 'all 0.2s ease',
                      mb: 1,
                      '&:hover': { bgcolor: !filters.category ? '#16a34a' : 'grey.50' },
                    }}
                  >
                    <Avatar sx={{ 
                      width: 44, 
                      height: 44, 
                      bgcolor: !filters.category ? 'rgba(255,255,255,0.2)' : '#f0fdf4',
                    }}>
                      <ShoppingCartIcon sx={{ color: !filters.category ? 'white' : '#22c55e' }} />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>All Products</Typography>
                      <Typography sx={{ fontSize: '0.7rem', opacity: !filters.category ? 0.9 : 0.6 }}>
                        {productsData?.data?.pagination?.total || 0} items
                      </Typography>
                    </Box>
                  </Box>

                  {categories.map((cat) => {
                    const isActive = filters.category === cat.slug;
                    return (
                      <Box
                        key={cat.id}
                        onClick={() => handleFilterChange('category', cat.slug)}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5, 
                          p: 1.5, 
                          borderRadius: 2.5, 
                          cursor: 'pointer',
                          bgcolor: isActive ? '#22c55e' : 'transparent',
                          color: isActive ? 'white' : 'text.primary',
                          border: '1px solid',
                          borderColor: isActive ? '#22c55e' : 'divider',
                          transition: 'all 0.2s ease',
                          mb: 0.75,
                          '&:hover': { bgcolor: isActive ? '#16a34a' : 'grey.50' },
                        }}
                      >
                        <CategoryImage category={cat} isActive={isActive} size={44} />
                        <Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{cat.name}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', opacity: isActive ? 0.9 : 0.6 }}>{cat.product_count || 0} items</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Card>

                <Card sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Sort & Filter
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {[
                      { value: 'created_at_DESC', label: 'Newest First' },
                      { value: 'price_ASC', label: 'Low to High' },
                      { value: 'price_DESC', label: 'High to Low' },
                      { value: 'title_ASC', label: 'Name: A-Z' },
                    ].map((sort) => {
                      const [sortBy, sortOrder] = sort.value.split('_');
                      const isActive = filters.sortBy === sortBy && filters.sortOrder === sortOrder;
                      return (
                        <Box
                          key={sort.value}
                          onClick={() => {
                            handleFilterChange('sortBy', sortBy);
                            handleFilterChange('sortOrder', sortOrder);
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.25,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isActive ? '#f0fdf4' : 'transparent',
                            border: '1px solid',
                            borderColor: isActive ? '#22c55e' : 'divider',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f0fdf4', borderColor: '#22c55e' },
                          }}
                        >
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#22c55e' : 'text.primary' }}>
                            {sort.label}
                          </Typography>
                          {isActive && (
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              </Box>
            </Grid>
          )}

          {/* Main Content */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* Mobile Category Strip */}
            {isMobile && (
              <Box sx={{ 
                overflowX: 'auto', 
                whiteSpace: 'nowrap',
                py: 1.5,
                px: 2,
                bgcolor: 'white',
                mb: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                '&::-webkit-scrollbar': { display: 'none' },
              }}>
                <Box sx={{ display: 'inline-flex', gap: 1.5 }}>
                  <Box
                    onClick={() => handleFilterChange('category', '')}
                    sx={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: !filters.category ? '#22c55e' : '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: !filters.category ? '3px solid #22c55e' : '3px solid #e5e7eb',
                      transition: 'all 0.2s',
                    }}>
                      <ShoppingCartIcon sx={{ color: !filters.category ? 'white' : '#22c55e', fontSize: 28 }} />
                    </Box>
                    <Typography sx={{ 
                      fontSize: '0.65rem', 
                      mt: 0.75, 
                      color: !filters.category ? '#22c55e' : 'text.secondary', 
                      fontWeight: !filters.category ? 600 : 400,
                    }}>
                      All
                    </Typography>
                  </Box>
                  {categories.map((cat) => {
                    const isActive = filters.category === cat.slug;
                    return (
                      <Box
                        key={cat.id}
                        onClick={() => handleFilterChange('category', cat.slug)}
                        sx={{
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          px: 1,
                          py: 0.5,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryImage category={cat} isActive={isActive} size={60} />
                        <Typography sx={{ 
                          fontSize: '0.6rem', 
                          mt: 0.75, 
                          color: isActive ? getCategoryColor(cat.slug) : 'text.secondary',
                          fontWeight: isActive ? 600 : 400,
                          maxWidth: 65,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {cat.name.split(' ')[0]}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Header */}
            <Box sx={{ px: { xs: 2, md: 2 }, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                    {filters.category 
                      ? categories.find(c => c.slug === filters.category)?.name || 'Products' 
                      : 'All Products'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
                    {pagination.total || products.length} items found
                  </Typography>
                </Box>
                {activeFiltersCount > 0 && (
                  <Chip
                    label={`Clear (${activeFiltersCount})`}
                    size="small"
                    onClick={clearFilters}
                    sx={{ 
                      bgcolor: 'grey.100', 
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'grey.200' },
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Products Grid */}
            <Box sx={{ px: { xs: 1, md: 2 } }}>
              {isLoading ? (
                <ProductGridSkeleton count={8} />
              ) : products.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'grey.100', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}>
                    <InventoryIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>No products found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your filters or search terms
                  </Typography>
                  <Button variant="contained" onClick={clearFilters} sx={{ bgcolor: '#22c55e' }}>
                    Clear Filters
                  </Button>
                </Box>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filters.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductGrid products={products} loading={false} />
                  </motion.div>
                </AnimatePresence>
              )}
            </Box>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.75, py: 3, px: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  sx={{ minWidth: 36, px: 1 }}
                >
                  <ArrowBackIcon sx={{ fontSize: 18 }} />
                </Button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setPage(pageNum)}
                      sx={{ 
                        minWidth: 32, 
                        px: 1,
                        bgcolor: page === pageNum ? '#22c55e' : 'transparent',
                        '&:hover': { bgcolor: page === pageNum ? '#16a34a' : 'grey.100' }
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  sx={{ minWidth: 36, px: 1 }}
                >
                  <ArrowBackIcon sx={{ fontSize: 18, transform: 'rotate(180deg)' }} />
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={showSidebar && isMobile}
        onClose={() => setShowSidebar(false)}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 320,
            bgcolor: 'white',
          }
        }}
        ModalProps={{
          BackdropProps: {
            sx: { bgcolor: 'rgba(0,0,0,0.5)' }
          }
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop Filter Sidebar */}
      {!isMobile && (
        <Drawer
          anchor="right"
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          variant="persistent"
          PaperProps={{
            sx: {
              width: 320,
              position: 'fixed',
              right: 0,
              top: 64,
              height: 'calc(100vh - 64px)',
              bgcolor: 'white',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
              transform: showSidebar ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s ease',
            }
          }}
        >
          <SidebarContent />
        </Drawer>
      )}
    </Box>
  );
};

export default ProductsPage;