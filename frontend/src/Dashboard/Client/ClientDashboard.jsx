import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
    FolderOpen,
    Calendar,
    BookOpen,
    MessageSquare,
    User,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Users,
    Search,
    Plus,
    Eye as ViewIcon,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    BarChart3,
    DollarSign,
    Clock,
    AlertCircle,
    Settings,
    Bell,
    Shield,
    Mail,
    Phone,
    MapPin,
    Camera,
    Download,
    RefreshCw,
    Filter,
    MoreVertical,
    Star,
    CalendarDays,
    Clock4,
    UserPlus,
    FileText,
    CreditCard,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    EyeOff,
    Key,
    Activity,
    Globe,
    Save,
    XCircle,
    Edit3
} from 'lucide-react';

const ClientDashboard = () => {
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const navigate = useNavigate();

    // Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Store original data for cancel functionality
    const [originalProfileData, setOriginalProfileData] = useState({
        firstName: 'John',
        lastName: 'Client',
        email: 'client@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Tech Solutions Inc.',
        position: 'Service Provider',
        joinDate: '2023-03-15',
        lastLogin: '2024-01-15 09:45 AM',
        address: '123 Business Ave, Suite 500, San Francisco, CA 94107',
        bio: 'Professional service provider specializing in web development and digital solutions. Committed to delivering high-quality services to clients.',
        website: 'www.techsolutions.com',
        timezone: 'PST (Pacific Standard Time)'
    });

    const [profileData, setProfileData] = useState({ ...originalProfileData });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        bookingAlerts: true,
        paymentReminders: true,
        systemUpdates: false,
        marketingEmails: false
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: '60',
        passwordExpiry: '90',
        loginAlerts: true,
        deviceManagement: true
    });

    // User Management State
    const [users, setUsers] = useState([
        { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-10', lastLogin: '2 hours ago' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-08', lastLogin: '1 day ago' },
        { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'Customer', status: 'Inactive', joinDate: '2024-01-05', lastLogin: '3 days ago' },
        { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-03', lastLogin: '5 hours ago' },
        { id: 5, name: 'Alex Brown', email: 'alex@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-01', lastLogin: '12 hours ago' }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [bookingSearchTerm, setBookingSearchTerm] = useState('');

    // Service Management State
    const [services, setServices] = useState([
        { id: 1, name: 'Web Development', description: 'Custom website development services', status: 'Active', price: '$500', category: 'Development', bookings: 24, rating: 4.8 },
        { id: 2, name: 'Mobile App Development', description: 'iOS and Android app development', status: 'Active', price: '$800', category: 'Development', bookings: 18, rating: 4.9 },
        { id: 3, name: 'UI/UX Design', description: 'User interface and experience design', status: 'Active', price: '$300', category: 'Design', bookings: 32, rating: 4.7 },
        { id: 4, name: 'Digital Marketing', description: 'SEO and social media marketing', status: 'Inactive', price: '$400', category: 'Marketing', bookings: 12, rating: 4.5 },
        { id: 5, name: 'IT Consulting', description: 'Technical consultation services', status: 'Active', price: '$200', category: 'Consulting', bookings: 28, rating: 4.6 }
    ]);

    // Booking Management State
    const [bookings, setBookings] = useState([
        { id: 1, client: 'John Smith', service: 'Web Development', date: '2024-01-15', time: '10:00 AM', status: 'Confirmed', amount: '$500', duration: '2 hours' },
        { id: 2, client: 'Sarah Johnson', service: 'UI/UX Design', date: '2024-01-16', time: '2:00 PM', status: 'Pending', amount: '$300', duration: '1.5 hours' },
        { id: 3, client: 'Mike Davis', service: 'IT Consulting', date: '2024-01-17', time: '11:00 AM', status: 'Cancelled', amount: '$200', duration: '1 hour' },
        { id: 4, client: 'Emma Wilson', service: 'Mobile App Development', date: '2024-01-18', time: '3:00 PM', status: 'Confirmed', amount: '$800', duration: '3 hours' },
        { id: 5, client: 'Alex Brown', service: 'Web Development', date: '2024-01-19', time: '9:00 AM', status: 'Completed', amount: '$500', duration: '2 hours' }
    ]);

    // Revenue Dashboard State
    const [timeRange, setTimeRange] = useState('daily');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [chartType, setChartType] = useState('area'); // 'bar', 'line', 'area'
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showChartMenu, setShowChartMenu] = useState(false);

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

    // Function to generate revenue metrics based on time range
    const getRevenueMetrics = (range) => {
        const baseMetrics = {
            totalRevenue: 1254300,
            monthlyRevenue: 98750,
            growthPercentage: 12.5,
            activeClients: 2847,
            averageBookingValue: 156,
            topService: 'Web Development',
            newBookings: 342,
            completionRate: 94.2,
            clientSatisfaction: 4.9
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
            newBookings: Math.round(baseMetrics.newBookings * multiplier[range]),
            activeClients: Math.round(baseMetrics.activeClients * multiplier[range])
        };
    };

    // Function to generate revenue by service data
    const getRevenueByService = (range) => {
        const baseData = [
            { service: 'Web Development', amount: 450000, percentage: 35.9, growth: 15.2, color: 'bg-emerald-500' },
            { service: 'Mobile App Development', amount: 320000, percentage: 25.5, growth: 8.7, color: 'bg-blue-500' },
            { service: 'UI/UX Design', amount: 280000, percentage: 22.3, growth: 3.2, color: 'bg-green-500' },
            { service: 'Add-ons', amount: 203000, percentage: 16.2, growth: 12.8, color: 'bg-purple-500' }
        ];

        // Adjust amounts based on time range
        const multiplier = {
            daily: 0.03,
            weekly: 0.12,
            monthly: 1,
            yearly: 12
        };

        return baseData.map(service => ({
            ...service,
            amount: Math.round(service.amount * multiplier[range])
        }));
    };

    // Function to generate recent transactions
    const getRecentTransactions = (range) => {
        const baseTransactions = [
            { id: 1, client: 'John Smith', service: 'Web Development', amount: 500, date: 'Today', status: 'completed', avatar: 'JS' },
            { id: 2, client: 'Sarah Johnson', service: 'UI/UX Design', amount: 300, date: 'Today', status: 'completed', avatar: 'SJ' },
            { id: 3, client: 'Mike Davis', service: 'Mobile App Development', amount: 800, date: 'Yesterday', status: 'pending', avatar: 'MD' },
            { id: 4, client: 'Emma Wilson', service: 'Consultation', amount: 200, date: 'Yesterday', status: 'completed', avatar: 'EW' }
        ];

        // Adjust dates based on time range
        const dateLabels = {
            daily: ['Today', 'Today', 'Yesterday', 'Yesterday'],
            weekly: ['This Week', 'This Week', 'Last Week', 'Last Week'],
            monthly: ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12'],
            yearly: ['2024', '2024', '2023', '2023']
        };

        return baseTransactions.map((transaction, index) => ({
            ...transaction,
            date: dateLabels[range][index] || transaction.date
        }));
    };

    // Function to generate performance metrics
    const getPerformanceMetrics = (range) => {
        const baseMetrics = [
            { name: 'Response Time', value: '1.8 hours', change: '-0.4h', positive: true },
            { name: 'Booking Rate', value: '82%', change: '+7.1%', positive: true },
            { name: 'Client Rating', value: '4.9/5', change: '+0.1', positive: true },
            { name: 'Repeat Clients', value: '68%', change: '+2.3%', positive: true }
        ];

        // Adjust values based on time range
        const adjustments = {
            daily: { responseTime: '1.2 hours', bookingRate: '85%', clientRating: '4.9/5', repeatClients: '72%' },
            weekly: { responseTime: '1.5 hours', bookingRate: '83%', clientRating: '4.8/5', repeatClients: '70%' },
            monthly: { responseTime: '1.8 hours', bookingRate: '82%', clientRating: '4.9/5', repeatClients: '68%' },
            yearly: { responseTime: '2.2 hours', bookingRate: '78%', clientRating: '4.7/5', repeatClients: '65%' }
        };

        return baseMetrics.map(metric => {
            const keyMap = {
                'Response Time': 'responseTime',
                'Booking Rate': 'bookingRate',
                'Client Rating': 'clientRating',
                'Repeat Clients': 'repeatClients'
            };

            const key = keyMap[metric.name];
            return {
                ...metric,
                value: adjustments[range][key] || metric.value
            };
        });
    };

    // Dynamic data based on time range - memoized to prevent unnecessary re-generation
    const revenueTrend = useMemo(() => getRevenueTrend(timeRange), [timeRange]);
    const revenueMetrics = useMemo(() => getRevenueMetrics(timeRange), [timeRange]);
    const revenueByService = useMemo(() => getRevenueByService(timeRange), [timeRange]);
    const recentTransactions = useMemo(() => getRecentTransactions(timeRange), [timeRange]);
    const performanceMetrics = useMemo(() => getPerformanceMetrics(timeRange), [timeRange]);

    // Modal States
    const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
    const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
    const [showAllServicesModal, setShowAllServicesModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);
    const [showNewBookingModal, setShowNewBookingModal] = useState(false);
    const [showEditBookingModal, setShowEditBookingModal] = useState(false);
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [newServiceData, setNewServiceData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'Active'
    });
    const [editServiceData, setEditServiceData] = useState({
        id: null,
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'Active'
    });
    const [editUserData, setEditUserData] = useState({
        id: null,
        name: '',
        email: '',
        role: 'Customer',
        status: 'Active'
    });
    const [newClientData, setNewClientData] = useState({
        name: '',
        email: '',
        status: 'Active'
    });
    const [editBookingData, setEditBookingData] = useState({
        id: null,
        client: '',
        service: '',
        date: '',
        time: '',
        duration: '',
        amount: '',
        status: ''
    });
    const [newBookingData, setNewBookingData] = useState({
        client: '',
        service: '',
        date: '',
        time: '',
        duration: '',
        amount: '',
        status: ''
    });
    const [serviceErrors, setServiceErrors] = useState({});
    const [bookingErrors, setBookingErrors] = useState({});
    const [clientErrors, setClientErrors] = useState({});
    const [selectedService, setSelectedService] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Pagination states for modals
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [transactionsPerPage] = useState(5);
    const [allTransactions, setAllTransactions] = useState([
        { id: 1, client: 'John Smith', service: 'Web Development', amount: 500, date: 'Today', status: 'completed', avatar: 'JS' },
        { id: 2, client: 'Sarah Johnson', service: 'UI/UX Design', amount: 300, date: 'Today', status: 'completed', avatar: 'SJ' },
        { id: 3, client: 'Mike Davis', service: 'Mobile App Development', amount: 800, date: 'Yesterday', status: 'pending', avatar: 'MD' },
        { id: 4, client: 'Emma Wilson', service: 'Consultation', amount: 200, date: 'Yesterday', status: 'completed', avatar: 'EW' },
        { id: 5, client: 'Alex Brown', service: 'Web Development', amount: 500, date: '2 days ago', status: 'completed', avatar: 'AB' },
        { id: 6, client: 'Lisa Chen', service: 'UI/UX Design', amount: 300, date: '2 days ago', status: 'completed', avatar: 'LC' },
        { id: 7, client: 'David Kim', service: 'Mobile App Development', amount: 800, date: '3 days ago', status: 'pending', avatar: 'DK' },
        { id: 8, client: 'Rachel Green', service: 'Consultation', amount: 200, date: '3 days ago', status: 'completed', avatar: 'RG' },
        { id: 9, client: 'Tom Wilson', service: 'Web Development', amount: 500, date: '4 days ago', status: 'completed', avatar: 'TW' },
        { id: 10, client: 'Anna Davis', service: 'UI/UX Design', amount: 300, date: '4 days ago', status: 'completed', avatar: 'AD' },
        { id: 11, client: 'Chris Johnson', service: 'Mobile App Development', amount: 800, date: '5 days ago', status: 'pending', avatar: 'CJ' },
        { id: 12, client: 'Maria Garcia', service: 'Consultation', amount: 200, date: '5 days ago', status: 'completed', avatar: 'MG' }
    ]);

    // Availability Management State
    const [availability, setAvailability] = useState({
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '17:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: false },
        sunday: { start: '10:00', end: '14:00', enabled: false }
    });

    const [availabilitySaveSuccess, setAvailabilitySaveSuccess] = useState(false);

    const [timeSlots, setTimeSlots] = useState([
        { id: 1, time: '09:00 AM - 10:00 AM', available: true },
        { id: 2, time: '10:00 AM - 11:00 AM', available: true },
        { id: 3, time: '11:00 AM - 12:00 PM', available: false },
        { id: 4, time: '01:00 PM - 02:00 PM', available: true },
        { id: 5, time: '02:00 PM - 03:00 PM', available: true },
        { id: 6, time: '03:00 PM - 04:00 PM', available: true },
        { id: 7, time: '04:00 PM - 05:00 PM', available: true }
    ]);

    // Reschedule/Cancel Requests
    const [requests, setRequests] = useState([
        { id: 1, client: 'John Smith', service: 'Web Development', date: '2024-01-20', type: 'Reschedule', reason: 'Conflict with another meeting', status: 'Pending', rescheduledDate: '2024-01-25' },
        { id: 2, client: 'Emma Wilson', service: 'Mobile App', date: '2024-01-18', type: 'Cancel', reason: 'Unexpected travel', status: 'Pending' },
        { id: 3, client: 'Mike Davis', service: 'Consultation', date: '2024-01-22', type: 'Reschedule', reason: 'Prefer later time', status: 'Approved', rescheduledDate: '2024-01-28' },
        { id: 4, client: 'Sarah Johnson', service: 'UI/UX Design', date: '2024-01-19', type: 'Cancel', reason: 'Budget constraints', status: 'Declined' }
    ]);

    const handleLogout = () => {
        console.log('Logging out...');
        navigate('/user/login');
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

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.joinDate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBookings = bookings.filter(booking =>
        booking.client.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.status.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.date.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.time.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.amount.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.duration.toLowerCase().includes(bookingSearchTerm.toLowerCase())
    );

    // Service Management Handlers
    const toggleServiceStatus = (serviceId) => {
        setServices(services.map(service =>
            service.id === serviceId
                ? { ...service, status: service.status === 'Active' ? 'Inactive' : 'Active' }
                : service
        ));
    };

    // Booking Management Handlers
    const updateBookingStatus = (bookingId, status) => {
        setBookings(bookings.map(booking =>
            booking.id === bookingId ? { ...booking, status } : booking
        ));
    };

    // Availability Handlers
    const toggleDayAvailability = (day) => {
        setAvailability(prev => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled }
        }));
    };

    const toggleTimeSlot = (slotId) => {
        setTimeSlots(timeSlots.map(slot =>
            slot.id === slotId ? { ...slot, available: !slot.available } : slot
        ));
    };

    const handleSaveAvailability = () => {
        console.log('Saving availability settings:', { availability, timeSlots });
        setAvailabilitySaveSuccess(true);
        setTimeout(() => setAvailabilitySaveSuccess(false), 3000);
    };

    // Request Handlers
    const handleRequestAction = (requestId, action) => {
        setRequests(requests.map(request =>
            request.id === requestId ? { ...request, status: action } : request
        ));
    };

    // Add Client Handlers
    const handleAddClientChange = (e) => {
        const { name, value } = e.target;
        setNewClientData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddClientSubmit = (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!newClientData.name.trim()) {
            errors.name = 'Client name is required';
        }
        if (!newClientData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(newClientData.email)) {
            errors.email = 'Email is invalid';
        }

        if (Object.keys(errors).length > 0) {
            setClientErrors(errors);
            return;
        }

        // Clear errors
        setClientErrors({});

        // Create new client
        const newClient = {
            id: users.length + 1,
            name: newClientData.name.trim(),
            email: newClientData.email.trim(),
            role: 'Customer', // Default role, but not in form
            status: newClientData.status,
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: 'Never'
        };

        // Add to users array
        setUsers(prev => [...prev, newClient]);

        // Reset form and close modal
        setNewClientData({
            name: '',
            email: '',
            status: 'Active'
        });
        setShowAddClientModal(false);
    };

    // Add Service Handlers
    const handleAddServiceChange = (e) => {
        const { name, value } = e.target;
        setNewServiceData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // New Booking Handlers
    const handleNewBookingChange = (e) => {
        const { name, value } = e.target;
        setNewBookingData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'service') {
                const selectedService = services.find(s => s.name === value);
                if (selectedService) {
                    updated.amount = selectedService.price.replace('$', '');
                }
            }
            return updated;
        });
    };

    const handleNewBookingSubmit = (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!newBookingData.client.trim()) {
            errors.client = 'Client name is required';
        }
        if (!newBookingData.service) {
            errors.service = 'Service is required';
        }
        if (!newBookingData.date) {
            errors.date = 'Date is required';
        }
        if (!newBookingData.time) {
            errors.time = 'Time is required';
        }
        if (!newBookingData.amount) {
            errors.amount = 'Amount is required';
        }

        if (Object.keys(errors).length > 0) {
            setBookingErrors(errors);
            return;
        }

        // Clear errors
        setBookingErrors({});

        // Create new booking
        const newBooking = {
            id: bookings.length + 1,
            client: newBookingData.client.trim(),
            service: newBookingData.service,
            date: newBookingData.date,
            time: newBookingData.time,
            duration: newBookingData.duration,
            amount: `$${newBookingData.amount}`,
            status: newBookingData.status
        };

        // Add to bookings array
        setBookings(prev => [...prev, newBooking]);

        // Reset form and close modal
        setNewBookingData({
            client: '',
            service: '',
            date: '',
            time: '',
            duration: '',
            amount: '',
            status: ''
        });
        setShowNewBookingModal(false);
    };

    const handleAddServiceSubmit = (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!newServiceData.name.trim()) {
            errors.name = 'Service name is required';
        }
        if (!newServiceData.description.trim()) {
            errors.description = 'Description is required';
        }
        if (!newServiceData.price.trim()) {
            errors.price = 'Price is required';
        }

        if (Object.keys(errors).length > 0) {
            setServiceErrors(errors);
            return;
        }

        // Clear errors
        setServiceErrors({});

        // Create new service
        const newService = {
            id: services.length + 1,
            name: newServiceData.name.trim(),
            description: newServiceData.description.trim(),
            price: `$${newServiceData.price}`,
            category: newServiceData.category,
            status: newServiceData.status,
            bookings: 0,
            rating: 0
        };

        // Add to services array
        setServices(prev => [...prev, newService]);

        // Reset form and close modal
        setNewServiceData({
            name: '',
            description: '',
            price: '',
            category: '',
            status: 'Active'
        });
        setShowAddServiceModal(false);
    };

    // Edit Service Handlers
    const handleEditService = (service) => {
        setEditServiceData({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price.replace('$', ''),
            category: service.category,
            status: service.status
        });
        setShowEditServiceModal(true);
    };

    // Edit User Handlers
    const handleEditUser = (user) => {
        setEditUserData({
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'Customer',
            status: user.status
        });
        setShowEditUserModal(true);
    };

    const handleEditUserChange = (e) => {
        const { name, value } = e.target;
        setEditUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditUserSubmit = (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!editUserData.name.trim()) {
            errors.name = 'User name is required';
        }
        if (!editUserData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(editUserData.email)) {
            errors.email = 'Email is invalid';
        }

        if (Object.keys(errors).length > 0) {
            setClientErrors(errors);
            return;
        }

        // Clear errors
        setClientErrors({});

        // Update user
        setUsers(prev => prev.map(user =>
            user.id === editUserData.id
                ? {
                    ...user,
                    name: editUserData.name.trim(),
                    email: editUserData.email.trim(),
                    status: editUserData.status
                }
                : user
        ));

        // Close modal
        setShowEditUserModal(false);
    };

    // Edit Booking Handlers
    const handleEditBooking = (booking) => {
        setEditBookingData({
            id: booking.id,
            client: booking.client,
            service: booking.service,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            amount: booking.amount.replace('$', ''),
            status: booking.status
        });
        setShowEditBookingModal(true);
    };

    const handleEditBookingChange = (e) => {
        const { name, value } = e.target;
        setEditBookingData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'service') {
                const selectedService = services.find(s => s.name === value);
                if (selectedService) {
                    updated.amount = selectedService.price.replace('$', '');
                }
            }
            return updated;
        });
    };

    const handleEditBookingSubmit = (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!editBookingData.client.trim()) {
            errors.client = 'Client name is required';
        }
        if (!editBookingData.service) {
            errors.service = 'Service is required';
        }
        if (!editBookingData.date) {
            errors.date = 'Date is required';
        }
        if (!editBookingData.time) {
            errors.time = 'Time is required';
        }
        if (!editBookingData.amount) {
            errors.amount = 'Amount is required';
        }

        if (Object.keys(errors).length > 0) {
            setBookingErrors(errors);
            return;
        }

        // Clear errors
        setBookingErrors({});

        // Update booking
        setBookings(prev => prev.map(booking =>
            booking.id === editBookingData.id
                ? {
                    ...booking,
                    client: editBookingData.client.trim(),
                    service: editBookingData.service,
                    date: editBookingData.date,
                    time: editBookingData.time,
                    duration: editBookingData.duration,
                    amount: `$${editBookingData.amount}`,
                    status: editBookingData.status
                }
                : booking
        ));

        // Close modal
        setShowEditBookingModal(false);
    };

    const handleEditServiceChange = (e) => {
        const { name, value } = e.target;
        setEditServiceData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditServiceSubmit = (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!editServiceData.name.trim()) {
            errors.name = 'Service name is required';
        }
        if (!editServiceData.description.trim()) {
            errors.description = 'Description is required';
        }
        if (!editServiceData.price.trim()) {
            errors.price = 'Price is required';
        }

        if (Object.keys(errors).length > 0) {
            setServiceErrors(errors);
            return;
        }

        // Clear errors
        setServiceErrors({});

        // Update service
        setServices(prev => prev.map(service =>
            service.id === editServiceData.id
                ? {
                    ...service,
                    name: editServiceData.name.trim(),
                    description: editServiceData.description.trim(),
                    price: `$${editServiceData.price}`,
                    category: editServiceData.category,
                    status: editServiceData.status
                }
                : service
        ));

        // Close modal
        setShowEditServiceModal(false);
    };

    // Delete Service Handler
    const handleDeleteService = (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            setServices(prev => prev.filter(service => service.id !== serviceId));
        }
    };

    // Delete User Handler
    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setUsers(prev => prev.filter(user => user.id !== userId));
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
    };

    // Modal Handlers
    const handleViewServiceDetails = (service) => {
        setSelectedService(service);
        setShowServiceDetailsModal(true);
    };

    const handleViewAllTransactions = () => {
        setShowAllTransactionsModal(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setShowBookingModal(true);
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowRequestModal(true);
    };

    const closeModal = (modalSetter) => {
        modalSetter(false);
        setSelectedService(null);
        setSelectedUser(null);
        setSelectedBooking(null);
        setSelectedRequest(null);
    };

    // Chart Handlers
    const handleChartTypeChange = (type) => {
        setChartType(type);
        setShowChartMenu(false);
    };

    const handleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        setShowChartMenu(false);
    };

    // PDF Export Function
    const exportDashboardToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129); // Emerald color
        doc.text('Client Dashboard Report', 20, 30);

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
        doc.text(`Active Clients: ${revenueMetrics.activeClients}`, 20, yPos + 10);
        doc.text(`Monthly Bookings: ${revenueMetrics.newBookings}`, 20, yPos + 20);
        doc.text(`Client Satisfaction: ${revenueMetrics.clientSatisfaction}/5`, 20, yPos + 30);
        doc.text(`Completion Rate: ${revenueMetrics.completionRate}%`, 20, yPos + 40);

        // Revenue by Service
        yPos += 60;
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text('Revenue by Service', 20, yPos);

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        yPos += 15;
        revenueByService.forEach((service) => {
            doc.text(`${service.service}: $${service.amount.toLocaleString()} (${service.percentage}%)`, 20, yPos);
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
        recentTransactions.slice(0, 5).forEach((transaction) => {
            doc.text(`${transaction.client} - ${transaction.service}: $${transaction.amount}`, 20, yPos);
            yPos += 10;
        });

        // Save the PDF
        doc.save('client-dashboard-report.pdf');
    };

    const sidebarItems = [
        { name: 'Dashboard', icon: BarChart3 },
        { name: 'Services', icon: FolderOpen },
        { name: 'Availability', icon: Calendar },
        { name: 'Bookings', icon: BookOpen },
        { name: 'Requests', icon: MessageSquare },
        { name: 'Users', icon: Users },
        { name: 'Profile', icon: User },
    ];

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'activity', label: 'Activity', icon: Activity }
    ];

    const recentActivities = [
        {
            id: 1,
            action: 'New booking received from John Smith',
            time: 'Today, 09:30 AM',
            status: 'success',
            icon: CheckCircle
        },
        {
            id: 2,
            action: 'Updated service pricing for Web Development',
            time: 'Yesterday, 3:15 PM',
            status: 'modified',
            icon: Edit3
        },
        {
            id: 3,
            action: 'Completed consultation session with Emma Wilson',
            time: '2 days ago, 11:45 AM',
            status: 'completed',
            icon: CheckCircle
        },
        {
            id: 4,
            action: 'Received payment for mobile app project',
            time: '3 days ago, 2:30 PM',
            status: 'payment',
            icon: DollarSign
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'modified': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'completed': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'payment': return 'text-green-600 bg-green-50 border-green-200';
            case 'alert': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'Dashboard':
                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Client Dashboard
                                </h2>
                                <p className="text-gray-600 text-lg">Overview of your service business and performance</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                    {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 transform hover:scale-105 ${timeRange === range
                                                ? 'bg-emerald-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-emerald-600'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={exportDashboardToPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
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
                                    gradient: 'from-emerald-500 to-teal-600',
                                    delay: 0
                                },
                                {
                                    title: 'Active Clients',
                                    value: revenueMetrics.activeClients,
                                    change: '+5.2%',
                                    positive: true,
                                    icon: Users,
                                    gradient: 'from-blue-500 to-cyan-600',
                                    delay: 100
                                },
                                {
                                    title: 'Monthly Bookings',
                                    value: revenueMetrics.newBookings,
                                    change: '+3.1%',
                                    positive: true,
                                    icon: Calendar,
                                    gradient: 'from-purple-500 to-violet-600',
                                    delay: 200
                                },
                                {
                                    title: 'Satisfaction',
                                    value: revenueMetrics.clientSatisfaction + '/5',
                                    change: '+0.2',
                                    positive: true,
                                    icon: Star,
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
                                                <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-emerald-300' : 'text-red-300'}`}>
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
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
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
                                                            onClick={() => handleChartTypeChange('area')}
                                                            className={`w-full flex items-center px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 transition-colors ${chartType === 'area' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'}`}
                                                        >
                                                            <Activity size={16} className="mr-3" />
                                                            Area Chart
                                                        </button>
                                                    </div>

                                                    <div className="border-t border-gray-100 py-1">
                                                        <button
                                                            onClick={handleFullScreen}
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
                                                return revenueTrend.map((data, index) => (
                                                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                                                        <div
                                                            className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-teal-600 cursor-pointer relative overflow-hidden"
                                                            style={{ height: `${Math.max((data.revenue / maxRevenue) * 100, 5)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
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
                                                const points = revenueTrend.map((data, index) => {
                                                    const x = (index / (revenueTrend.length - 1)) * 400;
                                                    const y = 256 - (data.revenue / maxRevenue) * 200; // Leave some margin at top
                                                    return `${x},${y}`;
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
                                                            stroke="#10b981"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />

                                                        {/* Data points */}
                                                        {revenueTrend.map((data, index) => {
                                                            const x = (index / (revenueTrend.length - 1)) * 400;
                                                            const y = 256 - (data.revenue / maxRevenue) * 200;
                                                            return (
                                                                <circle
                                                                    key={index}
                                                                    cx={x}
                                                                    cy={y}
                                                                    r="6"
                                                                    fill="#10b981"
                                                                    className="hover:r-8 transition-all cursor-pointer"
                                                                />
                                                            );
                                                        })}

                                                        {/* Gradient definition */}
                                                        <defs>
                                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
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
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Metrics</h3>
                                <div className="space-y-4">
                                    {performanceMetrics.map((metric, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800 group-hover:text-emerald-700">{metric.name}</p>
                                                <p className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 mt-1">
                                                    {metric.value}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${metric.positive
                                                ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
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

                        {/* Revenue by Service and Recent Transactions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue by Service */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Revenue by Service</h3>
                                    <button
                                        onClick={() => setShowAllServicesModal(true)}
                                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {revenueByService.map((service, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                                    {service.percentage}%
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 group-hover:text-emerald-700">{service.service}</p>
                                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600">
                                                        ${service.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`flex items-center gap-1 text-sm font-medium ${service.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                    }`}>
                                                    {service.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {service.growth}%
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
                                        onClick={handleViewAllTransactions}
                                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                                                    {transaction.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 group-hover:text-emerald-700">{transaction.client}</p>
                                                    <p className="text-sm text-gray-600">{transaction.service}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900 group-hover:text-emerald-600">
                                                    ${transaction.amount}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">{transaction.date}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
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

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Completion Rate</p>
                                        <p className="text-2xl font-bold">{revenueMetrics.completionRate}%</p>
                                        <p className="text-indigo-100 text-xs mt-1">Service completion</p>
                                    </div>
                                    <CheckCircle size={32} className="opacity-80" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-cyan-100 text-sm font-medium">Avg Booking Value</p>
                                        <p className="text-2xl font-bold">${revenueMetrics.averageBookingValue}</p>
                                        <p className="text-cyan-100 text-xs mt-1">Per booking</p>
                                    </div>
                                    <DollarSign size={32} className="opacity-80" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-rose-100 text-sm font-medium">Top Service</p>
                                        <p className="text-2xl font-bold">{revenueMetrics.topService}</p>
                                        <p className="text-rose-100 text-xs mt-1">Most popular</p>
                                    </div>
                                    <Star size={32} className="opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Services':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Manage Services
                                </h2>
                                <p className="text-gray-600">Create and manage your service offerings</p>
                            </div>
                            <button
                                onClick={() => setShowAddServiceModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 mt-4 lg:mt-0 cursor-pointer"
                            >
                                <Plus size={16} />
                                Add New Service
                            </button>
                        </div>

                        {/* Service Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Services</p>
                                        <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                                    </div>
                                    <FolderOpen className="text-emerald-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Active Services</p>
                                        <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.status === 'Active').length}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                                        <p className="text-2xl font-bold text-gray-900">{services.reduce((sum, s) => sum + s.bookings, 0)}</p>
                                    </div>
                                    <BookOpen className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
                                        <p className="text-2xl font-bold text-gray-900">4.7/5</p>
                                    </div>
                                    <Star className="text-amber-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div key={service.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                            <button
                                                onClick={() => toggleServiceStatus(service.id)}
                                                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${service.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${service.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-2xl font-bold text-emerald-600">{service.price}</span>
                                                <span className="text-sm text-gray-500 ml-2">per session</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {service.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                <span>{service.bookings} bookings</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Star size={14} className="text-amber-500" />
                                                <span>{service.rating}</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <span className="text-sm text-gray-500">Category: {service.category}</span>
                                        </div>
                                        <div className="mt-4 flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditService(service)}
                                                className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors text-sm cursor-pointer"
                                            >
                                                <Edit size={14} className="inline mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleViewServiceDetails(service)}
                                                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm cursor-pointer"
                                            >
                                                <ViewIcon size={14} className="inline mr-1" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service.id)}
                                                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer"
                                            >
                                                <Trash2 size={14} className="inline mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'Availability':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Manage Availability
                                </h2>
                                <p className="text-gray-600">Set your working hours and available time slots</p>
                            </div>
                            <button
                                onClick={handleSaveAvailability}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 mt-4 lg:mt-0"
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>

                        {/* Success Message */}
                        {availabilitySaveSuccess && (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg animate-bounce mb-6">
                                <CheckCircle size={16} />
                                <span className="text-sm font-medium">Availability settings saved successfully!</span>
                            </div>
                        )}

                        {/* Availability Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Working Days</p>
                                        <p className="text-2xl font-bold text-gray-900">5</p>
                                    </div>
                                    <Calendar className="text-emerald-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Daily Hours</p>
                                        <p className="text-2xl font-bold text-gray-900">8</p>
                                    </div>
                                    <Clock className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Available Slots</p>
                                        <p className="text-2xl font-bold text-gray-900">{timeSlots.filter(s => s.available).length}</p>
                                    </div>
                                    <CheckCircle className="text-green-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Booked Slots</p>
                                        <p className="text-2xl font-bold text-gray-900">{timeSlots.filter(s => !s.available).length}</p>
                                    </div>
                                    <AlertCircle className="text-amber-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Weekly Schedule */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                {Object.entries(availability).map(([day, schedule]) => (
                                    <div key={day} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300">
                                        <div className="flex items-center justify-between w-full mb-3">
                                            <span className="font-medium text-gray-800 capitalize">{day}</span>
                                            <button
                                                onClick={() => toggleDayAvailability(day)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${schedule.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${schedule.enabled ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                        {schedule.enabled ? (
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-emerald-700">
                                                    {schedule.start} - {schedule.end}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">8 hours</div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm text-gray-500">Unavailable</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Available Time Slots</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => toggleTimeSlot(slot.id)}
                                        className={`p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${slot.available
                                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-200'
                                            : 'bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200'
                                            }`}
                                    >
                                        <div className="font-medium">{slot.time}</div>
                                        <div className="text-xs mt-1">{slot.available ? 'Available' : 'Booked'}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'Bookings':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Manage Bookings
                                </h2>
                                <p className="text-gray-600">View and manage all your service bookings</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        value={bookingSearchTerm}
                                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowNewBookingModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <Plus size={16} />
                                    New Booking
                                </button>
                            </div>
                        </div>

                        {/* Booking Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                                        <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                                    </div>
                                    <BookOpen className="text-emerald-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                                        <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'Confirmed').length}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'Pending').length}</p>
                                    </div>
                                    <Clock4 className="text-amber-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">$2,300</p>
                                    </div>
                                    <DollarSign className="text-green-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Bookings Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">All Bookings</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{bookings.length} bookings</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {booking.client.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{booking.client}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{booking.service}</div>
                                                    <div className="text-sm text-gray-500">{booking.duration}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{booking.date}</div>
                                                    <div className="text-sm text-gray-500">{booking.time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed' || booking.status === 'Completed'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : booking.status === 'Pending'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{booking.amount}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {booking.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking.id, 'Confirmed')}
                                                                    className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleViewBooking(booking)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="View Booking Details"
                                                        >
                                                            <ViewIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditBooking(booking)}
                                                            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                                                            title="Edit Booking"
                                                        >
                                                            <Edit size={16} />
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

            case 'Requests':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Reschedule & Cancel Requests
                                </h2>
                                <p className="text-gray-600">Manage client requests for rescheduling or canceling bookings</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <span className="text-sm text-gray-600">
                                    {requests.filter(r => r.status === 'Pending').length} pending requests
                                </span>
                            </div>
                        </div>

                        {/* Requests Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                                        <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                                    </div>
                                    <MessageSquare className="text-emerald-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'Pending').length}</p>
                                    </div>
                                    <Clock4 className="text-amber-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Approved</p>
                                        <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'Approved').length}</p>
                                    </div>
                                    <CheckCircle className="text-green-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Declined</p>
                                        <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'Declined').length}</p>
                                    </div>
                                    <XCircle className="text-red-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Requests List */}
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {request.client.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">{request.client}</h3>
                                                    <p className="text-sm text-gray-600">{request.service} • {request.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.type === 'Reschedule'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {request.type} Request
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === 'Pending'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : request.status === 'Approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">Reason:</span> {request.reason}
                                                </p>
                                                {request.type === 'Reschedule' && request.rescheduledDate && (
                                                    <p className="text-sm text-gray-700 mt-2">
                                                        <span className="font-medium">Reschedule Date:</span> {request.rescheduledDate}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {request.status === 'Pending' && (
                                            <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                                                <button
                                                    onClick={() => handleRequestAction(request.id, 'Approved')}
                                                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors transform hover:scale-105"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRequestAction(request.id, 'Declined')}
                                                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors transform hover:scale-105"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => handleViewRequest(request)}
                                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors transform hover:scale-105"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'Users':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    User Management
                                </h2>
                                <p className="text-gray-600">Manage and monitor all your client accounts</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search clients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowAddClientModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <UserPlus size={16} />
                                    Add Client
                                </button>
                            </div>
                        </div>

                        {/* Client Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Clients</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                    </div>
                                    <Users className="text-emerald-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Active Clients</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'Active').length}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">New This Month</p>
                                        <p className="text-2xl font-bold text-gray-900">12</p>
                                    </div>
                                    <UserPlus className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
                                        <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                                    </div>
                                    <Star className="text-amber-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Clients Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">All Clients</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{filteredUsers.length} clients found</span>
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
                                                    className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
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
                                                        className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{user.joinDate}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">8 bookings</div>
                                                    <div className="text-xs text-gray-500">$2,400 spent</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewUser(user)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="View User Details"
                                                        >
                                                            <ViewIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="p-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                            title="Delete User"
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

            case 'Profile':
                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div className="mb-4 lg:mb-0">
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Client Profile
                                </h2>
                                <p className="text-gray-600 text-lg">Manage your personal information and account settings</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {saveSuccess && (
                                    <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg animate-bounce">
                                        <CheckCircle size={16} />
                                        <span className="text-sm font-medium">Changes saved successfully!</span>
                                    </div>
                                )}

                                {isEditing ? (
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-300 text-white bg-red-500"
                                        >
                                            <XCircle size={20} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/25"
                                        >
                                            <Save size={20} />
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleStartEditing}
                                        className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/25"
                                    >
                                        <Edit3 size={20} />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Overview Card */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-6 mb-8 text-white transform transition-all duration-500 hover:scale-[1.02]">
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
                                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
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
                                    <p className="text-emerald-100 mb-1">{profileData.position} • {profileData.company}</p>
                                    <p className="text-emerald-100 text-sm opacity-90">{profileData.email}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-sm">
                                            <Globe size={14} />
                                            {profileData.timezone}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm">
                                            <Calendar size={14} />
                                            Member since {profileData.joinDate}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                                        Active
                                    </div>
                                    <p className="text-emerald-100 text-sm mt-2">Last login: {profileData.lastLogin}</p>
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
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                                            ? 'bg-white text-emerald-600 shadow-lg'
                                            : 'text-gray-600 hover:text-emerald-600'
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
                                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                                <User className="text-emerald-500" size={24} />
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { label: 'First Name', key: 'firstName', icon: User },
                                                    { label: 'Last Name', key: 'lastName', icon: User },
                                                    { label: 'Email', key: 'email', icon: Mail },
                                                    { label: 'Phone', key: 'phone', icon: Phone },
                                                    { label: 'Company', key: 'company', icon: Users },
                                                    { label: 'Position', key: 'position', icon: Settings },
                                                    { label: 'Join Date', key: 'joinDate', icon: Calendar, readOnly: true },
                                                    { label: 'Timezone', key: 'timezone', icon: Globe, readOnly: true }
                                                ].map((field) => {
                                                    const FieldIcon = field.icon;
                                                    return (
                                                        <div key={field.key} className="group">
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                                <FieldIcon size={16} className="text-emerald-500" />
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
                                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                                                />
                                                            ) : (
                                                                <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-emerald-100 transition-all duration-300">
                                                                    <p className="text-gray-900">{profileData[field.key]}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Website Field */}
                                            <div className="mt-6 group">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <Globe size={16} className="text-emerald-500" />
                                                    Website
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="url"
                                                        value={profileData.website}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-emerald-100 transition-all duration-300">
                                                        <a href={`https://${profileData.website}`} className="text-emerald-600 hover:text-emerald-700">
                                                            {profileData.website}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Address Field */}
                                            <div className="mt-6 group">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <MapPin size={16} className="text-emerald-500" />
                                                    Address
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                                        rows="3"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-emerald-100 transition-all duration-300">
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                                        placeholder="Tell clients about yourself and your services..."
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-emerald-100 transition-all duration-300">
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
                                            <Bell className="text-emerald-500" size={24} />
                                            Notification Preferences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(notifications).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 group">
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-gray-600">Receive {key.toLowerCase()} notifications</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleNotificationChange(key)}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${value
                                                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
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
                                            <Shield className="text-emerald-500" size={24} />
                                            Security Settings
                                        </h3>
                                        <div className="space-y-6">
                                            {[
                                                { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' },
                                                { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of new sign-ins' },
                                                { key: 'deviceManagement', label: 'Device Management', description: 'Monitor and manage connected devices' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 group">
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-emerald-700">{item.label}</p>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSecurityChange(item.key, !securitySettings[item.key])}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${securitySettings[item.key]
                                                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                                    >
                                                        <option value="30">30 days</option>
                                                        <option value="60">60 days</option>
                                                        <option value="90">90 days</option>
                                                        <option value="180">180 days</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]">
                                                <Key size={20} />
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                            <Activity className="text-emerald-500" size={24} />
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-4">
                                            {recentActivities.map((activity) => {
                                                const ActivityIcon = activity.icon;
                                                return (
                                                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 group transform hover:scale-[1.02]">
                                                        <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                            <ActivityIcon size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-800 group-hover:text-emerald-700">{activity.action}</p>
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
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        {[
                                            { icon: FileText, label: 'Service Reports', color: 'text-blue-600' },
                                            { icon: CreditCard, label: 'Payment History', color: 'text-emerald-600' },
                                            { icon: Download, label: 'Export Data', color: 'text-purple-600' },
                                            { icon: Settings, label: 'Settings', color: 'text-amber-600' }
                                        ].map((action, index) => {
                                            const ActionIcon = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-emerald-50 rounded-xl transition-all duration-300 transform hover:translate-x-2 group"
                                                >
                                                    <ActionIcon size={20} className={`${action.color} group-hover:scale-110 transition-transform`} />
                                                    <span className="font-medium group-hover:text-emerald-700">{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Business Stats */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Business Stats</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Total Services', value: services.length, icon: FolderOpen },
                                            { label: 'Active Bookings', value: bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length, icon: Calendar },
                                            { label: 'Client Rating', value: '4.8/5', icon: Star },
                                            { label: 'Monthly Revenue', value: '$12.5K', icon: DollarSign }
                                        ].map((stat, index) => {
                                            const StatIcon = stat.icon;
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-emerald-50 transition-all duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <StatIcon size={18} className="text-emerald-500" />
                                                        <span className="text-gray-700 group-hover:text-emerald-700">{stat.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 group-hover:text-emerald-600">{stat.value}</span>
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
        <div className="flex h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-600 to-teal-700 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <h1 className="text-xl font-bold text-white tracking-tight">Client Portal</h1>
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
                                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-all duration-200 transform hover:scale-105 ${activeItem === item.name ? 'bg-white text-emerald-700 shadow-lg font-medium' : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent lg:hidden">
                                Client Portal
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
                                        <p className="text-sm font-semibold text-gray-800">{profileData.firstName} {profileData.lastName}</p>
                                        <p className="text-xs text-gray-500">Service Provider</p>
                                    </div>
                                    <div className="relative">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300 shadow-lg group-hover:shadow-xl transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
                                                {profileData.firstName[0]}{profileData.lastName[0]}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
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
                                                className="w-full flex items-center px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-medium transition-all duration-200 transform hover:translate-x-1 group"
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
                    {renderContent()}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300 animate-fadeIn"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Modal Components */}
            {/* Service Details Modal */}
            {showServiceDetailsModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Service Details</h3>
                                    <p className="text-gray-600 mt-1">Complete information about this service</p>
                                </div>
                                <button
                                    onClick={() => closeModal(setShowServiceDetailsModal)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        {selectedService.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{selectedService.name}</h4>
                                        <p className="text-gray-600">{selectedService.category}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="text-2xl font-bold text-emerald-600">{selectedService.price}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Bookings</p>
                                        <p className="text-2xl font-bold text-gray-900">{selectedService.bookings}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Rating</p>
                                        <p className="text-2xl font-bold text-gray-900">{selectedService.rating}/5</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedService.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {selectedService.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-2">Description</p>
                                    <p className="text-gray-900">{selectedService.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => closeModal(setShowServiceDetailsModal)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Services Modal */}
            {showAllServicesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">All Services</h3>
                                    <p className="text-gray-600 mt-1">Complete service portfolio and performance metrics</p>
                                </div>
                                <button
                                    onClick={() => closeModal(setShowAllServicesModal)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Service Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium">Total Services</p>
                                            <p className="text-2xl font-bold">{services.length}</p>
                                            <p className="text-emerald-100 text-xs mt-1">All categories</p>
                                        </div>
                                        <FolderOpen size={32} className="opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Active Services</p>
                                            <p className="text-2xl font-bold">{services.filter(s => s.status === 'Active').length}</p>
                                            <p className="text-blue-100 text-xs mt-1">Currently available</p>
                                        </div>
                                        <CheckCircle size={32} className="opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Total Bookings</p>
                                            <p className="text-2xl font-bold">{services.reduce((sum, s) => sum + s.bookings, 0)}</p>
                                            <p className="text-purple-100 text-xs mt-1">Across all services</p>
                                        </div>
                                        <BookOpen size={32} className="opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-100 text-sm font-medium">Avg Rating</p>
                                            <p className="text-2xl font-bold">4.7/5</p>
                                            <p className="text-amber-100 text-xs mt-1">Customer satisfaction</p>
                                        </div>
                                        <Star size={32} className="opacity-80" />
                                    </div>
                                </div>
                            </div>

                            {/* Services Revenue Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => {
                                    // Calculate revenue for this service based on time range
                                    const revenueAmount = service.bookings * parseFloat(service.price.replace('$', ''));
                                    const adjustedRevenue = Math.round(revenueAmount * (timeRange === 'daily' ? 0.03 : timeRange === 'weekly' ? 0.12 : timeRange === 'monthly' ? 1 : 12));

                                    return (
                                        <div key={service.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'Active'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {service.status}
                                                    </span>
                                                </div>

                                                <div className="text-center mb-4">
                                                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                                                        ${adjustedRevenue.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-gray-500">Total Revenue</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-gray-900">{service.bookings}</div>
                                                        <p className="text-xs text-gray-500">Bookings</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-gray-900">{service.price}</div>
                                                        <p className="text-xs text-gray-500">Price</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <span>Category: {service.category}</span>
                                                    <div className="flex items-center gap-1">
                                                        <Star size={14} className="text-amber-500" />
                                                        <span>{service.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => closeModal(setShowAllServicesModal)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Transactions Modal */}
            {showAllTransactionsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">All Transactions</h3>
                                    <p className="text-gray-600 mt-1">Complete transaction history with pagination</p>
                                </div>
                                <button
                                    onClick={() => closeModal(setShowAllTransactionsModal)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Pagination Info */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-sm text-gray-600">
                                    Showing {Math.min((transactionsPage - 1) * transactionsPerPage + 1, allTransactions.length)} to {Math.min(transactionsPage * transactionsPerPage, allTransactions.length)} of {allTransactions.length} transactions
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTransactionsPage(prev => Math.max(prev - 1, 1))}
                                        disabled={transactionsPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg">
                                        {transactionsPage}
                                    </span>
                                    <button
                                        onClick={() => setTransactionsPage(prev => Math.min(prev + 1, Math.ceil(allTransactions.length / transactionsPerPage)))}
                                        disabled={transactionsPage === Math.ceil(allTransactions.length / transactionsPerPage)}
                                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {allTransactions.slice((transactionsPage - 1) * transactionsPerPage, transactionsPage * transactionsPerPage).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                                                {transaction.avatar}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{transaction.client}</p>
                                                <p className="text-sm text-gray-600">{transaction.service}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">${transaction.amount}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">{transaction.date}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => closeModal(setShowAllTransactionsModal)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                                    <p className="text-gray-600 mt-1">Complete information about this user</p>
                                </div>
                                <button
                                    onClick={() => closeModal(setShowUserModal)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h4>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block ${selectedUser.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedUser.status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600">Join Date</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedUser.joinDate}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600">Last Login</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedUser.lastLogin}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600">Role</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedUser.role}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600">Total Bookings</p>
                                    <p className="text-lg font-semibold text-gray-900">8</p>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => closeModal(setShowUserModal)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {showBookingModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                                    <p className="text-gray-600 mt-1">Complete information about this booking</p>
                                </div>
                                <button
                                    onClick={() => closeModal(setShowBookingModal)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        {selectedBooking.client.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{selectedBooking.client}</h4>
                                        <p className="text-gray-600">{selectedBooking.service}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="text-lg font-semibold text-gray-900">{selectedBooking.date}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Time</p>
                                        <p className="text-lg font-semibold text-gray-900">{selectedBooking.time}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="text-lg font-semibold text-gray-900">{selectedBooking.duration}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="text-lg font-semibold text-emerald-600">{selectedBooking.amount}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-2">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : selectedBooking.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => closeModal(setShowBookingModal)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Details Modal */}
            {showRequestModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Request Details</h3>
                                    <p className="text-gray-600 mt-1">Complete information about this request</p>
                                </div>
                                <button
                                    onClick={() => closeModal(setShowRequestModal)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        {selectedRequest.client.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{selectedRequest.client}</h4>
                                        <p className="text-gray-600">{selectedRequest.service} • {selectedRequest.date}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Request Type</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedRequest.type === 'Reschedule' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                            {selectedRequest.type}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-800' : selectedRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-2">Reason</p>
                                    <p className="text-gray-900">{selectedRequest.reason}</p>
                                </div>
                                {selectedRequest.type === 'Reschedule' && selectedRequest.rescheduledDate && (
                                    <div className="bg-blue-50 p-4 rounded-xl">
                                        <p className="text-sm text-blue-600 mb-2">Reschedule Date</p>
                                        <p className="text-blue-900 font-semibold">{selectedRequest.rescheduledDate}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => closeModal(setShowRequestModal)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Service Modal */}
            {showAddServiceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Add New Service</h3>
                                    <p className="text-gray-600 mt-1">Create a new service offering</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddServiceModal(false);
                                        setNewServiceData({
                                            name: '',
                                            description: '',
                                            price: '',
                                            category: '',
                                            status: 'Active'
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddServiceSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Service Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newServiceData.name}
                                            onChange={handleAddServiceChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${serviceErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="Enter service name"
                                        />
                                        {serviceErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{serviceErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newServiceData.price}
                                            onChange={handleAddServiceChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${serviceErrors.price ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {serviceErrors.price && (
                                            <p className="text-red-500 text-sm mt-1">{serviceErrors.price}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newServiceData.description}
                                        onChange={handleAddServiceChange}
                                        rows="4"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${serviceErrors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                            }`}
                                        placeholder="Describe your service..."
                                    />
                                    {serviceErrors.description && (
                                        <p className="text-red-500 text-sm mt-1">{serviceErrors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={newServiceData.category}
                                            onChange={handleAddServiceChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="" disabled>Select a Category</option>
                                            <option value="Development">Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Consulting">Consulting</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={newServiceData.status}
                                            onChange={handleAddServiceChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Note:</span>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-1">
                                        New services will start with 0 bookings and 0 rating. You can update these values later.
                                    </p>
                                </div>
                            </form>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddServiceModal(false);
                                        setNewServiceData({
                                            name: '',
                                            description: '',
                                            price: '',
                                            category: 'Development',
                                            status: 'Active'
                                        });
                                    }}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddServiceSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Add Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Modal */}
            {showEditServiceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Edit Service</h3>
                                    <p className="text-gray-600 mt-1">Update service information</p>
                                </div>
                                <button
                                    onClick={() => setShowEditServiceModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditServiceSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Service Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editServiceData.name}
                                            onChange={handleEditServiceChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${serviceErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="Enter service name"
                                        />
                                        {serviceErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{serviceErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={editServiceData.price}
                                            onChange={handleEditServiceChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${serviceErrors.price ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {serviceErrors.price && (
                                            <p className="text-red-500 text-sm mt-1">{serviceErrors.price}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={editServiceData.description}
                                        onChange={handleEditServiceChange}
                                        rows="4"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${serviceErrors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                            }`}
                                        placeholder="Describe your service..."
                                    />
                                    {serviceErrors.description && (
                                        <p className="text-red-500 text-sm mt-1">{serviceErrors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={editServiceData.category}
                                            onChange={handleEditServiceChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="" disabled>Select a Category</option>
                                            <option value="Development">Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Consulting">Consulting</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={editServiceData.status}
                                            onChange={handleEditServiceChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Note:</span>
                                    </div>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Changes will be applied immediately after saving.
                                    </p>
                                </div>
                            </form>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowEditServiceModal(false)}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditServiceSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Booking Modal */}
            {showNewBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Create New Booking</h3>
                                    <p className="text-gray-600 mt-1">Schedule a new service booking</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowNewBookingModal(false);
                                        setNewBookingData({
                                            client: '',
                                            service: '',
                                            date: '',
                                            time: '',
                                            duration: '',
                                            amount: '',
                                            status: ''
                                        });
                                        setBookingErrors({});
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleNewBookingSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Client Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="client"
                                            value={newBookingData.client}
                                            onChange={handleNewBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.client ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="Enter client name"
                                        />
                                        {bookingErrors.client && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.client}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Service *
                                        </label>
                                        <select
                                            name="service"
                                            value={newBookingData.service}
                                            onChange={handleNewBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.service ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                        >
                                            <option value="" disabled>Select a Service</option>
                                            {services.filter(s => s.status === 'Active').map((service) => (
                                                <option key={service.id} value={service.name}>
                                                    {service.name} - {service.price}
                                                </option>
                                            ))}
                                        </select>
                                        {bookingErrors.service && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.service}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={newBookingData.date}
                                            onChange={handleNewBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                        />
                                        {bookingErrors.date && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.date}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={newBookingData.time}
                                            onChange={handleNewBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.time ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                        />
                                        {bookingErrors.time && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.time}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <select
                                            name="duration"
                                            value={newBookingData.duration}
                                            onChange={handleNewBookingChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="" disabled>Select a Duration</option>
                                            <option value="1 hour">1 hour</option>
                                            <option value="1.5 hours">1.5 hours</option>
                                            <option value="2 hours">2 hours</option>
                                            <option value="2.5 hours">2.5 hours</option>
                                            <option value="3 hours">3 hours</option>
                                            <option value="4 hours">4 hours</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Amount *
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={newBookingData.amount}
                                            onChange={handleNewBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.amount ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {bookingErrors.amount && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.amount}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={newBookingData.status}
                                            onChange={handleNewBookingChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="" disabled>Select a Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Note:</span>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Amount will be automatically filled when you select a service. You can modify it if needed.
                                    </p>
                                </div>
                            </form>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowNewBookingModal(false);
                                        setNewBookingData({
                                            client: '',
                                            service: '',
                                            date: '',
                                            time: '',
                                            duration: '',
                                            amount: '',
                                            status: ''
                                        });
                                        setBookingErrors({});
                                    }}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNewBookingSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Create Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Booking Modal */}
            {showEditBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Edit Booking</h3>
                                    <p className="text-gray-600 mt-1">Update booking information</p>
                                </div>
                                <button
                                    onClick={() => setShowEditBookingModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditBookingSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Client Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="client"
                                            value={editBookingData.client}
                                            onChange={handleEditBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.client ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="Enter client name"
                                        />
                                        {bookingErrors.client && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.client}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Service *
                                        </label>
                                        <select
                                            name="service"
                                            value={editBookingData.service}
                                            onChange={handleEditBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.service ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                        >
                                            <option value="" disabled>Select a Service</option>
                                            {services.filter(s => s.status === 'Active').map((service) => (
                                                <option key={service.id} value={service.name}>
                                                    {service.name} - {service.price}
                                                </option>
                                            ))}
                                        </select>
                                        {bookingErrors.service && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.service}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={editBookingData.date}
                                            onChange={handleEditBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                        />
                                        {bookingErrors.date && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.date}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={editBookingData.time}
                                            onChange={handleEditBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.time ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                        />
                                        {bookingErrors.time && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.time}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <select
                                            name="duration"
                                            value={editBookingData.duration}
                                            onChange={handleEditBookingChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="" disabled>Select a Duration</option>
                                            <option value="1 hour">1 hour</option>
                                            <option value="1.5 hours">1.5 hours</option>
                                            <option value="2 hours">2 hours</option>
                                            <option value="2.5 hours">2.5 hours</option>
                                            <option value="3 hours">3 hours</option>
                                            <option value="4 hours">4 hours</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Amount *
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={editBookingData.amount}
                                            onChange={handleEditBookingChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${bookingErrors.amount ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {bookingErrors.amount && (
                                            <p className="text-red-500 text-sm mt-1">{bookingErrors.amount}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={editBookingData.status}
                                            onChange={handleEditBookingChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="" disabled>Select a Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Note:</span>
                                    </div>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Changes will be applied immediately after saving.
                                    </p>
                                </div>
                            </form>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowEditBookingModal(false)}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditBookingSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {showAddClientModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Add New Client</h3>
                                    <p className="text-gray-600 mt-1">Create a new client account</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddClientModal(false);
                                        setNewClientData({
                                            name: '',
                                            email: '',
                                            status: 'Active'
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddClientSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Client Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newClientData.name}
                                            onChange={handleAddClientChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${clientErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                                            placeholder="Enter client name"
                                        />
                                        {clientErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{clientErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={newClientData.email}
                                            onChange={handleAddClientChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${clientErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                                            placeholder="Enter email address"
                                        />
                                        {clientErrors.email && (
                                            <p className="text-red-500 text-sm mt-1">{clientErrors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={newClientData.status}
                                        onChange={handleAddClientChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Note:</span>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-1">
                                        New clients will be assigned the default role of "Customer". You can change their status later.
                                    </p>
                                </div>
                            </form>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddClientModal(false);
                                        setNewClientData({
                                            name: '',
                                            email: '',
                                            status: 'Active'
                                        });
                                    }}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddClientSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Add Client
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
                                    <p className="text-gray-600 mt-1">Update user information</p>
                                </div>
                                <button
                                    onClick={() => setShowEditUserModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditUserSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            User Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editUserData.name}
                                            onChange={handleEditUserChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${clientErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="Enter user name"
                                        />
                                        {clientErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{clientErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editUserData.email}
                                            onChange={handleEditUserChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${clientErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                                }`}
                                            placeholder="Enter email address"
                                        />
                                        {clientErrors.email && (
                                            <p className="text-red-500 text-sm mt-1">{clientErrors.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl  text-gray-700">
                                            Customer
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={editUserData.status}
                                            onChange={handleEditUserChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Note:</span>
                                    </div>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Changes will be applied immediately after saving.
                                    </p>
                                </div>
                            </form>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowEditUserModal(false)}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditUserSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
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
            `}</style>
        </div>
    );
};

export default ClientDashboard;