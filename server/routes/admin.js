const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:STENIL@2003@localhost:5432/appointment_booking?schema=public' });
const prisma = new PrismaClient({ adapter });

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

// Get revenue by category (grouped by company)
router.get('/dashboard/revenue-by-category', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get all active clients created within the period, grouped by company, and only those with revenue > 0
    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        isActive: true,
        createdAt: { gte: startDate },
        revenue: { gt: 0 }
      },
      select: {
        id: true,
        company: true,
        firstName: true,
        lastName: true,
        email: true,
        revenue: true,
        createdAt: true,
        clientNo: true // Select clientNo
      },
      orderBy: {
        revenue: 'desc'
      }
    });

    // Group revenue by company and track top client object
    const revenueByCompany = clients.reduce((acc, client) => {
      const companyName = client.company || 'Unassigned';
      const existing = acc.find(item => item.company === companyName);
      const clientFullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown';

      if (existing) {
        existing.amount += client.revenue || 0;
        existing.clients += 1;
        if (!existing.clientNames.includes(clientFullName)) {
          existing.clientNames.push(clientFullName);
        }
        // Update top client if this client has higher revenue
        if ((client.revenue || 0) > (existing.topClient?.revenue || 0)) {
          existing.topClient = client;
        }
      } else {
        acc.push({
          company: companyName,
          amount: client.revenue || 0,
          clients: 1,
          clientId: client.id,
          clientNames: [clientFullName],
          topClient: client
        });
      }
      return acc;
    }, []);

    // Sort by revenue descending
    revenueByCompany.sort((a, b) => b.amount - a.amount);

    // Calculate percentages and growth
    const totalRevenue = revenueByCompany.reduce((sum, item) => sum + item.amount, 0);
    const result = revenueByCompany.map((item, index) => ({
      category: item.company,
      amount: item.amount,
      color: getCompanyColor(index),
      clientName: `${item.topClient.firstName || ''} ${item.topClient.lastName || ''}`.trim() || 'Unknown',
      clientGmail: item.topClient.email || 'N/A',
      clientNo: item.topClient.clientNo || 'N/A'
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

    // Fetch recent clients created by the admin (role = 'CLIENT')
    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        revenue: { gt: 0 }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        createdAt: true,
        revenue: true
      }
    });

    const result = clients.map(client => ({
      id: client.id,
      client: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown',
      service: client.company || 'N/A',
      amount: client.revenue || 0,
      date: client.createdAt.toISOString().split('T')[0],
      status: 'completed',
      avatar: `${(client.firstName?.[0] || '')}${(client.lastName?.[0] || '')}`.toUpperCase() || 'CL'
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

// Get top clients
router.get('/dashboard/top-clients', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    // Get active clients with their revenue
    const activeClients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        isActive: true
      },
      select: {
        firstName: true,
        lastName: true,
        company: true,
        revenue: true
      },
      orderBy: {
        revenue: 'desc'
      },
      take: limit
    });

    // Format client data
    const clientsWithRevenue = activeClients.map(client => ({
      clientName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown Client',
      companyName: client.company || 'N/A',
      totalRevenue: client.revenue || 0
    }));

    res.json({
      success: true,
      data: clientsWithRevenue
    });

  } catch (error) {
    console.error('Get top clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top clients'
    });
  }
});

