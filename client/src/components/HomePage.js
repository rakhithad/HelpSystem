import React from 'react';
import { Link } from 'react-router-dom';
import Home from '../assets/home.svg'; // Adjust the path as needed

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
            {/* Navbar */}
            <nav className="bg-blue-600 w-full py-2 px-8 flex justify-between items-center shadow-md">
                <div className="text-white text-2xl font-bold">
                    {/* Add logo or title here if needed */}
                </div>
                <div className="flex space-x-4">
                    <Link to="/view-reviews">
                        <button className="bg-white text-blue-600 py-2 px-4 rounded-lg shadow-md hover:bg-gray-200">
                            Reviews
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Header Section */}
            <header className="bg-blue-600 w-full py-4 text-white text-center rounded-b-full">
                <h1 className="font-serif text-5xl font-extrabold">Welcome to the HelpDesk System</h1>
                <p className="font-serif text-black mt-4 text-xl font-normal">Your one-stop solution for managing customer support</p>
            </header>

            {/* Main Content Section */}
            <main className="flex-grow flex flex-col items-center mt-4 px-6 text-center">
                <img 
                    src={Home} 
                    alt="home" 
                    className="w-64 h-auto mx-auto my-8 rounded-lg shadow-lg"
                />
                <p className="font-serif text-xl w-full mb-4">
                    Streamline your customer support process with our easy-to-use platform. Manage tickets, <br></br>assign support engineers, and provide all IT services in one place.
                </p>
                <div className="flex space-x-6 mb-4">
                    <Link to="/login">
                        <button className="bg-blue-500 text-white py-3 px-8 rounded-lg shadow-md text-lg hover:bg-blue-700 transition duration-300">
                            Login
                        </button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-200 w-full py-4 text-center mt-auto rounded-t-full">
                <p className="text-gray-600 text-sm">&copy; 2025 HelpDesk System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
