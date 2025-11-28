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
                    <div className="p-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">User Management</h2>
                        <p className="text-gray-600 mb-6">Manage users here. Add, edit, or remove user accounts.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
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
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
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
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
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
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
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
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Profile</h2>
                        <p className="text-gray-600 mb-6">Manage your admin profile settings.</p>
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                <div className="text-center">
                                    <User size={48} className="mx-auto mb-2 text-rose-500" />
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
        <div className="flex h-screen bg-gradient-to-br from-rose-50 to-pink-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-rose-600 to-pink-700 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
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
                <header className="bg-white shadow-md border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-semibold lg:hidden text-gray-800">Admin Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 font-medium">Welcome, Admin</span>
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
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
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
            
            {/* Add CSS animation for fade-in effect */}
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
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;