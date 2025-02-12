import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Sidebar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    let role = null;
    let username = null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            role = decodedToken.role;
            username = decodedToken.username;
        } catch (error) {
            console.error('Error decoding token:', error);
            handleLogout();
        }
    }

    const goToAccountPage = () => {
        navigate('/account');
    };

    const linkClasses = "flex items-center px-6 py-4 text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-20 rounded-lg transition-all duration-300";

    return (
        <div className="h-screen w-64 fixed left-0 top-0 bg-gray-900 bg-opacity-95 backdrop-blur-xl border-r border-purple-500 border-opacity-20 shadow-2xl">
            {/* Logo or Header */}
            <div className="py-8 px-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    HelpDesk System
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6">
                <ul className="space-y-2 px-3">
                    <li>
                        <Link to="/create-ticket" className={linkClasses}>
                            Create a ticket
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard" className={linkClasses}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/view-tickets" className={linkClasses}>
                            View Tickets
                        </Link>
                    </li>
                    <li>
                        <Link to="/view-reviews" className={linkClasses}>
                            Reviews
                        </Link>
                    </li>

                    {role === 'admin' && (
                        <li>
                            <Link to="/admin-dashboard" 
                                className={`${linkClasses} text-purple-400 hover:text-purple-300`}>
                                Admin Dashboard
                            </Link>
                        </li>
                    )}

                    {role === 'support_engineer' && (
                        <li>
                            <Link to="/manage-tickets" 
                                className={`${linkClasses} text-blue-400 hover:text-blue-300`}>
                                Manage Tickets
                            </Link>
                        </li>
                    )}

                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gray-900 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20">
                {/* Username Display */}
                {username && (
                    <button
                        onClick={goToAccountPage}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-white bg-purple-500 bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                    >
                        {username}
                    </button>
                )}

                {/* Logout Button */}
                <button 
                    onClick={handleLogout} 
                    className="w-full px-4 py-3 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;