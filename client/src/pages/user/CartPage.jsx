import { Box, Container, Typography, Grid, Button, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCartStore();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>Your cart is empty</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Looks like you haven't added anything to your cart yet.
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
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Shopping Cart ({itemCount})</Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 3, p: 3, bgcolor: 'white', borderRadius: 2, mb: 2 }}>
                <Box
                  component="img"
                  src={item.images?.[0] || '/placeholder.jpg'}
                  alt={item.title}
                  sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${item.slug}`)}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, cursor: 'pointer' }} onClick={() => navigate(`/products/${item.slug}`)}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.category_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: 'center' }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      ₹{Number(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => removeItem(item.id)} sx={{ alignSelf: 'flex-start' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Order Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>₹{total.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography>Free</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" fontWeight={700}>₹{total.toLocaleString()}</Typography>
              </Box>
              <Button variant="contained" fullWidth size="large" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;