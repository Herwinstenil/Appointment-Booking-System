import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Edit,
    Trash2,
    CheckCircle
} from 'lucide-react';

const ClientDashboard = () => {
    const [activeItem, setActiveItem] = useState('Create/Edit Services');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // User Management State
    const [users, setUsers] = useState([
        { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Client', status: 'Active', joinDate: '2024-01-10', lastLogin: '2 hours ago' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'User', status: 'Active', joinDate: '2024-01-08', lastLogin: '1 day ago' },
        { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'Client', status: 'Inactive', joinDate: '2024-01-05', lastLogin: '3 days ago' },
        { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'User', status: 'Active', joinDate: '2024-01-03', lastLogin: '5 hours ago' },
        { id: 5, name: 'Alex Brown', email: 'alex@example.com', role: 'Client', status: 'Active', joinDate: '2024-01-01', lastLogin: '12 hours ago' }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();
    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logging out...');
        // Example: clear tokens, redirect to login, etc.
        navigate('/user/login');
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

    const sidebarItems = [
        { name: 'Create/Edit Services', icon: FolderOpen },
        { name: 'Manage Availability', icon: Calendar },
        { name: 'View Bookings', icon: BookOpen },
        { name: 'Respond to Reschedule/Cancel', icon: MessageSquare },
        { name: 'User Management', icon: Users },
        { name: 'Profile', icon: User },
    ];

    const renderContent = () => {
        switch (activeItem) {
            case 'Create/Edit Services':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Create/Edit Services</h2>
                        <p className="text-gray-600 mb-6">Create and edit your services here.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <FolderOpen size={48} className="mx-auto mb-2 text-emerald-500" />
                                    <p className="font-medium">Service creation and editing tools will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Manage Availability':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Manage Availability</h2>
                        <p className="text-gray-600 mb-6">Set and manage your availability schedule.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <Calendar size={48} className="mx-auto mb-2 text-emerald-500" />
                                    <p className="font-medium">Availability calendar and settings will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'View Bookings':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">View Bookings</h2>
                        <p className="text-gray-600 mb-6">View all your bookings and appointments.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <BookOpen size={48} className="mx-auto mb-2 text-emerald-500" />
                                    <p className="font-medium">Booking list and details will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Respond to Reschedule/Cancel':
                return (
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Respond to Reschedule/Cancel</h2>
                        <p className="text-gray-600 mb-6">Respond to requests for rescheduling or canceling bookings.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <MessageSquare size={48} className="mx-auto mb-2 text-emerald-500" />
                                    <p className="font-medium">Reschedule and cancel request management will go here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'User Management':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    User Management
                                </h2>
                                <p className="text-gray-600">Manage and monitor user accounts and permissions</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 mt-4 lg:mt-0">
                                <Plus size={16} />
                                Add User
                            </button>
                        </div>

                        {/* User Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                    </div>
                                    <Users className="text-emerald-500" size={32} />
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
                                        <p className="text-gray-600 text-sm font-medium">Clients</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'Client').length}</p>
                                    </div>
                                    <User className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Inactive</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'Inactive').length}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <X size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Actions */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                                    >
                                        <CheckCircle size={16} />
                                        {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    {selectedUsers.length > 0 && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105">
                                            <Trash2 size={16} />
                                            Delete Selected ({selectedUsers.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.length === users.length && users.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleUserSelect(user.id)}
                                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'Client' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-emerald-600 hover:text-emerald-900 transition-colors duration-200">
                                                            <ViewIcon size={16} />
                                                        </button>
                                                        <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 transition-colors duration-200">
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
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Profile</h2>
                        <p className="text-gray-600 mb-6">Manage your client profile settings.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <User size={48} className="mx-auto mb-2 text-emerald-500" />
                                    <p className="font-medium">Profile settings and information will go here.</p>
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
                                        <p className="text-sm font-semibold text-gray-800">Client</p>
                                        <p className="text-xs text-gray-500">Service Provider</p>
                                    </div>
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
                                            C
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
                                            <p className="text-sm font-semibold text-gray-800">Client</p>
                                            <p className="text-xs text-gray-500 mt-1">client@example.com</p>
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

export default ClientDashboard;