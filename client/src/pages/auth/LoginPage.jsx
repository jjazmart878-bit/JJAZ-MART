import { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Link, Paper, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const verified = sessionStorage.getItem('accountVerified');
    if (verified === 'true') {
      setShowSuccessMessage(true);
      sessionStorage.removeItem('accountVerified');
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.login(data);
      const userData = res.data.user;
      await login(data);
      toast.success('Login successful!');
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Welcome Back</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Sign in to continue</Typography>

          {showSuccessMessage && (
            <Alert severity="success" sx={{ mb: 3, bgcolor: '#f0fdf4', color: '#166534', '& .MuiAlert-icon': { color: '#22c55e' } }}>
              Your account has been verified successfully! Please login with your email and password.
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <Button onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Link component={RouterLink} to="/forgot-password" sx={{ fontSize: '0.875rem', color: '#22c55e' }}>Forgot Password?</Link>
            </Box>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">Sign Up</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;