import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Retrieve the role from localStorage
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch tickets
                const ticketsResponse = await axios.get('http://localhost:5000/api/tickets/view-tickets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(ticketsResponse.data);
                setFilteredTickets(ticketsResponse.data);
            } catch (err) {
                setError('Failed to fetch tickets.');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    // Filter tickets by status
    useEffect(() => {
        const filtered = selectedStatus
            ? tickets.filter((ticket) => ticket.status === selectedStatus)
            : tickets;
        setFilteredTickets(filtered);
    }, [selectedStatus, tickets]);

    if (error) return <div>{error}</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">View Tickets</h1>

            {/* Filters */}
            <div className="mb-4">
                <label className="mr-2">Filter by Status: </label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All Statuses</option>
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="stuck">Stuck</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {/* Tickets List */}
            <div className="bg-white shadow-md rounded p-4">
                {filteredTickets.length === 0 ? (
                    <div className="text-gray-500">No tickets available</div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            className="flex justify-start items-center gap-8 py-4"
                        >
                            <div>
                                <strong>Ticket ID:</strong> {ticket.tid}
                            </div>
                            <div>
                                <strong>Title:</strong> {ticket.title}
                            </div>
                            <div>
                                <strong>Description:</strong> {ticket.description}
                            </div>
                            <div>
                                <strong>Priority:</strong> {ticket.priority}
                            </div>
                            <div>
                                <strong>User ID:</strong> {ticket.uid}
                            </div>
                            <div>
                                <strong>Status:</strong> {ticket.status}
                            </div>
                            {userRole === 'customer' && ticket.status === 'done' && (
                                <div>
                                    {ticket.review ? (
                                        <button
                                            className="bg-gray-400 text-white p-2 rounded cursor-not-allowed"
                                            disabled
                                        >
                                            Reviewed
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-blue-500 text-white p-2 rounded"
                                            onClick={() => navigate(`/review-ticket/${ticket._id}`)}
                                        >
                                            Write Review
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewTickets;
