const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      serviceId,
      clientId,
      date,
      time,
      duration,
      notes
    } = req.body;

    // Validation
    if (!serviceId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Service, date, and time are required'
      });
    }

    // Validate date format
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }

    // Check if service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Service is not available'
      });
    }

    // Determine client ID based on user role
    let finalClientId = clientId;

    if (req.user.role === 'USER') {
      // Users can only book for themselves, so client should be null or the user themselves
      finalClientId = null; // Users book directly
    } else if (req.user.role === 'CLIENT') {
      // Clients can book for themselves or specify another client
      finalClientId = clientId || req.user.id;
    } else if (req.user.role === 'ADMIN') {
      // Admins can book for any client
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required for admin bookings'
        });
      }
      finalClientId = clientId;
    }

    // Check if client exists (if specified)
    if (finalClientId) {
      const client = await prisma.user.findUnique({
        where: { id: finalClientId }
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
    }

    // Check for scheduling conflicts
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        serviceId: serviceId,
        date: appointmentDate,
        time: time,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.id,
        serviceId: serviceId,
        clientId: finalClientId,
        date: appointmentDate,
        time: time,
        duration: duration || service.duration || '1 hour',
        amount: service.price,
        status: 'PENDING',
        notes: notes || null
      },
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
            company: true
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
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

// Get appointments with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      serviceId,
      clientId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause based on user role and filters
    const where = {};

    // Role-based filtering
    if (req.user.role === 'USER') {
      // Users can only see their own appointments
      where.userId = req.user.id;
    } else if (req.user.role === 'CLIENT') {
      // Clients can see appointments where they are the client or the booker
      where.OR = [
        { userId: req.user.id },
        { clientId: req.user.id }
      ];
    }
    // Admins can see all appointments

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

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (clientId) {
      where.clientId = clientId;
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

// Get appointment by ID
router.get('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            duration: true,
            description: true
          }
        },
        client: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
            mobile: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to view this appointment
    const canView = req.user.role === 'ADMIN' ||
      appointment.userId === req.user.id ||
      appointment.clientId === req.user.id;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment'
    });
  }
});

// Update appointment
router.put('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      date,
      time,
      duration,
      notes,
      status
    } = req.body;

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

    // Check permissions
    const canUpdate = req.user.role === 'ADMIN' ||
      appointment.userId === req.user.id ||
      (req.user.role === 'CLIENT' && appointment.clientId === req.user.id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
    }

    // Validate date if provided
    if (date) {
      const appointmentDate = new Date(date);
      if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
    }

    // Check for conflicts if date/time changed
    if ((date || time) && status !== 'CANCELLED') {
      const checkDate = date ? new Date(date) : appointment.date;
      const checkTime = time || appointment.time;

      const conflict = await prisma.appointment.findFirst({
        where: {
          serviceId: appointment.serviceId,
          date: checkDate,
          time: checkTime,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          id: {
            not: appointmentId
          }
        }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Time slot is already booked'
        });
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: date ? new Date(date) : undefined,
        time: time || undefined,
        duration: duration || undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status ? status.toUpperCase() : undefined
      },
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
            company: true
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
      }
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment: updatedAppointment }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// Rate completed appointment
router.post('/:appointmentId/rate', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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

    // Check if appointment is completed
    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed appointments'
      });
    }

    // Check if user can rate this appointment
    const canRate = req.user.role === 'ADMIN' ||
      appointment.userId === req.user.id ||
      appointment.clientId === req.user.id;

    if (!canRate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this appointment'
      });
    }

    // Check if already rated
    if (appointment.rating) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already rated'
      });
    }

    // Update appointment with rating
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        rating: rating,
        comment: comment || null
      },
      include: {
        service: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update service rating (simple average)
    const serviceAppointments = await prisma.appointment.findMany({
      where: {
        serviceId: appointment.serviceId,
        rating: { not: null }
      },
      select: { rating: true }
    });

    if (serviceAppointments.length > 0) {
      const avgRating = serviceAppointments.reduce((sum, apt) => sum + apt.rating, 0) / serviceAppointments.length;

      await prisma.service.update({
        where: { id: appointment.serviceId },
        data: { rating: Math.round(avgRating * 10) / 10 }
      });
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        appointment: updatedAppointment
      }
    });

  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

// Delete appointment (admin only or owner)
router.delete('/:appointmentId', authenticateToken, async (req, res) => {
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

    // Check permissions
    const canDelete = req.user.role === 'ADMIN' ||
      appointment.userId === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
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
