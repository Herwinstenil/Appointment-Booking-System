const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { PrismaPg } = require('@prisma/adapter-pg');
const { buildAppointmentPayload, buildStreamPayload, appointmentInclude } = require('./appointments');
const { sendAppointmentStatusNotifications } = require('../Notification/notificationService');

const router = express.Router();
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for client routes');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const VALID_APPOINTMENT_STATUSES = new Set(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);

const mapClientProfile = (user) => {
  if (!user) return null;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '';
    return {
      id: user.id,
      username: user.username,
      name: fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      company: user.company,
      position: user.position,
      bio: user.bio,
      address: user.address,
      website: user.website,
      avatarUrl: user.avatarUrl,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      twoFactorMethod: user.twoFactorMethod || 'APP',
      status: user.isActive ? 'active' : 'inactive',
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    };
};

const buildDisplayName = (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username || user.email || 'User';
};

const splitFullName = (value = '') => {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstName: null, lastName: null };
  }
  const [firstName, ...rest] = normalized.split(' ');
  return {
    firstName: firstName || null,
    lastName: rest.length ? rest.join(' ') : null
  };
};

const toSafeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'bigint') return Number(value);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toSafeInteger = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object' && value !== null && '_all' in value) {
    return toSafeInteger(value._all, fallback);
  }
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : fallback;
  if (typeof value === 'bigint') return Number(value);
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Get client dashboard stats
router.get('/dashboard/stats', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - please contact support'
      });
    }
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get client statistics
    const [
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalServices,
      activeServices,
      totalRevenue,
      recentAppointments
    ] = await Promise.all([
      // Total appointments (where client is involved)
      prisma.appointment.count({
        where: {
          clientNo
        }
      }),

      // Completed appointments
      prisma.appointment.count({
        where: {
          clientNo,
          status: 'COMPLETED'
        }
      }),

      // Pending appointments
      prisma.appointment.count({
        where: {
          clientNo,
          status: 'PENDING'
        }
      }),

      // Cancelled appointments
      prisma.appointment.count({
        where: {
          clientNo,
          status: 'CANCELLED'
        }
      }),

      // Total services offered by client
      prisma.service.count({
        where: { clientNo }
      }),

      // Active services
      prisma.service.count({
        where: {
          clientNo,
          isActive: true
        }
      }),

      // Total revenue from completed appointments
      prisma.appointment.aggregate({
        where: {
          clientNo,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),

      // Recent appointments
      prisma.appointment.count({
        where: {
          clientNo,
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;
    const serviceUtilizationRate = totalServices > 0 ? (activeServices / totalServices * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments,
          completionRate: `${completionRate}%`
        },
        services: {
          total: totalServices,
          active: activeServices,
          utilizationRate: `${serviceUtilizationRate}%`
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          period: `${periodDays} days`
        },
        recentActivity: {
          appointments: recentAppointments
        }
      }
    });

  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
});

// Get users (role USER only)
router.get('/users', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - cannot load users'
      });
    }

    const stats = await prisma.appointment.groupBy({
      by: ['userId'],
      where: {
        clientNo,
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    const statsByUserId = new Map(
      stats.map((item) => [
        item.userId,
        {
          bookingCount: item._count?.id || 0,
          totalSpent: Number(item._sum?.amount || 0)
        }
      ])
    );

    const users = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const payload = users.map((user) => {
      const userStats = statsByUserId.get(user.id) || { bookingCount: 0, totalSpent: 0 };
      return {
        id: user.id,
        name: buildDisplayName(user),
        email: user.email || '',
        role: user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        bookingCount: userStats.bookingCount,
        totalSpent: userStats.totalSpent
      };
    });

    res.json({
      success: true,
      data: {
        users: payload
      }
    });
  } catch (error) {
    console.error('Get client users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// Update user (client scope, USER role only)
router.put('/users/:userId', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, status } = req.body || {};

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let normalizedEmail;
    if (email !== undefined) {
      const trimmedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const duplicateEmail = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          id: { not: userId }
        },
        select: { id: true }
      });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use'
        });
      }

      normalizedEmail = trimmedEmail;
    }

    const parsedName = name !== undefined ? splitFullName(name) : null;
    const normalizedStatus = status !== undefined ? String(status).trim().toLowerCase() : null;
    if (normalizedStatus && !['active', 'inactive'].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: Active, Inactive'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: normalizedEmail !== undefined ? normalizedEmail : undefined,
        firstName: parsedName ? parsedName.firstName : undefined,
        lastName: parsedName ? parsedName.lastName : undefined,
        isActive: normalizedStatus ? normalizedStatus === 'active' : undefined
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    const appointmentStats = await prisma.appointment.aggregate({
      where: {
        userId,
        clientNo: req.user.clientNo
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: buildDisplayName(updatedUser),
          email: updatedUser.email || '',
          role: updatedUser.role,
          status: updatedUser.isActive ? 'Active' : 'Inactive',
          joinDate: updatedUser.createdAt,
          lastLogin: updatedUser.lastLogin,
          bookingCount: appointmentStats._count?.id || 0,
          totalSpent: Number(appointmentStats._sum?.amount || 0)
        }
      }
    });
  } catch (error) {
    console.error('Update client user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (client scope, USER role only)
router.delete('/users/:userId', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { userId } = req.params;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'USER'
      },
      select: {
        id: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.deleteMany({
        where: {
          userId
        }
      });
      await tx.activity.deleteMany({
        where: {
          userId
        }
      });
      await tx.fileUpload.deleteMany({
        where: {
          userId
        }
      });
      await tx.user.delete({
        where: { id: userId }
      });
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete client user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get client availability settings
router.get('/availability', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - cannot load availability'
      });
    }

    const row = await prisma.clientAvailability.findUnique({
      where: { clientNo },
      select: {
        availability: true,
        timeSlots: true,
        updatedAt: true
      }
    });

    return res.json({
      success: true,
      data: {
        availability: row?.availability || null,
        timeSlots: row?.timeSlots || null,
        updatedAt: row?.updatedAt || null
      }
    });
  } catch (error) {
    console.error('Get client availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get availability settings'
    });
  }
});

