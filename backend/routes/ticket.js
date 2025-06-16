const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticateToken');
const Counter = require('../models/counter');
const Notification = require('../models/notification');

const router = express.Router();

// Create a new ticket
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, priority, customerUid, assignedSupportEngineer } = req.body;
        const { role: userRole, uid: userUid, id: userId } = req.user;

        // Fetch user status
        const user = await User.findById(userId).select('userStatus');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.userStatus === 'inactive') {
            return res.status(403).json({ message: 'Access Denied: Your account is inactive' });
        }

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        let finalPriority;

        // Validate priority based on role
        if (userRole === 'customer') {
            finalPriority = 'medium';
        } else {
            if (!priority) {
                return res.status(400).json({ message: 'Priority is required for admins and support engineers' });
            }
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority.toLowerCase())) {
                return res.status(400).json({ message: 'Priority must be one of: low, medium, high' });
            }
            finalPriority = priority.toLowerCase();
        }

        let finalCustomerUid;
        let finalAssignedEngineer = null;

        // Role-based logic
        if (userRole === 'admin') {
            if (!customerUid || !assignedSupportEngineer) {
                return res.status(400).json({ message: 'Admin must provide customerUid and assignedSupportEngineer' });
            }
            const customer = await User.findOne({ uid: customerUid, role: 'customer' });
            if (!customer) {
                return res.status(400).json({ message: 'Invalid customer UID' });
            }
            const engineer = await User.findOne({ uid: assignedSupportEngineer, role: 'support_engineer' });
            if (!engineer) {
                return res.status(400).json({ message: 'Invalid support engineer UID' });
            }
            finalCustomerUid = customerUid;
            finalAssignedEngineer = assignedSupportEngineer;
        } else if (userRole === 'support_engineer') {
            if (!customerUid) {
                return res.status(400).json({ message: 'Support engineer must provide customerUid' });
            }
            const customer = await User.findOne({ uid: customerUid, role: 'customer' });
            if (!customer) {
                return res.status(400).json({ message: 'Invalid customer UID' });
            }
            finalCustomerUid = customerUid;
            finalAssignedEngineer = userUid;
        } else if (userRole === 'customer') {
            finalCustomerUid = userUid;
        } else {
            return res.status(403).json({ message: 'Unauthorized: Invalid role for creating tickets' });
        }

        // Increment ticket counter
        const counter = await Counter.findOneAndUpdate(
            { name: 'ticket_tid' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        if (!counter || !counter.count) {
            throw new Error('Failed to increment ticket counter');
        }

        const tid = counter.count;

        // Create and save the new ticket
        const newTicket = new Ticket({
            tid,
            title,
            description,
            priority: finalPriority,
            uid: finalCustomerUid,
            assignedSupportEngineer: finalAssignedEngineer,
            status: 'not started',
        });

        await newTicket.save();

        return res.status(201).json({
            message: 'Ticket created successfully',
            ticket: newTicket,
        });
    } catch (error) {
        console.error('Error creating ticket:', {
            error: error.message,
            userId: req.user?.id,
            role: req.user?.role,
            body: req.body,
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid ticket data', details: error.message });
        }
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate ticket ID' });
        }

        return res.status(500).json({ message: 'Failed to create ticket' });
    }
});

