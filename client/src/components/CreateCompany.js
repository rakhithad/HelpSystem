import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const CreateCompany = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    const validateForm = () => {
        if (!name.trim()) {
            setError('Company name is required');
            return false;
        }
        if (!address.trim()) {
            setError('Address is required');
            return false;
        }
        if (!phoneNumber.trim()) {
            setError('Phone number is required');
            return false;
        }
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Please enter a valid phone number (at least 10 digits)');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            await axios.post(
                `${process.env.REACT_APP_BACKEND_BASEURL}/auth/create-company`,
                { name, address, phoneNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Company created successfully!');
            setTimeout(() => navigate('/register'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating company');
            console.error('Error creating company:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className="flex-1 pb-20 overflow-y-auto lg:ml-72">
                <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                            Create New Company
                        </h2>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">Create Company</span>
                        </nav>
                    </div>
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                            <span className="ml-2 text-gray-200">Creating company...</span>
                        </div>
                    )}
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
                    {!isLoading && (
                        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="name">
                                        Company Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter company name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="address">
                                        Address *
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        placeholder="Enter company address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="phoneNumber">
                                        Phone Number *
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        type="text"
                                        placeholder="Enter phone number (e.g., +1234567890)"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating...' : 'Create Company'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
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

export default CreateCompany;