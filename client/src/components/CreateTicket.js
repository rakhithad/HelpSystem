import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const CreateTicket = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
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

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            const toggleButton = document.querySelector('.sidebar-toggle');
            if (
                window.innerWidth < 1024 &&
                isSidebarOpen &&
                sidebar &&
                !sidebar.contains(event.target) &&
                toggleButton &&
                !toggleButton.contains(event.target)
            ) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Disable body scroll when sidebar is open on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    // Fetch user role, customers, and support engineers
    useEffect(() => {
        if (token) {
            setIsLoading(true);
            axios
                .get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/user-role`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    setRole(response.data.role);
                    if (response.data.role === 'admin' || response.data.role === 'support_engineer') {
                        axios
                            .get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/customers`, {
                                headers: { Authorization: `Bearer ${token}` },
                            })
                            .then((response) => setCustomers(response.data))
                            .catch((error) => console.error('Failed to fetch customers:', error));
                    }
                    if (response.data.role === 'admin') {
                        axios
                            .get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/support-engineers`, {
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

                if (role === 'customer') {
                    delete requestData.priority; // Backend sets default to 'medium'
                    delete requestData.customerUid; // Backend uses logged-in user's UID
                }

                if (role === 'support_engineer') {
                    requestData.assignedSupportEngineer = 'self';
                }

                await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets`, requestData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSuccess('Ticket created successfully!');
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    customerUid: '',
                    assignedSupportEngineer: '',
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
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
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Semi-transparent overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 pb-20 overflow-y-auto lg:ml-72">
                <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                            Create a New Ticket
                        </h2>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">Create a Ticket</span>
                        </nav>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 text-sm text-center text-green-400 bg-green-900 bg-opacity-50 rounded-xl mb-6">
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        placeholder="Enter ticket title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        placeholder="Describe the issue"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {(role === 'admin' || role === 'support_engineer') && (
                                    <div>
                                        <label className="block text-gray-200 font-medium mb-2">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        >
                                            <option value="low" className="bg-gray-900">Low</option>
                                            <option value="medium" className="bg-gray-900">Medium</option>
                                            <option value="high" className="bg-gray-900">High</option>
                                        </select>
                                    </div>
                                )}
                                {role === 'customer' && (
                                    <div>
                                        <label className="block text-gray-200 font-medium mb-2">
                                            Priority
                                        </label>
                                        <input
                                            type="text"
                                            value="Medium"
                                            disabled
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                )}
                                {(role === 'admin' || role === 'support_engineer') && customers.length > 0 && (
                                    <div>
                                        <label className="block text-gray-200 font-medium mb-2">
                                            Assign Customer
                                        </label>
                                        <select
                                            name="customerUid"
                                            value={formData.customerUid}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        >
                                            <option value="" className="bg-gray-900">
                                                Select a Customer
                                            </option>
                                            {customers.map((customer) => (
                                                <option key={customer.uid} value={customer.uid} className="bg-gray-900">
                                                    {customer.firstName} {customer.lastName} ({customer.uid})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {role === 'admin' && supportEngineers.length > 0 && (
                                    <div>
                                        <label className="block text-gray-200 font-medium mb-2">
                                            Assign Support Engineer
                                        </label>
                                        <select
                                            name="assignedSupportEngineer"
                                            value={formData.assignedSupportEngineer}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        >
                                            <option value="" className="bg-gray-900">
                                                Select a Support Engineer
                                            </option>
                                            {supportEngineers.map((engineer) => (
                                                <option key={engineer.uid} value={engineer.uid} className="bg-gray-900">
                                                    {engineer.firstName} {engineer.lastName} ({engineer.uid})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {(role === 'admin' || role === 'support_engineer') && (
                                    <button
                                        type="button"
                                        onClick={handleCreateUser}
                                        className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-all duration-300 flex items-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7h2V9a1 1 0 012 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H9a1 1 0 110-2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        No Users Found? Register a new user
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                                        Creating Ticket...
                                    </span>
                                ) : (
                                    'Create Ticket'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-600 border-opacity-30 z-50">
                <div className="flex justify-around items-center p-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 text-purple-400 hover:text-white transition-colors sidebar-toggle"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
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