import axios from 'axios';
import { useState } from 'react';

const ReportPage = () => {
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');

    // Retrieve the role and token from localStorage
    const role = localStorage.getItem('role');

    // Function to generate the report
    const generateReport = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tickets/generate', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setReport(response.data); // Update with actual data
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to generate report');
        }
    };

    // If the user is not an admin, deny access
    if (role !== 'admin') {
        return <h1>Access Denied. Admins only.</h1>;
    }

    return (
        <div>
            <h1>Generate Report</h1>
            <button onClick={generateReport}>Generate Report</button>
            
            {/* Display Report */}
            {report && (
                <div>
                    <h2>Report:</h2>
                    
                    <h3>Total Tickets</h3>
                    <p>{report.totalTickets}</p>

                    <h3>Tickets by Company</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Tickets</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.ticketsByCompany.map((company, index) => (
                                <tr key={index}>
                                    <td>{company._id || 'Unknown'}</td>
                                    <td>{company.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3>Tickets by Customer</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Tickets</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.ticketsByCustomer.map((customer, index) => (
                                <tr key={index}>
                                    <td>{customer._id || 'Unknown'}</td>
                                    <td>{customer.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3>Tickets Created by Month</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Tickets Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.ticketsCreatedByMonth.map((month, index) => (
                                <tr key={index}>
                                    <td>{month._id}</td>
                                    <td>{month.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3>Tickets Resolved by Month</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Tickets Resolved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.ticketsResolvedByMonth.map((month, index) => (
                                <tr key={index}>
                                    <td>{month._id}</td>
                                    <td>{month.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ReportPage;
