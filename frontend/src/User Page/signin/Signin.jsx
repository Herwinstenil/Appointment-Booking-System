import { useState } from 'react';

const Signin = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle signin logic here
        console.log('Signin attempt:', { username, email, password, confirmPassword });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
            <div className="max-w-6xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Visual Content */}
                <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex flex-col justify-center relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full animate-bounce"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full animate-ping"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center md:text-left">
                        <img
                            src="/roriri.png"
                            alt="Roriri Logo"
                            className="w-20 h-20 mx-auto md:mx-0 mb-6 rounded-full object-cover border-4 border-white/20"
                        />
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Welcome to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Roriri</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-6">
                            Book appointments seamlessly with our advanced scheduling system
                        </p>
                        
                        {/* Features List */}
                        <div className="space-y-3">
                            <div className="flex items-center text-blue-100">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                                <span>Easy appointment scheduling</span>
                            </div>
                            <div className="flex items-center text-blue-100">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                                <span>Real-time notifications</span>
                            </div>
                            <div className="flex items-center text-blue-100">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
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
                        <h2 className="text-3xl font-bold text-white">Create Account</h2>
                        <p className="text-gray-400 mt-2">Join Roriri Software Solutions today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                                Login
                            </a>
                        </p>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-500">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">Terms</a> and{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;