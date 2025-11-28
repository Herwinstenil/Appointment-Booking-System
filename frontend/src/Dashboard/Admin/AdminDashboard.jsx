import { useState } from 'react';
import {
    Users,
    FolderOpen,
    BarChart3,
    DollarSign,
    User,
    Menu,
    X
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeItem, setActiveItem] = useState('User Management');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarItems = [
        { name: 'User Management', icon: Users },
        { name: 'Service Category Management', icon: FolderOpen },
        { name: 'Booking Analytics', icon: BarChart3 },
        { name: 'Revenue Dashboard', icon: DollarSign },
        { name: 'Profile', icon: User },
    ];

    const renderContent = () => {
        switch (activeItem) {
            case 'User Management':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">User Management</h2>
                        <p className="text-gray-600">Manage users here. Add, edit, or remove user accounts.</p>
                        {/* Placeholder for user management content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            User list and management tools will go here.
                        </div>
                    </div>
                );
            case 'Service Category Management':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Service Category Management</h2>
                        <p className="text-gray-600">Manage service categories and subcategories.</p>
                        {/* Placeholder for service category content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Service categories and management tools will go here.
                        </div>
                    </div>
                );
            case 'Booking Analytics':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Booking Analytics</h2>
                        <p className="text-gray-600">View analytics and insights on bookings.</p>
                        {/* Placeholder for analytics content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Charts and analytics data will go here.
                        </div>
                    </div>
                );
            case 'Revenue Dashboard':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Revenue Dashboard</h2>
                        <p className="text-gray-600">Monitor revenue and financial metrics.</p>
                        {/* Placeholder for revenue content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Revenue charts and metrics will go here.
                        </div>
                    </div>
                );
            case 'Profile':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Profile</h2>
                        <p className="text-gray-600">Manage your admin profile settings.</p>
                        {/* Placeholder for profile content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Profile settings and information will go here.
                        </div>
                    </div>
                );
            default:
                return <div className="p-6">Select an item from the sidebar.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="mt-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setActiveItem(item.name);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 ${activeItem === item.name ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                <Icon size={20} className="mr-3" />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="bg-white shadow-sm border-b">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-200"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-semibold lg:hidden">Admin Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, Admin</span>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                A
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
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default AdminDashboard;
