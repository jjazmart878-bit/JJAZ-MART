import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, InputAdornment, CircularProgress, Link } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { authAPI } from '../../api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    if (step === 1) {
      setFormData({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });
      setSendingOtp(true);
      try {
        const response = await authAPI.register({ 
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          sendOtp: true 
        });
        toast.success(response.data.message || 'OTP sent to your email!');
        setStep(2);
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to send OTP. Please try again.';
        toast.error(errorMsg);
        console.error('OTP Send Error:', error.response?.data);
      } finally {
        setSendingOtp(false);
      }
    } else {
      try {
        const response = await authAPI.register({ 
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          otp: data.otp, 
          verify: true 
        });
        toast.success('Account verified! Please login with your credentials.');
        sessionStorage.setItem('accountVerified', 'true');
        navigate('/login');
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Verification failed. Please try again.';
        toast.error(errorMsg);
        console.error('Verification Error:', error.response?.data);
      }
    }
  };

  const resendOtp = async () => {
    if (!formData.email) {
      toast.error('Email not found. Please go back.');
      return;
    }
    setSendingOtp(true);
    try {
      const response = await authAPI.register({ 
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        sendOtp: true 
      });
      toast.success(response.data.message || 'OTP resent successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to resend OTP.';
      toast.error(errorMsg);
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#22c55e' }}>JJAZ MART</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{step === 1 ? 'Create Account' : 'Verify Email'}</Typography>
          </Box>
          
          <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {step === 1 
              ? 'Join JJAZ MALL today - Your trusted grocery store' 
              : `Enter the 6-digit OTP sent to ${formData.email}`
            }
          </Typography>

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
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Enter a valid email address' } })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phone', { required: 'Phone number is required', minLength: { value: 10, message: 'Enter 10 digit phone number' } })}
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
                        <Button onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
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
                        <Button onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  disabled={sendingOtp}
                  sx={{ 
                    bgcolor: '#22c55e', 
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#16a34a' }
                  }}
                >
                  {sendingOtp ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Sending OTP...</span>
                    </Box>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    We sent a verification code to<br />
                    <strong>{formData.email}</strong>
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  label="Enter 6-digit OTP"
                  {...register('otp', { 
                    required: 'OTP is required', 
                    minLength: { value: 6, message: 'Enter 6-digit OTP' },
                    maxLength: { value: 6, message: 'Enter 6-digit OTP' }
                  })}
                  error={!!errors.otp}
                  helperText={errors.otp?.message}
                  inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: 4, fontSize: '1.5rem' } }}
                  sx={{ mb: 2 }}
                />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  disabled={sendingOtp}
                  sx={{ 
                    bgcolor: '#22c55e', 
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#16a34a' }
                  }}
                >
                  {sendingOtp ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Verifying...</span>
                    </Box>
                  ) : (
                    'Verify & Create Account'
                  )}
                </Button>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button variant="text" onClick={() => setStep(1)} sx={{ color: 'text.secondary' }}>
                    Back
                  </Button>
                  <Button variant="text" onClick={resendOtp} disabled={sendingOtp} sx={{ color: '#22c55e' }}>
                    Resend OTP
                  </Button>
                </Box>
              </>
            )}
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" sx={{ color: '#22c55e', fontWeight: 600 }}>
              Sign In
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;