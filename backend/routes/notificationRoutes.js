
const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ receiverUid: req.user.uid })
            .sort({ createdAt: -1 })
            .select('receiverUid receiverName senderUid senderName ticketId message reason createdAt');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
    }
});

  module.exports = router;