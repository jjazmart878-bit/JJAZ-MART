import { Box, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useCartStore } from '../../store/cartStore';

const FloatingCartButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCartStore();
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCartPage = location.pathname === '/cart';
  const isProductsPage = location.pathname === '/products' || location.pathname.startsWith('/products/');
  
  if (isAdminRoute || isCartPage || !isProductsPage) return null;
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (totalItems === 0) return null;
  
  const displayItems = items.slice(0, 3);
  
  return (
    <Box
      onClick={() => navigate('/cart')}
      sx={{
        position: 'fixed',
        bottom: { xs: 16, md: 24 },
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: '#22c55e',
        color: 'white',
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.25, md: 1.5 },
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, md: 2 },
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
        zIndex: 1200,
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: '#16a34a',
          transform: 'translateX(-50%) scale(1.02)',
          boxShadow: '0 6px 25px rgba(34, 197, 94, 0.5)',
        },
        '&:active': {
          transform: 'translateX(-50%) scale(0.98)',
        },
        animation: 'slideUp 0.3s ease-out',
        '@keyframes slideUp': {
          from: {
            opacity: 0,
            transform: 'translateX(-50%) translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)',
          },
        },
      }}
    >
      {/* Product Images */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {displayItems.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              width: { xs: 32, md: 36 },
              height: { xs: 32, md: 36 },
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid white',
              ml: index > 0 ? '-8px' : 0,
              bgcolor: 'white',
              position: 'relative',
              zIndex: displayItems.length - index,
              flexShrink: 0,
            }}
          >
            {item.images && item.images[0] ? (
              <Box
                component="img"
                src={item.images[0]}
                alt={item.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f0fdf4',
              }}>
                <ShoppingCartIcon sx={{ fontSize: 16, color: '#22c55e' }} />
              </Box>
            )}
          </Box>
        ))}
        {items.length > 3 && (
          <Box
            sx={{
              width: { xs: 32, md: 36 },
              height: { xs: 32, md: 36 },
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid white',
              ml: '-8px',
              bgcolor: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
              +{items.length - 3}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Divider */}
      <Box sx={{ 
        width: 1, 
        height: { xs: 28, md: 32 }, 
        bgcolor: 'rgba(255,255,255,0.3)',
        mx: 0.5,
      }} />

      {/* Total Items & Price */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
        <Box>
          <Typography sx={{ 
            fontSize: { xs: '0.65rem', md: '0.7rem' }, 
            opacity: 0.9,
            lineHeight: 1,
          }}>
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </Typography>
          <Typography sx={{ 
            fontWeight: 700, 
            fontSize: { xs: '0.9rem', md: '1rem' },
            lineHeight: 1.2,
          }}>
            ₹{totalPrice.toLocaleString()}
          </Typography>
        </Box>
        <ArrowForwardIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
      </Box>
    </Box>
  );
};

export default FloatingCartButton;