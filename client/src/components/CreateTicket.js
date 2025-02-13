import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';


const CreateTicket = () => {
    const [formData, setFormData] = useState({
        account: '',
        title: '',
        description: '',
        priority: 1,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState(null);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setRole(decodedToken.role);
                setUid(decodedToken.uid);
            } catch (error) {
                console.error('Error decoding token:', error);
                // Handle invalid token (e.g., redirect to login)
            }
        }
    }, []);

    // Update form data when input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Submit form data to the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/tickets', {
                ...formData,
                uid: uid,
            });
            console.log(response);
            setSuccess('Ticket created successfully!');
            setError('');
            setFormData({ account: '', title: '', description: '', priority: 1 });
        } catch (err) {
            setError('Failed to create ticket. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar is assumed to be rendered here */}
            <div className="ml-64 w-full p-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 mb-6">
                        Create a New Ticket
                    </h2>
                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <span className="text-purple-300">Create a ticket</span>
                    </nav>

                    {error && (
                        <p className="text-red-400 bg-white bg-opacity-10 backdrop-blur-md p-3 rounded-lg mb-4">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-green-400 bg-white bg-opacity-10 backdrop-blur-md p-3 rounded-lg mb-4">
                            {success}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
                        <div className="mb-6">
                            <label className="block text-white text-opacity-80 font-semibold mb-2">Account:</label>
                            <input
                                type="text"
                                name="account"
                                value={formData.account || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-white text-opacity-80 font-semibold mb-2">Title:</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-white text-opacity-80 font-semibold mb-2">Description:</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                                rows="4"
                            />
                        </div>

                        {/* Show Priority input only for Admins and Support Engineers */}
                        {(role === 'admin' || role === 'support_engineer') && (
                            <div className="mb-6">
                                <label className="block text-white text-opacity-80 font-semibold mb-2">Priority (1-5):</label>
                                <input
                                    type="number"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    min="1"
                                    max="5"
                                    required
                                    className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Create Ticket
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;