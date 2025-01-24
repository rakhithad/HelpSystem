import axios from 'axios';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
            setReport(response.data);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to generate report');
        }
    };

    // Function to export the report as a PDF
    const exportToPDF = () => {
        const reportElement = document.getElementById('report-content'); // Get the report content
        html2canvas(reportElement, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
            pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
            pdf.save('report.pdf'); // Save the PDF with the filename "report.pdf"
        });
    };

    // If the user is not an admin, deny access
    if (role !== 'admin') {
        return (
            <div className="ml-64 p-8 min-h-screen bg-gray-100 flex items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied. Admins only.</h1>
            </div>
        );
    }

    return (
        <div className="ml-64 p-8 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Report</h1>
            <button
                onClick={generateReport}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 mb-6"
            >
                Generate Report
            </button>

            {report && (
                <div>
                    <button
                        onClick={exportToPDF}
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200 mb-6"
                    >
                        Export as PDF
                    </button>

                    <div id="report-content" className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Summary:</h2>
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700">Total Tickets</h3>
                            <p className="text-gray-600">{report.totalTickets}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700">Tickets by Company</h3>
                            <table className="w-full border-collapse border border-gray-300 text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-2">Company</th>
                                        <th className="border border-gray-300 p-2">Tickets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.ticketsByCompany.map((company, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2">{company._id || 'Unknown'}</td>
                                            <td className="border border-gray-300 p-2">{company.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700">Tickets by Customer</h3>
                            <table className="w-full border-collapse border border-gray-300 text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-2">Customer</th>
                                        <th className="border border-gray-300 p-2">Tickets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.ticketsByCustomer.map((customer, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2">{customer._id || 'Unknown'}</td>
                                            <td className="border border-gray-300 p-2">{customer.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700">Tickets Created by Month</h3>
                            <table className="w-full border-collapse border border-gray-300 text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-2">Month</th>
                                        <th className="border border-gray-300 p-2">Tickets Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.ticketsCreatedByMonth.map((month, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2">{month._id}</td>
                                            <td className="border border-gray-300 p-2">{month.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700">Tickets Resolved by Month</h3>
                            <table className="w-full border-collapse border border-gray-300 text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-2">Month</th>
                                        <th className="border border-gray-300 p-2">Tickets Resolved</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.ticketsResolvedByMonth.map((month, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2">{month._id}</td>
                                            <td className="border border-gray-300 p-2">{month.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default ReportPage;
