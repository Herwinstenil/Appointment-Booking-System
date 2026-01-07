const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const router = express.Router();
const prisma = new PrismaClient();

// Get admin dashboard stats
router.get('/dashboard/stats', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get system statistics
    const [
      totalUsers,
      totalClients,
      totalServices,
      activeServices,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalRevenue,
      recentUsers,
      recentAppointments
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total clients
      prisma.user.count({
        where: { role: 'CLIENT' }
      }),

      // Total services
      prisma.service.count(),

      // Active services
      prisma.service.count({
        where: { isActive: true }
      }),

      // Total appointments
      prisma.appointment.count(),

      // Completed appointments
      prisma.appointment.count({
        where: { status: 'COMPLETED' }
      }),

      // Pending appointments
      prisma.appointment.count({
        where: { status: 'PENDING' }
      }),

      // Cancelled appointments
      prisma.appointment.count({
        where: { status: 'CANCELLED' }
      }),

      // Total revenue
      prisma.appointment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),

      // Recent users
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Recent appointments
      prisma.appointment.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ]);

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;
    const serviceUtilizationRate = totalServices > 0 ? (activeServices / totalServices * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          clients: totalClients,
          recent: recentUsers
        },
        services: {
          total: totalServices,
          active: activeServices,
          utilizationRate: `${serviceUtilizationRate}%`
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments,
          completionRate: `${completionRate}%`,
          recent: recentAppointments
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          period: `${periodDays} days`
        }
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
});

// Get revenue by category
router.get('/dashboard/revenue-by-category', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get revenue grouped by service category
    const revenueByCategory = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get service details for each category
    const categoryData = await Promise.all(
      revenueByCategory.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
          select: { category: true, name: true }
        });

        return {
          category: service?.category || 'Other',
          amount: item._sum.amount || 0,
          bookings: item._count.id,
          serviceName: service?.name || 'Unknown'
        };
      })
    );

    // Group by category
    const groupedByCategory = categoryData.reduce((acc, item) => {
      const existing = acc.find(cat => cat.category === item.category);
      if (existing) {
        existing.amount += item.amount;
        existing.bookings += item.bookings;
      } else {
        acc.push({
          category: item.category,
          amount: item.amount,
          bookings: item.bookings
        });
      }
      return acc;
    }, []);

    // Calculate percentages and growth
    const totalRevenue = groupedByCategory.reduce((sum, cat) => sum + cat.amount, 0);
    const result = groupedByCategory.map(cat => ({
      category: cat.category,
      amount: cat.amount,
      percentage: totalRevenue > 0 ? ((cat.amount / totalRevenue) * 100).toFixed(1) : 0,
      growth: Math.floor(Math.random() * 30) - 10, // Mock growth for now
      color: getCategoryColor(cat.category),
      bookings: cat.bookings
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get revenue by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue by category'
    });
  }
});

// Get recent transactions
router.get('/dashboard/recent-transactions', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const transactions = await prisma.appointment.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        service: {
          select: { name: true, category: true }
        },
        client: {
          select: { firstName: true, lastName: true, company: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    const result = transactions.map(transaction => ({
      id: transaction.id,
      client: `${transaction.client.firstName} ${transaction.client.lastName}`,
      service: transaction.service.name,
      amount: transaction.amount,
      date: transaction.createdAt.toISOString().split('T')[0],
      status: 'completed',
      avatar: `${transaction.client.firstName[0]}${transaction.client.lastName[0]}`.toUpperCase()
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent transactions'
    });
  }
});

// Get performance metrics
router.get('/dashboard/performance-metrics', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Calculate conversion rate (completed / total appointments)
    const [totalAppointments, completedAppointments] = await Promise.all([
      prisma.appointment.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      })
    ]);

    const conversionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0;

    // Calculate average session duration (mock for now)
    const avgSessionDuration = '4m 12s';

    // Calculate bounce rate (cancelled / total)
    const cancelledAppointments = await prisma.appointment.count({
      where: {
        status: 'CANCELLED',
        createdAt: { gte: startDate }
      }
    });

    const bounceRate = totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0;

    // Calculate customer satisfaction (mock for now)
    const customerSatisfaction = '4.8';

    const result = [
      {
        name: 'Conversion Rate',
        value: `${conversionRate}%`,
        change: `+${(Math.random() * 2).toFixed(1)}%`,
        positive: true
      },
      {
        name: 'Avg Session Duration',
        value: avgSessionDuration,
        change: `+${Math.floor(Math.random() * 30)}s`,
        positive: true
      },
      {
        name: 'Bounce Rate',
        value: `${bounceRate}%`,
        change: `-${(Math.random() * 5).toFixed(1)}%`,
        positive: true
      },
      {
        name: 'Customer Satisfaction',
        value: `${customerSatisfaction}/5`,
        change: `+${(Math.random() * 0.5).toFixed(1)}`,
        positive: true
      }
    ];

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics'
    });
  }
});

