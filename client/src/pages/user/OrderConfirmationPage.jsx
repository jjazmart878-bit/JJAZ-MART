import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../../api';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const order = params.get('order');
    if (order) setOrderNumber(order);
  }, [location]);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const res = await ordersAPI.getByNumber(orderNumber);
      return res.data?.order || res.data;
    },
    enabled: Boolean(orderNumber),
    retry: 1,
  });

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 10px 40px rgba(34,197,94,0.4)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: '#059669' }}>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for shopping with JJAZ MART
            </Typography>
            <Card sx={{ py: 2, px: 4, borderRadius: 2, display: 'inline-block', bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
              <Typography variant="body2" color="text.secondary">Order Number</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#22c55e' }}>
                {orderNumber || 'ORD-XXXXX'}
              </Typography>
            </Card>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card sx={{ mb: 3, overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Order Details</Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                      { icon: <ScheduleIcon />, label: 'Status', value: order?.status || 'Confirmed' },
                      { icon: <PaymentIcon />, label: 'Payment', value: order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online' },
                      { icon: <LocalShippingIcon />, label: 'Delivery', value: 'Within 30 minutes' },
                    ].map((item, i) => (
                      <Grid item xs={4} key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ color: '#22c55e' }}>{item.icon}</Box>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, mt: 2 }}>
                    Items Ordered ({order?.items?.length || 0})
                  </Typography>
                  
                  {isLoading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">Loading order details...</Typography>
                    </Box>
                  ) : order?.items?.length > 0 ? (
                    order.items.map((item, i) => {
                      const imgArray = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
                      return (
                      <Box key={i} sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: i < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <Box
                          component="img"
                          src={imgArray[0] || 'https://images.unsplash.com/photo-1540420773420-3366a589d3b5?w=100'}
                          alt={item.title}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#22c55e' }}>
                          ₹{Number(item.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="body2">Order details loading...</Typography>
                    </Box>
                  )}

                  {order && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Typography variant="body1" fontWeight={600}>Total</Typography>
                      <Typography variant="body1" fontWeight={700} sx={{ color: '#22c55e' }}>
                        ₹{Number(order.total_amount).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
</Card>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/products')}
            sx={{ borderColor: '#22c55e', color: '#22c55e', px: 3, '&:hover': { borderColor: '#16a34a', bgcolor: 'rgba(34,197,94,0.05)' } }}
          >
            Back to Shopping
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/profile?tab=orders')}
            sx={{ bgcolor: '#22c55e', px: 3, '&:hover': { bgcolor: '#16a34a' } }}
          >
            My Orders
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default OrderConfirmationPage;