const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true }
});

module.exports = mongoose.model('Company', companySchema);
