const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ageshield', {
    // DB setup
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json());

// Routes Placeholder
app.use('/api/auth', authRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/users', userRoutes);

// Serve React Web Dashboard
app.use(express.static(path.join(__dirname, 'public')));
app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
