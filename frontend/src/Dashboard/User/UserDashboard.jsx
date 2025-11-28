import { useState } from 'react';
import {
    FolderOpen,
    Search,
    Calendar,
    BookOpen,
    User,
    Menu,
    X
} from 'lucide-react';

const UserDashboard = () => {
    const [activeItem, setActiveItem] = useState('View Available Services');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarItems = [
        { name: 'View Available Services', icon: FolderOpen },
        { name: 'Search Providers', icon: Search },
        { name: 'Book Appointment', icon: Calendar },
        { name: 'View Upcoming & Past Appointments', icon: BookOpen },
    ];

    const renderContent = () => {
        switch (activeItem) {
            case 'View Available Services':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">View Available Services</h2>
                        <p className="text-gray-600">Browse and view all available services.</p>
                        {/* Placeholder for view available services content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            List of available services will go here.
                        </div>
                    </div>
                );
            case 'Search Providers':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Search Providers</h2>
                        <p className="text-gray-600">Search for service providers based on your needs.</p>
                        {/* Placeholder for search providers content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Search tools and provider list will go here.
                        </div>
                    </div>
                );
            case 'Book Appointment':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
                        <p className="text-gray-600">Schedule and book appointments with providers.</p>
                        {/* Placeholder for book appointment content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Appointment booking form and calendar will go here.
                        </div>
                    </div>
                );
            case 'View Upcoming & Past Appointments':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">View Upcoming & Past Appointments</h2>
                        <p className="text-gray-600">View your upcoming and past appointments.</p>
                        {/* Placeholder for view appointments content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            List of upcoming and past appointments will go here.
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
                    <h1 className="text-xl font-bold">User Dashboard</h1>
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
                        <h1 className="text-lg font-semibold lg:hidden">User Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, User</span>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                U
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

export default UserDashboard;
