import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ManageTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [filters, setFilters] = useState({ status: '', company: '', date: 'all' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const ticketsResponse = await axios.get('http://localhost:5000/api/tickets/view-tickets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(ticketsResponse.data);
                setFilteredTickets(ticketsResponse.data);

                const companyNames = [...new Set(ticketsResponse.data.map((ticket) => ticket.company))];
                setCompanies(companyNames);

                const engineersResponse = await axios.get('http://localhost:5000/api/auth/support-engineers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSupportEngineers(engineersResponse.data);
            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...tickets];

        if (filters.status) {
            filtered = filtered.filter((ticket) => ticket.status === filters.status);
        }

        if (filters.company) {
            filtered = filtered.filter((ticket) => ticket.company === filters.company);
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

    const handleFilterChange = (filterName, value) => {
        setFilters({ ...filters, [filterName]: value });
    };

    const handleUpdateTicket = async (ticketId, updates) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/tickets/update-ticket/${ticketId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === ticketId ? response.data : ticket
                )
            );
        } catch (err) {
            alert('Failed to update ticket.');
            console.error(err);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/tickets/delete-ticket/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
        } catch (err) {
            alert('Failed to delete ticket.');
            console.error(err);
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar is assumed to be rendered here */}
            <div className="ml-64 w-full p-8">
                <div className="space-y-8">
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
                                <label className="block text-white text-opacity-80 font-semibold mb-2">Company:</label>
                                <select
                                    value={filters.company}
                                    onChange={(e) => handleFilterChange('company', e.target.value)}
                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">All</option>
                                    {companies.map((company, index) => (
                                        <option key={index} value={company}>
                                            {company}
                                        </option>
                                    ))}
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
        </div>
    );
};

export default ManageTickets;