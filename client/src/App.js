import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CreateTicket from './components/CreateTicket';
import Dashboard from './components/Dashboard';
import ViewTickets from './components/ViewTickets';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/view-tickets" element={<ViewTickets />} />
            </Routes>
        </Router>
    );
};

export default App;
