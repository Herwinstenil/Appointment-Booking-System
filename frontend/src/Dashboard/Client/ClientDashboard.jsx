import { useState } from 'react';
import {
    FolderOpen,
    Calendar,
    BookOpen,
    MessageSquare,
    User,
    Menu,
    X
} from 'lucide-react';

const ClientDashboard = () => {
    const [activeItem, setActiveItem] = useState('Create/Edit Services');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarItems = [
        { name: 'Create/Edit Services', icon: FolderOpen },
        { name: 'Manage Availability', icon: Calendar },
        { name: 'View Bookings', icon: BookOpen },
        { name: 'Respond to Reschedule/Cancel', icon: MessageSquare },
        { name: 'Profile', icon: User },
    ];

    const renderContent = () => {
        switch (activeItem) {
            case 'Create/Edit Services':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Create/Edit Services</h2>
                        <p className="text-gray-600">Create and edit your services here.</p>
                        {/* Placeholder for create/edit services content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Service creation and editing tools will go here.
                        </div>
                    </div>
                );
            case 'Manage Availability':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Manage Availability</h2>
                        <p className="text-gray-600">Set and manage your availability schedule.</p>
                        {/* Placeholder for manage availability content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Availability calendar and settings will go here.
                        </div>
                    </div>
                );
            case 'View Bookings':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">View Bookings</h2>
                        <p className="text-gray-600">View all your bookings and appointments.</p>
                        {/* Placeholder for view bookings content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Booking list and details will go here.
                        </div>
                    </div>
                );
            case 'Respond to Reschedule/Cancel':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Respond to Reschedule/Cancel</h2>
                        <p className="text-gray-600">Respond to requests for rescheduling or canceling bookings.</p>
                        {/* Placeholder for respond content */}
                        <div className="mt-4 bg-gray-100 p-4 rounded">
                            Reschedule and cancel request management will go here.
                        </div>
                    </div>
                );
            case 'Profile':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Profile</h2>
                        <p className="text-gray-600">Manage your client profile settings.</p>
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
                    <h1 className="text-xl font-bold">Client Dashboard</h1>
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
                        <h1 className="text-lg font-semibold lg:hidden">Client Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, Client</span>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                C
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

export default ClientDashboard;
