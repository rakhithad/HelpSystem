import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Notifications
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">All recent ticket-related updates will appear here.</p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center text-purple-300 animate-pulse">
                        Loading notifications...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-500 p-4 rounded-md mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* No Notifications */}
                {!loading && notifications.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">
                        You have no notifications at the moment.
                    </div>
                )}

                {/* Notification List */}
                <div className="space-y-4">
                    {notifications.map((note, index) => (
                        <div
                            key={note._id || index}
                            className="bg-gray-800 bg-opacity-70 border border-purple-500 border-opacity-30 rounded-xl p-5 shadow-md hover:bg-opacity-90 transition"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-semibold text-purple-300">{note.message}</h2>
                                    <p className="text-sm text-gray-300 mt-1">
                                        <span className="font-medium text-white">Triggered by:</span> {note.triggeredBy}
                                    </p>
                                    {note.reason && (
                                        <p className="text-sm text-pink-300 mt-1">
                                            <span className="font-medium text-white">Reason:</span> {note.reason}
                                        </p>
                                    )}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {new Date(note.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
