import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]); // Tickets after filtering
    const [selectedStatus, setSelectedStatus] = useState(''); // Selected status for filtering
    const [error, setError] = useState(null);

    // Retrieve the role from localStorage
    const userRole = localStorage.getItem('role'); // Assuming 'role' is stored in localStorage

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch tickets based on the role
                const ticketsResponse = await axios.get('http://localhost:5000/api/tickets/view-tickets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(ticketsResponse.data);
                setFilteredTickets(ticketsResponse.data);

                // Fetch support engineers only if the user is not a customer
                if (userRole !== 'customer') {
                    const engineersResponse = await axios.get(
                        'http://localhost:5000/api/auth/support-engineers',
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setSupportEngineers(engineersResponse.data);
                }
            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            }
        };

        fetchData();
    }, [userRole]);

    // Handle ticket updates (status, priority, or assigned engineer)
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
            setFilteredTickets((prevTickets) =>
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

    // Filter tickets based on selected status
    useEffect(() => {
        const filtered = selectedStatus
            ? tickets.filter((ticket) => ticket.status === selectedStatus)
            : tickets;
        setFilteredTickets(filtered);
    }, [selectedStatus, tickets]);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>View Tickets</h1>

            {/* Filters */}
            <div>
                <label>Filter by Status: </label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="stuck">Stuck</option>
                    <option value="done">Done</option>
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
                            {userRole !== 'customer' && (
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
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default ViewTickets;
