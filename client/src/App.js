import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CreateTicket from './components/CreateTicket';
import Dashboard from './components/Dashboard';
import ViewTickets from './components/ViewTickets';
import Sidebar from './components/Sidebar';
import ManageUsers from './components/ManageUsers';
import Account from './components/Account';
import CreateCompany from './components/CreateCompany';
import ReportPage from './components/ReportPage';
import ReviewTicketPage from './components/ReviewTicketPage';
import ManageTickets from './components/ManageTickets';
import HomePage from './components/HomePage';
import ViewReviewsPage from './components/ViewReviewsPage';
import NotificationPage from './components/NotificationPage';
import ManageCompanies from './components/ManageCompanies';

const App = () => {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return !!token;
    };

    const ExcludeSidebarRoutes = ["/login", "/home", "/report", "/view-reviews"];

    const MainContent = () => {
        const location = useLocation();
        const showSidebar = !ExcludeSidebarRoutes.includes(location.pathname);

        return (
            <div>
                {showSidebar && <Sidebar />}
                <div>
                    <Routes>
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
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/create-company" element={<CreateCompany />} />
                        <Route path="/report" element={<ReportPage />} />
                        <Route path="/review-ticket/:ticketId" element={<ReviewTicketPage />} />   
                        <Route path="/manage-tickets" element={<ManageTickets />} />
                        <Route path="/view-reviews" element={<ViewReviewsPage />} />
                        <Route path="/notifications" element={<NotificationPage />} />
                        <Route path="/manage-companies" element={<ManageCompanies />} />
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