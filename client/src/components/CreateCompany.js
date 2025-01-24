import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCompany = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/create-company', {
                name,
                address,
                phoneNumber,
            });
            console.log(response);
            alert('Company created successfully');
            navigate('/register');
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Error creating company');
        }
    };

    return (
        <div className="ml-64 p-8 min-h-screen bg-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Company</h2>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md max-w-lg mx-auto"
            >
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                        Company Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter company name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="address">
                        Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        placeholder="Enter company address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="phoneNumber">
                        Phone Number
                    </label>
                    <input
                        id="phoneNumber"
                        type="text"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                >
                    Create Company
                </button>
            </form>
        </div>
    );
};

export default CreateCompany;
