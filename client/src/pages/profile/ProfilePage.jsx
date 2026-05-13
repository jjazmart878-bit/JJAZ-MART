import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Radio, Divider, Collapse, Card, CardContent, Chip, useMediaQuery, useTheme, Drawer, List, ListItem, ListItemIcon, ListItemText, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { authAPI, addressesAPI, ordersAPI } from '../../api';

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, logout, updateUser } = useAuthStore();
  const [tab, setTab] = useState(searchParams.get('tab') === 'orders' ? 1 : searchParams.get('tab') === 'addresses' ? 2 : 0);
  const [editAddress, setEditAddress] = useState(null);
  const [addressDialog, setAddressDialog] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: '', fullAddress: '', city: '', state: '', pincode: '', isDefault: false });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });

  const { data: addressesData } = useQuery({ queryKey: ['addresses'], queryFn: () => addressesAPI.getAll() });
  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: () => ordersAPI.getAll() });

  const createAddress = useMutation({
    mutationFn: addressesAPI.create,
    onSuccess: () => { queryClient.invalidateQueries(['addresses']); setAddressDialog(false); toast.success('Address added'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to add address'),
  });

  const updateAddress = useMutation({
    mutationFn: ({ id, data }) => addressesAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['addresses']); setAddressDialog(false); setEditAddress(null); toast.success('Address updated'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update address'),
  });

  const deleteAddress = useMutation({
    mutationFn: addressesAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries(['addresses']); toast.success('Address deleted'); },
  });

  const updatePassword = useMutation({
    mutationFn: authAPI.updatePassword,
    onSuccess: () => { setPasswordDialog(false); setPasswordForm({ current: '', new: '', confirm: '' }); toast.success('Password updated'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update password'),
  });

  const updateProfile = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => { 
      queryClient.invalidateQueries(['user']); 
      updateUser({ fullName: data.data.user.fullName, phone: data.data.user.phone });
      setProfileDialog(false); 
      toast.success('Profile updated'); 
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update profile'),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSavingProfile = updateProfile.isPending;
  const isChangingPassword = updatePassword.isPending;

  const addresses = addressesData?.data || [];
  const orders = ordersData?.data || [];

  const menuItems = [
    { label: 'My Orders', icon: <LocalShippingIcon />, value: 1 },
    { label: 'Addresses', icon: <LocationOnIcon />, value: 2 },
    { label: 'Wishlist', icon: <FavoriteIcon />, value: -1, action: () => navigate('/wishlist') },
  ];

  const bottomMenuItems = [
    { label: 'View Profile', icon: <PersonIcon />, value: 0, action: () => { setProfileDialog(true); setProfileForm({ fullName: user?.fullName || '', phone: user?.phone || '' }); } },
    { label: 'Change Password', icon: <LockIcon />, action: () => setPasswordDialog(true) },
    { label: 'Logout', icon: <LogoutIcon />, action: handleLogout, color: '#dc2626' },
  ];

  const handleSaveAddress = () => {
    if (editAddress) updateAddress.mutate({ id: editAddress.id, data: addressForm });
    else createAddress.mutate(addressForm);
  };

  const openEditAddress = (addr) => {
    setEditAddress(addr);
    setAddressForm({ label: addr.label, fullAddress: addr.full_address, city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.is_default });
    setAddressDialog(true);
  };

  return (
    <Box sx={{ bgcolor: '#f0f4f8', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, display: { xs: 'block', md: 'none' } }}>My Account</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            {isMobile && (
              <Button fullWidth startIcon={<MenuIcon />} onClick={() => setMobileDrawer(true)} sx={{ mb: 2, justifyContent: 'flex-start', bgcolor: 'white', py: 1.5, borderRadius: 2 }}>
                Menu
              </Button>
            )}

            <Drawer anchor="left" open={mobileDrawer} onClose={() => setMobileDrawer(false)} PaperProps={{ sx: { width: '70%', maxWidth: 300 } }}>
              <Box sx={{ p: 2, bgcolor: '#22c55e' }}>
                <IconButton onClick={() => setMobileDrawer(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color="#22c55e" fontWeight={700}>{user?.fullName?.charAt(0) || 'U'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" color="white" fontWeight={600}>{user?.fullName || 'User'}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</Typography>
                  </Box>
                </Box>
              </Box>
              <List>
                {menuItems.map((item) => (
                  <ListItem key={item.value} button onClick={() => { setTab(item.value); setMobileDrawer(false); }} selected={tab === item.value} sx={{ '&.Mui-selected': { bgcolor: 'rgba(34,197,94,0.1)', borderLeft: '3px solid #22c55e' } }}>
                    <ListItemIcon sx={{ color: tab === item.value ? '#22c55e' : 'text.secondary' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: tab === item.value ? 600 : 400 }} />
                  </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem button onClick={() => { setPasswordDialog(true); setMobileDrawer(false); }}>
                  <ListItemIcon><LockIcon /></ListItemIcon>
                  <ListItemText primary="Change Password" />
                </ListItem>
                <ListItem button onClick={() => { handleLogout(); setMobileDrawer(false); }} sx={{ color: '#dc2626' }}>
                  <ListItemIcon><LogoutIcon sx={{ color: '#dc2626' }} /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Drawer>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ p: 2, bgcolor: '#22c55e' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" color="#22c55e" fontWeight={700}>{user?.fullName?.charAt(0) || 'U'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="white" fontWeight={600}>{user?.fullName || 'User'}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</Typography>
                  </Box>
                </Box>
              </Box>
              {menuItems.map((item) => (
                <Box key={item.value} onClick={() => item.action ? item.action() : setTab(item.value)} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer', bgcolor: tab === item.value ? 'grey.100' : 'transparent', borderLeft: tab === item.value ? '3px solid #22c55e' : '3px solid transparent', '&:hover': { bgcolor: 'grey.50' } }}>
                  <Box sx={{ color: item.action ? '#22c55e' : (tab === item.value ? '#22c55e' : 'text.secondary') }}>{item.icon}</Box>
                  <Typography fontWeight={tab === item.value || item.action ? 600 : 400}>{item.label}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              {bottomMenuItems.map((item) => (
                <Box key={item.label} onClick={item.action} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer', color: item.color || 'text.secondary', '&:hover': { bgcolor: 'grey.50' } }}>
                  <Box>{item.icon}</Box>
                  <Typography fontWeight={400}>{item.label}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper sx={{ borderRadius: 3, p: { xs: 2, md: 4 } }}>
              {tab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight={600}>Profile Details</Typography>
                    <Button startIcon={<EditIcon />} onClick={() => { setProfileDialog(true); setProfileForm({ fullName: user?.fullName || '', phone: user?.phone || '' }); }} sx={{ borderColor: '#22c55e', color: '#22c55e' }} variant="outlined">Edit</Button>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name" defaultValue={user?.fullName} disabled InputProps={{ sx: { bgcolor: 'grey.50' } }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Email" defaultValue={user?.email} disabled InputProps={{ sx: { bgcolor: 'grey.50' } }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" defaultValue={user?.phone || ''} disabled InputProps={{ sx: { bgcolor: 'grey.50' } }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Role" defaultValue={user?.role} disabled InputProps={{ sx: { bgcolor: 'grey.50' } }} /></Grid>
                  </Grid>
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>My Orders</Typography>
                  <Button variant="contained" fullWidth onClick={() => navigate('/my-orders')} sx={{ bgcolor: '#22c55e', py: 3 }}>
                    <LocalShippingIcon sx={{ mr: 1 }} /> View All Orders
                  </Button>
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight={600}>My Addresses</Typography>
                    <Button startIcon={<AddIcon />} onClick={() => { setEditAddress(null); setAddressForm({ label: '', fullAddress: '', city: '', state: '', pincode: '', isDefault: addresses.length === 0 }); setAddressDialog(true); }} variant="outlined" sx={{ borderColor: '#22c55e', color: '#22c55e' }}>Add</Button>
                  </Box>
                  {addresses.length === 0 ? (
                    <Typography color="text.secondary">No addresses added</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {addresses.map((addr) => (
                        <Grid item xs={12} sm={6} key={addr.id}>
                          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', height: '100%', border: addr.is_default ? '2px solid #22c55e' : '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography fontWeight={600}>{addr.label}</Typography>
                              {addr.is_default && <Chip label="Default" size="small" sx={{ bgcolor: '#22c55e', color: 'white', fontSize: '0.7rem' }} />}
                            </Box>
                            <Typography variant="body2" color="text.secondary">{addr.full_address}</Typography>
                            <Typography variant="body2" color="text.secondary">{addr.city}, {addr.state} - {addr.pincode}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <IconButton size="small" onClick={() => openEditAddress(addr)}><EditIcon fontSize="small" /></IconButton>
                              <IconButton size="small" onClick={() => deleteAddress.mutate(addr.id)}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={addressDialog} onClose={() => setAddressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Label (e.g. Home, Office)" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} required sx={{ mt: 2, mb: 2 }} error={!addressForm.label} helperText={!addressForm.label ? 'Required' : ''} />
          <TextField fullWidth label="Full Address" value={addressForm.fullAddress} multiline rows={2} onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })} required sx={{ mb: 2 }} error={!addressForm.fullAddress} helperText={!addressForm.fullAddress ? 'Required' : ''} />
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth label="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required error={!addressForm.city} helperText={!addressForm.city ? 'Required' : ''} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required error={!addressForm.state} helperText={!addressForm.state ? 'Required' : ''} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} required error={!addressForm.pincode} helperText={!addressForm.pincode ? 'Required' : ''} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Radio checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} sx={{ color: '#22c55e', '&.Mui-checked': { color: '#22c55e' } }} />
            <Typography>Set as default address</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddressDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveAddress} 
            disabled={!addressForm.label || !addressForm.fullAddress || !addressForm.city || !addressForm.state || !addressForm.pincode || createAddress.isPending || updateAddress.isPending}
            sx={{ bgcolor: '#22c55e' }}
          >
            {createAddress.isPending || updateAddress.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Change Password</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} sx={{ mt: 2, mb: 2 }} />
          <TextField fullWidth label="New Password" type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPasswordDialog(false)} disabled={isChangingPassword}>Cancel</Button>
          <Button variant="contained" onClick={() => { if (passwordForm.new !== passwordForm.confirm) { toast.error('Passwords do not match'); return; } updatePassword.mutate({ currentPassword: passwordForm.current, newPassword: passwordForm.new }); }} disabled={isChangingPassword} sx={{ bgcolor: '#22c55e' }}>{isChangingPassword ? 'Updating...' : 'Update'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Full Name" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} sx={{ mt: 2, mb: 2 }} />
          <TextField fullWidth label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProfileDialog(false)} disabled={isSavingProfile}>Cancel</Button>
          <Button variant="contained" onClick={() => updateProfile.mutate(profileForm)} disabled={isSavingProfile} sx={{ bgcolor: '#22c55e' /* eslint-disable-line */ }}>{isSavingProfile ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;