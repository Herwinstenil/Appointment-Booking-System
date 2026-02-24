const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const OTPAuth = require('otpauth');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { authenticateToken } = require('../middleware/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const router = express.Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const TWO_FACTOR_METHODS = {
  APP: 'APP',
  EMAIL_OTP: 'EMAIL_OTP'
};

const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL_HOST_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_HOST_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

let emailTransporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

const createAppToken = (user) => jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const createPendingTwoFactorToken = (user, method = TWO_FACTOR_METHODS.APP) => jwt.sign(
  { userId: user.id, role: user.role, twoFactorPending: true, twoFactorMethod: method },
  process.env.JWT_SECRET,
  { expiresIn: '10m' }
);

const getTwoFactorIssuer = () => process.env.TWO_FACTOR_ISSUER || 'Appointment Booking System';

const buildTotp = (user, secretBase32) => {
  const secret = OTPAuth.Secret.fromBase32(secretBase32);
  return new OTPAuth.TOTP({
    issuer: getTwoFactorIssuer(),
    label: user.email || user.username || user.id,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret
  });
};

const generateSixDigitCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sendTwoFactorEmailCode = async (user, code) => {
  if (!emailTransporter) {
    throw new Error('Email service is not configured for OTP delivery');
  }
  if (!user?.email) {
    throw new Error('User email is required for email OTP');
  }

  await emailTransporter.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: 'Your login verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <p>Your verification code is:</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>This code expires in 10 minutes.</p>
    `
  });
};

const buildRedirectUrl = (user, token) => {
  const minimalUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };

  return `${process.env.FRONTEND_URL}/?token=${token}&user=${encodeURIComponent(JSON.stringify(minimalUser))}`;
};

// Passport strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s/g, '').toLowerCase(),
            firstName: profile.name.givenName,
            lastName: profile.name.familyName
          }
        });
      }
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { facebookId: profile.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { facebookId: profile.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            facebookId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s/g, '').toLowerCase(),
            firstName: profile.name.givenName,
            lastName: profile.name.familyName
          }
        });
      }
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { githubId: profile.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId: profile.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            githubId: profile.id,
            email: profile.emails[0].value,
            username: profile.username,
            firstName: profile.displayName
          }
        });
      }
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register new user
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['USER', 'CLIENT', 'ADMIN']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, role = 'USER', company, mobile } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role.toUpperCase(),
        company,
        mobile,
        passwordUpdatedAt: new Date(),
        language: 'en'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        mobile: true,
        avatarUrl: true,
        language: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (user.twoFactorEnabled) {
      const twoFactorMethod = user.twoFactorMethod === TWO_FACTOR_METHODS.EMAIL_OTP
        ? TWO_FACTOR_METHODS.EMAIL_OTP
        : TWO_FACTOR_METHODS.APP;

      if (twoFactorMethod === TWO_FACTOR_METHODS.APP && !user.twoFactorSecret) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor app is not configured. Disable and set up again.'
        });
      }

      if (twoFactorMethod === TWO_FACTOR_METHODS.EMAIL_OTP) {
        const otpCode = generateSixDigitCode();
        const otpHash = await bcrypt.hash(otpCode, 8);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorOtpCodeHash: otpHash,
            twoFactorOtpExpiresAt: expiresAt
          }
        });

        await sendTwoFactorEmailCode(user, otpCode);
      }

      const tempToken = createPendingTwoFactorToken(user, twoFactorMethod);
      return res.json({
        success: true,
        message: 'Two-factor verification required',
        data: {
          requiresTwoFactor: true,
          tempToken,
          twoFactorMethod
        }
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log admin login activity
    if (user.role === 'ADMIN') {
      await prisma.activity.create({
        data: {
          type: 'ADMIN_LOGIN',
          description: `Admin ${user.firstName || user.username}${user.lastName ? ' ' + user.lastName : ''} logged in`,
          userId: user.id
        }
      });
    }

    const token = createAppToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        requiresTwoFactor: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company,
          mobile: user.mobile,
          avatarUrl: user.avatarUrl,
          language: user.language || 'en'
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
});

router.post('/login/2fa', [
  body('tempToken').isString().notEmpty().withMessage('Temporary token is required'),
  body('token').isLength({ min: 6, max: 6 }).withMessage('Invalid 2FA code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { tempToken, token: verificationToken } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Two-factor session expired. Please login again.'
      });
    }

    if (!decoded?.twoFactorPending || !decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor session'
      });
    }
    const pendingMethod = decoded.twoFactorMethod === TWO_FACTOR_METHODS.EMAIL_OTP
      ? TWO_FACTOR_METHODS.EMAIL_OTP
      : TWO_FACTOR_METHODS.APP;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user session'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled for this account'
      });
    }

    if (pendingMethod === TWO_FACTOR_METHODS.EMAIL_OTP) {
      const isMethodEnabled = user.twoFactorMethod === TWO_FACTOR_METHODS.EMAIL_OTP;
      const isExpired = !user.twoFactorOtpExpiresAt || new Date(user.twoFactorOtpExpiresAt).getTime() < Date.now();
      if (!isMethodEnabled || !user.twoFactorOtpCodeHash || isExpired) {
        return res.status(401).json({
          success: false,
          message: 'Email OTP expired. Please login again.'
        });
      }

      const isCodeValid = await bcrypt.compare(verificationToken, user.twoFactorOtpCodeHash);
      if (!isCodeValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorOtpCodeHash: null,
          twoFactorOtpExpiresAt: new Date()
        }
      });
    } else {
      if (!user.twoFactorSecret) {
        return res.status(400).json({
          success: false,
          message: 'Authenticator app is not configured'
        });
      }

      const totp = buildTotp(user, user.twoFactorSecret);
      const delta = totp.validate({ token: verificationToken, window: 1 });
      if (delta === null) {
        return res.status(401).json({
          success: false,
          message: 'Invalid verification code'
        });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    if (user.role === 'ADMIN') {
      await prisma.activity.create({
        data: {
          type: 'ADMIN_LOGIN',
          description: `Admin ${user.firstName || user.username}${user.lastName ? ' ' + user.lastName : ''} logged in`,
          userId: user.id
        }
      });
    }

    const appToken = createAppToken(user);
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company,
          mobile: user.mobile,
          avatarUrl: user.avatarUrl,
          language: user.language || 'en'
        },
        token: appToken
      }
    });
  } catch (error) {
    console.error('Two-factor login verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify two-factor code'
    });
  }
});

router.post('/2fa/setup', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const secret = new OTPAuth.Secret({ size: 20 });
    const secretBase32 = secret.base32;
    const totp = buildTotp(req.user, secretBase32);
    const otpAuthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorTempSecret: secretBase32 }
    });

    return res.json({
      success: true,
      message: 'Scan the QR code and verify to complete setup',
      data: {
        qrCodeDataUrl,
        manualEntryKey: secretBase32
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup two-factor authentication'
    });
  }
});

router.post('/2fa/verify-setup', authenticateToken, [
  body('token').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        twoFactorTempSecret: true
      }
    });

    if (!user?.twoFactorTempSecret) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor setup session not found. Please try setup again.'
      });
    }

    const totp = buildTotp(user, user.twoFactorTempSecret);
    const delta = totp.validate({ token, window: 1 });
    if (delta === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: TWO_FACTOR_METHODS.APP,
        twoFactorSecret: user.twoFactorTempSecret,
        twoFactorTempSecret: null,
        twoFactorOtpCodeHash: null,
        twoFactorOtpExpiresAt: null
      }
    });

    return res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('2FA verify setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify two-factor setup'
    });
  }
});

router.post('/2fa/enable-email', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required to enable email OTP'
      });
    }
    if (!emailTransporter) {
      return res.status(400).json({
        success: false,
        message: 'Email OTP is not configured on server'
      });
    }

    const otpCode = generateSixDigitCode();
    const otpHash = await bcrypt.hash(otpCode, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: TWO_FACTOR_METHODS.EMAIL_OTP,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
        twoFactorOtpCodeHash: otpHash,
        twoFactorOtpExpiresAt: expiresAt
      }
    });

    await sendTwoFactorEmailCode(req.user, otpCode);

    return res.json({
      success: true,
      message: 'Email OTP two-factor authentication enabled and OTP sent to your email'
    });
  } catch (error) {
    console.error('Enable email OTP 2FA error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enable email OTP two-factor authentication'
    });
  }
});

router.post('/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const expiredAt = new Date();
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
        twoFactorOtpCodeHash: null,
        twoFactorOtpExpiresAt: expiredAt
      }
    });

    return res.json({
      success: true,
      message: 'Two-factor authentication disabled'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to disable two-factor authentication'
    });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, newPassword } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist'
      });
    }

    // Check if new password is the same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'Your new password cannot be your old password'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Change password for authenticated user
router.post('/change-password', authenticateToken, [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmNewPassword').exists().withMessage('Confirm new password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        password: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active user not found'
      });
    }

    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'Your new password cannot be your old password'
        });
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Logout user (client-side token removal, optional server-side blacklist)
router.post('/logout', (req, res) => {
  // In a simple implementation, logout is handled client-side by removing the token
  // For enhanced security, you could implement token blacklisting
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token (optional, for extending session)
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Social login routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      console.error('Google authentication error:', err.message);
      if (err.data) {
        console.error('Google error payload:', err.data);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/user/login`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/user/login`);
    }

    try {
      const token = createAppToken(user);
      res.redirect(buildRedirectUrl(user, token));
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  })(req, res, next);
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { session: false }, async (err, user) => {
    if (err) {
      console.error('Facebook authentication error:', err.message);
      if (err.data) {
        console.error('Facebook error payload:', err.data);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/user/login`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/user/login`);
    }

    try {
      const token = createAppToken(user);
      res.redirect(buildRedirectUrl(user, token));
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  })(req, res, next);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, async (err, user) => {
    if (err) {
      console.error('GitHub authentication error:', err.message);
      if (err.data) {
        console.error('GitHub error payload:', err.data);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/user/login`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/user/login`);
    }

    try {
      const token = createAppToken(user);
      res.redirect(buildRedirectUrl(user, token));
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  })(req, res, next);
});

module.exports = router;
