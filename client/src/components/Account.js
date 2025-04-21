import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUser } from 'react-icons/fa';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            if (window.innerWidth < 1024 && isSidebarOpen && sidebar && !sidebar.contains(event.target)) {
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

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserDetails(response.data);
            } catch (error) {
                setError('Failed to fetch user details');
                console.error('Error fetching user details:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserDetails();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`,
                userDetails,
                { headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data);
            setIsEditing(false);
        } catch (error) {
            setError('Failed to update user details');
            console.error('Error updating user details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
                <div className="animate-pulse text-white text-opacity-80">Loading your account...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
                <div className="text-red-400 bg-red-900 bg-opacity-20 p-4 rounded-lg">{error}</div>
            </div>
        );
    }

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
                <div className="p-4 lg:p-8 flex justify-center">
                    <div className="w-full mt-11 max-w-4xl">
                        {/* Minimal View (default) */}
                        {!isEditing && (
                            <div className="flex flex-col items-center text-center">
                                {userDetails.avatar && (
                                    <img 
                                        src={userDetails.avatar} 
                                        alt="User Avatar" 
                                        className="w-64 h-64 rounded-full border-4 border-white border-opacity-30 shadow-xl object-cover mb-4"
                                    />
                                )}
                                <h1 className="p-2 text-2xl font-bold text-white mb-1">{userDetails.email}</h1>
                                
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}

                        {/* Full Edit View (when editing) */}
                        {isEditing && (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    {userDetails.avatar && (
                                        <div className="relative group mb-4">
                                            <img 
                                                src={userDetails.avatar} 
                                                alt="User Avatar" 
                                                className="w-32 h-32 rounded-full border-4 border-white border-opacity-30 shadow-xl object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="text-white text-sm">Change</span>
                                            </div>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white text-opacity-80 mb-1">email</label>
                                            <div className="p-3 bg-white bg-opacity-10 rounded-lg text-white text-opacity-90 border border-white border-opacity-20">
                                                {userDetails.email}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white text-opacity-80 mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={userDetails.firstName}
                                                    onChange={handleChange}
                                                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white text-opacity-80 mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={userDetails.lastName}
                                                    onChange={handleChange}
                                                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white text-opacity-80 mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="designation"
                                                    value={userDetails.designation}
                                                    onChange={handleChange}
                                                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white text-opacity-80 mb-1">Email</label>
                                            <div className="p-3 bg-white bg-opacity-10 rounded-lg text-white text-opacity-90 border border-white border-opacity-20">
                                                {userDetails.email || 'Not provided'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white text-opacity-80 mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={userDetails.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white text-opacity-80 mb-1">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={userDetails.location}
                                                onChange={handleChange}
                                                className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white text-opacity-80 mb-1">Avatar URL</label>
                                            <input
                                                type="text"
                                                name="avatar"
                                                value={userDetails.avatar}
                                                onChange={handleChange}
                                                className="w-full p-3 rounded-lg bg-white bg-opacity-20 border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 bg-gray-600 bg-opacity-50 text-white rounded-lg shadow-lg hover:bg-opacity-70 transition-all duration-300 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 font-medium"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20 z-50">
                <div className="flex justify-around items-center p-3">
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

export default AccountPage;