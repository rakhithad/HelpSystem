import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Home from '../assets/home.svg';

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-gray-100 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-gray-900/95 backdrop-blur-lg px-4 sm:px-8 lg:px-12 py-5 flex justify-between items-center shadow-xl sticky top-0 z-50">
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 cursor-pointer">
                    HelpDesk
                </div>
            </nav>

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col">
                {/* Hero Section */}
                <header className="py-12 sm:py-16 lg:py-20 flex flex-col justify-center text-center px-4 sm:px-8 lg:px-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-fade-in mb-4">
                        Welcome to HelpDesk
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg md:text-xl font-light max-w-4xl mx-auto leading-relaxed">
                        Your one-stop solution for seamless customer support management.
                    </p>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 lg:px-12 py-8 gap-8">
                    <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                            Streamline your customer support with our intuitive platform. Manage tickets, assign support engineers, and deliver top-notch IT services—all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                            <Link to="/login">
                                <button
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                    aria-label="Get started with HelpDesk"
                                >
                                    Get Started
                                </button>
                            </Link>
                            <Link to="/view-reviews">
                                <button
                                    className="px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-200 rounded-full shadow-lg hover:bg-gray-700 hover:text-white hover:scale-105 transition-all duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                    aria-label="View customer reviews"
                                >
                                    See Reviews
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <div className="relative w-64 sm:w-80 md:w-96 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                            <img
                                src={Home}
                                alt="HelpDesk illustration"
                                className="relative w-full h-full object-contain rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900/95 backdrop-blur-lg py-6 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 lg:px-12 border-t border-gray-700">
                    <p className="text-gray-400 text-sm sm:text-base">
                        © 2025 HelpDesk System. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 sm:mt-0">
                        <Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-purple-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-gray-400 text-sm hover:text-purple-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
                            Terms of Service
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;