const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, findUserById, updateUser, updatePassword } = require('../queries/users');
const { generateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, type) => {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'jjazmall@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });

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

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"JJAZ MART" <noreply@jjazmart.com>',
      to: email,
      subject: subject,
      html: htmlContent
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, fullName, phone, sendOtp, verify, otp } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (sendOtp) {
      const genOtp = generateOTP();
      otpStore.set(email, { otp: genOtp, expires: Date.now() + 600000 });
      await sendOTPEmail(email, genOtp, 'verification');
      return res.json({ message: 'OTP sent to your email' });
    }

    if (verify) {
      const stored = otpStore.get(email);
      if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
      otpStore.delete(email);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, fullName, phone);
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
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
    res.status(500).json({ error: 'Registration failed' });
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

router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const genOtp = generateOTP();
    otpStore.set('reset_' + email, { otp: genOtp, expires: Date.now() + 600000 });
    await sendOTPEmail(email, genOtp, 'reset');
    
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const stored = otpStore.get('reset_' + email);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    otpStore.delete('reset_' + email);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updatePassword(email, passwordHash);
    
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