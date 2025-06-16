import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
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

    // Fetch users and current user's role
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                // Fetch users with company details
                const usersResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/auth/users-with-company`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUsers(usersResponse.data);
                setFilteredUsers(usersResponse.data);

                // Fetch current user's role
                const userResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/auth/account`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUserRole(userResponse.data.role);
            } catch (error) {
                setError('Failed to fetch data: ' + (error.response?.data?.message || error.message));
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // Filter users based on search query
    useEffect(() => {
        if (userRole !== 'admin') {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter((user) =>
            searchQuery
                ? user.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (user.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (user.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (user.designation || '').toLowerCase().includes(searchQuery.toLowerCase())
                : true
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users, userRole]);

    const handleEdit = useCallback((user) => {
        setEditingUserId(user._id);
        setEditedUser(user);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/auth/users/${editingUserId}`,
                editedUser,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setEditingUserId(null);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === editingUserId ? { ...user, ...editedUser } : user
                )
            );
            setFilteredUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === editingUserId ? { ...user, ...editedUser } : user
                )
            );
            setSuccess('User updated successfully!');
            setError('');
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to update user. Please try again.';
            setError(errorMessage);
            console.error('Error updating user:', error);
        }
    }, [editingUserId, editedUser]);

    const handleDelete = useCallback((userId) => {
        setDeleteUserId(userId);
        setIsDeleteModalOpen(true);
    }, []);

    const handleDeleteSubmit = useCallback(async () => {
        if (!deleteReason || deleteReason.trim().length === 0) {
            setError('Reason is required.');
            return;
        }
        if (deleteReason.length > 500) {
            setError('Reason must not exceed 500 characters.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${process.env.REACT_APP_BACKEND_BASEURL}/auth/users/${deleteUserId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { reason: deleteReason.trim() },
                }
            );
            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== deleteUserId));
            setFilteredUsers((prevUsers) => prevUsers.filter((user) => user._id !== deleteUserId));
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            setDeleteUserId(null);
            setError('');
            setSuccess(response.data.warning || 'User deleted successfully!');
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to delete user. Please try again.';
            setError(errorMessage);
            console.error('Error deleting user:', error);
        }
    }, [deleteUserId, deleteReason]);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-6 rounded-xl shadow-lg max-w-lg w-full">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Delete User</h2>
                        <label className="block text-gray-200 font-medium mb-2">
                            Reason for deletion:
                        </label>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            maxLength={500}
                            placeholder="Enter reason for deletion"
                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                            rows="4"
                        />
                        {error && <p className="text-red-400 mt-2">{error}</p>}
                        <div className="flex justify-end mt-4 gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteReason('');
                                    setError('');
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                                Manage Users
                            </h1>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center"
                            >
                                <FaPlus className="mr-2 w-4 h-4" />
                                Create User
                            </button>
                        </div>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">Manage Users</span>
                        </nav>
                    </div>

                    {/* Error/Success Messages */}
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

                    {/* Search Bar */}
                    {userRole === 'admin' && (
                        <div className="mb-6">
                            <label className="block text-gray-200 font-medium mb-2">Search Users</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by UID, email, name, or designation"
                                    className="w-full p-3 pl-10 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="overflow-x-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg">
                        {filteredUsers.length === 0 && !isLoading ? (
                            <p className="text-gray-300 p-6 text-center">No users available.</p>
                        ) : (
                            <table className="w-full text-sm sm:text-base text-left text-gray-200">
                                <thead className="bg-gray-900 bg-opacity-50">
                                    <tr>
                                        <th className="px-4 py-3 sm:px-6">UID</th>
                                        <th className="px-4 py-3 sm:px-6">Email</th>
                                        <th className="px-4 py-3 sm:px-6">First Name</th>
                                        <th className="px-4 py-3 sm:px-6">Last Name</th>
                                        <th className="px-4 py-3 sm:px-6">Designation</th>
                                        <th className="px-4 py-3 sm:px-6">Role</th>
                                        <th className="px-4 py-3 sm:px-6">Phone</th>
                                        <th className="px-4 py-3 sm:px-6">Location</th>
                                        <th className="px-4 py-3 sm:px-6">Company</th>
                                        <th className="px-4 py-3 sm:px-6">Avatar</th>
                                        <th className="px-4 py-3 sm:px-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-gray-700 hover:bg-opacity-50 border-t border-purple-600 border-opacity-30 transition-all duration-300"
                                        >
                                            <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                {user.uid}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {editingUserId === user._id ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.firstName || ''}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                firstName: e.target.value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    user.firstName
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {editingUserId === user._id ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.lastName || ''}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                lastName: e.target.value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    user.lastName
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {editingUserId === user._id ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.designation || ''}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                designation: e.target.value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    user.designation || 'N/A'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {editingUserId === user._id ? (
                                                    <select
                                                        value={editedUser.role || ''}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                role: e.target.value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                    >
                                                        <option value="customer" className="bg-gray-900">Customer</option>
                                                        <option value="support_engineer" className="bg-gray-900">
                                                            Support Engineer
                                                        </option>
                                                        <option value="admin" className="bg-gray-900">Admin</option>
                                                    </select>
                                                ) : (
                                                    user.role
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {editingUserId === user._id ? (
                                                    <input
                                                        type="tel"
                                                        value={editedUser.phoneNumber || ''}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                phoneNumber: e.target.value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    user.phoneNumber || 'N/A'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {editingUserId === user._id ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.location || ''}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                location: e.target.value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    user.location || 'N/A'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                {user.companyName || 'No Company'}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt="Avatar"
                                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">No Avatar</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6 flex gap-2 flex-wrap">
                                                {editingUserId === user._id ? (
                                                    <button
                                                        className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                                                        onClick={handleSave}
                                                    >
                                                        Save
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <FaEdit className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {userRole === 'admin' && (
                                                    <button
                                                        className="px-3 py-1 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                                                        onClick={() => handleDelete(user._id)}
                                                    >
                                                        <FaTrash className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
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

export default React.memo(ManageUsers);