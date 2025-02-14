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
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="w-full max-w-lg p-8 bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl rounded-2xl">
                <h1 className="text-2xl font-bold text-white text-opacity-90 mb-6 text-center">My Account</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white text-opacity-80">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userDetails.username}
                            readOnly
                            className="w-full p-3 mt-1 border rounded-lg bg-white bg-opacity-20 text-white text-opacity-90 focus:ring focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white text-opacity-80">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={userDetails.firstName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-3 mt-1 border rounded-lg bg-white bg-opacity-20 text-white text-opacity-90 focus:ring focus:ring-indigo-500 ${isEditing ? 'focus:outline-none' : 'cursor-not-allowed'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white text-opacity-80">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={userDetails.lastName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-3 mt-1 border rounded-lg bg-white bg-opacity-20 text-white text-opacity-90 focus:ring focus:ring-indigo-500 ${isEditing ? 'focus:outline-none' : 'cursor-not-allowed'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white text-opacity-80">Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={userDetails.phoneNumber}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-3 mt-1 border rounded-lg bg-white bg-opacity-20 text-white text-opacity-90 focus:ring focus:ring-indigo-500 ${isEditing ? 'focus:outline-none' : 'cursor-not-allowed'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white text-opacity-80">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={userDetails.location}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full p-3 mt-1 border rounded-lg bg-white bg-opacity-20 text-white text-opacity-90 focus:ring focus:ring-indigo-500 ${isEditing ? 'focus:outline-none' : 'cursor-not-allowed'}`}
                        />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all"
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-all"
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
