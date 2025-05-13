const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticateToken');
const Counter = require('../models/counter');
const Notification = require('../models/notification');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, priority, customerUid, assignedSupportEngineer } = req.body;
        const userRole = req.user.role;
        const userUid = req.user.uid;

        // Validate required fields
        if (!title || !description || !priority) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let finalCustomerUid;
        let finalAssignedEngineer = null; // Default to null unless assigned

        if (userRole === 'admin') {
            // Admin must provide a customer and support engineer
            if (!customerUid || !assignedSupportEngineer) {
                return res.status(400).json({ message: 'Admin must assign a customer and a support engineer' });
            }
            finalCustomerUid = customerUid;
            finalAssignedEngineer = assignedSupportEngineer;
        } else if (userRole === 'support_engineer') {
            // Support engineers must select a customer, and they assign themselves
            if (!customerUid) {
                return res.status(400).json({ message: 'Support engineer must assign a customer' });
            }
            finalCustomerUid = customerUid;
            finalAssignedEngineer = userUid;
        } else if (userRole === 'customer') {
            // Customers create their own ticket, no assigned support engineer
            finalCustomerUid = userUid;
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admins, support engineers, and customers can create tickets' });
        }

        // Increment the ticket counter
        const counter = await Counter.findOneAndUpdate(
            { name: 'ticket_tid' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
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
            uid: finalCustomerUid, // Assign customer UID
            assignedSupportEngineer: finalAssignedEngineer, // Assign based on role
            status: "not started",
        });

        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Failed to create ticket', error: error.message });
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
            tickets = await Ticket.find({ uid: user.uid, status: { $ne: 'deleted' } });
        } else if (user.role === 'support') {
            // Support engineers can only see tickets assigned to them (not deleted)
            tickets = await Ticket.find({ assignedTo: user.uid, status: { $ne: 'deleted' } });
        } else if (user.role === 'admin') {
            // Admins can see all tickets (not deleted)
            tickets = await Ticket.find({ status: { $ne: 'deleted' } });
        } else {
            return res.status(403).json({ message: 'Invalid role' });
        }

        return res.json({ tickets, role: user.role });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.put('/update-ticket/:id', authenticateToken, async (req, res) => {
  const { status, priority, assignedSupportEngineer } = req.body;
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
    if (priority && Number.isInteger(Number(priority)) && priority >= 1 && priority <= 5) {
      updates.priority = Number(priority);
    }
    if (role === 'admin' && assignedSupportEngineer !== undefined) {
      // Allow null to unassign or a valid UID
      if (assignedSupportEngineer === null || (typeof assignedSupportEngineer === 'string' && assignedSupportEngineer.length > 0)) {
        updates.assignedSupportEngineer = assignedSupportEngineer;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    // Update ticket
    Object.assign(ticket, updates);
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
});

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
  
      // Prepare notification(s)
      const notifications = [];
      const customerUid = ticket.uid;
      const engineerUid = ticket.assignedSupportEngineer !== 'Not Assigned' ? ticket.assignedSupportEngineer : null;
      const ticketId = ticket.tid.toString(); // Convert tid to string
  
      const message = `Ticket ${ticketId} has been deleted by ${uid}`;
  
      if (req.user.role === 'admin') {
        if (customerUid) {
          notifications.push({
            receiverUid: customerUid,
            senderUid: uid,
            ticketId,
            message,
            reason: reason.trim()
          });
        }
        if (engineerUid) {
          notifications.push({
            receiverUid: engineerUid,
            senderUid: uid,
            ticketId,
            message,
            reason: reason.trim()
          });
        }
      } else if (uid === customerUid && engineerUid) {
        notifications.push({
          receiverUid: engineerUid,
          senderUid: uid,
          ticketId,
          message,
          reason: reason.trim()
        });
      } else if (uid === engineerUid && customerUid) {
        notifications.push({
          receiverUid: customerUid,
          senderUid: uid,
          ticketId,
          message,
          reason: reason.trim()
        });
      }
  
      // Save notifications
      if (notifications.length > 0) {
        console.log(`Sending ${notifications.length} notifications for ticket ${ticketId}`);
        await Notification.insertMany(notifications);
      }
  
      res.status(200).json({ message: 'Ticket marked as deleted and notifications sent.', ticket });
    } catch (error) {
      console.error('Error deleting ticket:', error);
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
                    localField: 'userDetails.companyId',
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
                $project: {
                    tid: 1,
                    title: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    customer: {
                        uid: '$userDetails.uid',
                        name: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
                        phoneNumber: '$userDetails.phoneNumber',
                        location: '$userDetails.location'
                    },
                    company: '$companyDetails',
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

        const doneTickets = reportData.filter(ticket => ticket.status === 'done');
        const averageTime = doneTickets.reduce((acc, ticket) => {
            const createdAt = new Date(ticket.createdAt);
            const updatedAt = new Date(ticket.updatedAt);
            return acc + (updatedAt - createdAt);
        }, 0) / (doneTickets.length || 1);

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
            const customerName = ticket.customer.name;
            acc[customerName] = (acc[customerName] || 0) + 1;
            return acc;
        }, {});

        const ticketsByPriority = reportData.reduce((acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
        }, {});

        const reviews = reportData.filter(ticket => ticket.review).map(ticket => ({
            review: ticket.review,
            rating: ticket.rating,
            customer: ticket.customer.name
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
        res.status(500).json({ message: 'Error generating report' });
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

        // Check if the ticket has already been reviewed
        if (ticket.reviewed) {
            return res.status(400).json({ message: 'This ticket has already been reviewed' });
        }

        // Add the review, rating, and mark the ticket as reviewed
        ticket.review = review;
        ticket.rating = rating;
        ticket.reviewed = true; // Mark the ticket as reviewed
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




