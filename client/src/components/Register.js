import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaHome, FaUser, FaSpinner } from 'react-icons/fa';
import Sidebar from './Sidebar';

const Register = () => {
    const [email, setEmail] = useState('');
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
                    setError('Failed to load companies');
                }
            } else {
                setShowCompanyDropdown(false);
                setCompanies([]);
                setCompanyId('');
            }
        };

        fetchCompanies();
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/register`, {
                email: email.toLowerCase(),
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
            setSuccess('User registered successfully!');
            setEmail('');
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
            setError('Error registering user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCompany = () => {
        navigate('/create-company');
    };

    const inputClasses = "w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300";
    const selectClasses = `${inputClasses} appearance-none`;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Semi-transparent overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 pb-20 overflow-y-auto lg:ml-72">
                <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                            Register New User
                        </h1>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">Add a User</span>
                        </nav>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 text-sm text-center text-green-400 bg-green-900 bg-opacity-50 rounded-xl mb-6">
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Password</label>
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
                                    <label className="block text-gray-200 font-medium mb-2">First Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter first name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Designation</label>
                                    <input
                                        type="text"
                                        placeholder="Enter designation"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Location</label>
                                    <input
                                        type="text"
                                        placeholder="Enter location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Avatar URL</label>
                                    <input
                                        type="url"
                                        placeholder="Enter avatar URL"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className={selectClasses}
                                    >
                                        <option value="customer" className="bg-gray-900">Customer</option>
                                        <option value="admin" className="bg-gray-900">Admin</option>
                                        <option value="support_engineer" className="bg-gray-900">Support Engineer</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {showCompanyDropdown && (
                            <div>
                                <label className="block text-gray-200 font-medium mb-2">Company</label>
                                <select
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    required
                                    className={selectClasses}
                                >
                                    <option value="" className="bg-gray-900">Select a Company</option>
                                    {companies.map((company) => (
                                        <option key={company.companyId} value={company.companyId} className="bg-gray-900">
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
                                    className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7h2V9a1 1 0 012 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H9a1 1 0 110-2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    No Companies Found? Create a New Company
                                </button>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                                        Registering...
                                    </span>
                                ) : (
                                    'Register User'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-600 border-opacity-30 z-50">
                <div className="flex justify-around items-center p-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 text-purple-400 hover:text-white transition-colors sidebar-toggle"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
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