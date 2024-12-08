import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CreateTicket from './components/CreateTicket';
import Dashboard from './components/Dashboard';
import ViewTickets from './components/ViewTickets';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import ManageUsers from './components/ManageUsers';
import Account from './components/Account';

const App = () => {
    return (
        <Router>
            <div className="flex">
                <Sidebar />

                <div className="flex-grow p-6 bg-gray-100">
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/create-ticket" element={<CreateTicket />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/view-tickets" element={<ViewTickets />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/account" element={<Account />} />
                        
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
