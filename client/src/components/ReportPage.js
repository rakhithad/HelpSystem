import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FaFilter, FaFileExport, FaChartBar, FaSync, FaBars, FaHome, FaUser, FaSpinner, FaTimes, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ReportPage = () => {
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
    const [success, setSuccess] = useState(null);
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'tid', direction: 'asc' });
    const navigate = useNavigate();

    // Redirect to login if no token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar-container');
            const toggleButton = document.querySelector('.sidebar-toggle');
            if (
                window.innerWidth < 1024 &&
                isSidebarOpen &&
                sidebar &&
                !sidebar.contains(event.target) &&
                toggleButton &&
                !toggleButton.contains(event.target)
            ) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    // Disable body scroll when sidebar or modal is open on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            document.body.style.overflow = (isSidebarOpen || isModalOpen) ? 'hidden' : 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen, isModalOpen]);

    // Fetch report data
    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/report`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (response.data && Array.isArray(response.data.reportData)) {
                setMetrics(response.data);
                setFilteredTickets(response.data.reportData);
                setSuccess("Report data loaded successfully!");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching report data:", err);
            const errorMessage = err.response?.data?.message || "Failed to fetch report data.";
            setError(errorMessage);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleMainFilterChange = (filterType) => {
        setMainFilter(filterType);
        setSelectedCompany("");
        setSelectedEngineer("");
        applyFilters(selectedFilters, filterType, "", "");
    };

    const handleCompanyChange = (companyId) => {
        setSelectedCompany(companyId);
        applyFilters(selectedFilters, "company", companyId, selectedEngineer);
    };

    const handleEngineerChange = (engineerName) => {
        setSelectedEngineer(engineerName);
        applyFilters(selectedFilters, "engineer", selectedCompany, engineerName);
    };

    const handleCustomDateChange = (type, value) => {
        const newDateRange = { ...dateRange, [type]: value };
        setDateRange(newDateRange);
        if (newDateRange.startDate && newDateRange.endDate) {
            applyFilters(selectedFilters, mainFilter, selectedCompany, selectedEngineer, newDateRange);
        }
    };

    const applyFilters = (filters, mainFilterType, companyId, engineerName, customDateRange = null) => {
        let filtered = [...(metrics.reportData || [])];
        if (mainFilterType === "company" && companyId) {
            filtered = filtered.filter(ticket => ticket.company?.companyId === companyId);
        } else if (mainFilterType === "engineer" && engineerName) {
            filtered = filtered.filter(ticket => 
                engineerName === "Not Assigned" 
                    ? !ticket.assignedSupportEngineer?.name
                    : ticket.assignedSupportEngineer?.name === engineerName
            );
        }
        if (filters.status) {
            filtered = filtered.filter(ticket => ticket.status === filters.status);
        }
        if (filters.engineer) {
            filtered = filtered.filter(ticket => 
                filters.engineer === "Not Assigned"
                    ? !ticket.assignedSupportEngineer?.name
                    : ticket.assignedSupportEngineer?.name === filters.engineer
            );
        }
        if (filters.customer) {
            filtered = filtered.filter(ticket => ticket.customer?.name === filters.customer);
        }
        if (filters.priority) {
            filtered = filtered.filter(ticket => ticket.priority.toLowerCase() === filters.priority.toLowerCase());
        }
        if (filters.rating) {
            filtered = filtered.filter(ticket => ticket.rating === parseInt(filters.rating));
        }
        if (customDateRange?.startDate && customDateRange?.endDate) {
            const startDate = new Date(customDateRange.startDate);
            const endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt);
                return ticketDate >= startDate && ticketDate <= endDate;
            });
        }
        setFilteredTickets(filtered);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...selectedFilters, [key]: value };
        setSelectedFilters(newFilters);
        applyFilters(newFilters, mainFilter, selectedCompany, selectedEngineer);
    };

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
        setFilteredTickets(metrics.reportData || []);
    };

    const uniqueCompanies = [...new Set(
        (metrics.reportData || [])
            .filter(ticket => ticket.company?.companyId)
            .map(ticket => JSON.stringify({ companyId: ticket.company.companyId, name: ticket.company.name }))
    )].map(str => JSON.parse(str));

    const uniqueEngineers = [...new Set(
        (metrics.reportData || []).map(ticket => 
            ticket.assignedSupportEngineer?.name || "Not Assigned"
        )
    )].filter(name => name);

    const calculateStats = () => {
        if (!filteredTickets.length) return {};
        const resolutionTimes = filteredTickets
            .filter(ticket => ticket.status === "closed" && ticket.resolvedAt)
            .map(ticket => {
                const created = new Date(ticket.createdAt);
                const resolved = new Date(ticket.resolvedAt);
                return (resolved - created) / (1000 * 60 * 60);
            });
        const avgResolutionTime = resolutionTimes.length 
            ? resolutionTimes.reduce((acc, time) => acc + time, 0) / resolutionTimes.length
            : 0;
        const ratedTickets = filteredTickets.filter(ticket => ticket.rating);
        const avgRating = ratedTickets.length
            ? ratedTickets.reduce((acc, ticket) => acc + ticket.rating, 0) / ratedTickets.length
            : 0;
        const statusCounts = filteredTickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});
        const priorityCounts = filteredTickets.reduce((acc, ticket) => {
            const priority = ticket.priority.toLowerCase();
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTickets = useMemo(() => {
        const sorted = [...filteredTickets];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aValue, bValue;
                switch (sortConfig.key) {
                    case 'tid':
                        aValue = a.tid;
                        bValue = b.tid;
                        break;
                    case 'title':
                        aValue = a.title.toLowerCase();
                        bValue = b.title.toLowerCase();
                        break;
                    case 'company':
                        aValue = a.company?.name?.toLowerCase() || '';
                        bValue = b.company?.name?.toLowerCase() || '';
                        break;
                    case 'engineer':
                        aValue = a.assignedSupportEngineer?.name?.toLowerCase() || '';
                        bValue = b.assignedSupportEngineer?.name?.toLowerCase() || '';
                        break;
                    case 'createdAt':
                        aValue = new Date(a.createdAt);
                        bValue = new Date(b.createdAt);
                        break;
                    default:
                        return 0;
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [filteredTickets, sortConfig]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Set default font
        doc.setFont('helvetica', 'normal');

        // Cover Page
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(30);
        doc.setFont('helvetica', 'bold');
        doc.text('HelpDesk Ticket Report', pageWidth / 2, 50, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 70, { align: 'center' });
        doc.text('HelpDesk System', pageWidth / 2, 90, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Confidential - For Internal Use Only', pageWidth / 2, pageHeight - 30, { align: 'center' });
        doc.addPage();

        // Table of Contents
        doc.setFontSize(18);
        doc.setTextColor(99, 102, 241);
        doc.text('Table of Contents', 20, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.textWithLink('1. Summary Statistics', 30, 40, { pageNumber: 3 });
        doc.textWithLink('2. Ticket Details', 30, 50, { pageNumber: 4 });
        doc.addPage();

        // Summary Statistics
        doc.setFontSize(18);
        doc.setTextColor(99, 102, 241);
        doc.text('Summary Statistics', 20, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        let yPos = 30;
        if (stats.total) {
            doc.text(`Total Tickets: ${stats.total}`, 30, yPos);
            yPos += 10;
            doc.text(`Average Resolution Time: ${stats.avgResolutionTime} hours`, 30, yPos);
            yPos += 10;
            doc.text(`Average Customer Satisfaction: ${stats.avgRating}/5`, 30, yPos);
            yPos += 10;
            doc.text('Status Distribution:', 30, yPos);
            yPos += 10;
            Object.entries(stats.statusCounts || {}).forEach(([status, count]) => {
                doc.text(`- ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 40, yPos);
                yPos += 10;
            });
            doc.text('Priority Distribution:', 30, yPos);
            yPos += 10;
            Object.entries(stats.priorityCounts || {}).forEach(([priority, count]) => {
                doc.text(`- ${priority.charAt(0).toUpperCase() + priority.slice(1)}: ${count}`, 40, yPos);
                yPos += 10;
            });
        } else {
            doc.text('No statistics available.', 30, yPos);
        }
        doc.addPage();

        // Ticket Details
        doc.setFontSize(18);
        doc.setTextColor(99, 102, 241);
        doc.text('Ticket Details', 20, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Filter Information
        let filterText = "Filters Applied: ";
        if (mainFilter === "company" && selectedCompany) {
            const company = uniqueCompanies.find(c => c.companyId === selectedCompany);
            filterText += `Company: ${company?.name || "Unknown"}, `;
        }
        if (mainFilter === "engineer" && selectedEngineer) {
            filterText += `Engineer: ${selectedEngineer}, `;
        }
        if (selectedFilters.status) filterText += `Status: ${selectedFilters.status}, `;
        if (selectedFilters.priority) filterText += `Priority: ${selectedFilters.priority}, `;
        if (dateRange.startDate && dateRange.endDate) {
            filterText += `Date: ${dateRange.startDate} to ${dateRange.endDate}, `;
        }
        filterText = filterText === "Filters Applied: " ? "No filters applied" : filterText.slice(0, -2);
        doc.text(filterText, 20, 30);

        // Ticket Table
        const columns = [
            { header: 'ID', dataKey: 'tid' },
            { header: 'Title', dataKey: 'title' },
            { header: 'Company', dataKey: 'company' },
            { header: 'Engineer', dataKey: 'engineer' },
            { header: 'Customer', dataKey: 'customer' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Priority', dataKey: 'priority' },
            { header: 'Created', dataKey: 'createdAt' },
            { header: 'Review', dataKey: 'review' },
            { header: 'Rating', dataKey: 'rating' }
        ];
        const rows = filteredTickets.map(ticket => ({
            tid: ticket.tid,
            title: ticket.title,
            company: ticket.company?.name || 'No Company',
            engineer: ticket.assignedSupportEngineer?.name || 'Not Assigned',
            customer: ticket.customer?.name || 'Unknown',
            status: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
            priority: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
            createdAt: new Date(ticket.createdAt).toLocaleDateString(),
            review: ticket.review || 'No Review',
            rating: ticket.rating ? `${ticket.rating}/5` : 'N/A'
        }));

        autoTable(doc, {
            head: [columns.map(col => col.header)],
            body: rows.map(row => columns.map(col => row[col.dataKey])),
            startY: 40,
            styles: {
                overflow: 'linebreak',
                fontSize: 8,
                textColor: [0, 0, 0],
                fillColor: [255, 255, 255],
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                tid: { cellWidth: 15 },
                title: { cellWidth: 30 },
                company: { cellWidth: 25 },
                engineer: { cellWidth: 25 },
                customer: { cellWidth: 25 },
                status: { cellWidth: 20 },
                priority: { cellWidth: 20 },
                createdAt: { cellWidth: 20 },
                review: { cellWidth: 30 },
                rating: { cellWidth: 15 }
            },
            theme: 'grid',
            alternateRowStyles: { fillColor: [240, 240, 240] },
            didDrawPage: (data) => {
                // Footer
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Page ${data.pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
                doc.text('HelpDesk System', 20, pageHeight - 10);
            }
        });

        doc.save("ticket_report.pdf");
    };

    const openTicketModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const closeTicketModal = () => {
        setSelectedTicket(null);
        setIsModalOpen(false);
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-red-500 bg-opacity-20 text-red-300';
            case 'medium':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
            case 'low':
                return 'bg-green-500 bg-opacity-20 text-green-300';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-300';
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'open':
                return 'bg-blue-500 bg-opacity-20 text-blue-300';
            case 'in-progress':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
            case 'closed':
                return 'bg-green-500 bg-opacity-20 text-green-300';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-300';
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="inline ml-1 w-4 h-4" />;
        return sortConfig.direction === 'asc' ? (
            <FaSortUp className="inline ml-1 w-4 h-4" />
        ) : (
            <FaSortDown className="inline ml-1 w-4 h-4" />
        );
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className="flex-1 pb-20 overflow-y-auto lg:ml-72">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                                Ticket Report
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center relative group"
                                    title="Toggle Filters"
                                >
                                    <FaFilter className="mr-2 w-4 h-4" />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                    <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        Toggle Filters
                                    </span>
                                </button>
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center relative group"
                                    title="Toggle Statistics"
                                >
                                    <FaChartBar className="mr-2 w-4 h-4" />
                                    {showStats ? 'Hide Stats' : 'Show Stats'}
                                    <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        Toggle Statistics
                                    </span>
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center relative group"
                                    title="Export to PDF"
                                >
                                    <FaFileExport className="mr-2 w-4 h-4" />
                                    Export PDF
                                    <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        Export to PDF
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        fetchReportData();
                                        resetFilters();
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center relative group"
                                    disabled={isLoading}
                                    title="Refresh Data"
                                >
                                    <FaSync className={`mr-2 w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                                    Refresh
                                    <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        Refresh Data
                                    </span>
                                </button>
                            </div>
                        </div>
                        <nav className="text-gray-300 text-sm mt-2">
                            <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                                Dashboard
                            </Link>
                            {' / '}
                            <span className="text-purple-300">Ticket Report</span>
                        </nav>
                    </div>
                    {error && (
                        <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 text-sm text-center text-green-400 bg-green-900 bg-opacity-50 rounded-xl mb-6">
                            {success}
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
                        </div>
                    )}
                    {!isLoading && (
                        <>
                            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg mb-6">
                                <h2 className="text-xl font-semibold text-gray-200 mb-4">Summary</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-center">
                                        <div className="text-sm text-gray-300">Total Tickets</div>
                                        <div className="text-2xl font-bold text-white">{stats.total || 0}</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-center">
                                        <div className="text-sm text-gray-300">Avg. Resolution Time</div>
                                        <div className="text-2xl font-bold text-white">{stats.avgResolutionTime || 0} hrs</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-center">
                                        <div className="text-sm text-gray-300">Avg. Rating</div>
                                        <div className="text-2xl font-bold text-white">{stats.avgRating || 0}/5</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-center">
                                        <div className="text-sm text-gray-300">Open Tickets</div>
                                        <div className="text-2xl font-bold text-white">{stats.statusCounts?.open || 0}</div>
                                    </div>
                                </div>
                            </div>
                            {showStats && (
                                <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg mb-6">
                                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Detailed Statistics</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-900 bg-opacity-50 p-4 rounded-xl">
                                            <h3 className="text-md font-semibold text-gray-200 mb-2">Status Distribution</h3>
                                            <div className="space-y-2">
                                                {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
                                                    <div key={status} className="flex items-center">
                                                        <div className="w-24 text-sm text-gray-300">
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </div>
                                                        <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden">
                                                            <div 
                                                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" 
                                                                style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="w-12 text-right text-sm text-gray-300">{count}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 bg-opacity-50 p-4 rounded-xl">
                                            <h3 className="text-md font-semibold text-gray-200 mb-2">Priority Distribution</h3>
                                            <div className="space-y-2">
                                                {Object.entries(stats.priorityCounts || {}).map(([priority, count]) => (
                                                    <div key={priority} className="flex items-center">
                                                        <div className="w-24 text-sm text-gray-300">
                                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                        </div>
                                                        <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${getPriorityColor(priority)}`} 
                                                                style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="w-12 text-right text-sm text-gray-300">{count}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {showFilters && (
                                <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-200">Filter Options</h2>
                                        <button 
                                            onClick={resetFilters}
                                            className="text-purple-300 hover:text-white text-sm font-medium hover:underline"
                                        >
                                            Reset All Filters
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Main Filter</label>
                                            <select
                                                value={mainFilter}
                                                onChange={(e) => handleMainFilterChange(e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <option value="all">All Tickets</option>
                                                <option value="company">Filter by Company</option>
                                                <option value="engineer">Filter by Support Engineer</option>
                                            </select>
                                        </div>
                                        {mainFilter === "company" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-200 mb-1">Select Company</label>
                                                <select
                                                    value={selectedCompany}
                                                    onChange={(e) => handleCompanyChange(e.target.value)}
                                                    className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
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
                                        {mainFilter === "engineer" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-200 mb-1">Select Engineer</label>
                                                <select
                                                    value={selectedEngineer}
                                                    onChange={(e) => handleEngineerChange(e.target.value)}
                                                    className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={dateRange.startDate}
                                                onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={dateRange.endDate}
                                                onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Ticket Status</label>
                                            <select
                                                value={selectedFilters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <option value="">All Statuses</option>
                                                {Object.entries(metrics.ticketsByStatus || {}).map(([status, count]) => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Support Engineer</label>
                                            <select
                                                value={selectedFilters.engineer}
                                                onChange={(e) => handleFilterChange('engineer', e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <option value="">All Engineers</option>
                                                {uniqueEngineers.map(engineer => (
                                                    <option key={engineer} value={engineer}>
                                                        {engineer} ({metrics.ticketsByEngineer?.[engineer] || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Customer</label>
                                            <select
                                                value={selectedFilters.customer}
                                                onChange={(e) => handleFilterChange('customer', e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <option value="">All Customers</option>
                                                {Object.entries(metrics.ticketsByCustomer || {}).map(([customer, count]) => (
                                                    <option key={customer} value={customer}>
                                                        {customer} ({count})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Priority Level</label>
                                            <select
                                                value={selectedFilters.priority}
                                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
                                            >
                                                <option value="">All Priorities</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Customer Rating</label>
                                            <select
                                                value={selectedFilters.rating}
                                                onChange={(e) => handleFilterChange('rating', e.target.value)}
                                                className="w-full p-2 rounded-lg bg-gray-900 bg-opacity-50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-600 border-opacity-30 transition-all duration-300"
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
                            <div className="overflow-x-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-lg">
                                {metrics.reportData.length === 0 ? (
                                    <p className="text-gray-300 p-6 text-center">No tickets available.</p>
                                ) : sortedTickets.length > 0 ? (
                                    <table className="w-full text-sm sm:text-base text-left text-gray-200">
                                        <thead className="bg-gray-900 bg-opacity-50">
                                            <tr>
                                                <th 
                                                    className="px-4 py-3 sm:px-6 cursor-pointer hover:text-purple-300"
                                                    onClick={() => handleSort('tid')}
                                                >
                                                    ID {getSortIcon('tid')}
                                                </th>
                                                <th 
                                                    className="px-4 py-3 sm:px-6 cursor-pointer hover:text-purple-300"
                                                    onClick={() => handleSort('title')}
                                                >
                                                    Title {getSortIcon('title')}
                                                </th>
                                                <th 
                                                    className="px-4 py-3 sm:px-6 cursor-pointer hover:text-purple-300"
                                                    onClick={() => handleSort('company')}
                                                >
                                                    Company {getSortIcon('company')}
                                                </th>
                                                <th 
                                                    className="px-4 py-3 sm:px-6 cursor-pointer hover:text-purple-300"
                                                    onClick={() => handleSort('engineer')}
                                                >
                                                    Engineer {getSortIcon('engineer')}
                                                </th>
                                                <th 
                                                    className="px-4 py-3 sm:px-6 cursor-pointer hover:text-purple-300"
                                                    onClick={() => handleSort('createdAt')}
                                                >
                                                    Created {getSortIcon('createdAt')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedTickets.map((ticket) => (
                                                <tr
                                                    key={ticket._id}
                                                    className="hover:bg-gray-700 hover:bg-opacity-50 border-t border-purple-600 border-opacity-30 transition-all duration-300 cursor-pointer"
                                                    onClick={() => openTicketModal(ticket)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            openTicketModal(ticket);
                                                        }
                                                    }}
                                                >
                                                    <td className="px-4 py-4 sm:px-6 truncate max-w-[100px] sm:max-w-[150px]">
                                                        {ticket.tid}
                                                    </td>
                                                    <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                        {ticket.title}
                                                    </td>
                                                    <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                        {ticket.company?.name || 'No Company'}
                                                    </td>
                                                    <td className="px-4 py-4 sm:px-6 truncate max-w-[150px] sm:max-w-[200px]">
                                                        {ticket.assignedSupportEngineer?.name || 'Not Assigned'}
                                                    </td>
                                                    <td className="px-4 py-4 sm:px-6">
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-gray-300 text-center py-8">
                                        No tickets match the selected filters.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {isModalOpen && selectedTicket && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-200">Ticket Details</h2>
                                    <button
                                        onClick={closeTicketModal}
                                        className="text-purple-300 hover:text-white transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <FaTimes className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="font-medium text-gray-200">ID: </span>
                                        <span className="text-gray-300">{selectedTicket.tid}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Title: </span>
                                        <span className="text-gray-300">{selectedTicket.title}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Description: </span>
                                        <span className="text-gray-300">{selectedTicket.description || 'No description'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Status: </span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Priority: </span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Company: </span>
                                        <span className="text-gray-300">{selectedTicket.company?.name || 'No Company'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Customer: </span>
                                        <span className="text-gray-300">{selectedTicket.customer?.name || 'Unknown'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Engineer: </span>
                                        <span className="text-gray-300">{selectedTicket.assignedSupportEngineer?.name || 'Not Assigned'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-200">Created: </span>
                                        <span className="text-gray-300">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                    {selectedTicket.review && (
                                        <div>
                                            <span className="font-medium text-gray-200">Review: </span>
                                            <span className="text-gray-300">{selectedTicket.review}</span>
                                        </div>
                                    )}
                                    {selectedTicket.rating && (
                                        <div>
                                            <span className="font-medium text-gray-200">Rating: </span>
                                            <span className="text-gray-300">{selectedTicket.rating} Star{selectedTicket.rating > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-600 border-opacity-30 z-50">
                <div className="flex justify-around items-center p-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 text-purple-400 hover:text-white transition-colors sidebar-toggle"
                        aria-label="Toggle sidebar"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                        aria-label="Go to dashboard"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/account')}
                        className="p-3 text-purple-400 hover:text-white transition-colors"
                        aria-label="Go to account"
                    >
                        <FaUser className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;