/**
 * AgeGuard AI - JWT Auth Middleware
 * Verifies Bearer token on protected routes.
 * Sets req.user = { id, role } on success.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized — no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ageshield123');
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
};

const requireParent = (req, res, next) => {
    if (req.user?.role !== 'PARENT') {
        return res.status(403).json({ message: 'Access restricted to parent accounts' });
    }
    next();
};

module.exports = { protect, requireParent };
