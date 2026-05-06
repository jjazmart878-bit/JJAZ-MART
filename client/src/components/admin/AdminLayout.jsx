import { useState } from 'react';
import { Box, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, useMediaQuery, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Products', icon: <ShoppingBagIcon />, path: '/admin/products' },
  { label: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
  { label: 'Orders', icon: <LocalShippingIcon />, path: '/admin/orders' },
];

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPath = location.pathname;
  const currentTab = menuItems.findIndex(item => item.path === currentPath);
  const activeIndex = currentTab >= 0 ? currentTab : 0;

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
          <Typography variant="h6" color="white" fontWeight={700}>J</Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>JJAZ</Typography>
          <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems.map((item, index) => (
          <ListItem button key={item.path} onClick={() => handleNavigation(item.path)} sx={{ borderRadius: 2, mb: 0.5, py: 1.5, bgcolor: activeIndex === index ? 'rgba(34,197,94,0.1)' : 'transparent', borderLeft: activeIndex === index ? '3px solid #22c55e' : '3px solid transparent', '&:hover': { bgcolor: 'rgba(34,197,94,0.05)' } }}>
            <ListItemIcon sx={{ color: activeIndex === index ? '#22c55e' : 'text.secondary', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeIndex === index ? 600 : 400, color: activeIndex === index ? '#22c55e' : 'text.primary' }} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, py: 1.5, color: '#dc2626', '&:hover': { bgcolor: 'rgba(220,38,38,0.05)' } }}>
          <ListItemIcon sx={{ color: '#dc2626', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {isMobile && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100, bgcolor: 'white', display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 1.5 }}><MenuIcon /></IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>JJAZ Admin</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>
            {menuItems[activeIndex]?.label}
          </Typography>
        </Box>
      )}

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 280 } }}>
        <SidebarContent />
      </Drawer>

      {!isMobile && (
        <Drawer variant="permanent" PaperProps={{ sx: { width: 280, border: 'none', bgcolor: 'white', boxShadow: '1px 0 3px rgba(0,0,0,0.05)', position: 'fixed', height: '100vh', left: 0, top: 0 } }}>
          <SidebarContent />
        </Drawer>
      )}

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        mt: isMobile ? 8 : 0,
        ml: isMobile ? 0 : '280px',
        minHeight: isMobile ? 'calc(100vh - 56px)' : '100vh'
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;