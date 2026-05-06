import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, Radio, RadioGroup, FormControlLabel, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { ordersAPI, addressesAPI } from '../../api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: addressesData, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesAPI.getAll(),
    enabled: isAuthenticated,
  });

  const addresses = addressesData?.data || [];
  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

  useEffect(() => {
    if (!selectedAddress && defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    }
  }, [defaultAddress]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h5">Your cart is empty</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </Container>
      </Box>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const response = await ordersAPI.create({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        shippingAddressId: selectedAddress,
        paymentMethod,
        notes,
      });
      clearCart();
      const orderNumber = response.data.order_number;
      navigate(`/order-confirmation?order=${orderNumber}`);
} catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Checkout</Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Shipping Address</Typography>
              {addresses.length === 0 ? (
                <Box>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>No address found. Please add an address.</Typography>
                  <Button variant="outlined" onClick={() => navigate('/profile?tab=addresses')}>
                    Add Address
                  </Button>
                </Box>
              ) : (
                <RadioGroup value={selectedAddress} onChange={(e) => setSelectedAddress(Number(e.target.value))}>
                  {addresses.map((addr) => (
                    <Box key={addr.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <FormControlLabel
                        value={addr.id}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography fontWeight={500}>{addr.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {addr.full_address}, {addr.city}, {addr.state} - {addr.pincode}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </RadioGroup>
              )}
            </Box>

            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Payment Method</Typography>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="online" control={<Radio />} label="Online Payment" disabled />
              </RadioGroup>
            </Box>

            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Order Notes (Optional)</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Order Summary</Typography>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography>{item.title}</Typography>
                    <Typography color="text.secondary">x{item.quantity}</Typography>
                  </Box>
                  <Typography>₹{Number(item.price * item.quantity).toLocaleString()}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
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
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setShowConfirm(true)}
                disabled={!selectedAddress || addresses.length === 0}
              >
                Place Order
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to place this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)} disabled={isProcessing}>Cancel</Button>
          <Button variant="contained" onClick={handlePlaceOrder} disabled={isProcessing}>
            {isProcessing ? <CircularProgress size={24} /> : 'Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckoutPage;