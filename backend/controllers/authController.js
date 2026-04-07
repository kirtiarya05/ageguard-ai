const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'ageshield123', {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    try {
        const { email, password, role, userId, parentEmail } = req.body;
        
        if (role === 'CHILD' && !userId) {
            return res.status(400).json({ message: 'User ID is mandatory for child accounts' });
        }

        const query = role === 'CHILD' ? { userId } : { email };
        const userExists = await User.findOne(query);
        
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let parentAccount = null;
        if (role === 'CHILD' && parentEmail) {
            const parent = await User.findOne({ email: parentEmail, role: 'PARENT' });
            if (parent) parentAccount = parent._id;
        }

        const user = await User.create({ 
            email, 
            password, 
            role, 
            userId, 
            parentEmail,
            parentAccount 
        });

        res.status(201).json({
            _id: user.id,
            userId: user.userId,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, userId, password } = req.body;

        const query = userId ? { userId } : { email };
        const user = await User.findOne(query);
        
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                userId: user.userId,
                email: user.email,
                role: user.role,
                subscription: user.subscription,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    // Requires middleware to set req.user, mock for now
    res.json({ message: 'Profile data' });
};
