// middleware/authenticateToken.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Adjust path based on your file structure

const authenticateToken = async (req, res, next) => {
    // Extract token from the 'Authorization' header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is present, deny access
    if (!token) return res.status(401).json({ message: 'Access token is missing' });

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Ensure JWT_SECRET is set in your environment

        // Find the user by the ID stored in the token
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Attach user to request object
        req.user = user;
        next();  // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};


const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { authenticateToken, isAdmin };

