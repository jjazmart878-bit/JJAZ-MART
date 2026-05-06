import { useState } from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, Badge, Container, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme, Button, InputBase, Popper, Paper, ListItemAvatar, Avatar, Skeleton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { productsAPI } from '../../api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnchor, setSearchAnchor] = useState(null);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => productsAPI.getAll({ search: searchQuery, limit: 8 }),
    enabled: searchQuery.length >= 2,
  });

  const suggestions = searchResults?.products || searchResults?.data?.products || [];

  const { isAuthenticated } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ height: { xs: 60, sm: 70 }, justifyContent: 'space-between', px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Logo Section */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              onClick={() => navigate('/')} 
              style={{ cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  component="img" 
                  src="/logo.png" 
                  alt="JJAZ MART" 
                  sx={{ 
                    height: { xs: 28, sm: 34 }, 
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(0)'
                  }} 
                />
                <Typography 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#111', 
                    fontSize: { xs: '0.95rem', sm: '1.15rem' },
                    letterSpacing: '-0.02em'
                  }}
                >
                  JJAZ MART
                </Typography>
              </Box>
            </motion.div>

            {/* Search Bar - Desktop/Tablet */}
            {!isMobile && (
              <Box sx={{ position: 'relative' }}>
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#f8f9fa',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.5,
                  width: { md: 360, lg: 400 },
                  border: '1px solid #e9ecef',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s ease',
                  '&:focus-within': { 
                    borderColor: '#22c55e',
                    bgcolor: '#fff',
                    boxShadow: '0 0 0 3px rgba(34,197,94,0.1)'
                  },
                }}
              >
                <SearchIcon sx={{ color: '#adb5bd', ml: 1, fontSize: 20 }} />
                <InputBase
                  placeholder="Search for groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => setSearchAnchor(e.target)}
                  sx={{ 
                    flex: 1, 
                    fontSize: '0.9rem',
                    color: '#333',
                    '&::placeholder': { color: '#adb5bd' }
                  }}
                />
                {searchQuery.length >= 2 && suggestions.length > 0 && (
                  <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5, zIndex: 1300, maxHeight: 300, overflow: 'auto', borderRadius: 2, boxShadow: 3 }}>
                    {isSearchLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <ListItem key={i}>
                          <ListItemAvatar>
                            <Skeleton variant="rounded" width={40} height={40} />
                          </ListItemAvatar>
                          <ListItemText primary={<Skeleton width="80%" />} secondary={<Skeleton width="40%" />} />
                        </ListItem>
                      ))
                    ) : suggestions.map((product) => (
                      <ListItem key={product.id} onClick={() => { navigate(`/products/${product.slug}`); setSearchQuery(''); }} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                        <ListItemAvatar>
                          <Avatar variant="rounded" src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366a589d3b5?w=100'} sx={{ width: 40, height: 40 }} />
                        </ListItemAvatar>
                        <ListItemText primary={product.title} secondary={`₹${product.price}`} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
                      </ListItem>
                    ))}
                  </Paper>
                )}
                <Button
                  type="submit"
                  sx={{
                    bgcolor: '#22c55e',
                    color: '#fff',
                    borderRadius: '8px',
                    px: { md: 2, lg: 2.5 },
                    py: 0.75,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 1px 2px rgba(34,197,94,0.2)',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: '#16a34a',
                      transform: 'translateY(-0.5px)',
                      boxShadow: '0 2px 4px rgba(34,197,94,0.3)'
                    },
                  }}
                >
                  Search
                </Button>
              </Box>
              </Box>
            )}

            {/* Desktop Nav Links */}
            {!isTablet && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {navLinks.map((link, idx) => (
                  <Button
                    key={idx}
                    onClick={() => navigate(link.path)}
                    sx={{
                      color: isActive(link.path) ? '#22c55e' : '#495057',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      px: 1.75,
                      py: 0.75,
                      borderRadius: '8px',
                      textTransform: 'none',
                      letterSpacing: '0.01em',
                      bgcolor: isActive(link.path) ? 'rgba(34,197,94,0.1)' : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        color: '#22c55e',
                        bgcolor: 'rgba(34,197,94,0.08)',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Icons Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5 } }}>
              {/* Mobile Search Icon */}
              {isMobile && (
                <IconButton 
                  onClick={() => navigate('/products')} 
                  sx={{ 
                    color: '#495057',
                    bgcolor: '#f8f9fa',
                    borderRadius: '10px',
                    p: 1,
                    '&:hover': { bgcolor: '#e9ecef' }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              )}

              {/* Cart */}
              <IconButton 
                onClick={() => navigate('/cart')} 
                sx={{ 
                  color: '#495057',
                  bgcolor: '#f8f9fa',
                  borderRadius: '10px',
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#e9ecef' }
                }}
              >
                <Badge 
                  badgeContent={cartCount} 
                  color="error" 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      fontSize: 9, 
                      minWidth: 16, 
                      height: 16,
                      fontWeight: 600
                    } 
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* Wishlist */}
              <IconButton 
                onClick={() => navigate('/wishlist')} 
                sx={{ 
                  color: '#495057',
                  bgcolor: '#f8f9fa',
                  borderRadius: '10px',
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#e9ecef' }
                }}
              >
                <Badge 
                  badgeContent={wishlistCount} 
                  color="error" 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      fontSize: 9, 
                      minWidth: 16, 
                      height: 16,
                      fontWeight: 600
                    } 
                  }}
                >
                  <FavoriteIcon sx={{ color: wishlistCount > 0 ? '#dc2626' : 'inherit' }} />
                </Badge>
              </IconButton>

              {/* Profile */}
              <IconButton 
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')} 
                sx={{ 
                  color: '#495057',
                  bgcolor: '#f8f9fa',
                  borderRadius: '10px',
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#e9ecef' }
                }}
              >
                <PersonIcon />
              </IconButton>

              {/* Mobile Menu */}
              {isTablet && (
                <IconButton 
                  onClick={() => setMobileMenuOpen(true)} 
                  sx={{ 
                    color: '#495057',
                    bgcolor: '#f8f9fa',
                    borderRadius: '10px',
                    p: 1,
                    '&:hover': { bgcolor: '#e9ecef' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer 
        anchor="right" 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ 
          sx: { 
            width: { xs: 280, sm: 320 },
            bgcolor: '#fff'
          } 
        }}
      >
        <Box sx={{ pt: 2 }}>
          <Box sx={{ px: 2.5, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" fontWeight={600} color="#111">Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Mobile Search */}
          {isMobile && (
            <Box component="form" onSubmit={handleSearch} sx={{ px: 2.5, py: 2, borderBottom: '1px solid #f0f0f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8f9fa', borderRadius: '10px', px: 1.5, py: 0.75, border: '1px solid #e9ecef' }}>
                <SearchIcon sx={{ color: '#adb5bd', mr: 1, fontSize: 20 }} />
                <InputBase
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.9rem' }}
                  fullWidth
                />
              </Box>
            </Box>
          )}
          
          <List sx={{ px: 1.5, pt: 2 }}>
            {navLinks.map((link, idx) => (
              <ListItem 
                key={idx} 
                onClick={() => { navigate(link.path); setMobileMenuOpen(false); }} 
                sx={{ 
                  cursor: 'pointer', 
                  borderRadius: '10px',
                  mb: 0.5,
                  color: isActive(link.path) ? '#22c55e' : '#333',
                  fontWeight: isActive(link.path) ? 600 : 500,
                  bgcolor: isActive(link.path) ? 'rgba(34,197,94,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    bgcolor: 'rgba(34,197,94,0.08)',
                    color: '#22c55e'
                  }
                }}
              >
                <ListItemText 
                  primary={link.label} 
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Toolbar sx={{ height: { xs: 60, sm: 70 } }} />
    </>
  );
};

export default Header;