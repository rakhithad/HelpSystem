import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [filters, setFilters] = useState({ status: '', date: 'all' });
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [editingTicketId, setEditingTicketId] = useState(null); // Track which ticket is being edited
    const [editingValues, setEditingValues] = useState({}); // Store edited values
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch tickets
                const ticketsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/view-tickets`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Check if the response contains the tickets array
                if (ticketsResponse.data && Array.isArray(ticketsResponse.data.tickets)) {
                    setTickets(ticketsResponse.data.tickets); // Set tickets
                    setFilteredTickets(ticketsResponse.data.tickets); // Set filtered tickets
                    setUserRole(ticketsResponse.data.role); // Set user role
                } else {
                    setError('Invalid response from the server.');
                }
            } catch (err) {
                setError('Failed to fetch tickets.');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchSupportEngineers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/support-engineers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSupportEngineers(response.data); // Set the list of support engineers
            } catch (err) {
                console.error('Failed to fetch support engineers:', err);
            }
        };

        fetchSupportEngineers();
    }, []);

    useEffect(() => {
        let filtered = [...tickets];

        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter((ticket) => ticket.status === filters.status);
        }

        // Apply date filter
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

    const handleFilterChange = (filterName, value) => {
        setFilters({ ...filters, [filterName]: value });
    };

    const handleEdit = (ticketId, ticket) => {
        setEditingTicketId(ticketId);
        setEditingValues({
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            assignedSupportEngineer: ticket.assignedSupportEngineer,
        });
    };

    const handleSave = async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            const updates = { description: editingValues.description }; // Only send description for customers
            console.log('Sending payload:', updates); // Debugging

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
            setEditingTicketId(null); // Exit edit mode
        } catch (err) {
            alert('Failed to update ticket.');
            console.error(err);
        }
    };

    const handleReview = (ticketId) => {
        navigate(`/review-ticket/${ticketId}`); // Redirect to review page
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
                return 'bg-gray-200';
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="ml-64 w-full p-8">
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        View Tickets
                    </h1>

                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <span className="text-purple-300">View Tickets</span>
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
                                    <option value="">All Statuses</option>
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

                    {/* Tickets List */}
                    <div className="overflow-x-auto bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl">
                        <table className="min-w-full text-sm text-left text-white text-opacity-90">
                            <thead>
                                <tr className="bg-white bg-opacity-20">
                                    <th className="px-6 py-3">Ticket ID</th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">User ID</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Assigned Engineer</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(filteredTickets || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-white text-opacity-80">
                                            No tickets available
                                        </td>
                                    </tr>
                                ) : (
                                    (filteredTickets || []).map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.tid}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.title}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">
                                                {editingTicketId === ticket._id ? (
                                                    <textarea
                                                        value={editingValues.description}
                                                        onChange={(e) =>
                                                            setEditingValues({ ...editingValues, description: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    ticket.description
                                                )}
                                            </td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">
                                                {editingTicketId === ticket._id && userRole !== 'customer' ? (
                                                    <input
                                                        type="number"
                                                        value={editingValues.priority}
                                                        min="1"
                                                        max="5"
                                                        onChange={(e) =>
                                                            setEditingValues({ ...editingValues, priority: e.target.value })
                                                        }
                                                        className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-20"
                                                    />
                                                ) : (
                                                    ticket.priority
                                                )}
                                            </td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.uid}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">
                                                {editingTicketId === ticket._id && userRole !== 'customer' ? (
                                                    <select
                                                        value={editingValues.status}
                                                        onChange={(e) =>
                                                            setEditingValues({ ...editingValues, status: e.target.value })
                                                        }
                                                        className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="not started">Not Started</option>
                                                        <option value="in progress">In Progress</option>
                                                        <option value="stuck">Stuck</option>
                                                        <option value="done">Done</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`} />
                                                        <span>{ticket.status}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">
                                                {ticket.assignedSupportEngineer
                                                    ? (supportEngineers.find((e) => e.uid === ticket.assignedSupportEngineer)?.firstName || 'Not Assigned')
                                                    : 'Not Assigned'}
                                            </td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">
                                                {editingTicketId === ticket._id ? (
                                                    <button
                                                        onClick={() => handleSave(ticket._id)}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                                                    >
                                                        Save
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(ticket._id, ticket)}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {ticket.status === 'done' && userRole === 'customer' && !ticket.reviewed && (
                                                    <button
                                                        onClick={() => handleReview(ticket._id)}
                                                        className="ml-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300"
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewTickets;