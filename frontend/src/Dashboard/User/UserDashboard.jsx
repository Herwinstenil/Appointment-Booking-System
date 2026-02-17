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
    Eye,
    EyeOff,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    CreditCard,
    Activity,
    FileText,
    Globe,
    Key,
    Download as DownloadIcon,
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

const toDateOnlyString = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateOnly = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
        if (match) {
            const year = Number(match[1]);
            const month = Number(match[2]);
            const day = Number(match[3]);
            return new Date(year, month - 1, day);
        }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const UserDashboard = () => {
    const navigate = useNavigate();
    const { logout, user, getAuthHeaders, API_BASE_URL, activateRole, getSession } = useAuth();
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    useEffect(() => {
        activateRole('USER');
    }, [activateRole]);

    const socketBaseUrl = useMemo(() => {
        const base = API_BASE_URL || 'http://localhost:5000/api';
        return base.replace(/\/api\/?$/, '');
    }, [API_BASE_URL]);

    const upsertAppointmentRecord = useCallback((updated) => {
        if (!updated) {
            return;
        }

        setAppointments(prev => {
            const next = [...prev];
            const index = next.findIndex(item => item.id === updated.id);
            if (index === -1) {
                next.unshift(updated);
                return next;
            }
            next[index] = updated;
            return next;
        });

        setBookingHistory(prev => {
            const filtered = prev.filter(entry => entry.id !== updated.id);
            return [...filtered, updated];
        });
    }, []);

    const userSessionToken = getSession('USER')?.token;

    useEffect(() => {
        if (!userSessionToken) return;
        const source = new EventSource(`${socketBaseUrl}/api/appointments/stream?token=${encodeURIComponent(userSessionToken)}`);

        const handleRealtimeUpdate = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (!payload?.appointment) return;
                const normalized = normalizeAppointment(payload.appointment);
                upsertAppointmentRecord(normalized);
            } catch (error) {
                console.error('Realtime appointment parse error:', error);
            }
        };

        source.addEventListener('appointment:status-updated', handleRealtimeUpdate);
        source.addEventListener('appointment:booked', handleRealtimeUpdate);
        source.onerror = (err) => console.error('Appointment stream error:', err);

        return () => {
            source.removeEventListener('appointment:status-updated', handleRealtimeUpdate);
            source.removeEventListener('appointment:booked', handleRealtimeUpdate);
            source.close();
        };
    }, [socketBaseUrl, userSessionToken, upsertAppointmentRecord]);

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
        PENDING: 'Pending',
        CONFIRMED: 'Confirmed',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
};

const mapStatusLabel = (status = '') => {
    const key = status?.toString().toUpperCase();
    return STATUS_LABELS[key] || status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Pending';
};

const ACTIVE_APPOINTMENT_STATUSES = ['Pending', 'Confirmed'];

const isActiveAppointmentStatus = (status = '') => {
    const normalized = status?.toString();
    return ACTIVE_APPOINTMENT_STATUSES.includes(normalized);
};

const isPendingStatus = (status = '') => {
    const normalized = status?.toString().toLowerCase();
    return normalized === 'pending' || normalized === 'upcoming';
};

