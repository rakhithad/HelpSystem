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
        <div className="flex min-h-screen">
            <div className="flex-grow ml-64 p-6 bg-gray-100">
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

                {/* Tickets List as a table */}
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-blue-200 table-auto">
                        <thead>
                            <tr className="border-b bg-blue-500">
                                <th className="px-4 py-2 text-left">Ticket ID</th>
                                <th className="px-4 py-2 text-left">Title</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Priority</th>
                                <th className="px-4 py-2 text-left">User ID</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">No tickets available</td>
                                </tr>
                            ) : (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="border-b hover:bg-gray-100">
                                        <td className="px-4 py-2">{ticket.tid}</td>
                                        <td className="px-4 py-2">{ticket.title}</td>
                                        <td className="px-4 py-2">{ticket.description}</td>
                                        <td className="px-4 py-2">{ticket.priority}</td>
                                        <td className="px-4 py-2">{ticket.uid}</td>
                                        <td className="px-4 py-2">
                                            {/* Display the review status if the ticket is done */}
                                            {userRole !== 'customer' && ticket.status === 'done' ? (
                                                <div>{getReviewStatus(ticket)}</div>
                                            ) : (
                                                <div>
                                                    <div className={`inline-block w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`} />
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
    );
};

export default ViewTickets;
