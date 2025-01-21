import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [filters, setFilters] = useState({ status: '', company: '', date: 'all' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Retrieve the role from localStorage
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole !== 'admin' && userRole !== 'support_engineer') {
            alert('Access denied!');
            navigate('/');
        }
    }, [userRole, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch all tickets
                const ticketsResponse = await axios.get('http://localhost:5000/api/tickets/view-tickets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(ticketsResponse.data);
                setFilteredTickets(ticketsResponse.data);

                // Fetch unique company names
                const companyNames = [
                    ...new Set(ticketsResponse.data.map((ticket) => ticket.company)),
                ];
                setCompanies(companyNames);

                // Fetch support engineers
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

    // Filter tickets based on filters
    useEffect(() => {
        let filtered = [...tickets];

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter((ticket) => ticket.status === filters.status);
        }

        // Filter by company
        if (filters.company) {
            filtered = filtered.filter((ticket) => ticket.company === filters.company);
        }

        // Filter by date
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

    // Function to handle ticket updates
    const handleUpdateTicket = async (ticketId, updates) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/tickets/update-ticket/${ticketId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update the ticket in the local state
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === ticketId ? response.data : ticket
                )
            );
            alert('Ticket updated successfully!');
        } catch (err) {
            alert('Failed to update ticket.');
            console.error(err);
        }
    };

    // Function to handle ticket deletion
    const handleDeleteTicket = async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/tickets/delete-ticket/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove the ticket from the local state
            setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
            alert('Ticket deleted successfully!');
        } catch (err) {
            alert('Failed to delete ticket.');
            console.error(err);
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Manage Tickets</h1>

            {/* Filters */}
            <div className="filters mb-4">
                <label className="mr-2">Status:</label>
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

                <label className="mr-2">Company:</label>
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

                <label className="mr-2">Date:</label>
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
            <ul>
                {filteredTickets.length === 0 ? (
                    <li>No tickets available</li>
                ) : (
                    filteredTickets.map((ticket) => (
                        <li key={ticket._id}>
                            <strong>{ticket.title}</strong> - {ticket.status} - Priority: {ticket.priority}
                            <br />
                            <div>
                                <label>Status: </label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) =>
                                        handleUpdateTicket(ticket._id, { status: e.target.value })
                                    }
                                >
                                    <option value="not started">Not Started</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="stuck">Stuck</option>
                                    <option value="done">Done</option>
                                </select>

                                <label> Priority: </label>
                                <input
                                    type="number"
                                    value={ticket.priority}
                                    min="1"
                                    max="5"
                                    onChange={(e) =>
                                        handleUpdateTicket(ticket._id, { priority: e.target.value })
                                    }
                                />

                                <label> Assign to: </label>
                                <select
                                    value={ticket.assignedSupportEngineer || ''}
                                    onChange={(e) =>
                                        handleUpdateTicket(ticket._id, {
                                            assignedSupportEngineer: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Not Assigned</option>
                                    {supportEngineers.map((engineer) => (
                                        <option key={engineer.uid} value={`${engineer.uid}`}>
                                            {engineer.firstName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Delete Ticket Button */}
                            <button onClick={() => handleDeleteTicket(ticket._id)}>
                                Delete Ticket
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default ManageTickets;
