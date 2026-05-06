import { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Select, MenuItem, FormControl, InputLabel, Skeleton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminOrdersAPI } from '../../api';

const statusColors = { pending: '#fef3c7', processing: '#dbeafe', shipped: '#e0e7ff', delivered: '#dcfce7', cancelled: '#fee2e2' };
const statusText = { pending: '#d97706', processing: '#2563eb', shipped: '#7c3aed', delivered: '#059669', cancelled: '#dc2626' };

const AdminOrders = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const rowsPerPage = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['adminOrders', search], queryFn: () => adminOrdersAPI.getAll({ search, limit: 100 }) });
  const { data: orderDetails } = useQuery({ queryKey: ['adminOrderDetails', viewOrder?.id], queryFn: () => adminOrdersAPI.getById(viewOrder?.id), enabled: !!viewOrder?.id });

  const orders = data?.data?.orders || data?.data || [];

  const updateStatusMutation = useMutation({ mutationFn: (d) => adminOrdersAPI.updateStatus(d.id, { status: d.status }), onSuccess: () => { queryClient.invalidateQueries(['adminOrders']); setStatusDialog(false); toast.success('Status updated'); }, onError: () => toast.error('Failed') });

  const isUpdating = updateStatusMutation.isPending;

  const viewOrderDetails = (order) => { setViewOrder(order); };

  const openStatusChange = (order) => { setSelectedStatus(order.status); setViewOrder(order); setStatusDialog(true); };

  const handleStatusUpdate = () => { updateStatusMutation.mutate({ id: viewOrder.id, status: selectedStatus }); };

  const getDisplayOrder = () => orderDetails?.data || viewOrder;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Orders</Typography>
        <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 200 }} />
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={70} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={40} /></TableCell>
                  </TableRow>
                ))
              ) : orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell fontWeight={500}>#{order.order_number?.slice(-8) || order.id}</TableCell>
                  <TableCell>{order.user_name || 'Guest'}</TableCell>
                  <TableCell>₹{order.total_amount}</TableCell>
                  <TableCell>
                    <Chip label={order.status} size="small" onClick={() => openStatusChange(order)} clickable sx={{ bgcolor: statusColors[order.status] || '#f1f5f9', color: statusText[order.status] || '#64748b', cursor: 'pointer' }} />
                  </TableCell>
                  <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => viewOrderDetails(order)}><VisibilityIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={orders.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} />
      </Paper>

      <Dialog open={!!viewOrder && !statusDialog} onClose={() => setViewOrder(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Order #{getDisplayOrder()?.order_number?.slice(-8)}
          <Chip label={getDisplayOrder()?.status} size="small" onClick={() => openStatusChange(getDisplayOrder())} clickable sx={{ bgcolor: statusColors[getDisplayOrder()?.status] || '#f1f5f9', color: statusText[getDisplayOrder()?.status] || '#64748b', cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Customer Details</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Name</Typography><Typography fontWeight={500}>{getDisplayOrder()?.user_name || 'Guest'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Email</Typography><Typography>{getDisplayOrder()?.email || '-'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Phone</Typography><Typography>{getDisplayOrder()?.user_phone || '-'}</Typography></Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Shipping Address</Typography>
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography fontWeight={500}>{getDisplayOrder()?.address_label || 'No address'}</Typography>
            <Typography>{getDisplayOrder()?.full_address || '-'}</Typography>
            <Typography>{getDisplayOrder()?.city}, {getDisplayOrder()?.state} - {getDisplayOrder()?.pincode}</Typography>
          </Paper>

          <Typography variant="h6" sx={{ mb: 2 }}>Order Items</Typography>
          {getDisplayOrder()?.items?.length > 0 ? getDisplayOrder()?.items?.map((item) => {
            const imgArray = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            return (
            <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
              <Box sx={{ width: 50, height: 50, borderRadius: 1, overflow: 'hidden' }}>
                <img src={imgArray[0] || 'https://via.placeholder.com/50'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={500}>{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">Qty: {item.quantity} × ₹{item.price}</Typography>
              </Box>
              <Typography fontWeight={600}>₹{item.quantity * item.price}</Typography>
            </Box>
            );
          }) : <Typography color="text.secondary">No items</Typography>}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Payment</Typography>
              <Typography>{getDisplayOrder()?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">Date</Typography>
              <Typography>{getDisplayOrder()?.created_at ? new Date(getDisplayOrder().created_at).toLocaleString() : '-'}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>Total</Typography>
            <Typography variant="h5" fontWeight={700} color="#22c55e">₹{getDisplayOrder()?.total_amount}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => openStatusChange(getDisplayOrder())} startIcon={<LocalShippingIcon />} sx={{ borderColor: '#22c55e', color: '#22c55e' }} variant="outlined">Update Status</Button>
          <Button onClick={() => setViewOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} label="Status">
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)} disabled={isUpdating}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate} disabled={isUpdating} sx={{ bgcolor: '#22c55e' }}>{isUpdating ? 'Updating...' : 'Update'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;