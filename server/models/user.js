const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    Verified: Boolean,
    isAdmin: { type: Boolean, default: false }, // Admin field
    isDeactivated: { type: Boolean, default: false }, // Deactivated field
    hidden: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);


module.exports = User;