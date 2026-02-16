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

const normalizeAvailabilityPayload = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value;
};

// Public endpoint for user booking form to load only active services
router.get('/active', authenticateToken, async (req, res) => {
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

    const clientNumbers = [...new Set(
      services
        .map((service) => service.clientNo)
        .filter((clientNo) => Number.isInteger(clientNo))
    )];

    let availabilityByClientNo = {};
    if (clientNumbers.length > 0) {
      try {
        const tableRows = await prisma.$queryRawUnsafe(
          `SELECT to_regclass('public."ClientAvailability"') AS "tableName"`
        );
        const tableName = tableRows?.[0]?.tableName;

        if (tableName) {
          const availabilityRows = await prisma.$queryRawUnsafe(
            `SELECT "clientNo", "availability" FROM "ClientAvailability" WHERE "clientNo" = ANY($1::int[])`,
            clientNumbers
          );
          availabilityByClientNo = availabilityRows.reduce((acc, row) => {
            if (!row || !Number.isInteger(row.clientNo)) {
              return acc;
            }
            acc[row.clientNo] = normalizeAvailabilityPayload(row.availability);
            return acc;
          }, {});
        }
      } catch (availabilityError) {
        console.error('Service availability lookup failed:', availabilityError);
      }
    }

    const servicesWithAvailability = services.map((service) => ({
      ...service,
      availability: availabilityByClientNo[service.clientNo] || null
    }));

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
