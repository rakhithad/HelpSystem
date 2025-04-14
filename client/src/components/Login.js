import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Eye icons from React Icons

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // For password visibility
    const [rememberMe, setRememberMe] = useState(false); // For Remember Me
    const navigate = useNavigate();

    // Retrieve saved email from localStorage on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true); // Check the Remember Me checkbox
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const lowerCaseEmail = email.toLowerCase();
            const lowerCasePassword = password.toLowerCase();

            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/login`, {
                email: lowerCaseEmail,
                password: lowerCasePassword,
            });

            localStorage.setItem('token', response.data.token);

            // Save email to localStorage if Remember Me is checked
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', lowerCaseEmail);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Error logging in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                    Login
                </h2>
                {error && (
                    <div className="p-3 text-sm text-center text-red-500 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-white text-opacity-80">Email</label>
                        <input
                            type="text"
                            placeholder="Enter your Email"
                            className="w-full px-4 py-3 text-sm bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block mb-2 text-sm font-medium text-white text-opacity-80">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 text-sm bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white placeholder-opacity-50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <FaEyeSlash className="h-5 w-5 text-white text-opacity-80" />
                            ) : (
                                <FaEye className="h-5 w-5 text-white text-opacity-80" />
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm text-white text-opacity-80">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-purple-500 rounded focus:ring-purple-500 border-white border-opacity-20"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="ml-2">Remember Me</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
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