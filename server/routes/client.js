const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:STENIL@2003@localhost:5432/appointment_booking?schema=public' });
const prisma = new PrismaClient({ adapter });

// Get client dashboard stats
router.get('/dashboard/stats', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientId = req.user.id;
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
          OR: [
            { userId: clientId },
            { clientId: clientId }
          ]
        }
      }),

      // Completed appointments
      prisma.appointment.count({
        where: {
          OR: [
            { userId: clientId },
            { clientId: clientId }
          ],
          status: 'COMPLETED'
        }
      }),

      // Pending appointments
      prisma.appointment.count({
        where: {
          OR: [
            { userId: clientId },
            { clientId: clientId }
          ],
          status: 'PENDING'
        }
      }),

      // Cancelled appointments
      prisma.appointment.count({
        where: {
          OR: [
            { userId: clientId },
            { clientId: clientId }
          ],
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
          OR: [
            { userId: clientId },
            { clientId: clientId }
          ],
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),

      // Recent appointments
      prisma.appointment.count({
        where: {
          OR: [
            { userId: clientId },
            { clientId: clientId }
          ],
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

    // Build where clause - client can see appointments where they are the client or the service provider
    const where = {
      OR: [
        { userId: req.user.id },
        { clientId: req.user.id }
      ]
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
      GROUP BY DATE_TRUNC(${groupBy === 'month' ? 'month' : 'day'}, a."createdAt")
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
        revenueData,
        revenueByService,
        totalStats: {
          totalRevenue: totalStats._sum.amount || 0,
          totalAppointments: totalStats._count,
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

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
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
    if (appointment.service.clientNo !== clientNo) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
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

module.exports = router;
