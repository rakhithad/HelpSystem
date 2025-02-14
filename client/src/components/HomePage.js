import React from 'react';
import { Link } from 'react-router-dom';
import Home from '../assets/home.svg'; // Adjust the path as needed

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Navbar */}
            <nav className="bg-white bg-opacity-10 backdrop-blur-md w-full py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="text-white text-2xl font-bold font-mono">
                    HelpDesk
                </div>
                <div className="flex space-x-4">
                    <Link to="/view-reviews">
                        <button className="bg-white bg-opacity-20 text-white py-2 px-6 rounded-full shadow-lg hover:bg-opacity-30 hover:shadow-xl transition-all duration-300">
                            Reviews
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Header Section */}
            <header className="w-full py-12 text-white text-center">
                <h1 className="font-sans text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-300">
                    Welcome to HelpDesk
                </h1>
                <p className="font-sans text-white text-opacity-80 text-lg md:text-xl font-light max-w-2xl mx-auto">
                    Your one-stop solution for managing customer support. Streamline your workflow and deliver exceptional service.
                </p>
            </header>

            {/* Main Content Section */}
            <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                    <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl transform rotate-6"></div>
                    <img 
                        src={Home} 
                        alt="home" 
                        className="relative w-full h-full object-contain rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <p className="font-sans text-white text-opacity-90 text-lg md:text-xl w-full max-w-2xl mb-8">
                    Streamline your customer support process with our easy-to-use platform. Manage tickets, assign support engineers, and provide all IT services in one place.
                </p>
                <div className="flex space-x-4 md:space-x-6">
                    <Link to="/login">
                        <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-8 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 hover:shadow-xl transition-all duration-300">
                            Get Started
                        </button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white bg-opacity-10 backdrop-blur-md w-full py-4 text-center mt-auto">
                <p className="text-white text-opacity-80 text-sm">
                    &copy; 2025 HelpDesk System. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default HomePage;