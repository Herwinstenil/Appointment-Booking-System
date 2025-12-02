import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    const [users, setUsers] = useState([
        { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-10', lastLogin: '2 hours ago', clients: 45, revenue: '$12,500' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager', status: 'Active', joinDate: '2024-01-08', lastLogin: '1 day ago', clients: 32, revenue: '$8,700' },
        { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'Support', status: 'Inactive', joinDate: '2024-01-05', lastLogin: '3 days ago', clients: 18, revenue: '$4,200' },
        { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-03', lastLogin: '5 hours ago', clients: 56, revenue: '$15,300' },
        { id: 5, name: 'Alex Brown', email: 'alex@example.com', role: 'Manager', status: 'Active', joinDate: '2024-01-01', lastLogin: '12 hours ago', clients: 41, revenue: '$11,800' }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Add Client Modal State
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: 'Client',
        status: 'Active',
        address: '',
        notes: ''
    });

    // Service Category Management State
    const [services, setServices] = useState([
        { id: 1, name: 'Web Development', description: 'Custom website development services', status: 'Active', price: '$500', category: 'Development', clients: 24, rating: 4.8 },
        { id: 2, name: 'Mobile App Development', description: 'iOS and Android app development', status: 'Active', price: '$800', category: 'Development', clients: 18, rating: 4.9 },
        { id: 3, name: 'UI/UX Design', description: 'User interface and experience design', status: 'Active', price: '$300', category: 'Design', clients: 32, rating: 4.7 },
        { id: 4, name: 'Digital Marketing', description: 'SEO and social media marketing', status: 'Inactive', price: '$400', category: 'Marketing', clients: 12, rating: 4.5 },
        { id: 5, name: 'IT Consulting', description: 'Technical consultation services', status: 'Active', price: '$200', category: 'Consulting', clients: 28, rating: 4.6 }
    ]);

    // Revenue Dashboard State
    const [timeRange, setTimeRange] = useState('monthly');
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    // Revenue Dashboard Data
    const revenueMetrics = {
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

    const revenueTrend = [
        { month: 'Jan', revenue: 85000, growth: 5.2 },
        { month: 'Feb', revenue: 92000, growth: 8.2 },
        { month: 'Mar', revenue: 101000, growth: 9.8 },
        { month: 'Apr', revenue: 95000, growth: -5.9 },
        { month: 'May', revenue: 108000, growth: 13.7 },
        { month: 'Jun', revenue: 115000, growth: 6.5 },
        { month: 'Jul', revenue: 98750, growth: -14.1 }
    ];

    const revenueByCategory = [
        { category: 'Premium Services', amount: 450000, percentage: 35.9, growth: 15.2, color: 'bg-rose-500' },
        { category: 'Consultation', amount: 320000, percentage: 25.5, growth: 8.7, color: 'bg-blue-500' },
        { category: 'Basic Services', amount: 280000, percentage: 22.3, growth: 3.2, color: 'bg-green-500' },
        { category: 'Add-ons', amount: 203000, percentage: 16.2, growth: 12.8, color: 'bg-purple-500' }
    ];

    const recentTransactions = [
        { id: 1, client: 'John Smith', service: 'Premium Support', amount: 299, date: '2024-01-15', status: 'completed', avatar: 'JS' },
        { id: 2, client: 'Sarah Johnson', service: 'Consultation', amount: 150, date: '2024-01-15', status: 'completed', avatar: 'SJ' },
        { id: 3, client: 'Mike Davis', service: 'Basic Service', amount: 89, date: '2024-01-14', status: 'pending', avatar: 'MD' },
        { id: 4, client: 'Emma Wilson', service: 'Premium Support', amount: 299, date: '2024-01-14', status: 'completed', avatar: 'EW' },
        { id: 5, client: 'Alex Brown', service: 'Add-on Package', amount: 75, date: '2024-01-13', status: 'completed', avatar: 'AB' }
    ];

    const performanceMetrics = [
        { name: 'Conversion Rate', value: '3.2%', change: '+0.4%', positive: true },
        { name: 'Avg Session Duration', value: '4m 12s', change: '+23s', positive: true },
        { name: 'Bounce Rate', value: '42%', change: '-3.2%', positive: true },
        { name: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', positive: true }
    ];

    // Booking Analytics Data
    const bookingData = {
        totalBookings: 1247,
        completedBookings: 984,
        pendingBookings: 187,
        cancelledBookings: 76,
        bookingRate: 78.9
    };

    const bookingTrend = [
        { day: 'Mon', bookings: 45 },
        { day: 'Tue', bookings: 52 },
        { day: 'Wed', bookings: 48 },
        { day: 'Thu', bookings: 61 },
        { day: 'Fri', bookings: 55 },
        { day: 'Sat', bookings: 38 },
        { day: 'Sun', bookings: 29 }
    ];

    const popularServices = [
        { service: 'Web Development', bookings: 234, revenue: 117000 },
        { service: 'Mobile App Development', bookings: 189, revenue: 151200 },
        { service: 'UI/UX Design', bookings: 156, revenue: 46800 },
        { service: 'Consultation', bookings: 143, revenue: 28600 }
    ];

    // System Analytics Data
    const systemMetrics = {
        totalUsers: 1250,
        activeUsers: 847,
        newUsers: 45,
        storageUsed: '2.3 GB',
        serverUptime: '99.9%',
        responseTime: '120ms'
    };

    const navigate = useNavigate();

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
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            phone: '',
            company: '',
            role: 'Client',
            status: 'Active',
            address: '',
            notes: ''
        });
    };

    const handleSaveClient = () => {
        // Basic validation
        if (!newClient.name.trim() || !newClient.email.trim()) {
            alert('Please fill in all required fields (Name and Email)');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newClient.email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Create new client object
        const clientId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newClientObj = {
            id: clientId,
            name: newClient.name,
            email: newClient.email,
            role: newClient.role,
            status: newClient.status,
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: 'Just now',
            clients: Math.floor(Math.random() * 50) + 1,
            revenue: `$${Math.floor(Math.random() * 20000) + 1000}`,
            company: newClient.company,
            phone: newClient.phone,
            address: newClient.address,
            notes: newClient.notes
        };

        // Add to users array
        setUsers(prev => [newClientObj, ...prev]);

        // Close modal and reset form
        handleCloseAddClientModal();

        // Show success message
        alert(`Client "${newClient.name}" added successfully!`);
    };

    const handleNewClientChange = (field, value) => {
        setNewClient(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Delete user handler
    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(prev => prev.filter(user => user.id !== userId));
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
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

    const recentActivities = [
        {
            id: 1,
            action: 'Logged in to admin dashboard',
            time: 'Today, 10:30 AM',
            status: 'success',
            icon: CheckCircle
        },
        {
            id: 2,
            action: 'Updated user permissions for 3 accounts',
            time: 'Yesterday, 3:45 PM',
            status: 'modified',
            icon: Edit3
        },
        {
            id: 3,
            action: 'Created new service category "Premium Support"',
            time: '2 days ago, 9:15 AM',
            status: 'created',
            icon: FolderOpen
        },
        {
            id: 4,
            action: 'Security alert: Unusual login attempt blocked',
            time: '3 days ago, 2:20 PM',
            status: 'alert',
            icon: AlertCircle
        },
        {
            id: 5,
            action: 'Generated monthly revenue report',
            time: '4 days ago, 11:00 AM',
            status: 'completed',
            icon: FileText
        }
    ];

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
    const AddClientModal = () => (
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
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                                    value={newClient.name}
                                    onChange={(e) => handleNewClientChange('name', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                    placeholder="Enter client name"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-rose-500" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={newClient.email}
                                    onChange={(e) => handleNewClientChange('email', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                    placeholder="client@example.com"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Phone size={16} className="text-rose-500" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={newClient.phone}
                                    onChange={(e) => handleNewClientChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Building size={16} className="text-rose-500" />
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={newClient.company}
                                    onChange={(e) => handleNewClientChange('company', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                    placeholder="Company name"
                                />
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <select
                                    value={newClient.role}
                                    onChange={(e) => handleNewClientChange('role', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                >
                                    <option value="Client">Client</option>
                                    <option value="VIP Client">VIP Client</option>
                                    <option value="Enterprise">Enterprise</option>
                                    <option value="Partner">Partner</option>
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleNewClientChange('status', 'Active')}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${newClient.status === 'Active'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${newClient.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            Active
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleNewClientChange('status', 'Inactive')}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${newClient.status === 'Inactive'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${newClient.status === 'Inactive' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                            Inactive
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-rose-500" />
                                    Address
                                </label>
                                <textarea
                                    value={newClient.address}
                                    onChange={(e) => handleNewClientChange('address', e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                    placeholder="Enter client address"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={newClient.notes}
                                    onChange={(e) => handleNewClientChange('notes', e.target.value)}
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
                                {newClient.name ? newClient.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CN'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {newClient.name || 'Client Name'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {newClient.email || 'email@example.com'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${newClient.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {newClient.status || 'Active'}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {newClient.role || 'Client'}
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
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveClient}
                                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105"
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
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${timeRange === range
                                                ? 'bg-rose-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-rose-600'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
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
                            <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Revenue Trend</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                                            Revenue
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="h-64 flex items-end justify-between space-x-2 relative">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="border-t border-gray-100"></div>
                                        ))}
                                    </div>

                                    {revenueTrend.map((data, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                                            <div
                                                className="w-full bg-gradient-to-t from-rose-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:from-rose-600 hover:to-pink-600 cursor-pointer relative overflow-hidden"
                                                style={{ height: `${(data.revenue / 120000) * 100}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2 font-medium">{data.month}</p>
                                            <p className="text-xs text-gray-500">${(data.revenue / 1000).toFixed(0)}k</p>

                                            {/* Hover Tooltip */}
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10">
                                                <div className="font-semibold">${data.revenue.toLocaleString()}</div>
                                                <div className={`flex items-center gap-1 text-xs ${data.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {data.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                    {Math.abs(data.growth)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">System Performance</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Response Time', value: systemMetrics.responseTime, change: '-15ms', positive: true },
                                        { name: 'Active Services', value: services.filter(s => s.status === 'Active').length, change: '+2', positive: true },
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
                                    <button className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors">
                                        View Details
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Total Users', value: systemMetrics.totalUsers, icon: UsersIcon, color: 'bg-blue-500' },
                                        { label: 'Active Services', value: services.filter(s => s.status === 'Active').length, icon: FolderOpen, color: 'bg-green-500' },
                                        { label: 'Monthly Bookings', value: bookingData.totalBookings, icon: Calendar, color: 'bg-purple-500' },
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
                                    <button className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => {
                                        const ActivityIcon = activity.icon;
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
                                    onClick={handleAddClient}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
                                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                    </div>
                                    <Users className="text-rose-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Active Users</p>
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
                                        <p className="text-gray-600 text-sm font-medium">Admins</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'Admin').length}</p>
                                    </div>
                                    <User className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Managers</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'Manager').length}</p>
                                    </div>
                                    <Users className="text-purple-500" size={32} />
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
                                                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
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
                                                        className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {user.name.split(' ').map(n => n[0]).join('')}
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
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.clients}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-rose-600">{user.revenue}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <ViewIcon size={16} />
                                                        </button>
                                                        <button
                                                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
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
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                                    <Download size={16} />
                                    Export Data
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
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
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Booking Trend</h3>
                                <div className="h-64 flex items-end justify-between space-x-2">
                                    {bookingTrend.map((data, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center group">
                                            <div
                                                className="w-full bg-gradient-to-t from-rose-500 to-pink-500 rounded-t-lg transition-all duration-300 hover:from-rose-600 hover:to-pink-600 cursor-pointer relative overflow-hidden"
                                                style={{ height: `${(data.bookings / 70) * 100}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2 font-medium">{data.day}</p>
                                            <p className="text-xs text-gray-500">{data.bookings}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Services */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Popular Services</h3>
                                <div className="space-y-4">
                                    {popularServices.map((service, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-rose-50 transition-all duration-300">
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
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${timeRange === range
                                                ? 'bg-rose-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-rose-600'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                                    <Filter size={16} />
                                    Filters
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
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
                                    <button className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors">
                                        View Details
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {revenueByCategory.map((category, index) => (
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
                                    <button className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentTransactions.map((transaction) => (
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
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-300 text-white bg-red-500"
                                        >
                                            <XCircle size={20} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25"
                                        >
                                            <Save size={20} />
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleStartEditing}
                                        className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-rose-500/25"
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
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
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
                                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
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
                                                                    onChange={(e) => setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
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
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${value
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
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${securitySettings[item.key]
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                                                    >
                                                        <option value="30">30 days</option>
                                                        <option value="60">60 days</option>
                                                        <option value="90">90 days</option>
                                                        <option value="180">180 days</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-[1.02]">
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
                                                const ActivityIcon = activity.icon;
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
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
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
                                                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-rose-50 rounded-xl transition-all duration-300 transform hover:translate-x-2 group"
                                                >
                                                    <ActionIcon size={20} className={`${action.color} group-hover:scale-110 transition-transform`} />
                                                    <span className="font-medium group-hover:text-rose-700">{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Account Stats */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
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
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-rose-50 transition-all duration-300">
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
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
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
                                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-all duration-200 transform hover:scale-105 ${activeItem === item.name ? 'bg-white text-rose-700 shadow-lg font-medium' : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                    {renderContent()}
                </main>
            </div>

            {/* Add Client Modal */}
            {showAddClientModal && <AddClientModal />}

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