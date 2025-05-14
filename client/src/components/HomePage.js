import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Home from '../assets/home.svg';

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col">
            {/* Navbar */}
            <nav className="bg-gray-800 bg-opacity-90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                    HelpDesk
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                    <Link to="/view-reviews">
                        <button
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-base"
                            aria-label="View customer reviews"
                        >
                            Reviews
                        </button>
                    </Link>
                    <Link to="/login">
                        <button
                            className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-base"
                            aria-label="Log in to HelpDesk"
                        >
                            Login
                        </button>
                    </Link>
                </div>
                <button
                    className="sm:hidden text-gray-200 hover:text-purple-400 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-gray-800 bg-opacity-95 backdrop-blur-md px-4 py-4 flex flex-col space-y-4 z-40">
                    <Link to="/view-reviews" onClick={() => setIsMenuOpen(false)}>
                        <button
                            className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-base"
                            aria-label="View customer reviews"
                        >
                            Reviews
                        </button>
                    </Link>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <button
                            className="w-full px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-base"
                            aria-label="Log in to HelpDesk"
                        >
                            Login
                        </button>
                    </Link>
                </div>
            )}

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col">
                {/* Header Section */}
                <header className="py-8 sm:py-12 flex flex-col justify-center text-center px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse mb-2">
                        Welcome to HelpDesk
                    </h1>
                    <p className="text-gray-200 text-sm sm:text-base md:text-lg font-light max-w-3xl mx-auto">
                        Your one-stop solution for managing customer support.
                    </p>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="relative w-48 sm:w-64 md:w-80 mb-8">
                        <div className=""></div>
                        <img
                            src={Home}
                            alt="HelpDesk illustration"
                            className="relative w-full h-full object-contain rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                    <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-3xl mb-8 text-center">
                        Streamline your customer support process with our easy-to-use platform. Manage tickets, assign support engineers, and provide all IT services in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/login">
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-base"
                                aria-label="Get started with HelpDesk"
                            >
                                Get Started
                            </button>
                        </Link>
                        <Link to="/view-reviews">
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-base"
                                aria-label="View customer reviews"
                            >
                                See Reviews
                            </button>
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-800 bg-opacity-90 backdrop-blur-md py-4 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8">
                    <p className="text-gray-300 text-sm sm:text-base">
                        © 2025 HelpDesk System. All rights reserved.
                    </p>
                    <div className="flex space-x-4 mt-2 sm:mt-0">
                        <Link to="/privacy-policy" className="text-gray-300 text-sm hover:text-purple-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-gray-300 text-sm hover:text-purple-400 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;