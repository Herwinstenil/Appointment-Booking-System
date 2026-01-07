require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');

const app = express();

// Prisma 7.x: Use adapter for database connection
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Appointment Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    res.json({
      success: true,
      message: 'Database connection successful',
      version: result[0].version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection with Prisma 7
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query to verify connection
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log(`📊 Database version: ${result[0].version}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🧪 DB test: http://localhost:${PORT}/api/db-test`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ DATABASE_URL:', process.env.DATABASE_URL);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();