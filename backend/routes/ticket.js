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




// Route to get all tickets
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fetch all tickets from the database
        const tickets = await Ticket.find();

        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ message: 'No tickets found' });
        }

        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
    }
});






// Route to assign a support engineer
router.patch('/assign/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { assignedSupportEngineer } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    try {
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { assignedSupportEngineer },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Support engineer assigned', ticket });
    } catch (error) {
        res.status(400).json({ message: 'Error assigning support engineer', error });
    }
});

module.exports = router;




