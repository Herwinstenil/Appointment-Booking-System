import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Info, Briefcase, Mail, GraduationCap, TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSubMenuIndex, setOpenSubMenuIndex] = useState(null);
    const [activePath, setActivePath] = useState('');
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        setActivePath(window.location.pathname);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Hide navbar on scroll down, show on scroll up
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(window.scrollY);

            // Scrolled effect for background change
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navItems = [
        {
            title: "About Us",
            icon: Info,
            path: "/about",
            submenu: [
                { title: "Products", path: "/products" },
                { title: "Events", path: "/events" },
            ]
        },
        {
            title: "Services",
            icon: Briefcase,
            path: "/services",
            submenu: [
                { title: "ERP Solutions", path: "/services/erp-solutions" },
                { title: `Mobile Application`, path: "/services/mobile-app-development" },
                { title: "Web Development", path: "/services/web-app-development" },
                { title: "IT Consulting", path: "/services/it-consulting" },
            ]
        },
        {
            title: "Internship",
            icon: GraduationCap,
            path: "/internship",
        },
        {
            title: "Careers",
            icon: TrendingUp,
            path: "/career",
        },
    ];

    const toggleSubMenu = (index) => {
        setOpenSubMenuIndex(openSubMenuIndex === index ? null : index);
    };

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2,
            },
        },
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <Motion.nav
            className={`
                fixed top-0 left-0 w-full z-50 bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-700/50
                transition-all duration-300 ease-in-out
                ${showNavbar ? 'translate-y-0' : '-translate-y-full'}
            `}
            initial={false}
            animate={{ y: showNavbar ? 0 : '-100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0 -ml-2"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                            <div className="relative flex items-center space-x-3 bg-gray-800 rounded-full px-6 py-3 border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-300">
                                <img
                                    src="/roriri.png"
                                    alt="Roriri Logo"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                    Roriri
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex gap-8 items-center flex-1 justify-center mx-12">
                        {navItems.map((item, index) => (
                            <li key={index} className="relative group">
                                <Link
                                    to={item.path}
                                    className={`
                                        flex items-center gap-2 text-gray-300 hover:text-white font-medium transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-800/50
                                        ${activePath === item.path ? 'text-white bg-gray-800/80' : ''}
                                    `}
                                    onClick={() => setActivePath(item.path)}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                    {item.submenu?.length > 0 && (
                                        <ChevronDown
                                            size={16}
                                            className="transition-transform duration-300 group-hover:rotate-180"
                                        />
                                    )}
                                </Link>

                                {/* Desktop Submenu */}
                                {item.submenu?.length > 0 && (
                                    <Motion.div
                                        className="absolute top-full left-1/2 -translate-x-1/2 bg-gray-800 shadow-2xl rounded-xl mt-2 p-3 min-w-[220px] hidden group-hover:block z-10 border border-gray-700 backdrop-blur-lg"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.submenu.map((subItem, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={subItem.path}
                                                className={`
                                                    block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 mb-1 last:mb-0
                                                    ${activePath === subItem.path ? 'text-white bg-blue-600/20' : ''}
                                                `}
                                                onClick={() => setActivePath(subItem.path)}
                                            >
                                                {subItem.title}
                                            </Link>
                                        ))}
                                    </Motion.div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="hidden lg:flex items-center flex-shrink-0 -mr-2">
                        {isLoggedIn ? (
                            <Link
                                to="/appointment"
                                className="relative group overflow-hidden px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="relative z-10 text-lg">Book Appointment</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        ) : (
                            <Link
                                to="/signin"
                                className="relative group overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="relative z-10 text-lg">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link
                                to="/appointment"
                                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-full text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                                Book
                            </Link>
                        ) : (
                            <Link
                                to="/signin"
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                                Get Started
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-3 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <Motion.div
                            className="absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-lg shadow-2xl border-t border-gray-700/50 lg:hidden z-40 rounded-b-2xl"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={menuVariants}
                        >
                            <ul className="flex flex-col gap-1 p-4">
                                {navItems.map((item, index) => (
                                    <Motion.li key={index} variants={listItemVariants}>
                                        <div className="border-b border-gray-700/50 last:border-b-0">
                                            <div
                                                onClick={() => item.submenu ? toggleSubMenu(index) : (setIsMobileMenuOpen(false), setActivePath(item.path))}
                                                className={`
                                                    flex justify-between items-center text-gray-300 font-medium cursor-pointer py-4 px-4 rounded-lg hover:bg-gray-800/50 transition-all duration-200
                                                    ${activePath === item.path ? 'text-white bg-gray-800/80' : ''}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.title}</span>
                                                </div>
                                                {item.submenu?.length > 0 && (
                                                    <ChevronDown
                                                        size={20}
                                                        className={`transition-transform duration-300 ${openSubMenuIndex === index ? "rotate-180 text-blue-400" : ""
                                                            }`}
                                                    />
                                                )}
                                            </div>

                                            {/* Mobile Submenu */}
                                            {item.submenu?.length > 0 && openSubMenuIndex === index && (
                                                <Motion.ul
                                                    className="ml-8 mt-2 space-y-2 border-l-2 border-blue-500/30 pl-4 pb-2"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {item.submenu.map((subItem, subIndex) => (
                                                        <Motion.li key={subIndex}>
                                                            <Link
                                                                to={subItem.path}
                                                                onClick={() => {
                                                                    setIsMobileMenuOpen(false);
                                                                    setActivePath(subItem.path);
                                                                }}
                                                                className={`
                                                                    block py-3 text-gray-400 hover:text-white px-4 rounded-lg hover:bg-gray-800/30 transition-all duration-200
                                                                    ${activePath === subItem.path ? 'text-white bg-blue-600/20' : ''}
                                                                `}
                                                            >
                                                                {subItem.title}
                                                            </Link>
                                                        </Motion.li>
                                                    ))}
                                                </Motion.ul>
                                            )}
                                        </div>
                                    </Motion.li>
                                ))}
                            </ul>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Motion.nav>
    );
};

export default Navbar;