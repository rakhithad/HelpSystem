import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Replace Link with NavLink
import axios from 'axios';
import { FaTimes, FaBell, FaTicketAlt, FaTachometerAlt, FaUsers, FaBuilding, FaFileAlt, FaStar, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/bannerlogo.png'; // Adjust path as needed

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

    // Base link classes
    const linkClasses = "flex items-center px-6 py-3 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-300 transform hover:scale-105";

    // Active link classes (applied when the link is active)
    const activeLinkClasses = `${linkClasses} bg-gradient-to-r from-purple-600 to-pink-600 text-white`;

    const navItems = {
        admin: [
            { to: '/notifications', label: 'Notifications', icon: <FaBell className="w-4 h-4 mr-3" /> },
            { to: '/create-ticket', label: 'Create Ticket', icon: <FaTicketAlt className="w-4 h-4 mr-3" /> },
            { to: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="w-4 h-4 mr-3" /> },
            { to: '/manage-tickets', label: 'Manage Tickets', icon: <FaTicketAlt className="w-4 h-4 mr-3" /> },
            { to: '/manage-users', label: 'Manage Users', icon: <FaUsers className="w-4 h-4 mr-3" /> },
            { to: '/manage-companies', label: 'Manage Companies', icon: <FaBuilding className="w-4 h-4 mr-3" /> },
            { to: '/report', label: 'Report', icon: <FaFileAlt className="w-4 h-4 mr-3" /> },
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
        <div className={`sidebar-container fixed left-0 top-0 w-72 h-screen bg-gray-900 bg-opacity-90 backdrop-blur-2xl border-r border-purple-600 border-opacity-30 shadow-xl z-40 transform transition-transform duration-500 ease-in-out overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
            {/* Close button for mobile */}
            <button
                className="lg:hidden absolute top-4 right-4 p-2 text-purple-400 hover:text-pink-400 transition-colors duration-300"
                onClick={() => setIsSidebarOpen(false)}
            >
                <FaTimes className="w-6 h-6" />
            </button>

            <div className="px-6 ml-6 mt-6 mb-5">
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
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

            <div className="flex flex-col flex-1 min-h-0">
                <nav className="flex-1 px-4 mt-5">
                    <ul className="space-y-2">
                        {(navItems[user?.role] || []).map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}
                                    onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                        
                        <li>
                            <NavLink
                                to="/view-reviews"
                                className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}
                                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                            >
                                <FaStar className="w-5 h-5 mr-3" />
                                <span className="font-medium">Reviews</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="p-6 space-y-4 bg-gray-900 bg-opacity-95 backdrop-blur-md border-t border-purple-600 border-opacity-30">
                    {user && (
                        <button
                            onClick={() => {
                                navigate('/account');
                                window.innerWidth < 1024 && setIsSidebarOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-1 text-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 transform hover:scale-105"
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
        </div>
    );
};

export default React.memo(Sidebar);