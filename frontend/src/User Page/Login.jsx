import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Home } from 'lucide-react';
import { useAuth } from '../Context/AuthContext.jsx';

export default function Login() {
    const navigate = useNavigate();
    const { login, resetPassword } = useAuth();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotFormData, setForgotFormData] = useState({
        email: '',
        newPassword: ''
    });
    const [forgotErrors, setForgotErrors] = useState({
        email: '',
        newPassword: ''
    });
    const [isForgotLoading, setIsForgotLoading] = useState(false);

    const from = searchParams.get('from');
    const role = searchParams.get('role');
    const showBackToHome = from === 'dashboard' && role === 'USER';

    const handleSubmit = async () => {
        // Clear previous errors
        setErrors({ email: '', password: '' });

        let hasErrors = false;

        if (!formData.email) {
            setErrors(prev => ({ ...prev, email: 'required' }));
            hasErrors = true;
        } else if (!formData.email.includes('@')) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
            hasErrors = true;
        }
        if (!formData.password) {
            setErrors(prev => ({ ...prev, password: 'required' }));
            hasErrors = true;
        }

        if (!hasErrors) {
            setIsLoading(true);
            const result = await login(formData.email, formData.password);
            setIsLoading(false);

            if (result.success) {
                // Navigation based on user role from API
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'USER') {
                    navigate('/dashboard/user');
                } else if (userRole === 'ADMIN') {
                    navigate('/dashboard/admin');
                } else if (userRole === 'CLIENT') {
                    navigate('/dashboard/client');
                }
            } else {
                // Show error
                alert(result.message);
            }
        }
    };

    const handleForgotSubmit = async () => {
        // Clear previous errors
        setForgotErrors({ email: '', newPassword: '' });

        let hasErrors = false;

        if (!forgotFormData.email) {
            setForgotErrors(prev => ({ ...prev, email: 'required' }));
            hasErrors = true;
        } else if (!forgotFormData.email.includes('@')) {
            setForgotErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
            hasErrors = true;
        }
        if (!forgotFormData.newPassword) {
            setForgotErrors(prev => ({ ...prev, newPassword: 'required' }));
            hasErrors = true;
        } else if (forgotFormData.newPassword.length < 6) {
            setForgotErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters' }));
            hasErrors = true;
        }

        if (!hasErrors) {
            setIsForgotLoading(true);
            const result = await resetPassword(forgotFormData.email, forgotFormData.newPassword);
            setIsForgotLoading(false);

            if (result.success) {
                setShowForgotModal(false);
                setForgotFormData({ email: '', newPassword: '' });
                // Navigation will happen automatically in resetPassword via login
            } else {
                alert(result.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-md w-full relative z-10">
                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
                    {/* Back Button */}
                    {showBackToHome && (
                        <div className="flex justify-start mb-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition"
                            >
                                <Home className="w-4 h-4" />
                                <span className="font-medium">Back to Home</span>
                            </button>
                        </div>
                    )}

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
                        <button
                            onClick={() => setShowForgotModal(true)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-300 hover:underline bg-transparent border-none cursor-pointer"
                        >
                            Forgot your password?
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <span className="text-gray-600 text-sm">Don't have an account? </span>
                        <a href="/user/signin" className="text-purple-600 hover:text-purple-700 text-sm font-bold transition-colors duration-300 hover:underline">
                            Sign In
                        </a>
                    </div>
                </div>

                {/* Forgot Password Modal */}
                {showForgotModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                    Reset Password
                                </h2>
                                <p className="text-gray-600">Enter your email and new password</p>
                            </div>

                            <div className="space-y-4">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={forgotFormData.email}
                                            onChange={(e) => setForgotFormData({ ...forgotFormData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {forgotErrors.email && <p className="text-red-500 text-sm mt-1">{forgotErrors.email}</p>}
                                </div>

                                {/* New Password Field */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={forgotFormData.newPassword}
                                            onChange={(e) => setForgotFormData({ ...forgotFormData, newPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    {forgotErrors.newPassword && <p className="text-red-500 text-sm mt-1">{forgotErrors.newPassword}</p>}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowForgotModal(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleForgotSubmit}
                                        disabled={isForgotLoading}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isForgotLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Resetting...
                                            </span>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Secured with end-to-end encryption 🔒
                </p>
            </div>
        </div>
    );
}
