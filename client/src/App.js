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

const App = () => {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token'); // Check for token in localStorage
        return !!token; // Return true if token exists
    };

    const ExcludeSidebarRoutes = ["/login", "/register"]; // Routes where sidebar should not appear

    const MainContent = () => {
        const location = useLocation(); // Get the current route

        const showSidebar = !ExcludeSidebarRoutes.includes(location.pathname); // Determine if sidebar should be shown

        return (
            <div className="flex">
                {/* Conditionally render Sidebar */}
                {showSidebar && <Sidebar />}
                <div className="flex-grow p-6 bg-gray-100">
                    <Routes>
                        {/* Redirect to Dashboard or Login based on authentication */}
                        <Route
                            path="/"
                            element={
                                isAuthenticated() ? (
                                    <Navigate to="/dashboard" />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/create-ticket" element={<CreateTicket />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/view-tickets" element={<ViewTickets />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/create-company" element={<CreateCompany />} />
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
