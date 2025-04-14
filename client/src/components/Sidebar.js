import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    React.useEffect(() => {
        if (token) {
            const fetchUser = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                } catch (error) {
                    setError('Failed to fetch user details');
                    handleLogout();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }
    }, [token, navigate]);

    const linkClasses = "flex items-center px-6 py-4 text-gray-300 hover:text-white hover:bg-purple-500 hover:bg-opacity-20 rounded-lg transition-all duration-300";

    return (
        <div className={`sidebar-container h-screen w-64 fixed left-0 top-0 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-md border-r border-purple-500 border-opacity-20 shadow-2xl z-40 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:bg-opacity-95`}>
            {/* Close button for mobile */}
            <button
                className="lg:hidden absolute top-0 right-2 p-2 text-purple-400 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
            >
                <FaTimes className="w-5 h-5" />
            </button>

            <div className="py-8 px-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    HelpDesk System
                </h1>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center mt-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                </div>
            )}

            {error && (
                <div className="p-3 text-sm text-center text-red-500 bg-red-100 rounded-lg mx-4 mt-4">
                    {error}
                </div>
            )}

            <nav className="mt-6">
                <ul className="space-y-2 px-3">
                    <li><Link to="/create-ticket" className={linkClasses} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>Create a ticket</Link></li>
                    <li><Link to="/dashboard" className={linkClasses} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>Dashboard</Link></li>
                    {user?.role === 'customer' && <li><Link to="/view-tickets" className={linkClasses} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>View Tickets</Link></li>}
                    {user?.role !== 'customer' && <li><Link to="/manage-tickets" className={linkClasses} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>Manage Tickets</Link></li>}
                    <li><Link to="/view-reviews" className={linkClasses} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>Reviews</Link></li>
                    {user?.role === 'admin' && <li><Link to="/admin-dashboard" className={`${linkClasses} text-purple-400`} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>Admin Dashboard</Link></li>}
                </ul>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gray-900 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20">
                {user && (
                    <button 
                        onClick={() => {
                            navigate('/account');
                            window.innerWidth < 1024 && setIsSidebarOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-left text-gray-300 hover:text-white bg-purple-500 bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                    >
                        <img 
                            src={user.avatar || 'https://i.pinimg.com/474x/03/73/c1/0373c1f0dec9b5ad0e1872494c341984.jpg'} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full mr-3 border border-purple-500"
                        />
                        <span>{user.email}</span>
                    </button>
                )}

                <button 
                    onClick={() => {
                        handleLogout();
                        window.innerWidth < 1024 && setIsSidebarOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default React.memo(Sidebar);