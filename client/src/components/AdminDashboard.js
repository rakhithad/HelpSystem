import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar with overlay behavior */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Semi-transparent overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content - Removed conditional margin */}
            <div className="flex-1 pb-20 overflow-y-auto lg:ml-64">
                <div className="p-4 lg:p-8 space-y-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        Admin Dashboard
                    </h1>

                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <span className="text-purple-300">Admin dashboard</span>
                    </nav>
                    
                    <div className="space-y-6">
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/create-company')}
                        >
                            Add Company
                        </button>

                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/register')}
                        >
                            Add User
                        </button>

                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/manage-users')}
                        >
                            Manage Users
                        </button>
                        
                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/report')}
                        >
                            Report
                        </button>

                        <button
                            className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => navigate('/Manage-companies')}
                        >
                            mngCompoanies
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20 z-50">
                <div className="flex justify-around items-center p-3">
                    {/* Sidebar Toggle Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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

export default AdminDashboard;