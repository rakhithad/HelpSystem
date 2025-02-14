// middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token is missing' });

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user details from the token to the request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            uid: decoded.uid,
            role: decoded.role
        };

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};



module.exports =  authenticateToken;

