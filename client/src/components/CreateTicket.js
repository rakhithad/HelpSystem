import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const CreateTicket = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 1,
        customerUid: '',
        assignedSupportEngineer: '',
    });

    const [customers, setCustomers] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Toggle sidebar and disable body scroll when open
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            const toggleButton = document.querySelector('.sidebar-toggle');
            
            if (window.innerWidth < 1024 && isSidebarOpen && 
                sidebar && !sidebar.contains(event.target) && 
                toggleButton && !toggleButton.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Disable body scroll when sidebar is open on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            if (isSidebarOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    // Fetch user role, customers, and support engineers
    useEffect(() => {
        if (token) {
            setIsLoading(true);

            // Fetch user role
            axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/user-role`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    setRole(response.data.role);

                    // Fetch customers (for admin & support engineers)
                    if (response.data.role === 'admin' || response.data.role === 'support_engineer') {
                        axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/customers`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                            .then((response) => setCustomers(response.data))
                            .catch((error) => console.error('Failed to fetch customers:', error));
                    }

                    // Fetch support engineers (only for admin)
                    if (response.data.role === 'admin') {
                        axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/support-engineers`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                            .then((response) => setSupportEngineers(response.data))
                            .catch((error) => console.error('Failed to fetch support engineers:', error));
                    }
                })
                .catch((error) => console.error('Failed to fetch role:', error))
                .finally(() => setIsLoading(false));
        }
    }, [token]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setError('');
            setSuccess('');

            try {
                let requestData = { ...formData };

                // If the user is a support engineer, auto-assign themselves
                if (role === 'support_engineer') {
                    requestData.assignedSupportEngineer = 'self'; // Backend will replace this with req.user.uid
                }

                await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets`, requestData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSuccess('Ticket created successfully!');
                setFormData({ title: '', description: '', priority: 1, customerUid: '', assignedSupportEngineer: '' });
            } catch (err) {
                setError('Failed to create ticket. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
        [formData, role, token]
    );

    const handleCreateUser = useCallback(() => {
        navigate('/register');
    }, [navigate]);

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">

            {/* Sidebar - Now appears above content on mobile */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Semi-transparent overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 pb-20 overflow-y-auto transition-all duration-300 lg:ml-64`}>
                <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 mb-6">
                        Create a New Ticket
                    </h2>
                    <nav className="text-white text-opacity-80 mb-6">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <span className="text-purple-300">Create a ticket</span>
                    </nav>

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex justify-center items-center">
                            <FaSpinner className="animate-spin h-6 w-6 text-purple-400" />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <p className="text-red-400 mb-4">{error}</p>}

                    {/* Success Message */}
                    {success && <p className="text-green-400 mb-4">{success}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white text-opacity-80 font-semibold mb-2">Title:</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white border-opacity-20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white text-opacity-80 font-semibold mb-2">Description:</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white border-opacity-20"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white text-opacity-80 font-semibold mb-2">Priority (1-5):</label>
                                    <input
                                        type="number"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        min="1"
                                        max="5"
                                        required
                                        className="w-full p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white border-opacity-20"
                                    />
                                </div>

                                {/* Assign Customer (Admins & Support Engineers) */}
                                {customers.length > 0 && (
                                    <div>
                                        <label className="block text-white text-opacity-80 font-semibold mb-2">Assign Customer:</label>
                                        <select
                                            name="customerUid"
                                            value={formData.customerUid}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white border-opacity-20"
                                        >
                                            <option value="">Select a Customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.uid} value={customer.uid}>
                                                    {customer.firstName} {customer.lastName} ({customer.uid})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Assign Support Engineer (Admins Only) */}
                                {role === 'admin' && supportEngineers.length > 0 && (
                                    <div>
                                        <label className="block text-white text-opacity-80 font-semibold mb-2">Assign Support Engineer:</label>
                                        <select
                                            name="assignedSupportEngineer"
                                            value={formData.assignedSupportEngineer}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white border-opacity-20"
                                        >
                                            <option value="">Select a Support Engineer</option>
                                            {supportEngineers.map((engineer) => (
                                                <option key={engineer.uid} value={engineer.uid}>
                                                    {engineer.firstName} ({engineer.uid})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Register New User Button */}
                                {(role === 'admin' || role === 'support_engineer') && (
                                    <button
                                        type="button"
                                        onClick={handleCreateUser}
                                        className="text-purple-300 hover:text-purple-200 transition-all duration-300 text-sm"
                                    >
                                        No Users Found? Register a new user
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Submit Button - Full width below the columns */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isLoading ? 'Creating Ticket...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20 z-50">
                <div className="flex justify-around items-center p-3">
                    {/* Sidebar Toggle Button */}
                    <button 
                        onClick={toggleSidebar}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    
                    {/* Home Button */}
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
                    
                    {/* Account Button */}
                    <button 
                        onClick={() => navigate('/account')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaUser className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CreateTicket);