const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerificationModelSchema = new Schema({
    userId: String,
    uniqueString: String,
    createdAt: Date,
    expiresAt: Date,
});

const UserVerification = mongoose.model('UserVerification', UserVerificationModelSchema);

module.exports = UserVerification;