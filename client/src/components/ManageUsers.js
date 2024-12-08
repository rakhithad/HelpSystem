import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});

    // Fetch users when the component loads
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/auth/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    // Handle user edit
    const handleEdit = (user) => {
        setEditingUserId(user._id);
        setEditedUser(user);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/auth/users/${editingUserId}`, editedUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingUserId(null); // Exit edit mode
            const updatedUsers = users.map((user) =>
                user._id === editingUserId ? editedUser : user
            );
            setUsers(updatedUsers);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
            <table className="w-full bg-white shadow-md rounded">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Username</th>
                        <th className="border px-4 py-2">First Name</th>
                        <th className="border px-4 py-2">Last Name</th>
                        <th className="border px-4 py-2">Role</th>
                        <th className="border px-4 py-2">Phone</th>
                        <th className="border px-4 py-2">Location</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            {/* Username is displayed but not editable */}
                            <td className="border px-4 py-2">{user.username}</td>
                            
                            {/* First Name (editable) */}
                            <td className="border px-4 py-2">
                                {editingUserId === user._id ? (
                                    <input
                                        type="text"
                                        value={editedUser.firstName || ''}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, firstName: e.target.value })
                                        }
                                    />
                                ) : (
                                    user.firstName
                                )}
                            </td>
                            
                            {/* Last Name (editable) */}
                            <td className="border px-4 py-2">
                                {editingUserId === user._id ? (
                                    <input
                                        type="text"
                                        value={editedUser.lastName || ''}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, lastName: e.target.value })
                                        }
                                    />
                                ) : (
                                    user.lastName
                                )}
                            </td>
                            
                            {/* Role (editable) */}
                            <td className="border px-4 py-2">
                                {editingUserId === user._id ? (
                                    <select
                                        value={editedUser.role || ''}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, role: e.target.value })
                                        }
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="support_engineer">Support Engineer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                ) : (
                                    user.role
                                )}
                            </td>
                            
                            {/* Phone (editable) */}
                            <td className="border px-4 py-2">
                                {editingUserId === user._id ? (
                                    <input
                                        type="text"
                                        value={editedUser.phoneNumber || ''}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, phoneNumber: e.target.value })
                                        }
                                    />
                                ) : (
                                    user.phoneNumber
                                )}
                            </td>
                            
                            {/* Location (editable) */}
                            <td className="border px-4 py-2">
                                {editingUserId === user._id ? (
                                    <input
                                        type="text"
                                        value={editedUser.location || ''}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, location: e.target.value })
                                        }
                                    />
                                ) : (
                                    user.location
                                )}
                            </td>
                            
                            {/* Actions */}
                            <td className="border px-4 py-2">
                                {editingUserId === user._id ? (
                                    <button
                                        className="bg-green-500 text-white p-2 rounded-md"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        className="bg-blue-500 text-white p-2 rounded-md"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
