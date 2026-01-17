import React, { useMemo } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useAuth } from '../../Context/AuthContext.jsx';
import {
    Users,
    FolderOpen,
    BarChart3,
    DollarSign,
    User,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Edit3,
    Save,
    Shield,
    Settings,
    Bell,
    Eye,
    EyeOff,
    Key,
    Mail,
    Phone,
    Database,
    Zap,
    FileCheck,
    Send,
    Server,
    Calendar,
    Activity,
    Camera,
    MapPin,
    Download,
    CreditCard,
    Globe,
    CheckCircle,
    AlertCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Filter,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Plus,
    Eye as ViewIcon,
    Edit,
    Trash2,
    Clock,
    BookOpen,
    MessageSquare,
    Star,
    CalendarDays,
    Clock4,
    UserPlus,
    FileText,
    TrendingUp as ArrowTrendingUp,
    TrendingDown as ArrowTrendingDown,
    Users as UsersIcon,
    Settings as SettingsIcon,
    Download as DownloadIcon
} from 'lucide-react';

const AdminDashboard = () => {
    const { getAuthHeaders, user: currentUser } = useAuth();
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Icon mapping for activity icons
    const iconMap = {
        CheckCircle,
        Clock,
        XCircle,
        AlertCircle
    };

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch users data
    const fetchUsersData = async () => {
        try {
            const headers = getAuthHeaders();
            const usersResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users?limit=100`, { headers });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                const formattedUsers = usersData.data?.users.map(user => ({
                    ...user,
                    revenue: `$${user.revenue || 0}`,
                    phone: user.mobile ? `+91 ${user.mobile}` : '',
                    joinDate: new Date(user.createdAt).toISOString().split('T')[0],
                    lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'
                })) || [];
                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error('Error fetching users data:', error);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const headers = getAuthHeaders();

                // Fetch all dashboard data in parallel
                const [
                    statsResponse,
                    usersResponse,
                    servicesResponse,
                    bookingsResponse,
                    revenueByCategoryResponse,
                    recentTransactionsResponse,
                    performanceMetricsResponse,
                    popularServicesResponse,
                    recentActivitiesResponse
                ] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/stats`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users?limit=100`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/services?limit=100`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/appointments?limit=100`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/revenue-by-category`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/recent-transactions`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/performance-metrics`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/popular-services`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/recent-activities`, { headers })
                ]);

                // Process responses
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    // Stats are already handled in the component
                }

                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    const formattedUsers = usersData.data?.users.map(user => ({
                        ...user,
                        revenue: `$${user.revenue || 0}`,
                        phone: user.mobile ? `+91 ${user.mobile}` : '',
                        joinDate: new Date(user.createdAt).toISOString().split('T')[0],
                        lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'
                    })) || [];
                    setUsers(formattedUsers);
                }

                if (servicesResponse.ok) {
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData.data?.services || []);
                }

                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json();
                    setBookings(bookingsData.data?.appointments || []);
                }

                if (revenueByCategoryResponse.ok) {
                    const revenueData = await revenueByCategoryResponse.json();
                    setRevenueByCategory(revenueData.data || []);
                }

                if (recentTransactionsResponse.ok) {
                    const transactionsData = await recentTransactionsResponse.json();
                    setRecentTransactions(transactionsData.data || []);
                }

                if (performanceMetricsResponse.ok) {
                    const metricsData = await performanceMetricsResponse.json();
                    setPerformanceMetrics(metricsData.data || []);
                }

                if (popularServicesResponse.ok) {
                    const popularData = await popularServicesResponse.json();
                    setPopularServices(popularData.data || []);
                }

                if (recentActivitiesResponse.ok) {
                    const activitiesData = await recentActivitiesResponse.json();
                    setRecentActivities(activitiesData.data || []);
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [getAuthHeaders]);

    // Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Store original data for cancel functionality
    const [originalProfileData, setOriginalProfileData] = useState({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@roriri.com',
        phone: '+91 7338941579',
        department: 'IT Administration',
        joinDate: '2023-01-15',
        lastLogin: '2024-01-15 10:30 AM',
        address: 'RORIRI IT PARK, Nallanthapuram, Kalskad, Tamil Nadu 629003',
        bio: 'Experienced system administrator with expertise in managing enterprise software solutions and team coordination.'
    });

    const [profileData, setProfileData] = useState({ ...originalProfileData });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: false,
        systemAlerts: true,
        bookingUpdates: true,
        securityAlerts: true,
        weeklyReports: false
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: true,
        sessionTimeout: '30',
        passwordExpiry: '90',
        loginAlerts: true,
        deviceManagement: true
    });

    // User Management State
    const [users, setUsers] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Filter States
    const [userFilters, setUserFilters] = useState({
        role: '',
        status: '',
        joinDateFrom: '',
        joinDateTo: '',
        revenueMin: '',
        revenueMax: ''
    });

    const [bookingFilters, setBookingFilters] = useState({
        dateFrom: '',
        dateTo: '',
        status: '',
        serviceType: '',
        amountMin: '',
        amountMax: ''
    });

    const [revenueFilters, setRevenueFilters] = useState({
        dateFrom: '',
        dateTo: '',
        category: '',
        amountMin: '',
        amountMax: ''
    });

    // Filter Modal States
    const [showUserFilterModal, setShowUserFilterModal] = useState(false);
    const [showServiceFilterModal, setShowServiceFilterModal] = useState(false);
    const [showBookingFilterModal, setShowBookingFilterModal] = useState(false);
    const [showRevenueFilterModal, setShowRevenueFilterModal] = useState(false);

    // Add Client Modal State
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [clientSuccess, setClientSuccess] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '+91 ',
        company: '',
        role: '',
        status: 'Active',
        address: '',
        notes: '',
        password: ''
    });

    // View and Edit User Modal State
    const [showViewUserModal, setShowViewUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // System Details and Activities Modal State
    const [showSystemDetailsModal, setShowSystemDetailsModal] = useState(false);
    const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);

    // Revenue Dashboard Modal States
    const [showRevenueDetailsModal, setShowRevenueDetailsModal] = useState(false);
    const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);

    // Service Category Management State
    const [services, setServices] = useState([]);

    // Bookings State
    const [bookings, setBookings] = useState([]);

    // Revenue Dashboard State
    const [timeRange, setTimeRange] = useState('daily');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [showChartMenu, setShowChartMenu] = useState(false);
    const [chartType, setChartType] = useState('area');
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Booking Analytics State
    const [showBookingChartMenu, setShowBookingChartMenu] = useState(false);
    const [isBookingFullScreen, setIsBookingFullScreen] = useState(false);
    const [bookingChartType, setBookingChartType] = useState('area');

    // Function to get date labels based on time range
    const getDateLabels = (range) => {
        const now = new Date();
        const labels = [];

        switch (range) {
            case 'daily':
                // Current week from Monday to Sunday
                const monday = new Date(now);
                monday.setDate(now.getDate() - now.getDay() + 1); // Monday of current week
                for (let i = 0; i < 7; i++) {
                    const date = new Date(monday);
                    date.setDate(monday.getDate() + i);
                    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                }
                break;
            case 'weekly':
                // Weeks 1-4 of current month
                labels.push('Week 1', 'Week 2', 'Week 3', 'Week 4');
                break;
            case 'monthly':
                // Last 7 months
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now);
                    date.setMonth(now.getMonth() - i);
                    labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
                }
                break;
            case 'yearly':
                // Last 5 years
                for (let i = 4; i >= 0; i--) {
                    const year = now.getFullYear() - i;
                    labels.push(year.toString());
                }
                break;
            default:
                labels.push('N/A');
        }
        return labels;
    };

    // Function to generate revenue trend data based on time range
    const getRevenueTrend = (range) => {
        const labels = getDateLabels(range);
        const baseRevenue = 85000;
        const data = [];

        for (let i = 0; i < labels.length; i++) {
            const variation = (Math.random() - 0.5) * 0.3; // -15% to +15% variation
            const revenue = Math.round(baseRevenue * (1 + variation + (i * 0.05))); // Slight upward trend
            const prevRevenue = i > 0 ? data[i - 1].revenue : baseRevenue;
            const growth = ((revenue - prevRevenue) / prevRevenue * 100);

            data.push({
                label: labels[i],
                revenue: revenue,
                growth: Math.round(growth * 10) / 10
            });
        }

        return data;
    };

    // Function to generate booking trend data based on time range
    const getBookingTrend = (range) => {
        const labels = getDateLabels(range);
        const data = [];

        for (let i = 0; i < labels.length; i++) {
            let bookings;
            switch (range) {
                case 'daily':
                    bookings = Math.floor(Math.random() * 20) + 25; // 25-45 bookings per day
                    break;
                case 'weekly':
                    bookings = Math.floor(Math.random() * 50) + 100; // 100-150 bookings per week
                    break;
                case 'monthly':
                    bookings = Math.floor(Math.random() * 200) + 300; // 300-500 bookings per month
                    break;
                case 'yearly':
                    bookings = Math.floor(Math.random() * 1000) + 2000; // 2000-3000 bookings per year
                    break;
                default:
                    bookings = 0;
            }

            const prevBookings = i > 0 ? data[i - 1].bookings : bookings;
            const growth = ((bookings - prevBookings) / prevBookings * 100);

            data.push({
                label: labels[i],
                bookings: bookings,
                growth: Math.round(growth * 10) / 10
            });
        }

        return data;
    };

    // Revenue Dashboard Data (dynamic based on time range)
    const getRevenueMetrics = (range) => {
        const baseMetrics = {
            totalRevenue: 1254300,
            monthlyRevenue: 98750,
            growthPercentage: 12.5,
            activeSubscriptions: 2847,
            averageOrderValue: 156,
            topCategory: 'Premium Services',
            newCustomers: 342,
            churnRate: 2.3,
            customerLifetimeValue: 2450
        };

        // Adjust metrics based on time range
        const multiplier = {
            daily: 0.03, // Daily values are smaller
            weekly: 0.12,
            monthly: 1,
            yearly: 12
        };

        return {
            ...baseMetrics,
            totalRevenue: Math.round(baseMetrics.totalRevenue * multiplier[range]),
            monthlyRevenue: Math.round(baseMetrics.monthlyRevenue * multiplier[range]),
            newCustomers: Math.round(baseMetrics.newCustomers * multiplier[range]),
            activeSubscriptions: Math.round(baseMetrics.activeSubscriptions * multiplier[range])
        };
    };

    // System Metrics Data (dynamic based on time range)
    const getSystemMetrics = (range) => {
        const baseMetrics = {
            totalUsers: 1250,
            activeUsers: 847,
            activeServices: 4,
            newUsers: 45,
            storageUsed: '2.3 GB',
            serverUptime: '99.9%',
            responseTime: '120ms'
        };

        // Adjust metrics based on time range
        const multiplier = {
            daily: 0.03, // Daily values are smaller
            weekly: 0.12,
            monthly: 1,
            yearly: 12
        };

        return {
            ...baseMetrics,
            totalUsers: Math.round(baseMetrics.totalUsers * multiplier[range]),
            activeUsers: Math.round(baseMetrics.activeUsers * multiplier[range]),
            activeServices: Math.round(baseMetrics.activeServices * multiplier[range]),
            newUsers: Math.round(baseMetrics.newUsers * multiplier[range])
        };
    };

    // Booking Data (dynamic based on time range)
    const getBookingData = (range) => {
        const baseData = {
            totalBookings: 1247,
            completedBookings: 984,
            pendingBookings: 187,
            cancelledBookings: 76,
            bookingRate: 78.9
        };

        // Adjust metrics based on time range
        const multiplier = {
            daily: 0.03, // Daily values are smaller
            weekly: 0.12,
            monthly: 1,
            yearly: 12
        };

        return {
            ...baseData,
            totalBookings: Math.round(baseData.totalBookings * multiplier[range]),
            completedBookings: Math.round(baseData.completedBookings * multiplier[range]),
            pendingBookings: Math.round(baseData.pendingBookings * multiplier[range]),
            cancelledBookings: Math.round(baseData.cancelledBookings * multiplier[range])
        };
    };

    const revenueMetrics = getRevenueMetrics(timeRange);
    const systemMetrics = getSystemMetrics(timeRange);
    const bookingData = getBookingData(timeRange);

    // These will be populated from API responses
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState([]);
    const [popularServices, setPopularServices] = useState([]);

    // Trend data state
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [bookingTrend, setBookingTrend] = useState([]);

    // Function to fetch trend data
    const fetchTrendData = async (range) => {
        try {
            const headers = getAuthHeaders();
            const [revenueResponse, bookingResponse] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/revenue-trend?period=${range}`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard/booking-trend?period=${range}`, { headers })
            ]);

            if (revenueResponse.ok) {
                const revenueData = await revenueResponse.json();
                let data = revenueData.data || [];
                if (data.length === 7) {
                    data = [...data.slice(2), ...data.slice(0, 2)];
                }
                setRevenueTrend(data);
            }

            if (bookingResponse.ok) {
                const bookingData = await bookingResponse.json();
                let data = bookingData.data || [];
                if (data.length === 7) {
                    data = [...data.slice(2), ...data.slice(0, 2)];
                }
                setBookingTrend(data);
            }
        } catch (error) {
            console.error('Error fetching trend data:', error);
        }
    };

    // Fetch trend data when timeRange changes
    useEffect(() => {
        fetchTrendData(timeRange);
    }, [timeRange, getAuthHeaders]);

    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('Logging out...');
        const userRole = localStorage.getItem('userRole');
        navigate(`/user/login?from=dashboard&role=${userRole}`);
    };

    // Dashboard button handlers
    const handleViewSystemDetails = () => {
        // Open system details modal
        console.log('Viewing system details...');
        setShowSystemDetailsModal(true);
    };

    const handleViewAllActivities = () => {
        // Open all activities modal
        console.log('Viewing all activities...');
        setShowAllActivitiesModal(true);
    };

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSecurityChange = (key, value) => {
        setSecuritySettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveProfile = () => {
        console.log('Saving profile data:', profileData);
        setIsEditing(false);
        setOriginalProfileData({ ...profileData });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleCancelEdit = () => {
        setProfileData({ ...originalProfileData });
        setIsEditing(false);
    };

    const handleStartEditing = () => {
        setOriginalProfileData({ ...profileData });
        setIsEditing(true);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profile-image-input').click();
    };

    // User Management Handlers
    const handleUserSelect = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(user => user.id));
    };

    const filteredUsers = users.filter(user => {
        // Client role filter - only show users with CLIENT role from database
        const isClientRole = user.role === 'CLIENT';

        // Exclude logged-in admin user
        const isNotCurrentUser = user.id !== currentUser?.id;

        // Search term filter
        const matchesSearch = searchTerm === '' ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.clientNo.toLowerCase().includes(SearchTerm.toLowerCase());

        // Role filter
        const matchesRole = userFilters.role === '' || user.role === userFilters.role;

        // Status filter
        const matchesStatus = userFilters.status === '' || user.status === userFilters.status;

        // Join date range filter
        const userJoinDate = new Date(user.joinDate);
        const matchesJoinDateFrom = userFilters.joinDateFrom === '' || userJoinDate >= new Date(userFilters.joinDateFrom);
        const matchesJoinDateTo = userFilters.joinDateTo === '' || userJoinDate <= new Date(userFilters.joinDateTo);

        // Revenue range filter
        const userRevenue = parseFloat(user.revenue && typeof user.revenue === 'string' ? user.revenue.replace(/[$,]/g, '') : '0');
        const matchesRevenueMin = userFilters.revenueMin === '' || userRevenue >= parseFloat(userFilters.revenueMin);
        const matchesRevenueMax = userFilters.revenueMax === '' || userRevenue <= parseFloat(userFilters.revenueMax);

        return isClientRole && isNotCurrentUser && matchesSearch && matchesRole && matchesStatus && matchesJoinDateFrom && matchesJoinDateTo && matchesRevenueMin && matchesRevenueMax;
    });

    const filteredPopularServices = popularServices.filter(service => {
        // Service type filter
        const matchesServiceType = bookingFilters.serviceType === '' || service.service === bookingFilters.serviceType;

        // Amount range filter
        const serviceRevenue = parseFloat(service.revenue && typeof service.revenue === 'string' ? service.revenue.replace(/[$,]/g, '') : '0');
        const matchesAmountMin = bookingFilters.amountMin === '' || serviceRevenue >= parseFloat(bookingFilters.amountMin);
        const matchesAmountMax = bookingFilters.amountMax === '' || serviceRevenue <= parseFloat(bookingFilters.amountMax);

        return matchesServiceType && matchesAmountMin && matchesAmountMax;
    });

    const filteredRevenueByCategory = revenueByCategory.filter(category => {
        // Category filter
        const matchesCategory = revenueFilters.category === '' || category.category === revenueFilters.category;

        // Amount range filter
        const categoryAmount = parseFloat(category.amount && typeof category.amount === 'string' ? category.amount.replace(/[$,]/g, '') : '0');
        const matchesAmountMin = revenueFilters.amountMin === '' || categoryAmount >= parseFloat(revenueFilters.amountMin);
        const matchesAmountMax = revenueFilters.amountMax === '' || categoryAmount <= parseFloat(revenueFilters.amountMax);

        return matchesCategory && matchesAmountMin && matchesAmountMax;
    });

    const filteredRecentTransactions = recentTransactions.filter(transaction => {
        // Date range filter
        const transactionDate = new Date(transaction.date);
        const matchesDateFrom = revenueFilters.dateFrom === '' || transactionDate >= new Date(revenueFilters.dateFrom);
        const matchesDateTo = revenueFilters.dateTo === '' || transactionDate <= new Date(revenueFilters.dateTo);

        // Amount range filter
        const transactionAmount = parseFloat(transaction.amount.toString().replace(/[$,]/g, ''));
        const matchesAmountMin = revenueFilters.amountMin === '' || transactionAmount >= parseFloat(revenueFilters.amountMin);
        const matchesAmountMax = revenueFilters.amountMax === '' || transactionAmount <= parseFloat(revenueFilters.amountMax);

        return matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    });

    // Add Client Handlers
    const handleAddClient = () => {
        setShowAddClientModal(true);
    };

    const handleCloseAddClientModal = () => {
        setShowAddClientModal(false);
        resetNewClientForm();
    };

    const resetNewClientForm = () => {
        setNewClient({
            name: '',
            email: '',
            phone: '+91 ',
            company: '',
            role: '',
            status: 'Active',
            address: '',
            notes: '',
            password: ''
        });
    };

    const handleNewClientChange = (field, value) => {
        setNewClient(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Delete user handler
    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setDeleteConfirm(true);
    };

    // Handle delete client
    const handleDeleteClient = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            // Remove from local state
            setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
            setSelectedUsers(prev => prev.filter(id => id !== userToDelete.id));
            setDeleteConfirm(false);
            setUserToDelete(null);
            setDeleteSuccess(true);
            setTimeout(() => setDeleteSuccess(false), 3000);
        } catch (error) {
            console.error('Error deleting user:', error);
            // Show error notification
            setDeleteConfirm(false);
            setUserToDelete(null);
            // You might want to add an error state here
        }
    };

    // View user handler
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowViewUserModal(true);
    };

    // Edit user handler
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditUserModal(true);
    };

    // Close view modal
    const handleCloseViewModal = () => {
        setShowViewUserModal(false);
        setSelectedUser(null);
    };

    // Close edit modal
    const handleCloseEditModal = () => {
        setShowEditUserModal(false);
        setSelectedUser(null);
    };

    // Save edited user
    const handleSaveEditedUser = async () => {
        // Refetch users data after successful edit
        await fetchUsersData();
        handleCloseEditModal();
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
    };

    // Service Management Handlers
    const toggleServiceStatus = (serviceId) => {
        setServices(services.map(service =>
            service.id === serviceId
                ? { ...service, status: service.status === 'Active' ? 'Inactive' : 'Active' }
                : service
        ));
    };

    const sidebarItems = [
        { name: 'Dashboard', icon: BarChart3 },
        { name: 'Client Management', icon: Users },
        { name: 'Booking Analytics', icon: BookOpen },
        { name: 'Revenue Dashboard', icon: DollarSign },
        { name: 'Profile', icon: User },
    ];

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'activity', label: 'Activity', icon: Activity }
    ];

    // These will be populated from API responses
    const [recentActivities, setRecentActivities] = useState([]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-50 border-green-200';
            case 'modified': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'created': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'alert': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Add Client Modal Component
    const AddClientModal = () => {
        const [localClient, setLocalClient] = useState(newClient);
        const [errors, setErrors] = useState({});
        const [showPassword, setShowPassword] = useState(false);

        // Sync with parent state when modal opens
        React.useEffect(() => {
            setLocalClient(newClient);
        }, [newClient]);

        const handleLocalChange = (field, value) => {
            if (field === 'phone') {
                // Enforce +91 prefix and allow only 10 digits after space
                if (value.startsWith('+91 ')) {
                    const digits = value.slice(4).replace(/\D/g, ''); // Remove non-digits after +91
                    if (digits.length <= 10) {
                        value = '+91 ' + digits;
                    } else {
                        value = '+91 ' + digits.slice(0, 10);
                    }
                } else {
                    value = '+91 ';
                }
            }
            setLocalClient(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleSave = async () => {
            // Reset errors
            setErrors({});

            const newErrors = {};

            // Check required fields
            if (!localClient.name.trim()) {
                newErrors.name = 'Full name is required';
            }
            if (!localClient.email.trim()) {
                newErrors.email = 'Email address is required';
            } else {
                // Email validation - must be Gmail
                const emailRegex = /^[^\s@]+@gmail\.com$/;
                if (!emailRegex.test(localClient.email)) {
                    newErrors.email = 'Please enter a valid Gmail address (@gmail.com)';
                }
            }
            if (localClient.phone === '+91 ' || localClient.phone.length < 7) {
                newErrors.phone = 'Phone number is required';
            }
            if (!localClient.company.trim()) {
                newErrors.company = 'Company is required';
            }
            if (!localClient.role.trim()) {
                newErrors.role = 'Role is required';
            }
            if (!localClient.status.trim()) {
                newErrors.status = 'Status is required';
            }
            if (!localClient.address.trim()) {
                newErrors.address = 'Address is required';
            }
            if (!localClient.password.trim()) {
                newErrors.password = 'Password is required';
            }

            // If there are errors, set them and return
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            try {
                // Call API to create user
                const headers = getAuthHeaders();
                const [firstName, ...lastNameParts] = localClient.name.trim().split(' ');
                const lastName = lastNameParts.join(' ');

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: localClient.email.split('@')[0], // Use email prefix as username
                        email: localClient.email,
                        password: localClient.password,
                        firstName: firstName,
                        lastName: lastName,
                        role: 'CLIENT',
                        company: localClient.company,
                        mobile: localClient.phone.replace('+91 ', ''),
                        address: localClient.address,
                        bio: localClient.notes
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create client');
                }

                const data = await response.json();
                const newUser = data.data.user;

                // Create client object for frontend display
                const newClientObj = {
                    id: newUser.id,
                    name: `${newUser.firstName} ${newUser.lastName}`,
                    email: newUser.email,
                    role: newUser.role,
                    status: 'Active', // Default status
                    joinDate: new Date(newUser.createdAt).toISOString().split('T')[0],
                    lastLogin: 'Just now',
                    clientNo: newUser.clientNo || 0,
                    revenue: `$${newUser.revenue || 0}`,
                    company: newUser.company,
                    phone: `+91 ${newUser.mobile}`,
                    address: newUser.address || '',
                    notes: newUser.bio || ''
                };

                // Add to users array
                setUsers(prev => [newClientObj, ...prev]);

                // Close modal and reset form
                handleCloseAddClientModal();

                // Show success notification
                setClientSuccess(true);
                setTimeout(() => setClientSuccess(false), 3000);
            } catch (error) {
                console.error('Error creating client:', error);
                setErrors({ general: error.message || 'Failed to create client' });
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Add New Client</h3>
                                <p className="text-gray-600 mt-1">Fill in the details to add a new client to the system</p>
                            </div>
                            <button
                                onClick={handleCloseAddClientModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User size={16} className="text-rose-500" />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={localClient.name}
                                        onChange={(e) => handleLocalChange('name', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="Enter client name"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail size={16} className="text-rose-500" />
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={localClient.email}
                                        onChange={(e) => handleLocalChange('email', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="client@example.com"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Phone size={16} className="text-rose-500" />
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={localClient.phone}
                                        onChange={(e) => handleLocalChange('phone', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="+91 1234567890"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Building size={16} className="text-rose-500" />
                                        Company *
                                    </label>
                                    <input
                                        type="text"
                                        value={localClient.company}
                                        onChange={(e) => handleLocalChange('company', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.company ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="Company name"
                                    />
                                    {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Key size={16} className="text-rose-500" />
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={localClient.password}
                                            onChange={(e) => handleLocalChange('password', e.target.value)}
                                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                            </div>

                            {/* Role & Status */}
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                                    <select
                                        value={localClient.role}
                                        onChange={(e) => handleLocalChange('role', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 cursor-pointer transition-all duration-300 ${errors.role ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="Client">Client</option>
                                        <option value="VIP Client">VIP Client</option>
                                        <option value="Enterprise">Enterprise</option>
                                        <option value="Partner">Partner</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleLocalChange('status', 'Active')}
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${localClient.status === 'Active'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${localClient.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                Active
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleLocalChange('status', 'Inactive')}
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${localClient.status === 'Inactive'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${localClient.status === 'Inactive' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                                Inactive
                                            </div>
                                        </button>
                                    </div>
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-rose-500" />
                                        Address *
                                    </label>
                                    <textarea
                                        value={localClient.address}
                                        onChange={(e) => handleLocalChange('address', e.target.value)}
                                        rows="3"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="Enter client address"
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                    <textarea
                                        value={localClient.notes}
                                        onChange={(e) => handleLocalChange('notes', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                        placeholder="Additional notes about the client..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Client Preview */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                            <h4 className="text-sm font-semibold text-rose-700 mb-3">Client Preview</h4>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {localClient.name ? localClient.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CN'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {localClient.name || 'Client Name'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {localClient.email || 'email@example.com'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${localClient.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {localClient.status || 'Active'}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {localClient.role || 'Client'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Fields marked with * are required
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleCloseAddClientModal}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={18} />
                                        Add Client
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // View User Modal Component
    const ViewUserModal = () => {
        if (!selectedUser) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                                <p className="text-gray-600 mt-1">View complete information about this user</p>
                            </div>
                            <button
                                onClick={handleCloseViewModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* User Profile Header */}
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                {selectedUser?.name ? selectedUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900">{selectedUser?.name || 'Unknown User'}</h4>
                                <p className="text-gray-600">{selectedUser?.email || 'No email'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUser.role === 'Admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : selectedUser.role === 'Manager'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedUser.role}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUser.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedUser.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                    <p className="text-gray-900">{selectedUser.name}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <p className="text-gray-900">{selectedUser.email}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                    <p className="text-gray-900">{selectedUser.role}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <p className="text-gray-900">{selectedUser.status}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                                    <p className="text-gray-900">{selectedUser.company}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                    <p className="text-gray-900">{selectedUser.phone}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Join Date</label>
                                    <p className="text-gray-900">{selectedUser.joinDate}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Login</label>
                                    <p className="text-gray-900">{selectedUser.lastLogin}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Client No</label>
                                    <p className="text-gray-900">{selectedUser.clientNo}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue</label>
                                    <p className="text-rose-600 font-semibold">{selectedUser.revenue}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                    <p className="text-gray-900">••••••••</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={handleCloseViewModal}
                                className="px-6 py-3 border-2 border-gray-300 bg-gradient-to-r from-rose-500 to-pink-600  text-white rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Edit User Modal Component
    const EditUserModal = () => {
        const [editedUser, setEditedUser] = useState(selectedUser || {});
        const [errors, setErrors] = useState({});
        const [showPassword, setShowPassword] = useState(false);

        React.useEffect(() => {
            if (selectedUser) {
                setEditedUser({ ...selectedUser });
            }
        }, [selectedUser]);

        const handleEditChange = (field, value) => {
            if (field === 'phone') {
                // Enforce +91 prefix and allow only 10 digits after space
                if (value.startsWith('+91 ')) {
                    const digits = value.slice(4).replace(/\D/g, ''); // Remove non-digits after +91
                    if (digits.length <= 10) {
                        value = '+91 ' + digits;
                    } else {
                        value = '+91 ' + digits.slice(0, 10);
                    }
                } else {
                    value = '+91 ';
                }
            }
            setEditedUser(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleSave = async () => {
            // Reset errors
            setErrors({});

            const newErrors = {};

            // Check required fields
            if (!editedUser?.name?.trim()) {
                newErrors.name = 'Full name is required';
            }
            if (!editedUser?.email?.trim()) {
                newErrors.email = 'Email address is required';
            } else {
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(editedUser.email)) {
                    newErrors.email = 'Please enter a valid email address';
                }
            }
            if (!editedUser?.role?.trim()) {
                newErrors.role = 'Role is required';
            }
            if (!editedUser?.status?.trim()) {
                newErrors.status = 'Status is required';
            }

            // If there are errors, set them and return
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            try {
                // Call API to update user
                const headers = getAuthHeaders();
                const [firstName, ...lastNameParts] = editedUser.name.trim().split(' ');
                const lastName = lastNameParts.join(' ');

                const updateData = {
                    username: selectedUser.username, // Include username for validation
                    firstName: firstName,
                    lastName: lastName,
                    email: editedUser.email,
                    role: editedUser.role.toUpperCase(),
                    company: editedUser.company || '',
                    mobile: editedUser.phone ? editedUser.phone.replace('+91 ', '') : '',
                    clientNo: editedUser.clientNo,
                    revenue: editedUser.revenue ? parseFloat(editedUser.revenue.replace(/[$,]/g, '')) : undefined,
                    isActive: editedUser.status === 'Active'
                };

                // Only include password if it's not empty
                if (editedUser.password && editedUser.password.trim()) {
                    updateData.password = editedUser.password;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update user');
                }

                const data = await response.json();
                const updatedUser = data.data.user;

                // Close the modal and show success
                handleCloseEditModal();
                setEditSuccess(true);
                setTimeout(() => setEditSuccess(false), 3000);

                // Refetch users data to ensure changes are reflected
                await fetchUsersData();
            } catch (error) {
                console.error('Error updating user:', error);
                setErrors({ general: error.message || 'Failed to update user' });
            }
        };

        if (!selectedUser) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
                                <p className="text-gray-600 mt-1">Update user information and settings</p>
                            </div>
                            <button
                                onClick={handleCloseEditModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User size={16} className="text-rose-500" />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editedUser.name || ''}
                                        onChange={(e) => handleEditChange('name', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail size={16} className="text-rose-500" />
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={editedUser.email || ''}
                                        onChange={(e) => handleEditChange('email', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition-all duration-300 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                        placeholder="user@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Phone size={16} className="text-rose-500" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={editedUser.phone || '+91 '}
                                        onChange={(e) => handleEditChange('phone', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                        placeholder="+91 1234567890"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                                    <select
                                        value={editedUser.role || ''}
                                        onChange={(e) => handleEditChange('role', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-200 cursor-pointer transition-all duration-300 ${errors.role ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-rose-500'}`}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Client">Client</option>
                                        <option value="User">User</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditChange('status', 'Active')}
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editedUser.status === 'Active'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${editedUser.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                Active
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleEditChange('status', 'Inactive')}
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editedUser.status === 'Inactive'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${editedUser.status === 'Inactive' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                                Inactive
                                            </div>
                                        </button>
                                    </div>
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Client No</label>
                                    <input
                                        type="number"
                                        value={editedUser.clientNo || ''}
                                        onChange={(e) => handleEditChange('clientNo', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                        placeholder="Number of clients"
                                        min="0"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Key size={16} className="text-rose-500" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={editedUser.password || ''}
                                            onChange={(e) => handleEditChange('password', e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue</label>
                                    <input
                                        type="text"
                                        value={editedUser.revenue || ''}
                                        onChange={(e) => handleEditChange('revenue', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                        placeholder="$0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Fields marked with * are required
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Save size={18} />
                                        Save Changes
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // User Filter Modal Component
    const UserFilterModal = () => {
        const [localFilters, setLocalFilters] = useState(userFilters);

        const handleLocalFilterChange = (field, value) => {
            setLocalFilters(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleApplyFilters = () => {
            setUserFilters(localFilters);
            setShowUserFilterModal(false);
        };

        const handleClearFilters = () => {
            const clearedFilters = {
                role: '',
                status: '',
                joinDateFrom: '',
                joinDateTo: '',
                revenueMin: '',
                revenueMax: ''
            };
            setLocalFilters(clearedFilters);
            setUserFilters(clearedFilters);
            setShowUserFilterModal(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Filter Users</h3>
                                <p className="text-gray-600 mt-1">Apply filters to narrow down the user list</p>
                            </div>
                            <button
                                onClick={() => setShowUserFilterModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Role Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <User size={16} className="text-rose-500" />
                                    Role
                                </label>
                                <select
                                    value={localFilters.role}
                                    onChange={(e) => handleLocalFilterChange('role', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                >
                                    <option value="">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Support">Support</option>
                                    <option value="Client">Client</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-rose-500" />
                                    Status
                                </label>
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => handleLocalFilterChange('status', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Join Date Range */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Calendar size={16} className="text-rose-500" />
                                    Join Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={localFilters.joinDateFrom}
                                            onChange={(e) => handleLocalFilterChange('joinDateFrom', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={localFilters.joinDateTo}
                                            onChange={(e) => handleLocalFilterChange('joinDateTo', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Range */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-rose-500" />
                                    Revenue Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
                                        <input
                                            type="number"
                                            value={localFilters.revenueMin}
                                            onChange={(e) => handleLocalFilterChange('revenueMin', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                        <input
                                            type="number"
                                            value={localFilters.revenueMax}
                                            onChange={(e) => handleLocalFilterChange('revenueMax', e.target.value)}
                                            placeholder="No limit"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Clear All
                            </button>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowUserFilterModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Booking Filter Modal Component
    const BookingFilterModal = () => {
        const [localFilters, setLocalFilters] = useState(bookingFilters);

        const handleLocalFilterChange = (field, value) => {
            setLocalFilters(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleApplyFilters = () => {
            setBookingFilters(localFilters);
            setShowBookingFilterModal(false);
        };

        const handleClearFilters = () => {
            const clearedFilters = {
                dateFrom: '',
                dateTo: '',
                status: '',
                serviceType: '',
                amountMin: '',
                amountMax: ''
            };
            setLocalFilters(clearedFilters);
            setBookingFilters(clearedFilters);
            setShowBookingFilterModal(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Filter Bookings</h3>
                                <p className="text-gray-600 mt-1">Apply filters to narrow down the booking list</p>
                            </div>
                            <button
                                onClick={() => setShowBookingFilterModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Date Range Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Calendar size={16} className="text-rose-500" />
                                    Booking Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={localFilters.dateFrom}
                                            onChange={(e) => handleLocalFilterChange('dateFrom', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={localFilters.dateTo}
                                            onChange={(e) => handleLocalFilterChange('dateTo', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-rose-500" />
                                    Booking Status
                                </label>
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => handleLocalFilterChange('status', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Service Type Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <BookOpen size={16} className="text-rose-500" />
                                    Service Type
                                </label>
                                <select
                                    value={localFilters.serviceType}
                                    onChange={(e) => handleLocalFilterChange('serviceType', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                >
                                    <option value="">All Services</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile App Development">Mobile App Development</option>
                                    <option value="UI/UX Design">UI/UX Design</option>
                                    <option value="Consultation">Consultation</option>
                                    <option value="Digital Marketing">Digital Marketing</option>
                                </select>
                            </div>

                            {/* Amount Range */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-rose-500" />
                                    Amount Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
                                        <input
                                            type="number"
                                            value={localFilters.amountMin}
                                            onChange={(e) => handleLocalFilterChange('amountMin', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                        <input
                                            type="number"
                                            value={localFilters.amountMax}
                                            onChange={(e) => handleLocalFilterChange('amountMax', e.target.value)}
                                            placeholder="No limit"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Clear All
                            </button>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowBookingFilterModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Revenue Filter Modal Component
    const RevenueFilterModal = () => {
        const [localFilters, setLocalFilters] = useState(revenueFilters);

        const handleLocalFilterChange = (field, value) => {
            setLocalFilters(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleApplyFilters = () => {
            setRevenueFilters(localFilters);
            setShowRevenueFilterModal(false);
        };

        const handleClearFilters = () => {
            const clearedFilters = {
                dateFrom: '',
                dateTo: '',
                category: '',
                amountMin: '',
                amountMax: ''
            };
            setLocalFilters(clearedFilters);
            setRevenueFilters(clearedFilters);
            setShowRevenueFilterModal(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Filter Revenue</h3>
                                <p className="text-gray-600 mt-1">Apply filters to narrow down the revenue data</p>
                            </div>
                            <button
                                onClick={() => setShowRevenueFilterModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Date Range Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Calendar size={16} className="text-rose-500" />
                                    Transaction Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={localFilters.dateFrom}
                                            onChange={(e) => handleLocalFilterChange('dateFrom', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={localFilters.dateTo}
                                            onChange={(e) => handleLocalFilterChange('dateTo', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-rose-500" />
                                    Revenue Category
                                </label>
                                <select
                                    value={localFilters.category}
                                    onChange={(e) => handleLocalFilterChange('category', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                >
                                    <option value="">All Categories</option>
                                    <option value="Premium Services">Premium Services</option>
                                    <option value="Consultation">Consultation</option>
                                    <option value="Basic Services">Basic Services</option>
                                    <option value="Add-ons">Add-ons</option>
                                </select>
                            </div>

                            {/* Amount Range */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-rose-500" />
                                    Amount Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
                                        <input
                                            type="number"
                                            value={localFilters.amountMin}
                                            onChange={(e) => handleLocalFilterChange('amountMin', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                        <input
                                            type="number"
                                            value={localFilters.amountMax}
                                            onChange={(e) => handleLocalFilterChange('amountMax', e.target.value)}
                                            placeholder="No limit"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Clear All
                            </button>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowRevenueFilterModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // System Details Modal Component
    const SystemDetailsModal = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">System Details</h3>
                                <p className="text-gray-600 mt-1">Comprehensive system performance and metrics overview</p>
                            </div>
                            <button
                                onClick={() => setShowSystemDetailsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* System Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {[
                                { label: 'Total Users', value: systemMetrics.totalUsers, icon: UsersIcon, color: 'bg-blue-500', description: 'Registered users in the system' },
                                { label: 'Active Users', value: systemMetrics.activeUsers, icon: Users, color: 'bg-green-500', description: 'Currently active users' },
                                { label: 'Active Services', value: systemMetrics.activeServices, icon: FolderOpen, color: 'bg-purple-500', description: 'Services currently running' },
                                { label: 'New Users', value: systemMetrics.newUsers, icon: UserPlus, color: 'bg-rose-500', description: 'New registrations this period' },
                                { label: 'Storage Used', value: systemMetrics.storageUsed, icon: Download, color: 'bg-amber-500', description: 'Current storage utilization' },
                                { label: 'Server Uptime', value: systemMetrics.serverUptime, icon: CheckCircle, color: 'bg-emerald-500', description: 'System availability percentage' },
                                { label: 'Response Time', value: systemMetrics.responseTime, icon: Clock, color: 'bg-cyan-500', description: 'Average response time' },
                                { label: 'Total Bookings', value: bookingData.totalBookings.toLocaleString(), icon: BookOpen, color: 'bg-indigo-500', description: 'Total booking transactions' },
                                { label: 'Total Revenue', value: `$${revenueMetrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-teal-500', description: 'Total revenue generated' }
                            ].map((metric, index) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center text-white`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Performance Overview */}
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 size={20} className="text-rose-500" />
                                Performance Overview
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                        <div>
                                            <p className="text-sm text-gray-600">Conversion Rate</p>
                                            <p className="text-lg font-bold text-gray-900">3.2%</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-green-600 text-sm">
                                                <TrendingUp size={14} />
                                                +0.4%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                        <div>
                                            <p className="text-sm text-gray-600">Avg Session Duration</p>
                                            <p className="text-lg font-bold text-gray-900">4m 12s</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-green-600 text-sm">
                                                <TrendingUp size={14} />
                                                +23s
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                        <div>
                                            <p className="text-sm text-gray-600">Bounce Rate</p>
                                            <p className="text-lg font-bold text-gray-900">42%</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-green-600 text-sm">
                                                <TrendingDown size={14} />
                                                -3.2%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                        <div>
                                            <p className="text-sm text-gray-600">Customer Satisfaction</p>
                                            <p className="text-lg font-bold text-gray-900">4.8/5</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-green-600 text-sm">
                                                <TrendingUp size={14} />
                                                +0.2
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => setShowSystemDetailsModal(false)}
                                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // All Activities Modal Component
    const AllActivitiesModal = () => {
        // State for filtering and pagination
        const [filterStatus, setFilterStatus] = useState('all');
        const [searchTerm, setSearchTerm] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const activitiesPerPage = 5;

        // Filter activities based on status and search term
        const filteredActivities = recentActivities.filter(activity => {
            const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
            const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.time.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        // Calculate pagination
        const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
        const startIndex = (currentPage - 1) * activitiesPerPage;
        const paginatedActivities = filteredActivities.slice(startIndex, startIndex + activitiesPerPage);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">All Activities</h3>
                                <p className="text-gray-600 mt-1">Complete activity log and system events</p>
                            </div>
                            <button
                                onClick={() => setShowAllActivitiesModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* Filters and Search */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="all">All Activities</option>
                                    <option value="success">Success</option>
                                    <option value="modified">Modified</option>
                                    <option value="created">Created</option>
                                    <option value="alert">Alerts</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm font-medium text-gray-700">Search:</span>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search activities..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-4 mb-6">
                            {paginatedActivities.map((activity) => {
                                const ActivityIcon = iconMap[activity.icon] || CheckCircle;
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                <ActivityIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 group-hover:text-rose-700">{activity.action}</p>
                                                <p className="text-sm text-gray-600">{activity.time}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">ID: #{activity.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setSelectedActivity(activity);
                                                    setShowActivityDetailModal(true);
                                                }}
                                                className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} to {Math.min(startIndex + activitiesPerPage, filteredActivities.length)} of {filteredActivities.length} activities
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-2 text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* No Results Message */}
                        {filteredActivities.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search size={48} className="mx-auto" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No activities found</p>
                                <p className="text-gray-400 mt-2">Try changing your search or filter criteria</p>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Total activities: {recentActivities.length}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowAllActivitiesModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Download size={18} className="inline mr-2" />
                                    Export Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Revenue Details Modal Component
    const RevenueDetailsModal = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Revenue Details</h3>
                                <p className="text-gray-600 mt-1">Detailed breakdown of revenue by category</p>
                            </div>
                            <button
                                onClick={() => setShowRevenueDetailsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* Revenue Breakdown */}
                        <div className="space-y-6">
                            {revenueByCategory.map((category, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-2xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                                                {category.percentage}%
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-800">{category.category}</h4>
                                                <p className="text-gray-600">Revenue breakdown and growth metrics</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-rose-600">${category.amount.toLocaleString()}</p>
                                            <div className={`flex items-center gap-1 text-sm font-medium ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {category.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {category.growth}% growth
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-sm text-gray-600">Monthly Average</p>
                                            <p className="text-lg font-bold text-gray-900">${Math.round(category.amount / 12).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-sm text-gray-600">Top Service</p>
                                            <p className="text-lg font-bold text-gray-900">Premium Support</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-sm text-gray-600">Client Count</p>
                                            <p className="text-lg font-bold text-gray-900">{Math.round(category.amount / 1000)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="mt-8 bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Revenue Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-rose-600">${revenueMetrics.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Growth Rate</p>
                                    <p className="text-2xl font-bold text-green-600">+{revenueMetrics.growthPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => setShowRevenueDetailsModal(false)}
                                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // All Transactions Modal Component
    const AllTransactionsModal = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">All Transactions</h3>
                                <p className="text-gray-600 mt-1">Complete list of all revenue transactions</p>
                            </div>
                            <button
                                onClick={() => setShowAllTransactionsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* Filters */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm cursor-pointer">
                                    <option value="all">All Transactions</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Date Range:</span>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-gray-800">Transaction History</h4>
                                    <span className="text-sm text-gray-600">{filteredRecentTransactions.length} transactions found</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredRecentTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {transaction.avatar}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">{transaction.client}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{transaction.service}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-rose-600">${transaction.amount}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.status === 'pending'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                                        <ViewIcon size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-600">
                                Showing 1 to {filteredRecentTransactions.length} of {filteredRecentTransactions.length} transactions
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    Previous
                                </button>
                                <button className="px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors cursor-pointer">
                                    1
                                </button>
                                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Total: ${filteredRecentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowAllTransactionsModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Download size={18} className="inline mr-2" />
                                    Export Transactions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // PDF Export Functions
    const exportBookingAnalyticsToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(219, 39, 119); // Rose color
        doc.text('Booking Analytics Report', 20, 30);

        // Generated date
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

        // Key Metrics
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39); // Dark gray
        doc.text('Key Metrics', 20, 65);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81); // Medium gray
        let yPos = 80;
        doc.text(`Total Bookings: ${bookingData.totalBookings.toLocaleString()}`, 20, yPos);
        doc.text(`Completed Bookings: ${bookingData.completedBookings.toLocaleString()}`, 20, yPos + 10);
        doc.text(`Pending Bookings: ${bookingData.pendingBookings}`, 20, yPos + 20);
        doc.text(`Cancelled Bookings: ${bookingData.cancelledBookings}`, 20, yPos + 30);
        doc.text(`Completion Rate: ${bookingData.bookingRate}%`, 20, yPos + 40);

        // Popular Services
        yPos += 60;
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text('Popular Services', 20, yPos);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        yPos += 15;
        filteredPopularServices.forEach((service, index) => {
            doc.text(`${index + 1}. ${service.service}: ${service.bookings} bookings - $${service.revenue.toLocaleString()}`, 20, yPos);
            yPos += 10;
        });

        // Performance Metrics
        yPos += 20;
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text('Performance Metrics', 20, yPos);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        yPos += 15;
        const metrics = [
            { label: 'Conversion Rate', value: '8.5%', change: '+1.2%' },
            { label: 'Avg Booking Value', value: '$156', change: '+$12' },
            { label: 'Repeat Bookings', value: '42%', change: '+3.5%' },
            { label: 'Cancellation Rate', value: '6.1%', change: '-0.8%' }
        ];

        metrics.forEach((metric) => {
            doc.text(`${metric.label}: ${metric.value} (${metric.change})`, 20, yPos);
            yPos += 10;
        });

        // Save the PDF
        doc.save('booking-analytics-report.pdf');
    };

    const exportRevenueDashboardToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(219, 39, 119); // Rose color
        doc.text('Revenue Dashboard Report', 20, 30);

        // Generated date
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

        // Key Metrics
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39); // Dark gray
        doc.text('Key Metrics', 20, 65);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81); // Medium gray
        let yPos = 80;
        doc.text(`Total Revenue: $${revenueMetrics.totalRevenue.toLocaleString()}`, 20, yPos);
        doc.text(`Monthly Revenue: $${revenueMetrics.monthlyRevenue.toLocaleString()}`, 20, yPos + 10);
        doc.text(`Growth: +${revenueMetrics.growthPercentage}%`, 20, yPos + 20);
        doc.text(`Active Subscriptions: ${revenueMetrics.activeSubscriptions.toLocaleString()}`, 20, yPos + 30);
        doc.text(`Average Order Value: $${revenueMetrics.averageOrderValue}`, 20, yPos + 40);
        doc.text(`New Customers: ${revenueMetrics.newCustomers}`, 20, yPos + 50);

        // Revenue by Category
        yPos += 70;
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text('Revenue by Category', 20, yPos);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        yPos += 15;
        filteredRevenueByCategory.forEach((category) => {
            doc.text(`${category.category}: $${category.amount.toLocaleString()} (${category.percentage}%) - Growth: ${category.growth}%`, 20, yPos);
            yPos += 10;
        });

        // Recent Transactions
        yPos += 20;
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text('Recent Transactions', 20, yPos);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        yPos += 15;
        filteredRecentTransactions.slice(0, 10).forEach((transaction) => {
            doc.text(`${transaction.client} - ${transaction.service}: $${transaction.amount} (${transaction.date})`, 20, yPos);
            yPos += 10;
        });

        // Save the PDF
        doc.save('revenue-dashboard-report.pdf');
    };

    // Building icon component
    const Building = ({ size, className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <path d="M9 22v-4h6v4"></path>
            <path d="M8 6h.01"></path>
            <path d="M16 6h.01"></path>
            <path d="M12 6h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M16 10h.01"></path>
            <path d="M16 14h.01"></path>
            <path d="M8 10h.01"></path>
            <path d="M8 14h.01"></path>
        </svg>
    );

    const renderContent = () => {
        switch (activeItem) {
            case 'Dashboard':
                // Show loading state
                if (loading) {
                    return (
                        <div className="p-8 animate-fadeIn flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading dashboard data...</p>
                            </div>
                        </div>
                    );
                }

                // Show error state
                if (error) {
                    return (
                        <div className="p-8 animate-fadeIn">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <div className="text-red-600 mb-4">
                                    <XCircle size={48} className="mx-auto" />
                                </div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Admin Dashboard
                                </h2>
                                <p className="text-gray-600 text-lg">System overview and performance metrics</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                    {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer transform hover:scale-105 ${timeRange === range
                                                ? 'bg-rose-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-rose-600'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                {
                                    title: 'Total Revenue',
                                    value: `$${revenueMetrics.totalRevenue.toLocaleString()}`,
                                    change: `+${revenueMetrics.growthPercentage}%`,
                                    positive: true,
                                    icon: DollarSign,
                                    gradient: 'from-green-500 to-emerald-600',
                                    delay: 0
                                },
                                {
                                    title: 'Active Users',
                                    value: systemMetrics.activeUsers,
                                    change: '+8.2%',
                                    positive: true,
                                    icon: Users,
                                    gradient: 'from-blue-500 to-cyan-600',
                                    delay: 100
                                },
                                {
                                    title: 'Total Bookings',
                                    value: bookingData.totalBookings.toLocaleString(),
                                    change: '+12.7%',
                                    positive: true,
                                    icon: BookOpen,
                                    gradient: 'from-purple-500 to-violet-600',
                                    delay: 200
                                },
                                {
                                    title: 'Server Uptime',
                                    value: systemMetrics.serverUptime,
                                    change: '+0.1%',
                                    positive: true,
                                    icon: CheckCircle,
                                    gradient: 'from-amber-500 to-orange-600',
                                    delay: 300
                                }
                            ].map((metric, index) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`bg-gradient-to-br ${metric.gradient} p-6 rounded-2xl shadow-lg text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slideIn`}
                                        style={{ animationDelay: `${metric.delay}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/80 text-sm font-medium mb-1">{metric.title}</p>
                                                <p className="text-2xl font-bold mb-2">{metric.value}</p>
                                                <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-300' : 'text-red-300'}`}>
                                                    {metric.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    <span>{metric.change}</span>
                                                    <span className="text-white/70">from last month</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                <Icon size={24} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts and Performance Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                            {/* Revenue Trend Chart */}
                            <div className={`xl:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isFullScreen ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl' : ''}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Revenue Trend</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 bg-rose-600 rounded-full"></div>
                                            Revenue
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowChartMenu(!showChartMenu)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {/* Chart Menu Dropdown */}
                                            {showChartMenu && (
                                                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-dropdown">
                                                    <div className="px-4 py-2 border-b border-gray-100">
                                                        <p className="text-sm font-semibold text-gray-800">Chart Options</p>
                                                    </div>

                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => setChartType('area')}
                                                            className={`w-full flex items-center px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 transition-colors ${chartType === 'area' ? 'text-rose-600 bg-pink-50' : 'text-gray-700'}`}
                                                        >
                                                            <Activity size={16} className="mr-3" />
                                                            Area Chart
                                                        </button>
                                                    </div>

                                                    <div className="border-t border-gray-100 py-1">
                                                        <button
                                                            onClick={() => {
                                                                setIsFullScreen(!isFullScreen);
                                                                setShowChartMenu(false);
                                                            }}
                                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        >
                                                            <Eye size={16} className="mr-3" />
                                                            {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64 relative">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="border-t border-gray-100"></div>
                                        ))}
                                    </div>

                                    {chartType === 'bar' ? (
                                        // Bar Chart
                                        <div className="h-full flex items-end justify-between space-x-2">
                                            {(() => {
                                                const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue));
                                                const safeMaxRevenue = maxRevenue > 0 ? maxRevenue : 1; // Prevent division by zero
                                                return revenueTrend.map((data, index) => (
                                                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                                                        <div
                                                            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-teal-600 cursor-pointer relative overflow-hidden"
                                                            style={{ height: `${Math.max((data.revenue / safeMaxRevenue) * 100, 5)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2 font-medium">{data.label}</p>
                                                        <p className="text-xs text-gray-500">${data.revenue.toLocaleString()}</p>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    ) : (
                                        // Line/Area Chart
                                        <svg className="w-full h-full" viewBox="0 0 400 256" preserveAspectRatio="none">
                                            {(() => {
                                                const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue));
                                                const safeMaxRevenue = maxRevenue > 0 ? maxRevenue : 1; // Prevent division by zero
                                                const points = revenueTrend.map((data, index) => {
                                                    const x = (index / (revenueTrend.length - 1)) * 400;
                                                    const y = 256 - (data.revenue / safeMaxRevenue) * 200; // Leave some margin at top
                                                    return `${x},${isNaN(y) ? 256 : y}`; // Fallback to bottom if NaN
                                                }).join(' ');

                                                return (
                                                    <>
                                                        {/* Area fill for area chart */}
                                                        {chartType === 'area' && (
                                                            <polygon
                                                                points={`0,256 ${points} 400,256`}
                                                                fill="url(#areaGradient)"
                                                                opacity="0.3"
                                                            />
                                                        )}

                                                        {/* Line */}
                                                        <polyline
                                                            points={points}
                                                            fill="none"
                                                            stroke="#f02450ff"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />

                                                        {/* Data points */}
                                                        {revenueTrend.map((data, index) => {
                                                            const x = (index / (revenueTrend.length - 1)) * 400;
                                                            const y = 256 - (data.revenue / safeMaxRevenue) * 200;
                                                            return (
                                                                <circle
                                                                    key={index}
                                                                    cx={x}
                                                                    cy={isNaN(y) ? 256 : y}
                                                                    r="6"
                                                                    fill="#f02450ff"
                                                                    className="hover:r-8 transition-all cursor-pointer"
                                                                />
                                                            );
                                                        })}

                                                        {/* Gradient definition */}
                                                        <defs>
                                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="#f02450ff" stopOpacity="0.8" />
                                                                <stop offset="100%" stopColor="#f02450ff" stopOpacity="0.1" />
                                                            </linearGradient>
                                                        </defs>
                                                    </>
                                                );
                                            })()}
                                        </svg>
                                    )}

                                    {/* Labels for line/area chart */}
                                    {chartType !== 'bar' && (
                                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                                            {revenueTrend.map((data, index) => (
                                                <div key={index} className="text-center group relative">
                                                    <p className="text-xs text-gray-600 font-medium">{data.label}</p>
                                                    <p className="text-xs text-gray-500">${data.revenue.toLocaleString()}</p>

                                                    {/* Hover Tooltip */}
                                                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10">
                                                        <div className="font-semibold">${data.revenue.toLocaleString()}</div>
                                                        <div className={`flex items-center gap-1 text-xs ${data.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {data.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                            {Math.abs(data.growth)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">System Performance</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Response Time', value: systemMetrics.responseTime, change: '-15ms', positive: true },
                                        { name: 'Active Services', value: systemMetrics.activeServices, change: '+2', positive: true },
                                        { name: 'Storage Used', value: systemMetrics.storageUsed, change: '+0.3GB', positive: false },
                                        { name: 'New Users', value: systemMetrics.newUsers, change: '+12', positive: true }
                                    ].map((metric, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800 group-hover:text-rose-700">{metric.name}</p>
                                                <p className="text-2xl font-bold text-gray-900 group-hover:text-rose-600 mt-1">
                                                    {metric.value}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${metric.positive
                                                ? 'bg-green-100 text-green-700 group-hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 group-hover:bg-red-200'
                                                }`}>
                                                {metric.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {metric.change}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* System Overview and Recent Activities */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* System Overview */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">System Overview</h3>
                                    <button
                                        onClick={handleViewSystemDetails}
                                        className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Total Users', value: systemMetrics.totalUsers, icon: UsersIcon, color: 'bg-blue-500' },
                                        { label: 'Active Services', value: systemMetrics.activeServices, icon: FolderOpen, color: 'bg-green-500' },
                                        { label: 'Total Bookings', value: bookingData.totalBookings, icon: Calendar, color: 'bg-purple-500' },
                                        { label: 'Total Revenue', value: `$${revenueMetrics.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-rose-500' }
                                    ].map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-white`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-rose-700">{item.label}</p>
                                                        <p className="text-2xl font-bold text-gray-900 group-hover:text-rose-600">
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                                        <TrendingUp size={14} />
                                                        +12.5%
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Growth</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
                                    <button
                                        onClick={handleViewAllActivities}
                                        className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.slice(0, 5).map((activity) => {
                                        const ActivityIcon = iconMap[activity.icon] || CheckCircle;
                                        return (
                                            <div
                                                key={activity.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                        <ActivityIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-rose-700">{activity.action}</p>
                                                        <p className="text-sm text-gray-600">{activity.time}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">New Customers</p>
                                        <p className="text-2xl font-bold">{revenueMetrics.newCustomers}</p>
                                        <p className="text-indigo-100 text-xs mt-1">This month</p>
                                    </div>
                                    <UserPlus size={32} className="opacity-80" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-cyan-100 text-sm font-medium">Churn Rate</p>
                                        <p className="text-2xl font-bold">{revenueMetrics.churnRate}%</p>
                                        <p className="text-cyan-100 text-xs mt-1">-0.3% from last month</p>
                                    </div>
                                    <TrendingDown size={32} className="opacity-80" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium">Avg Order Value</p>
                                        <p className="text-2xl font-bold">${revenueMetrics.averageOrderValue}</p>
                                        <p className="text-emerald-100 text-xs mt-1">Per transaction</p>
                                    </div>
                                    <CreditCard size={32} className="opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Client Management':
                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Client Edit Success Notification */}
                        {editSuccess && (
                            <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
                                <CheckCircle size={24} />
                                <div>
                                    <p className="font-semibold">Client Information Updated</p>
                                    <p className="text-sm opacity-90">Your client has been edited and saved successfully.</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Client Management
                                </h2>
                                <p className="text-gray-600">Manage and monitor all user accounts in the system</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search clients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowUserFilterModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Filter size={16} />
                                    Filter
                                </button>
                                <button
                                    onClick={handleAddClient}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Plus size={16} />
                                    Add Client
                                </button>
                            </div>
                        </div>

                        {/* User Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'CLIENT').length}</p>
                                    </div>
                                    <Users className="text-rose-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Active Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'CLIENT' && u.status === 'Active').length}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Admins</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'ADMIN').length}</p>
                                    </div>
                                    <User className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Managers</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'MANAGER').length}</p>
                                    </div>
                                    <User className="text-purple-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{filteredUsers.length} users found</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.length === users.length && users.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Client No</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleUserSelect(user.id)}
                                                        className="rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : (user.email ? user.email[0].toUpperCase() : 'U')}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : user.role === 'Manager'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center align-middle">{user.clientNo}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-rose-600 text-center align-middle">{user.revenue}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewUser(user)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                                            title="View Details"
                                                        >
                                                            <ViewIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="p-1 text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="p-1 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'Booking Analytics':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Booking Analytics
                                </h2>
                                <p className="text-gray-600">Track and analyze booking patterns and trends</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                    {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer transform hover:scale-105 ${timeRange === range
                                                ? 'bg-rose-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-rose-600'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={exportBookingAnalyticsToPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                                >
                                    <Download size={16} />
                                    Export Report
                                </button>
                                <button
                                    onClick={() => setShowBookingFilterModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Filter size={16} />
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Booking Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-rose-100 text-sm font-medium">Total Bookings</p>
                                        <p className="text-2xl font-bold">{bookingData.totalBookings.toLocaleString()}</p>
                                        <p className="text-rose-100 text-xs mt-1">All time</p>
                                    </div>
                                    <BarChart3 size={32} className="opacity-80" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Completed</p>
                                        <p className="text-2xl font-bold">{bookingData.completedBookings.toLocaleString()}</p>
                                        <p className="text-green-100 text-xs mt-1">{bookingData.bookingRate}% rate</p>
                                    </div>
                                    <CheckCircle size={32} className="opacity-80" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Pending</p>
                                        <p className="text-2xl font-bold">{bookingData.pendingBookings}</p>
                                        <p className="text-amber-100 text-xs mt-1">Awaiting confirmation</p>
                                    </div>
                                    <AlertCircle size={32} className="opacity-80" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-100 text-sm font-medium">Cancelled</p>
                                        <p className="text-2xl font-bold">{bookingData.cancelledBookings}</p>
                                        <p className="text-red-100 text-xs mt-1">6.1% cancellation rate</p>
                                    </div>
                                    <XCircle size={32} className="opacity-80" />
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Booking Trend */}
                            <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isBookingFullScreen ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl' : ''}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Booking Trend</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 bg-rose-600 rounded-full"></div>
                                            Bookings
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowBookingChartMenu(!showBookingChartMenu)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {/* Chart Menu Dropdown */}
                                            {showBookingChartMenu && (
                                                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-dropdown">
                                                    <div className="px-4 py-2 border-b border-gray-100">
                                                        <p className="text-sm font-semibold text-gray-800">Chart Options</p>
                                                    </div>

                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => setBookingChartType('area')}
                                                            className={`w-full flex items-center px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 transition-colors ${bookingChartType === 'area' ? 'text-rose-600 bg-pink-50' : 'text-gray-700'}`}
                                                        >
                                                            <Activity size={16} className="mr-3" />
                                                            Area Chart
                                                        </button>
                                                    </div>

                                                    <div className="border-t border-gray-100 py-1">
                                                        <button
                                                            onClick={() => {
                                                                setIsBookingFullScreen(!isBookingFullScreen);
                                                                setShowBookingChartMenu(false);
                                                            }}
                                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        >
                                                            <Eye size={16} className="mr-3" />
                                                            {isBookingFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64 relative">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="border-t border-gray-100"></div>
                                        ))}
                                    </div>

                                    {bookingChartType === 'bar' ? (
                                        // Bar Chart
                                        <div className="h-full flex items-end justify-between space-x-2">
                                            {(() => {
                                                const maxBookings = Math.max(...bookingTrend.map(d => d.bookings));
                                                const safeMaxBookings = maxBookings > 0 ? maxBookings : 1; // Prevent division by zero
                                                return bookingTrend.map((data, index) => (
                                                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                                                        <div
                                                            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-teal-600 cursor-pointer relative overflow-hidden"
                                                            style={{ height: `${Math.max((data.bookings / safeMaxBookings) * 100, 5)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2 font-medium">{data.label}</p>
                                                        <p className="text-xs text-gray-500">{data.bookings}</p>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    ) : (
                                        // Line/Area Chart
                                        <svg className="w-full h-full" viewBox="0 0 400 256" preserveAspectRatio="none">
                                            {(() => {
                                                const maxBookings = Math.max(...bookingTrend.map(d => d.bookings));
                                                const safeMaxBookings = maxBookings > 0 ? maxBookings : 1; // Prevent division by zero
                                                const points = bookingTrend.map((data, index) => {
                                                    const x = (index / (bookingTrend.length - 1)) * 400;
                                                    const y = 256 - (data.bookings / safeMaxBookings) * 200; // Leave some margin at top
                                                    return `${x},${isNaN(y) ? 256 : y}`;
                                                }).join(' ');

                                                return (
                                                    <>
                                                        {/* Area fill for area chart */}
                                                        {bookingChartType === 'area' && (
                                                            <polygon
                                                                points={`0,256 ${points} 400,256`}
                                                                fill="url(#bookingAreaGradient)"
                                                                opacity="0.3"
                                                            />
                                                        )}

                                                        {/* Line */}
                                                        <polyline
                                                            points={points}
                                                            fill="none"
                                                            stroke="#f02450ff"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />

                                                        {/* Data points */}
                                                        {bookingTrend.map((data, index) => {
                                                            const x = (index / (bookingTrend.length - 1)) * 400;
                                                            const y = 256 - (data.bookings / safeMaxBookings) * 200;
                                                            return (
                                                                <circle
                                                                    key={index}
                                                                    cx={x}
                                                                    cy={isNaN(y) ? 256 : y}
                                                                    r="6"
                                                                    fill="#f02450ff"
                                                                    className="hover:r-8 transition-all cursor-pointer"
                                                                />
                                                            );
                                                        })}

                                                        {/* Gradient definition */}
                                                        <defs>
                                                            <linearGradient id="bookingAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="#f02450ff" stopOpacity="0.8" />
                                                                <stop offset="100%" stopColor="#f02450ff" stopOpacity="0.1" />
                                                            </linearGradient>
                                                        </defs>
                                                    </>
                                                );
                                            })()}
                                        </svg>
                                    )}

                                    {/* Labels for line/area chart */}
                                    {bookingChartType !== 'bar' && (
                                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                                            {bookingTrend.map((data, index) => (
                                                <div key={index} className="text-center group relative">
                                                    <p className="text-xs text-gray-600 font-medium">{data.label}</p>
                                                    <p className="text-xs text-gray-500">{data.bookings}</p>

                                                    {/* Hover Tooltip */}
                                                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10">
                                                        <div className="font-semibold">{data.bookings}</div>
                                                        <div className={`flex items-center gap-1 text-xs ${data.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {data.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                            {Math.abs(data.growth)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Popular Services */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Popular Services</h3>
                                <div className="space-y-4">
                                    {filteredPopularServices.map((service, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{service.service}</p>
                                                    <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-rose-600">${service.revenue.toLocaleString()}</p>
                                                <p className="text-sm text-gray-500">revenue</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Performance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Conversion Rate', value: '8.5%', change: '+1.2%', positive: true },
                                    { label: 'Avg Booking Value', value: '$156', change: '+$12', positive: true },
                                    { label: 'Repeat Bookings', value: '42%', change: '+3.5%', positive: true },
                                    { label: 'Cancellation Rate', value: '6.1%', change: '-0.8%', positive: true }
                                ].map((metric, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-xl hover:bg-rose-50 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-600">{metric.label}</p>
                                            <span className={`text-sm font-medium ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                                                {metric.change}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'Revenue Dashboard':
                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Revenue Dashboard
                                </h2>
                                <p className="text-gray-600 text-lg">Monitor revenue and financial metrics in real-time</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                {/* Time Range Filter */}
                                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                    {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 transform hover:scale-105 ${timeRange === range
                                                ? 'bg-rose-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-rose-600'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowRevenueFilterModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 border border-gray-200 text-white rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Filter size={16} />
                                    Filter
                                </button>
                                <button
                                    onClick={exportRevenueDashboardToPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                                >
                                    <Download size={16} />
                                    Export Report
                                </button>
                            </div>
                        </div>

                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                {
                                    title: 'Total Revenue',
                                    value: `$${revenueMetrics.totalRevenue.toLocaleString()}`,
                                    change: `+${revenueMetrics.growthPercentage}%`,
                                    positive: true,
                                    icon: DollarSign,
                                    gradient: 'from-green-500 to-emerald-600',
                                    delay: 0
                                },
                                {
                                    title: 'Monthly Revenue',
                                    value: `$${revenueMetrics.monthlyRevenue.toLocaleString()}`,
                                    change: '+8.2%',
                                    positive: true,
                                    icon: BarChart3,
                                    gradient: 'from-blue-500 to-cyan-600',
                                    delay: 100
                                },
                                {
                                    title: 'Active Subscriptions',
                                    value: revenueMetrics.activeSubscriptions.toLocaleString(),
                                    change: '+5.2%',
                                    positive: true,
                                    icon: Users,
                                    gradient: 'from-purple-500 to-violet-600',
                                    delay: 200
                                },
                                {
                                    title: 'Avg Order Value',
                                    value: `$${revenueMetrics.averageOrderValue}`,
                                    change: '+3.1%',
                                    positive: true,
                                    icon: CreditCard,
                                    gradient: 'from-amber-500 to-orange-600',
                                    delay: 300
                                }
                            ].map((metric, index) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`bg-gradient-to-br ${metric.gradient} p-6 rounded-2xl shadow-lg text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slideIn`}
                                        style={{ animationDelay: `${metric.delay}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/80 text-sm font-medium mb-1">{metric.title}</p>
                                                <p className="text-2xl font-bold mb-2">{metric.value}</p>
                                                <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-300' : 'text-red-300'}`}>
                                                    {metric.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    <span>{metric.change}</span>
                                                    <span className="text-white/70">from last month</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                <Icon size={24} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Revenue Distribution and Transactions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Revenue by Category */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Revenue by Category</h3>
                                    <button
                                        onClick={() => setShowRevenueDetailsModal(true)}
                                        className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {filteredRevenueByCategory.map((category, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                                    {category.percentage}%
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 group-hover:text-rose-700">{category.category}</p>
                                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-rose-600">
                                                        ${category.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`flex items-center gap-1 text-sm font-medium ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {category.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {category.growth}%
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Growth</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
                                    <button
                                        onClick={() => setShowAllTransactionsModal(true)}
                                        className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {filteredRecentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                                                    {transaction.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 group-hover:text-rose-700">{transaction.client}</p>
                                                    <p className="text-sm text-gray-600">{transaction.service}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900 group-hover:text-rose-600">
                                                    ${transaction.amount}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">{transaction.date}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                        ? 'bg-green-100 text-green-700 group-hover:bg-green-200'
                                                        : 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Profile':
                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div className="mb-4 lg:mb-0">
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Admin Profile
                                </h2>
                                <p className="text-gray-600 text-lg">Manage your personal information and account settings</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {saveSuccess && (
                                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg animate-bounce">
                                        <CheckCircle size={16} />
                                        <span className="text-sm font-medium">Changes saved successfully!</span>
                                    </div>
                                )}

                                {isEditing ? (
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-300 text-white bg-red-500 cursor-pointer"
                                        >
                                            <XCircle size={20} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25 cursor-pointer"
                                        >
                                            <Save size={20} />
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleStartEditing}
                                        className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-rose-500/25 cursor-pointer"
                                    >
                                        <Edit3 size={20} />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Overview Card */}
                        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-2xl p-6 mb-8 text-white transform transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-white/30"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
                                            {profileData.firstName[0]}{profileData.lastName[0]}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button
                                            onClick={triggerFileInput}
                                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                                        >
                                            <Camera size={16} />
                                        </button>
                                    )}
                                    <input
                                        id="profile-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-2">{profileData.firstName} {profileData.lastName}</h3>
                                    <p className="text-rose-100 mb-1">{profileData.department}</p>
                                    <p className="text-rose-100 text-sm opacity-90">{profileData.email}</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                        Active
                                    </div>
                                    <p className="text-rose-100 text-sm mt-2">Last login: {profileData.lastLogin}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                                            ? 'bg-white text-rose-600 shadow-lg'
                                            : 'text-gray-600 hover:text-rose-600'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="xl:col-span-2 space-y-6">
                                {activeTab === 'personal' && (
                                    <div className="space-y-6">
                                        {/* Personal Information */}
                                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                                <User className="text-rose-500" size={24} />
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { label: 'First Name', key: 'firstName', icon: User },
                                                    { label: 'Last Name', key: 'lastName', icon: User },
                                                    { label: 'Email', key: 'email', icon: Mail },
                                                    { label: 'Phone', key: 'phone', icon: Phone },
                                                    { label: 'Department', key: 'department', icon: Settings },
                                                    { label: 'Join Date', key: 'joinDate', icon: Calendar, readOnly: true }
                                                ].map((field) => {
                                                    const FieldIcon = field.icon;
                                                    return (
                                                        <div key={field.key} className="group">
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                                <FieldIcon size={16} className="text-rose-500" />
                                                                {field.label}
                                                            </label>
                                                            {isEditing && !field.readOnly ? (
                                                                <input
                                                                    type="text"
                                                                    value={profileData[field.key]}
                                                                    onChange={(e) => {
                                                                        let value = e.target.value;
                                                                        if (field.key === 'phone') {
                                                                            // Enforce +91 prefix and allow only 10 digits after space
                                                                            if (value.startsWith('+91 ')) {
                                                                                const digits = value.slice(4).replace(/\D/g, ''); // Remove non-digits after +91
                                                                                if (digits.length <= 10) {
                                                                                    value = '+91 ' + digits;
                                                                                } else {
                                                                                    value = '+91 ' + digits.slice(0, 10);
                                                                                }
                                                                            } else {
                                                                                value = '+91 ';
                                                                            }
                                                                        }
                                                                        setProfileData(prev => ({ ...prev, [field.key]: value }));
                                                                    }}
                                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                                                />
                                                            ) : (
                                                                <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-rose-100 transition-all duration-300">
                                                                    <p className="text-gray-900">{profileData[field.key]}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Address Field */}
                                            <div className="mt-6 group">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <MapPin size={16} className="text-rose-500" />
                                                    Address
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                                        rows="3"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-rose-100 transition-all duration-300">
                                                        <p className="text-gray-900">{profileData.address}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bio Field */}
                                            <div className="mt-6 group">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                                        rows="4"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-rose-100 transition-all duration-300">
                                                        <p className="text-gray-900 whitespace-pre-line">{profileData.bio}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                            <Bell className="text-rose-500" size={24} />
                                            Notification Preferences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(notifications).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 group">
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-rose-700 transition-colors">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-gray-600">Receive {key.toLowerCase()} notifications</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleNotificationChange(key)}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${value
                                                            ? 'bg-rose-500 shadow-lg shadow-rose-500/30'
                                                            : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${value ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                            <Shield className="text-rose-500" size={24} />
                                            Security Settings
                                        </h3>
                                        <div className="space-y-6">
                                            {[
                                                { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' },
                                                { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of new sign-ins' },
                                                { key: 'deviceManagement', label: 'Device Management', description: 'Monitor and manage connected devices' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 group">
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-rose-700">{item.label}</p>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSecurityChange(item.key, !securitySettings[item.key])}
                                                        className={`relative inline-flex h-7 w-12 items-center cursor-pointer rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${securitySettings[item.key]
                                                            ? 'bg-rose-500 shadow-lg shadow-rose-500/30'
                                                            : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${securitySettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            ))}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Session Timeout</label>
                                                    <select
                                                        value={securitySettings.sessionTimeout}
                                                        onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                                    >
                                                        <option value="15">15 minutes</option>
                                                        <option value="30">30 minutes</option>
                                                        <option value="60">1 hour</option>
                                                        <option value="120">2 hours</option>
                                                    </select>
                                                </div>
                                                <div className="group">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Expiry</label>
                                                    <select
                                                        value={securitySettings.passwordExpiry}
                                                        onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 cursor-pointer"
                                                    >
                                                        <option value="30">30 days</option>
                                                        <option value="60">60 days</option>
                                                        <option value="90">90 days</option>
                                                        <option value="180">180 days</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                                                <Key size={20} />
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                            <Activity className="text-rose-500" size={24} />
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-4">
                                            {recentActivities.map((activity) => {
                                                const ActivityIcon = iconMap[activity.icon] || CheckCircle;
                                                return (
                                                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300 group transform hover:scale-[1.02]">
                                                        <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                            <ActivityIcon size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-800 group-hover:text-rose-700">{activity.action}</p>
                                                            <p className="text-sm text-gray-600">{activity.time}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(activity.status)}`}>
                                                            {activity.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Quick Actions */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        {[
                                            { icon: Download, label: 'Export Data', color: 'text-blue-600' },
                                            { icon: CreditCard, label: 'Billing Info', color: 'text-green-600' },
                                            { icon: Globe, label: 'Language', color: 'text-purple-600' },
                                            { icon: Settings, label: 'Preferences', color: 'text-amber-600' }
                                        ].map((action, index) => {
                                            const ActionIcon = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-rose-50 rounded-xl transition-all duration-300 transform hover:translate-x-2 group cursor-pointer"
                                                >
                                                    <ActionIcon size={20} className={`${action.color} group-hover:scale-110 transition-transform`} />
                                                    <span className="font-medium group-hover:text-rose-700">{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Account Stats */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Account Stats</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Admin Since', value: 'Jan 2023', icon: Calendar },
                                            { label: 'Total Logins', value: '1,247', icon: Activity },
                                            { label: 'Security Score', value: '98%', icon: Shield },
                                            { label: 'Storage Used', value: '2.3 GB', icon: Download }
                                        ].map((stat, index) => {
                                            const StatIcon = stat.icon;
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 group">
                                                    <div className="flex items-center gap-3">
                                                        <StatIcon size={18} className="text-rose-500" />
                                                        <span className="text-gray-700 group-hover:text-rose-700">{stat.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 group-hover:text-rose-600">{stat.value}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="p-8">Select an item from the sidebar.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-rose-50 to-pink-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-rose-600 to-pink-700 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-white/20 text-white transition-colors duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="mt-6 px-3">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setActiveItem(item.name);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-4 py-3 mb-2 cursor-pointer text-left rounded-lg transition-all duration-200 transform hover:scale-105 ${activeItem === item.name ? 'bg-white text-rose-700 shadow-lg font-medium' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className="mr-3" />
                                <span className="text-sm">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="bg-white shadow-lg border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 mr-4"
                            >
                                <Menu size={20} />
                            </button>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent lg:hidden">
                                Admin Dashboard
                            </h1>
                        </div>

                        {/* Right side - User profile with dropdown */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 group"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-gray-800">Admin</p>
                                        <p className="text-xs text-gray-500">Administrator</p>
                                    </div>
                                    <div className="relative">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-rose-300 shadow-lg group-hover:shadow-xl transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
                                                {profileData.firstName[0]}{profileData.lastName[0]}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {showUserDropdown && (
                                    <div className="absolute right-0 top-16 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-dropdown">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800">{profileData.firstName} {profileData.lastName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{profileData.email}</p>
                                        </div>

                                        <div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-all duration-200 transform hover:translate-x-1 group"
                                            >
                                                <LogOut size={16} className="mr-3 transform group-hover:scale-110 transition-transform duration-200" />
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <main className="flex-1 overflow-y-auto">
                    {/* Client Success Notification */}
                    {clientSuccess && (
                        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
                            <CheckCircle size={24} />
                            <div>
                                <p className="font-semibold">Client Added Successfully!</p>
                                <p className="text-sm opacity-90">The client has been added to the system.</p>
                            </div>
                        </div>
                    )}

                    {/* Delete Client Success Notification */}
                    {deleteSuccess && (
                        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
                            <Trash2 size={24} />
                            <div>
                                <p className="font-semibold">Client Deleted Successfully!</p>
                                <p className="text-sm opacity-90">The client has been permanently removed from the system.</p>
                            </div>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>

            {/* Add Client Modal */}
            {showAddClientModal && <AddClientModal />}

            {/* View User Modal */}
            {showViewUserModal && <ViewUserModal />}

            {/* Edit User Modal */}
            {showEditUserModal && <EditUserModal />}

            {/* User Filter Modal */}
            {showUserFilterModal && <UserFilterModal />}

            {/* Booking Filter Modal */}
            {showBookingFilterModal && <BookingFilterModal />}

            {/* Revenue Filter Modal */}
            {showRevenueFilterModal && <RevenueFilterModal />}

            {/* System Details Modal */}
            {showSystemDetailsModal && <SystemDetailsModal />}

            {/* All Activities Modal */}
            {showAllActivitiesModal && <AllActivitiesModal />}

            {/* Revenue Details Modal */}
            {showRevenueDetailsModal && <RevenueDetailsModal />}

            {/* Revenue Transactions Modal */}
            {showAllTransactionsModal && <AllTransactionsModal />}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Client</h3>
                                <p className="text-gray-600 mt-1">Are you sure you want to delete this client? This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteClient();
                                    setDeleteConfirm(false);
                                }}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                            >
                                Delete Client
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300 animate-fadeIn"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Add CSS animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes dropdown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
                
                .animate-dropdown {
                    animation: dropdown 0.2s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
                
                .animate-modalSlideIn {
                    animation: modalSlideIn 0.3s ease-out;
                }
                
                /* Smooth scrolling */
                .overflow-y-auto {
                    scroll-behavior: smooth;
                }
                
                /* Custom hover colors */
                .hover\\:bg-red-25:hover {
                    background-color: rgba(254, 202, 202, 0.1);
                }
                
                .hover\\:bg-green-25:hover {
                    background-color: rgba(187, 247, 208, 0.1);
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;