const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:STENIL@2003@localhost:5432/appointment_booking?schema=public';
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STATUS_LABELS = {
  PENDING: 'Upcoming',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const mapStatusLabel = (status = '') => {
  if (!status) return 'Upcoming';
  const normalized = status.toString().toUpperCase();
  return STATUS_LABELS[normalized] || normalized.charAt(0) + normalized.slice(1).toLowerCase();
};

const appointmentInclude = {
  service: true,
  client: true,
  user: true
};

const applyAppointmentFilters = (where = {}, query = {}) => {
  const { status, dateFrom, dateTo, serviceId } = query || {};
  const nextWhere = { ...where };

  if (status) {
    nextWhere.status = status.toUpperCase();
  }

  if (dateFrom || dateTo) {
    nextWhere.date = {
      ...(nextWhere.date || {})
    };
    if (dateFrom) nextWhere.date.gte = new Date(dateFrom);
    if (dateTo) nextWhere.date.lte = new Date(dateTo);
  }

  if (serviceId) {
    nextWhere.serviceId = serviceId;
  }

  return nextWhere;
};

const fetchAppointments = async (where = {}, query = {}) => {
  const finalWhere = applyAppointmentFilters(where, query);
  const appointments = await prisma.appointment.findMany({
    where: finalWhere,
    include: appointmentInclude,
    orderBy: [
      { date: 'desc' },
      { time: 'desc' }
    ]
  });

  return appointments.map(buildAppointmentPayload);
};

const buildAppointmentPayload = (appointment) => {
  const appointmentDate = appointment.date ? appointment.date.toISOString() : null;
  return {
    id: appointment.id,
    userId: appointment.userId,
    clientNo: appointment.clientNo || appointment.service?.clientNo || null,
    serviceId: appointment.serviceId,
    serviceName: appointment.service?.name || appointment.serviceName || 'Service',
    appointmentDate,
    appointmentTime: appointment.time,
    status: appointment.status,
    statusLabel: mapStatusLabel(appointment.status),
    createdAt: appointment.createdAt,
    amount: appointment.amount,
    notes: appointment.notes || null,
    rating: appointment.rating || null,
    service: appointment.service ? {
      id: appointment.service.id,
      name: appointment.service.name,
      price: appointment.service.price,
      category: appointment.service.category,
      duration: appointment.service.duration,
      isActive: appointment.service.isActive
    } : null,
    client: appointment.client ? {
      id: appointment.client.id,
      firstName: appointment.client.firstName,
      lastName: appointment.client.lastName,
      company: appointment.client.company,
      email: appointment.client.email,
      clientNo: appointment.client.clientNo,
      mobile: appointment.client.mobile
    } : null,
    user: appointment.user ? {
      id: appointment.user.id,
      firstName: appointment.user.firstName,
      lastName: appointment.user.lastName,
      email: appointment.user.email,
      clientNo: appointment.user.clientNo,
      role: appointment.user.role
    } : null
  };
};

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { serviceId, appointmentDate, appointmentTime, notes } = req.body;

    if (!serviceId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Service, date, and time are required'
      });
    }

    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment date'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { client: true }
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

    const conflict = await prisma.appointment.findFirst({
      where: {
        userId: req.user.id,
        serviceId,
        date: parsedDate,
        time: appointmentTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment at this time'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.id,
        clientNo: service.client?.clientNo || null,
        serviceId,
        date: parsedDate,
        time: appointmentTime,
        amount: service.price,
        status: 'PENDING',
        notes: notes ? notes.trim() : null
      },
      include: appointmentInclude
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment: buildAppointmentPayload(appointment)
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

// Get appointments for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};

    if (req.user.role === 'USER') {
      where.userId = req.user.id;
    } else if (req.user.role === 'CLIENT') {
      where.OR = [
        { userId: req.user.id },
        { clientNo: req.user.clientNo }
      ];
    }

    const payload = await fetchAppointments(where, req.query);

    res.json({
      success: true,
      data: {
        appointments: payload
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

// Get appointments scoped to the authenticated user explicitly
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const payload = await fetchAppointments({ userId: req.user.id }, req.query);

    res.json({
      success: true,
      data: {
        appointments: payload
      }
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user appointments'
    });
  }
});

// Get appointments scoped to the client/service owner
router.get('/client', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = req.user?.clientNo;
    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Missing client number'
      });
    }

    const payload = await fetchAppointments({
      service: {
        clientNo
      }
    }, req.query);

    res.json({
      success: true,
      data: {
        appointments: payload
      }
    });
  } catch (error) {
    console.error('Get client appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get client appointments'
    });
  }
});

// Confirm appointment (client only)
router.patch('/:appointmentId/confirm', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const clientNo = req.user?.clientNo;

    if (!clientNo) {
      return res.status(400).json({
        success: false,
        message: 'Client number missing'
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          select: {
            id: true,
            clientNo: true
          }
        },
        client: true,
        user: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.service?.clientNo !== clientNo) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    if (appointment.status === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Appointment already confirmed'
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
      include: appointmentInclude
    });

    res.json({
      success: true,
      message: 'Appointment confirmed',
      data: {
        appointment: buildAppointmentPayload(updatedAppointment)
      }
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment'
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
      appointment.clientNo === req.user.clientNo;

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
      (req.user.role === 'CLIENT' && appointment.clientNo === req.user.clientNo);

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
      appointment.clientNo === req.user.clientNo;

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
