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

    const inputClasses = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300";
    const labelClasses = "block text-white text-opacity-90 font-semibold mb-2";

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="ml-64 w-full p-8 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
                    <h2 className="text-3xl font-bold text-white text-opacity-90 mb-8">
                        Create New Company
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className={labelClasses} htmlFor="name">
                                Company Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter company name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClasses} htmlFor="address">
                                Address
                            </label>
                            <input
                                id="address"
                                type="text"
                                placeholder="Enter company address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClasses} htmlFor="phoneNumber">
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                type="text"
                                placeholder="Enter phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-purple-600 bg-opacity-80 hover:bg-opacity-100 text-white py-3 rounded-lg mt-6 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            Create Company
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCompany;