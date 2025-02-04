import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportPage = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedStatus, setExpandedStatus] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/companies');
                setCompanies(response.data);
            } catch (err) {
                setError('Error fetching companies');
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            const fetchReport = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `http://localhost:5000/api/tickets/report?companyId=${selectedCompanyId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    setReportData(response.data);
                } catch (err) {
                    if (err.response) {
                        setError(err.response.data.message || JSON.stringify(err.response.data));
                    } else if (err.request) {
                        setError('No response from server');
                    } else {
                        setError('Error setting up the request');
                    }
                    console.error('Detailed fetch report error:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchReport();
        }
    }, [selectedCompanyId]);

    const handleCompanyChange = (event) => {
        setSelectedCompanyId(event.target.value);
        setReportData(null);
        setError(null);
    };

    const formatBreakdownData = (data) => {
        if (!data || typeof data !== 'object') return {};
        
        // Convert the data into an array of entries and sort them
        return Object.entries(data).sort((a, b) => {
            // Sort by value in descending order
            return b[1] - a[1];
        }).reduce((acc, [key, value]) => {
            // Format the key to be more readable
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            acc[formattedKey] = value;
            return acc;
        }, {});
    };

    const renderBreakdown = (data, title) => {
        const formattedData = formatBreakdownData(data);
        
        return (
            <div className="bg-white shadow rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">{title}</h3>
                {Object.entries(formattedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b last:border-b-0">
                        <span className="text-gray-700">{key}</span>
                        <span className="font-medium">{value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Company Report</h1>

            <div className="mb-6">
                <label htmlFor="company-select" className="block mb-2 text-sm font-medium text-gray-700">
                    Select a Company:
                </label>
                <select
                    id="company-select"
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Select a Company --</option>
                    {companies.map((company) => (
                        <option key={company.companyId} value={company.companyId}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="text-center py-4 text-gray-600">
                    Loading report data...
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    {error}
                </div>
            )}

            {reportData && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white shadow rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Overall Statistics</h2>
                        <div className="space-y-2">
                            <p className="flex justify-between">
                                <span className="text-gray-700">Company:</span>
                                <span className="font-medium">{reportData.companyName}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-700">Total Tickets:</span>
                                <span className="font-medium">{reportData.totalTickets}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-700">Avg Resolution Time:</span>
                                <span className="font-medium">{(reportData.avgResolutionTime / (1000 * 60 * 60)).toFixed(2)} hours</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-700">Average Rating:</span>
                                <span className="font-medium">
                                    {reportData.reviewStats?.averageRating?.toFixed(2) || 'N/A'}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-700">Total Reviews:</span>
                                <span className="font-medium">{reportData.reviewStats?.totalReviews || 0}</span>
                            </p>
                        </div>
                    </div>

                    {renderBreakdown(reportData.ticketsByStatus, 'Tickets by Status')}
                    {renderBreakdown(reportData.ticketsByPriority, 'Tickets by Priority')}
                </div>
            )}
        </div>
    );
};

export default ReportPage;