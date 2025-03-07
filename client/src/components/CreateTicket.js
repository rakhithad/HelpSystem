import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';

const CreateTicket = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 1,
        customerUid: '',
        assignedSupportEngineer: '',
    });

    const [customers, setCustomers] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Fetch user role
    useEffect(() => {
        if (token) {
            axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/user-role`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((response) => setRole(response.data.role))
            .catch((error) => console.error('Failed to fetch role:', error));
        }
    }, [token]);

    // Fetch customers (for admin & support engineers)
    useEffect(() => {
        if (role === 'admin' || role === 'support_engineer') {
            axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((response) => setCustomers(response.data))
            .catch((error) => console.error('Failed to fetch customers:', error));
        }
    }, [role, token]);

    // Fetch support engineers (only for admin)
    useEffect(() => {
        if (role === 'admin') {
            axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/support-engineers`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((response) => setSupportEngineers(response.data))
            .catch((error) => console.error('Failed to fetch support engineers:', error));
        }
    }, [role, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let requestData = { ...formData };

            // If the user is a support engineer, auto-assign themselves
            if (role === 'support_engineer') {
                requestData.assignedSupportEngineer = 'self'; // Backend will replace this with req.user.uid
            }

            await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets`, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Ticket created successfully!');
            setError('');
            setFormData({ title: '', description: '', priority: 1, customerUid: '', assignedSupportEngineer: '' });
        } catch (err) {
            setError('Failed to create ticket. Please try again.');
            setSuccess('');
        }
    };


    const handleCreateUser = () => {
        navigate('/register');
    };







    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="ml-64 w-full p-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 mb-6">
                        Create a New Ticket
                    </h2>
                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <span className="text-purple-300">Create a ticket</span>
                    </nav>

                    {error && <p className="text-red-400">{error}</p>}
                    {success && <p className="text-green-400">{success}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white text-opacity-80 font-semibold mb-2">Title:</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 rounded" />
                        </div>

                        <div>
                            <label className="block text-white text-opacity-80 font-semibold mb-2">Description:</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full p-2 rounded" />
                        </div>

                        <div>
                            <label className="block text-white text-opacity-80 font-semibold mb-2">Priority (1-5):</label>
                            <input type="number" name="priority" value={formData.priority} onChange={handleChange} min="1" max="5" required className="w-full p-2 rounded" />
                        </div>

                        {/* Assign Customer (Admins & Support Engineers) */}
                        {customers.length > 0 && (
                            <div>
                                <label className="block text-white text-opacity-80 font-semibold mb-2">Assign Customer:</label>
                                <select name="customerUid" value={formData.customerUid} onChange={handleChange} required className="w-full p-2 rounded">
                                    <option value="">Select a Customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.uid} value={customer.uid}>
                                            {customer.firstName} {customer.lastName} ({customer.uid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        
                        {(role === 'admin' || role === 'support_engineer') && (
                            <button
                                type="button"
                                onClick={handleCreateUser}
                                className="text-white text-opacity-80 hover:text-opacity-100 hover:underline transition-all duration-300"
                            >
                                No Users Found? Register a new user
                            </button>
                        )}

                        {/* Assign Support Engineer (Admins Only) */}
                        {role === 'admin' && supportEngineers.length > 0 && (
                            <div>
                                <label className="block text-white text-opacity-80 font-semibold mb-2">Assign Support Engineer:</label>
                                <select name="assignedSupportEngineer" value={formData.assignedSupportEngineer} onChange={handleChange} required className="w-full p-2 rounded">
                                    <option value="">Select a Support Engineer</option>
                                    {supportEngineers.map((engineer) => (
                                        <option key={engineer.uid} value={engineer.uid}>
                                            {engineer.firstName} ({engineer.uid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}



                        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition">
                            Create Ticket
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;
