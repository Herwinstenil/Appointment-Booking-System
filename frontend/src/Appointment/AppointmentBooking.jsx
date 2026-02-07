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

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.serviceId) newErrors.serviceId = 'Please select a service';
        if (!formData.date) newErrors.date = 'Please select a date';
        if (!formData.time) newErrors.time = 'Please select a time';

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(formData)
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
                        <div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium">Select Date</label>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' });
                                    }}
                                    dateFormat="yyyy-MM-dd"
                                    className="border p-2 rounded w-full"
                                    minDate={new Date()}
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>

                            <div>
                                <label className="block font-medium">Select Time</label>
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
                                    className="border p-2 rounded w-full"
                                />
                                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Confirm Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
