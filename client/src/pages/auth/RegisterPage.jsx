import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Link, Paper, InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    if (step === 1) {
      setFormData(data);
      try {
        await registerUser({ ...data, sendOtp: true });
        toast.success('OTP sent to your email!');
        setStep(2);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to send OTP');
      }
    } else {
      try {
        await registerUser({ ...formData, otp: data.otp, verify: true });
        toast.success('Registration successful!');
        navigate('/');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Verification failed');
      }
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>{step === 1 ? 'Create Account' : 'Verify Email'}</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>{step === 1 ? 'Join JJAZ MALL today' : `Enter the OTP sent to ${formData.email}`}</Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('fullName', { required: 'Full name is required' })}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  sx={{ mb: 2 }}
                />
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
                  label="Phone Number"
                  {...register('phone', { required: 'Phone number is required', minLength: { value: 10, message: 'Phone must be at least 10 digits' } })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === watch('password') || 'Passwords do not match'
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
                  {isLoading ? 'Sending OTP...' : 'Create Account'}
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'Enter 6-digit OTP' } })}
                  error={!!errors.otp}
                  helperText={errors.otp?.message}
                  sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>
                <Button variant="text" fullWidth sx={{ mt: 2 }} onClick={() => setStep(1)}>
                  Back
                </Button>
              </>
            )}
            </form>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">Sign In</Link>
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  };

  export default RegisterPage;