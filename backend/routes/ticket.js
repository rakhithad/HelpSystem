const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
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


router.get('/report', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }

        // Find all users in the company
        const companyUsers = await User.find({ companyId });
        const userIds = companyUsers.map(user => user.uid);

        // Aggregate ticket report
        const reportData = await Ticket.aggregate([
            // Match tickets for the specific company's users
            { $match: { uid: { $in: userIds } } },

            // Group and calculate statistics
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    
                    // Collect all statuses and priorities
                    allStatuses: { $push: "$status" },
                    allPriorities: { $push: "$priority" },

                    // Average Resolution Time
                    avgResolutionTime: { 
                        $avg: { 
                            $subtract: ['$updatedAt', '$createdAt'] 
                        } 
                    },

                    // Reviews and Ratings
                    ratings: { 
                        $push: { 
                            $cond: [
                                { $ne: ["$rating", null] },
                                "$rating",
                                "$$REMOVE"
                            ]
                        }
                    },
                    reviews: {
                        $push: {
                            $cond: [
                                { $ne: ["$review", null] },
                                "$review",
                                "$$REMOVE"
                            ]
                        }
                    }
                }
            },

            // Process the grouped data
            {
                $project: {
                    _id: 0,
                    totalTickets: 1,
                    avgResolutionTime: { $round: ['$avgResolutionTime', 2] },

                    // Calculate status counts
                    ticketsByStatus: {
                        $arrayToObject: {
                            $map: {
                                input: {
                                    $setUnion: ["$allStatuses"]
                                },
                                as: "status",
                                in: {
                                    k: "$$status",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$allStatuses",
                                                cond: { $eq: ["$$this", "$$status"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    // Calculate priority counts
                    ticketsByPriority: {
                        $arrayToObject: {
                            $map: {
                                input: {
                                    $setUnion: ["$allPriorities"]
                                },
                                as: "priority",
                                in: {
                                    k: { $toString: "$$priority" },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$allPriorities",
                                                cond: { $eq: ["$$this", "$$priority"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    // Calculate review statistics
                    reviewStats: {
                        averageRating: { $avg: "$ratings" },
                        totalReviews: { $size: "$reviews" }
                    }
                }
            }
        ]);

        // If no tickets found for the company
        if (reportData.length === 0) {
            return res.json({
                companyName: 'Unknown Company',
                totalTickets: 0,
                ticketsByStatus: {},
                ticketsByPriority: {},
                avgResolutionTime: 0,
                reviewStats: {
                    averageRating: 0,
                    totalReviews: 0
                }
            });
        }

        // Get company details
        const company = await Company.findOne({ companyId });

        // Combine all report data
        const finalReport = {
            companyName: company ? company.name : 'Unknown Company',
            ...reportData[0]
        };

        res.json(finalReport);

    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ 
            message: 'Error generating report', 
            error: error.message,
            details: error.toString() 
        });
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
router.get('/reviews', authenticateToken, async (req, res) => {
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




