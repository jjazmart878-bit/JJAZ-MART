import { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Select, MenuItem, FormControl, InputLabel, Skeleton, Switch, FormControlLabel, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminProductsAPI, adminCategoriesAPI, uploadAPI } from '../../api';

const AdminProducts = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', description: '', short_description: '', specifications: '', price: '', original_price: '', quantity: '', category_id: '', images: [], is_active: true, is_featured: false });
  const [uploading, setUploading] = useState(false);
  const rowsPerPage = 10;
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({ queryKey: ['adminProducts', search], queryFn: () => adminProductsAPI.getAll({ search, limit: 100 }) });
  const { data: categoriesData } = useQuery({ queryKey: ['adminCategories'], queryFn: () => adminCategoriesAPI.getAll() });
  const products = productsData?.data?.products || productsData?.data || [];
  const categories = categoriesData?.data || [];

  const createMutation = useMutation({ mutationFn: adminProductsAPI.create, onSuccess: () => { queryClient.invalidateQueries(['adminProducts']); setDialogOpen(false); toast.success('Product created'); }, onError: (e) => toast.error(e.response?.data?.error || 'Failed') });
  const updateMutation = useMutation({ mutationFn: (d) => adminProductsAPI.update(editProduct.id, d), onSuccess: () => { queryClient.invalidateQueries(['adminProducts']); setDialogOpen(false); toast.success('Product updated'); }, onError: (e) => toast.error(e.response?.data?.error || 'Failed') });
  const deleteMutation = useMutation({ mutationFn: adminProductsAPI.delete, onSuccess: () => { queryClient.invalidateQueries(['adminProducts']); toast.success('Product deleted'); }, onError: () => toast.error('Failed') });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadAPI.uploadImage(formData);
      setForm(prev => ({ ...prev, images: [...prev.images, res.data.url] }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.title || !form.price || !form.category_id) {
      toast.error('Please fill required fields');
      return;
    }
    const data = { 
      title: form.title, 
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description || null, 
      short_description: form.short_description || null,
      specifications: form.specifications || null,
      price: Number(form.price), 
      original_price: form.original_price ? Number(form.original_price) : null,
      quantity: Number(form.quantity) || 0, 
      category_id: Number(form.category_id), 
      images: form.images?.length ? form.images : ['https://images.unsplash.com/photo-1540420773420-3366a589d3b5?w=400'],
      is_active: form.is_active,
      is_featured: form.is_featured
    };
    if (editProduct) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const openEdit = (p) => { 
    setEditProduct(p); 
    setForm({ 
      title: p.title || '', 
      slug: p.slug || '', 
      description: p.description || '', 
      short_description: p.short_description || '', 
      specifications: p.specifications || '', 
      price: p.price || '', 
      original_price: p.original_price || '', 
      quantity: p.quantity || '', 
      category_id: p.category_id || '', 
      images: p.images || [], 
      is_active: p.is_active !== false,
      is_featured: p.is_featured === true
    }); 
    setDialogOpen(true); 
  };
  const openNew = () => { 
    setEditProduct(null); 
    setForm({ title: '', slug: '', description: '', short_description: '', specifications: '', price: '', original_price: '', quantity: '', category_id: '', images: [], is_active: true, is_featured: false }); 
    setDialogOpen(true); 
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Products</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: isLoading ? 200 : 'auto' }} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}>Add Product</Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Original</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Skeleton variant="rounded" width={50} height={50} /><Skeleton width={150} /></Box></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={40} /></TableCell>
                    <TableCell><Skeleton width={70} /></TableCell>
                    <TableCell><Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}><Skeleton width={32} height={32} variant="rounded" /><Skeleton width={32} height={32} variant="rounded" /></Box></TableCell>
                  </TableRow>
                ))
              ) : products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 50, height: 50, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366a589d3b5?w=100'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <Box>
                        <Typography fontWeight={500} noWrap sx={{ maxWidth: 200 }}>{p.title}</Typography>
                        {p.is_featured && <Chip label="Featured" size="small" sx={{ ml: 1, bgcolor: '#fef3c7', color: '#d97706', fontSize: '0.7rem' }} />}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{p.category_name || '-'}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>{p.original_price ? `₹${p.original_price}` : '-'}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell><Chip label={p.is_active !== false ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: p.is_active !== false ? '#dcfce7' : '#fee2e2', color: p.is_active !== false ? '#059669' : '#dc2626' }} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={products.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value, slug: editProduct ? prev.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Slug" value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Short Description" value={form.short_description} onChange={(e) => setForm(prev => ({ ...prev, short_description: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Specifications" multiline rows={3} placeholder="Key: Value&#10;Weight: 500g&#10;Brand: JJAZ" value={form.specifications} onChange={(e) => setForm(prev => ({ ...prev, specifications: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select value={form.category_id} label="Category" onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}>
                  {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth required label="Price" type="number" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Original Price" type="number" value={form.original_price} onChange={(e) => setForm(prev => ({ ...prev, original_price: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />} label="Active" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={form.is_featured} onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))} />} label="Featured" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Product Images</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {form.images?.map((img, i) => (
                  <Box key={i} sx={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }} onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Box component="label" sx={{ width: 80, height: 80, borderRadius: 2, border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { borderColor: '#22c55e' } }}>
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  {uploading ? <Typography>Uploading...</Typography> : <ImageIcon sx={{ color: '#ccc' }} />}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{ bgcolor: '#22c55e' }}>{isSaving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;