// Save client availability settings
router.put('/availability', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - cannot save availability'
      });
    }

    const { availability, timeSlots } = req.body || {};
    if (!availability || typeof availability !== 'object' || !Array.isArray(timeSlots)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability payload'
      });
    }

    await prisma.clientAvailability.upsert({
      where: { clientNo },
      update: {
        availability,
        timeSlots,
        updatedAt: new Date()
      },
      create: {
        clientNo,
        availability,
        timeSlots
      }
    });

    return res.json({
      success: true,
      message: 'Availability settings saved successfully'
    });
  } catch (error) {
    console.error('Save client availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save availability settings'
    });
  }
});

// Get client's services
// Get client's appointments
router.get('/appointments', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
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
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - cannot load bookings'
      });
    }

    // Build where clause with clientNo
    const where = {
      clientNo
    };

    // Additional filters
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
    console.error('Get client appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments'
    });
  }
});

// Get client revenue analytics
router.get('/revenue', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { period = '30', groupBy = 'month' } = req.query;
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - cannot build revenue report'
      });
    }
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get revenue data for client's services
    const revenueData = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${groupBy === 'month' ? 'month' : 'day'}, a."createdAt") as period,
        COUNT(a.id) as appointments,
        SUM(a."amount") as revenue
      FROM "Appointment" a
      JOIN "Service" s ON a."serviceId" = s.id
      WHERE s."clientNo" = ${clientNo}
        AND a."createdAt" >= ${startDate}
        AND a."status" = 'COMPLETED'
      GROUP BY 1
      ORDER BY period DESC
    `;

    // Get revenue by service
    const revenueByService = await prisma.$queryRaw`
      SELECT
        s."name" as service_name,
        s."category",
        COUNT(a.id) as appointments,
        SUM(a."amount") as revenue,
        AVG(a."rating") as avg_rating
      FROM "Appointment" a
      JOIN "Service" s ON a."serviceId" = s.id
      WHERE s."clientNo" = ${clientNo}
        AND a."createdAt" >= ${startDate}
        AND a."status" = 'COMPLETED'
      GROUP BY s.id, s."name", s."category"
      ORDER BY revenue DESC
    `;

    const normalizedRevenueData = (Array.isArray(revenueData) ? revenueData : []).map((row) => ({
      ...row,
      appointments: toSafeInteger(row?.appointments, 0),
      revenue: toSafeNumber(row?.revenue, 0)
    }));

    const normalizedRevenueByService = (Array.isArray(revenueByService) ? revenueByService : []).map((row) => ({
      ...row,
      appointments: toSafeInteger(row?.appointments, 0),
      revenue: toSafeNumber(row?.revenue, 0),
      avg_rating: toSafeNumber(row?.avg_rating, 0)
    }));

    // Get total stats
    const totalStats = await prisma.appointment.aggregate({
      where: {
        service: {
          clientNo
        },
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    res.json({
      success: true,
      data: {
        revenueData: normalizedRevenueData,
        revenueByService: normalizedRevenueByService,
        totalStats: {
          totalRevenue: toSafeNumber(totalStats?._sum?.amount, 0),
          totalAppointments: toSafeInteger(totalStats?._count, 0),
          period: `${periodDays} days`
        }
      }
    });

  } catch (error) {
    console.error('Get client revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue data'
    });
  }
});

// Get client profile
router.get('/profile', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const client = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: 'CLIENT',
        isActive: true
      },
        select: {
          id: true,
          username: true,
          email: true,
          mobile: true,
          firstName: true,
          lastName: true,
          company: true,
          position: true,
          bio: true,
          address: true,
          website: true,
          avatarUrl: true,
          twoFactorEnabled: true,
          twoFactorMethod: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true
        }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Active client profile not found'
      });
    }

    res.json({
      success: true,
      data: { client: mapClientProfile(client) }
    });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get client profile'
    });
  }
});

// Update client profile
router.put('/profile', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const client = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: 'CLIENT',
        isActive: true
      },
      select: { id: true }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Active client profile not found'
      });
    }

    const {
      email,
      firstName,
      lastName,
      company,
      position,
      website,
      address,
      bio,
      mobile,
      avatarUrl
    } = req.body;

    let normalizedEmail;
    if (email !== undefined) {
      const trimmedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          id: { not: req.user.id }
        },
        select: { id: true }
      });

      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use'
        });
      }

      normalizedEmail = trimmedEmail;
    }

    const updates = Object.fromEntries(
      Object.entries({
        email: normalizedEmail,
        firstName,
        lastName,
        company,
        position,
        website,
        address,
        bio,
        mobile,
        avatarUrl
      }).filter(([, value]) => value !== undefined)
    );

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: 'No profile fields provided'
      });
    }

    const updatedClient = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
        select: {
          id: true,
          username: true,
          email: true,
          mobile: true,
          firstName: true,
          lastName: true,
          company: true,
          position: true,
          bio: true,
          address: true,
          website: true,
          avatarUrl: true,
          twoFactorEnabled: true,
          twoFactorMethod: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true
        }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { client: mapClientProfile(updatedClient) }
    });
  } catch (error) {
    console.error('Update client profile error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email is already in use'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Update appointment status (for client's own appointments)
router.put('/appointments/:appointmentId/status', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing - cannot update appointment status'
      });
    }

    const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : '';

    if (!normalizedStatus || !VALID_APPOINTMENT_STATUSES.has(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: PENDING, CONFIRMED, COMPLETED, CANCELLED'
      });
    }

    // Find appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if client owns this service
    if (!appointment.service || appointment.service.clientNo !== clientNo) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: normalizedStatus },
      include: appointmentInclude
    });
    if (['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(normalizedStatus)) {
      await sendAppointmentStatusNotifications(updatedAppointment, normalizedStatus);
    }
    const appointmentPayload = buildAppointmentPayload(updatedAppointment);

    const publisher = req.app.get('appointmentPublisher');
    if (publisher) {
      publisher.emit('appointment:event', buildStreamPayload('appointment:status-updated', appointmentPayload));
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment: appointmentPayload }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status'
    });
  }
});

module.exports = router;
