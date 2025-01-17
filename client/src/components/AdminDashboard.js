import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="space-y-4">
                <button
                    className="w-full bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600"
                    onClick={() => navigate('/manage-users')}
                >
                    Manage Users
                </button>
                <button
                    className="w-full bg-green-500 text-white p-4 rounded-md hover:bg-green-600"
                    onClick={() => navigate('/register')}
                >
                    Add User
                </button>
                <button
                    className="w-full bg-gray-500 text-white p-4 rounded-md hover:bg-gray-600"
                    onClick={() => navigate('/report')}
                >
                    Report
                </button>
                <button
                    className="w-full bg-gray-500 text-white p-4 rounded-md hover:bg-gray-600"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
};

export default AdminDashboard;
