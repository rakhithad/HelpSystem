import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FaFilter, FaFileExport, FaChartBar, FaSync } from 'react-icons/fa';

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
    const [mainFilter, setMainFilter] = useState("all");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedEngineer, setSelectedEngineer] = useState("");
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [showStats, setShowStats] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

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
        setSelectedCompany("");
        setSelectedEngineer("");
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

    const handleCustomDateChange = (type, value) => {
        const newDateRange = { ...dateRange, [type]: value };
        setDateRange(newDateRange);
        
        // Only apply if both dates are selected
        if (newDateRange.startDate && newDateRange.endDate) {
            applyFilters(selectedFilters, mainFilter, selectedCompany, selectedEngineer, newDateRange);
        }
    };

    // Apply all filters (main filter + additional filters)
    const applyFilters = (filters, mainFilterType, companyId, engineerName, customDateRange = null) => {
        let filtered = metrics.reportData;
    
        // Apply main filter
        if (mainFilterType === "company" && companyId) {
            filtered = filtered.filter(ticket => ticket.company?.companyId === companyId);
        } else if (mainFilterType === "engineer" && engineerName) {
            filtered = filtered.filter(ticket => 
                engineerName === "Not Assigned" 
                    ? !ticket.assignedSupportEngineer || !ticket.assignedSupportEngineer.name
                    : ticket.assignedSupportEngineer?.name === engineerName
            );
        }
    
        // Apply additional filters
        if (filters.status) {
            filtered = filtered.filter(ticket => ticket.status === filters.status);
        }
        if (filters.engineer) {
            filtered = filtered.filter(ticket => 
                filters.engineer === "Not Assigned"
                    ? !ticket.assignedSupportEngineer || !ticket.assignedSupportEngineer.name
                    : ticket.assignedSupportEngineer?.name === filters.engineer
            );
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
    
        // Date filtering for custom range
        if (customDateRange?.startDate && customDateRange?.endDate) {
            const startDate = new Date(customDateRange.startDate);
            const endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999); // End of the selected day
            
            filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt);
                return ticketDate >= startDate && ticketDate <= endDate;
            });
        }
    
        setFilteredTickets(filtered);
    };                

    // Handle additional filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...selectedFilters, [key]: value };
        setSelectedFilters(newFilters);
        applyFilters(newFilters, mainFilter, selectedCompany, selectedEngineer);
    };

    // Reset all filters
    const resetFilters = () => {
        setSelectedFilters({
            status: "",
            engineer: "",
            customer: "",
            priority: "",
            rating: ""
        });
        setMainFilter("all");
        setSelectedCompany("");
        setSelectedEngineer("");
        setDateRange({
            startDate: "",
            endDate: ""
        });
        setFilteredTickets(metrics.reportData);
    };

    // Get unique companies and engineers from the report data
    const uniqueCompanies = metrics.reportData
        .map(ticket => ticket.company)
        .filter(company => company && company.companyId)
        .filter((company, index, self) => self.findIndex(c => c.companyId === company.companyId) === index);

        const uniqueEngineers = [...new Set(
            metrics.reportData.map(ticket => 
                ticket.assignedSupportEngineer?.name || "not_assigned"
            )
        )].filter(name => name !== "not_assigned"); // We'll handle "not_assigned" separately

    // Calculate summary statistics for filtered tickets
    const calculateStats = () => {
        if (!filteredTickets.length) return {};
        
        // Calculate average resolution time
        const resolutionTimes = filteredTickets
            .filter(ticket => ticket.status === "closed" && ticket.resolvedAt)
            .map(ticket => {
                const created = new Date(ticket.createdAt);
                const resolved = new Date(ticket.resolvedAt);
                return (resolved - created) / (1000 * 60 * 60); // hours
            });
        
        const avgResolutionTime = resolutionTimes.length 
            ? resolutionTimes.reduce((acc, time) => acc + time, 0) / resolutionTimes.length
            : 0;
            
        // Calculate satisfaction score
        const ratedTickets = filteredTickets.filter(ticket => ticket.rating);
        const avgRating = ratedTickets.length
            ? ratedTickets.reduce((acc, ticket) => acc + ticket.rating, 0) / ratedTickets.length
            : 0;
            
        // Status distribution
        const statusCounts = filteredTickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});
        
        // Priority distribution
        const priorityCounts = filteredTickets.reduce((acc, ticket) => {
            const priority = ticket.priority.toString();
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total: filteredTickets.length,
            avgResolutionTime: avgResolutionTime.toFixed(2),
            avgRating: avgRating.toFixed(1),
            statusCounts,
            priorityCounts
        };
    };
    
    const stats = calculateStats();

    // Function to export filtered data to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add a title and metadata to the PDF
        doc.setFontSize(18);
        doc.text("Ticket Report", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
        
        // Add filtering information
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, 25);
        
        let filterText = "Filters: ";
        if (mainFilter === "company" && selectedCompany) {
            const company = uniqueCompanies.find(c => c.companyId === selectedCompany);
            filterText += `Company: ${company?.name || "Unknown"}, `;
        }
        if (mainFilter === "engineer" && selectedEngineer) {
            filterText += `Engineer: ${selectedEngineer}, `;
        }
        if (selectedFilters.status) filterText += `Status: ${selectedFilters.status}, `;
        if (selectedFilters.priority) filterText += `Priority: ${selectedFilters.priority}, `;
        
        // Trim trailing comma and space
        filterText = filterText === "Filters: " ? "No filters applied" : filterText.slice(0, -2);
        
        doc.text(filterText, 10, 30);
        
        // Add summary statistics if available
        if (stats.total) {
            doc.text(`Total Tickets: ${stats.total}`, 10, 35);
            doc.text(`Avg. Resolution Time: ${stats.avgResolutionTime} hours`, 10, 40);
            doc.text(`Avg. Customer Satisfaction: ${stats.avgRating}/5`, 10, 45);
        }

        // Define columns for the table
        const columns = [
            { header: "ID", dataKey: "tid" },
            { header: "Title", dataKey: "title" },
            { header: "Status", dataKey: "status" },
            { header: "Priority", dataKey: "priority" },
            { header: "Customer", dataKey: "customer" },
            { header: "Engineer", dataKey: "engineer" },
            { header: "Created", dataKey: "createdAt" },
            { header: "Description", dataKey: "description" },
        ];

        // Map filtered tickets with truncated descriptions
        const rows = filteredTickets.map(ticket => ({
            tid: ticket.tid,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            customer: ticket.customer.name,
            engineer: ticket.assignedSupportEngineer?.name || "Not Assigned",
            createdAt: new Date(ticket.createdAt).toLocaleDateString(),
            description: ticket.description 
                ? (ticket.description.length > 60 
                    ? ticket.description.substring(0, 60) + "..." 
                    : ticket.description)
                : "No description",
        }));

        // Add the table to the PDF using the autoTable plugin
        autoTable(doc, {
            head: [columns.map(col => col.header)],
            body: rows.map(row => columns.map(col => row[col.dataKey])),
            startY: 50,
            styles: { overflow: 'linebreak', fontSize: 8 },
            columnStyles: {
                tid: { cellWidth: 15 },
                title: { cellWidth: 40 },
                status: { cellWidth: 20 },
                priority: { cellWidth: 15 },
                customer: { cellWidth: 25 },
                engineer: { cellWidth: 25 },
                createdAt: { cellWidth: 20 },
                description: { cellWidth: 40 }
            },
            theme: 'grid'
        });

        // Save the PDF
        doc.save("ticket_report.pdf");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="container mx-auto p-4 md:p-8">
                {/* Header section */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-0">Ticket Report</h1>
                        
                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                                <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                            
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <FaChartBar /> {showStats ? 'Hide Stats' : 'Show Stats'}
                            </button>
                            
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                                <FaFileExport /> Export PDF
                            </button>
                            
                            <button
                                onClick={() => {
                                    fetchReportData();
                                    resetFilters();
                                }}
                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                disabled={isLoading}
                            >
                                <FaSync className={isLoading ? "animate-spin" : ""} /> Refresh
                            </button>
                        </div>
                    </div>
                    
                    <nav className="text-white text-opacity-80 text-sm md:text-base">
                        <Link to="/dashboard" className="hover:text-purple-300 transition-colors">Dashboard</Link> {' / '}
                        <Link to="/admin-dashboard" className="hover:text-purple-300 transition-colors">Admin Dashboard</Link> {' / '}
                        <span className="text-purple-300">Report Page</span>
                    </nav>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-600 bg-opacity-70 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Statistics section */}
                {showStats && (
                    <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl mb-6 text-white">
                        <h2 className="text-xl font-semibold mb-4">Report Statistics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-purple-800 bg-opacity-50 p-4 rounded-xl">
                                <div className="text-sm text-purple-200">Total Tickets</div>
                                <div className="text-2xl font-bold">{stats.total || 0}</div>
                            </div>
                            <div className="bg-blue-800 bg-opacity-50 p-4 rounded-xl">
                                <div className="text-sm text-blue-200">Avg. Resolution Time</div>
                                <div className="text-2xl font-bold">{stats.avgResolutionTime || 0} hours</div>
                            </div>
                            <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-xl">
                                <div className="text-sm text-indigo-200">Customer Satisfaction</div>
                                <div className="text-2xl font-bold">{stats.avgRating || 0}/5</div>
                            </div>
                            <div className="bg-violet-800 bg-opacity-50 p-4 rounded-xl">
                                <div className="text-sm text-violet-200">Open Tickets</div>
                                <div className="text-2xl font-bold">{stats.statusCounts?.open || 0}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status distribution */}
                            <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                                <h3 className="text-md font-semibold mb-2">Status Distribution</h3>
                                <div className="space-y-2">
                                    {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
                                        <div key={status} className="flex items-center">
                                            <div className="w-24 text-sm">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                                            <div className="flex-1 bg-gray-300 bg-opacity-20 h-4 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-blue-500 h-full rounded-full" 
                                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-12 text-right text-sm">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Priority distribution */}
                            <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                                <h3 className="text-md font-semibold mb-2">Priority Distribution</h3>
                                <div className="space-y-2">
                                    {Object.entries(stats.priorityCounts || {}).sort((a, b) => b[0] - a[0]).map(([priority, count]) => (
                                        <div key={priority} className="flex items-center">
                                            <div className="w-24 text-sm">Priority {priority}</div>
                                            <div className="flex-1 bg-gray-300 bg-opacity-20 h-4 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        priority === "1" ? "bg-green-500" : 
                                                        priority === "2" ? "bg-yellow-500" : 
                                                        priority === "3" ? "bg-orange-500" : 
                                                        "bg-red-500"
                                                    }`}
                                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-12 text-right text-sm">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters section */}
                {showFilters && (
                    <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Filter Options</h2>
                            <button 
                                onClick={resetFilters}
                                className="text-purple-300 hover:text-white text-sm"
                            >
                                Reset All Filters
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Main filter dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Main Filter</label>
                                <select
                                    onChange={(e) => handleMainFilterChange(e.target.value)}
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                    value={mainFilter}
                                >
                                    <option value="all">All Tickets</option>
                                    <option value="company">Filter by Company</option>
                                    <option value="engineer">Filter by Support Engineer</option>
                                </select>
                            </div>

                            {/* Company dropdown (visible only when main filter is "company") */}
                            {mainFilter === "company" && (
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">Select Company</label>
                                    <select
                                        onChange={(e) => handleCompanyChange(e.target.value)}
                                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                        value={selectedCompany}
                                    >
                                        <option value="">Select a Company</option>
                                        {uniqueCompanies.map(company => (
                                            <option key={company.companyId} value={company.companyId}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Engineer dropdown (visible only when main filter is "engineer") */}
                            {mainFilter === "engineer" && (
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">Select Engineer</label>
                                    <select
                                        onChange={(e) => handleEngineerChange(e.target.value)}
                                        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                        value={selectedEngineer}
                                    >
                                        <option value="">Select an Engineer</option>
                                        {uniqueEngineers.map(engineer => (
                                            <option key={engineer} value={engineer}>
                                                {engineer}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Custom date range pickers */}
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                                    className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Ticket Status</label>
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
                            </div>

                            {/* Engineer Filter */}
                            <div>
    <label className="block text-sm font-medium text-purple-200 mb-1">Support Engineer</label>
    <select
        onChange={(e) => handleFilterChange('engineer', e.target.value)}
        className="bg-white bg-opacity-20 backdrop-blur-md text-white border-none p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
        value={selectedFilters.engineer}
    >
        <option value="">All Engineers</option>
        <option value="Not Assigned">Not Assigned</option>
        {Object.entries(metrics.ticketsByEngineer || {}).map(([engineer, count]) => (
            <option key={engineer} value={engineer}>
                {engineer} ({count})
            </option>
        ))}
    </select>
</div>

                            {/* Customer Filter */}
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Customer</label>
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
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Priority Level</label>
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
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Customer Rating</label>
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
                        </div>
                    </div>
                )}

                {/* Display filtered tickets in a table */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl overflow-x-auto">
                    {filteredTickets.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 divide-opacity-25">
                            <thead className="bg-white bg-opacity-10">
    <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Company</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Priority</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Customer</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Engineer</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Created</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
    </tr>
</thead>
<tbody className="divide-y divide-gray-200 divide-opacity-25">
    {filteredTickets.map((ticket) => (
        <tr key={ticket._id} className="hover:bg-white hover:bg-opacity-10 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{ticket.tid}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{ticket.title}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {ticket.company?.name || 'No Company'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'open' ? 'bg-blue-500' :
                    ticket.status === 'in-progress' ? 'bg-yellow-500' :
                    ticket.status === 'closed' ? 'bg-green-500' :
                    'bg-gray-500'
                }`}>
                    {ticket.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.priority === 1 ? 'bg-green-500' :
                    ticket.priority === 2 ? 'bg-yellow-500' :
                    ticket.priority === 3 ? 'bg-orange-500' :
                    'bg-red-500'
                }`}>
                    {ticket.priority}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{ticket.customer.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {ticket.assignedSupportEngineer?.name || 'Not Assigned'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {new Date(ticket.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-sm text-white">
                {ticket.description ? (
                    ticket.description.length > 60 ? 
                    `${ticket.description.substring(0, 60)}...` : 
                    ticket.description
                ) : 'No description'}
            </td>
        </tr>
    ))}
</tbody>
                        </table>
                    ) : (
                        <div className="text-white text-center py-8">
                            No tickets match the selected filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPage;