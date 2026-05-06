import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TablePagination, useMediaQuery, useTheme, Skeleton, Backdrop, CircularProgress } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { adminOrdersAPI, adminProductsAPI } from '../../api';

const StatCard = ({ title, value, subtitle, icon, color, bgColor, loading }) => (
  <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      {loading ? <Skeleton variant="rounded" width={48} height={48} /> : <Box sx={{ bgcolor: bgColor || `${color}15`, p: 1.25, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>}
    </Box>
    {loading ? <Skeleton width="60%" height={40} /> : <Typography variant="h4" fontWeight={700} sx={{ color: color }}>{value}</Typography>}
    {loading ? <Skeleton width="40%" /> : <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>}
  </Paper>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">₹{payload[0].value}</Typography>
      </Box>
    );
  }
  return null;
};

const AdminDashboardHome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [pageOrders, setPageOrders] = useState(0);
  const rowsPerPage = 5;

  const { data: ordersData, isLoading: ordersLoading, isFetching: ordersFetching } = useQuery({ queryKey: ['adminOrders'], queryFn: () => adminOrdersAPI.getAll({ limit: 50 }), refetchInterval: 30000 });
  const { data: productsData, isLoading: productsLoading, isFetching: productsFetching } = useQuery({ queryKey: ['adminProducts'], queryFn: () => adminProductsAPI.getAll(), refetchInterval: 30000 });

  const showBackdrop = ordersFetching && ordersLoading;

  const orders = ordersData?.data?.orders || ordersData?.data || [];
  const products = productsData?.data?.products || productsData?.data || [];

  const totalRevenue = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const uniqueCustomers = [...new Set(orders.map(o => o.user_id))].length;

  const revenueByDay = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').slice(0, 10).reverse().map(o => ({ name: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: Number(o.total_amount) }));
  const ordersByStatus = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
    { name: 'Processing', value: orders.filter(o => o.status === 'processing').length },
    { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard Overview</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<AttachMoneyIcon sx={{ color: '#22c55e', fontSize: 24 }} />} color="#22c55e" bgColor="#dcfce7" loading={ordersLoading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Orders" value={orders.length} icon={<LocalShippingIcon sx={{ color: '#3b82f6', fontSize: 24 }} />} color="#3b82f6" bgColor="#dbeafe" loading={ordersLoading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Products" value={products.length} icon={<InventoryIcon sx={{ color: '#f59e0b', fontSize: 24 }} />} color="#f59e0b" bgColor="#fef3c7" loading={productsLoading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Customers" value={uniqueCustomers} icon={<PeopleIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />} color="#8b5cf6" bgColor="#ede9fe" loading={ordersLoading} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Revenue Trend</Typography>
            <Box sx={{ height: 280 }}>
              {ordersLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Skeleton variant="rounded" width="100%" height="100%" />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByDay}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Orders by Status</Typography>
            <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {ordersLoading ? (
                <Skeleton variant="rounded" width="100%" height="100%" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByStatus} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Orders</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={60} /></TableCell>
                        <TableCell><Skeleton width={60} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                      </TableRow>
                    ))
                  ) : orders.slice(pageOrders * rowsPerPage, pageOrders * rowsPerPage + rowsPerPage).map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell fontWeight={500}>#{order.order_number?.slice(-6) || order.id}</TableCell>
                      <TableCell>{order.user_name || 'Guest'}</TableCell>
                      <TableCell>₹{order.total_amount}</TableCell>
                      <TableCell>
                        <Chip label={order.status || 'pending'} size="small" sx={{ bgcolor: order.status === 'delivered' ? '#dcfce7' : order.status === 'cancelled' ? '#fee2e2' : '#fef3c7', color: order.status === 'delivered' ? '#059669' : order.status === 'cancelled' ? '#dc2626' : '#d97706', fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={orders.length} page={pageOrders} onPageChange={(e, p) => setPageOrders(p)} rowsPerPage={rowsPerPage} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardHome;