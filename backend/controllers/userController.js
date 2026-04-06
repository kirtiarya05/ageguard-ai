const User = require('../models/User');

exports.getChildren = async (req, res) => {
    try {
        const parentId = req.user.id;
        const children = await User.find({ parentAccount: parentId, role: 'CHILD' }).select('-password');
        res.json(children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.registerChild = async (req, res) => {
    try {
        const parentId = req.user.id;
        const { email, password } = req.body;
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const child = await User.create({
            email,
            password,
            role: 'CHILD',
            parentAccount: parentId
        });

        res.status(201).json({ _id: child.id, email: child.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
