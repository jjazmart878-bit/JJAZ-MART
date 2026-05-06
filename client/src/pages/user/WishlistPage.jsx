import { Box, Container, Typography, Grid, Button, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const handleMoveToCart = (product) => {
    addItem(product, 1);
    removeItem(product.id);
  };

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FavoriteIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>Your wishlist is empty</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Save items you love to your wishlist
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>My Wishlist ({items.length})</Typography>

        <Grid container spacing={3}>
          {items.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                <Box
                  component="img"
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366a589d3b5?w=400'}
                  alt={product.title}
                  sx={{ width: '100%', height: 200, objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product.slug}`)}
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => navigate(`/products/${product.slug}`)}>
                    {product.title}
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
                    ₹{Number(product.price).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleMoveToCart(product)}
                      sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' }, flex: 1 }}
                    >
                      Move to Cart
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => removeItem(product.id)}
                      sx={{ bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}
                    >
                      <FavoriteIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WishlistPage;