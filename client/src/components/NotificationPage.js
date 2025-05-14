import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotifications(response.data);
            } catch (err) {
                setError('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

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
                <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                            Notifications
                        </h1>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">Notifications</span>
                        </nav>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            All recent ticket-related updates will appear here.
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {/* No Notifications */}
                    {!loading && notifications.length === 0 && (
                        <div className="text-center text-gray-300 mt-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6">
                            You have no notifications at the moment.
                        </div>
                    )}

                    {/* Notification List */}
                    <div className="space-y-4">
                        {notifications.map((note, index) => (
                            <div
                                key={note._id || index}
                                className="bg-gray-800 bg-opacity-70 backdrop-blur-md border border-purple-600 border-opacity-30 rounded-xl p-4 sm:p-5 shadow-lg hover:bg-opacity-90 hover:scale-[1.02] transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500"
                                tabIndex={0}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-base sm:text-lg font-semibold text-purple-300 truncate">
                                            {note.message}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-300 mt-1">
                                            <span className="font-medium text-white">Triggered by:</span>{' '}
                                            {note.triggeredBy}
                                        </p>
                                        {note.reason && (
                                            <p className="text-xs sm:text-sm text-pink-300 mt-1 line-clamp-2">
                                                <span className="font-medium text-white">Reason:</span>{' '}
                                                {note.reason}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-400 sm:text-right shrink-0">
                                        {new Date(note.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-600 border-opacity-30 z-50">
                <div className="flex justify-around items-center p-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
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

export default NotificationPage;