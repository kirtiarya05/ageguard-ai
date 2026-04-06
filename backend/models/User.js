const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if Google OAuth
    googleId: { type: String },
    role: { type: String, enum: ['PARENT', 'CHILD', 'ADMIN'], required: true },
    isVerified: { type: Boolean, default: false },
    parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If child, point to parent
    createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
