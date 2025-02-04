import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div className="ml-64 p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Manage Tickets</h1>

            {/* Filters */}
            <div className="filters mb-6 p-4 bg-white rounded shadow">
                <label className="mr-2 font-semibold">Status:</label>
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="p-2 border rounded mr-4"
                >
                    <option value="">All</option>
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="stuck">Stuck</option>
                    <option value="done">Done</option>
                </select>

                <label className="mr-2 font-semibold">Company:</label>
                <select
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="p-2 border rounded mr-4"
                >
                    <option value="">All</option>
                    {companies.map((company, index) => (
                        <option key={index} value={company}>
                            {company}
                        </option>
                    ))}
                </select>

                <label className="mr-2 font-semibold">Date:</label>
                <select
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="this week">This Week</option>
                    <option value="this month">This Month</option>
                </select>
            </div>

            {/* Tickets List */}
            <div className="p-4 bg-white rounded shadow">
                {filteredTickets.length === 0 ? (
                    <p>No tickets available.</p>
                ) : (
                    <ul className="space-y-4">
                        {filteredTickets.map((ticket) => (
                            <li
                                key={ticket._id}
                                className="p-4 bg-gray-50 border rounded shadow-sm"
                            >
                                <strong className="block">{ticket.title}</strong>
                                <span className="text-sm text-gray-600">
                                    {ticket.status} - Priority: {ticket.priority}
                                </span>
                                <div className="mt-2">
                                    <label>Status: </label>
                                    <select
                                        value={ticket.status}
                                        onChange={(e) =>
                                            handleUpdateTicket(ticket._id, { status: e.target.value })
                                        }
                                        className="p-1 border rounded"
                                    >
                                        <option value="not started">Not Started</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="stuck">Stuck</option>
                                        <option value="done">Done</option>
                                    </select>

                                    <label className="ml-2">Priority: </label>
                                    <input
                                        type="number"
                                        value={ticket.priority}
                                        min="1"
                                        max="5"
                                        onChange={(e) =>
                                            handleUpdateTicket(ticket._id, { priority: e.target.value })
                                        }
                                        className="p-1 border rounded w-12"
                                    />

                                    <label className="ml-2">Assign to: </label>
                                    <select
                                        value={ticket.assignedSupportEngineer || ''}
                                        onChange={(e) =>
                                            handleUpdateTicket(ticket._id, {
                                                assignedSupportEngineer: e.target.value,
                                            })
                                        }
                                        className="p-1 border rounded"
                                    >
                                        <option value="">Not Assigned</option>
                                        {supportEngineers.map((engineer) => (
                                            <option key={engineer.uid} value={engineer.uid}>
                                                {engineer.firstName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => handleDeleteTicket(ticket._id)}
                                    className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete Ticket
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ManageTickets;
