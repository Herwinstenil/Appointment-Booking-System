import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

export default function AppointmentBooking() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: ''
    });

    const handleSubmit = () => {
        if (formData.name && formData.email && formData.phone && formData.service && formData.date && formData.time) {
            alert('Appointment request submitted! We\'ll contact you shortly.');
            setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' });
        } else {
            alert('Please fill in all fields');
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
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
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
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="+1 234 567 8900"
                                />
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Time</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                />
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
