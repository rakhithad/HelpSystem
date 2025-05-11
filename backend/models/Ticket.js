const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    tid: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['not started', 'in progress', 'stuck', 'done', 'deleted'], // Added 'deleted'
      default: 'not started',
      required: true
    },
    priority: { type: Number, min: 1, max: 5, required: true },
    uid: { type: String, required: true }, // Reference to User model
    assignedSupportEngineer: { type: String, default: null }, // Changed default to null
    review: { type: String, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
    deletedBy: { type: String },
    deletedAt: { type: Date },
    reason: { type: String }
  },
  { timestamps: true }
);

// Indexes for faster queries
ticketSchema.index({ uid: 1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;