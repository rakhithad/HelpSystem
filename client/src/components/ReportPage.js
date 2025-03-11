import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import TicketList from './TicketList'; // Import the TicketList component
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const ReportPage = () => {
    // State management
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
    const [selectedFilters, setSelectedFilters] = useState({
        status: "",
        engineer: "",
        customer: "",
        priority: "",
        rating: ""
    });
    const [mainFilter, setMainFilter] = useState("all"); // Main filter state
    const [selectedCompany, setSelectedCompany] = useState(""); // Selected company for filtering
    const [selectedEngineer, setSelectedEngineer] = useState(""); // Selected engineer for filtering

    // Fetch report data on component mount
    useEffect(() => {
        fetchReportData();
    }, []);

    // Function to fetch report data
    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/report`,
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

    // Handle main filter changes
    const handleMainFilterChange = (filterType) => {
        setMainFilter(filterType);
        setSelectedCompany(""); // Reset selected company
        setSelectedEngineer(""); // Reset selected engineer
        applyFilters(selectedFilters, filterType, "", "");
    };

    // Handle company selection for filtering
    const handleCompanyChange = (companyId) => {
        setSelectedCompany(companyId);
        applyFilters(selectedFilters, "company", companyId, selectedEngineer);
    };

    // Handle engineer selection for filtering
    const handleEngineerChange = (engineerName) => {
        setSelectedEngineer(engineerName);
        applyFilters(selectedFilters, "engineer", selectedCompany, engineerName);
    };

    // Apply all filters (main filter + additional filters)
    const applyFilters = (filters, mainFilterType, companyId, engineerName) => {
        let filtered = metrics.reportData;

        // Apply main filter
        if (mainFilterType === "company" && companyId) {
            filtered = filtered.filter(ticket => ticket.company?.companyId === companyId);
        } else if (mainFilterType === "engineer" && engineerName) {
            filtered = filtered.filter(ticket => ticket.assignedSupportEngineer?.name === engineerName);
        }

        // Apply additional filters
        if (filters.status) {
            filtered = filtered.filter(ticket => ticket.status === filters.status);
        }
        if (filters.engineer) {
            filtered = filtered.filter(ticket => ticket.assignedSupportEngineer?.name === filters.engineer);
        }
        if (filters.customer) {
            filtered = filtered.filter(ticket => ticket.customer.name === filters.customer);
        }
        if (filters.priority) {
            filtered = filtered.filter(ticket => ticket.priority === parseInt(filters.priority));
        }
        if (filters.rating) {
            filtered = filtered.filter(ticket => ticket.rating === parseInt(filters.rating));
        }

        setFilteredTickets(filtered);
    };

    // Handle additional filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...selectedFilters, [key]: value };
        setSelectedFilters(newFilters);
        applyFilters(newFilters, mainFilter, selectedCompany, selectedEngineer);
    };

    // Get unique companies and engineers from the report data
    const uniqueCompanies = metrics.reportData
        .map(ticket => ticket.company) // Extract the company field
        .filter(company => company && company.companyId) // Filter out undefined/null companies
        .filter((company, index, self) => self.findIndex(c => c.companyId === company.companyId) === index); // Remove duplicates

    const uniqueEngineers = [...new Set(metrics.reportData.map(ticket => ticket.assignedSupportEngineer?.name))].filter(Boolean);

    // Function to export filtered data to PDF
    // Function to export filtered data to PDF
const exportToPDF = () => {
    
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.setFontSize(18);
    doc.text("Ticket Report", 10, 10);

    // Define columns for the table
    const columns = [
        { header: "Ticket ID", dataKey: "tid" },
        { header: "Title", dataKey: "title" },
        { header: "Description", dataKey: "description" }, // Add description column
        { header: "Status", dataKey: "status" },
        { header: "Priority", dataKey: "priority" },
        { header: "Customer", dataKey: "customer" },
        { header: "Engineer", dataKey: "engineer" },
        { header: "Created At", dataKey: "createdAt" }
    ];

    // Map filtered tickets to the required format
    // Map filtered tickets with truncated descriptions
const rows = filteredTickets.map(ticket => ({
    tid: ticket.tid,
    title: ticket.title,
    description: ticket.description 
        ? (ticket.description.length > 100 
            ? ticket.description.substring(0, 100) + "..." 
            : ticket.description)
        : "No description",
    status: ticket.status,
    priority: ticket.priority,
    customer: ticket.customer.name,
    engineer: ticket.assignedSupportEngineer?.name || "Not Assigned",
    createdAt: new Date(ticket.createdAt).toLocaleDateString()
}));

    // Add the table to the PDF using the autoTable plugin
    autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        startY: 20, // Start below the title
        styles: { overflow: 'linebreak' }, // Handle long descriptions
        columnStyles: {
            description: { cellWidth: 'auto' } // Allow description column to have flexible width
        }
    });

    // Save the PDF
    doc.save("ticket_report.pdf");
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="container mx-auto p-8">
                {/* Header section */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">Ticket Report</h1>
                        
                        {/* Main filter dropdown and PDF export button */}
                        <div className="flex items-center space-x-4">
                            <select
                                onChange={(e) => handleMainFilterChange(e.target.value)}
                                className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All</option>
                                <option value="company">Company</option>
                                <option value="engineer">Support Engineer</option>
                            </select>

                            {/* Company dropdown (visible only when main filter is "company") */}
                            {mainFilter === "company" && (
                                <select
                                    onChange={(e) => handleCompanyChange(e.target.value)}
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={selectedCompany}
                                >
                                    <option value="">Select a Company</option>
                                    {uniqueCompanies.map(company => (
                                        <option key={company.companyId} value={company.companyId}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Engineer dropdown (visible only when main filter is "engineer") */}
                            {mainFilter === "engineer" && (
                                <select
                                    onChange={(e) => handleEngineerChange(e.target.value)}
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={selectedEngineer}
                                >
                                    <option value="">Select an Engineer</option>
                                    {uniqueEngineers.map(engineer => (
                                        <option key={engineer} value={engineer}>
                                            {engineer}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* PDF Export Button */}
                            <button
                                onClick={exportToPDF}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Export to PDF
                            </button>
                        </div>
                    </div>
                    
                    <nav className="text-white text-opacity-80">
                        <Link to="/dashboard" className="hover:text-purple-300 transition-colors">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:text-purple-300 transition-colors">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Report Page</span>
                    </nav>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Status Filter */}
                    <select
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                        value={selectedFilters.status}
                    >
                        <option value="">All Statuses</option>
                        {Object.entries(metrics.ticketsByStatus || {}).map(([status, count]) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                            </option>
                        ))}
                    </select>

                    {/* Engineer Filter */}
                    <select
                        onChange={(e) => handleFilterChange('engineer', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                        value={selectedFilters.engineer}
                    >
                        <option value="">All Engineers</option>
                        {Object.entries(metrics.ticketsByEngineer || {}).map(([engineer, count]) => (
                            <option key={engineer} value={engineer}>
                                {engineer} ({count})
                            </option>
                        ))}
                    </select>

                    {/* Customer Filter */}
                    <select
                        onChange={(e) => handleFilterChange('customer', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                        value={selectedFilters.customer}
                    >
                        <option value="">All Customers</option>
                        {Object.entries(metrics.ticketsByCustomer || {}).map(([customer, count]) => (
                            <option key={customer} value={customer}>
                                {customer} ({count})
                            </option>
                        ))}
                    </select>

                    {/* Priority Filter */}
                    <select
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                        value={selectedFilters.priority}
                    >
                        <option value="">All Priorities</option>
                        {Object.entries(metrics.ticketsByPriority || {}).map(([priority, count]) => (
                            <option key={priority} value={priority}>
                                Priority {priority} ({count})
                            </option>
                        ))}
                    </select>

                    {/* Rating Filter */}
                    <select
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                        value={selectedFilters.rating}
                    >
                        <option value="">All Ratings</option>
                        {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                                {rating} Star{rating > 1 ? 's' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Display filtered tickets */}
                <TicketList tickets={filteredTickets} />
            </div>
        </div>
    );
};

export default ReportPage;