// Get popular services
router.get('/dashboard/popular-services', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const popularServices = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    // Get service details
    const result = await Promise.all(
      popularServices.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
          select: { name: true, category: true }
        });

        return {
          service: service?.name || 'Unknown Service',
          bookings: item._count.id,
          revenue: item._sum.amount || 0
        };
      })
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get popular services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular services'
    });
  }
});

// Get recent activities
router.get('/dashboard/recent-activities', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      include: {
        service: { select: { name: true } },
        client: { select: { firstName: true, lastName: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 5),
      select: { id: true, firstName: true, lastName: true, createdAt: true, role: true }
    });

    // Combine and format activities
    const activities = [];

    // Add appointment activities
    recentAppointments.forEach(appointment => {
      if (appointment.service) {
        activities.push({
          id: `appointment-${appointment.id}`,
          action: `${appointment.status.toLowerCase()} appointment for ${appointment.service.name}`,
          time: formatTimeAgo(appointment.createdAt),
          status: appointment.status.toLowerCase(),
          icon: getActivityIcon(appointment.status),
          createdAt: appointment.createdAt // Keep raw date for sorting
        });
      }
    });

    // Add user activities
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        action: `New ${user.role.toLowerCase()} registered: ${user.firstName} ${user.lastName}`,
        time: formatTimeAgo(user.createdAt),
        status: 'created',
        icon: 'CheckCircle',
        createdAt: user.createdAt // Keep raw date for sorting
      });
    });

    // Sort by createdAt date and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const result = activities.slice(0, limit);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activities'
    });
  }
});

// Helper function to get category color
function getCategoryColor(category) {
  const colors = {
    'Premium Services': 'bg-rose-500',
    'Consultation': 'bg-blue-500',
    'Basic Services': 'bg-green-500',
    'Add-ons': 'bg-purple-500',
    'Web Development': 'bg-indigo-500',
    'Mobile App Development': 'bg-cyan-500',
    'UI/UX Design': 'bg-pink-500',
    'Digital Marketing': 'bg-yellow-500'
  };
  return colors[category] || 'bg-gray-500';
}

// Helper function to get activity icon
function getActivityIcon(status) {
  const icons = {
    'completed': 'CheckCircle',
    'pending': 'Clock',
    'cancelled': 'XCircle',
    'confirmed': 'CheckCircle',
    'created': 'CheckCircle'
  };
  return icons[status] || 'CheckCircle';
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
}

