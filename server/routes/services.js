const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required for service routes');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'price', 'name'];
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const buildPaginator = (page, limit) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};

const handleErrorResponse = (res, error) => {
  if (error.code === 'SERVICE_NAME_CONFLICT') {
    return res.status(409).json({
      success: false,
      message: error.message
    });
  }
  if (error.code === 'SERVICE_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
  if (error.code === 'SERVICE_HAS_ACTIVE_APPOINTMENTS') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  console.error('Service route error:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'An unexpected error occurred'
  });
};

const normalizeSortBy = (field) => ALLOWED_SORT_FIELDS.includes(field) ? field : 'createdAt';

const WEEKLY_DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const getShortDayLabel = (day = '') => {
  const normalized = String(day || '').trim().toLowerCase();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1, 3);
};

const formatTime24To12Compact = (value = '') => {
  const [hoursRaw, minutesRaw] = String(value || '').split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(twelveHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`;
};

const buildAvailabilitySummaryLines = (availability = {}) => {
  const entries = WEEKLY_DAY_ORDER.map((day) => {
    const schedule = availability?.[day] || null;
    return {
      day,
      enabled: Boolean(schedule?.enabled),
      start: schedule?.start || '',
      end: schedule?.end || ''
    };
  });

  const groups = [];
  entries.forEach((entry) => {
    const signature = entry.enabled ? `on|${entry.start}|${entry.end}` : 'off';
    const previous = groups[groups.length - 1];

    if (previous && previous.signature === signature) {
      previous.endDay = entry.day;
      return;
    }

    groups.push({
      signature,
      enabled: entry.enabled,
      start: entry.start,
      end: entry.end,
      startDay: entry.day,
      endDay: entry.day
    });
  });

  return groups.map((group) => {
    const dayRange = group.startDay === group.endDay
      ? getShortDayLabel(group.startDay)
      : `${getShortDayLabel(group.startDay)}-${getShortDayLabel(group.endDay)}`;

    if (!group.enabled) {
      return `${dayRange} (Unavailable)`;
    }

    return `${dayRange} (${formatTime24To12Compact(group.start)} - ${formatTime24To12Compact(group.end)})`;
  });
};

const ensureClientNo = (req, res) => {
  const clientNo = req.user?.clientNo;
  if (!clientNo) {
    res.status(400).json({
      success: false,
      message: 'Client number missing from profile'
    });
    return null;
  }
  return clientNo;
};

// Public endpoint for landing page and booking form to load only active services
router.get('/active', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        clientNo: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const clientNos = [...new Set(services.map((service) => service.clientNo).filter((value) => Number.isInteger(value)))];
    const availabilityRows = clientNos.length > 0
      ? await prisma.clientAvailability.findMany({
        where: {
          clientNo: {
            in: clientNos
          }
        },
        select: {
          clientNo: true,
          availability: true
        }
      })
      : [];

    const availabilityByClientNo = new Map(
      availabilityRows.map((row) => [row.clientNo, row.availability || {}])
    );

    const servicesWithAvailability = services.map((service) => {
      const availability = availabilityByClientNo.get(service.clientNo) || {};
      return {
        ...service,
        availabilitySummary: buildAvailabilitySummaryLines(availability)
      };
    });

    return res.json({
      success: true,
      data: {
        services: servicesWithAvailability
      }
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.get('/', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const { pageNum, limitNum, skip } = buildPaginator(page, limit);
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';
    const clientNo = ensureClientNo(req, res);
    if (!clientNo) return;

    const where = { clientNo };

    if (status) {
      const normalized = status.toLowerCase();
      if (normalized === 'active') where.isActive = true;
      else if (normalized === 'inactive') where.isActive = false;
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

    const [services, total] = await prisma.$transaction([
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
          [normalizeSortBy(sortBy)]: orderDirection
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
    return handleErrorResponse(res, error);
  }
});

router.post('/', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = ensureClientNo(req, res);
    if (!clientNo) return;

    const { name, description, price, category, isActive = true } = req.body;
    if (!name || !description || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and price are required'
      });
    }

    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    const conflictError = new Error('Service with this name already exists');
    conflictError.code = 'SERVICE_NAME_CONFLICT';

    const service = await prisma.$transaction(async (tx) => {
      const existing = await tx.service.findFirst({
        where: {
          clientNo,
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          }
        }
      });

      if (existing) {
        throw conflictError;
      }

      return tx.service.create({
        data: {
          clientNo,
          name: name.trim(),
          description: description.trim(),
          price: parsedPrice,
          category: category ? category.trim() : null,
          isActive: Boolean(isActive),
          rating: 0
        },
        include: {
          _count: {
            select: {
              appointments: true
            }
          }
        }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.put('/:serviceId', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = ensureClientNo(req, res);
    if (!clientNo) return;

    const { serviceId } = req.params;
    const { name, description, price, category, isActive } = req.body;

    let parsedPrice;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0'
        });
      }
    }

    const conflictError = new Error('Service with this name already exists');
    conflictError.code = 'SERVICE_NAME_CONFLICT';

    const notFoundError = new Error('Service not found');
    notFoundError.code = 'SERVICE_NOT_FOUND';

    const updatedService = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({
        where: { id: serviceId }
      });

        if (!service || service.clientNo !== clientNo) {
          throw notFoundError;
        }

      const updates = {};

      if (name && name.trim() !== service.name) {
        const existing = await tx.service.findFirst({
          where: {
            clientNo,
            name: {
              equals: name.trim(),
              mode: 'insensitive'
          },
            id: {
              not: serviceId
            }
          }
        });

        if (existing) {
          throw conflictError;
        }

        updates.name = name.trim();
      }

      if (description !== undefined) {
        updates.description = description.trim();
      }

      if (parsedPrice !== undefined) {
        updates.price = parsedPrice;
      }

      if (category !== undefined) {
        updates.category = category ? category.trim() : null;
      }

      if (isActive !== undefined) {
        updates.isActive = Boolean(isActive);
      }

      if (Object.keys(updates).length === 0) {
        return tx.service.findUnique({
          where: { id: serviceId },
          include: {
            _count: {
              select: {
                appointments: true
              }
            }
          }
        });
      }

      return tx.service.update({
        where: { id: serviceId },
        data: updates,
        include: {
          _count: {
            select: {
              appointments: true
            }
          }
        }
      });
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.delete('/:serviceId', authenticateToken, authorizeRoles('CLIENT'), async (req, res) => {
  try {
    const clientNo = ensureClientNo(req, res);
    if (!clientNo) return;

    const { serviceId } = req.params;

    const notFoundError = new Error('Service not found');
    notFoundError.code = 'SERVICE_NOT_FOUND';

    const activeError = new Error('Cannot delete service with active appointments');
    activeError.code = 'SERVICE_HAS_ACTIVE_APPOINTMENTS';

    await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({
        where: { id: serviceId }
      });

      if (!service || service.clientNo !== clientNo) {
        throw notFoundError;
      }

      const activeAppointments = await tx.appointment.count({
        where: {
          serviceId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (activeAppointments > 0) {
        throw activeError;
      }

      await tx.service.delete({
        where: { id: serviceId }
      });
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

module.exports = router;
