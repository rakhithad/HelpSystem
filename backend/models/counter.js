// models/counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Explicitly specify the collection name
const Counter = mongoose.model('Counter', counterSchema, 'counters'); // 'counters' is the collection name in DB

module.exports = Counter;
