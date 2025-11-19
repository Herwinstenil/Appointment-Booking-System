import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Info, Briefcase, Mail } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'About', icon: Info, href: '#about' },
        { name: 'Services', icon: Briefcase, href: '#services' },
        { name: 'Contact', icon: Mail, href: '#contact' }
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-gray-900/95 backdrop-blur-md shadow-lg py-4'
                : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-6'
                }`}>
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div
                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 "
                            onClick={() => window.location.href = '/'}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                                <div className="relative flex items-center space-x-3 bg-gray-800 rounded-full px-4 py-2 border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-300">
                                    <img
                                        src="/roriri.png"
                                        alt="Roriri Logo"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                        Roriri
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item, index) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="group relative px-5 py-2 text-gray-300 hover:text-white transition-colors duration-300"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center space-x-2">
                                        <item.icon className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-300" />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                </a>
                            ))}

                            {/* CTA Button */}
                            {isLoggedIn ? (
                                <Link to="/Appointment" className="ml-4 relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    <a className="relative z-10">Book Your Appointment</a>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            ) : (
                                <Link to="/signin" className="ml-4 relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    <span className="relative z-10">Get Started</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="flex flex-col space-y-2 pb-4">
                            {navItems.map((item, index) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:translate-x-2"
                                    style={{
                                        animation: isMobileMenuOpen ? `slideIn 0.3s ease-out ${index * 50}ms both` : 'none'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </a>
                            ))}
                            <button className="mt-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;