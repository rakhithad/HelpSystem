import React from 'react';
import { Link } from 'react-router-dom';
import Home from '../assets/home.svg';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col">
            {/* Navbar - fixed height */}
            <nav className="h-16 bg-white bg-opacity-10 backdrop-blur-md px-4 sm:px-8 flex justify-between items-center shadow-lg">
                <div className="text-white text-xl sm:text-2xl font-bold font-mono">
                    HelpDesk
                </div>
                <div className="flex space-x-2 sm:space-x-4">
                    <Link to="/view-reviews">
                        <button className="bg-white bg-opacity-20 text-white py-1 px-4 sm:py-2 sm:px-6 rounded-full shadow-lg hover:bg-opacity-30 transition-all duration-300 text-sm sm:text-base">
                            Reviews
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Content wrapper - takes remaining height */}
            <div className="flex-1 flex flex-col">
                {/* Header Section - fixed height */}
                <header className="h-32 flex flex-col justify-center text-white text-center px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-300">
                        Welcome to HelpDesk
                    </h1>
                    <p className="text-white text-opacity-80 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto">
                        Your one-stop solution for managing customer support.
                    </p>
                </header>

                {/* Main Content - takes remaining space */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-6">
                        <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl transform rotate-6"></div>
                        <img
                            src={Home}
                            alt="home"
                            className="relative w-full h-full object-contain rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <p className="text-white text-opacity-90 text-sm sm:text-base md:text-lg max-w-2xl mb-6 text-center">
                        Streamline your customer support process with our easy-to-use platform. Manage tickets, assign support engineers, and provide all IT services in one place.
                    </p>
                    <div className="flex space-x-2 sm:space-x-4">
                        <Link to="/login">
                            <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-6 sm:py-3 sm:px-8 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 text-sm sm:text-base">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </main>

                {/* Footer - fixed height */}
                <footer className="h-12 bg-white bg-opacity-10 backdrop-blur-md flex items-center justify-center">
                    <p className="text-white text-opacity-80 text-xs sm:text-sm">
                        &copy; 2025 HelpDesk System. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;