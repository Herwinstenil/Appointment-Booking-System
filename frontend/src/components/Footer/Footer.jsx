import { useState, useEffect } from 'react';
import {
    Facebook,
    Youtube,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [hoveredSocial, setHoveredSocial] = useState(null);
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY === 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/RoririSoftwareSolutionsPvtLtd/', color: 'hover:text-blue-500' },
        { name: 'Youtube', icon: Youtube, href: 'https://youtube.com/@roriri_soft?si=u-VGsjZ_rmU7-liH', color: 'hover:text-red-500' },
        { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/roriri_it_park/', color: 'hover:text-pink-500' },
        { name: 'Linkedin', icon: Linkedin, href: 'https://www.linkedin.com/company/roriri-software-solutions-pvt-ltd/', color: 'hover:text-blue-600' }
    ];

    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '#about' },
        { name: 'Careers', href: '#careers' },
        { name: 'Contact', href: '#contact' }
    ];

    const aboutUsLinks = [
        { name: 'Our Story', href: '#about' },
        { name: 'Events', href: '#events' },
    ];

    const services = [
        'Mobile App Development',
        'Web Development',
        'All Products & Trials',
        'IT consulting'
    ];

    const productLinks = [
        { name: 'ERP Solutions ', href: '#erp-solutions' },
        { name: 'Roriri Attedence App', href: '#products' },
        { name: 'Nexemy', href: '#products' },
    ];

    const handleSubscribe = (e) => {
        e.preventDefault();
        // Handle subscription logic
        alert('Thanks for subscribing!');
        setEmail('');
    };

    return (
        <>
            <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative container mx-auto px-6 pt-16 pb-8">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
                        {/* Company Info */}
                        <div className="space-y-6 animate-fadeInUp">
                            <div className="group cursor-pointer inline-block">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                        R
                                    </div>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                        Roriri
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Crafting digital experiences that inspire and innovate. Your vision, our expertise.
                            </p>
                            <div className="flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        onMouseEnter={() => setHoveredSocial(index)}
                                        onMouseLeave={() => setHoveredSocial(null)}
                                        className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center ${social.color} transform transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg`}
                                        style={{
                                            animation: `float 3s ease-in-out infinite`,
                                            animationDelay: `${index * 0.2}s`
                                        }}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-xl font-bold relative inline-block">
                                Quick Links
                                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            </h3>
                            <ul className="space-y-3">
                                {quickLinks.map((link, index) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                                        >
                                            <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 mr-0 group-hover:mr-2 transition-all duration-300 rounded"></span>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* About Us */}
                        <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                            <h3 className="text-xl font-bold relative inline-block">
                                About Us
                                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            </h3>
                            <ul className="space-y-3">
                                {aboutUsLinks.map((link, index) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                                        >
                                            <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 mr-0 group-hover:mr-2 transition-all duration-300 rounded"></span>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
                            <h3 className="text-xl font-bold relative inline-block">
                                Services
                                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            </h3>
                            <ul className="space-y-3">
                                {services.map((service, index) => (
                                    <li key={service}>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                                        >
                                            <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 mr-0 group-hover:mr-2 transition-all duration-300 rounded"></span>
                                            {service}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Products */}
                        <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-xl font-bold relative inline-block">
                                Products
                                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            </h3>
                            <ul className="space-y-3">
                                {productLinks.map((link, index) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                                        >
                                            <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 mr-0 group-hover:mr-2 transition-all duration-300 rounded"></span>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.35s' }}>
                            <h3 className="text-xl font-bold relative inline-block">
                                Stay Updated
                                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Subscribe to our newsletter for the latest updates and offers.
                            </p>
                            <div className="space-y-3">
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Your email"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white placeholder-gray-500"
                                    />
                                </div>
                                <button
                                    onClick={handleSubscribe}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">Subscribe</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </div>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center space-x-2 group cursor-pointer hover:text-white transition-colors duration-300">
                                    <Phone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    <span>(+91) 7338941579</span>
                                </div>
                                <a
                                    href="https://mail.google.com/mail/?view=cm&to=contact@roririsoft.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 group cursor-pointer hover:text-white transition-colors duration-300"
                                >
                                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    <span>contact@roririsoft.com</span>
                                </a>
                                <div className="flex items-start space-x-2 group cursor-pointer hover:text-white transition-colors duration-300">
                                    <MapPin className="w-4 h-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                                    <div className="text-left text-sm leading-relaxed">
                                        <div>RORIRI IT PARK</div>
                                        <div>Nallanthapuram, Kalakad</div>
                                        <div>Tamil Nadu 629003</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-gray-400 text-sm flex items-center">
                                &copy; 2025 Roriri Software Solutions. All rights reserved.
                            </p>
                            <div className="flex space-x-6 text-sm">
                                <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
                                <a href="/terms-condition" className="text-gray-400 hover:text-white transition-colors duration-300">Terms and Conditions</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Button */}
                <button
                    onClick={isAtTop ? scrollToBottom : scrollToTop}
                    className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 group"
                    aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
                >
                    {isAtTop ? (
                        <ArrowDown className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300" />
                    ) : (
                        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
                    )}
                </button>
            </footer>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default Footer;