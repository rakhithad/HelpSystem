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
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

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

    // Fetch ticket counts
    useEffect(() => {
        const fetchTicketCounts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/ticket-counts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTicketCounts(response.data);
            } catch (error) {
                setError('Failed to fetch ticket counts: ' + (error.response?.data?.message || error.message));
                console.error('Error fetching ticket counts:', error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };
        if (token) {
            fetchTicketCounts();
        }
    }, [token]);

    // Fetch tickets by type with company details
    const fetchTicketsByType = useCallback(async (type) => {
        if (selectedType === type) {
            setSelectedTickets([]);
            setSelectedType('');
            return;
        }
        setCardLoading(type);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/tickets-by-status-with-company?type=${type}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedTickets(response.data);
            setSelectedType(type);
        } catch (error) {
            setError('Failed to fetch tickets: ' + (error.response?.data?.message || error.message));
            console.error('Error fetching tickets:', error.response?.data || error.message);
        } finally {
            setCardLoading(null);
        }
    }, [selectedType, token]);

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                            Dashboard
                        </h1>
                        <nav className="text-gray-300 text-sm mt-2">
                            <span className="text-purple-300">Dashboard</span>
                        </nav>
                    </div>

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
                        {['open', 'pending', 'solved', 'unassigned'].map((type) => (
                            <div
                                key={type}
                                className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-5 rounded-xl shadow-lg cursor-pointer hover:bg-opacity-90 hover:scale-[1.02] transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onClick={() => fetchTicketsByType(type)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View ${type} tickets`}
                            >
                                <h2 className="text-sm sm:text-base font-semibold text-gray-200 capitalize">
                                    {type} Tickets
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
                            No tickets available for {selectedType}.
                        </div>
                    )}

                    {/* Ticket Table */}
                    {selectedTickets.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4 capitalize">
                                {selectedType} Tickets
                            </h3>
                            <div className="overflow-x-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg">
                                <table className="w-full text-sm sm:text-base text-left text-gray-200">
                                    <thead className="bg-gray-900 bg-opacity-50">
                                        <tr>
                                            <th className="px-4 py-3 sm:px-6">TID</th>
                                            <th className="px-4 py-3 sm:px-6">Title</th>
                                            <th className="px-4 py-3 sm:px-6">Priority</th>
                                            <th className="px-4 py-3 sm:px-6">Assigned Engineer</th>
                                            <th className="px-4 py-3 sm:px-6">Create Date</th>
                                            <th className="px-4 py-3 sm:px-6">Company</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTickets.map((ticket) => (
                                            <tr
                                                key={ticket.tid}
                                                className="hover:bg-gray-700 hover:bg-opacity-50 border-t border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <td className="px-4 py-4 sm:px-6">{ticket.tid}</td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                    {ticket.title}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">{ticket.priority}</td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                    {ticket.assignedSupportEngineer || 'Unassigned'}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">
                                                    {formatDate(ticket.createdAt)}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                    {ticket.companyName || 'No Company'}
                                                </td>
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
                            Please select a ticket type to view the tickets.
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
                    >
                        <FaHome className="w-5 h-5" />
                    </Link>
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