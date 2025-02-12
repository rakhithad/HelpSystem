import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar is assumed to be rendered here */}
            <div className="ml-64 w-full p-8">
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        Admin Dashboard
                    </h1>
                    <div className="space-y-6">
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/manage-users')}
                        >
                            Manage Users
                        </button>
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/manage-tickets')}
                        >
                            Manage Tickets
                        </button>
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/register')}
                        >
                            Add User
                        </button>
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/report')}
                        >
                            Report
                        </button>
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/dashboard')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;