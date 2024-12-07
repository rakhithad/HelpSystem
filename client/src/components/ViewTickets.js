import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [error, setError] = useState(null);

    // Fetch tickets and support engineers on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch tickets
                const ticketsResponse = await axios.get('http://localhost:5000/api/tickets/view-tickets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setTickets(ticketsResponse.data);

                // Fetch support engineers
                const engineersResponse = await axios.get('http://localhost:5000/api/auth/support-engineers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Fetched Engineers:', engineersResponse.data);
                setSupportEngineers(engineersResponse.data);
            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    // Handle updating a ticket
    const handleUpdateTicket = async (ticketId, updates) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/tickets/update-ticket/${ticketId}`,
                updates,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Update ticket in state
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

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>View Tickets</h1>
            <ul>
                {tickets.length === 0 ? (
                    <li>No tickets available</li>
                ) : (
                    tickets.map((ticket) => (
                        <li key={ticket._id}>
                            <strong>{ticket.title}</strong> - {ticket.status} - Priority: {ticket.priority} <br />

                            {/* Admin Controls */}
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
                                            assignedSupportEngineer: e.target.value
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
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default ViewTickets;