// View all tickets
router.get('/view-tickets', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        let tickets;

        if (user.role === 'customer') {
            // Customers can only see their own tickets (not deleted)
            tickets = await Ticket.find({ 
                uid: user.uid, 
                status: { $nin: ['inactive', 'deleted'] } 
            }).select('_id tid title description status priority uid assignedSupportEngineer createdAt');
        } else if (user.role === 'support_engineer') {
            // Support engineers can only see tickets assigned to them (not deleted)
            tickets = await Ticket.find({ 
                assignedSupportEngineer: user.uid, 
                status: { $nin: ['inactive', 'deleted'] } 
            }).select('_id tid title description status priority uid assignedSupportEngineer createdAt');
        } else if (user.role === 'admin') {
            // Admins can see all tickets (not deleted)
            tickets = await Ticket.find({ 
                status: { $nin: ['inactive', 'deleted'] } 
            }).select('_id tid title description status priority uid assignedSupportEngineer createdAt');
        } else {
            return res.status(403).json({ message: 'Invalid role' });
        }

        // Ensure priority is lowercase for consistency
        tickets = tickets.map(ticket => ({
            ...ticket.toObject(),
            priority: ticket.priority ? ticket.priority.toLowerCase() : 'medium'
        }));

        return res.json({ tickets, role: user.role });

    } catch (error) {
        console.error('Error fetching tickets:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update a ticket
router.put('/update-ticket/:id', authenticateToken, async (req, res) => {
    const { status, priority, assignedSupportEngineer, description } = req.body;
    const uid = req.user.uid;
    const role = req.user.role;

    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Authorization checks
        if (role === 'customer' && ticket.uid !== uid) {
            return res.status(403).json({ message: 'You can only update your own tickets' });
        }
        if (role === 'support_engineer' && ticket.assignedSupportEngineer !== uid) {
            return res.status(403).json({ message: 'You can only update tickets assigned to you' });
        }

        // Validate updates
        const updates = {};
        if (status && ['not started', 'in progress', 'stuck', 'done'].includes(status)) {
            updates.status = status;
        }
        if (priority) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority.toLowerCase())) {
                return res.status(400).json({ message: 'Priority must be one of: low, medium, high' });
            }
            updates.priority = priority.toLowerCase();
        }
        if (description && typeof description === 'string' && description.trim().length > 0) {
            updates.description = description.trim();
        }
        if (role === 'admin' && assignedSupportEngineer !== undefined) {
            if (assignedSupportEngineer === null || (typeof assignedSupportEngineer === 'string' && assignedSupportEngineer.length > 0)) {
                if (assignedSupportEngineer) {
                    const engineer = await User.findOne({ uid: assignedSupportEngineer, role: 'support_engineer' });
                    if (!engineer) {
                        return res.status(400).json({ message: 'Invalid support engineer UID' });
                    }
                }
                updates.assignedSupportEngineer = assignedSupportEngineer;
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid updates provided' });
        }

        // Update ticket
        Object.assign(ticket, updates);
        await ticket.save();

        // Ensure priority is lowercase in response
        const responseTicket = {
            ...ticket.toObject(),
            priority: ticket.priority ? ticket.priority.toLowerCase() : 'medium'
        };

        res.status(200).json(responseTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid ticket data', details: error.message });
        }
        res.status(500).json({ message: 'Failed to update ticket', error: error.message });
    }
});

