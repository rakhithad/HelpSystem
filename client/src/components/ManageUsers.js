import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (error) {
                setError('Failed to fetch users. Please try again.');
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleEdit = useCallback((user) => {
        setEditingUserId(user._id);
        setEditedUser(user);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/users/${editingUserId}`, editedUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingUserId(null);
            const updatedUsers = users.map((user) =>
                user._id === editingUserId ? editedUser : user
            );
            setUsers(updatedUsers);
        } catch (error) {
            setError('Failed to update user. Please try again.');
            console.error('Error updating user:', error);
        }
    }, [editingUserId, editedUser, users]);

    const handleDelete = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        } catch (error) {
            setError('Failed to delete user. Please try again.');
            console.error('Error deleting user:', error);
        }
    }, []);

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

            {/* Main Content */}
            <div className="flex-1 pb-20 overflow-y-auto lg:ml-64">
                <div className="p-4 lg:p-8 space-y-6">
                    

                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        Manage Users
                    </h1>

                    <nav className="text-white text-opacity-80">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Manage Users</span>
                    </nav>

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 text-sm text-center text-red-300 bg-red-900 bg-opacity-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="overflow-x-auto bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl">
                        <table className="min-w-full table-auto text-sm text-left text-white text-opacity-90">
                            <thead>
                                <tr className="bg-white bg-opacity-20">
                                    <th className="px-6 py-3">UID</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">First Name</th>
                                    <th className="px-6 py-3">Last Name</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">Avatar</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">{user.uid}</td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">{user.email}</td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <input
                                                    type="text"
                                                    value={editedUser.firstName || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            ) : (
                                                user.firstName
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <input
                                                    type="text"
                                                    value={editedUser.lastName || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            ) : (
                                                user.lastName
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <input
                                                    type="text"
                                                    value={editedUser.designation || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, designation: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            ) : (
                                                user.designation
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <select
                                                    value={editedUser.role || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="customer">Customer</option>
                                                    <option value="support_engineer">Support Engineer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                user.role
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <input
                                                    type="text"
                                                    value={editedUser.phoneNumber || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            ) : (
                                                user.phoneNumber
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <input
                                                    type="text"
                                                    value={editedUser.location || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            ) : (
                                                user.location
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {user.avatar ? (
                                                <img 
                                                    src={user.avatar} 
                                                    alt="Avatar" 
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-opacity-60">No Avatar</span>
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {editingUserId === user._id ? (
                                                    <button
                                                        className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center"
                                                        onClick={handleSave}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Save
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center"
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default React.memo(ManageUsers);