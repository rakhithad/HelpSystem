import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ReportPage = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/companies`);
                setCompanies(response.data);
            } catch (err) {
                console.error('Error fetching companies:', err);
            }
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            setLoading(true);
            setError(null);

            axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/tickets/report?companyId=${selectedCompany}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(res => {
                setReportData(res.data);
            })
            .catch(err => {
                console.error('Error fetching report data:', err);
                setError('Failed to load report data');
            })
            .finally(() => setLoading(false));
        }
    }, [selectedCompany]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    // Helper function to format the solving time
    const formatSolvingTime = (time) => {
        if (typeof time !== 'number' || isNaN(time)) return 'N/A';
        return time.toFixed(1);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="w-full p-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">HelpDesk Report</h1>

                        <nav className="text-white text-opacity-80 mb-4">
                            <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                            <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link> {' / '}
                            <span className="text-purple-300">Report Page</span>
                        </nav>



                        <select 
                            value={selectedCompany} 
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="p-2 rounded-lg bg-white bg-opacity-10 backdrop-blur-md text-white border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                        >
                            <option value="" className="bg-indigo-900">Select a company</option>
                            {companies.map(company => (
                                <option key={company.companyId} value={company.companyId} className="bg-indigo-900">
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading && <p className="text-white text-opacity-80">Loading report...</p>}
                    {error && <p className="text-red-400">{error}</p>}

                    {reportData && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                    <h3 className="text-lg font-semibold text-white text-opacity-80">Total Tickets</h3>
                                    <p className="text-3xl font-bold text-white">{reportData.totalTickets || 0}</p>
                                </div>
                                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                    <h3 className="text-lg font-semibold text-white text-opacity-80">Avg Response Time</h3>
                                    <p className="text-3xl font-bold text-white">
                                        {formatSolvingTime(reportData.avgSolvingTime)}h
                                    </p>
                                </div>
                                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                    <h3 className="text-lg font-semibold text-white text-opacity-80">Reviews</h3>
                                    <p className="text-3xl font-bold text-white">{reportData.reviewCount || 0}</p>
                                </div>
                                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                    <h3 className="text-lg font-semibold text-white text-opacity-80">Company</h3>
                                    <p className="text-xl font-bold text-white">{reportData.companyName || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Expandable Sections */}
                            {['status', 'priority', 'user', 'engineer'].map((section) => (
                                <div key={section} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
                                    <div 
                                        className="p-6 cursor-pointer flex justify-between items-center"
                                        onClick={() => toggleSection(section)}
                                    >
                                        <h2 className="text-lg font-bold text-white">
                                            Tickets by {section.charAt(0).toUpperCase() + section.slice(1)}
                                        </h2>
                                        <span className="text-white">{expandedSections[section] ? '▲' : '▼'}</span>
                                    </div>
                                    
                                    {expandedSections[section] && (
                                        <div className="px-6 pb-6">
                                            <div className="bg-white bg-opacity-5 rounded-xl p-4 space-y-4">
                                                {section === 'status' && reportData.ticketsByStatus && 
                                                    Object.entries(reportData.ticketsByStatus || {}).map(([status, tickets]) => (
                                                        <div key={status} className="text-white">
                                                            <h3 className="font-semibold">{status}: {tickets.length} tickets</h3>
                                                            <div className="ml-4 text-white text-opacity-80">
                                                                {tickets.map(ticket => (
                                                                    <p key={ticket.tid}>{ticket.title}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                
                                                {section === 'priority' && reportData.ticketsByPriority &&
                                                    Object.entries(reportData.ticketsByPriority || {}).map(([priority, tickets]) => (
                                                        <div key={priority} className="text-white">
                                                            <h3 className="font-semibold">Priority {priority}: {tickets.length} tickets</h3>
                                                            <div className="ml-4 text-white text-opacity-80">
                                                                {tickets.map(ticket => (
                                                                    <p key={ticket.tid}>{ticket.title}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                
                                                {section === 'user' && reportData.ticketsByUser &&
                                                    (reportData.ticketsByUser || []).map(user => (
                                                        <div key={user.uid} className="text-white">
                                                            <h3 className="font-semibold">{user.name}: {user.tickets.length} tickets</h3>
                                                            <div className="ml-4 text-white text-opacity-80">
                                                                {user.tickets.map(ticket => (
                                                                    <p key={ticket.tid}>{ticket.title}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                
                                                {section === 'engineer' && reportData.ticketsBySupportEngineer &&
                                                    (reportData.ticketsBySupportEngineer || []).map(engineer => (
                                                        <div key={engineer.uid} className="text-white">
                                                            <h3 className="font-semibold">{engineer.name}: {engineer.tickets.length} tickets</h3>
                                                            <div className="ml-4 text-white text-opacity-80">
                                                                {engineer.tickets.map(ticket => (
                                                                    <p key={ticket.tid}>{ticket.title}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Reviews Section */}
                            {reportData.reviews && reportData.reviews.length > 0 && (
                                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
                                    <h2 className="text-lg font-bold text-white mb-4">Reviews</h2>
                                    <div className="space-y-3">
                                        {reportData.reviews.map(review => (
                                            <div key={review.tid} className="bg-white bg-opacity-5 p-4 rounded-xl">
                                                <p className="text-white">
                                                    <span className="font-semibold">{review.customerName}</span>
                                                    <span className="text-yellow-400 ml-2">{renderStars(review.rating)}</span>
                                                </p>
                                                <p className="text-white text-opacity-80 mt-1">{review.review}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPage;