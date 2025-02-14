import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CreateTicket from './components/CreateTicket';
import Dashboard from './components/Dashboard';
import ViewTickets from './components/ViewTickets';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import ManageUsers from './components/ManageUsers';
import Account from './components/Account';
import CreateCompany from './components/CreateCompany';
import ReportPage from './components/ReportPage';
import ReviewTicketPage from './components/ReviewTicketPage';
import ManageTickets from './components/ManageTickets';
import HomePage from './components/HomePage';
import ViewReviewsPage from './components/ViewReviewsPage';

const App = () => {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token'); // Check for token in localStorage
        return !!token; // Return true if token exists
    };

    const ExcludeSidebarRoutes = ["/login", "/home", "/report", "/view-reviews"]; // Routes where sidebar should not appear

    const MainContent = () => {
        const location = useLocation(); // Get the current route

        const showSidebar = !ExcludeSidebarRoutes.includes(location.pathname); // Determine if sidebar should be shown

        return (
            <div>
                {/* Conditionally render Sidebar */}
                {showSidebar && <Sidebar />}
                <div>
                    <Routes>
                        {/* Redirect to Dashboard or Login based on authentication */}
                        <Route
                            path="/"
                            element={
                                isAuthenticated() ? (
                                    <Navigate to="/dashboard" />
                                ) : (
                                    <Navigate to="/home" />
                                )
                            }
                        />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/create-ticket" element={<CreateTicket />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/view-tickets" element={<ViewTickets />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/create-company" element={<CreateCompany />} />
                        <Route path="/report" element={<ReportPage />} />
                        <Route path="/review-ticket/:ticketId" element={<ReviewTicketPage />} />   
                        <Route path="/manage-tickets" element={<ManageTickets />} />
                        <Route path="/view-reviews" element={<ViewReviewsPage />} />

                    </Routes>
                </div>
            </div>
        );
    };

    return (
        <Router>
            <MainContent />
        </Router>
    );
};

export default App;
