import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    // Retrieve saved email from localStorage on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/login`, {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error logging in');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="w-full max-w-md p-6 sm:p-8 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg border border-purple-600 border-opacity-30">
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                        HelpDesk
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mt-2">Login</h2>
                </div>
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
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                            Email *
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                            Password *
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-10 transform -translate-y-1/2 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <FaEyeSlash className="h-5 w-5 text-gray-300" />
                            ) : (
                                <FaEye className="h-5 w-5 text-gray-300" />
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm text-gray-200">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 bg-gray-900 border-purple-600 border-opacity-30 rounded focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                aria-label="Remember me"
                            />
                            <span className="ml-2">Remember Me</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-300 mt-6">
                    Don't have an account? contact +94 77 123 4567
                </p>
            </div>
        </div>
    );
};

export default Login;