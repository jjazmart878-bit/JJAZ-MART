import { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, TextField } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { myOrdersAPI } from '../../api';

const statusColors = { pending: '#fef3c7', processing: '#dbeafe', shipped: '#e0e7ff', delivered: '#dcfce7', cancelled: '#fee2e2' };
const statusText = { pending: '#d97706', processing: '#2563eb', shipped: '#7c3aed', delivered: '#059669', cancelled: '#dc2626' };
const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];

const MyOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['myOrders'], queryFn: myOrdersAPI.getAll });
  const orders = data?.data || data || [];

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => myOrdersAPI.cancel(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myOrders']);
      setCancelDialog(false);
      setCancelReason('');
      setSelectedOrder(null);
      toast.success('Order cancelled successfully');
    },
    onError: () => toast.error('Failed to cancel order')
  });

  const isCancelling = cancelMutation.isPending;

  const canCancel = selectedOrder?.status === 'pending' || selectedOrder?.status === 'processing';

  const handleCancel = () => {
    const finalReason = cancelReason || 'No reason provided';
    cancelMutation.mutate({ id: selectedOrder.id, reason: finalReason });
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>My Orders</Typography>

        {isLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} key={i}>
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Skeleton width="30%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="20%" height={20} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No orders yet</Typography>
            <Button variant="contained" sx={{ mt: 2, bgcolor: '#22c55e' }} href="/products">Shop Now</Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Order #{order.order_number?.slice(-8) || order.id}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(order.created_at).toLocaleDateString()}</Typography>
                    </Box>
                    <Chip 
                      label={order.status} 
                      size="small" 
                      sx={{ bgcolor: statusColors[order.status] || '#f1f5f9', color: statusText[order.status] || '#64748b', fontWeight: 600 }} 
                    />
                  </Box>
<Box sx={{ p: 2 }}>
                    {order.items?.slice(0, 2).map((item) => {
                      const imgArray = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : item.images;
                      return (
                        <Box key={item.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                          <Box sx={{ width: 50, height: 50, borderRadius: 1, overflow: 'hidden', bgcolor: '#f0f0f0' }}>
                            <img src={imgArray?.[0] || 'https://via.placeholder.com/50'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>{item.title}</Typography>
                            <Typography variant="caption" color="text.secondary">Qty: {item.quantity} × ₹{item.price}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    {order.items?.length > 2 && (
                      <Typography variant="caption" color="text.secondary">+{order.items.length - 2} more items</Typography>
                    )}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                      <Typography variant="h6" fontWeight={700} color="#22c55e">₹{order.total_amount}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="outlined" onClick={() => setSelectedOrder(order)} sx={{ borderColor: '#22c55e', color: '#22c55e' }}>View Details</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Order #{selectedOrder?.order_number?.slice(-8)}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Chip label={selectedOrder?.status} sx={{ bgcolor: statusColors[selectedOrder?.status], color: statusText[selectedOrder?.status], fontWeight: 600 }} />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Order Tracking</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 12, left: 20, right: 20, height: 2, bgcolor: '#e2e8f0', zIndex: 0 } }}>
            {statusOrder.map((step, idx) => {
              const currentIdx = statusOrder.indexOf(selectedOrder?.status);
              const isCompleted = currentIdx >= idx;
              const isCurrent = selectedOrder?.status === step;
              const isCancelled = selectedOrder?.status === 'cancelled';
              return (
                <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: isCompleted && !isCancelled ? '#22c55e' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isCompleted && !isCancelled && <CheckCircleIcon sx={{ color: '#fff', fontSize: 14 }} />}
                    {isCancelled && <CancelIcon sx={{ color: '#dc2626', fontSize: 14 }} />}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 0.5, fontWeight: isCurrent ? 600 : 400, textTransform: 'capitalize' }}>{step}</Typography>
                  {isCurrent && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{new Date(selectedOrder?.updated_at || selectedOrder?.created_at).toLocaleDateString()}</Typography>}
                </Box>
              );
            })}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Shipping Address</Typography>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={500}>{selectedOrder?.address_label || 'No address'}</Typography>
            <Typography variant="body2">{selectedOrder?.full_address || '-'}</Typography>
            <Typography variant="body2">{selectedOrder?.address_city}, {selectedOrder?.address_state} - {selectedOrder?.address_pincode}</Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Items</Typography>
          {selectedOrder?.items?.map((item) => {
            const imgArray = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : item.images;
            return (
            <Box key={item.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
              <Box sx={{ width: 50, height: 50, borderRadius: 1, overflow: 'hidden' }}>
                <img src={imgArray?.[0] || 'https://via.placeholder.com/50'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500}>{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">Qty: {item.quantity} × ₹{item.price}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>₹{item.quantity * item.price}</Typography>
            </Box>
            );
          })}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1" fontWeight={600}>Total</Typography>
            <Typography variant="h6" fontWeight={700} color="#22c55e">₹{selectedOrder?.total_amount}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          {canCancel && (
            <Button onClick={() => setCancelDialog(true)} startIcon={<CancelIcon />} sx={{ color: '#dc2626' }}>
              Cancel Order
            </Button>
          )}
          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to cancel this order? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {['Ordered by mistake', 'Found better price elsewhere', 'Delivery taking too long', 'Changed my mind', 'Other'].map((reason) => (
              <Chip 
                key={reason}
                label={reason}
                onClick={() => setCancelReason(reason)}
                sx={{ 
                  bgcolor: cancelReason === reason ? '#dc2626' : '#f1f5f9',
                  color: cancelReason === reason ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: cancelReason === reason ? '#dc2626' : '#e2e8f0' }
                }}
              />
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Additional details (optional)"
            value={(cancelReason === 'Other' ? '' : (cancelReason || ''))}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={!!cancelReason && cancelReason !== 'Other' && !['Ordered by mistake', 'Found better price elsewhere', 'Delivery taking too long', 'Changed my mind', 'Other'].includes(cancelReason)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)} disabled={isCancelling}>No, Keep Order</Button>
          <Button onClick={handleCancel} disabled={isCancelling} variant="contained" sx={{ bgcolor: '#dc2626' }}>{isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyOrdersPage;