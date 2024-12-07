const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const Counter = require('../models/counter');
const authenticateToken = require('../middleware/authenticateToken');


const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber, location, role } = req.body;

    try {

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already taken' });

        // Hash password
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
            username,
            password: hashedPassword,
            role: role || 'customer',
            firstName,
            lastName,
            phoneNumber,
            location
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Username:', username);  // Log username
    console.log('Password:', password);  // Log password

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', isMatch);  // Log match status

        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('User:', user);
        console.log('UID:', user.uid); 
        
        res.json({ token, uid: user.uid, role: user.role });

    } catch (error) {
        console.error(error);  // Log any error
        res.status(400).send('Error logging in');
    }
});

router.get('/support-engineers', authenticateToken, async (req, res) => {
    try {
        const supportEngineers = await User.find({ role: 'support_engineer' }, 'firstName uid');
        res.status(200).json(supportEngineers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch support engineers' });
    }
});



module.exports = router;
