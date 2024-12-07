import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [role, setRole] = useState('customer');  // Default role is 'customer'

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
                role  // Send the role to the backend
            });

            alert('User registered');
        } catch (error) {
            alert('Error registering user');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="First Name"
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Last Name"
                onChange={(e) => setLastName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Phone Number"
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
                type="text"
                placeholder="Location"
                onChange={(e) => setLocation(e.target.value)}
            />
            
            {/* Role Selection Dropdown */}
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="support_engineer">Support Engineer</option>
            </select>

            <button type="submit">Register</button>
        </form>
    );
};

export default Register;
