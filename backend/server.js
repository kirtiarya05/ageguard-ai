const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes         = require('./routes/authRoutes');
const parentRoutes       = require('./routes/parentRoutes');
const userRoutes         = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sleepRoutes        = require('./routes/sleepRoutes');
const { startSleepWatcher } = require('./controllers/sleepController');

const app    = express();
const server = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'https://*.vercel.app'];

app.use(cors({
    origin: (origin, cb) => cb(null, true), // allow all during dev; tighten in prod via ALLOWED_ORIGINS
    credentials: true,
}));

// ── Socket.io Real-Time Engine ─────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});
app.set('io', io);

const connectedDevices = {};

io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    socket.on('register-device', ({ userId }) => {
        connectedDevices[userId] = socket.id;
        socket.join(`user-${userId}`);
        console.log(`📱 Device registered: userId=${userId}, socket=${socket.id}`);
        io.emit('device-list-updated', { connectedDevices });
    });

    socket.on('register-parent', ({ parentId }) => {
        socket.join(`parent-${parentId}`);
        console.log(`👨‍👩 Parent connected: parentId=${parentId}`);
    });

    socket.on('location-update', ({ userId, latitude, longitude }) => {
        io.emit('child-location', { userId, latitude, longitude, timestamp: new Date() });
        console.log(`📍 Location from ${userId}: ${latitude}, ${longitude}`);
    });

    socket.on('disconnect', () => {
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

// ── Rate Limiters ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    message: { error: 'Too many requests — please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 30,
    message: { error: 'AI rate limit exceeded — wait a moment.' },
});

// ── DB ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ageshield')
    .then(() => {
        console.log('✅ MongoDB Connected');
        // Start sleep watcher after DB is ready
        startSleepWatcher(io);
        console.log('🌙 Sleep watcher started');
    })
    .catch(err => console.log('❌ MongoDB Error:', err));

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/parents',       parentRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sleep',         sleepRoutes);

// ── AI Proxy Routes (rate-limited) ─────────────────────────────────────────
app.post('/api/ai/predict_age', aiLimiter, async (req, res) => {
    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/predict_age`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'AI Service Unreachable', details: error.message });
    }
});

app.post('/api/ai/classify_content', aiLimiter, async (req, res) => {
    try {
        const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/classify_content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'AI Service Unreachable', details: error.message });
    }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Serve React Web Dashboard (fallback) ───────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🚀 AgeGuard AI Server running on port ${PORT}`);
    console.log(`🔌 Socket.io real-time engine active`);
});
