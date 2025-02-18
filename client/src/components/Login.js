import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert username and password to lowercase
            const lowerCaseUsername = username.toLowerCase();
            const lowerCasePassword = password.toLowerCase();

            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/login`, {
                username: lowerCaseUsername,
                password: lowerCasePassword,
            });

            // Save token to localStorage
            localStorage.setItem('token', response.data.token);
            console.log(localStorage);

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message); // Alert with meaningful error message
            } else {
                alert('Error logging in');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                    Login
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-white text-opacity-80">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 text-sm bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-white text-opacity-80">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 text-sm bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Login
                    </button>
                </form>
                <p className="text-sm text-center text-white text-opacity-80">
                    Don't have an account?{' '}
                    <br />
                    <span className="text-purple-300 hover:text-purple-200 transition-all duration-300">
                        Contact +94 702858731
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;