import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const Dashboard = () => {
    const [ticketCounts, setTicketCounts] = useState({
        openTickets: 0,
        pendingTickets: 0,
        solvedTickets: 0,
        unassignedTickets: 0,
    });
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cardLoading, setCardLoading] = useState(null);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    let role = null;
    let uid = null;

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            role = decodedToken.role;
            uid = decodedToken.uid;
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    // Toggle sidebar and disable body scroll when open
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            const toggleButton = document.querySelector('.sidebar-toggle');
            
            if (window.innerWidth < 1024 && isSidebarOpen && 
                sidebar && !sidebar.contains(event.target) && 
                toggleButton && !toggleButton.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Disable body scroll when sidebar is open on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            if (isSidebarOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    // Fetch ticket counts
    useEffect(() => {
        const fetchTicketCounts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/ticket-counts`, {
                    headers: { role, uid },
                });
                setTicketCounts(response.data);
            } catch (error) {
                setError('Failed to fetch ticket counts');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTicketCounts();
    }, [role, uid]);

    // Fetch tickets by type
    const fetchTicketsByType = useCallback(async (type) => {
        if (selectedType === type) {
            setSelectedTickets([]);
            setSelectedType('');
            return;
        }
        
        setCardLoading(type);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/tickets-by-status?type=${type}`,
                { headers: { role, uid } }
            );
            setSelectedTickets(response.data);
            setSelectedType(type);
        } catch (error) {
            setError('Failed to fetch tickets');
        } finally {
            setCardLoading(null);
        }
    }, [selectedType, role, uid]);

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Sidebar - Now appears above content on mobile */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Semi-transparent overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 pb-20 overflow-y-auto transition-all duration-300 lg:ml-64`}>
                <div className="p-4 lg:p-8 space-y-6">
                    {/* Ticket Count Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {['open', 'pending', 'solved', 'unassigned'].map((type) => (
                            <div
                                key={type}
                                className="bg-white bg-opacity-10 backdrop-blur-md p-4 lg:p-6 rounded-2xl shadow-2xl cursor-pointer hover:bg-opacity-20 transition-all duration-300 relative"
                                onClick={() => fetchTicketsByType(type)}
                            >
                                <h2 className="text-sm lg:text-base font-semibold text-white text-opacity-80 capitalize">
                                    {type} Tickets
                                </h2>
                                <p className="text-2xl lg:text-3xl font-bold text-white mt-2">
                                    {ticketCounts[`${type}Tickets`]}
                                </p>
                                {cardLoading === type && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
                                        <FaSpinner className="animate-spin h-6 w-6 text-purple-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Loading/Error States */}
                    {isLoading && (
                        <div className="flex justify-center items-center mt-6">
                            <FaSpinner className="animate-spin h-8 w-8 text-white" />
                        </div>
                    )}
                    {error && (
                        <div className="p-3 text-sm text-center text-red-500 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Ticket Display */}
                    {selectedType && selectedTickets.length === 0 && !cardLoading && (
                        <div className="text-center mt-6 text-base lg:text-lg text-white text-opacity-80">
                            No tickets available for {selectedType}.
                        </div>
                    )}

                    {selectedTickets.length > 0 && (
                        <>
                            <h3 className="text-lg lg:text-xl font-semibold text-white text-opacity-90 mb-4 capitalize">
                                {selectedType} Tickets
                            </h3>
                            <div className="overflow-x-auto bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl">
                                <table className="w-full text-xs lg:text-sm text-left text-white text-opacity-90">
                                    <thead className="bg-white bg-opacity-20">
                                        <tr>
                                            <th className="px-4 py-3 lg:px-6 lg:py-3">TID</th>
                                            <th className="px-4 py-3 lg:px-6 lg:py-3">Title</th>
                                            <th className="px-4 py-3 lg:px-6 lg:py-3">Description</th>
                                            <th className="px-4 py-3 lg:px-6 lg:py-3">Priority</th>
                                            <th className="px-4 py-3 lg:px-6 lg:py-3">Status</th>
                                            <th className="px-4 py-3 lg:px-6 lg:py-3">Engineer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTickets.map((ticket) => (
                                            <tr key={ticket.tid} className="hover:bg-white hover:bg-opacity-10 border-t border-white border-opacity-10">
                                                <td className="px-4 py-4 lg:px-6">{ticket.tid}</td>
                                                <td className="px-4 py-4 lg:px-6">{ticket.title}</td>
                                                <td className="px-4 py-4 lg:px-6 line-clamp-1">{ticket.description}</td>
                                                <td className="px-4 py-4 lg:px-6">{ticket.priority}</td>
                                                <td className="px-4 py-4 lg:px-6">{ticket.status}</td>
                                                <td className="px-4 py-4 lg:px-6">{ticket.assignedSupportEngineer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {!selectedType && !isLoading && (
                        <div className="text-center mt-6 text-base lg:text-lg text-white text-opacity-80">
                            Please select a ticket type to view the tickets.
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-500 border-opacity-20 z-50">
                <div className="flex justify-around items-center p-3">
                    {/* Sidebar Toggle Button */}
                    <button 
                        onClick={toggleSidebar}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    
                    {/* Home Button */}
                    <Link 
                        to="/dashboard" 
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaHome className="w-5 h-5" />
                    </Link>
                    
                    {/* Account Button */}
                    <button 
                        onClick={() => navigate('/account')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                    >
                        <FaUser className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Dashboard);