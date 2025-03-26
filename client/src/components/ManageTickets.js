import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ManageTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [filters, setFilters] = useState({ status: '', date: 'all' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Toggle sidebar and disable body scroll when open
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            const toggleButton = document.querySelector('.sidebar-toggle');
            
            if (window.innerWidth < 1024 && isSidebarOpen && 
                sidebar && !sidebar.contains(event.target) && 
                toggleButton && !toggleButton.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Disable body scroll when sidebar is open on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            if (isSidebarOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    // Fetch tickets and support engineers
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');

                const ticketsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/view-tickets`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(ticketsResponse.data);
                setFilteredTickets(ticketsResponse.data);

                const engineersResponse = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/support-engineers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSupportEngineers(engineersResponse.data);
            } catch (err) {
                setError('Failed to fetch data. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...tickets];

        if (filters.status) {
            filtered = filtered.filter((ticket) => ticket.status === filters.status);
        }

        if (filters.date !== 'all') {
            const now = new Date();
            if (filters.date === 'today') {
                filtered = filtered.filter(
                    (ticket) => new Date(ticket.createdAt).toDateString() === now.toDateString()
                );
            } else if (filters.date === 'this week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                filtered = filtered.filter(
                    (ticket) => new Date(ticket.createdAt) >= weekAgo
                );
            } else if (filters.date === 'this month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                filtered = filtered.filter(
                    (ticket) => new Date(ticket.createdAt) >= monthAgo
                );
            }
        }

        setFilteredTickets(filtered);
    }, [filters, tickets]);

    const handleFilterChange = useCallback((filterName, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    }, []);

    const handleUpdateTicket = useCallback(async (ticketId, updates) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/update-ticket/${ticketId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === ticketId ? response.data : ticket
                )
            );
        } catch (err) {
            alert('Failed to update ticket. Please try again.');
            console.error(err);
        }
    }, []);

    const handleDeleteTicket = useCallback(async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/delete-ticket/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
        } catch (err) {
            alert('Failed to delete ticket. Please try again.');
            console.error(err);
        }
    }, []);

    if (error) return <div className="text-red-400 p-8">{error}</div>;

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            

            {/* Sidebar - Now appears above content on mobile */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Semi-transparent overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 pb-20 overflow-y-auto transition-all duration-300 lg:ml-64`}>
                <div className="p-4 lg:p-8 space-y-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        Manage Tickets
                    </h1>

                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Manage Tickets</span>
                    </nav>

                    {/* Filters */}
                    <div className="filters p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-white text-opacity-80 font-semibold mb-2">Status:</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">All</option>
                                    <option value="not started">Not Started</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="stuck">Stuck</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-white text-opacity-80 font-semibold mb-2">Date:</label>
                                <select
                                    value={filters.date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="this week">This Week</option>
                                    <option value="this month">This Month</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex justify-center items-center">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Tickets List */}
                    <div className="p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl">
                        {filteredTickets.length === 0 ? (
                            <p className="text-white text-opacity-80">No tickets available.</p>
                        ) : (
                            <ul className="space-y-4">
                                {filteredTickets.map((ticket) => (
                                    <li
                                        key={ticket._id}
                                        className="p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-lg hover:bg-opacity-20 transition-all duration-300"
                                    >
                                        <strong className="block text-white text-opacity-90">{ticket.title}</strong>
                                        <span className="text-sm text-white text-opacity-80">
                                            {ticket.status} - Priority: {ticket.priority}
                                        </span>
                                        <div className="mt-4 flex flex-wrap gap-4">
                                            <div>
                                                <label className="block text-white text-opacity-80 font-semibold mb-2">Status:</label>
                                                <select
                                                    value={ticket.status}
                                                    onChange={(e) =>
                                                        handleUpdateTicket(ticket._id, { status: e.target.value })
                                                    }
                                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="not started">Not Started</option>
                                                    <option value="in progress">In Progress</option>
                                                    <option value="stuck">Stuck</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-white text-opacity-80 font-semibold mb-2">Priority:</label>
                                                <input
                                                    type="number"
                                                    value={ticket.priority}
                                                    min="1"
                                                    max="5"
                                                    onChange={(e) =>
                                                        handleUpdateTicket(ticket._id, { priority: e.target.value })
                                                    }
                                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-white text-opacity-80 font-semibold mb-2">Assign to:</label>
                                                <select
                                                    value={ticket.assignedSupportEngineer || ''}
                                                    onChange={(e) =>
                                                        handleUpdateTicket(ticket._id, {
                                                            assignedSupportEngineer: e.target.value,
                                                        })
                                                    }
                                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="">Not Assigned</option>
                                                    {supportEngineers.map((engineer) => (
                                                        <option key={engineer.uid} value={engineer.uid}>
                                                            {engineer.firstName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={() => handleDeleteTicket(ticket._id)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                                                >
                                                    Delete Ticket
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20 z-50">
                <div className="flex justify-around items-center p-3">
                    {/* Sidebar Toggle Button */}
                    <button 
                        onClick={toggleSidebar}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    
                    {/* Home Button */}
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
                    
                    {/* Account Button */}
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

export default React.memo(ManageTickets);