// Get revenue trend data
router.get('/dashboard/revenue-trend', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();

    let startDate, endDate, groupBy, dateFormat, labels;

    switch (period) {
      case 'daily':
        // Last 7 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = new Date(now);
        groupBy = 'DATE("createdAt")';
        dateFormat = 'YYYY-MM-DD';
        labels = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;

      case 'weekly':
        // Last 4 weeks
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 27);
        endDate = new Date(now);
        groupBy = "DATE_TRUNC('week', \"createdAt\")";
        dateFormat = 'YYYY-MM-DD';
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;

      case 'monthly':
        // Last 12 months
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 11);
        endDate = new Date(now);
        groupBy = "DATE_TRUNC('month', \"createdAt\")";
        dateFormat = 'YYYY-MM';
        labels = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;

      case 'yearly':
        // Last 5 years
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 4);
        endDate = new Date(now);
        groupBy = "DATE_TRUNC('year', \"createdAt\")";
        dateFormat = 'YYYY';
        labels = [];
        for (let i = 4; i >= 0; i--) {
          labels.push((now.getFullYear() - i).toString());
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Use: daily, weekly, monthly, or yearly'
        });
    }

    // Get revenue data grouped by time period
    const revenueData = await prisma.$queryRaw`
      SELECT
        ${groupBy} as period,
        SUM("amount") as revenue,
        COUNT(*) as bookings
      FROM "Appointment"
      WHERE "status" = 'COMPLETED'
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `;

    // Format the data for frontend
    const result = labels.map((label, index) => {
      const periodData = revenueData.find(item => {
        const itemDate = new Date(item.period);
        switch (period) {
          case 'daily':
            return itemDate.toLocaleDateString('en-US', { weekday: 'short' }) === label;
          case 'weekly':
            // Calculate which week this belongs to
            const weekIndex = Math.floor((now.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            return weekIndex === (3 - index); // Reverse order
          case 'monthly':
            return itemDate.toLocaleDateString('en-US', { month: 'short' }) === label;
          case 'yearly':
            return itemDate.getFullYear().toString() === label;
          default:
            return false;
        }
      });

      const revenue = periodData ? Number(periodData.revenue) : 0;
      const bookings = periodData ? Number(periodData.bookings) : 0;

      return {
        label,
        revenue,
        bookings,
        growth: 0 // Will be calculated below
      };
    });

    // Calculate growth percentages
    for (let i = 0; i < result.length; i++) {
      if (i > 0) {
        const current = result[i].revenue;
        const previous = result[i - 1].revenue;
        if (previous > 0) {
          result[i].growth = Math.round(((current - previous) / previous) * 100 * 10) / 10;
        }
      }
    }

    res.json({
      success: true,
      data: result,
      period
    });

  } catch (error) {
    console.error('Get revenue trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue trend data'
    });
  }
});

// Get booking trend data
router.get('/dashboard/booking-trend', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();

    let startDate, endDate, groupBy, dateFormat, labels;

    switch (period) {
      case 'daily':
        // Last 7 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = new Date(now);
        groupBy = 'DATE("createdAt")';
        dateFormat = 'YYYY-MM-DD';
        labels = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;

      case 'weekly':
        // Last 4 weeks
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 27);
        endDate = new Date(now);
        groupBy = "DATE_TRUNC('week', \"createdAt\")";
        dateFormat = 'YYYY-MM-DD';
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;

      case 'monthly':
        // Last 12 months
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 11);
        endDate = new Date(now);
        groupBy = "DATE_TRUNC('month', \"createdAt\")";
        dateFormat = 'YYYY-MM';
        labels = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;

      case 'yearly':
        // Last 5 years
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 4);
        endDate = new Date(now);
        groupBy = "DATE_TRUNC('year', \"createdAt\")";
        dateFormat = 'YYYY';
        labels = [];
        for (let i = 4; i >= 0; i--) {
          labels.push((now.getFullYear() - i).toString());
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Use: daily, weekly, monthly, or yearly'
        });
    }

    // Get booking data grouped by time period
    const bookingData = await prisma.$queryRaw`
      SELECT
        ${groupBy} as period,
        COUNT(*) as bookings
      FROM "Appointment"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `;

    // Format the data for frontend
    const result = labels.map((label, index) => {
      const periodData = bookingData.find(item => {
        const itemDate = new Date(item.period);
        switch (period) {
          case 'daily':
            return itemDate.toLocaleDateString('en-US', { weekday: 'short' }) === label;
          case 'weekly':
            // Calculate which week this belongs to
            const weekIndex = Math.floor((now.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            return weekIndex === (3 - index); // Reverse order
          case 'monthly':
            return itemDate.toLocaleDateString('en-US', { month: 'short' }) === label;
          case 'yearly':
            return itemDate.getFullYear().toString() === label;
          default:
            return false;
        }
      });

      const bookings = periodData ? Number(periodData.bookings) : 0;

      return {
        label,
        bookings,
        growth: 0 // Will be calculated below
      };
    });

    // Calculate growth percentages
    for (let i = 0; i < result.length; i++) {
      if (i > 0) {
        const current = result[i].bookings;
        const previous = result[i - 1].bookings;
        if (previous > 0) {
          result[i].growth = Math.round(((current - previous) / previous) * 100 * 10) / 10;
        }
      }
    }

    res.json({
      success: true,
      data: result,
      period
    });

  } catch (error) {
    console.error('Get booking trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking trend data'
    });
  }
});

