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
    const [role, setRole] = useState('customer'); // Default role is 'customer'
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState(''); // Selected company
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false); // Show company dropdown
    const navigate = useNavigate();

    // Fetch companies when the role is set to "Customer"
    useEffect(() => {
        const fetchCompanies = async () => {
            if (role === 'customer') {
                try {
                    const response = await axios.get('http://localhost:5000/api/auth/companies');
                    setCompanies(response.data);
                    setShowCompanyDropdown(response.data.length > 0); // Show dropdown if companies exist
                } catch (error) {
                    console.error('Error fetching companies:', error);
                }
            } else {
                setShowCompanyDropdown(false); // Hide company dropdown if role changes
                setCompanies([]);
            }
        };

        fetchCompanies();
    }, [role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username,
                password,
                firstName,
                lastName,
                phoneNumber,
                location,
                role,
                ...(role === 'customer' && { companyId }) // Only include companyId for customers
            });

            alert('User registered successfully');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error registering user');
        }
    };

    const handleCreateCompany = () => {
        navigate('/create-company'); // Navigate to the "Create Company" page
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            {/* Role Selection Dropdown */}
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="support_engineer">Support Engineer</option>
            </select>

            {/* Company Dropdown for Customers */}
            {showCompanyDropdown && (
                <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required
                >
                    <option value="">Select a Company</option>
                    {companies.map((company) => (
                        <option key={company.companyId} value={company.companyId}>
                            {company.name}
                        </option>
                    ))}
                </select>
            )}

            {/* Show the "Create a Company" button only for customers */}
            {role === 'customer' && (
                <button type="button" onClick={handleCreateCompany}>
                    No Companies Found? Create a New Company
                </button>
            )}

            <button type="submit">Register</button>
        </form>
    );
};

export default Register;
