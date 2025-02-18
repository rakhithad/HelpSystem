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
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/ticket-counts`, {
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
                    `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/tickets-by-status?type=${type}`,
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
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar is assumed to be rendered here */}
            <div className="ml-64 w-full p-8">
                <div className="dashboard-container space-y-8">
                    {/* Ticket Count Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            className="ticket-card bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl cursor-pointer hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => fetchTicketsByType('open')}
                        >
                            <h2 className="text-lg font-semibold text-white text-opacity-80">Open Tickets</h2>
                            <p className="text-3xl font-bold text-white">{ticketCounts.openTickets}</p>
                        </div>
                        <div
                            className="ticket-card bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl cursor-pointer hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => fetchTicketsByType('pending')}
                        >
                            <h2 className="text-lg font-semibold text-white text-opacity-80">Pending Tickets</h2>
                            <p className="text-3xl font-bold text-white">{ticketCounts.pendingTickets}</p>
                        </div>
                        <div
                            className="ticket-card bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl cursor-pointer hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => fetchTicketsByType('solved')}
                        >
                            <h2 className="text-lg font-semibold text-white text-opacity-80">Solved Tickets</h2>
                            <p className="text-3xl font-bold text-white">{ticketCounts.solvedTickets}</p>
                        </div>
                        <div
                            className="ticket-card bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl cursor-pointer hover:bg-opacity-20 transition-all duration-300"
                            onClick={() => fetchTicketsByType('unassigned')}
                        >
                            <h2 className="text-lg font-semibold text-white text-opacity-80">Unassigned Tickets</h2>
                            <p className="text-3xl font-bold text-white">{ticketCounts.unassignedTickets}</p>
                        </div>
                    </div>

                    {/* Placeholder when no ticket is selected */}
                    {selectedType && selectedTickets.length === 0 && (
                        <div className="text-center mt-6 text-lg text-white text-opacity-80">
                            No tickets available for {selectedType}.
                        </div>
                    )}

                    {/* Display table only when tickets are selected */}
                    {selectedTickets.length > 0 && (
                        <>
                            <h3 className="text-xl font-semibold text-white text-opacity-90 mb-4 capitalize">
                                {selectedType} Tickets
                            </h3>
                            <div className="overflow-x-auto bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto">
                                <table className="table-auto w-full text-sm text-left text-white text-opacity-90">
                                    <thead>
                                        <tr className="bg-white bg-opacity-20">
                                            <th className="px-6 py-3">TID</th>
                                            <th className="px-6 py-3">Title</th>
                                            <th className="px-6 py-3">Description</th>
                                            <th className="px-6 py-3">Priority</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Assigned Engineer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTickets.map((ticket) => (
                                            <tr key={ticket.tid} className="hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                                                <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.tid}</td>
                                                <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.title}</td>
                                                <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.description}</td>
                                                <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.priority}</td>
                                                <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.status}</td>
                                                <td className="border-t border-white border-opacity-10 px-6 py-4">{ticket.assignedSupportEngineer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Display a message if no ticket is selected */}
                    {!selectedType && (
                        <div className="text-center mt-6 text-lg text-white text-opacity-80">
                            Please select a ticket type to view the tickets.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;