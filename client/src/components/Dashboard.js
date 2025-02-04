import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
    const [ticketCounts, setTicketCounts] = useState({
        openTickets: 0,
        pendingTickets: 0,
        solvedTickets: 0,
        unassignedTickets: 0
    });
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    
    const token = localStorage.getItem('token');
    let role = null;
    let uid = null;

    if (token) {
            try {
                // Decode the token to get the role and username
                const decodedToken = jwtDecode(token);
                role = decodedToken.role;
                uid = decodedToken.uid;
                
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }


    

    // Fetch ticket counts based on role
    useEffect(() => {
        const fetchTicketCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/tickets/ticket-counts', {
                    headers: { role, uid }
                });
                setTicketCounts(response.data);
            } catch (error) {
                console.error('Error fetching ticket counts:', error);
            }
        };

        fetchTicketCounts();
    }, [role, uid]);

    // Fetch tickets by type based on role
    const fetchTicketsByType = async (type) => {
        if (selectedType === type) {
            // If the same card is clicked, clear the selected tickets and reset selectedType
            setSelectedTickets([]);
            setSelectedType('');
        } else {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/tickets/tickets-by-status?type=${type}`,
                    {
                        headers: { role, uid }
                    }
                );
                setSelectedTickets(response.data);
                setSelectedType(type);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        }
    };

    return (
        <div className="flex h-screen">
            
            <div className="ml-64 w-full p-6">
                <div className="dashboard-container grid gap-4">
                    {/* Ticket Count Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="ticket-card bg-blue-500 text-white p-4 rounded shadow cursor-pointer"
                            onClick={() => fetchTicketsByType('open')}
                        >
                            <h2 className="text-lg font-semibold">Open Tickets</h2>
                            <p className="text-2xl font-bold">{ticketCounts.openTickets}</p>
                        </div>
                        <div
                            className="ticket-card bg-yellow-500 text-white p-4 rounded shadow cursor-pointer"
                            onClick={() => fetchTicketsByType('pending')}
                        >
                            <h2 className="text-lg font-semibold">Pending Tickets</h2>
                            <p className="text-2xl font-bold">{ticketCounts.pendingTickets}</p>
                        </div>
                        <div
                            className="ticket-card bg-green-500 text-white p-4 rounded shadow cursor-pointer"
                            onClick={() => fetchTicketsByType('solved')}
                        >
                            <h2 className="text-lg font-semibold">Solved Tickets</h2>
                            <p className="text-2xl font-bold">{ticketCounts.solvedTickets}</p>
                        </div>
                        <div
                            className="ticket-card bg-red-500 text-white p-4 rounded shadow cursor-pointer"
                            onClick={() => fetchTicketsByType('unassigned')}
                        >
                            <h2 className="text-lg font-semibold">Unassigned Tickets</h2>
                            <p className="text-2xl font-bold">{ticketCounts.unassignedTickets}</p>
                        </div>
                    </div>

                    {/* Placeholder when no ticket is selected */}
                    {selectedType && selectedTickets.length === 0 && (
                        <div className="text-center mt-6 text-lg text-gray-500">
                            No tickets available for {selectedType}.
                        </div>
                    )}

                    {/* Display table only when tickets are selected */}
                    {selectedTickets.length > 0 && (
                        <>
                            <h3 className="text-xl font-semibold mb-2 capitalize">
                                {selectedType} Tickets
                            </h3>
                            <div className="overflow-x-auto bg-gray-100 rounded-lg shadow-md">
                                <table className="table-auto w-full text-sm text-left text-gray-700">
                                    <thead>
                                        <tr className="bg-blue-200 text-gray-700">
                                            <th className="px-4 py-2">TID</th>
                                            <th className="px-4 py-2">Title</th>
                                            <th className="px-4 py-2">Description</th>
                                            <th className="px-4 py-2">Priority</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Assigned Engineer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTickets.map((ticket) => (
                                            <tr key={ticket.tid} className="hover:bg-gray-50">
                                                <td className="border-t px-4 py-2">{ticket.tid}</td>
                                                <td className="border-t px-4 py-2">{ticket.title}</td>
                                                <td className="border-t px-4 py-2">{ticket.description}</td>
                                                <td className="border-t px-4 py-2">{ticket.priority}</td>
                                                <td className="border-t px-4 py-2">{ticket.status}</td>
                                                <td className="border-t px-4 py-2">{ticket.assignedSupportEngineer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Display a message if no ticket is selected */}
                    {!selectedType && (
                        <div className="text-center mt-6 text-lg text-gray-500">
                            Please select a ticket type to view the tickets.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
