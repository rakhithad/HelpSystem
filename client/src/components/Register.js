import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [role, setRole] = useState('customer');
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState('');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            if (role === 'customer') {
                try {
                    const response = await axios.get('http://localhost:5000/api/auth/companies');
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
            await axios.post('http://localhost:5000/api/auth/register', {
                username: username.toLowerCase(),
                password,
                firstName: firstName.toLowerCase(),
                lastName: lastName.toLowerCase(),
                phoneNumber,
                location: location.toLowerCase(),
                role: role.toLowerCase(),
                ...(role === 'customer' && { companyId }),
            });
            alert('User registered successfully');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error registering user');
        }
    };

    const handleCreateCompany = () => {
        navigate('/create-company');
    };

    return (
        <div className="ml-64 p-8 h-screen bg-gray-100"> {/* Adjust to account for the Sidebar */}
            <div className="bg-white shadow rounded-lg p-8 max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="support_engineer">Support Engineer</option>
                    </select>

                    {showCompanyDropdown && (
                        <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="">Select a Company</option>
                            {companies.map((company) => (
                                <option key={company.companyId} value={company.companyId}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {role === 'customer' && (
                        <button
                            type="button"
                            onClick={handleCreateCompany}
                            className="text-sm text-blue-500 hover:underline"
                        >
                            No Companies Found? Create a New Company
                        </button>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
