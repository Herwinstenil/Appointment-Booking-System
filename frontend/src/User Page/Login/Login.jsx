import { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        // Add login logic here if needed
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }

                @keyframes slide-in-left {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slide-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }

                .float-animation {
                    animation: float 3s ease-in-out infinite;
                }

                .pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                .slide-in-left {
                    animation: slide-in-left 0.6s ease-out forwards;
                }

                .slide-in-right {
                    animation: slide-in-right 0.6s ease-out forwards;
                }

                .fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }

                .rotate-slow {
                    animation: rotate 20s linear infinite;
                }

                .shimmer-bg {
                    background: linear-gradient(
                        90deg,
                        rgba(59, 130, 246, 0) 0%,
                        rgba(59, 130, 246, 0.3) 50%,
                        rgba(59, 130, 246, 0) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 3s infinite;
                }

                .input-focus-ring {
                    position: relative;
                }

                .input-focus-ring::before {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: 0.5rem;
                    padding: 2px;
                    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .input-focus-ring.focused::before {
                    opacity: 1;
                    animation: rotate 3s linear infinite;
                }

                .stagger-1 { animation-delay: 0.1s; }
                .stagger-2 { animation-delay: 0.2s; }
                .stagger-3 { animation-delay: 0.3s; }
                .stagger-4 { animation-delay: 0.4s; }
                .stagger-5 { animation-delay: 0.5s; }
                .stagger-6 { animation-delay: 0.6s; }
            `}</style>

            <div className="max-w-6xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row fade-in">
                {/* Left Side - Visual Content */}
                <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex flex-col justify-center relative overflow-hidden slide-in-left">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full pulse-glow"></div>
                        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full float-animation" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full pulse-glow" style={{ animationDelay: '1s' }}></div>
                    </div>

                    {/* Rotating Gradient Background */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent rotate-slow"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center md:text-left">
                        <div className="float-animation">
                            <img
                                src="/roriri.png"
                                alt="Roriri Logo"
                                className="w-20 h-20 mx-auto md:mx-0 mb-6 rounded-full object-cover border-4 border-white/20 shadow-lg hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4 slide-in-left stagger-1">
                            Welcome back to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Roriri</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-6 slide-in-left stagger-2">
                            Login to access your appointments
                        </p>

                        {/* Features List */}
                        <div className="space-y-3">
                            <div className="flex items-center text-blue-100 slide-in-left stagger-3 hover:translate-x-2 transition-transform duration-300">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 pulse-glow"></div>
                                <span>Manage your bookings</span>
                            </div>
                            <div className="flex items-center text-blue-100 slide-in-left stagger-4 hover:translate-x-2 transition-transform duration-300">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 pulse-glow" style={{ animationDelay: '0.3s' }}></div>
                                <span>View upcoming appointments</span>
                            </div>
                            <div className="flex items-center text-blue-100 slide-in-left stagger-5 hover:translate-x-2 transition-transform duration-300">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 pulse-glow" style={{ animationDelay: '0.6s' }}></div>
                                <span>Secure and reliable</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Login</h2>
                        <p className="text-gray-400 mt-2">Access your Roriri account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                        >
                            Login
                        </button>
                    </form>

                    <div className="text-center mt-6">
                            <a href="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                                Forgot Your Password?
                            </a>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-500">
                            By logging in, you agree to our{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">Terms</a> and{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
