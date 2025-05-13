const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const Counter = require('../models/counter');
const Company = require('../models/Company');
const Ticket = require('../models/Ticket');
const Notification = require('../models/notification');
const authenticateToken = require('../middleware/authenticateToken');


const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName, designation, phoneNumber, location, role, companyId, avatar } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'email already taken' });

        // Validate companyId for customers
        if (role === 'customer') {
            const company = await Company.findOne({ companyId });
            if (!company) {
                return res.status(400).json({ message: 'Invalid companyId. Please create a company first.' });
            }
        }

        console.log('Received companyId:', companyId);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique UID
        const counter = await Counter.findOneAndUpdate(
            { name: 'user_uid' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        if (!counter || !counter.count) {
            throw new Error("Counter not found or failed to increment");
        }
        const uid = `UID-${counter.count}`;

        // Create and save the new user
        const newUser = new User({
            uid,
            email,
            password: hashedPassword,
            role: role || 'customer',
            firstName,
            lastName,
            designation,
            phoneNumber,
            location,
            companyId,
            avatar
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, uid: newUser.uid, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token valid for 1 hour
        );

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid credentials');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with additional details
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                uid: user.uid,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Set expiration time
        );

        // Log for debugging
        console.log('Login successful:', {
            email: user.email,
        });

        // Send response
        res.status(200).json({
            token, // Return the token for authorization
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

router.get('/support-engineers', authenticateToken, async (req, res) => {
    try {
        const supportEngineers = await User.find({ role: 'support_engineer' }, 'firstName uid');
        res.status(200).json(supportEngineers);
        console.log('Support Engineers:', supportEngineers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch support engineers' });
    }
});

router.get('/customers', authenticateToken, async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('uid firstName lastName');
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

router.get('/user-role', authenticateToken, async (req, res) => {
    try {
        res.json({ role: req.user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching role', error: error.message });
    }
});

// Fetch all users (Admin only)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        // Ensure only admins can fetch users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = await User.find({}, '-password'); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});



router.delete('/users/:id', authenticateToken, async (req, res) => {
    const { reason } = req.body;
    const uid = req.user.uid;

    // Restrict deletion to admins
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete users' });
    }

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({ message: 'Reason is required and must be a non-empty string' });
    }
    if (reason.length > 500) {
        return res.status(400).json({ message: 'Reason must not exceed 500 characters' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting self
        if (user.uid === uid) {
            return res.status(400).json({ message: 'Admins cannot delete themselves' });
        }

        // Mark user as inactive
        user.userStatus = 'inactive';
        user.deletedBy = uid;
        user.deletedAt = new Date();
        user.reason = reason.trim();
        await user.save();

        // Update related tickets
        await Ticket.updateMany(
            {
                $or: [
                    { uid: user.uid },
                    { assignedSupportEngineer: user.uid }
                ],
                status: { $ne: 'deleted' }
            },
            {
                status: 'inactive',
                deletedBy: uid,
                deletedAt: new Date(),
                reason: `User ${user.uid} was deleted: ${reason.trim()}`
            }
        );

        // Create notification for the deleted user
        try {
            await Notification.create({
                receiverUid: user.uid,
                senderUid: uid,
                ticketId: null, // Explicitly set to null for user deletions
                message: `Your account has been deleted by admin ${uid}`,
                reason: reason.trim()
            });
        } catch (notificationError) {
            console.warn('Failed to create notification:', notificationError);
            // Continue with success response, but include a warning
            return res.status(200).json({
                message: 'User marked as inactive and related tickets updated, but notification failed',
                user,
                warning: 'Notification could not be sent'
            });
        }

        res.status(200).json({
            message: 'User marked as inactive, related tickets updated, and notification sent',
            user
        });
    } catch (error) {
        console.error('Error soft-deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});


// routes/userRoutes.js
router.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { firstName, lastName, designation, role, phoneNumber, location, avatar } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { firstName, lastName, designation, role, phoneNumber, location, avatar },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
});




// Get logged-in user details
router.get('/account', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
});

// Update logged-in user details
router.put('/account', authenticateToken, async (req, res) => {
    try {
        console.log('Request body:', req.body); // Check incoming updates
        console.log('Authenticated user:', req.user); // Check user details
        const updates = req.body;
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $set: updates },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update user details' });
    }
});



router.post('/create-company', async (req, res) => {
    const { name, address, phoneNumber } = req.body;

    try {
        // Generate a unique companyId
        const counter = await Counter.findOneAndUpdate(
            { name: 'company_id' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        if (!counter || !counter.count) {
            throw new Error("Counter not found or failed to increment");
        }

        const companyId = `COMP-${counter.count}`;

        // Create and save the new company
        const newCompany = new Company({
            companyId,
            name,
            address,
            phoneNumber
        });

        await newCompany.save();
        res.status(201).json({ message: 'Company created successfully', companyId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating company' });
    }
});

router.get('/companies', async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Error fetching companies' });
    }
});



module.exports = router;