// Delete a ticket
router.delete('/delete-ticket/:id', authenticateToken, async (req, res) => {
    const { reason } = req.body;
    const uid = req.user.uid;

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({ message: 'Reason is required and must be a non-empty string' });
    }
    if (reason.length > 500) {
        return res.status(400).json({ message: 'Reason must not exceed 500 characters' });
    }

    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Mark the ticket as deleted
        ticket.status = 'deleted';
        ticket.deletedBy = uid;
        ticket.deletedAt = new Date();
        ticket.reason = reason.trim();
        await ticket.save();

        // Fetch sender's name
        const sender = await User.findOne({ uid });
        const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';

        // Prepare notification(s)
        const notifications = [];
        const customerUid = ticket.uid;
        const engineerUid = ticket.assignedSupportEngineer !== 'Not Assigned' ? ticket.assignedSupportEngineer : null;
        const ticketId = ticket.tid.toString();

        const message = `Ticket ${ticketId} has been deleted by ${senderName}`;

        // Fetch customer and engineer names
        let customerName = null;
        let engineerName = null;

        if (customerUid) {
            const customer = await User.findOne({ uid: customerUid });
            customerName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';
        }
        if (engineerUid) {
            const engineer = await User.findOne({ uid: engineerUid });
            engineerName = engineer ? `${engineer.firstName || ''} ${engineer.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';
        }

        if (req.user.role === 'admin') {
            if (customerUid) {
                notifications.push({
                    receiverUid: customerUid,
                    receiverName: customerName,
                    senderUid: uid,
                    senderName,
                    ticketId,
                    message,
                    reason: reason.trim(),
                });
            }
            if (engineerUid) {
                notifications.push({
                    receiverUid: engineerUid,
                    receiverName: engineerName,
                    senderUid: uid,
                    senderName,
                    ticketId,
                    message,
                    reason: reason.trim(),
                });
            }
        } else if (uid === customerUid && engineerUid) {
            notifications.push({
                receiverUid: engineerUid,
                receiverName: engineerName,
                senderUid: uid,
                senderName,
                ticketId,
                message,
                reason: reason.trim(),
            });
        } else if (uid === engineerUid && customerUid) {
            notifications.push({
                receiverUid: customerUid,
                receiverName: customerName,
                senderUid: uid,
                senderName,
                ticketId,
                message,
                reason: reason.trim(),
            });
        }

        // Save notifications
        if (notifications.length > 0) {
            console.log(`Sending ${notifications.length} notifications for ticket ${ticketId}`);
            await Notification.insertMany(notifications);
        }

        // Ensure priority is lowercase in response
        const responseTicket = {
            ...ticket.toObject(),
            priority: ticket.priority ? ticket.priority.toLowerCase() : 'medium'
        };

        res.status(200).json({ message: 'Ticket marked as deleted and notifications sent.', ticket: responseTicket });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
    }
});

// Get ticket counts
router.get('/ticket-counts', authenticateToken, async (req, res) => {
    try {
        const { role, uid } = req.user;
        
        let baseQuery = {};
        
        // Apply role-based filtering for assigned tickets
        if (role === 'customer') {
            baseQuery = { uid: uid };
        } else if (role === 'support_engineer') {
            baseQuery = { assignedSupportEngineer: uid };
        }

        // Count tickets by status with role-based filtering
        const openTickets = await Ticket.countDocuments({ 
            ...baseQuery, 
            status: 'not started' 
        });
        
        const pendingTickets = await Ticket.countDocuments({ 
            ...baseQuery, 
            status: 'in progress' 
        });
        
        const solvedTickets = await Ticket.countDocuments({ 
            ...baseQuery, 
            status: 'done' 
        });
        
        // Unassigned tickets logic
        let unassignedQuery = {
            $or: [
                { assignedSupportEngineer: null },
                { assignedSupportEngineer: 'Not Assigned' },
                { assignedSupportEngineer: '' },
                { assignedSupportEngineer: { $exists: false } }
            ]
        };
        
        if (role === 'customer') {
            unassignedQuery.uid = uid;
        }
        
        const unassignedTickets = await Ticket.countDocuments(unassignedQuery);

        res.status(200).json({ 
            openTickets, 
            pendingTickets, 
            solvedTickets, 
            unassignedTickets 
        });
        
    } catch (error) {
        console.error('Error fetching ticket counts:', error);
        res.status(500).json({ message: 'Failed to fetch ticket counts' });
    }
});

// Get tickets by status
router.get('/tickets-by-status', authenticateToken, async (req, res) => {
    try {
        const { type } = req.query;
        const { role, uid } = req.user;

        if (!type) {
            return res.status(400).json({ message: 'Ticket type is required' });
        }

        let filter = {};
        if (type === 'open') filter.status = 'not started';
        else if (type === 'pending') filter.status = 'in progress';
        else if (type === 'solved') filter.status = 'done';
        else if (type === 'unassigned') filter.assignedSupportEngineer = { $in: [null, undefined, 'Not Assigned'] };
        else {
            return res.status(400).json({ message: 'Invalid ticket type' });
        }

        // Apply role-based filtering
        if (role === 'customer') {
            filter.uid = uid;
        } else if (role === 'support_engineer') {
            if (type !== 'unassigned') {
                filter.assignedSupportEngineer = uid;
            }
        }

        const tickets = await Ticket.find(filter).select('_id tid title description status priority uid assignedSupportEngineer createdAt');

        // Format tickets
        const formattedTickets = tickets.map(ticket => ({
            ...ticket.toObject(),
            priority: ticket.priority ? ticket.priority.toLowerCase() : 'medium'
        }));

        res.status(200).json(formattedTickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
    }
});

// Get report data
router.get('/report', authenticateToken, async (req, res) => {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: 'uid',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'userDetails.firstName',
                    foreignField: 'companyId',
                    as: 'companyDetails'
                }
            },
            { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedSupportEngineer',
                    foreignField: 'uid',
                    as: 'engineerDetails'
                }
            },
            { $unwind: { path: '$engineerDetails', preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    status: { $nin: ['inactive', 'deleted'] }
                }
            },
            {
                $project: {
                    tid: 1,
                    title: 1,
                    description: 1,
                    status: 1,
                    priority: { $toLower: { $ifNull: ['$priority', 'medium'] } },
                    createdAt: 1,
                    updatedAt: 1,
                    customer: {
                        uid: '$userDetails.uid',
                        name: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
                        phoneNumber: '$userDetails.phoneNumber',
                        location: '$userDetails.location'
                    },
                    company: {
                        companyId: '$companyDetails.companyId',
                        name: '$companyDetails.name'
                    },
                    assignedSupportEngineer: {
                        uid: '$engineerDetails.uid',
                        name: { $concat: ['$engineerDetails.firstName', ' ', '$engineerDetails.lastName'] }
                    },
                    review: 1,
                    rating: 1
                }
            }
        ];

        const reportData = await Ticket.aggregate(pipeline);

        // Calculate metrics
        const allTicketsCount = reportData.length;

        const closedTickets = reportData.filter(ticket => ticket.status === 'done');
        const averageTime = closedTickets.length
            ? closedTickets.reduce((acc, ticket) => {
                  const createdAt = new Date(ticket.createdAt);
                  const updatedAt = new Date(ticket.updatedAt);
                  return acc + (updatedAt - createdAt);
              }, 0) / (closedTickets.length * 1000 * 60 * 60)
            : 0;

        const ticketsByStatus = reportData.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});

        const ticketsByEngineer = reportData.reduce((acc, ticket) => {
            const engineerName = ticket.assignedSupportEngineer?.name || 'Not Assigned';
            acc[engineerName] = (acc[engineerName] || 0) + 1;
            return acc;
        }, {});

        const ticketsByCustomer = reportData.reduce((acc, ticket) => {
            const customerName = ticket.customer?.name || 'Unknown';
            acc[customerName] = (acc[customerName] || 0) + 1;
            return acc;
        }, {});

        const ticketsByPriority = reportData.reduce((acc, ticket) => {
            const priority = ticket.priority || 'medium';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});

        const reviews = reportData
            .filter(ticket => ticket.review || ticket.rating)
            .map(ticket => ({
                review: ticket.review || 'No review',
                rating: ticket.rating || null,
                customer: ticket.customer?.name || 'Unknown'
            }));

        res.status(200).json({
            allTicketsCount,
            averageTime,
            ticketsByStatus,
            ticketsByEngineer,
            ticketsByCustomer,
            ticketsByPriority,
            reviews,
            reportData
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
});

// Add review and rating to a ticket
router.post('/review/:ticketId', authenticateToken, async (req, res) => {
    const { ticketId } = req.params;
    const { review, rating } = req.body;
    const userId = req.user.uid;

    try {
        const ticket = await Ticket.findOne({ _id: ticketId, uid: userId });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or you are not authorized to review it' });
        }

        if (ticket.status !== 'done') {
            return res.status(400).json({ message: 'Cannot review a ticket that is not completed' });
        }

        if (ticket.reviewed) {
            return res.status(400).json({ message: 'This ticket has already been reviewed' });
        }

        ticket.review = review;
        ticket.rating = rating;
        ticket.reviewed = true;
        await ticket.save();

        // Ensure priority is lowercase in response
        const responseTicket = {
            ...ticket.toObject(),
            priority: ticket.priority ? ticket.priority.toLowerCase() : 'medium'
        };

        res.json({ message: 'Review submitted successfully', ticket: responseTicket });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit review' });
    }
});

// Fetch all reviews
router.get('/reviews', async (req, res) => {
    try {
        const tickets = await Ticket.find(
            { review: { $exists: true, $ne: null }, rating: { $exists: true, $ne: null } },
            { review: 1, rating: 1, title: 1, uid: 1, priority: 1 }
        );

        const uids = [...new Set(tickets.map(ticket => ticket.uid))];

        const users = await User.find(
            { uid: { $in: uids } },
            { uid: 1, firstName: 1 }
        );

        const userMap = users.reduce((map, user) => {
            map[user.uid] = user.firstName || 'Unknown';
            return map;
        }, {});

        const reviews = tickets.map(ticket => ({
            _id: ticket._id,
            title: ticket.title,
            review: ticket.review,
            rating: ticket.rating,
            firstName: userMap[ticket.uid] || 'Unknown',
            priority: ticket.priority ? ticket.priority.toLowerCase() : 'medium'
        }));

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Get tickets by status with company
router.get('/tickets-by-status-with-company', authenticateToken, async (req, res) => {
    try {
        const { type } = req.query;
        const { role, uid } = req.user;

        if (!type) {
            return res.status(400).json({ message: 'Ticket type is required' });
        }

        let query = {};

        const validTypes = {
            'open': 'not started',
            'pending': 'in progress',
            'solved': 'done',
            'unassigned': {
                $or: [
                    { assignedSupportEngineer: null },
                    { assignedSupportEngineer: '' },
                    { assignedSupportEngineer: { $exists: false } }
                ]
            }
        };

        if (!Object.prototype.hasOwnProperty.call(validTypes, type)) {
            return res.status(400).json({ message: 'Invalid ticket type. Valid types: open, pending, solved, unassigned' });
        }

        query = typeof validTypes[type] === 'object' ? validTypes[type] : { status: validTypes[type] };

        if (role === 'customer') {
            query.uid = uid;
        } else if (role === 'support_engineer') {
            if (type !== 'unassigned') {
                query.assignedSupportEngineer = uid;
            }
        }

        console.log('Final query for tickets:', JSON.stringify(query, null, 2));
        console.log('User role:', role, 'User ID:', uid, 'Type:', type);

        const tickets = await Ticket.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: 'uid',
                    as: 'userDetails',
                },
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'userDetails.companyId',
                    foreignField: 'companyId',
                    as: 'companyDetails',
                },
            },
            { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    tid: 1,
                    title: 1,
                    priority: { $toLower: { $ifNull: ['$priority', 'medium'] } },
                    status: 1,
                    assignedSupportEngineer: 1,
                    createdAt: 1,
                    uid: 1,
                    companyName: { $ifNull: ['$companyDetails.name', 'Unknown'] },
                    customerName: {
                        $concat: [
                            { $ifNull: ['$userDetails.firstName', ''] },
                            { $cond: [{ $eq: ['$userDetails.firstName', ''] }, '', ' '] },
                            { $ifNull: ['$userDetails.lastName', ''] },
                            { $cond: [
                                {
                                    $and: [
                                        { $eq: ['$userDetails.firstName', ''] },
                                        { $eq: ['$userDetails.lastName', ''] },
                                    ],
                                },
                                'Unknown',
                                '',
                            ]},
                        ],
                    },
                    customerEmail: '$userDetails.email'
                },
            },
            { $sort: { createdAt: -1 } }
        ]);

        console.log(`Found ${tickets.length} tickets for type: ${type}`);

        res.status(200).json(tickets);

    } catch (error) {
        console.error('Error fetching tickets with company:', {
            error: error.message,
            userUid: req.user?.uid,
            role: req.user?.role,
            query: req.query,
            stack: error.stack
        });
        res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
    }
});

// View tickets with company
router.get('/view-tickets-with-company', authenticateToken, async (req, res) => {
    try {
        const { role, uid } = req.user;

        let query = {};
        if (role === 'customer') {
            query.uid = uid;
        } else if (role === 'support_engineer') {
            query.assignedSupportEngineer = uid;
        }

        query.status = { $nin: ['inactive', 'deleted'] };

        const tickets = await Ticket.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: 'uid',
                    as: 'customerDetails',
                },
            },
            { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedSupportEngineer',
                    foreignField: 'uid',
                    as: 'engineerDetails',
                },
            },
            { $unwind: { path: '$engineerDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'customerDetails.companyId',
                    foreignField: 'companyId',
                    as: 'companyDetails',
                },
            },
            { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    tid: 1,
                    title: 1,
                    description: 1,
                    uid: 1,
                    status: 1,
                    priority: { $toLower: { $ifNull: ['$priority', 'medium'] } },
                    assignedSupportEngineer: 1,
                    createdAt: 1,
                    companyName: { $ifNull: ['$companyDetails.name', 'Unknown'] },
                    customerName: {
                        $concat: [
                            { $ifNull: ['$customerDetails.firstName', ''] },
                            { $cond: [{ $eq: ['$customerDetails.firstName', ''] }, '', ' '] },
                            { $ifNull: ['$customerDetails.lastName', ''] },
                            { $cond: [
                                {
                                    $and: [
                                        { $eq: ['$customerDetails.firstName', ''] },
                                        { $eq: ['$customerDetails.lastName', ''] },
                                    ],
                                },
                                'Unknown',
                                '',
                            ]},
                        ],
                    },
                    engineerName: {
                        $cond: [
                            { $eq: ['$assignedSupportEngineer', null] },
                            'Unassigned',
                            {
                                $concat: [
                                    { $ifNull: ['$engineerDetails.firstName', ''] },
                                    { $cond: [{ $eq: ['$engineerDetails.firstName', ''] }, '', ' '] },
                                    { $ifNull: ['$engineerDetails.lastName', ''] },
                                    { $cond: [
                                        {
                                            $and: [
                                                { $eq: ['$engineerDetails.firstName', ''] },
                                                { $eq: ['$engineerDetails.lastName', ''] },
                                            ],
                                        },
                                        'Unknown',
                                        '',
                                    ]},
                                ],
                            },
                        ],
                    },
                },
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({ tickets, role });
    } catch (error) {
        console.error('Error fetching tickets with company:', {
            error: error.message,
            userUid: req.user?.uid,
            role: req.user?.role,
        });
        res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
    }
});

module.exports = router;