const normalizeStatusForTab = (status = '') => {
    const normalized = status?.toString().trim() || '';
    if (normalized.toLowerCase() === 'upcoming') {
        return 'Pending';
    }
    if (!normalized) {
        return 'Pending';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

const getStatusBadgeLabel = (statusRaw = '') => {
    const normalized = statusRaw?.toString().toUpperCase();
    switch (normalized) {
        case 'PENDING':
            return 'Pending';
        case 'CONFIRMED':
            return 'Confirmed';
        case 'COMPLETED':
            return 'Completed';
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return statusRaw?.charAt(0).toUpperCase() + statusRaw?.slice(1).toLowerCase() || 'Pending';
    }
};

const getStatusBadgeClass = (statusRaw = '') => {
    const normalized = statusRaw?.toString().toUpperCase();
    switch (normalized) {
        case 'CONFIRMED':
            return 'bg-blue-100 text-blue-800';
        case 'COMPLETED':
            return 'bg-emerald-100 text-emerald-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-amber-100 text-amber-800';
    }
};

const getBookingHistoryStatusClass = (status = '') => {
    const normalized = status?.toString().toLowerCase();
    switch (normalized) {
        case 'confirmed':
            return 'bg-blue-100 text-blue-800';
        case 'pending':
        case 'upcoming':
            return 'bg-orange-100 text-orange-800';
        case 'completed':
            return 'bg-emerald-100 text-emerald-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

    const formatCurrency = (value) => {
        const amount = Number(value);
        if (Number.isNaN(amount)) return '$0.00';
        return `$${amount.toFixed(2)}`;
    };

    const normalizeAppointment = (raw = {}) => {
        const appointmentDate = raw.appointmentDate || raw.date;
        const appointmentTime = raw.appointmentTime || raw.time || '';
        const parsedDate = parseDateOnly(appointmentDate);
    const providerName = [raw.client?.firstName, raw.client?.lastName].filter(Boolean).join(' ') || raw.client?.company || 'Service Team';

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
            statusBadge: getStatusBadgeLabel(raw.status),
            statusBadgeClass: getStatusBadgeClass(raw.status),
            amount: formatCurrency(raw.amount ?? raw.service?.price),
            rating: raw.rating || 0,
            comment: raw.comment || '',
            notes: raw.notes || '',
            serviceId: raw.serviceId,
            clientId: raw.clientId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            rescheduleRequest: raw.rescheduleRequest || null
        };
    };

    const loadAppointments = useCallback(async () => {
        setAppointmentsLoading(true);
        setAppointmentsError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/appointments/user`, {
                headers: getAuthHeaders()
            });
            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to load appointments');
            }

            const records = payload.data?.appointments || [];
            const mapped = records.map(normalizeAppointment);
            setAppointments(mapped);
            setBookingHistory(mapped);
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
        const forceLogoutToLogin = () => {
            logout();
            const userRole = localStorage.getItem('userRole') || 'USER';
            navigate(`/user/login?from=dashboard&role=${userRole}`);
        };

        const fetchProfile = async ({ silent = false } = {}) => {
            if (!silent) {
                setProfileLoading(true);
                setProfileError(null);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    headers: getAuthHeaders()
                });
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    if (response.status === 401 || response.status === 403 || response.status === 404) {
                        forceLogoutToLogin();
                        return;
                    }
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
                if (isMounted && !silent) {
                    setProfileLoading(false);
                }
            }
        };

        fetchProfile();

        const handleWindowFocus = () => {
            fetchProfile({ silent: true });
            loadAppointments();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchProfile({ silent: true });
                loadAppointments();
            }
        };

        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleWindowFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [API_BASE_URL, getAuthHeaders, loadAppointments, logout, navigate, user]);

    // Modal States
    const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showViewBookingModal, setShowViewBookingModal] = useState(false);
    const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
    const [justBooked, setJustBooked] = useState(false);
    const [rating, setRating] = useState(0);

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
        loginAlerts: true
    });
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [changePasswordForm, setChangePasswordForm] = useState({
        newPassword: '',
        confirmNewPassword: ''
    });
    const [changePasswordVisibility, setChangePasswordVisibility] = useState({
        newPassword: false,
        confirmNewPassword: false
    });
    const [changePasswordError, setChangePasswordError] = useState(null);
    const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);

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

    useEffect(() => {
        const handleAppointmentConfirmed = () => {
            loadAppointments();
        };

        window.addEventListener('appointmentConfirmed', handleAppointmentConfirmed);
        return () => {
            window.removeEventListener('appointmentConfirmed', handleAppointmentConfirmed);
        };
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
        const upcomingBookings = appointments.filter(a => isPendingStatus(a.status)).length;
        const confirmedBookings = appointments.filter(a => a.status === 'Confirmed').length;
        const cancelledBookings = appointments.filter(a => a.status === 'Cancelled').length;

        // Calculate total spent from booking history
        const totalSpent = bookingHistory.reduce((sum, booking) => {
            const amount = parseFloat(String(booking.amount || '').replace(/[^0-9.-]+/g, ''));
            const statusRaw = (booking.statusRaw || booking.status || '').toString().toUpperCase();
            if (statusRaw !== 'COMPLETED') return sum;
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
            confirmedBookings,
            cancelledBookings,
            totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            favoriteCategory,
            loyaltyPoints
        };
    }, [appointments, bookingHistory]);

    const appointmentStatusCounts = useMemo(() => ({
        pending: appointments.filter(a => isPendingStatus(a.status)).length,
        confirmed: appointments.filter(a => a.status === 'Confirmed').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
        cancelled: appointments.filter(a => a.status === 'Cancelled').length
    }), [appointments]);

    const monthlyAnalytics = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const buildMonthKey = (year, monthIndex) => `${year}-${monthIndex}`;
        const monthKeys = currentMonth < 6
            ? [0, 1, 2, 3, 4, 5, 6].map((m) => buildMonthKey(currentYear, m)) // Jan -> Jul
            : [
                buildMonthKey(currentYear, 6), // Jul
                buildMonthKey(currentYear, 7), // Aug
                buildMonthKey(currentYear, 8), // Sep
                buildMonthKey(currentYear, 9), // Oct
                buildMonthKey(currentYear, 10), // Nov
                buildMonthKey(currentYear, 11), // Dec
                buildMonthKey(currentYear + 1, 0) // Next Jan
            ];

        const aggregates = new Map();
        bookingHistory.forEach((booking) => {
            const sourceDate = booking.appointmentDate || booking.createdAt;
            if (!sourceDate) return;

            const parsed = parseDateOnly(sourceDate);
            if (Number.isNaN(parsed.getTime())) return;

            const key = buildMonthKey(parsed.getFullYear(), parsed.getMonth());
            const current = aggregates.get(key) || { bookings: 0, spending: 0 };
            current.bookings += 1;

            const amount = parseFloat(String(booking.amount || '').replace(/[^0-9.-]+/g, ''));
            const statusRaw = (booking.statusRaw || booking.status || '').toString().toUpperCase();
            if (!Number.isNaN(amount) && statusRaw === 'COMPLETED') {
                current.spending += amount;
            }

            aggregates.set(key, current);
        });

        const monthlyData = monthKeys.map((key) => {
            const [yearPart, monthPart] = key.split('-');
            const monthDate = new Date(Number(yearPart), Number(monthPart), 1);
            const agg = aggregates.get(key) || { bookings: 0, spending: 0 };
            return {
                key,
                label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                bookings: agg.bookings,
                spending: Number(agg.spending.toFixed(2))
            };
        });

        const currentMonthKey = buildMonthKey(currentYear, currentMonth);
        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonthKey = buildMonthKey(previousMonthDate.getFullYear(), previousMonthDate.getMonth());
        const currentMonthData = aggregates.get(currentMonthKey) || { bookings: 0, spending: 0 };
        const previousMonthData = aggregates.get(previousMonthKey) || { bookings: 0, spending: 0 };

        return {
            visibleMonths: monthlyData,
            currentMonthBookings: currentMonthData.bookings,
            previousMonthBookings: previousMonthData.bookings,
            currentMonthSpending: currentMonthData.spending,
            previousMonthSpending: previousMonthData.spending
        };
    }, [bookingHistory]);

    const revenueTrend = useMemo(() => {
        return monthlyAnalytics.visibleMonths.map((data, index, arr) => {
            const prev = arr[index - 1];
            const prevSpending = prev?.spending || 0;
            const hasData = data.spending > 0 || data.bookings > 0;
            let growth = null;
            if (hasData && index > 0) {
                if (prevSpending > 0) {
                    growth = ((data.spending - prevSpending) / prevSpending) * 100;
                } else if (data.spending > 0) {
                    growth = 100;
                } else {
                    growth = 0;
                }
            }

            return {
                label: data.label,
                revenue: data.spending,
                growth: growth === null ? null : Math.round(growth * 100) / 100,
                bookings: data.bookings,
                hasData
            };
        });
    }, [monthlyAnalytics]);

    const bookingChange = monthlyAnalytics.currentMonthBookings - monthlyAnalytics.previousMonthBookings;
    const spentChange = monthlyAnalytics.currentMonthSpending - monthlyAnalytics.previousMonthSpending;
    const nextConfirmedAppointmentLabel = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const nextConfirmed = appointments
            .filter((apt) => {
                const statusRaw = (apt.statusRaw || apt.status || '').toString().toUpperCase();
                if (statusRaw !== 'CONFIRMED') return false;
                const parsedDate = apt.appointmentDate ? parseDateOnly(apt.appointmentDate) : null;
                if (!parsedDate || Number.isNaN(parsedDate.getTime())) return false;
                parsedDate.setHours(0, 0, 0, 0);
                return parsedDate >= now;
            })
            .sort((a, b) => parseDateOnly(a.appointmentDate).getTime() - parseDateOnly(b.appointmentDate).getTime())[0];

        if (!nextConfirmed?.appointmentDate) {
            return 'No appointments';
        }

        const parsed = parseDateOnly(nextConfirmed.appointmentDate);
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [appointments]);

    const [profileActivityEvents, setProfileActivityEvents] = useState([]);

    const formatActivityTime = (value) => {
        if (!value) return 'Unknown time';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return 'Unknown time';
        return parsed.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const recentActivities = useMemo(() => {
        const appointmentActivities = bookingHistory.flatMap((booking) => {
            const items = [];
            const serviceName = booking.service || 'service';
            const createdAt = booking.createdAt || booking.appointmentDate;
            const updatedAt = booking.updatedAt || booking.createdAt || booking.appointmentDate;

            if (createdAt) {
                items.push({
                    id: `booking-${booking.id}`,
                    action: `Booked ${serviceName}`,
                    time: formatActivityTime(createdAt),
                    status: 'booking',
                    icon: Calendar,
                    timestamp: new Date(createdAt).getTime()
                });
            }

            const statusRaw = (booking.statusRaw || '').toString().toUpperCase();
            if (statusRaw === 'CONFIRMED') {
                items.push({
                    id: `confirmed-${booking.id}-${updatedAt}`,
                    action: `Appointment confirmed for ${serviceName}`,
                    time: formatActivityTime(updatedAt),
                    status: 'confirmation',
                    icon: CheckCircle,
                    timestamp: new Date(updatedAt).getTime()
                });
            }
            if (statusRaw === 'COMPLETED') {
                items.push({
                    id: `completed-${booking.id}-${updatedAt}`,
                    action: `Completed ${serviceName}`,
                    time: formatActivityTime(updatedAt),
                    status: 'completion',
                    icon: CheckCircle,
                    timestamp: new Date(updatedAt).getTime()
                });
            }
            if (statusRaw === 'CANCELLED') {
                items.push({
                    id: `cancelled-${booking.id}-${updatedAt}`,
                    action: `Cancelled ${serviceName}`,
                    time: formatActivityTime(updatedAt),
                    status: 'cancellation',
                    icon: XCircle,
                    timestamp: new Date(updatedAt).getTime()
                });
            }

            if (booking.rescheduleRequest?.status === 'PENDING') {
                const requestedAt = booking.rescheduleRequest.requestedAt || updatedAt;
                items.push({
                    id: `reschedule-request-${booking.id}-${requestedAt}`,
                    action: `Requested reschedule for ${serviceName}`,
                    time: formatActivityTime(requestedAt),
                    status: 'reschedule',
                    icon: Calendar,
                    timestamp: new Date(requestedAt).getTime()
                });
            }

            if (typeof booking.rating === 'number' && booking.rating > 0) {
                items.push({
                    id: `rating-${booking.id}-${updatedAt}`,
                    action: `Rated ${serviceName} ${booking.rating} stars`,
                    time: formatActivityTime(updatedAt),
                    status: 'rating',
                    icon: Star,
                    timestamp: new Date(updatedAt).getTime()
                });
            }

            return items.filter((item) => Number.isFinite(item.timestamp));
        });

        const profileActivities = profileActivityEvents.map((event) => ({
            ...event,
            time: formatActivityTime(event.timestamp),
            icon: User
        }));

        return [...profileActivities, ...appointmentActivities]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100);
    }, [bookingHistory, profileActivityEvents]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'booking': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'confirmation': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
            case 'completion': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'rating': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'profile': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'cancellation': return 'text-red-600 bg-red-50 border-red-200';
            case 'reschedule': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
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

    const openChangePasswordModal = () => {
        setChangePasswordForm({ newPassword: '', confirmNewPassword: '' });
        setChangePasswordVisibility({ newPassword: false, confirmNewPassword: false });
        setChangePasswordError(null);
        setChangePasswordSuccess(false);
        setShowChangePasswordModal(true);
    };

    const closeChangePasswordModal = () => {
        if (changePasswordLoading) return;
        setShowChangePasswordModal(false);
        setChangePasswordError(null);
        setChangePasswordSuccess(false);
    };

    const handleChangePasswordInput = (event) => {
        const { name, value } = event.target;
        setChangePasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleChangePasswordVisibility = (field) => {
        setChangePasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChangePasswordSubmit = async (event) => {
        event.preventDefault();
        setChangePasswordError(null);
        setChangePasswordSuccess(false);

        const { newPassword, confirmNewPassword } = changePasswordForm;
        if (!newPassword || !confirmNewPassword) {
            setChangePasswordError('Please fill in both password fields');
            return;
        }
        if (newPassword.length < 6) {
            setChangePasswordError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setChangePasswordError('Passwords do not match');
            return;
        }

        setChangePasswordLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    newPassword,
                    confirmNewPassword
                })
            });
            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to change password');
            }

            setChangePasswordSuccess(true);
            setChangePasswordForm({ newPassword: '', confirmNewPassword: '' });
            setTimeout(() => {
                setShowChangePasswordModal(false);
                setChangePasswordSuccess(false);
            }, 1200);
        } catch (error) {
            setChangePasswordError(error.message || 'Failed to change password');
        } finally {
            setChangePasswordLoading(false);
        }
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
                    email: profileData.email,
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
            setProfileActivityEvents((prev) => [{
                id: `profile-${Date.now()}`,
                action: 'Updated profile information',
                status: 'profile',
                timestamp: Date.now()
            }, ...prev].slice(0, 50));
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
        const normalizedStatus = normalizeStatusForTab(appointment.status);
        const matchesTab = activeAppointmentTab === 'All' || normalizedStatus === activeAppointmentTab;

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
        doc.text(`Total Spent: $${filteredBookingHistory.reduce((sum, booking) => {
            const statusRaw = (booking.statusRaw || booking.status || '').toString().toUpperCase();
            if (statusRaw !== 'COMPLETED') return sum;
            return sum + parseFloat(String(booking.amount || '0').replace('$', ''));
        }, 0).toFixed(2)}`, 20, finalY + 10);
        doc.text(`Average Rating: ${userStats.averageRating}/5`, 20, finalY + 20);

        // Save the PDF
        doc.save(`booking_history_${profileData.firstName}_${profileData.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportProfilePDF = async () => {
        try {
            let avatarSource = imagePreview || profileData.avatar || null;
            if (avatarSource && !avatarSource.startsWith('data:')) {
                try {
                    const response = await fetch(avatarSource, { cache: 'no-store' });
                    if (response.ok) {
                        const blob = await response.blob();
                        avatarSource = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    } else {
                        avatarSource = null;
                    }
                } catch (fetchError) {
                    console.warn('Unable to load avatar for PDF export', fetchError);
                    avatarSource = null;
                }
            }

            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const exportTimestamp = new Date().toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            doc.setFontSize(10);
            doc.text(`Exported: ${exportTimestamp}`, 40, 40);

            const headerY = 70;
            doc.setFontSize(20);
            doc.text(`${profileData.firstName} ${profileData.lastName}`.trim() || 'User', 40, headerY);
            doc.setFontSize(12);
            doc.text(getRoleLabel(profileData.role) || 'User', 40, headerY + 20);

            if (avatarSource) {
                const width = 90;
                const height = 90;
                const imageFormat = avatarSource.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                doc.addImage(avatarSource, imageFormat, 400, 30, width, height);
            }

            let personalY = 120;
            doc.setFontSize(16);
            doc.text('Personal Information', 40, personalY);
            personalY += 25;
            doc.setFontSize(12);

            const personalFields = [
                { label: 'First Name', value: profileData.firstName },
                { label: 'Last Name', value: profileData.lastName },
                { label: 'Email', value: profileData.email },
                { label: 'Phone', value: profileData.phone },
                { label: 'Status', value: profileData.status },
                { label: 'Join Date', value: profileData.joinDate },
                { label: 'Last Login', value: profileData.lastLogin },
                { label: 'Address', value: profileData.address },
                { label: 'Bio', value: profileData.bio }
            ];

            personalFields.forEach((field) => {
                const labelX = 40;
                const valueX = 150;
                doc.setFontSize(10);
                doc.setTextColor('#555');
                doc.text(`${field.label}:`, labelX, personalY);
                doc.setFontSize(11);
                doc.setTextColor('#111');
                const lines = doc.splitTextToSize(field.value || 'N/A', 270);
                doc.text(lines, valueX, personalY);
                personalY += lines.length * 14;
                personalY += 6;
            });

            let statsY = personalY + 20;
            doc.setFontSize(16);
            doc.text('Account Stats', 40, statsY);
            statsY += 25;
            doc.setFontSize(11);

            const stats = [
                { label: 'Total Bookings', value: String(userStats.totalBookings) },
                { label: 'Completed Bookings', value: String(userStats.completedBookings) },
                { label: 'Upcoming Bookings', value: String(userStats.upcomingBookings) },
                { label: 'Confirmed Bookings', value: String(userStats.confirmedBookings) },
                { label: 'Cancelled Bookings', value: String(userStats.cancelledBookings) },
                { label: 'Total Spent', value: `$${userStats.totalSpent}` },
                { label: 'Average Rating', value: `${userStats.averageRating}/5` },
                { label: 'Loyalty Points', value: String(userStats.loyaltyPoints) },
                { label: 'Favorite Service', value: userStats.favoriteCategory || 'N/A' }
            ];

            stats.forEach((stat) => {
                doc.setFontSize(10);
                doc.setTextColor('#555');
                doc.text(`${stat.label}:`, 40, statsY);
                doc.setFontSize(11);
                doc.setTextColor('#111');
                doc.text(stat.value, 170, statsY);
                statsY += 20;
            });

            doc.save('user-profile.pdf');
        } catch (error) {
            console.error('Export profile PDF error:', error);
        }
    };

    const handleDownloadInvoicesPDF = () => {
        const doc = new jsPDF();
        const generatedAt = new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User';

        doc.setFontSize(18);
        doc.text('Invoices Report', 14, 18);
        doc.setFontSize(10);
        doc.text(`Generated: ${generatedAt}`, 14, 25);
        doc.text(`Customer: ${fullName}`, 14, 31);
        doc.text(`Email: ${profileData.email || 'N/A'}`, 14, 37);

        const invoiceRows = bookingHistory.map((booking, index) => {
            const amount = parseFloat(String(booking.amount || '').replace(/[^0-9.-]+/g, ''));
            return [
                `INV-${String(index + 1).padStart(4, '0')}`,
                booking.service || 'Service',
                booking.date || 'N/A',
                booking.status || 'N/A',
                Number.isNaN(amount) ? '$0.00' : `$${amount.toFixed(2)}`
            ];
        });

        autoTable(doc, {
            startY: 44,
            head: [['Invoice #', 'Service', 'Date', 'Status', 'Amount']],
            body: invoiceRows.length ? invoiceRows : [['N/A', 'No invoices', '-', '-', '$0.00']],
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255 }
        });

        const total = bookingHistory.reduce((sum, booking) => {
            const amount = parseFloat(String(booking.amount || '').replace(/[^0-9.-]+/g, ''));
            return sum + (Number.isNaN(amount) ? 0 : amount);
        }, 0);
        const summaryY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.text(`Total invoices: ${bookingHistory.length}`, 14, summaryY);
        doc.text(`Total amount: $${total.toFixed(2)}`, 14, summaryY + 16);

        doc.save(`user_invoices_${new Date().toISOString().split('T')[0]}.pdf`);
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
                                            appointmentDate: toDateOnlyString(date)
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
            time: selectedAppointment?.appointmentTime || '',
            reason: selectedAppointment?.notes || ''
        });
        const [selectedDate, setSelectedDate] = useState(parseDateOnly(selectedAppointment?.appointmentDate));
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
            if (!rescheduleForm.reason.trim()) {
                newErrors.reason = 'Please enter a reason';
            }

            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) {
                return;
            }

            setIsRescheduling(true);
            setRescheduleError('');

            try {
                const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}/reschedule-request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        requestedDate: rescheduleForm.date,
                        requestedTime: rescheduleForm.time,
                        reason: rescheduleForm.reason.trim()
                    })
                });

                const payload = await response.json();
                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to send reschedule request');
                }

                await loadAppointments();

                setRescheduleForm({
                    date: '',
                    time: '',
                    reason: ''
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
                setRescheduleError(err.message || 'Failed to send reschedule request');
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
                                                date: toDateOnlyString(date)
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
                            <div>
                                <label className="block font-medium mb-2">Reason</label>
                                <textarea
                                    value={rescheduleForm.reason}
                                    onChange={(e) => {
                                        setRescheduleForm({
                                            ...rescheduleForm,
                                            reason: e.target.value
                                        });
                                    }}
                                    rows="3"
                                    className="border p-3 rounded w-full"
                                    placeholder="Enter reason for rescheduling"
                                />
                                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Please select date, time, and reason
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
                                            Send Reschedule Request
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

                setRatingForm({
                    rating: 0,
                    comment: ''
                });
                setRating(0);
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
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBookingHistoryStatusClass(selectedAppointment?.status)}`}>
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
                                    <option value="confirmed">Confirmed</option>
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
        const [activitySearchQuery, setActivitySearchQuery] = useState('');
        const activitiesPerPage = 10;

        const allActivities = recentActivities;

        useEffect(() => {
            setCurrentPage(1);
        }, [filterStatus, activitySearchQuery]);

        // Filter activities based on status and search term
        const filteredActivities = allActivities.filter(activity => {
            const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
            const query = activitySearchQuery.trim().toLowerCase();
            const matchesSearch = !query ||
                activity.action.toLowerCase().includes(query) ||
                activity.time.toLowerCase().includes(query) ||
                activity.status.toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
        });

        // Pagination
        const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
        const startIndex = (currentPage - 1) * activitiesPerPage;
        const paginatedActivities = filteredActivities.slice(startIndex, startIndex + activitiesPerPage);

        const handleExportActivities = () => {
            const stamp = new Date().toISOString().split('T')[0];
            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text('User Recent Activities', 14, 18);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
            doc.text(`Filter: ${filterStatus}`, 14, 31);
            doc.text(`Search: ${activitySearchQuery || 'N/A'}`, 14, 37);

            const tableRows = filteredActivities.map((activity) => [
                activity.action,
                activity.time,
                activity.status
            ]);

            autoTable(doc, {
                startY: 42,
                head: [['Action', 'Time', 'Status']],
                body: tableRows.length ? tableRows : [['No activities found', '-', '-']],
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [124, 58, 237] }
            });

            doc.save(`user_recent_activities_${stamp}.pdf`);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
                    {/* Modal Header */}
                    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
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
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="all">All Activities</option>
                                    <option value="booking">Bookings</option>
                                    <option value="confirmation">Confirmations</option>
                                    <option value="completion">Completions</option>
                                    <option value="rating">Ratings</option>
                                    <option value="profile">Profile Updates</option>
                                    <option value="cancellation">Cancellations</option>
                                    <option value="reschedule">Reschedule Requests</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm font-medium text-gray-700">Search:</span>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search activities..."
                                        value={activitySearchQuery}
                                        onChange={(e) => setActivitySearchQuery(e.target.value)}
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
                            {paginatedActivities.length === 0 && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                                    No activities found for this filter/search.
                                </div>
                            )}
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
                                    onClick={handleExportActivities}
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
                const upcomingAppointments = appointments.filter(apt => apt.status === 'Confirmed');
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
                                    change: `${bookingChange >= 0 ? '+' : ''}${bookingChange} this month`,
                                    positive: bookingChange >= 0,
                                    icon: Calendar,
                                    gradient: 'from-violet-500 to-fuchsia-600',
                                    delay: 0
                                },
                                {
                                    title: 'Total Spent',
                                    value: `$${userStats.totalSpent}`,
                                    change: `${spentChange >= 0 ? '+' : '-'}$${Math.abs(spentChange).toFixed(2)} this month`,
                                    positive: spentChange >= 0,
                                    icon: DollarSign,
                                    gradient: 'from-blue-500 to-cyan-600',
                                    delay: 100
                                },
                                {
                                    title: 'Upcoming',
                                    value: appointments.filter(apt => apt.status === 'Confirmed').length,
                                    change: nextConfirmedAppointmentLabel === 'No appointments'
                                        ? 'No appointments'
                                        : `Next: ${nextConfirmedAppointmentLabel}`,
                                    positive: nextConfirmedAppointmentLabel !== 'No appointments',
                                    icon: Clock,
                                    gradient: 'from-emerald-500 to-teal-600',
                                    delay: 200
                                },
                                {
                                    title: 'Avg Rating',
                                    value: userStats.averageRating + '/5',
                                    change: 'Your average rating',
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
                                                const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);
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
                                                const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);
                                                const denominator = Math.max(revenueTrend.length - 1, 1);
                                                const points = revenueTrend.map((data, index) => {
                                                    const x = (index / denominator) * 400;
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
                                                            const x = (index / denominator) * 400;
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
                                                        {data.hasData ? (
                                                            <>
                                                                <div className="font-semibold">${data.revenue.toLocaleString()}</div>
                                                                {data.growth !== null && (
                                                                    <div className={`flex items-center gap-1 text-xs ${data.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                        {data.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                                        {Math.abs(data.growth)}%
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="text-xs text-gray-300">No spending data</div>
                                                        )}
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
                                    {recentActivities.slice(0, 5).map((activity) => {
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
                            {[
                                { label: 'Pending', value: appointmentStatusCounts.pending, icon: Calendar, iconClass: 'text-violet-500' },
                                { label: 'Confirmed', value: appointmentStatusCounts.confirmed, icon: Shield, iconClass: 'text-cyan-500' },
                                { label: 'Completed', value: appointmentStatusCounts.completed, icon: CheckCircle, iconClass: 'text-emerald-500' },
                                { label: 'Cancelled', value: appointmentStatusCounts.cancelled, icon: XCircle, iconClass: 'text-red-500' }
                            ].map((stat) => {
                                const StatIcon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <StatIcon className={stat.iconClass} size={32} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Appointments Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveAppointmentTab(tab)}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeAppointmentTab === tab
                                        ? 'bg-white text-violet-600 shadow-lg'
                                        : 'text-gray-600 hover:text-violet-600'
                                        }`}
                                >
                                    {tab} ({tab === 'All' ? appointments.length :
                                        tab === 'Pending' ? appointmentStatusCounts.pending :
                                            tab === 'Confirmed' ? appointmentStatusCounts.confirmed :
                                                tab === 'Completed' ? appointmentStatusCounts.completed :
                                                    appointmentStatusCounts.cancelled
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
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-800">{appointment.service}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${appointment.statusBadgeClass}`}>
                                                        {appointment.statusBadge}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{appointment.provider}</p>
                                            </div>
                                        </div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.statusBadgeClass}`}>
                                                        {appointment.statusBadge}
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
                                                {isActiveAppointmentStatus(appointment.status) && (
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
                                                    appointment.rating > 0 ? (
                                                        <p className="w-full px-4 py-2 text-center text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg">
                                                            Thanks for your rating
                                                        </p>
                                                    ) : (
                                                        <button
                                                            onClick={() => rateAppointment(appointment.id)}
                                                            className="w-full px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                                                        >
                                                            Rate Service
                                                        </button>
                                                    )
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingHistoryStatusClass(booking.status)}`}>
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
                                                            className="p-1 mx-4 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                                        >
                                                            <ViewIcon size={16} />
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

                                            <button
                                                type="button"
                                                onClick={openChangePasswordModal}
                                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                                            >
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
                                            {recentActivities.slice(0, 6).map((activity) => {
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
                                            { icon: Download, label: 'Export Data', color: 'text-purple-600', onClick: handleExportProfilePDF },
                                            { icon: FileText, label: 'Download Invoices', color: 'text-blue-600', onClick: handleDownloadInvoicesPDF },
                                            { icon: CreditCard, label: 'Payment Methods', color: 'text-emerald-600', onClick: () => setShowPaymentMethodsModal(true) },
                                        ].map((action, index) => {
                                            const ActionIcon = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={action.onClick}
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

            {showChangePasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                            <button
                                type="button"
                                onClick={closeChangePasswordModal}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePasswordSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={changePasswordVisibility.newPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={changePasswordForm.newPassword}
                                        onChange={handleChangePasswordInput}
                                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleChangePasswordVisibility('newPassword')}
                                        className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {changePasswordVisibility.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={changePasswordVisibility.confirmNewPassword ? 'text' : 'password'}
                                        name="confirmNewPassword"
                                        value={changePasswordForm.confirmNewPassword}
                                        onChange={handleChangePasswordInput}
                                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleChangePasswordVisibility('confirmNewPassword')}
                                        className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {changePasswordVisibility.confirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {changePasswordError && (
                                <p className="text-sm text-red-600">{changePasswordError}</p>
                            )}
                            {changePasswordSuccess && (
                                <p className="text-sm text-emerald-600">Password changed successfully</p>
                            )}
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeChangePasswordModal}
                                    className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={changePasswordLoading}
                                    className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {changePasswordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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

            {/* Payment Methods Modal */}
            {showPaymentMethodsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modalSlideIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Payment Methods</h3>
                                    <p className="text-gray-600 mt-1">Available options for your appointments</p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentMethodsModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-700">Pay in Cash</p>
                                <p className="text-sm text-emerald-600 mt-1">You can pay directly in cash at your appointment.</p>
                            </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-sm font-semibold text-amber-700">Online Payment</p>
                                <p className="text-sm text-amber-600 mt-1">Online payment is coming soon.</p>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowPaymentMethodsModal(false)}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        <p className="font-semibold">Reschedule Request Sent!</p>
                        <p className="text-sm opacity-90">Client will confirm or cancel your request.</p>
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
