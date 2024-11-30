// src/components/CreateTicket.js
import React, { useState } from 'react';
import axios from 'axios';

const CreateTicket = () => {
    const [formData, setFormData] = useState({
        account: '',
        title: '',
        description: '',
        priority: 1
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Update form data when input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

// Submit form data to the backend
const handleSubmit = async (e) => {
    
    e.preventDefault();
    try {
        // Send a POST request to the backend API without authentication

        const uid = localStorage.getItem('uid');

        const response = await axios.post(
            'http://localhost:5000/api/tickets',
            {...formData, uid: uid } // Send form data directly without headers
        );
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
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-semibold mb-4">Create a New Ticket</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Account:</label>
                    <input
                        type="text"
                        name="account"
                        value={formData.account || ''}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Description:</label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Priority (1-5):</label>
                    <input
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        required
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                </div>
                
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-semibold p-2 rounded hover:bg-blue-600"
                >
                    Create Ticket
                </button>
            </form>
        </div>
    );
};

export default CreateTicket;
