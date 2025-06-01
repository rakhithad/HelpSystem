import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const AccountPage = () => {
    const [userDetails, setUserDetails] = useState({
        email: '',
        firstName: '',
        lastName: '',
        designation: '',
        phoneNumber: '',
        location: '',
        avatar: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true);
            setError(null);
            setSuccess(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserDetails(response.data);
                setSuccess('User details loaded successfully!');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch user details');
                console.error('Error fetching user details:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserDetails();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    const validateForm = () => {
        if (!userDetails.firstName.trim()) {
            setError('First name is required');
            return false;
        }
        if (!userDetails.lastName.trim()) {
            setError('Last name is required');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(null);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`,
                userDetails,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserDetails(response.data);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user details');
            console.error('Error updating user details:', err);
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
                <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                            My Account
                        </h1>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">My Account</span>
                        </nav>
                    </div>
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                            <span className="ml-2 text-gray-200">Loading your account...</span>
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
                    {!isLoading && !isEditing && (
                        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg">
                            <div className="flex flex-col items-center text-center">
                                {userDetails.avatar ? (
                                    <img
                                        src={userDetails.avatar}
                                        alt="User Avatar"
                                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-purple-600 border-opacity-30 shadow-xl object-cover mb-4"
                                    />
                                ) : (
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-2xl mb-4">
                                        {userDetails.firstName.charAt(0)}{userDetails.lastName.charAt(0)}
                                    </div>
                                )}
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-200">
                                    {userDetails.firstName} {userDetails.lastName}
                                </h2>
                                <p className="text-gray-300 mb-2">{userDetails.email}</p>
                                <p className="text-gray-300 mb-2">{userDetails.designation || 'No designation'}</p>
                                <p className="text-gray-300 mb-2">{userDetails.phoneNumber || 'No phone number'}</p>
                                <p className="text-gray-300 mb-4">{userDetails.location || 'No location'}</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    )}
                    {!isLoading && isEditing && (
                        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg">
                            <div className="flex flex-col items-center mb-6">
                                {userDetails.avatar ? (
                                    <div className="relative group mb-4">
                                        <img
                                            src={userDetails.avatar}
                                            alt="User Avatar"
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-purple-600 border-opacity-30 shadow-xl object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-white text-sm">Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xl mb-4">
                                        {userDetails.firstName.charAt(0)}{userDetails.lastName.charAt(0)}
                                    </div>
                                )}
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-200">Edit Profile</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                                        <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg text-gray-300 border border-purple-600 border-opacity-30">
                                            {userDetails.email || 'Not provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={userDetails.firstName}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={userDetails.lastName}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Designation</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={userDetails.designation}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            value={userDetails.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={userDetails.location}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Avatar URL</label>
                                        <input
                                            type="text"
                                            name="avatar"
                                            value={userDetails.avatar}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
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

export default AccountPage;