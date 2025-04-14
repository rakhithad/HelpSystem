const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'support_engineer'], required: true },
    firstName: { type: String },
    lastName: { type: String }, 
    designation: { type: String }, 
    phoneNumber: { type: String, unique: true },
    location: { type: String },
    companyId: { type: String, ref: 'Company' },
    avatar: { type: String }
});

module.exports = mongoose.model('User', userSchema);
