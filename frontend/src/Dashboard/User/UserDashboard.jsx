import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    BookOpen,
    History,
    User,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Home,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Star,
    DollarSign,
    MapPin,
    Phone,
    Mail,
    Settings,
    Shield,
    Bell,
    Camera,
    Edit3,
    Save,
    Download,
    Filter,
    Search,
    Plus,
    Eye as ViewIcon,
    Edit,
    Trash2,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    CreditCard,
    Activity,
    FileText,
    Globe,
    Key,
    Download as DownloadIcon,
    CalendarDays,
    Clock4,
    Users,
    FolderOpen,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext.jsx';

const emptyProfileTemplate = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    joinDate: '',
    lastLogin: '',
    avatar: '',
    role: '',
    status: '',
    createdAt: '',
    updatedAt: ''
};

const getRoleLabel = (role = '') => {
    if (!role) return 'Role not assigned';
    const normalized = role.toString().toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatProfileData = (record = {}) => {
    const firstName = record.firstName || '';
    const lastName = record.lastName || '';
    const joinDate = record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '';
    const lastLogin = record.lastLogin ? new Date(record.lastLogin).toLocaleString() : '';
    const phone = record.phone || record.mobile || '';
    const avatar = record.avatar || record.avatarUrl || '';

    return {
        id: record.id || '',
        firstName,
        lastName,
        email: record.email || '',
        phone,
        address: record.address || '',
        bio: record.bio || '',
        joinDate,
        lastLogin,
        avatar,
        role: record.role || '',
        status: record.status || (record.isActive ? 'active' : ''),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
};

const UserDashboard = () => {
    const navigate = useNavigate();
    const { logout, user, getAuthHeaders, API_BASE_URL } = useAuth();
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Chart state
    const [chartType, setChartType] = useState('area');
    const [showChartMenu, setShowChartMenu] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaveError, setProfileSaveError] = useState(null);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [serviceError, setServiceError] = useState('');

    const STATUS_LABELS = {
        PENDING: 'Upcoming',
        CONFIRMED: 'Confirmed',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
    };

    const mapStatusLabel = (status = '') => {
        const key = status?.toString().toUpperCase();
        return STATUS_LABELS[key] || status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Upcoming';
    };

    const formatCurrency = (value) => {
        const amount = Number(value);
        if (Number.isNaN(amount)) return '$0.00';
        return `$${amount.toFixed(2)}`;
    };

    const normalizeAppointment = (raw = {}) => {
        const appointmentDate = raw.appointmentDate || raw.date;
        const appointmentTime = raw.appointmentTime || raw.time || '';
        const parsedDate = appointmentDate ? new Date(appointmentDate) : null;
        const providerName = raw.client?.company || [raw.client?.firstName, raw.client?.lastName].filter(Boolean).join(' ') || 'Service Team';

        return {
            id: raw.id,
            service: raw.serviceName || raw.service?.name || 'Service',
            provider: providerName,
            date: parsedDate ? parsedDate.toLocaleDateString() : '',
            time: appointmentTime,
            appointmentDate,
            appointmentTime,
            status: mapStatusLabel(raw.status),
            statusRaw: raw.status,
            amount: formatCurrency(raw.amount ?? raw.service?.price),
            duration: raw.duration || raw.service?.duration || '1 hour',
            rating: raw.rating || 0,
            comment: raw.comment || '',
            notes: raw.notes || '',
            serviceId: raw.serviceId,
            clientId: raw.clientId,
            createdAt: raw.createdAt
        };
    };

    const loadAppointments = useCallback(async () => {
        setAppointmentsLoading(true);
        setAppointmentsError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                headers: getAuthHeaders()
            });
            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to load appointments');
            }

            const records = payload.data?.appointments || [];
            const mapped = records.map(normalizeAppointment);
            setAppointments(mapped);
            setBookingHistory(mapped.filter(entry => entry.status === 'Completed'));
        } catch (err) {
            console.error('Failed to load appointments', err);
            setAppointments([]);
            setBookingHistory([]);
            setAppointmentsError(err.message || 'Failed to load appointments');
        } finally {
            setAppointmentsLoading(false);
        }
    }, [API_BASE_URL, getAuthHeaders]);

    useEffect(() => {
        if (!user) {
            return;
        }

        let isMounted = true;

        const fetchServices = async () => {
            setServiceLoading(true);
            setServiceError('');

            try {
                const response = await fetch(`${API_BASE_URL}/services/active`, {
                    headers: getAuthHeaders()
                });
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to load services');
                }

                if (isMounted) {
                    setServiceOptions(payload.data.services || []);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
                if (isMounted) {
                    setServiceOptions([]);
                    setServiceError(error.message || 'Failed to load services');
                }
            } finally {
                if (isMounted) {
                    setServiceLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
        };
    }, [API_BASE_URL, getAuthHeaders, user]);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!user) {
            setProfileData({ ...emptyProfileTemplate });
            setOriginalProfileData({ ...emptyProfileTemplate });
            setImagePreview(null);
            setProfileError(null);
            setProfileLoading(false);
            return;
        }

        let isMounted = true;

        const fetchProfile = async () => {
            setProfileLoading(true);
            setProfileError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    headers: getAuthHeaders()
                });
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to load profile');
                }

                const userRecord = payload.data?.user;
                if (!userRecord) {
                    throw new Error('Profile not found');
                }

                const formattedProfile = formatProfileData(userRecord);
                if (!isMounted) return;
                setProfileData({ ...formattedProfile });
                setOriginalProfileData({ ...formattedProfile });
                setImagePreview(formattedProfile.avatar || null);
            } catch (err) {
                if (!isMounted) return;
                setProfileError(err.message || 'Failed to load profile');
            } finally {
                if (isMounted) {
                    setProfileLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [API_BASE_URL, getAuthHeaders, user]);

    // Modal States
    const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showViewBookingModal, setShowViewBookingModal] = useState(false);
    const [showEditBookingModal, setShowEditBookingModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
    const [justBooked, setJustBooked] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    // Store original data for cancel functionality
    const [originalProfileData, setOriginalProfileData] = useState(() => ({ ...emptyProfileTemplate }));
    const [profileData, setProfileData] = useState(() => ({ ...emptyProfileTemplate }));

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        bookingReminders: true,
        promotionalOffers: false,
        newsletter: true,
        securityAlerts: true
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: '60',
        passwordExpiry: '90',
        loginAlerts: true
    });

    // Appointments State - Load from API
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [appointmentsError, setAppointmentsError] = useState(null);

    // Booking History State - Load from API
    const [bookingHistory, setBookingHistory] = useState([]);

    // Fetch appointments when the component mounts
    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    // Appointments filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeAppointmentTab, setActiveAppointmentTab] = useState('All');

    // Dashboard search state
    const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');

    // User Stats - Calculate from real data
    const userStats = useMemo(() => {
        const totalBookings = bookingHistory.length;
        const completedBookings = bookingHistory.filter(b => b.status === 'Completed').length;
        const upcomingBookings = appointments.filter(a => a.status === 'Upcoming').length;
        const cancelledBookings = appointments.filter(a => a.status === 'Cancelled').length;

        // Calculate total spent from booking history
        const totalSpent = bookingHistory.reduce((sum, booking) => {
            const amount = parseFloat(booking.amount.replace('$', ''));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Calculate average rating from completed bookings
        const completedWithRating = bookingHistory.filter(b => b.status === 'Completed' && b.rating);
        const averageRating = completedWithRating.length > 0
            ? completedWithRating.reduce((sum, b) => sum + b.rating, 0) / completedWithRating.length
            : 0;

        // Find favorite category (most common service type)
        const serviceCounts = {};
        bookingHistory.forEach(booking => {
            serviceCounts[booking.service] = (serviceCounts[booking.service] || 0) + 1;
        });
        const favoriteCategory = Object.keys(serviceCounts).reduce((a, b) =>
            serviceCounts[a] > serviceCounts[b] ? a : b, 'Web Development'
        );

        // Calculate loyalty points (example: 10 points per completed booking)
        const loyaltyPoints = completedBookings * 10;

        return {
            totalBookings,
            completedBookings,
            upcomingBookings,
            cancelledBookings,
            totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            favoriteCategory,
            loyaltyPoints
        };
    }, [appointments, bookingHistory]);

    // Monthly Spending Data
    const monthlySpending = [
        { month: 'Jul', amount: 850, bookings: 3 },
        { month: 'Aug', amount: 920, bookings: 4 },
        { month: 'Sep', amount: 1010, bookings: 5 },
        { month: 'Oct', amount: 950, bookings: 4 },
        { month: 'Nov', amount: 1080, bookings: 5 },
        { month: 'Dec', amount: 1150, bookings: 6 },
        { month: 'Jan', amount: 1250, bookings: 7 }
    ];

    // Transform monthly spending data for chart
    const revenueTrend = monthlySpending.map((data, index) => {
        let growth = 0;
        if (index > 0) {
            const prevAmount = monthlySpending[index - 1].amount;
            growth = ((data.amount - prevAmount) / prevAmount) * 100;
        }
        return {
            label: data.month,
            revenue: data.amount,
            growth: Math.round(growth * 100) / 100, // Round to 2 decimal places
            bookings: data.bookings
        };
    });

    const [recentActivities, setRecentActivities] = useState([
        {
            id: 1,
            action: 'Booked Web Development Consultation',
            time: 'Today, 09:30 AM',
            status: 'booking',
            icon: Calendar
        },
        {
            id: 2,
            action: 'Rated UI/UX Design service 5 stars',
            time: 'Yesterday, 3:15 PM',
            status: 'rating',
            icon: Star
        },
        {
            id: 3,
            action: 'Updated profile information',
            time: '2 days ago, 11:45 AM',
            status: 'profile',
            icon: User
        },
        {
            id: 4,
            action: 'Cancelled Mobile App Planning session',
            time: '3 days ago, 2:30 PM',
            status: 'cancellation',
            icon: XCircle
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'booking': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'rating': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'profile': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'cancellation': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const handleLogout = () => {
        logout();
        const userRole = localStorage.getItem('userRole');
        navigate(`/user/login?from=dashboard&role=${userRole}`);
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

    const handleSaveProfile = async () => {
        setProfileSaveError(null);
        setProfileSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    mobile: profileData.phone,
                    address: profileData.address,
                    bio: profileData.bio,
                    avatarUrl: imagePreview || profileData.avatar
                })
            });

            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to save profile');
            }

            const updatedProfile = formatProfileData(payload.data.user);
            setProfileData({ ...updatedProfile });
            setOriginalProfileData({ ...updatedProfile });
            setImagePreview(updatedProfile.avatar || null);
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Saving profile data failed:', error);
            setProfileSaveError(error.message || 'Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setProfileData({ ...originalProfileData });
        setImagePreview(originalProfileData.avatar || null);
        setProfileSaveError(null);
        setIsEditing(false);
    };

    const handleStartEditing = () => {
        setOriginalProfileData({ ...profileData });
        setProfileSaveError(null);
        setIsEditing(true);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target.result;
                setImagePreview(preview);
                setProfileData(prev => ({
                    ...prev,
                    avatar: preview
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profile-image-input').click();
    };

    // Appointment Handlers
    const cancelAppointment = async (appointmentId) => {
        try {
            setAppointmentsError(null);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ status: 'CANCELLED' })
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to cancel appointment');
            }

            await loadAppointments();
        } catch (err) {
            console.error('Failed to cancel appointment', err);
            setAppointmentsError(err.message || 'Failed to cancel appointment');
        }
    };

    const rescheduleAppointment = (appointmentId) => {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            setSelectedAppointment(appointment);
            setShowRescheduleModal(true);
        }
    };

    const rateAppointment = (appointmentId) => {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            setSelectedAppointment(appointment);
            setShowRatingModal(true);
        }
    };

    // Filtered appointments based on search and tab
    const filteredAppointments = appointments.filter(appointment => {
        // Filter by tab
        const matchesTab = activeAppointmentTab === 'All' || appointment.status === activeAppointmentTab;

        // Filter by search term
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            appointment.service.toLowerCase().includes(searchLower) ||
            appointment.provider.toLowerCase().includes(searchLower) ||
            appointment.date.toLowerCase().includes(searchLower) ||
            appointment.time.toLowerCase().includes(searchLower) ||
            appointment.status.toLowerCase().includes(searchLower);
        return matchesTab && matchesSearch;
    });

    // Filtered booking history based on search term
    const filteredBookingHistory = bookingHistory.filter(booking => {
        const searchLower = dashboardSearchTerm.toLowerCase();
        return dashboardSearchTerm === '' ||
            booking.service.toLowerCase().includes(searchLower) ||
            booking.provider.toLowerCase().includes(searchLower) ||
            booking.date.toLowerCase().includes(searchLower) ||
            booking.amount.toLowerCase().includes(searchLower) ||
            booking.status.toLowerCase().includes(searchLower);
    });

    // View Booking Handler
    const handleViewBooking = (bookingId) => {
        const booking = bookingHistory.find(b => b.id === bookingId);
        if (booking) {
            setSelectedAppointment(booking);
            setShowViewBookingModal(true);
        }
    };

    // Edit Booking Handler
    const handleEditBooking = (bookingId) => {
        const booking = bookingHistory.find(b => b.id === bookingId);
        if (booking) {
            setSelectedAppointment(booking);
            setShowEditBookingModal(true);
        }
    };

    // Delete Booking Handler
    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking from your history?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${bookingId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to delete booking');
            }

            await loadAppointments();

            const deletedBooking = bookingHistory.find(b => b.id === bookingId);
            if (deletedBooking) {
                const newActivity = {
                    id: recentActivities.length + 1,
                    action: `Deleted booking for ${deletedBooking.service}`,
                    time: 'Just now',
                    status: 'deletion',
                    icon: Trash2
                };
                setRecentActivities(prev => [newActivity, ...prev]);
            }
        } catch (err) {
            console.error('Delete booking error:', err);
            setAppointmentsError(err.message || 'Failed to delete booking');
        }
    };

    // View All Activities Handler
    const handleViewAllActivities = () => {
        setShowAllActivitiesModal(true);
    };

    // Export History Handler
    const handleExportHistory = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('Booking History Report', 20, 20);

        // Add user info
        doc.setFontSize(12);
        doc.text(`User: ${profileData.firstName} ${profileData.lastName}`, 20, 35);
        doc.text(`Email: ${profileData.email}`, 20, 45);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);

        // Prepare table data
        const tableData = filteredBookingHistory.map(booking => [
            booking.service,
            booking.provider,
            booking.date,
            booking.amount,
            booking.status,
            `${booking.rating}/5`
        ]);

        // Add table
        autoTable(doc, {
            head: [['Service', 'Provider', 'Date', 'Amount', 'Status', 'Rating']],
            body: tableData,
            startY: 70,
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [139, 69, 246], // Violet color
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252], // Light gray
            },
        });

        // Add summary at the bottom
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.text(`Total Bookings: ${filteredBookingHistory.length}`, 20, finalY);
        doc.text(`Total Spent: $${filteredBookingHistory.reduce((sum, booking) => sum + parseFloat(booking.amount.replace('$', '')), 0).toFixed(2)}`, 20, finalY + 10);
        doc.text(`Average Rating: ${(filteredBookingHistory.reduce((sum, booking) => sum + booking.rating, 0) / filteredBookingHistory.length).toFixed(1)}/5`, 20, finalY + 20);

        // Save the PDF
        doc.save(`booking_history_${profileData.firstName}_${profileData.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Booking Modal Component
    const BookingModal = () => {
        const [bookingForm, setBookingForm] = useState({
            service: '',
            appointmentDate: '',
            appointmentTime: '',
            notes: ''
        });
        const [selectedDate, setSelectedDate] = useState(null);
        const [selectedTime, setSelectedTime] = useState(null);
        const [errors, setErrors] = useState({});
        const [bookingError, setBookingError] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        const resetModalForm = () => {
            setBookingForm({
                service: '',
                appointmentDate: '',
                appointmentTime: '',
                notes: ''
            });
            setSelectedDate(null);
            setSelectedTime(null);
            setErrors({});
            setBookingError('');
        };

        const handleCloseModal = () => {
            resetModalForm();
            setShowBookingModal(false);
        };

        const handleBookingSubmit = async () => {
            const newErrors = {};
            if (!bookingForm.service) {
                newErrors.service = 'Please select a service';
            }
            if (!bookingForm.appointmentDate) {
                newErrors.appointmentDate = 'Please select a date';
            }
            if (!bookingForm.appointmentTime) {
                newErrors.appointmentTime = 'Please select a time';
            }

            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) {
                return;
            }

            setIsSubmitting(true);
            setBookingError('');

            const selectedService = serviceOptions.find(service => service.id === bookingForm.service);

            try {
                const response = await fetch(`${API_BASE_URL}/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        serviceId: bookingForm.service,
                        appointmentDate: bookingForm.appointmentDate,
                        appointmentTime: bookingForm.appointmentTime,
                        notes: bookingForm.notes.trim()
                    })
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Unable to book appointment');
                }

                await loadAppointments();

                const newActivity = {
                    id: recentActivities.length + 1,
                    action: `Booked ${selectedService?.name || 'a service'}`,
                    time: 'Just now',
                    status: 'booking',
                    icon: Calendar
                };
                setRecentActivities(prev => [newActivity, ...prev]);

                resetModalForm();
                setShowBookingModal(false);
                setBookingSuccess(true);
                setTimeout(() => setBookingSuccess(false), 3000);
                setJustBooked(true);
                setTimeout(() => setJustBooked(false), 3000);
            } catch (err) {
                console.error('Booking error:', err);
                setBookingError(err.message || 'Failed to book appointment');
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Book New Service</h3>
                                <p className="text-gray-600 mt-1">Schedule your next appointment — it will appear immediately in your dashboard.</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {bookingError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {bookingError}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={`${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profileData.email || ''}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={profileData.phone || profileData.mobile || ''}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Service</label>
                            {serviceLoading ? (
                                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500">
                                    Loading services...
                                </div>
                            ) : serviceError ? (
                                <div className="w-full px-4 py-3 rounded-lg border border-red-300 bg-red-50 text-red-700">
                                    {serviceError}
                                </div>
                            ) : serviceOptions.length === 0 ? (
                                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-yellow-50 text-gray-700">
                                    No active services are available right now. Please check back later.
                                </div>
                            ) : (
                                <select
                                    value={bookingForm.service}
                                    onChange={(e) => setBookingForm(prev => ({ ...prev, service: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
                                >
                                    <option value="">Select a service</option>
                                    {serviceOptions.map((service) => {
                                        const priceValue = Number(service.price);
                                        const priceLabel = Number.isFinite(priceValue) ? `$${priceValue.toFixed(2)}` : '$0.00';
                                        return (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - {priceLabel}
                                                {service.category ? ` (${service.category})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                            {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Select Date</label>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        setBookingForm(prev => ({
                                            ...prev,
                                            appointmentDate: date ? date.toISOString().split('T')[0] : ''
                                        }));
                                    }}
                                    dateFormat="yyyy-MM-dd"
                                    minDate={new Date()}
                                    className="border border-gray-300 rounded-2xl px-4 py-3 w-full text-gray-700"
                                />
                                {errors.appointmentDate && <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>}
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Select Time</label>
                                <DatePicker
                                    selected={selectedTime}
                                    onChange={(time) => {
                                        setSelectedTime(time);
                                        setBookingForm(prev => ({
                                            ...prev,
                                            appointmentTime: time ? time.toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            }) : ''
                                        }));
                                    }}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={30}
                                    timeCaption="Time"
                                    dateFormat="h:mm aa"
                                    className="border border-gray-300 rounded-2xl px-4 py-3 w-full text-gray-700"
                                />
                                {errors.appointmentTime && <p className="text-red-500 text-sm mt-1">{errors.appointmentTime}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Notes</label>
                            <textarea
                                rows={3}
                                value={bookingForm.notes}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-600 bg-gray-50 text-gray-700 resize-none"
                                placeholder="Let us know if you have any preparatory questions or context."
                            />
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                All fields are required
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBookingSubmit}
                                    disabled={isSubmitting || serviceLoading || serviceOptions.length === 0}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting && <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    // Reschedule Modal Component
    const RescheduleModal = () => {
        const [rescheduleForm, setRescheduleForm] = useState({
            date: selectedAppointment?.appointmentDate || '',
            time: selectedAppointment?.appointmentTime || ''
        });
        const [selectedDate, setSelectedDate] = useState(selectedAppointment?.appointmentDate ? new Date(selectedAppointment.appointmentDate) : null);
        const [selectedTime, setSelectedTime] = useState(null);
        const [errors, setErrors] = useState({});
        const [isRescheduling, setIsRescheduling] = useState(false);
        const [rescheduleError, setRescheduleError] = useState('');

        const handleRescheduleSubmit = async () => {
            const newErrors = {};

            if (!rescheduleForm.date) {
                newErrors.date = 'Please select a date';
            }
            if (!rescheduleForm.time) {
                newErrors.time = 'Please select a time';
            }

            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) {
                return;
            }

            setIsRescheduling(true);
            setRescheduleError('');

            try {
                const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        date: rescheduleForm.date,
                        time: rescheduleForm.time
                    })
                });

                const payload = await response.json();
                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to reschedule appointment');
                }

                await loadAppointments();

                const newActivity = {
                    id: recentActivities.length + 1,
                    action: `Rescheduled ${selectedAppointment.service}`,
                    time: 'Just now',
                    status: 'reschedule',
                    icon: Calendar
                };
                setRecentActivities(prev => [newActivity, ...prev]);

                setRescheduleForm({
                    date: '',
                    time: ''
                });
                setSelectedDate(null);
                setSelectedTime(null);
                setErrors({});
                setShowRescheduleModal(false);
                setSelectedAppointment(null);
                setRescheduleSuccess(true);
                setTimeout(() => setRescheduleSuccess(false), 3000);
            } catch (err) {
                console.error('Reschedule error:', err);
                setRescheduleError(err.message || 'Failed to reschedule appointment');
            } finally {
                setIsRescheduling(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h3>
                                <p className="text-gray-600 mt-1">Change your appointment date and time</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowRescheduleModal(false);
                                    setSelectedAppointment(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* Current Appointment Info */}
                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Current Appointment</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{selectedAppointment?.service}</p>
                                    <p className="text-sm text-gray-600">{selectedAppointment?.provider}</p>
                                    <p className="text-sm text-gray-500">{selectedAppointment?.date} at {selectedAppointment?.time}</p>
                                </div>
                            </div>
                        </div>
                        {rescheduleError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                                {rescheduleError}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium mb-2">New Date</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                            setRescheduleForm({
                                                ...rescheduleForm,
                                                date: date ? date.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="border p-3 rounded w-full"
                                        minDate={new Date()}
                                    />
                                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium mb-2">New Time</label>
                                    <DatePicker
                                        selected={selectedTime}
                                        onChange={(time) => {
                                            setSelectedTime(time);
                                            setRescheduleForm({
                                                ...rescheduleForm,
                                                time: time ? time.toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }) : ''
                                            });
                                        }}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={30}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        className="border p-3 rounded w-full"
                                    />
                                    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Please select both date and time
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRescheduleModal(false);
                                        setSelectedAppointment(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRescheduleSubmit}
                                    disabled={isRescheduling}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isRescheduling && <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                    {isRescheduling ? 'Rescheduling...' : (
                                        <>
                                            <Calendar size={18} className="inline mr-2" />
                                            Reschedule Appointment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Rating Modal Component
    const RatingModal = () => {
        const [rating, setRating] = useState(0);
        const [ratingForm, setRatingForm] = useState({
            rating: 0,
            comment: ''
        });
        const [errors, setErrors] = useState({});
        const [ratingError, setRatingError] = useState('');
        const [isSubmittingRating, setIsSubmittingRating] = useState(false);

        const handleRatingSubmit = async () => {
            const newErrors = {};

            if (!ratingForm.rating || ratingForm.rating < 1 || ratingForm.rating > 5) {
                newErrors.rating = 'Please select a rating between 1 and 5 stars';
            }

            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) {
                return;
            }

            setIsSubmittingRating(true);
            setRatingError('');

            try {
                const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        rating: ratingForm.rating,
                        comment: ratingForm.comment.trim()
                    })
                });

                const payload = await response.json();
                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to submit rating');
                }

                await loadAppointments();

                const newActivity = {
                    id: recentActivities.length + 1,
                    action: `Rated ${selectedAppointment.service} ${ratingForm.rating} stars`,
                    time: 'Just now',
                    status: 'rating',
                    icon: Star
                };
                setRecentActivities(prev => [newActivity, ...prev]);

                setRatingForm({
                    rating: 0,
                    comment: ''
                });
                setRating(0);
                setRatingSubmitted(true);
                setErrors({});
                setShowRatingModal(false);
                setSelectedAppointment(null);
            } catch (err) {
                console.error('Rating submission failed:', err);
                setRatingError(err.message || 'Failed to submit rating');
            } finally {
                setIsSubmittingRating(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Rate Your Service</h3>
                                <p className="text-gray-600 mt-1">Share your experience with this service</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setSelectedAppointment(null);
                                    setRating(0);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* Service Info */}
                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Service Details</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{selectedAppointment?.service}</p>
                                    <p className="text-sm text-gray-600">{selectedAppointment?.provider}</p>
                                    <p className="text-sm text-gray-500">{selectedAppointment?.date} at {selectedAppointment?.time}</p>
                                </div>
                            </div>
                        </div>

                        {ratingError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                                {ratingError}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Rating Stars */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-4">How would you rate this service?</label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => {
                                                setRating(star);
                                                setRatingForm({ ...ratingForm, rating: star });
                                            }}
                                            className={`p-2 rounded-full transition-all duration-200 ${star <= rating ? 'text-amber-500' : 'text-gray-300'
                                                } hover:scale-110`}
                                        >
                                            <Star
                                                size={32}
                                                fill={star <= rating ? 'currentColor' : 'none'}
                                                className="transition-all duration-200"
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-4 text-sm text-gray-600">
                                        {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
                                    </span>
                                </div>
                                {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Additional Comments (Optional)</label>
                                <textarea
                                    value={ratingForm.comment}
                                    onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none"
                                    placeholder="Tell us about your experience..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Your feedback helps us improve
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setSelectedAppointment(null);
                                        setRating(0);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleRatingSubmit}
                                    disabled={isSubmittingRating}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmittingRating && <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                    {isSubmittingRating ? 'Submitting...' : (
                                        <>
                                            <Star size={18} className="inline mr-2" />
                                            Submit Rating
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // View Booking Modal Component
    const ViewBookingModal = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                                <p className="text-gray-600 mt-1">Complete information about this booking</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowViewBookingModal(false);
                                    setSelectedAppointment(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {/* Booking Info */}
                        <div className="bg-gray-50 p-6 rounded-xl mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center text-white">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800">{selectedAppointment?.service}</h4>
                                    <p className="text-sm text-gray-600">{selectedAppointment?.provider}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{selectedAppointment?.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-900">{selectedAppointment?.time}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-medium text-gray-900 text-violet-600">{selectedAppointment?.amount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium text-gray-900">{selectedAppointment?.duration}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedAppointment?.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {selectedAppointment?.status}
                                </span>
                            </div>
                            {selectedAppointment?.status === 'Completed' && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Rating</p>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={i < selectedAppointment.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">{selectedAppointment.rating}/5</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h5 className="font-semibold text-gray-800 mb-2">Service Provider</h5>
                                <p className="text-gray-600">{selectedAppointment?.provider}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h5 className="font-semibold text-gray-800 mb-2">Booking ID</h5>
                                <p className="text-gray-600">#{selectedAppointment?.id}</p>
                            </div>
                            {selectedAppointment?.comment && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <h5 className="font-semibold text-gray-800 mb-2">Your Comments</h5>
                                    <p className="text-gray-600">{selectedAppointment.comment}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Booking details
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setShowViewBookingModal(false);
                                        setSelectedAppointment(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Edit Booking Modal Component
    const EditBookingModal = () => {
        const [editForm, setEditForm] = useState({
            service: selectedAppointment?.service || '',
            provider: selectedAppointment?.provider || '',
            date: selectedAppointment?.date || '',
            amount: selectedAppointment?.amount || ''
        });

        const [errors, setErrors] = useState({});

        const services = [
            { name: 'Consultation', duration: '30 min', price: '$50' },
            { name: 'Full Service', duration: '60 min', price: '$100' },
            { name: 'Premium Package', duration: '90 min', price: '$150' },
            { name: 'Web Development Consultation', duration: '1 hour', price: '$150' },
            { name: 'UI/UX Design Review', duration: '1.5 hours', price: '$120' },
            { name: 'IT Support Session', duration: '45 mins', price: '$80' },
            { name: 'Digital Marketing Consultation', duration: '2 hours', price: '$200' },
            { name: 'Mobile App Planning', duration: '1.5 hours', price: '$180' }
        ];

        const providers = [
            'Tech Solutions Inc.',
            'Creative Designs LLC',
            'Tech Support Pro',
            'Growth Marketing Co.',
            'App Masters',
            'Wordsmith Pro',
            'Social Boost',
            'Digital Growth'
        ];

        const handleEditSubmit = () => {
            const newErrors = {};

            if (!editForm.service.trim()) {
                newErrors.service = 'Service is required';
            }
            if (!editForm.provider.trim()) {
                newErrors.provider = 'Provider is required';
            }
            if (!editForm.date) {
                newErrors.date = 'Date is required';
            }
            if (!editForm.amount.trim()) {
                newErrors.amount = 'Amount is required';
            }

            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                // Update the booking history
                setBookingHistory(bookingHistory.map(booking =>
                    booking.id === selectedAppointment.id ? {
                        ...booking,
                        service: editForm.service,
                        provider: editForm.provider,
                        date: editForm.date,
                        amount: editForm.amount
                    } : booking
                ));

                // Add to recent activities
                const newActivity = {
                    id: recentActivities.length + 1,
                    action: `Edited booking for ${editForm.service}`,
                    time: 'Just now',
                    status: 'edit',
                    icon: Edit
                };
                setRecentActivities(prev => [newActivity, ...prev]);

                // Reset form and close modal
                setEditForm({
                    service: '',
                    provider: '',
                    date: '',
                    amount: ''
                });
                setErrors({});
                setShowEditBookingModal(false);
                setSelectedAppointment(null);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Edit Booking</h3>
                                <p className="text-gray-600 mt-1">Modify your booking details</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditBookingModal(false);
                                    setSelectedAppointment(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Service</label>
                                <select
                                    value={editForm.service}
                                    onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                >
                                    <option value="">Select a service</option>
                                    {services.map((service, idx) => (
                                        <option key={idx} value={service.name}>
                                            {service.name} - {service.duration} - {service.price}
                                        </option>
                                    ))}
                                </select>
                                {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Provider</label>
                                <select
                                    value={editForm.provider}
                                    onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                >
                                    <option value="">Select a provider</option>
                                    {providers.map((provider, idx) => (
                                        <option key={idx} value={provider}>
                                            {provider}
                                        </option>
                                    ))}
                                </select>
                                {errors.provider && <p className="text-red-500 text-sm mt-1">{errors.provider}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-300 ${errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                                            }`}
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Amount</label>
                                    <input
                                        type="text"
                                        value={editForm.amount}
                                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                        placeholder="$100"
                                    />
                                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                All fields are required
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setShowEditBookingModal(false);
                                        setSelectedAppointment(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Save size={18} className="inline mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Filter Modal Component
    const FilterModal = () => {
        const [filterForm, setFilterForm] = useState({
            status: 'all',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            rating: 'all'
        });

        const handleFilterSubmit = () => {
            // Apply filters to booking history
            let filtered = bookingHistory;

            // Status filter
            if (filterForm.status !== 'all') {
                filtered = filtered.filter(booking => booking.status.toLowerCase() === filterForm.status);
            }

            // Date range filter
            if (filterForm.dateFrom) {
                filtered = filtered.filter(booking => new Date(booking.date) >= new Date(filterForm.dateFrom));
            }
            if (filterForm.dateTo) {
                filtered = filtered.filter(booking => new Date(booking.date) <= new Date(filterForm.dateTo));
            }

            // Amount range filter
            if (filterForm.amountMin) {
                const minAmount = parseFloat(filterForm.amountMin.replace('$', ''));
                filtered = filtered.filter(booking => parseFloat(booking.amount.replace('$', '')) >= minAmount);
            }
            if (filterForm.amountMax) {
                const maxAmount = parseFloat(filterForm.amountMax.replace('$', ''));
                filtered = filtered.filter(booking => parseFloat(booking.amount.replace('$', '')) <= maxAmount);
            }

            // Rating filter
            if (filterForm.rating !== 'all') {
                const ratingValue = parseInt(filterForm.rating);
                filtered = filtered.filter(booking => booking.rating >= ratingValue);
            }

            // Update the filtered booking history state
            setBookingHistory(filtered);
            setShowFilterModal(false);
        };

        const handleClearFilters = async () => {
            setFilterForm({
                status: 'all',
                dateFrom: '',
                dateTo: '',
                amountMin: '',
                amountMax: '',
                rating: 'all'
            });
            await loadAppointments();
            setShowFilterModal(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Filter Booking History</h3>
                                <p className="text-gray-600 mt-1">Customize your booking history view</p>
                            </div>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Status</label>
                                <select
                                    value={filterForm.status}
                                    onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Date From</label>
                                    <input
                                        type="date"
                                        value={filterForm.dateFrom}
                                        onChange={(e) => setFilterForm({ ...filterForm, dateFrom: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Date To</label>
                                    <input
                                        type="date"
                                        value={filterForm.dateTo}
                                        onChange={(e) => setFilterForm({ ...filterForm, dateTo: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                    />
                                </div>
                            </div>

                            {/* Amount Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Min Amount</label>
                                    <input
                                        type="text"
                                        placeholder="$0"
                                        value={filterForm.amountMin}
                                        onChange={(e) => setFilterForm({ ...filterForm, amountMin: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Max Amount</label>
                                    <input
                                        type="text"
                                        placeholder="$1000"
                                        value={filterForm.amountMax}
                                        onChange={(e) => setFilterForm({ ...filterForm, amountMax: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                    />
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Minimum Rating</label>
                                <select
                                    value={filterForm.rating}
                                    onChange={(e) => setFilterForm({ ...filterForm, rating: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="2">2+ Stars</option>
                                    <option value="1">1+ Stars</option>
                                </select>
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
                                Clear Filters
                            </button>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFilterSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Filter size={18} className="inline mr-2" />
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // All Activities Modal Component
    const AllActivitiesModal = () => {
        const [currentPage, setCurrentPage] = useState(1);
        const [filterStatus, setFilterStatus] = useState('all');
        const [searchTerm, setSearchTerm] = useState('');
        const activitiesPerPage = 10;

        // Extended activities data for the modal
        const allActivities = [
            ...recentActivities,
            {
                id: 5,
                action: 'Completed SEO Optimization service',
                time: '4 days ago, 10:00 AM',
                status: 'completion',
                icon: CheckCircle
            },
            {
                id: 6,
                action: 'Booked Digital Marketing Consultation',
                time: '5 days ago, 2:00 PM',
                status: 'booking',
                icon: Calendar
            },
            {
                id: 7,
                action: 'Updated payment method',
                time: '1 week ago, 4:30 PM',
                status: 'profile',
                icon: User
            },
            {
                id: 8,
                action: 'Rated Content Writing service 4 stars',
                time: '1 week ago, 11:15 AM',
                status: 'rating',
                icon: Star
            },
            {
                id: 9,
                action: 'Cancelled Graphic Design session',
                time: '2 weeks ago, 9:45 AM',
                status: 'cancellation',
                icon: XCircle
            },
            {
                id: 10,
                action: 'Booked Social Media Management',
                time: '2 weeks ago, 3:20 PM',
                status: 'booking',
                icon: Calendar
            },
            {
                id: 11,
                action: 'Completed Mobile App Planning',
                time: '3 weeks ago, 1:00 PM',
                status: 'completion',
                icon: CheckCircle
            },
            {
                id: 12,
                action: 'Updated notification preferences',
                time: '3 weeks ago, 5:30 PM',
                status: 'profile',
                icon: User
            },
            {
                id: 13,
                action: 'Booked UI/UX Design Review',
                time: '4 weeks ago, 10:30 AM',
                status: 'booking',
                icon: Calendar
            },
            {
                id: 14,
                action: 'Rated Web Development service 5 stars',
                time: '4 weeks ago, 2:15 PM',
                status: 'rating',
                icon: Star
            },
            {
                id: 15,
                action: 'Updated profile picture',
                time: '5 weeks ago, 11:45 AM',
                status: 'profile',
                icon: User
            },
            {
                id: 16,
                action: 'Completed Digital Marketing service',
                time: '6 weeks ago, 9:30 AM',
                status: 'completion',
                icon: CheckCircle
            },
            {
                id: 17,
                action: 'Booked IT Support Session',
                time: '6 weeks ago, 3:45 PM',
                status: 'booking',
                icon: Calendar
            },
            {
                id: 18,
                action: 'Cancelled Content Writing session',
                time: '7 weeks ago, 1:20 PM',
                status: 'cancellation',
                icon: XCircle
            },
            {
                id: 19,
                action: 'Updated contact information',
                time: '8 weeks ago, 4:10 PM',
                status: 'profile',
                icon: User
            },
            {
                id: 20,
                action: 'Rated SEO Optimization service 5 stars',
                time: '8 weeks ago, 10:55 AM',
                status: 'rating',
                icon: Star
            },
            {
                id: 21,
                action: 'Completed Social Media Management',
                time: '9 weeks ago, 2:30 PM',
                status: 'completion',
                icon: CheckCircle
            },
            {
                id: 22,
                action: 'Booked Graphic Design service',
                time: '10 weeks ago, 11:15 AM',
                status: 'booking',
                icon: Calendar
            },
            {
                id: 23,
                action: 'Updated password',
                time: '10 weeks ago, 5:40 PM',
                status: 'profile',
                icon: User
            },
            {
                id: 24,
                action: 'Cancelled Mobile App Development',
                time: '11 weeks ago, 9:25 AM',
                status: 'cancellation',
                icon: XCircle
            },
            {
                id: 25,
                action: 'Rated IT Support service 4 stars',
                time: '12 weeks ago, 3:50 PM',
                status: 'rating',
                icon: Star
            }
        ];

        // Filter activities based on status and search term
        const filteredActivities = allActivities.filter(activity => {
            const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
            const matchesSearch = searchTerm === '' ||
                activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.time.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        // Pagination
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
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="all">All Activities</option>
                                    <option value="booking">Bookings</option>
                                    <option value="rating">Ratings</option>
                                    <option value="profile">Profile Updates</option>
                                    <option value="cancellation">Cancellations</option>
                                    <option value="completion">Completions</option>
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
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-4 mb-6">
                            {paginatedActivities.map((activity) => {
                                const ActivityIcon = activity.icon;
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 transform hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                <ActivityIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 group-hover:text-violet-700">{activity.action}</p>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
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
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Total activities: {allActivities.length}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowAllActivitiesModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
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

    const sidebarItems = [
        { name: 'Dashboard', icon: Home },
        { name: 'Appointments', icon: Calendar },
        { name: 'Booking History', icon: History },
        { name: 'Profile', icon: User },
    ];

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'activity', label: 'Activity', icon: Activity }
    ];

    const renderContent = () => {
        switch (activeItem) {
            case 'Dashboard':
                const upcomingAppointments = appointments.filter(apt => apt.status === 'Upcoming');
                return (
                    <div className="p-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    User Dashboard
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    Welcome back, {profileData.firstName || profileData.email || 'there'}! Here's your overview.
                                </p>
                            </div>
                        </div>

                        {profileLoading && (
                            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                Loading your profile details...
                            </div>
                        )}
                        {!profileLoading && profileError && (
                            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {profileError}
                            </div>
                        )}
                        {!profileLoading && !profileError && profileSaveError && (
                            <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                {profileSaveError}
                            </div>
                        )}
                        {!profileLoading && !profileError && !profileData.id && (
                            <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                                We could not find your profile right now. Please refresh the page or contact support if the issue persists.
                            </div>
                        )}

                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                {
                                    title: 'Total Bookings',
                                    value: userStats.totalBookings,
                                    change: '+3 this month',
                                    positive: true,
                                    icon: Calendar,
                                    gradient: 'from-violet-500 to-fuchsia-600',
                                    delay: 0
                                },
                                {
                                    title: 'Total Spent',
                                    value: `$${userStats.totalSpent}`,
                                    change: '+$450 this month',
                                    positive: true,
                                    icon: DollarSign,
                                    gradient: 'from-blue-500 to-cyan-600',
                                    delay: 100
                                },
                                {
                                    title: 'Upcoming',
                                    value: userStats.upcomingBookings,
                                    change: 'Next: Tomorrow',
                                    positive: true,
                                    icon: Clock,
                                    gradient: 'from-emerald-500 to-teal-600',
                                    delay: 200
                                },
                                {
                                    title: 'Avg Rating',
                                    value: userStats.averageRating + '/5',
                                    change: '+0.2 from last month',
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
                                                    <span>{metric.change}</span>
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

                        {/* Charts and Upcoming Appointments */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                            {/* Monthly Spending Chart */}
                            <div className={`xl:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isFullScreen ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl' : ''}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Monthly Spending</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 bg-violet-600 rounded-full"></div>
                                            Spending
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
                                                            className={`w-full flex items-center px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 transition-colors ${chartType === 'area' ? 'text-violet-600 bg-pink-50' : 'text-gray-700'}`}
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
                                                            <ViewIcon size={16} className="mr-3" />
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
                                                            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-t-lg transition-all duration-500 hover:from-violet-600 hover:to-fuchsia-600 cursor-pointer relative overflow-hidden"
                                                            style={{ height: `${Math.max((data.revenue / maxRevenue) * 100, 5)}%` }}
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
                                                            stroke="#8b5cf6"
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
                                                                    fill="#8b5cf6"
                                                                    className="hover:r-8 transition-all cursor-pointer"
                                                                />
                                                            );
                                                        })}

                                                        {/* Gradient definition */}
                                                        <defs>
                                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
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

                            {/* Upcoming Appointments */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Upcoming Appointments</h3>
                                <div className="space-y-4">
                                    {appointmentsLoading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : appointmentsError ? (
                                        <div className="text-sm text-red-600 px-4 py-8 rounded-2xl border border-red-200 bg-red-50">
                                            {appointmentsError}
                                        </div>
                                    ) : upcomingAppointments.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500">
                                            <p className="text-lg font-semibold">No upcoming appointments yet</p>
                                            <p className="text-sm">Book a service and it will appear here automatically.</p>
                                        </div>
                                    ) : (
                                        upcomingAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 transform hover:scale-105 group"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-800 group-hover:text-violet-700">{appointment.service}</p>
                                                    <p className="text-sm text-gray-600">{appointment.provider}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Calendar size={12} className="text-gray-500" />
                                                        <span className="text-xs text-gray-500">{appointment.date} at {appointment.time}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900 group-hover:text-violet-600">
                                                        {appointment.amount}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <button
                                                            onClick={() => rescheduleAppointment(appointment.id)}
                                                            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => cancelAppointment(appointment.id)}
                                                            className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities and Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Activities */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
                                    <button
                                        onClick={handleViewAllActivities}
                                        className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => {
                                        const ActivityIcon = activity.icon;
                                        return (
                                            <div
                                                key={activity.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                        <ActivityIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-violet-700">{activity.action}</p>
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

                            {/* User Stats */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Your Stats</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Completed Bookings', value: userStats.completedBookings, icon: CheckCircle, color: 'text-emerald-600' },
                                        { label: 'Cancelled Bookings', value: userStats.cancelledBookings, icon: XCircle, color: 'text-red-600' },
                                        { label: 'Loyalty Points', value: userStats.loyaltyPoints, icon: Star, color: 'text-amber-600' },
                                        { label: 'Favorite Category', value: userStats.favoriteCategory, icon: FolderOpen, color: 'text-violet-600' }
                                    ].map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Icon size={20} className={stat.color} />
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-violet-700">{stat.label}</p>
                                                        <p className="text-2xl font-bold text-gray-900 group-hover:text-violet-600">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Appointments':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    My Appointments
                                </h2>
                                <p className="text-gray-600">Manage your upcoming and past appointments</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search appointments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (!justBooked) {
                                            setShowBookingModal(true);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                    disabled={justBooked}
                                >
                                    <Plus size={16} />
                                    Book New Service
                                </button>
                            </div>
                        </div>

                        {/* Appointment Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                                        <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'Upcoming').length}</p>
                                    </div>
                                    <Calendar className="text-violet-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Completed</p>
                                        <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'Completed').length}</p>
                                    </div>
                                    <CheckCircle className="text-emerald-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                                        <p className="text-2xl font-bold text-gray-900">${userStats.totalSpent}</p>
                                    </div>
                                    <DollarSign className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
                                        <p className="text-2xl font-bold text-gray-900">{userStats.averageRating}/5</p>
                                    </div>
                                    <Star className="text-amber-500" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Appointments Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                            {['All', 'Upcoming', 'Completed', 'Cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveAppointmentTab(tab)}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeAppointmentTab === tab
                                        ? 'bg-white text-violet-600 shadow-lg'
                                        : 'text-gray-600 hover:text-violet-600'
                                        }`}
                                >
                                    {tab} ({tab === 'All' ? appointments.length :
                                        tab === 'Upcoming' ? appointments.filter(a => a.status === 'Upcoming').length :
                                            tab === 'Completed' ? appointments.filter(a => a.status === 'Completed').length :
                                                appointments.filter(a => a.status === 'Cancelled').length
                                    })
                                </button>
                            ))}
                        </div>

                        {/* Appointments List */}
                        <div className="space-y-4">
                            {appointmentsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : appointmentsError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700 text-center">
                                    {appointmentsError}
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="text-gray-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No appointments yet</h3>
                                    <p className="text-gray-600 mb-4">Book a service and it will appear in this list.</p>
                                    <button
                                        onClick={() => {
                                            if (!justBooked) {
                                                setShowBookingModal(true);
                                            }
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Book New Service
                                    </button>
                                </div>
                            ) : filteredAppointments.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="text-gray-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No appointments found</h3>
                                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                                </div>
                            ) : (
                                filteredAppointments.map((appointment) => (
                                    <div key={appointment.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center text-white">
                                                        <Calendar size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800">{appointment.service}</h3>
                                                        <p className="text-sm text-gray-600">{appointment.provider} • {appointment.duration}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'Upcoming'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : appointment.status === 'Completed'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {appointment.status}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        <Calendar size={14} className="inline mr-1" />
                                                        {appointment.date}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        <Clock size={14} className="inline mr-1" />
                                                        {appointment.time}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-violet-600">{appointment.amount}</p>
                                                    <p className="text-sm text-gray-500">Total</p>
                                                </div>
                                                {appointment.status === 'Upcoming' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => rescheduleAppointment(appointment.id)}
                                                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => cancelAppointment(appointment.id)}
                                                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {appointment.status === 'Completed' && (
                                                    <button
                                                        onClick={() => rateAppointment(appointment.id)}
                                                        className="w-full px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                                                    >
                                                        Rate Service
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 'Booking History':
                return (
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Booking History
                                </h2>
                                <p className="text-gray-600">View your complete booking history and past appointments</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search booking history..."
                                        value={dashboardSearchTerm}
                                        onChange={(e) => setDashboardSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={handleExportHistory}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Download size={16} />
                                    Export History
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    <Filter size={16} />
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Booking Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-violet-100 text-sm font-medium">Total Bookings</p>
                                        <p className="text-2xl font-bold">{userStats.totalBookings}</p>
                                        <p className="text-violet-100 text-xs mt-1">All time</p>
                                    </div>
                                    <History size={32} className="opacity-80" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium">Completed</p>
                                        <p className="text-2xl font-bold">{userStats.completedBookings}</p>
                                        <p className="text-emerald-100 text-xs mt-1">Successful bookings</p>
                                    </div>
                                    <CheckCircle size={32} className="opacity-80" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Spent</p>
                                        <p className="text-2xl font-bold">${userStats.totalSpent}</p>
                                        <p className="text-blue-100 text-xs mt-1">All bookings</p>
                                    </div>
                                    <DollarSign size={32} className="opacity-80" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Avg Rating</p>
                                        <p className="text-2xl font-bold">{userStats.averageRating}/5</p>
                                        <p className="text-amber-100 text-xs mt-1">Your average rating</p>
                                    </div>
                                    <Star size={32} className="opacity-80" />
                                </div>
                            </div>
                        </div>

                        {/* Booking History Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">All Bookings</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{filteredBookingHistory.length} bookings found</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredBookingHistory.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{booking.service}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{booking.provider}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{booking.date}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-violet-600">{booking.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Completed'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={i < booking.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-sm text-gray-600">{booking.rating}/5</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewBooking(booking.id)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                                        >
                                                            <ViewIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditBooking(booking.id)}
                                                            className="p-1 text-violet-600 hover:text-violet-800 transition-colors cursor-pointer"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBooking(booking.id)}
                                                            className="p-1 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
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
                                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    User Profile
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
                                            disabled={profileSaving}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-300 text-white bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={20} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={profileSaving}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <Save size={20} />
                                            {profileSaving ? 'Saving profile...' : 'Save Changes'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleStartEditing}
                                        disabled={profileLoading || !profileData.id}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed ${profileLoading || !profileData.id ? 'pointer-events-none' : ''}`}
                                    >
                                        <Edit3 size={20} />
                                        {profileLoading ? 'Loading profile...' : 'Edit Profile'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Overview Card */}
                        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl shadow-2xl p-6 mb-8 text-white transform transition-all duration-500 hover:scale-[1.02]">
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
                                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-violet-600 shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
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
                                    <p className="text-violet-100 text-sm opacity-90">{profileData.email}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-sm">
                                            <Calendar size={14} />
                                            Member since {profileData.joinDate}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm">
                                            <Star size={14} />
                                            {userStats.loyaltyPoints} loyalty points
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                                        Active
                                    </div>
                                    <p className="text-violet-100 text-sm mt-2">Last login: {profileData.lastLogin}</p>
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
                                            ? 'bg-white text-violet-600 shadow-lg'
                                            : 'text-gray-600 hover:text-violet-600'
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
                                                <User className="text-violet-500" size={24} />
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { label: 'First Name', key: 'firstName', icon: User },
                                                    { label: 'Last Name', key: 'lastName', icon: User },
                                                    { label: 'Email', key: 'email', icon: Mail },
                                                    { label: 'Phone', key: 'phone', icon: Phone },
                                                    { label: 'Join Date', key: 'joinDate', icon: Calendar, readOnly: true },
                                                    { label: 'Last Login', key: 'lastLogin', icon: Clock, readOnly: true }
                                                ].map((field) => {
                                                    const FieldIcon = field.icon;
                                                    return (
                                                        <div key={field.key} className="group">
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                                <FieldIcon size={16} className="text-violet-500" />
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
                                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                                                />
                                                            ) : (
                                                                <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-violet-100 transition-all duration-300">
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
                                                    <MapPin size={16} className="text-violet-500" />
                                                    Address
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                                        rows="3"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-violet-100 transition-all duration-300">
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent group-hover:border-violet-100 transition-all duration-300">
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
                                            <Bell className="text-violet-500" size={24} />
                                            Notification Preferences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(notifications).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 group">
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-violet-700 transition-colors">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-gray-600">Receive {key.toLowerCase()} notifications</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleNotificationChange(key)}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${value
                                                            ? 'bg-violet-500 shadow-lg shadow-violet-500/30'
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
                                            <Shield className="text-violet-500" size={24} />
                                            Security Settings
                                        </h3>
                                        <div className="space-y-6">
                                            {[
                                                { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' },
                                                { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of new sign-ins' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 group">
                                                    <div>
                                                        <p className="font-medium text-gray-800 group-hover:text-violet-700">{item.label}</p>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSecurityChange(item.key, !securitySettings[item.key])}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${securitySettings[item.key]
                                                            ? 'bg-violet-500 shadow-lg shadow-violet-500/30'
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
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
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                                    >
                                                        <option value="30">30 days</option>
                                                        <option value="60">60 days</option>
                                                        <option value="90">90 days</option>
                                                        <option value="180">180 days</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-[1.02]">
                                                <Key size={20} />
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                            <Activity className="text-violet-500" size={24} />
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-4">
                                            {recentActivities.map((activity) => {
                                                const ActivityIcon = activity.icon;
                                                return (
                                                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-all duration-300 group transform hover:scale-[1.02]">
                                                        <div className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                                                            <ActivityIcon size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-800 group-hover:text-violet-700">{activity.action}</p>
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
                                            { icon: Download, label: 'Export Data', color: 'text-purple-600' },
                                            { icon: FileText, label: 'Download Invoices', color: 'text-blue-600' },
                                            { icon: CreditCard, label: 'Payment Methods', color: 'text-emerald-600' },
                                        ].map((action, index) => {
                                            const ActionIcon = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-violet-50 rounded-xl transition-all duration-300 transform hover:translate-x-2 group"
                                                >
                                                    <ActionIcon size={20} className={`${action.color} group-hover:scale-110 transition-transform`} />
                                                    <span className="font-medium group-hover:text-violet-700">{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* User Stats */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Total Bookings', value: userStats.totalBookings, icon: Calendar },
                                            { label: 'Completed', value: userStats.completedBookings, icon: CheckCircle },
                                            { label: 'Loyalty Points', value: userStats.loyaltyPoints, icon: Star },
                                            { label: 'Total Spent', value: `$${userStats.totalSpent}`, icon: DollarSign }
                                        ].map((stat, index) => {
                                            const StatIcon = stat.icon;
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-violet-50 transition-all duration-300 transform hover:scale-105 group">
                                                    <div className="flex items-center gap-3">
                                                        <StatIcon size={18} className="text-violet-500" />
                                                        <span className="text-gray-700 group-hover:text-violet-700">{stat.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 group-hover:text-violet-600">{stat.value}</span>
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
        <div className="flex h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-violet-600 to-fuchsia-700 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">User Panel</h1>
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
                                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-all duration-200 transform hover:scale-105 ${activeItem === item.name ? 'bg-white text-violet-700 shadow-lg font-medium' : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent lg:hidden">
                                User Portal
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
                                        <p className="text-xs text-gray-500">{getRoleLabel(profileData.role)}</p>
                                    </div>
                                    <div className="relative">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-violet-300 shadow-lg group-hover:shadow-xl transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
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
                                                className="w-full flex items-center px-4 py-3 text-sm text-violet-600 hover:bg-violet-50 font-medium transition-all duration-200 transform hover:translate-x-1 group"
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

            {/* All Activities Modal */}
            {showAllActivitiesModal && <AllActivitiesModal />}

            {/* Booking Modal */}
            {showBookingModal && <BookingModal />}

            {/* Reschedule Modal */}
            {showRescheduleModal && <RescheduleModal />}

            {/* Rating Modal */}
            {showRatingModal && <RatingModal />}

            {/* Filter Modal */}
            {showFilterModal && <FilterModal />}

            {/* View Booking Modal */}
            {showViewBookingModal && <ViewBookingModal />}

            {/* Edit Booking Modal */}
            {showEditBookingModal && <EditBookingModal />}

            {/* Booking Success Notification */}
            {bookingSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
                    <CheckCircle size={24} />
                    <div>
                        <p className="font-semibold">Appointment Booked Successfully!</p>
                        <p className="text-sm opacity-90">Your appointment has been scheduled.</p>
                    </div>
                </div>
            )}

            {/* Reschedule Success Notification */}
            {rescheduleSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
                    <CheckCircle size={24} />
                    <div>
                        <p className="font-semibold">Appointment Rescheduled Successfully!</p>
                        <p className="text-sm opacity-90">Your appointment has been updated.</p>
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

                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }

                .animate-dropdown {
                    animation: dropdown 0.2s ease-out;
                }

                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }

                /* Smooth scrolling */
                .overflow-y-auto {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
