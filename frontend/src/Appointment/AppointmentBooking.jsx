import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function AppointmentBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+91 ',
        service: '',
        date: '',
        time: ''
    });

    // Determine where to navigate back to based on the origin
    const from = location.state?.from;
    const backPath = from === 'dashboard' ? '/dashboard/user' : '/';

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone || formData.phone === '+91 ') newErrors.phone = 'Phone is required';
        if (!formData.service) newErrors.service = 'Service is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';

        if (Object.keys(newErrors).length === 0) {
            alert('Appointment request submitted! We\'ll contact you shortly.');
            setFormData({ name: '', email: '', phone: '+91 ', service: '', date: '', time: '' });
            setSelectedDate(null);
            setSelectedTime(null);
            setErrors({});
        } else {
            setErrors(newErrors);
        }
    };

    const services = [
        { name: 'Consultation', duration: '30 min', price: '$50' },
        { name: 'Full Service', duration: '60 min', price: '$100' },
        { name: 'Premium Package', duration: '90 min', price: '$150' }
    ];

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
                            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (!value.startsWith('+91 ')) {
                                            value = '+91 ' + value.replace(/^\+91\s*/, '');
                                        }
                                        value = '+91 ' + value.slice(4).replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, phone: value });
                                    }}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="+91 1234567890"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Service</label>
                            <select
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                            >
                                <option value="">Select a service</option>
                                {services.map((service, idx) => (
                                    <option key={idx} value={service.name}>{service.name}</option>
                                ))}
                            </select>
                            {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
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
