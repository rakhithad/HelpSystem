const express = require('express');
const Ticket = require('../models/Ticket');
const authenticateToken = require('../middleware/authenticateToken');
const Counter = require('../models/counter');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { account, title, description, priority, uid } = req.body;

        // Validate required fields
        if (!account || !title || !description || !priority|| !uid) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        

        // Increment the ticket counter
        const counter = await Counter.findOneAndUpdate(
            { name: 'ticket_tid' }, // Use a specific name to differentiate from the user counter
            { $inc: { count: 1 } },
            { new: true, upsert: true } // Create the document if it doesn't exist
        );

        if (!counter) {
            throw new Error('Failed to initialize or update ticket counter');
        }

        const tid = counter.count;

        // Create and save the new ticket
        const newTicket = new Ticket({
            tid,
            account,
            title,
            description,
            priority,
            uid,
        });

        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Failed to create ticket', error: error.message });
    }
});


// View all tickets (Only accessible by Admin, Customers, and Support Engineers)
router.get('/view-tickets', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        if (user.role === 'admin') {
            // Admin can see all tickets
            const tickets = await Ticket.find();
            return res.json(tickets);
        }

        if (user.role === 'customer') {
            // Customer can only see their own tickets
            const tickets = await Ticket.find({ uid: user.uid });
            return res.json(tickets);
        }

        if (user.role === 'support_engineer') {
            // Support Engineer can only see the tickets assigned to them
            const tickets = await Ticket.find({ assignedSupportEngineer: user.uid }); 
            return res.json(tickets); 
        }

        // If the user role is not recognized
        return res.status(403).json({ message: 'Access Denied' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


router.put('/update-ticket/:id', authenticateToken, async (req, res) => {
    try {
        const { status, priority, assignedSupportEngineer } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status, priority, assignedSupportEngineer },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update ticket', error: error.message });
    }
});


router.get('/ticket-counts', async (req, res) => {
    const { role, uid } = req.headers;

    try {
        let query = {};
        if (role === 'customer') {
            query = { uid: uid };
        } else if (role === 'support-engineer') {
            query = { assignedSupportEngineer: uid };
        }

        const openTickets = await Ticket.countDocuments({ ...query, status: 'not started' });
        const pendingTickets = await Ticket.countDocuments({ ...query, status: 'in progress' });
        const solvedTickets = await Ticket.countDocuments({ ...query, status: 'done' });
        const unassignedTickets = await Ticket.countDocuments({ ...query, assignedSupportEngineer: 'Not Assigned' });

        res.status(200).json({ openTickets, pendingTickets, solvedTickets, unassignedTickets });
    } catch (error) {
        console.error('Error fetching ticket counts:', error);
        res.status(500).json({ message: 'Failed to fetch ticket counts' });
    }
});



// API to fetch tickets by type
router.get('/tickets-by-status', async (req, res) => {
    const { type } = req.query;
    const userRole = req.headers.role; // Get role from headers
    const userId = req.headers.uid;   // Get UID from headers

    let filter = {};

    // Define filter based on ticket type
    if (type === 'open') filter.status = 'not started';
    if (type === 'pending') filter.status = 'in progress';
    if (type === 'solved') filter.status = 'done';
    if (type === 'unassigned') filter.assignedSupportEngineer = 'Not Assigned';

    try {
        // Additional filtering based on user role
        if (userRole === 'customer') {
            filter.uid = userId; // Filter tickets created by this user
        } else if (userRole === 'supportEngineer') {
            filter.assignedSupportEngineer = userId; // Filter tickets assigned to this user
        }

        const tickets = await Ticket.find(filter);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Failed to fetch tickets' });
    }
});



module.exports = router;




