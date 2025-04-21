const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiverUid: { type: String, required: true }, // Who receives the notification
  senderUid: { type: String, required: true },   // Who performed the deletion
  ticketId: { type: String, required: true },
  message: { type: String, required: true },
  reason: { type: String },
  deletedAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
