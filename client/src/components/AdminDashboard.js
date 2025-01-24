import React from 'react'; 
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-100">
            
            <div className="flex-grow ml-64 p-6">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
                <div className="space-y-6">
                    <button
                        className="w-full bg-blue-500 text-white p-4 rounded-md shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => navigate('/manage-users')}
                    >
                        Manage Users
                    </button>
                    <button
                        className="w-full bg-blue-500 text-white p-4 rounded-md shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => navigate('/manage-tickets')}
                    >
                        Manage Tickets
                    </button>
                    <button
                        className="w-full bg-green-500 text-white p-4 rounded-md shadow-lg hover:bg-green-600 transition duration-300 ease-in-out"
                        onClick={() => navigate('/register')}
                    >
                        Add User
                    </button>
                    <button
                        className="w-full bg-gray-500 text-white p-4 rounded-md shadow-lg hover:bg-gray-600 transition duration-300 ease-in-out"
                        onClick={() => navigate('/report')}
                    >
                        Report
                    </button>
                    <button
                        className="w-full bg-gray-500 text-white p-4 rounded-md shadow-lg hover:bg-gray-600 transition duration-300 ease-in-out"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
