import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [ticketCounts, setTicketCounts] = useState({
        openTickets: 0,
        pendingTickets: 0,
        solvedTickets: 0,
        unassignedTickets: 0
    });
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    // Get role and uid from local storage
    const role = localStorage.getItem('role');
    const uid = localStorage.getItem('uid');

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
    };

    return (
        <div className="dashboard-container grid gap-4 p-4">
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

            {selectedTickets.length > 0 ? (
            <>
                <h3 className="text-xl font-semibold mb-2 capitalize">
                    {selectedType} Tickets
                </h3>
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">TID</th>
                            <th className="border border-gray-300 px-4 py-2">Title</th>
                            <th className="border border-gray-300 px-4 py-2">Description</th>
                            <th className="border border-gray-300 px-4 py-2">Priority</th>
                            <th className="border border-gray-300 px-4 py-2">Status</th>
                            <th className="border border-gray-300 px-4 py-2">Assigned Engineer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedTickets.map((ticket) => (
                            <tr key={ticket.tid}>
                                <td className="border border-gray-300 px-4 py-2">{ticket.tid}</td>
                                <td className="border border-gray-300 px-4 py-2">{ticket.title}</td>
                                <td className="border border-gray-300 px-4 py-2">{ticket.description}</td>
                                <td className="border border-gray-300 px-4 py-2">{ticket.priority}</td>
                                <td className="border border-gray-300 px-4 py-2">{ticket.status}</td>
                                <td className="border border-gray-300 px-4 py-2">{ticket.assignedSupportEngineer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        ) : (
            <p>No tickets found for {selectedType}.</p>
        )}
        </div>
    );
};

export default Dashboard;
