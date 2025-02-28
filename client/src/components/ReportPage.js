import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const ReportPage = () => {
    // State management
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [metrics, setMetrics] = useState({
        allTicketsCount: 0,
        averageTime: 0,
        ticketsByStatus: {},
        ticketsByEngineer: {},
        ticketsByCustomer: {},
        ticketsByPriority: {},
        reviews: [],
        reportData: []
    });
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState({
        status: "",
        engineer: "",
        customer: "",
        priority: ""
    });

    // Fetch companies on component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASEURL}/auth/companies`, 
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setCompanies(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching companies:", err);
                setError("Failed to fetch companies");
            }
        };

        fetchCompanies();
    }, []);

    // Fetch report data when company selection changes
    useEffect(() => {
        if (selectedCompany) {
            fetchReportData();
        }
    }, [selectedCompany]);

    // Function to fetch report data
    const fetchReportData = async () => {
        if (!selectedCompany) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/report?companyId=${selectedCompany}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMetrics(response.data);
            setFilteredTickets(response.data.reportData);
            // Reset filters when company changes
            setSelectedFilter({
                status: "",
                engineer: "",
                customer: "",
                priority: ""
            });
            setActiveFilter(null);
            setError(null);
        } catch (err) {
            console.error("Error fetching report data:", err);
            setError("Failed to fetch report data");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        // Create a copy of the current filters
        const newFilters = { ...selectedFilter };
        
        // Update the selected filter
        newFilters[key] = value;
        
        // Update the state with the new filters
        setSelectedFilter(newFilters);
        
        // Apply the selected filter
        if (value) {
            setActiveFilter(key);
            
            // Apply the selected filter
            const filtered = metrics.reportData.filter(ticket => {
                if (key === 'status') return ticket.status === value;
                if (key === 'engineer') return ticket.assignedSupportEngineer?.name === value;
                if (key === 'customer') return ticket.customer.name === value;
                if (key === 'priority') return ticket.priority === parseInt(value);
                return true;
            });
            
            // Apply additional filters if they are set
            const finalFiltered = filtered.filter(ticket => {
                if (newFilters.status && ticket.status !== newFilters.status) return false;
                if (newFilters.engineer && ticket.assignedSupportEngineer?.name !== newFilters.engineer) return false;
                if (newFilters.customer && ticket.customer.name !== newFilters.customer) return false;
                if (newFilters.priority && ticket.priority !== parseInt(newFilters.priority)) return false;
                return true;
            });
            
            setFilteredTickets(finalFiltered);
        } else {
            // When no filter is selected, show all tickets and set active filter to null
            setFilteredTickets(metrics.reportData || []);
            setActiveFilter(null);
        }
    };

    // Function to format time
    const formatTime = (milliseconds) => {
        if (!milliseconds) return 'N/A';
        
        const hours = milliseconds / (1000 * 60 * 60);
        
        if (hours < 24) {
            return `${hours.toFixed(2)} hours`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = (hours % 24).toFixed(1);
            return `${days}d ${remainingHours}h`;
        }
    };

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-8">
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl text-center">
                    <p className="text-red-400 text-lg">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Render loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-300 mx-auto"></div>
                    <p className="text-white mt-4">Loading report data...</p>
                </div>
            </div>
        );
    }

    // Render main content
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="container mx-auto p-8">
                {/* Header section */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">Ticket Report</h1>
                        
                        <div className="w-full md:w-auto">
                            <select 
                                onChange={(e) => setSelectedCompany(e.target.value)} 
                                className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-purple-500"
                                value={selectedCompany}
                            >
                                <option value="" className="text-gray-900">Select a company</option>
                                {companies.map((company) => (
                                    <option key={company.companyId} value={company.companyId} className="text-gray-900">
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <nav className="text-white text-opacity-80">
                        <Link to="/dashboard" className="hover:text-purple-300 transition-colors">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:text-purple-300 transition-colors">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Report Page</span>
                    </nav>
                </div>

                {!selectedCompany ? (
                    /* Company selection prompt */
                    <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center">
                        <svg className="w-16 h-16 mx-auto text-purple-300 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-xl text-white text-opacity-80 mt-4">
                            Please select a company to view the report.
                        </p>
                    </div>
                ) : (
                    /* Report content */
                    <div className="space-y-6">
                        {/* Key metrics */}
                        <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                            <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Key Metrics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-r from-purple-900 to-indigo-800 p-4 rounded-lg shadow-md">
                                    <p className="text-white text-opacity-80 text-sm">Total Tickets</p>
                                    <p className="text-3xl font-bold text-white">{metrics.allTicketsCount}</p>
                                </div>
                                <div className="bg-gradient-to-r from-indigo-800 to-blue-900 p-4 rounded-lg shadow-md">
                                    <p className="text-white text-opacity-80 text-sm">Average Resolution Time</p>
                                    <p className="text-3xl font-bold text-white">{formatTime(metrics.averageTime)}</p>
                                </div>
                                <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 rounded-lg shadow-md">
                                    <p className="text-white text-opacity-80 text-sm">Completion Rate</p>
                                    <p className="text-3xl font-bold text-white">
                                        {metrics.ticketsByStatus?.done ? 
                                            `${((metrics.ticketsByStatus.done / metrics.allTicketsCount) * 100).toFixed(1)}%` 
                                            : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Filters/Categories */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tickets by Status */}
                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-8 bg-blue-400 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-bold text-white text-opacity-90">Tickets by Status</h2>
                                </div>
                                <select 
                                    onChange={(e) => handleFilterChange('status', e.target.value)} 
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 mb-4"
                                    value={selectedFilter.status}
                                >
                                    <option value="" className="text-gray-900">All Statuses</option>
                                    {Object.entries(metrics.ticketsByStatus || {}).map(([status, count]) => (
                                        <option key={status} value={status} className="text-gray-900">
                                            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                                        </option>
                                    ))}
                                </select>
                                <TicketList 
                                    tickets={selectedFilter.status ? filteredTickets : metrics.reportData} 
                                    displayField="status"
                                    capitalize={true}
                                    emptyMessage="No tickets found"
                                />
                            </div>

                            {/* Tickets by Engineer */}
                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-8 bg-purple-400 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-bold text-white text-opacity-90">Tickets by Engineer</h2>
                                </div>
                                <select 
                                    onChange={(e) => handleFilterChange('engineer', e.target.value)} 
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500 mb-4"
                                    value={selectedFilter.engineer}
                                >
                                    <option value="" className="text-gray-900">All Engineers</option>
                                    {Object.entries(metrics.ticketsByEngineer || {}).map(([engineer, count]) => (
                                        <option key={engineer} value={engineer} className="text-gray-900">
                                            {engineer} ({count})
                                        </option>
                                    ))}
                                </select>
                                <TicketList 
                                    tickets={selectedFilter.engineer ? filteredTickets : metrics.reportData} 
                                    displayField="assignedSupportEngineer.name"
                                    defaultValue="Not Assigned"
                                    emptyMessage="No tickets found"
                                />
                            </div>

                            {/* Tickets by Customer */}
                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-8 bg-green-400 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-bold text-white text-opacity-90">Tickets by Customer</h2>
                                </div>
                                <select 
                                    onChange={(e) => handleFilterChange('customer', e.target.value)} 
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-green-500 mb-4"
                                    value={selectedFilter.customer}
                                >
                                    <option value="" className="text-gray-900">All Customers</option>
                                    {Object.entries(metrics.ticketsByCustomer || {}).map(([customer, count]) => (
                                        <option key={customer} value={customer} className="text-gray-900">
                                            {customer} ({count})
                                        </option>
                                    ))}
                                </select>
                                <TicketList 
                                    tickets={selectedFilter.customer ? filteredTickets : metrics.reportData} 
                                    displayField="customer.name"
                                    emptyMessage="No tickets found"
                                />
                            </div>

                            {/* Tickets by Priority */}
                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-8 bg-red-400 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-bold text-white text-opacity-90">Tickets by Priority</h2>
                                </div>
                                <select 
                                    onChange={(e) => handleFilterChange('priority', e.target.value)} 
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-red-500 mb-4"
                                    value={selectedFilter.priority}
                                >
                                    <option value="" className="text-gray-900">All Priorities</option>
                                    {Object.entries(metrics.ticketsByPriority || {}).map(([priority, count]) => (
                                        <option key={priority} value={priority} className="text-gray-900">
                                            Priority {priority} ({count})
                                        </option>
                                    ))}
                                </select>
                                <TicketList 
                                    tickets={selectedFilter.priority ? filteredTickets : metrics.reportData} 
                                    displayField="priority"
                                    displayPrefix="Priority "
                                    emptyMessage="No tickets found"
                                />
                            </div>
                        </div>

                        {/* Reviews section */}
                        <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto">
                            <div className="flex items-center mb-4">
                                <div className="w-2 h-8 bg-yellow-400 rounded-full mr-3"></div>
                                <h2 className="text-xl font-bold text-white text-opacity-90">Customer Reviews</h2>
                            </div>
                            {metrics.reviews && metrics.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {metrics.reviews.map((review, index) => (
                                        <div key={index} className="bg-white bg-opacity-5 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold text-white">{review.customer}</div>
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-500'}`}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-white text-opacity-80 mt-2">{review.review}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-white text-opacity-60 py-8">
                                    No reviews available for this company.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable ticket list component
const TicketList = ({ tickets, displayField, defaultValue = '', displayPrefix = '', emptyMessage = 'No tickets to display', capitalize = false }) => {
    // Helper function to safely get nested properties
    const getNestedProperty = (obj, path) => {
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : defaultValue, obj);
    };
    
    if (!tickets || tickets.length === 0) {
        return (
            <div className="text-center text-white text-opacity-60 py-6">
                {emptyMessage}
            </div>
        );
    }
    
    // Limit the display to first 10 tickets to avoid overwhelming the UI
    const displayTickets = tickets.slice(0, 10);
    const hasMore = tickets.length > 10;
    
    return (
        <div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {displayTickets.map(ticket => {
                    let displayValue = getNestedProperty(ticket, displayField);
                    // Apply capitalization if needed
                    if (capitalize && typeof displayValue === 'string') {
                        displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
                    }
                    
                    return (
                        <div key={ticket.tid} className="bg-white bg-opacity-5 hover:bg-opacity-10 transition-all p-4 rounded-lg">
                            <div className="flex justify-between">
                                <p className="text-white font-medium">{ticket.title}</p>
                                <p className="text-white text-opacity-80 text-sm">
                                    {displayPrefix}{displayValue}
                                </p>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-white text-opacity-60">
                                <span>TID: {ticket.tid}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {hasMore && (
                <div className="text-center text-white text-opacity-60 mt-2 text-sm">
                    Showing 10 of {tickets.length} tickets
                </div>
            )}
        </div>
    );
};

export default ReportPage;