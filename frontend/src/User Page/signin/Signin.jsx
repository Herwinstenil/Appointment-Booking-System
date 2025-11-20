import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Please fill the details to create a account.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        console.log('Signin attempt:', { username, email, password, confirmPassword });
        // Navigate to login page after account creation
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }

                @keyframes slide-in-left {
                    from {
                        opacity: 0;
                        transform: translateX(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }

                @keyframes slide-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }

                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }

                @keyframes particles {
                    0% { transform: translateY(0) translateX(0); opacity: 1; }
                    100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
                }

                .float-animation {
                    animation: float 4s ease-in-out infinite;
                }

                .pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                .slide-in-left {
                    animation: slide-in-left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .slide-in-right {
                    animation: slide-in-right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .fade-in {
                    animation: fade-in 1s ease-out forwards;
                }

                .rotate-slow {
                    animation: rotate 30s linear infinite;
                }

                .gradient-animate {
                    background-size: 200% 200%;
                    animation: gradient-shift 5s ease infinite;
                }

                .bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                }

                .shimmer-bg {
                    background: linear-gradient(
                        90deg,
                        rgba(59, 130, 246, 0) 0%,
                        rgba(59, 130, 246, 0.4) 50%,
                        rgba(59, 130, 246, 0) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 2.5s infinite;
                }

                .input-glow {
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
                    transition: all 0.3s ease;
                }

                .input-glow:focus {
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3),
                                0 0 20px rgba(59, 130, 246, 0.4);
                    transform: translateY(-2px);
                }

                .button-hover {
                    position: relative;
                    overflow: hidden;
                }

                .button-hover::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .button-hover:hover::before {
                    width: 300px;
                    height: 300px;
                }

                .particle {
                    animation: particles 3s infinite;
                }

                .stagger-1 { animation-delay: 0.1s; }
                .stagger-2 { animation-delay: 0.2s; }
                .stagger-3 { animation-delay: 0.3s; }
                .stagger-4 { animation-delay: 0.4s; }
                .stagger-5 { animation-delay: 0.5s; }
                .stagger-6 { animation-delay: 0.6s; }
                .stagger-7 { animation-delay: 0.7s; }
                .stagger-8 { animation-delay: 0.8s; }
            `}</style>

            <div className="max-w-6xl w-full bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row fade-in border border-gray-700/50">
                {/* Left Side - Visual Content */}
                <div className="md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 gradient-animate p-8 flex flex-col justify-center relative overflow-hidden slide-in-left">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full pulse-glow blur-2xl"></div>
                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 rounded-full float-animation blur-2xl" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-400 rounded-full pulse-glow blur-2xl" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-blue-400 rounded-full float-animation blur-2xl" style={{ animationDelay: '1.5s' }}></div>
                    </div>

                    {/* Particles */}
                    <div className="absolute inset-0 opacity-30">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white rounded-full particle"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Rotating Gradient Background */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent rotate-slow shimmer-bg"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center md:text-left">
                        <div className="float-animation bounce-in">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <img
                                    src="/roriri.png"
                                    alt="Roriri Logo"
                                    className="relative w-24 h-24 mx-auto md:mx-0 mb-6 rounded-full object-cover border-4 border-white/30 shadow-2xl hover:scale-110 hover:rotate-6 transition-all duration-500"
                                />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4 slide-in-left stagger-1 drop-shadow-2xl">
                            Welcome to{' '}
                            <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                                Roriri
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 mb-8 slide-in-left stagger-2 font-light drop-shadow-lg">
                            Book appointments seamlessly with our advanced scheduling system
                        </p>

                        {/* Features List */}
                        <div className="space-y-4">
                            {[
                                'Easy appointment scheduling',
                                'Real-time notifications',
                                'Secure and reliable'
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center text-white/90 slide-in-left stagger-${index + 3} group cursor-pointer`}
                                >
                                    <div className="relative mr-4">
                                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md pulse-glow" style={{ animationDelay: `${index * 0.3}s` }}></div>
                                        <div className="relative w-3 h-3 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                                    </div>
                                    <span className="group-hover:translate-x-3 group-hover:text-white transition-all duration-300 text-lg">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2">
                        <div className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 shimmer-bg"></div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-800 to-gray-900 slide-in-right">
                    <div className="text-center mb-8 bounce-in stagger-3">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                            Create Account
                        </h2>
                        <p className="text-gray-400">Join Roriri Software Solutions today</p>
                        {error && <p className="text-red-400 mt-2">{error}</p>}
                    </div>

                    <div className="space-y-5">
                        <div className="bounce-in stagger-4">
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Username
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Choose a username"
                                    required
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="bounce-in stagger-5">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 8.5v7A2.5 2.5 0 0 0 5.5 18h13A2.5 2.5 0 0 0 21 15.5v-7A2.5 2.5 0 0 0 18.5 6h-13A2.5 2.5 0 0 0 3 8.5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 8.5l-9 6-9-6" />
                                </svg>
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                    placeholder="your@email.com"
                                    required
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bounce-in stagger-6">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Password
                                </label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            <div className="bounce-in stagger-7">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Confirm
                                </label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 button-hover relative overflow-hidden group bounce-in stagger-8 gradient-animate"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <span>Create Account</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    <div className="text-center mt-6 bounce-in stagger-8">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-all duration-300 hover:underline decoration-2 underline-offset-4 inline-flex items-center group">
                                Login
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </p>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-center mt-4 fade-in stagger-8">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            By creating an account, you agree to our{' '}
                            <a href="/terms-condition" className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline">
                                Terms
                            </a>{' '}
                            and{' '}
                            <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;