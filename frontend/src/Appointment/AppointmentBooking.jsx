import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { useAuth } from '../Context/AuthContext.jsx';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function AppointmentBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, getAuthHeaders, API_BASE_URL } = useAuth();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [servicesError, setServicesError] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [formData, setFormData] = useState({
        serviceId: '',
        date: '',
        time: '',
        notes: ''
    });

    // Determine where to navigate back to based on the origin
    const from = location.state?.from;
    const backPath = from === 'dashboard' ? '/dashboard/user' : '/';

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/user/login', { state: { from: 'appointment' } });
        }
    }, [isLoggedIn, navigate]);

    // Fetch available services
    useEffect(() => {
        if (!isLoggedIn) {
            setServicesLoading(false);
            return;
        }

        let isMounted = true;

        const fetchServices = async () => {
            setServicesLoading(true);
            setServicesError('');

            try {
                const response = await fetch(`${API_BASE_URL}/services/active`, {
                    headers: getAuthHeaders()
                });
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to load services');
                }

                if (isMounted) {
                    setServices(payload.data.services || []);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                if (isMounted) {
                    setServices([]);
                    setServicesError(error.message || 'Failed to load services');
                }
            } finally {
                if (isMounted) {
                    setServicesLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
        };
    }, [isLoggedIn, API_BASE_URL, getAuthHeaders]);

    useEffect(() => {
        if (!isLoggedIn) {
            setProfileLoading(false);
            setProfileError('Login required to load profile details');
            return;
        }

        let isMounted = true;

        const fetchProfile = async () => {
            setProfileLoading(true);
            setProfileError('');

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    headers: getAuthHeaders()
                });
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || 'Unable to load profile');
                }

                const profile = payload.data?.user;
                if (!profile) {
                    throw new Error('Profile data missing');
                }

                if (isMounted) {
                    setUserProfile(profile);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (isMounted) {
                    setProfileError(error.message || 'Failed to load profile');
                    setUserProfile(null);
                }
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
    }, [isLoggedIn, API_BASE_URL, getAuthHeaders]);

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.serviceId) newErrors.serviceId = 'Please select a service';
        if (!formData.date) newErrors.date = 'Please select a date';
        if (!formData.time) newErrors.time = 'Please select a time';

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                if (!userProfile) {
                    alert('Profile details are required to book an appointment. Please refresh or update your profile.');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        ...formData,
                        customerName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
                        customerEmail: userProfile.email,
                        customerPhone: userProfile.phone || userProfile.mobile
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Appointment booked successfully!');
                    setFormData({ serviceId: '', date: '', time: '', notes: '' });
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setErrors({});
                } else {
                    alert(data.message || 'Failed to book appointment');
                }
            } catch (error) {
                console.error('Booking error:', error);
                alert('Network error. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl">
                    <div className="flex justify-start mb-4">
                        <button
                            onClick={() => navigate(backPath)}
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition"
                        >
                            <Home className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-4xl font-bold text-center mb-2">Book Your Appointment</h2>
                    <p className="text-gray-600 text-center mb-8">Fill in the details and we'll get back to you</p>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-6 text-white shadow-2xl border border-white/30 space-y-1">
                            <p className="text-lg font-semibold">Appointment Profile</p>
                            <p className="text-sm opacity-90">We pre-fill your details to keep everything in sync with your dashboard.</p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Your Information</h3>
                            {profileLoading ? (
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                    Fetching your profile details...
                                </div>
                            ) : profileError ? (
                                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {profileError}
                                </div>
                            ) : userProfile ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-gray-600 text-sm mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={`${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()}
                                            readOnly
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 text-sm mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={userProfile.email || ''}
                                            readOnly
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 text-sm mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={userProfile.phone || userProfile.mobile || ''}
                                            readOnly
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-700"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                    No profile data available. Please update your profile from the dashboard first.
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Service Selection</h3>
                            <label className="block text-gray-700 font-semibold mb-2">Service</label>
                            {servicesLoading ? (
                                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500">
                                    Loading services...
                                </div>
                            ) : servicesError ? (
                                <div className="w-full px-4 py-3 rounded-lg border border-red-300 bg-red-50 text-red-700">
                                    {servicesError}
                                </div>
                            ) : services.length === 0 ? (
                                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-yellow-50 text-gray-700">
                                    No active services are available right now. Please check back later.
                                </div>
                            ) : (
                                <select
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                >
                                    <option value="">Select a service</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name} - ${service.price}
                                            {service.category ? ` (${service.category})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.serviceId && <p className="text-red-500 text-sm mt-1">{errors.serviceId}</p>}
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Choose your slot</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-600 text-sm mb-1">Select Date</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                            setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="border border-gray-300 rounded-2xl px-4 py-3 w-full text-gray-700"
                                        minDate={new Date()}
                                    />
                                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-600 text-sm mb-1">Select Time</label>
                                    <DatePicker
                                        selected={selectedTime}
                                        onChange={(time) => {
                                            setSelectedTime(time);
                                            setFormData({ ...formData, time: time ? time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '' });
                                        }}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={30}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        className="border border-gray-300 rounded-2xl px-4 py-3 w-full text-gray-700"
                                    />
                                    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-5 h-5" />
                                {isLoading ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}