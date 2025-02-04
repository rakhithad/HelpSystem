import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountPage = () => {
    const [userDetails, setUserDetails] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        location: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Fetch user details on component load
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/auth/account', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserDetails(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };
        fetchUserDetails();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log(userDetails); // Log userDetails before sending
            const response = await axios.put(
                'http://localhost:5000/api/auth/account',
                userDetails,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUserDetails(response.data); // Update with saved details
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating user details:', error);
        }
    };
    

    return (
        <div className="flex">
            
            <div className="ml-64 p-6 bg-gray-100 min-h-screen w-full">
                <h1 className="text-2xl font-bold mb-6">My Account</h1>
                <div className="bg-white p-6 shadow-md rounded">
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userDetails.username}
                            readOnly
                            className="w-full p-2 mt-1 border rounded bg-gray-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={userDetails.firstName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-2 mt-1 border rounded ${
                                isEditing ? '' : 'bg-gray-200'
                            }`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={userDetails.lastName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-2 mt-1 border rounded ${
                                isEditing ? '' : 'bg-gray-200'
                            }`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={userDetails.phoneNumber}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-2 mt-1 border rounded ${
                                isEditing ? '' : 'bg-gray-200'
                            }`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={userDetails.location}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-2 mt-1 border rounded ${
                                isEditing ? '' : 'bg-gray-200'
                            }`}
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
