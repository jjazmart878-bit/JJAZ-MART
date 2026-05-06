import { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Skeleton, Chip, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminCategoriesAPI, uploadAPI } from '../../api';

const categoryIcons = [
  '🥬', '🍚', '🫗', '🌶️', '🥛', '🍪', '🥤', '🧹',
  '🍎', '🥩', '🐟', '🍞', '🧈', '🧂', '🍯', '🫙'
];

const AdminCategories = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', icon: '' });
  const [uploading, setUploading] = useState(false);
  const rowsPerPage = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['adminCategories'], queryFn: adminCategoriesAPI.getAll });
  const categories = data?.data || [];

  const createMutation = useMutation({ 
    mutationFn: adminCategoriesAPI.create, 
    onSuccess: () => { queryClient.invalidateQueries(['adminCategories']); setDialogOpen(false); toast.success('Category created'); }, 
    onError: () => toast.error('Failed to create category') 
  });
  
  const updateMutation = useMutation({ 
    mutationFn: (d) => adminCategoriesAPI.update(editCategory.id, d), 
    onSuccess: () => { queryClient.invalidateQueries(['adminCategories']); setDialogOpen(false); toast.success('Category updated'); }, 
    onError: () => toast.error('Failed to update category') 
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: adminCategoriesAPI.delete, 
    onSuccess: () => { queryClient.invalidateQueries(['adminCategories']); toast.success('Category deleted'); }, 
    onError: () => toast.error('Failed to delete category') 
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadAPI.uploadImage(formData);
      const url = res.data.url;
      setForm({ ...form, image_url: url });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const data = { 
      name: form.name, 
      slug: form.slug, 
      description: form.description || null, 
      image_url: form.image_url || null, 
      parentId: null, 
      icon: form.icon || null 
    };
    if (editCategory) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const openEdit = (c) => { 
    setEditCategory(c); 
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image_url: c.image_url || '', icon: c.icon || '' }); 
    setDialogOpen(true); 
  };
  
  const openNew = () => { 
    setEditCategory(null); 
    setForm({ name: '', slug: '', description: '', image_url: '', icon: '' }); 
    setDialogOpen(true); 
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Categories</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}>Add Category</Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell>Icon/Image</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Products</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="circular" width={48} height={48} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={50} /></TableCell>
                    <TableCell><Skeleton width={64} /></TableCell>
                  </TableRow>
                ))
              ) : categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Avatar src={c.image_url} sx={{ bgcolor: '#22c55e', width: 48, height: 48 }}>
                      {c.icon || c.name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell fontWeight={500}>{c.name}</TableCell>
                  <TableCell><Chip label={c.slug} size="small" sx={{ bgcolor: '#f1f5f9' }} /></TableCell>
                  <TableCell>{c.product_count || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={categories.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Category Image</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: 2, border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', bgcolor: '#f8fafc' }}>
                  {form.image_url ? <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon sx={{ color: '#ccc' }} />}
                </Box>
                <Button variant="outlined" component="label" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Or Choose Icon</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categoryIcons.map((icon) => (
                  <Box key={icon} onClick={() => setForm({ ...form, icon, image_url: '' })} sx={{ width: 40, height: 40, borderRadius: 1, border: form.icon === icon ? '2px solid #22c55e' : '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', '&:hover': { borderColor: '#22c55e' } }}>
                    {icon}
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Name" value={form.name} onChange={(e) => {
                  const newName = e.target.value;
                  setForm(prev => ({ ...prev, name: newName, slug: editCategory ? prev.slug : newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
                }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Slug" value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
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

export default AdminCategories;