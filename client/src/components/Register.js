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

            setUsername('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setLocation('');
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
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="ml-64 w-full p-8 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-white text-opacity-90 mb-8">Register</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className={inputClasses}
                        />
                        
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={inputClasses}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClasses}
                            />
                            
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={inputClasses}
                        />
                        
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={inputClasses}
                        />

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="customer" className="bg-indigo-900">Customer</option>
                            <option value="admin" className="bg-indigo-900">Admin</option>
                            <option value="support_engineer" className="bg-indigo-900">Support Engineer</option>
                        </select>

                        {showCompanyDropdown && (
                            <select
                                value={companyId}
                                onChange={(e) => setCompanyId(e.target.value)}
                                required
                                className={inputClasses}
                            >
                                <option value="" className="bg-indigo-900">Select a Company</option>
                                {companies.map((company) => (
                                    <option key={company.companyId} value={company.companyId} className="bg-indigo-900">
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {role === 'customer' && (
                            <button
                                type="button"
                                onClick={handleCreateCompany}
                                className="text-white text-opacity-80 hover:text-opacity-100 hover:underline transition-all duration-300"
                            >
                                No Companies Found? Create a New Company
                            </button>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-purple-600 bg-opacity-80 hover:bg-opacity-100 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;