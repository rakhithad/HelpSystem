// Sidebar Component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role'); // Get the user's role from localStorage
    const username = localStorage.getItem('username'); // Get the username from localStorage

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token from localStorage
        localStorage.removeItem('uid');  // Clear the uid
        localStorage.removeItem('role'); // Clear the role
        localStorage.removeItem('username'); // Clear the username
        navigate('/login'); // Redirect to login page
    };

    // Handle click to redirect to the account page
    const goToAccountPage = () => {
        navigate('/account');
    };

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col fixed left-0 top-0">
            {/* Logo or Header */}
            <div className="py-4 px-6 bg-gray-900 text-xl font-bold">
                HelpDesk System
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow">
                <ul className="mt-6 space-y-4 px-6">
                    <li>
                        <Link to="/create-ticket" className="block py-2 px-4 rounded hover:bg-gray-700">
                            Create a ticket
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/view-tickets" className="block py-2 px-4 rounded hover:bg-gray-700">
                            View Tickets
                        </Link>
                    </li>
                    <li>
                        <Link to="/view-reviews" className="block py-2 px-4 rounded hover:bg-gray-700">
                            Reviews
                        </Link>
                    </li>

                    {/* Show Admin Dashboard link only for admin */}
                    {role === 'admin' && (
                        <li>
                            <Link to="/admin-dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">
                                Admin Dashboard
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>

            {/* Username Display */}
            {username && (
                <div className="flex flex-col items-center mb-4">
                    <button
                        onClick={goToAccountPage}
                        className="text-center text-white py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                        {username}
                    </button>
                </div>
            )}

            {/* Logout Button */}
            <div className="px-6 mb-4">
                <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
