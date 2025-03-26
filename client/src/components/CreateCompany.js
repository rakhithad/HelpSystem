import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const CreateCompany = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/create-company`, {
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
                <div className="p-4 lg:p-8">
                    
                    
                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-lg bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl p-6 lg:p-8">
                            <h2 className="text-3xl font-bold text-white text-opacity-90 mb-6">
                                Create New Company
                            </h2>
                            <nav className="text-white text-opacity-80 mb-6">
                                <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                                <span className="text-purple-300">Create Company</span>
                            </nav>
                            
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
            </div>

            {/* Mobile Navigation Bar - Same as AdminDashboard */}
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

export default CreateCompany;