// Get all users with filtering
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (role) {
      where.role = role.toUpperCase();
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          company: true,
          mobile: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              services: true,
              appointmentsAsUser: true,
              appointmentsAsClient: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// Create new user (admin only)
router.post('/users', authenticateToken, authorizeRoles('ADMIN'), [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['USER', 'CLIENT', 'ADMIN']).withMessage('Invalid role')
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

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      company,
      mobile
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
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
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        role: role.toUpperCase(),
        company: company?.trim(),
        mobile: mobile?.trim()
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
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user
router.put('/users/:userId', authenticateToken, authorizeRoles('ADMIN'), [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
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

    const { userId } = req.params;
    const {
      username,
      email,
      firstName,
      lastName,
      role,
      company,
      mobile,
      password
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check uniqueness if username or email is being changed
    if (username && username !== existingUser.username) {
      const userWithUsername = await prisma.user.findUnique({
        where: { username: username.toLowerCase() }
      });
      if (userWithUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    if (email && email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (userWithEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username ? username.toLowerCase() : undefined,
        email: email ? email.toLowerCase() : undefined,
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined,
        role: role ? role.toUpperCase() : undefined,
        company: company?.trim() || undefined,
        mobile: mobile?.trim() || undefined,
        password: hashedPassword || undefined
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
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:userId', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get all services
router.get('/services', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (status !== undefined) {
      where.isActive = status === 'active';
    }

    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get services with pagination
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              company: true
            }
          },
          _count: {
            select: {
              appointments: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.service.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services'
    });
  }
});

// Create service
router.post('/services', authenticateToken, authorizeRoles('ADMIN'), [
  body('name').isLength({ min: 1 }).withMessage('Service name is required'),
  body('description').optional(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isLength({ min: 1 }).withMessage('Category is required'),
  body('userId').isLength({ min: 1 }).withMessage('User ID is required')
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

    const {
      name,
      description,
      price,
      category,
      duration,
      userId
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if service name already exists for this user
    const existingService = await prisma.service.findFirst({
      where: {
        userId: userId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: 'Service with this name already exists for this user'
      });
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: parseFloat(price),
        category: category.trim(),
        duration: duration || '1 hour',
        userId: userId,
        isActive: true,
        rating: 0
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
});

// Update service
router.put('/services/:serviceId', authenticateToken, authorizeRoles('ADMIN'), [
  body('name').optional().isLength({ min: 1 }).withMessage('Service name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isLength({ min: 1 }).withMessage('Category cannot be empty')
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

    const { serviceId } = req.params;
    const {
      name,
      description,
      price,
      category,
      duration,
      isActive
    } = req.body;

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check name uniqueness if name is being changed
    if (name && name !== service.name) {
      const existingService = await prisma.service.findFirst({
        where: {
          userId: service.userId,
          name: {
            equals: name,
            mode: 'insensitive'
          },
          id: {
            not: serviceId
          }
        }
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          message: 'Service with this name already exists for this user'
        });
      }
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: name ? name.trim() : undefined,
        description: description ? description.trim() : undefined,
        price: price ? parseFloat(price) : undefined,
        category: category ? category.trim() : undefined,
        duration: duration || undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
});

// Delete service
router.delete('/services/:serviceId', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if service has active appointments
    const activeAppointments = await prisma.appointment.count({
      where: {
        serviceId: serviceId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active appointments'
      });
    }

    // Delete service
    await prisma.service.delete({
      where: { id: serviceId }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
});

// Get all appointments
router.get('/appointments', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (dateFrom) {
      where.date = {
        ...where.date,
        gte: new Date(dateFrom)
      };
    }

    if (dateTo) {
      where.date = {
        ...where.date,
        lte: new Date(dateTo)
      };
    }

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
              duration: true
            }
          },
          client: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              company: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments'
    });
  }
});

// Update appointment status (admin)
router.put('/appointments/:appointmentId/status', authenticateToken, authorizeRoles('ADMIN'), [
  body('status').isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status')
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

    const { appointmentId } = req.params;
    const { status } = req.body;

    // Find appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status.toUpperCase() },
      include: {
        service: {
          select: {
            id: true,
            name: true
          }
        },
        client: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment: updatedAppointment }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status'
    });
  }
});

// Delete appointment (admin)
router.delete('/appointments/:appointmentId', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id: appointmentId }
    });

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment'
    });
  }
});

module.exports = router;