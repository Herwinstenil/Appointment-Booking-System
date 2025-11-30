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
    XCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeItem, setActiveItem] = useState('User Management');
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
        setOriginalProfileData({ ...profileData }); // Update original data
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleCancelEdit = () => {
        // Reset to original data
        setProfileData({ ...originalProfileData });
        setIsEditing(false);
    };

    const handleStartEditing = () => {
        // Store current data as original when starting to edit
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

    const sidebarItems = [
        { name: 'User Management', icon: Users },
        { name: 'Service Category Management', icon: FolderOpen },
        { name: 'Booking Analytics', icon: BarChart3 },
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
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-50 border-green-200';
            case 'modified': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'created': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'alert': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'User Management':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">User Management</h2>
                        <p className="text-gray-600 mb-6">Manage users here. Add, edit, or remove user accounts.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <Users size={48} className="mx-auto mb-2 text-rose-500" />
                                    <p className="font-medium">User list and management tools will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Service Category Management':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Service Category Management</h2>
                        <p className="text-gray-600 mb-6">Manage service categories and subcategories.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <FolderOpen size={48} className="mx-auto mb-2 text-rose-500" />
                                    <p className="font-medium">Service categories and management tools will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Booking Analytics':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Booking Analytics</h2>
                        <p className="text-gray-600 mb-6">View analytics and insights on bookings.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <BarChart3 size={48} className="mx-auto mb-2 text-rose-500" />
                                    <p className="font-medium">Charts and analytics data will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Revenue Dashboard':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Revenue Dashboard</h2>
                        <p className="text-gray-600 mb-6">Monitor revenue and financial metrics.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <DollarSign size={48} className="mx-auto mb-2 text-rose-500" />
                                    <p className="font-medium">Revenue charts and metrics will go here.</p>
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
                                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
                                            A
                                        </div>
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
                                            <p className="text-sm font-semibold text-gray-800">Admin</p>
                                            <p className="text-xs text-gray-500 mt-1">admin@roriri.com</p>
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
                
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
                
                .animate-dropdown {
                    animation: dropdown 0.2s ease-out;
                }
                
                /* Smooth scrolling */
                .overflow-y-auto {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;