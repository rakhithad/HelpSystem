import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [designation, setDesignation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [avatar, setAvatar] = useState('');
    const [role, setRole] = useState('customer');
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState('');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            if (role === 'customer') {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/companies`);
                    setCompanies(response.data);
                    setShowCompanyDropdown(response.data.length > 0);
                } catch (error) {
                    console.error('Error fetching companies:', error);
                }
            } else {
                setShowCompanyDropdown(false);
                setCompanies([]);
            }
        };

        fetchCompanies();
    }, [role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/register`, {
                username: username.toLowerCase(),
                password,
                firstName: firstName.toLowerCase(),
                lastName: lastName.toLowerCase(),
                designation: designation.toLowerCase(),
                phoneNumber,
                location: location.toLowerCase(),
                role: role.toLowerCase(),
                avatar,
                ...(role === 'customer' && { companyId }),
            });
            alert('User registered successfully');

            setUsername('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setDesignation('');
            setPhoneNumber('');
            setLocation('');
            setAvatar('');
            setRole('customer');
            setCompanyId('');
            
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error registering user');
        }
    };

    const handleCreateCompany = () => {
        navigate('/create-company');
    };

    const inputClasses = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300";
    const selectClasses = `${inputClasses} appearance-none`;

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
                    <nav className="text-white text-opacity-80 mb-6">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Add a user</span>
                    </nav>
                    
                    <div className="w-full max-w-2xl mx-auto">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 mb-6">
                            Register New User
                        </h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Username</label>
                                        <input
                                            type="text"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className={inputClasses}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className={inputClasses}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter first name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter last name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Designation</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Designation"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter phone number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Location</label>
                                        <input
                                            type="text"
                                            placeholder="Enter location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Avatar URL</label>
                                        <input
                                            type="text"
                                            placeholder="Enter avatar URL"
                                            value={avatar}
                                            onChange={(e) => setAvatar(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white text-opacity-80 font-medium mb-1">Role</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className={selectClasses}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="admin">Admin</option>
                                            <option value="support_engineer">Support Engineer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {showCompanyDropdown && (
                                <div>
                                    <label className="block text-white text-opacity-80 font-medium mb-1">Company</label>
                                    <select
                                        value={companyId}
                                        onChange={(e) => setCompanyId(e.target.value)}
                                        required
                                        className={selectClasses}
                                    >
                                        <option value="">Select a Company</option>
                                        {companies.map((company) => (
                                            <option key={company.companyId} value={company.companyId}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {role === 'customer' && (
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleCreateCompany}
                                        className="text-purple-300 hover:text-purple-200 transition-all duration-300 text-sm"
                                    >
                                        No Companies Found? Create a New Company
                                    </button>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
                                >
                                    Register User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
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

export default Register;