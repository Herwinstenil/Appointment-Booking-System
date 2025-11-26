import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.email && formData.password && formData.role) {
            alert(`Login attempt as ${formData.role}: ${formData.email}`);
            // Here you would typically handle the login logic
        } else {
            alert('Please fill in all fields');
        }
    };

    const roles = [
        { value: 'admin', label: 'Admin' },
        { value: 'client', label: 'Client' },
        { value: 'user', label: 'User' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </button>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Login in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Email</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                required
                            >
                                <option value="">Select your role</option>
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition transform hover:scale-105"
                        >
                            Login
                        </button>
                    </form>

                    {/* Additional Links */}
                    <div className="text-center mt-6">
                        <a href="#" className="text-purple-600 hover:text-purple-700 text-sm">
                            Forgot your password?
                        </a>
                    </div>

                    <div className="text-center mt-4">
                        <span className="text-gray-600 text-sm">Don't have an account? </span>
                        <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                            Sign In
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
