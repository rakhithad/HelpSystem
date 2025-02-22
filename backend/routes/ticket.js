const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticateToken');
const Counter = require('../models/counter');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {  title, description, priority, uid } = req.body;

        // Validate required fields
        if ( !title || !description || !priority|| !uid) {
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

router.delete('/delete-ticket/:id', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket deleted successfully', ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
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


// GET report data for a company
router.get('/report', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

        const company = await Company.findOne({ companyId });
        if (!company) return res.status(404).json({ error: 'Company not found' });

        const users = await User.find({ companyId }).select('uid firstName lastName role');
        const userIds = users.map(user => user.uid);

        const tickets = await Ticket.find({ uid: { $in: userIds } });

        if (!tickets.length) {
            return res.json({
                companyName: company.name,
                totalTickets: 0,
                avgSolvingTime: 0,
                reviewCount: 0,
                ticketsByStatus: {},
                ticketsByPriority: {},
                ticketsByUser: [],
                ticketsBySupportEngineer: [],
                reviews: []
            });
        }

        const totalTickets = tickets.length;
        const solvedTickets = tickets.filter(ticket => ticket.status === 'done');

        const avgSolvingTime = solvedTickets.length > 0
            ? (solvedTickets.reduce((sum, ticket) => sum + ((new Date(ticket.updatedAt) - new Date(ticket.createdAt)) / 3600000), 0) / solvedTickets.length).toFixed(2)
            : 0;

        const reviewCount = tickets.filter(ticket => ticket.review !== null).length;

        const ticketsByStatus = tickets.reduce((acc, ticket) => {
            acc[ticket.status] = acc[ticket.status] || [];
            acc[ticket.status].push(ticket);
            return acc;
        }, {});

        const ticketsByPriority = tickets.reduce((acc, ticket) => {
            acc[ticket.priority] = acc[ticket.priority] || [];
            acc[ticket.priority].push(ticket);
            return acc;
        }, {});

        const ticketsByUser = users.map(user => ({
            uid: user.uid,
            name: `${user.firstName} ${user.lastName}`,
            tickets: tickets.filter(ticket => ticket.uid === user.uid)
        }));

        const ticketsBySupportEngineer = users
            .filter(user => user.role === 'support_engineer')
            .map(engineer => ({
                uid: engineer.uid,
                name: `${engineer.firstName} ${engineer.lastName}`,
                tickets: tickets.filter(ticket => ticket.assignedSupportEngineer === engineer.uid)
            }));

        const reviews = tickets
            .filter(ticket => ticket.review !== null)
            .map(ticket => ({
                tid: ticket.tid,
                customerName: users.find(user => user.uid === ticket.uid)?.firstName || 'Unknown',
                review: ticket.review,
                rating: ticket.rating
            }));

        res.json({
            companyName: company.name,
            totalTickets,
            avgSolvingTime,
            reviewCount,
            ticketsByStatus,
            ticketsByPriority,
            ticketsByUser,
            ticketsBySupportEngineer,
            reviews
        });

    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add review and rating to a ticket
router.post('/review/:ticketId', authenticateToken, async (req, res) => {
    const { ticketId } = req.params;
    const { review, rating } = req.body;
    const userId = req.user.uid; // Assuming you're using middleware to extract user info from the token

    try {
        // Find the ticket
        const ticket = await Ticket.findOne({ _id: ticketId, uid: userId });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or you are not authorized to review it' });
        }

        if (ticket.status !== 'done') {
            return res.status(400).json({ message: 'Cannot review a ticket that is not completed' });
        }

        // Add the review and rating
        ticket.review = review;
        ticket.rating = rating;
        await ticket.save();

        res.json({ message: 'Review submitted successfully', ticket });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit review' });
    }
});


// Fetch all reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Ticket.find(
            { review: { $exists: true }, rating: { $exists: true } }, // Fetch only tickets with reviews and ratings
            { review: 1, rating: 1, title: 1, uid: 1 } // Include specific fields
        );

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});






module.exports = router;




