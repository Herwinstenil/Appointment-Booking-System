import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-auto">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <p>&copy; 2025 Appointment Booking System. All rights reserved.</p>
                <ul className="flex space-x-6">
                    <li><a href="#privacy" className="hover:text-gray-300 transition duration-300">Privacy Policy</a></li>
                    <li><a href="#terms" className="hover:text-gray-300 transition duration-300">Terms of Service</a></li>
                    <li><a href="#support" className="hover:text-gray-300 transition duration-300">Support</a></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
