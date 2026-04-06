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
        const { email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ email, password, role });

        res.status(201).json({
            _id: user.id,
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
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                email: user.email,
                role: user.role,
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
