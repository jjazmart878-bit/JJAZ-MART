const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { createUser, findUserByEmail, findUserById, updateUser, updatePassword } = require('../queries/users');
const { generateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

let transporter = null;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
} catch (e) {
  console.log('SMTP not configured');
}

let brevoApi = null;
if (process.env.BREVO_API_KEY) {
  brevoApi = {
    send: (email, otp, type) => {
      return new Promise((resolve, reject) => {
        const https = require('https');
        const subject = type === 'verification' ? 'Verify Your JJAZ MART Account' : 'Your JJAZ MART Password Reset OTP';
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JJAZ MART</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 2px;">JJAZ MART</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 14px;">Your Trusted Grocery Store</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; text-align: center;">
                ${type === 'verification' ? 'Verify Your Email' : 'Reset Password'}
              </h2>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 16px; padding: 30px; text-align: center; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <p style="margin: 0; font-size: 42px; font-weight: 800; color: #22c55e; letter-spacing: 12px;">${otp}</p>
              </div>
              <p style="color: #9ca3af; font-size: 13px; text-align: center;">Expires in <strong>10 minutes</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 JJAZ MART</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
        
        // First create contact, then send email
        const createContact = () => {
          return new Promise((res, rej) => {
            const postData = JSON.stringify({ email: email, listIds: [] });
            const opts = {
              hostname: 'api.brevo.com',
              port: 443,
              path: '/v3/contacts',
              method: 'POST',
              headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', 'content-length': Buffer.byteLength(postData) }
            };
            const req = https.request(opts, (res2) => {
              let data = '';
              res2.on('data', chunk => data += chunk);
              res2.on('end', () => res(JSON.parse(data)));
            });
            req.on('error', rej);
            req.write(postData);
            req.end();
          });
        };

        const sendEmail = () => {
          return new Promise((res, rej) => {
            const postData = JSON.stringify({
              subject: subject,
              htmlContent: htmlContent,
              sender: { name: 'JJAZ MART', email: 'jjazmart878@gmail.com' },
              to: [{ email: email }]
            });
            const opts = {
              hostname: 'api.brevo.com',
              port: 443,
              path: '/v3/smtp/email',
              method: 'POST',
              headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', 'content-length': Buffer.byteLength(postData) }
            };
            const req = https.request(opts, (res2) => {
              let data = '';
              res2.on('data', chunk => data += chunk);
              res2.on('end', () => res({ status: res2.statusCode, data: data }));
            });
            req.on('error', rej);
            req.write(postData);
            req.end();
          });
        };

        (async () => {
          try {
            console.log('Creating Brevo contact...');
            await createContact();
            console.log('Contact created, sending email...');
            const result = await sendEmail();
            console.log('Brevo result:', result.status, result.data);
            if (result.status === 201 || result.status === 200) resolve(result.data);
            else {
              console.log('Brevo error, trying Gmail fallback...');
              if (transporter) {
                await transporter.sendMail({
                  from: process.env.EMAIL_FROM || '"JJAZ MART" <jjazmart878@gmail.com>',
                  to: email,
                  subject: subject,
                  html: htmlContent
                });
                resolve('sent via Gmail');
              } else {
                reject(new Error(result.data));
              }
            }
          } catch (e) {
            reject(e);
          }
        })();
      });
    }
  };
}

const sendOTPEmail = async (email, otp, type) => {
  console.log('=== sendOTPEmail ===');
  console.log('Email:', email, 'OTP:', otp, 'Type:', type);
  
  const subject = type === 'verification' ? 'Verify Your JJAZ MART Account' : 'Your JJAZ MART Password Reset OTP';
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JJAZ MART</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 2px;">JJAZ MART</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 14px;">Your Trusted Grocery Store</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; text-align: center;">
                ${type === 'verification' ? 'Verify Your Email' : 'Reset Password'}
              </h2>
              <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; text-align: center;">
                ${type === 'verification' 
                  ? 'Thank you for joining JJAZ MART! Use the code below to activate your account.' 
                  : 'We received a request to reset your password. Use the code below to proceed.'}
              </p>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 16px; padding: 30px; text-align: center; margin: 0 0 25px 0;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <p style="margin: 0; font-size: 42px; font-weight: 800; color: #22c55e; letter-spacing: 12px;">${otp}</p>
              </div>
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 25px 0;">
                <p style="color: #374151; margin: 0; font-size: 14px;">
                  <span style="font-size: 18px;">&#9201;</span><br>
                  This code expires in <strong>10 minutes</strong>
                </p>
              </div>
              <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0; line-height: 1.6;">
                If you didn't request this code, please ignore this email.<br>
                For security, don't share this code with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1f2937; padding: 25px 30px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; 2026 JJAZ MART. All rights reserved.<br>
                <span style="color: #6b7280;">Delivering freshness to your doorstep</span>
              </p>
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
    // Try Brevo API first
    if (brevoApi && process.env.BREVO_API_KEY) {
      console.log('Using Brevo API...');
      await brevoApi.send(email, otp, type);
      console.log('Brevo email sent!');
      return true;
    } 
    // Try SMTP second (Gmail 465 or Brevo 587)
    else if (transporter) {
      console.log('Using Gmail SMTP...');
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"JJAZ MART" <jjazmart878@gmail.com>',
        to: email,
        subject: subject,
        html: htmlContent
      });
      console.log('Gmail SMTP email sent!');
      return true;
    } 
    // Try Brevo SMTP as last resort
    else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('Using Brevo SMTP...');
      const brevoTransport = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await brevoTransport.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: htmlContent
      });
      console.log('Brevo SMTP email sent!');
      return true;
    } 
    // Fallback - log OTP
    else {
      console.log('NO EMAIL SERVICE - OTP:', otp);
      return true;
    }
  } catch (error) {
    console.error('Email error:', error.message);
    console.log('FALLBACK - OTP for', email, 'is:', otp);
    return true;
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