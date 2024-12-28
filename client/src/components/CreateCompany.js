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
            // Redirect to the registration page after successful company creation
            alert('Company created successfully');
            navigate('/register');
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Error creating company');
        }
    };

    return (
        <div>
            <h2>Create New Company</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Company Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
                <button type="submit">Create Company</button>
            </form>
        </div>
    );
};

export default CreateCompany;
