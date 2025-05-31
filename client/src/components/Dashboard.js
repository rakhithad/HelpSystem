import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const Dashboard = () => {
    const [ticketCounts, setTicketCounts] = useState({
        openTickets: 0,
        pendingTickets: 0,
        solvedTickets: 0,
        unassignedTickets: 0,
    });
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cardLoading, setCardLoading] = useState(null);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Get user role from token or localStorage
    useEffect(() => {
        const role = localStorage.getItem('userRole') || '';
        setUserRole(role);
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            const toggleButton = document.querySelector('.sidebar-toggle');
            if (
                window.innerWidth < 1024 &&
                isSidebarOpen &&
                sidebar &&
                !sidebar.contains(event.target) &&
                toggleButton &&
                !toggleButton.contains(event.target)
            ) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Disable body scroll when sidebar is open on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    // Fetch debug info (for troubleshooting)
    const fetchDebugInfo = useCallback(async () => {
        if (!token) return;
        
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/debug-ticket-counts`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );
            setDebugInfo(response.data);
            console.log('Debug info:', response.data);
        } catch (error) {
            console.error('Debug fetch error:', error);
        }
    }, [token]);

    // Fetch ticket counts
    useEffect(() => {
        const fetchTicketCounts = async () => {
            if (!token) {
                setError('No authentication token found');
                navigate('/login');
                return;
            }
            
            setIsLoading(true);
            setError('');
            
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/ticket-counts`, 
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );
                
                console.log('Ticket counts received:', response.data);
                setTicketCounts(response.data);
                
                // Fetch debug info in development
                if (process.env.NODE_ENV === 'development') {
                    fetchDebugInfo();
                }
                
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
                setError('Failed to fetch ticket counts: ' + errorMessage);
                console.error('Error fetching ticket counts:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                
                // If unauthorized, redirect to login
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTicketCounts();
    }, [token, navigate, fetchDebugInfo]);

    // Fetch tickets by type with company details
    const fetchTicketsByType = useCallback(async (type) => {
        if (selectedType === type) {
            setSelectedTickets([]);
            setSelectedType('');
            return;
        }
        
        if (!token) {
            setError('No authentication token found');
            return;
        }
        
        setCardLoading(type);
        setError('');
        
        try {
            console.log(`Fetching ${type} tickets...`);
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/tickets-by-status-with-company?type=${type}`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            console.log(`Received ${response.data.length} ${type} tickets:`, response.data);
            setSelectedTickets(response.data);
            setSelectedType(type);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
            setError('Failed to fetch tickets: ' + errorMessage);
            console.error('Error fetching tickets:', {
                type,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                navigate('/login');
            }
        } finally {
            setCardLoading(null);
        }
    }, [selectedType, token, navigate]);

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get card titles based on user role
    const getCardTitle = (type) => {
        const titles = {
            open: 'Open Tickets',
            pending: 'Pending Tickets', 
            solved: 'Solved Tickets',
            unassigned: userRole === 'customer' ? 'My Unassigned' : 'Unassigned Tickets'
        };
        return titles[type] || `${type} Tickets`;
    };

    // Check if user should see unassigned tickets
    const shouldShowUnassignedTickets = () => {
        return userRole !== 'support_engineer' || ticketCounts.unassignedTickets > 0;
    };

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
                <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                            Dashboard {userRole && `(${userRole.replace('_', ' ').toUpperCase()})`}
                        </h1>
                        <nav className="text-gray-300 text-sm mt-2">
                            <span className="text-purple-300">Dashboard</span>
                        </nav>
                    </div>

                    {/* Debug Info (Development only) */}
                    {process.env.NODE_ENV === 'development' && debugInfo && (
                        <div className="mb-4 p-3 bg-gray-800 bg-opacity-50 rounded-lg text-xs">
                            <details>
                                <summary className="cursor-pointer text-yellow-400">Debug Info (Dev Mode)</summary>
                                <pre className="mt-2 text-gray-300">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {/* Ticket Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {['open', 'pending', 'solved', 'unassigned'].filter(type => 
                            type !== 'unassigned' || shouldShowUnassignedTickets()
                        ).map((type) => (
                            <div
                                key={type}
                                className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-5 rounded-xl shadow-lg cursor-pointer hover:bg-opacity-90 hover:scale-[1.02] transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onClick={() => fetchTicketsByType(type)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View ${type} tickets`}
                            >
                                <h2 className="text-sm sm:text-base font-semibold text-gray-200">
                                    {getCardTitle(type)}
                                </h2>
                                <p className="text-2xl sm:text-3xl font-bold text-purple-300 mt-2">
                                    {ticketCounts[`${type}Tickets`]}
                                </p>
                                {cardLoading === type && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                                        <FaSpinner className="animate-spin h-6 w-6 text-purple-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* No Tickets Selected */}
                    {selectedType && selectedTickets.length === 0 && !cardLoading && (
                        <div className="text-center mt-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 text-gray-300">
                            No {selectedType} tickets available.
                        </div>
                    )}

                    {/* Ticket Table */}
                    {selectedTickets.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4">
                                {getCardTitle(selectedType)} ({selectedTickets.length})
                            </h3>
                            <div className="overflow-x-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg">
                                <table className="w-full text-sm sm:text-base text-left text-gray-200">
                                    <thead className="bg-gray-900 bg-opacity-50">
                                        <tr>
                                            <th className="px-4 py-3 sm:px-6">TID</th>
                                            <th className="px-4 py-3 sm:px-6">Title</th>
                                            <th className="px-4 py-3 sm:px-6">Priority</th>
                                            <th className="px-4 py-3 sm:px-6">Status</th>
                                            <th className="px-4 py-3 sm:px-6">Assigned Engineer</th>
                                            <th className="px-4 py-3 sm:px-6">Create Date</th>
                                            <th className="px-4 py-3 sm:px-6">Company</th>
                                            {(userRole === 'admin' || userRole === 'support_engineer') && (
                                                <th className="px-4 py-3 sm:px-6">Customer</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTickets.map((ticket) => (
                                            <tr
                                                key={ticket.tid}
                                                className="hover:bg-gray-700 hover:bg-opacity-50 border-t border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <td className="px-4 py-4 sm:px-6 font-medium text-purple-300">
                                                    {ticket.tid}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]" title={ticket.title}>
                                                    {ticket.title}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        ticket.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                                                        ticket.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                                                        'bg-green-500 bg-opacity-20 text-green-300'
                                                    }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        ticket.status === 'done' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                                                        ticket.status === 'in progress' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                                                        'bg-gray-500 bg-opacity-20 text-gray-300'
                                                    }`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                    {ticket.assignedSupportEngineer || 'Unassigned'}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">
                                                    {formatDate(ticket.createdAt)}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                    {ticket.companyName || 'No Company'}
                                                </td>
                                                {(userRole === 'admin' || userRole === 'support_engineer') && (
                                                    <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                        {ticket.customerName || ticket.customerEmail || 'Unknown'}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Prompt to Select Ticket Type */}
                    {!selectedType && !isLoading && (
                        <div className="text-center mt-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 text-gray-300">
                            Click on a ticket type above to view the tickets.
                        </div>
                    )}
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
                    <Link
                        to="/dashboard"
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    ></Link>
                    <button>
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

export default React.memo(Dashboard);