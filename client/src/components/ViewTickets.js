import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [error, setError] = useState(null);

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

    // Function to determine the background color for status box
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

    // Function to determine review status (Reviewed or To be Reviewed)
    const getReviewStatus = (ticket) => {
        if (ticket.status === 'done') {
            return ticket.review ? 'Reviewed' : 'To be Reviewed';
        }
        return '';
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar is assumed to be rendered here */}
            <div className="ml-64 w-full p-8">
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        View Tickets
                    </h1>

                    {/* Filters */}
                    <div className="flex items-center space-x-4">
                        <label className="text-white text-opacity-80">Filter by Status:</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="not started">Not Started</option>
                            <option value="in progress">In Progress</option>
                            <option value="stuck">Stuck</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    {/* Tickets List as a table */}
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-white text-opacity-80">
                                            No tickets available
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.tid}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.title}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.description}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.priority}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.uid}</td>
                                            <td className="border-t border-white border-opacity-10 px-6 py-4">
                                                {/* Display the review status if the ticket is done */}
                                                {userRole !== 'customer' && ticket.status === 'done' ? (
                                                    <div>{getReviewStatus(ticket)}</div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`} />
                                                        <span>{ticket.status}</span>
                                                    </div>
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