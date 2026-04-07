const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// ---- Socket.io Real-Time Engine ----
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store io instance on app so controllers can emit events
app.set('io', io);

// Track connected child devices: { userId: socketId }
const connectedDevices = {};

io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    // Child device registers itself on connect
    socket.on('register-device', ({ userId }) => {
        connectedDevices[userId] = socket.id;
        socket.join(`user-${userId}`);
        console.log(`📱 Device registered: userId=${userId}, socket=${socket.id}`);
        io.emit('device-list-updated', { connectedDevices });
    });

    // Parent joins their own room to receive device-list updates
    socket.on('register-parent', ({ parentId }) => {
        socket.join(`parent-${parentId}`);
        console.log(`👨‍👩 Parent connected: parentId=${parentId}`);
    });

    // Location update from child device
    socket.on('location-update', ({ userId, latitude, longitude }) => {
        // Broadcast to parent room
        io.emit('child-location', { userId, latitude, longitude, timestamp: new Date() });
        console.log(`📍 Location from ${userId}: ${latitude}, ${longitude}`);
    });

    socket.on('disconnect', () => {
        // Clean up disconnected device
        for (const [uid, sid] of Object.entries(connectedDevices)) {
            if (sid === socket.id) {
                delete connectedDevices[uid];
                io.emit('device-list-updated', { connectedDevices });
                console.log(`📴 Device disconnected: userId=${uid}`);
                break;
            }
        }
    });
});
// ------------------------------------

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ageshield', {
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/users', userRoutes);

// AI Proxy Routes
app.post('/api/ai/predict_age', async (req, res) => {
    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/predict_age`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'AI Service Unreachable', details: error.message });
    }
});

app.post('/api/ai/classify_content', async (req, res) => {
    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/classify_content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'AI Service Unreachable', details: error.message });
    }
});

// Serve React Web Dashboard
app.use(express.static(path.join(__dirname, 'public')));
app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🚀 AgeGuard AI Server running on port ${PORT}`);
    console.log(`🔌 Socket.io real-time engine active`);
});
