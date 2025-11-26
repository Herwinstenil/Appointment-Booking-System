import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        role: ''
    });

    const handleSubmit = () => {
        // Clear previous errors
        setErrors({ email: '', password: '', role: '' });

        let hasErrors = false;

        if (!formData.email) {
            setErrors(prev => ({ ...prev, email: 'required' }));
            hasErrors = true;
        } else if (!formData.email.includes('@gmail.com')) {
            setErrors(prev => ({ ...prev, email: 'Email must include @gmail.com' }));
            hasErrors = true;
        }
        if (!formData.password) {
            setErrors(prev => ({ ...prev, password: 'required' }));
            hasErrors = true;
        }
        if (formData.email && formData.password && !formData.role) {
            setErrors(prev => ({ ...prev, role: 'please choose your role' }));
            hasErrors = true;
        }

        if (!hasErrors) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                alert(`Login attempt as ${formData.role}: ${formData.email}`);
            }, 1500);
        }
    };

    const roles = [
        { value: 'admin', label: 'Admin' },
        { value: 'client', label: 'Client' },
        { value: 'user', label: 'User' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-md w-full relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-all duration-300 hover:translate-x-[-4px] group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-[-2px]" />
                    <span className="font-medium">Back to Home</span>
                </button>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-110 hover:rotate-12 shadow-lg">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">Login to your account</p>
                    </div>

                    <div className="space-y-6">
                        {/* Email Field */}
                        <div className="transform transition-all duration-300">
                            <label className="block text-gray-700 font-semibold mb-2">Email</label>
                            <div className="relative group">
                                <Mail className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-600' : 'text-gray-400'
                                    }`} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white"
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="transform transition-all duration-300">
                            <label className="block text-gray-700 font-semibold mb-2">Password</label>
                            <div className="relative group">
                                <Lock className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-600' : 'text-gray-400'
                                    }`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Role Selection */}
                        <div className="transform transition-all duration-300">
                            <label className="block text-gray-700 font-semibold mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                onFocus={() => setFocusedField('role')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white ${focusedField === 'role' ? 'border-purple-600' : 'border-gray-200'
                                    } focus:border-purple-600 focus:outline-none`}
                            >
                                <option value="">Select your role</option>
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <span className="relative z-10">
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>

                    {/* Additional Links */}
                    <div className="text-center mt-6">
                        <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-300 hover:underline">
                            Forgot your password?
                        </a>
                    </div>

                    <div className="text-center mt-4">
                        <span className="text-gray-600 text-sm">Don't have an account? </span>
                        <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-bold transition-colors duration-300 hover:underline">
                            Sign In
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Secured with end-to-end encryption 🔒
                </p>
            </div>
        </div>
    );
}