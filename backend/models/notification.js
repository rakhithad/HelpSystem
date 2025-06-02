const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiverUid: { type: String, required: true },
    receiverName: { type: String },
    senderUid: { type: String, required: true },
    senderName: { type: String },
    ticketId: { type: String, required: true },
    message: { type: String, required: true },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ receiverUid: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);