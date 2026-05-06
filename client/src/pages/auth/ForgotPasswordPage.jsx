import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { authAPI } from '../../api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (step === 1) {
        await authAPI.forgotPassword(data);
        setEmail(data.email);
        setStep(2);
        toast.success('OTP sent to your email!');
      } else {
        await authAPI.resetPassword({ email, otp: data.otp, newPassword: data.newPassword });
        toast.success('Password reset successful!');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Reset Password</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {step === 1 ? 'Enter your email to receive OTP' : 'Enter the OTP and new password'}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 3 }}
              />
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  {...register('otp', { required: 'OTP is required' })}
                  error={!!errors.otp}
                  helperText={errors.otp?.message}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
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
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) => value === watch('newPassword') || 'Passwords do not match'
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={{ mb: 3 }}
                />
              </>
            )}
            <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
              {isLoading ? 'Processing...' : step === 1 ? 'Send OTP' : 'Reset Password'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Remember password?{' '}
            <Link component={RouterLink} to="/login">Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;