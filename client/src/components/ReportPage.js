import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const ReportPage = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [metrics, setMetrics] = useState({
        allTicketsCount: 0,
        averageTime: 0,
        ticketsByStatus: {},
        ticketsByEngineer: {},
        ticketsByCustomer: {},
        ticketsByPriority: {},
        reviews: []
    });
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState({
        status: "",
        engineer: "",
        customer: "",
        priority: ""
    });

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
            setError(null);
        } catch (err) {
            console.error("Error fetching report data:", err);
            setError("Failed to fetch report data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [selectedCompany]);

    const handleFilterChange = (key, value) => {
        setSelectedFilter(prev => ({ ...prev, [key]: value }));
        const filtered = metrics.reportData.filter(ticket => {
            if (key === 'status') return ticket.status === value;
            if (key === 'engineer') return ticket.assignedSupportEngineer?.name === value;
            if (key === 'customer') return ticket.customer.name === value;
            if (key === 'priority') return ticket.priority === parseInt(value);
            return true;
        });
        setFilteredTickets(filtered);
    };

    if (error) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
                <div className="ml-64 w-full p-8">
                    <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="w-full p-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white text-opacity-90">Ticket Report</h1>
                        <nav className="text-white text-opacity-80 mb-4">
                            <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                            <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link> {' / '}
                            <span className="text-purple-300">Report Page</span>
                        </nav>
                        <select 
                            onChange={(e) => setSelectedCompany(e.target.value)} 
                            className="bg-white bg-opacity-10 backdrop-blur-md text-white border-none p-2 rounded-lg w-64 focus:ring-2 focus:ring-purple-500"
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

                    {selectedCompany && (
                        <>
                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Metrics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                                        <p className="text-white text-opacity-80">Total Tickets</p>
                                        <p className="text-2xl font-bold text-white">{metrics.allTicketsCount}</p>
                                    </div>
                                    <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                                        <p className="text-white text-opacity-80">Average Time (Done Tickets)</p>
                                        <p className="text-2xl font-bold text-white">{metrics.averageTime ? `${(metrics.averageTime / (1000 * 60 * 60)).toFixed(2)} hours` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Tickets by Status</h2>
                                <select 
                                    onChange={(e) => handleFilterChange('status', e.target.value)} 
                                    className="bg-white bg-opacity-10 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="" className="text-gray-900">All Statuses</option>
                                    {Object.keys(metrics.ticketsByStatus).map(status => (
                                        <option key={status} value={status} className="text-gray-900">{status} ({metrics.ticketsByStatus[status]})</option>
                                    ))}
                                </select>
                                <div className="mt-4">
                                    {filteredTickets.map(ticket => (
                                        <div key={ticket.tid} className="bg-white bg-opacity-5 p-4 rounded-lg mb-2">
                                            <p className="text-white text-opacity-80">{ticket.title} - {ticket.status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Tickets by Engineer</h2>
                                <select 
                                    onChange={(e) => handleFilterChange('engineer', e.target.value)} 
                                    className="bg-white bg-opacity-10 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="" className="text-gray-900">All Engineers</option>
                                    {Object.keys(metrics.ticketsByEngineer).map(engineer => (
                                        <option key={engineer} value={engineer} className="text-gray-900">{engineer} ({metrics.ticketsByEngineer[engineer]})</option>
                                    ))}
                                </select>
                                <div className="mt-4">
                                    {filteredTickets.map(ticket => (
                                        <div key={ticket.tid} className="bg-white bg-opacity-5 p-4 rounded-lg mb-2">
                                            <p className="text-white text-opacity-80">{ticket.title} - {ticket.assignedSupportEngineer?.name || 'Not Assigned'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Tickets by Customer</h2>
                                <select 
                                    onChange={(e) => handleFilterChange('customer', e.target.value)} 
                                    className="bg-white bg-opacity-10 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="" className="text-gray-900">All Customers</option>
                                    {Object.keys(metrics.ticketsByCustomer).map(customer => (
                                        <option key={customer} value={customer} className="text-gray-900">{customer} ({metrics.ticketsByCustomer[customer]})</option>
                                    ))}
                                </select>
                                <div className="mt-4">
                                    {filteredTickets.map(ticket => (
                                        <div key={ticket.tid} className="bg-white bg-opacity-5 p-4 rounded-lg mb-2">
                                            <p className="text-white text-opacity-80">{ticket.title} - {ticket.customer.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Tickets by Priority</h2>
                                <select 
                                    onChange={(e) => handleFilterChange('priority', e.target.value)} 
                                    className="bg-white bg-opacity-10 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="" className="text-gray-900">All Priorities</option>
                                    {Object.keys(metrics.ticketsByPriority).map(priority => (
                                        <option key={priority} value={priority} className="text-gray-900">Priority {priority} ({metrics.ticketsByPriority[priority]})</option>
                                    ))}
                                </select>
                                <div className="mt-4">
                                    {filteredTickets.map(ticket => (
                                        <div key={ticket.tid} className="bg-white bg-opacity-5 p-4 rounded-lg mb-2">
                                            <p className="text-white text-opacity-80">{ticket.title} - Priority {ticket.priority}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-xl font-bold text-white text-opacity-90 mb-4">Reviews</h2>
                                <div className="space-y-4">
                                    {metrics.reviews.map((review, index) => (
                                        <div key={index} className="bg-white bg-opacity-5 p-4 rounded-lg">
                                            <p className="text-white text-opacity-80">{review.customer}: {review.review} (Rating: {review.rating})</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {!selectedCompany && (
                        <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
                            <div className="text-center text-white text-opacity-80">
                                Please select a company to view the report.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPage;