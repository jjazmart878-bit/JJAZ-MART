const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const { createUser, findUserByEmail, findUserById, updateUser, updatePassword } = require('../queries/users');
const { generateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp, type) => {
  console.log('Sending OTP to:', email, 'OTP:', otp);
  
  try {
    const subject = type === 'verification' ? 'Verify Your JJAZ MART Account' : 'Your JJAZ MART Password Reset OTP';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">JJAZ MART</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Trusted Grocery Store</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 32px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">${type === 'verification' ? 'Verify Your Email' : 'Reset Your Password'}</h2>
                    <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">
                      ${type === 'verification' ? 'Thank you for joining JJAZ MART! Use the verification code below to activate your account.' : 'We received a request to reset your password. Use the code below to proceed.'}
                    </p>
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                      <span style="font-size: 32px; font-weight: 700; color: #22c55e; letter-spacing: 8px;">${otp}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                      This code expires in <strong>10 minutes</strong>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #1f2937; padding: 24px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 JJAZ MART. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'JJAZ MART <onboarding@resend.dev>',
        to: email,
        subject: subject,
        html: htmlContent
      });
      console.log('Email sent via Resend to:', email, 'Result:', result);
      return true;
    } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      console.log('Using SMTP - Host:', process.env.EMAIL_HOST, 'User:', process.env.EMAIL_USER);
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject,
        html: htmlContent
      });
      console.log('Email sent via SMTP to:', email, 'MessageId:', info.messageId);
      return true;
    } else {
      console.log('No email service configured, logging OTP for dev:', otp);
      return true;
    }
  } catch (error) {
    console.error('Email error:', error.message);
    return false;
  }
};

router.post('/test-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore.set(email, { otp, expires: Date.now() + 600000 });
  const sent = await sendOTPEmail(email, otp, 'verification');
  res.json({ sent, otp }); // for testing
});

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, fullName, phone, sendOtp, verify, otp } = req.body;

    console.log('Register request body:', req.body);
    console.log('Parsed values - email:', email, 'type:', typeof email);

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required and must be a valid string' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (!fullName || typeof fullName !== 'string') {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone is required' });
    }

    if (sendOtp) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered. Please login instead.' });
      }

      const genOtp = generateOTP();
      otpStore.set(email, { otp: genOtp, expires: Date.now() + 600000 });
      
      const emailSent = await sendOTPEmail(email, genOtp, 'verification');
      if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
      }
      
      return res.json({ message: 'OTP sent to your email. Please check your inbox.' });
    }

    if (verify) {
      const stored = otpStore.get(email);
      if (!stored) {
        return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
      }
      if (stored.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
      }
      if (stored.expires < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
      }
      otpStore.delete(email);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, fullName, phone);
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful! Welcome to JJAZ MART.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Forgot password - email:', email);

    const user = await findUserByEmail(email);
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'Email not found in our records' });
    }

    const genOtp = generateOTP();
    const storeKey = 'reset_' + email;
    console.log('Storing OTP with key:', storeKey, 'OTP:', genOtp);
    
    otpStore.set(storeKey, { otp: genOtp, expires: Date.now() + 600000 });
    await sendOTPEmail(email, genOtp, 'reset');
    
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const otp = (req.body.otp || '').toString().trim();
    const newPassword = (req.body.newPassword || '').toString().trim();
    
    console.log('Reset password - email:', email);
    console.log('Reset password - otp:', otp);
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const storeKey = 'reset_' + email;
    const stored = otpStore.get(storeKey);
    
    console.log('Looking for key:', storeKey);
    console.log('Stored data:', stored);
    
    if (!stored) {
      return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }
    
    if (stored.expires < Date.now()) {
      otpStore.delete(storeKey);
      return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
    }
    
    otpStore.delete(storeKey);
    console.log('OTP verified, resetting password for:', email);
    
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updatePassword(user.id, passwordHash);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/profile', authenticateToken, validate(updateProfileSchema), async (req, res) => {
  try {
    const { fullName, phone, avatarUrl } = req.body;

    const user = await updateUser(req.user.id, fullName, phone, avatarUrl);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await findUserByEmail(req.user.email);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await updatePassword(req.user.id, newPasswordHash);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;