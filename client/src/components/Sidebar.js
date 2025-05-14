import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes, FaBell, FaTicketAlt, FaTachometerAlt, FaUsers, FaBuilding, FaFileAlt, FaStar, FaUser, FaSignOutAlt } from 'react-icons/fa';

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
    }, [token]);

    const linkClasses = "flex items-center px-6 py-3 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-300 transform hover:scale-105";

    const navItems = {
        admin: [
            { to: '/notifications', label: 'Notifications', icon: <FaBell className="w-5 h-5 mr-3" /> },
            { to: '/create-ticket', label: 'Create Ticket', icon: <FaTicketAlt className="w-5 h-5 mr-3" /> },
            { to: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="w-5 h-5 mr-3" /> },
            { to: '/manage-tickets', label: 'Manage Tickets', icon: <FaTicketAlt className="w-5 h-5 mr-3" /> },
            { to: '/manage-users', label: 'Manage Users', icon: <FaUsers className="w-5 h-5 mr-3" /> },
            { to: '/manage-companies', label: 'Manage Companies', icon: <FaBuilding className="w-5 h-5 mr-3" /> },
            { to: '/report', label: 'Report', icon: <FaFileAlt className="w-5 h-5 mr-3" /> },
        ],
        support_engineer: [
            { to: '/notifications', label: 'Notifications', icon: <FaBell className="w-5 h-5 mr-3" /> },
            { to: '/create-ticket', label: 'Create Ticket', icon: <FaTicketAlt className="w-5 h-5 mr-3" /> },
            { to: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="w-5 h-5 mr-3" /> },
            { to: '/manage-tickets', label: 'Manage Tickets', icon: <FaTicketAlt className="w-5 h-5 mr-3" /> },
        ],
        customer: [
            { to: '/notifications', label: 'Notifications', icon: <FaBell className="w-5 h-5 mr-3" /> },
            { to: '/create-ticket', label: 'Create Ticket', icon: <FaTicketAlt className="w-5 h-5 mr-3" /> },
            { to: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="w-5 h-5 mr-3" /> },
            { to: '/manage-tickets', label: 'Manage Tickets', icon: <FaTicketAlt className="w-5 h-5 mr-3" /> },
        ],
    };

    return (
        <div className={`sidebar-container h-screen w-72 fixed left-0 top-0 bg-gray-900 bg-opacity-90 backdrop-blur-2xl border-r border-purple-600 border-opacity-30 shadow-xl z-40 transform transition-transform duration-500 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
            {/* Close button for mobile */}
            <button
                className="lg:hidden absolute top-4 right-4 p-2 text-purple-400 hover:text-pink-400 transition-colors duration-300"
                onClick={() => setIsSidebarOpen(false)}
            >
                <FaTimes className="w-6 h-6" />
            </button>

            <div className="py-10 px-6">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                    HelpDesk System
                </h1>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center mt-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
                </div>
            )}

            {error && (
                <div className="p-3 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mx-4 mt-4">
                    {error}
                </div>
            )}

            <nav className="mt-8 flex-1">
                <ul className="space-y-2 px-4">
                    {(navItems[user?.role] || []).map((item) => (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={linkClasses}
                                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                    <li>
                        <hr className="my-4 border-t border-purple-600 border-opacity-50" />
                    </li>
                    <li>
                        <Link
                            to="/view-reviews"
                            className={linkClasses}
                            onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                        >
                            <FaStar className="w-5 h-5 mr-3" />
                            <span className="font-medium">Reviews</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 bg-gray-900 bg-opacity-95 backdrop-blur-md border-t border-purple-600 border-opacity-30">
                {user && (
                    <button
                        onClick={() => {
                            navigate('/account');
                            window.innerWidth < 1024 && setIsSidebarOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <img
                            src={user.avatar || 'https://i.pinimg.com/474x/03/73/c1/0373c1f0dec9b5ad0e1872494c341984.jpg'}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full mr-3 border-2 border-purple-500"
                        />
                        <span className="font-medium truncate">{user.email}</span>
                    </button>
                )}

                <button
                    onClick={() => {
                        handleLogout();
                        window.innerWidth < 1024 && setIsSidebarOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 bg-opacity-30 hover:bg-opacity-50 text-red-300 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                    <FaSignOutAlt className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default React.memo(Sidebar);