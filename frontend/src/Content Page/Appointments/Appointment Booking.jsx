import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AppointmentBooking = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        date: new Date(),
        time: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            date
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        console.log('Appointment booked:', formData);

        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                date: new Date(),
                time: '',
                message: ''
            });
        }, 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <main className="flex-grow pt-8 pb-8 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700 transform transition-all duration-500 hover:shadow-purple-500/20 hover:shadow-3xl">
                            <div className="text-center mb-8 animate-fade-in">
                                <div className="inline-block mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce-slow">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient">
                                    Book Your Appointment
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Schedule a consultation with our experts
                                </p>
                            </div>

                            {isSubmitted && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg animate-slide-down">
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-6 h-6 text-white animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-white font-semibold">Appointment booked successfully!</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Full Name
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('name')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                                className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                                placeholder="Enter your full name"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </div>

                                    <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
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
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                                className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                                placeholder="your@email.com"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                                        <label htmlFor="date" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M8 7V3m8 4V3" />
                                                <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M3 11h18" />
                                            </svg>
                                            Preferred Date
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="date"
                                                id="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('date')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                                className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </div>

                                    <div className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
                                        <label htmlFor="time" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <circle cx="12" cy="12" r="9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3" />
                                            </svg>
                                            Preferred Time
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="time"
                                                id="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('time')}
                                                onBlur={() => setFocusedField(null)}
                                                min="09:00"
                                                max="17:00"
                                                required
                                                className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 input-glow transition-all duration-300 backdrop-blur-sm"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="animate-slide-in" style={{ animationDelay: '0.5s' }}>
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        Message
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('message')}
                                            onBlur={() => setFocusedField(null)}
                                            rows="4"
                                            className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 input-glow transition-all duration-300 resize-none backdrop-blur-sm"
                                            placeholder="Tell us about your requirements..."
                                        ></textarea>
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>

                                <div className="text-center animate-slide-in" style={{ animationDelay: '0.6s' }}>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitted}
                                        className="group relative w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden button-hover"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                        <span className="relative flex items-center justify-center space-x-2">
                                            {isSubmitted ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Book Appointment</span>
                                                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                                    </svg>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes check {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
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

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-slide-in {
                    animation: slide-in 0.6s ease-out backwards;
                }

                .animate-slide-down {
                    animation: slide-down 0.4s ease-out;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }

                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }

                .animate-check {
                    animation: check 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AppointmentBooking;