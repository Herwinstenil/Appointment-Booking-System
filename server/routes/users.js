const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:STENIL@2003@localhost:5432/appointment_booking?schema=public' });
const prisma = new PrismaClient({ adapter });

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: 'USER',
        isActive: true
      },
        select: {
          id: true,
          username: true,
          email: true,
          mobile: true,
          role: true,
          firstName: true,
          lastName: true,
          address: true,
          bio: true,
          avatarUrl: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Active user not found'
      });
    }

    const formattedUser = {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.mobile || '',
      address: user.address || '',
      bio: user.bio || '',
      role: (user.role || 'USER').toLowerCase(),
      status: user.isActive ? 'active' : 'inactive',
      avatar: user.avatarUrl || '',
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: { user: formattedUser }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobile,
      address,
      bio,
      company,
      position,
      website,
      avatarUrl
    } = req.body;

    // Validate mobile if provided
    if (mobile) {
      const mobileRegex = /^\+91\s*\d{10}$/;
      if (!mobileRegex.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number format. Use +91 followed by 10 digits'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
        data: {
          firstName: firstName || null,
          lastName: lastName || null,
          mobile: mobile || undefined,
          address: address || null,
          bio: bio || null,
          company: company || null,
          position: position || null,
          website: website || null,
          avatarUrl: avatarUrl || undefined
        },
        select: {
          id: true,
          username: true,
          email: true,
          mobile: true,
          role: true,
          firstName: true,
          lastName: true,
          address: true,
          bio: true,
          company: true,
          position: true,
          website: true,
          avatarUrl: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user by ID (admin only or own profile)
router.get('/:userId', authenticateToken, authorizeOwnerOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          mobile: true,
          role: true,
          firstName: true,
          lastName: true,
          address: true,
          bio: true,
          company: true,
          position: true,
          website: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              appointments: true,
              services: true
            }
          }
        }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// Update user (admin only)
router.put('/:userId', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      mobile,
      role,
      isActive,
      address,
      bio,
      company,
      position,
      website
    } = req.body;

    // Validate role if provided
    if (role) {
      const validRoles = ['USER', 'CLIENT', 'ADMIN'];
      if (!validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be USER, CLIENT, or ADMIN'
        });
      }
    }

    // Validate mobile if provided
    if (mobile) {
      const mobileRegex = /^\+91\s*\d{10}$/;
      if (!mobileRegex.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number format. Use +91 followed by 10 digits'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        mobile: mobile || undefined,
        role: role ? role.toUpperCase() : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        address: address || undefined,
        bio: bio || undefined,
        company: company || undefined,
        position: position || undefined,
        website: website || undefined
      },
        select: {
          id: true,
          username: true,
          email: true,
          mobile: true,
          role: true,
          firstName: true,
          lastName: true,
          address: true,
          bio: true,
          company: true,
          position: true,
          website: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
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
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
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

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user (this will cascade delete related records based on schema)
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

// Get user appointments
router.get('/:userId/appointments', authenticateToken, authorizeOwnerOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {
      userId: userId
    };

    if (status) {
      where.status = status.toUpperCase();
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
              category: true
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
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user appointments'
    });
  }
});

module.exports = router;
