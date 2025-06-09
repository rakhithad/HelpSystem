import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaBars, FaHome, FaUser, FaEdit } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [filters, setFilters] = useState({ status: '', date: 'all' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [editingValues, setEditingValues] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Redirect to login if no token
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Close sidebar on outside click for mobile
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

    // Fetch tickets and user role
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const ticketsResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/view-tickets-with-company`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (ticketsResponse.data && Array.isArray(ticketsResponse.data.tickets)) {
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
                } else {
                    throw new Error('Invalid response format from server');
                }
            } catch (err) {
                setError(
                    err.response?.data?.message || 'Failed to fetch tickets. Please try again.'
                );
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, navigate]);

    // Apply filters to tickets
    useEffect(() => {
        let filtered = [...tickets];

        if (filters.status) {
            filtered = filtered.filter((ticket) => ticket.status === filters.status);
        }

        if (filters.company) {
            filtered = filtered.filter((ticket) => ticket.companyName === filters.company);
        }

        if (filters.date !== 'all') {
            const now = new Date();
            if (filters.date === 'today') {
                filtered = filtered.filter(
                    (ticket) =>
                        new Date(ticket.createdAt).toDateString() === now.toDateString()
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

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
    };

    const handleEdit = (ticketId, ticket) => {
        setEditingTicketId(ticketId);
        setEditingValues({
            description: ticket.description || '',
            priority: ticket.priority || 'medium',
            status: ticket.status || 'not started',
            assignedSupportEngineer: ticket.assignedSupportEngineer || '',
        });
    };

    const handleSave = async (ticketId) => {
        setIsLoading(true);
        setError('');
        try {
            const updates = {
                description: editingValues.description,
                ...(userRole !== 'customer' && {
                    priority: editingValues.priority,
                    status: editingValues.status,
                    assignedSupportEngineer: editingValues.assignedSupportEngineer || null,
                }),
            };

            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/update-ticket/${ticketId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === ticketId
                        ? {
                              ...ticket,
                              ...response.data,
                              engineerName: supportEngineers.find(
                                  (e) => e.uid === response.data.assignedSupportEngineer
                              )
                                  ? `${supportEngineers.find((e) => e.uid === response.data.assignedSupportEngineer).firstName} ${
                                        supportEngineers.find((e) => e.uid === response.data.assignedSupportEngineer).lastName
                                    }`
                                  : 'Unassigned',
                          }
                        : ticket
                )
            );

            setEditingTicketId(null);
            setEditingValues({});
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to update ticket. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = (ticketId) => {
        navigate(`/review-ticket/${ticketId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'not started':
                return 'bg-yellow-500';
            case 'in progress':
                return 'bg-blue-500';
            case 'stuck':
                return 'bg-red-500';
            case 'done':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
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
                            View Tickets
                        </h1>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">View Tickets</span>
                        </nav>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {/* Filters */}
                    {userRole === 'admin' && (
                        <div className="p-4 sm:p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                    >
                                        <option value="" className="bg-gray-900">
                                            All Statuses
                                        </option>
                                        <option value="not started" className="bg-gray-900">
                                            Not Started
                                        </option>
                                        <option value="in progress" className="bg-gray-900">
                                            In Progress
                                        </option>
                                        <option value="stuck" className="bg-gray-900">
                                            Stuck
                                        </option>
                                        <option value="done" className="bg-gray-900">
                                            Done
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">
                                        Date
                                    </label>
                                    <select
                                        value={filters.date}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                    >
                                        <option value="all" className="bg-gray-900">
                                            All Time
                                        </option>
                                        <option value="today" className="bg-gray-900">
                                            Today
                                        </option>
                                        <option value="this week" className="bg-gray-900">
                                            This Week
                                        </option>
                                        <option value="this month" className="bg-gray-900">
                                            This Month
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-200 font-medium mb-2">
                                        Company
                                    </label>
                                    <select
                                        value={filters.company}
                                        onChange={(e) => handleFilterChange('company', e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                    >
                                        <option value="" className="bg-gray-900">
                                            All Companies
                                        </option>
                                        {[...new Set(tickets.map((ticket) => ticket.companyName))]
                                            .filter((company) => company)
                                            .map((company) => (
                                                <option key={company} value={company} className="bg-gray-900">
                                                    {company}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}

                    {/* Tickets Table */}
                    {!isLoading && (
                        <div className="overflow-x-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg">
                            {filteredTickets.length === 0 ? (
                                <p className="text-gray-300 p-6 text-center">No tickets available.</p>
                            ) : (
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
                                        {filteredTickets.map((ticket) => (
                                            <tr
                                                key={ticket._id}
                                                className="hover:bg-gray-700 hover:bg-opacity-50 border-t border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <td className="px-4 py-4 sm:px-6 font-medium text-purple-300">
                                                    {ticket.tid}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                    {ticket.title}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 max-w-[200px] sm:max-w-[250px]">
                                                    {editingTicketId === ticket._id ? (
                                                        <textarea
                                                            value={editingValues.description}
                                                            onChange={(e) =>
                                                                setEditingValues({
                                                                    ...editingValues,
                                                                    description: e.target.value,
                                                                })
                                                            }
                                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                            rows="3"
                                                            placeholder="Enter description"
                                                        />
                                                    ) : (
                                                        <span className="truncate block">
                                                            {ticket.description || 'No description'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                    {ticket.customerName || 'Unknown'}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">
                                                    {editingTicketId === ticket._id && userRole !== 'customer' ? (
                                                        <select
                                                            value={editingValues.status}
                                                            onChange={(e) =>
                                                                setEditingValues({
                                                                    ...editingValues,
                                                                    status: e.target.value,
                                                                })
                                                            }
                                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                        >
                                                            <option value="not started" className="bg-gray-900">
                                                                Not Started
                                                            </option>
                                                            <option value="in progress" className="bg-gray-900">
                                                                In Progress
                                                            </option>
                                                            <option value="stuck" className="bg-gray-900">
                                                                Stuck
                                                            </option>
                                                            <option value="done" className="bg-gray-900">
                                                                Done
                                                            </option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                ticket.status
                                                            )} bg-opacity-20 text-gray-200`}
                                                        >
                                                            {ticket.status.charAt(0).toUpperCase() +
                                                                ticket.status.slice(1).replace('-', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6">
                                                    {editingTicketId === ticket._id && userRole !== 'customer' ? (
                                                        <select
                                                            value={editingValues.priority}
                                                            onChange={(e) =>
                                                                setEditingValues({
                                                                    ...editingValues,
                                                                    priority: e.target.value,
                                                                })
                                                            }
                                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                        >
                                                            <option value="low" className="bg-gray-900">
                                                                Low
                                                            </option>
                                                            <option value="medium" className="bg-gray-900">
                                                                Medium
                                                            </option>
                                                            <option value="high" className="bg-gray-900">
                                                                High
                                                            </option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                ticket.priority === 'high'
                                                                    ? 'bg-red-500 bg-opacity-20 text-red-300'
                                                                    : ticket.priority === 'medium'
                                                                    ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                                                                    : 'bg-green-500 bg-opacity-20 text-green-300'
                                                            }`}
                                                        >
                                                            {ticket.priority.charAt(0).toUpperCase() +
                                                                ticket.priority.slice(1)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                    {editingTicketId === ticket._id && userRole === 'admin' ? (
                                                        <select
                                                            value={editingValues.assignedSupportEngineer}
                                                            onChange={(e) =>
                                                                setEditingValues({
                                                                    ...editingValues,
                                                                    assignedSupportEngineer: e.target.value,
                                                                })
                                                            }
                                                            className="w-full p-3 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                                        >
                                                            <option value="" className="bg-gray-900">
                                                                Not Assigned
                                                            </option>
                                                            {supportEngineers.map((engineer) => (
                                                                <option
                                                                    key={engineer.uid}
                                                                    value={engineer.uid}
                                                                    className="bg-gray-900"
                                                                >
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
                                                    {editingTicketId === ticket._id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSave(ticket._id)}
                                                                disabled={isLoading}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isLoading ? (
                                                                    <FaSpinner className="animate-spin h-5 w-5" />
                                                                ) : (
                                                                    'Save'
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingTicketId(null);
                                                                    setEditingValues({});
                                                                }}
                                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEdit(ticket._id, ticket)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                        >
                                                            <FaEdit className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {ticket.status === 'done' &&
                                                        userRole === 'customer' &&
                                                        !ticket.reviewed && (
                                                            <button
                                                                onClick={() => handleReview(ticket._id)}
                                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
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

export default React.memo(ViewTickets);