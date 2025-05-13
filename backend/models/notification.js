const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiverUid: { type: String, required: true },
  senderUid: { type: String, required: true },
  ticketId: { type: String },
  message: { type: String, required: true },
  reason: { type: String },
  deletedAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ receiverUid: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);