// Get server uptime
router.get('/dashboard/server-uptime', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    const uptimeString = `${days}d ${hours}h ${minutes}m`;
    const uptimePercentage = '99.9%'; // This could be calculated based on some logic

    res.json({
      success: true,
      data: {
        uptime: uptimeString,
        percentage: uptimePercentage
      }
    });

  } catch (error) {
    console.error('Get server uptime error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get server uptime'
    });
  }
});

// Helper function to calculate folder size
function getFolderSize(folderPath) {
  let totalSize = 0;
  try {
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          totalSize += getFolderSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    }
  } catch (error) {
    console.error('Error calculating folder size:', error);
  }
  return totalSize;
}

// Helper function to get current month boundaries
function getCurrentMonthBoundaries() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startOfMonth, endOfMonth };
}

// Get system metrics (response time, storage, new users)
router.get('/dashboard/system-metrics', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const startTime = Date.now();

    // Calculate response time (time taken to process this request)
    // We'll measure the time for the database queries
    const queryStartTime = Date.now();

    const { startOfMonth, endOfMonth } = getCurrentMonthBoundaries();

    // Get new users count for current month (role === 'CLIENT', status === 'active')
    // Note: In the schema, isActive is the status field and role is an enum
    const newUsersCount = await prisma.user.count({
      where: {
        role: 'CLIENT',
        isActive: true,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Get total clients count
    const totalClients = await prisma.user.count({
      where: {
        role: 'CLIENT'
      }
    });

    // Get active services count
    const activeServices = await prisma.service.count({
      where: {
        isActive: true
      }
    });

    // Calculate storage used
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const uploadsSize = getFolderSize(uploadsPath);

    // Estimate database size (PostgreSQL doesn't provide easy size query without extensions)
    // We'll return a placeholder that can be updated when database size info is available
    const dbSizeEstimate = 0; // This would require pg_database_size() or similar

    const totalStorageBytes = uploadsSize + dbSizeEstimate;
    const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);

    const queryEndTime = Date.now();
    const responseTime = queryEndTime - queryStartTime;

    res.json({
      success: true,
      data: {
        responseTime: `${responseTime}ms`,
        storageUsed: `${totalStorageGB} GB`,
        newUsers: newUsersCount,
        totalUsers: totalClients,
        activeUsers: totalClients, // Using total clients as active for now
        activeServices: activeServices,
        serverUptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('Get system metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system metrics'
    });
  }
});

// Get recent activities
router.get('/dashboard/recent-activities', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent admin activities
    const activities = await prisma.activity.findMany({
      where: {
        type: {
          in: ['ADMIN_LOGIN', 'ADMIN_CREATED', 'CLIENT_CREATED', 'CLIENT_DELETED', 'CLIENT_EDITED', 'REPORT_GENERATED', 'REPORT_DOWNLOADED']
        }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Format activities for frontend
    const result = activities.map(activity => ({
      id: `activity-${activity.id}`,
      action: activity.description,
      time: formatTimeAgo(activity.createdAt),
      status: activity.type.toLowerCase().replace('_', '-'),
      icon: getActivityIcon(activity.type),
      createdAt: activity.createdAt
    }));

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

// Helper function to get company color based on index
function getCompanyColor(index) {
  const colors = [
    'bg-rose-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-teal-500'
  ];
  return colors[index % colors.length];
}

// Helper function to get activity icon
function getActivityIcon(type) {
  const icons = {
    'ADMIN_LOGIN': 'LogIn',
    'ADMIN_CREATED': 'UserPlus',
    'CLIENT_CREATED': 'UserPlus',
    'CLIENT_DELETED': 'UserMinus',
    'CLIENT_EDITED': 'Edit',
    'REPORT_GENERATED': 'FileText',
    'REPORT_DOWNLOADED': 'Download',
    'completed': 'CheckCircle',
    'pending': 'Clock',
    'cancelled': 'XCircle',
    'confirmed': 'CheckCircle',
    'created': 'CheckCircle'
  };
  return icons[type] || 'CheckCircle';
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
          address: true,
          clientNo: true,
          revenue: true,
          isActive: true,
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

    // Map isActive to status for frontend compatibility
    const mappedUsers = users.map(user => ({
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
      status: user.isActive ? 'Active' : 'Inactive'
    }));

    res.json({
      success: true,
      data: {
        users: mappedUsers,
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
      mobile,
      address
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

    // Get next client number if creating a CLIENT
    let clientNo = null;
    let revenue = null;
    if (role.toUpperCase() === 'CLIENT') {
      const maxClientNo = await prisma.user.aggregate({
        where: { role: 'CLIENT' },
        _max: { clientNo: true }
      });
      clientNo = (maxClientNo._max.clientNo || 0) + 1;
      revenue = 0.0;
    }

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
        mobile: mobile?.trim(),
        address: address?.trim(),
        clientNo: clientNo,
        revenue: revenue
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
        clientNo: true,
        revenue: true,
        createdAt: true
      }
    });

    // Log admin activity
    const adminId = req.user?.id; // From auth middleware
    if (adminId) {
      const activityType = role.toUpperCase() === 'ADMIN' ? 'ADMIN_CREATED' : 'CLIENT_CREATED';
      await prisma.activity.create({
        data: {
          type: activityType,
          description: `Admin created new ${role.toLowerCase()}: ${firstName} ${lastName}`,
          userId: adminId,
          targetId: user.id
        }
      });
    }

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
      address,
      password,
      clientNo,
      revenue,
      isActive
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
        address: address?.trim() || undefined,
        password: hashedPassword || undefined,
        clientNo: clientNo !== undefined ? clientNo : undefined,
        revenue: revenue !== undefined ? revenue : undefined,
        isActive: isActive !== undefined ? isActive : undefined
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
        address: true,
        updatedAt: true
      }
    });

    // Log admin activity for client editing
    const adminId = req.user?.id; // From auth middleware
    if (adminId && existingUser.role === 'CLIENT') {
      await prisma.activity.create({
        data: {
          type: 'CLIENT_EDITED',
          description: `Admin edited client: ${updatedUser.firstName} ${updatedUser.lastName}`,
          userId: adminId,
          targetId: userId
        }
      });
    }

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

    // Log admin activity before deletion
    const adminId = req.user?.id;  // From auth middleware
    if (adminId && user.role === 'CLIENT') {
      await prisma.activity.create({
        data: {
          type: 'CLIENT_DELETED',
          description: `Admin deleted client: ${user.firstName} ${user.lastName}`,
          userId: adminId,
          targetId: userId
        }
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

// Get all activities for export
router.get('/dashboard/export-activities', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    // Get all activities (not just recent ones)
    const activities = await prisma.activity.findMany({
      where: {
        type: {
          in: ['ADMIN_LOGIN', 'ADMIN_CREATED', 'CLIENT_CREATED', 'CLIENT_DELETED', 'CLIENT_EDITED', 'REPORT_GENERATED', 'REPORT_DOWNLOADED']
        }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format activities for export
    const result = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      admin: `${activity.user?.firstName || ''} ${activity.user?.lastName || ''}`.trim() || 'Unknown',
      adminEmail: activity.user?.email || 'N/A',
      date: activity.createdAt.toISOString().split('T')[0],
      time: activity.createdAt.toISOString().split('T')[1].split('.')[0],
      timestamp: activity.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get export activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities for export'
    });
  }
});

// Log report download activity
router.post('/activities/report-downloaded', authenticateToken, authorizeRoles('ADMIN'), [
  body('reportType').isLength({ min: 1 }).withMessage('Report type is required')
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

    const { reportType } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Log the activity
    await prisma.activity.create({
      data: {
        type: 'REPORT_DOWNLOADED',
        description: `Admin downloaded ${reportType} report`,
        userId: adminId
      }
    });

    res.json({
      success: true,
      message: 'Report download activity logged successfully'
    });

  } catch (error) {
    console.error('Log report download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log report download activity'
    });
  }
});

module.exports = router;