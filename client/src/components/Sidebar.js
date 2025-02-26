import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        if (token) {
            const fetchUser = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    handleLogout();
                }
            };
            fetchUser();
        }
    }, []);

    const goToAccountPage = () => {
        navigate('/account');
    };

    const linkClasses = "flex items-center px-6 py-4 text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-20 rounded-lg transition-all duration-300";

    return (
        <div className="h-screen w-64 fixed left-0 top-0 bg-gray-900 bg-opacity-95 backdrop-blur-xl border-r border-purple-500 border-opacity-20 shadow-2xl">
            <div className="py-8 px-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    HelpDesk System
                </h1>
            </div>

            <nav className="mt-6">
                <ul className="space-y-2 px-3">
                    <li><Link to="/create-ticket" className={linkClasses}>Create a ticket</Link></li>
                    <li><Link to="/dashboard" className={linkClasses}>Dashboard</Link></li>

                    {/* Show "View Tickets" only for customers */}
                    {user?.role === 'customer' && (
                        <li><Link to="/view-tickets" className={linkClasses}>View Tickets</Link></li>
                    )}

                    {/* Show "Manage Tickets" for non-customers (admins, support engineers) */}
                    {user?.role !== 'customer' && (
                        <li><Link to="/manage-tickets" className={linkClasses}>Manage Tickets</Link></li>
                    )}

                    <li><Link to="/view-reviews" className={linkClasses}>Reviews</Link></li>

                    {/* Admin-specific link */}
                    {user?.role === 'admin' && (
                        <li><Link to="/admin-dashboard" className={`${linkClasses} text-purple-400 hover:text-purple-300`}>Admin Dashboard</Link></li>
                    )}

                </ul>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gray-900 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20">
                {user && (
                    <button onClick={goToAccountPage} className="flex items-center w-full px-4 py-3 text-left text-gray-300 hover:text-white bg-purple-500 bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-300">
                        <img 
                            src={user.avatar || 'https://i.pinimg.com/474x/03/73/c1/0373c1f0dec9b5ad0e1872494c341984.jpg'} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full mr-3 border border-purple-500"
                        />
                        <span>{user.username}</span>
                    </button>
                )}

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