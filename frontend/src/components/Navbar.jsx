import React from 'react';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 text-white p-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <img className="text-xl font-bold" src="src\assets\roriri logo.jpg" alt=""></img>
                <ul className="flex space-x-6">
                    <li><a href="#home" className="hover:text-gray-300 transition duration-300">Home</a></li>
                    <li><a href="#services" className="hover:text-gray-300 transition duration-300">Services</a></li>
                    <li><a href="#about" className="hover:text-gray-300 transition duration-300">About</a></li>
                    <li><a href="#contact" className="hover:text-gray-300 transition duration-300">Contact</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
