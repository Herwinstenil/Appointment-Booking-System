const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get client dashboard stats
router.get('/dashboard/stats', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientId = req.user.id;
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
        where: { userId: clientId }
      }),

      // Active services
      prisma.service.count({
        where: {
          userId: clientId,
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
router.get('/services', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
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
    const where = {
      userId: req.user.id
    };

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
    console.error('Get client services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services'
    });
  }
});

// Create new service
router.post('/services', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      duration
    } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required'
      });
    }

    if (parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Check if service name already exists for this client
    const existingService = await prisma.service.findFirst({
      where: {
        userId: req.user.id,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: 'Service with this name already exists'
      });
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        duration: duration || '1 hour',
        isActive: true,
        rating: 0
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
router.put('/services/:serviceId', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      name,
      description,
      price,
      category,
      duration,
      isActive
    } = req.body;

    // Check if service exists and belongs to client
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: req.user.id
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Validation
    if (price !== undefined && parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Check name uniqueness if name is being changed
    if (name && name !== service.name) {
      const existingService = await prisma.service.findFirst({
        where: {
          userId: req.user.id,
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
          message: 'Service with this name already exists'
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
router.delete('/services/:serviceId', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if service exists and belongs to client
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: req.user.id
      }
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
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get revenue data for client's services
    const revenueData = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${groupBy === 'month' ? 'month' : 'day'}, a."createdAt") as period,
        COUNT(a.id) as appointments,
        SUM(a.amount) as revenue
      FROM appointments a
      JOIN services s ON a."serviceId" = s.id
      WHERE s."userId" = ${req.user.id}
        AND a."createdAt" >= ${startDate}
        AND a.status = 'COMPLETED'
      GROUP BY DATE_TRUNC(${groupBy === 'month' ? 'month' : 'day'}, a."createdAt")
      ORDER BY period DESC
    `;

    // Get revenue by service
    const revenueByService = await prisma.$queryRaw`
      SELECT
        s.name as service_name,
        s.category,
        COUNT(a.id) as appointments,
        SUM(a.amount) as revenue,
        AVG(a.rating) as avg_rating
      FROM appointments a
      JOIN services s ON a."serviceId" = s.id
      WHERE s."userId" = ${req.user.id}
        AND a."createdAt" >= ${startDate}
        AND a.status = 'COMPLETED'
      GROUP BY s.id, s.name, s.category
      ORDER BY revenue DESC
    `;

    // Get total stats
    const totalStats = await prisma.appointment.aggregate({
      where: {
        service: {
          userId: req.user.id
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
    if (appointment.service.userId !== req.user.id) {
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
