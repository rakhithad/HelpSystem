import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ManageTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [groupedTickets, setGroupedTickets] = useState({});
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [filters, setFilters] = useState({ status: '', date: 'all', customStart: '', customEnd: '', search: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTicketId, setDeleteTicketId] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [editingTicketId, setEditingTicketId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userUid = localStorage.getItem('uid');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (location.state?.updatedTicket) {
            const updatedTicket = location.state.updatedTicket;
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === updatedTicket._id
                        ? { ...ticket, ...updatedTicket, reviewed: true }
                        : ticket
                )
            );
            setFilteredTickets((prevFiltered) =>
                prevFiltered.map((ticket) =>
                    ticket._id === updatedTicket._id
                        ? { ...ticket, ...updatedTicket, reviewed: true }
                        : ticket
                )
            );
            navigate('/view-tickets', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

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

    useEffect(() => {
        if (window.innerWidth < 1024) {
            document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const ticketsResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/view-tickets-with-company`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTickets(ticketsResponse.data.tickets);
                setFilteredTickets(ticketsResponse.data.tickets);
                setUserRole(ticketsResponse.data.role);

                if (ticketsResponse.data.role === 'admin') {
                    const engineersResponse = await axios.get(
                        `${process.env.REACT_APP_BACKEND_BASEURL}/auth/support-engineers`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setSupportEngineers(engineersResponse.data);
                }
            } catch (err) {
                setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
                console.error('Error fetching data:', err.response?.data || err);
            } finally {
                setIsLoading(false);
            }
        };
        if (token) {
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        if (userRole !== 'admin') {
            let filtered = tickets.filter((ticket) =>
                filters.search
                    ? ticket.tid.toLowerCase().includes(filters.search.toLowerCase()) ||
                      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                      (ticket.description || '').toLowerCase().includes(filters.search.toLowerCase())
                    : true
            );
            setFilteredTickets(filtered);
            setGroupedTickets({ 'All Tickets': filtered });
            return;
        }

        let filtered = tickets.filter((ticket) =>
            filters.search
                ? ticket.tid.toLowerCase().includes(filters.search.toLowerCase()) ||
                  ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                  (ticket.description || '').toLowerCase().includes(filters.search.toLowerCase())
                : true
        );

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
            } else if (filters.date === 'custom' && filters.customStart && filters.customEnd) {
                const start = new Date(filters.customStart);
                const end = new Date(filters.customEnd);
                end.setHours(23, 59, 59, 999);
                filtered = filtered.filter(
                    (ticket) => {
                        const ticketDate = new Date(ticket.createdAt);
                        return ticketDate >= start && ticketDate <= end;
                    }
                );
                const weekLabel = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
                setGroupedTickets({ [weekLabel]: filtered });
            }
        } else {
            setGroupedTickets({ 'All Tickets': filtered });
        }

        setFilteredTickets(filtered);
    }, [filters, tickets, userRole]);

    const handleFilterChange = useCallback((filterName, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    }, []);

    const handleUpdateTicket = useCallback(async (ticketId, updates) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/update-ticket/${ticketId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let engineerName = updates.assignedSupportEngineer;
            if (updates.assignedSupportEngineer) {
                const engineerResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/auth/user/${updates.assignedSupportEngineer}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                engineerName = engineerResponse.data
                    ? `${engineerResponse.data.firstName || ''} ${engineerResponse.data.lastName || ''}`.trim() || 'Unknown'
                    : 'Unassigned';
            } else if (updates.assignedSupportEngineer === null) {
                engineerName = 'Unassigned';
            }

            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === ticketId
                        ? { ...ticket, ...response.data, engineerName }
                        : ticket
                )
            );
            setEditingTicketId(null);
            setError(null);
            setSuccess('Ticket updated successfully!');
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || 'Failed to update ticket. Please try again.';
            setError(errorMessage);
            console.error('Error updating ticket:', err.response?.data || err);
        }
    }, [token]);

    const handleDeleteTicket = useCallback((ticketId) => {
        setDeleteTicketId(ticketId);
        setIsDeleteModalOpen(true);
    }, []);

    const handleDeleteSubmit = useCallback(async () => {
        if (!deleteReason || deleteReason.trim().length === 0) {
            setError('Reason is required.');
            return;
        }
        if (deleteReason.length > 500) {
            setError('Reason must not exceed 500 characters.');
            return;
        }

        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/update-ticket/${deleteTicketId}`,
                { status: 'deleted', description: `Deleted: ${deleteReason.trim()}` },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTickets((prevTickets) =>
                prevTickets.filter((ticket) => ticket._id !== deleteTicketId)
            );
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            setDeleteTicketId(null);
            setError(null);
            setSuccess('Ticket deleted successfully!');
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || 'Failed to delete ticket. Please try again.';
            setError(errorMessage);
            console.error('Error deleting ticket:', err.response?.data || err);
        }
    }, [deleteTicketId, deleteReason, token]);

    const toggleEditMode = useCallback((ticketId) => {
        setEditingTicketId(editingTicketId === ticketId ? null : ticketId);
    }, [editingTicketId]);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
            {/* Delete Modal */}
            {isDeleteModalOpen && (userRole === 'admin' || userRole === 'customer') && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-6 rounded-xl shadow-lg max-w-lg w-full">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Delete Ticket</h2>
                        <label className="block text-gray-200 font-medium mb-2">
                            Reason for deletion:
                        </label>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                            rows="4"
                            placeholder="Enter reason for deletion"
                        />
                        {error && <p className="text-red-400 mt-2">{error}</p>}
                        <div className="flex justify-end mt-4 gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteReason('');
                                    setDeleteTicketId(null);
                                    setError(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                                {userRole === 'customer' ? 'My Tickets' : 'Manage Tickets'}
                            </h1>
                            <Link
                                to="/create-ticket"
                                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:scale-[1.02]"
                                title="Create Ticket"
                            >
                                <FaPlus className="w-5 h-5" />
                            </Link>
                        </div>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">
                                {userRole === 'customer' ? 'My Tickets' : 'Manage Tickets'}
                            </span>
                        </nav>
                    </div>

                    {/* Error/Success Messages */}
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

                    {/* Filters (only for admins) */}
                    {userRole === 'admin' && (
                        <div className="p-4 sm:p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg mb-6">
                            <div className="mb-4">
                                <label className="block text-gray-200 font-medium mb-2">Search Tickets</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Search by TID, title, or description"
                                        className="w-full p-3 pl-10 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                    >
                                        <option value="" className="bg-gray-900">All</option>
                                        <option value="not started" className="bg-gray-900">Not Started</option>
                                        <option value="in progress" className="bg-gray-900">In Progress</option>
                                        <option value="stuck" className="bg-gray-900">Stuck</option>
                                        <option value="done" className="bg-gray-900">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">Date</label>
                                    <select
                                        value={filters.date}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                    >
                                        <option value="all" className="bg-gray-900">All Time</option>
                                        <option value="today" className="bg-gray-900">Today</option>
                                        <option value="this week" className="bg-gray-900">This Week</option>
                                        <option value="this month" className="bg-gray-900">This Month</option>
                                        <option value="custom" className="bg-gray-900">Custom Dates</option>
                                    </select>
                                </div>
                                {filters.date === 'custom' && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-200 font-medium mb-2">Custom Date Range</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="date"
                                                value={filters.customStart}
                                                onChange={(e) => handleFilterChange('customStart', e.target.value)}
                                                className="flex-1 p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            />
                                            <span className="self-center text-gray-200 hidden sm:block">to</span>
                                            <input
                                                type="date"
                                                value={filters.customEnd}
                                                onChange={(e) => handleFilterChange('customEnd', e.target.value)}
                                                className="flex-1 p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tickets Table */}
                    <div className="space-y-8">
                        {Object.keys(groupedTickets).length === 0 ? (
                            <p className="text-gray-300 p-6 text-center">No tickets available.</p>
                        ) : (
                            Object.entries(groupedTickets).map(([period, periodTickets]) => (
                                <div key={period}>
                                    <h2 className="text-xl font-semibold text-gray-200 mb-4">{period}</h2>
                                    <div className="overflow-x-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg">
                                        <table className="w-full text-sm sm:text-base text-left text-gray-200">
                                            <thead className="bg-gray-900 bg-opacity-50">
                                                <tr>
                                                    <th className="px-4 py-3 sm:px-6">TID</th>
                                                    <th className="px-4 py-3 sm:px-6">Title</th>
                                                    <th className="px-4 py-3 sm:px-6">Description</th>
                                                    <th className="px-4 py-3 sm:px-6">Customer</th>
                                                    <th className="px-4 py-3 sm:px-6">Status</th>
                                                    <th className="px-4 py-3 sm:px-6">Priority</th>
                                                    <th className="px-4 py-3 sm:px-6">Assigned Engineer</th>
                                                    <th className="px-4 py-3 sm:px-6">Company</th>
                                                    <th className="px-4 py-3 sm:px-6">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {periodTickets.map((ticket) => (
                                                    <tr
                                                        key={ticket._id}
                                                        className="hover:bg-gray-700 hover:bg-opacity-50 border-t border-purple-600 border-opacity-30 transition-all duration-300"
                                                    >
                                                        <td className="px-4 py-4 sm:px-6">{ticket.tid}</td>
                                                        <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                            {ticket.title}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6 max-w-[200px] sm:max-w-[250px]">
                                                            {editingTicketId === ticket._id ? (
                                                                <textarea
                                                                    value={ticket.description}
                                                                    onChange={(e) =>
                                                                        handleUpdateTicket(ticket._id, {
                                                                            description: e.target.value,
                                                                        })
                                                                    }
                                                                    className="w-full p-2 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200"
                                                                    rows="3"
                                                                />
                                                            ) : (
                                                                <span className="truncate block">
                                                                    {ticket.description || 'No description available.'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[200px]">
                                                            {ticket.customerName || 'Unknown'}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6">
                                                            {editingTicketId === ticket._id ? (
                                                                <select
                                                                    value={ticket.status}
                                                                    onChange={(e) =>
                                                                        handleUpdateTicket(ticket._id, {
                                                                            status: e.target.value,
                                                                        })
                                                                    }
                                                                    className="p-2 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                                                                >
                                                                    <option value="not started" className="bg-white text-gray-800">Not Started</option>
                                                                    <option value="in progress" className="bg-white text-gray-800">In Progress</option>
                                                                    <option value="stuck" className="bg-white text-gray-800">Stuck</option>
                                                                    <option value="done" className="bg-white text-gray-800">Done</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ticket-status-${ticket.status.replace(' ', '-')}`}>
                                                                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6">
                                                            {editingTicketId === ticket._id ? (
                                                                <select
                                                                    value={ticket.priority}
                                                                    onChange={(e) =>
                                                                        handleUpdateTicket(ticket._id, {
                                                                            priority: e.target.value,
                                                                        })
                                                                    }
                                                                    className="p-2 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                                                                >
                                                                    <option value="low" className="bg-white text-gray-800">Low</option>
                                                                    <option value="medium" className="bg-white text-gray-800">Medium</option>
                                                                    <option value="high" className="bg-white text-gray-800">High</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ticket-priority-${ticket.priority}`}>
                                                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                            {editingTicketId === ticket._id && userRole === 'admin' ? (
                                                                <select
                                                                    value={ticket.assignedSupportEngineer || ''}
                                                                    onChange={(e) =>
                                                                        handleUpdateTicket(ticket._id, {
                                                                            assignedSupportEngineer: e.target.value || null,
                                                                        })
                                                                    }
                                                                    className="p-2 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                                                                >
                                                                    <option value="" className="bg-white text-gray-800">Not Assigned</option>
                                                                    {supportEngineers.map((engineer) => (
                                                                        <option key={engineer.uid} value={engineer.uid} className="bg-white text-gray-800">
                                                                            {engineer.firstName} {engineer.lastName}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                ticket.engineerName || 'Unassigned'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                            {ticket.companyName || 'Unknown'}
                                                        </td>
                                                        <td className="px-4 py-4 sm:px-6 flex gap-2 flex-wrap">
                                                            <button
                                                                onClick={() => toggleEditMode(ticket._id)}
                                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                            >
                                                                {editingTicketId === ticket._id ? 'Save' : <FaEdit className="w-5 h-5" />}
                                                            </button>
                                                            {(userRole === 'admin' ||
                                                                (userRole === 'customer' && ticket.uid === userUid)) && (
                                                                <button
                                                                    onClick={() => handleDeleteTicket(ticket._id)}
                                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                                                                >
                                                                    <FaTrash className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {userRole === 'customer' && ticket.status === 'done' && (
                                                                ticket.reviewed ? (
                                                                    <button
                                                                        className="px-3 py-1 bg-gray-600 text-white rounded-lg transition-all duration-300 opacity-70 cursor-not-allowed"
                                                                        disabled
                                                                    >
                                                                        Review Submitted
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        to={`/review-ticket/${ticket._id}`}
                                                                        className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
                                                                    >
                                                                        Review
                                                                    </Link>
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
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

export default React.memo(ManageTickets);