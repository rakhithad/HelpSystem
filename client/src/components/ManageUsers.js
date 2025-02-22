import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUserId(user._id);
        setEditedUser(user);
    };

    const handleSave = async () => {
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
            console.error('Error updating user:', error);
        }
    };

    const handleDelete = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter((user) => user._id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="ml-64 w-full p-8">
                <div className="space-y-8">
                    <h1 className="text-2xl font-bold text-white text-opacity-90">Manage Users</h1>

                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Manage Users</span>
                    </nav>


                    
                    <div className="overflow-x-auto bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl max-h-[80vh]">
                        <table className="min-w-full table-auto text-sm text-left text-white text-opacity-90">
                            <thead>
                                <tr className="bg-white bg-opacity-20">
                                    <th className="px-6 py-3">UID</th>
                                    <th className="px-6 py-3">Username</th>
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
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">{user.username}</td>
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
                                                <select
                                                    value={editedUser.role || ''}
                                                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                                                    className="bg-white bg-opacity-20 text-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="customer" className="bg-indigo-900">Customer</option>
                                                    <option value="support_engineer" className="bg-indigo-900">Support Engineer</option>
                                                    <option value="admin" className="bg-indigo-900">Admin</option>
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
                                                <span>No Avatar</span>
                                            )}
                                        </td>
                                        <td className="border-t border-white border-opacity-10 px-6 py-4">
                                            {editingUserId === user._id ? (
                                                <button
                                                    className="bg-green-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all duration-300"
                                                    onClick={handleSave}
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    className="bg-blue-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all duration-300"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg ml-2 transition-all duration-300"
                                                onClick={() => handleDelete(user._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;