const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true }, // Sparse allows multiple nulls
    userId: { type: String, unique: true, sparse: true }, // Mandatory for CHILD
    parentEmail: { type: String }, // Provided by child to link
    password: { type: String }, 
    role: { type: String, enum: ['PARENT', 'CHILD', 'ADMIN'], required: true },
    subscription: {
        status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
        plan: { type: String, enum: ['monthly', 'bi-monthly', 'yearly', 'none'], default: 'none' },
        expiry: { type: Date }
    },
    parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isLocked: { type: Boolean, default: false }, // Set by parent via lockDevice API
    fcmToken: { type: String },  // Firebase Cloud Messaging push token
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    lastSeen: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
