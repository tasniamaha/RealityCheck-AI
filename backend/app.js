const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import Routes (You will create these files next)
const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
// const adminRoutes = require('./routes/adminRoutes'); // For later

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(helmet({
    crossOriginResourcePolicy: false, // Allows images/videos to be loaded on frontend
}));
app.use(cors());
app.use(morgan('dev')); // Logs requests to the console
app.use(express.json()); // Parses JSON body
app.use(express.urlencoded({ extended: true }));

// 2. STATIC FOLDER (Crucial for Local Storage)
// This allows you to access uploaded videos via: http://localhost:5000/uploads/filename.mp4
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
// app.use('/api/admin', adminRoutes);

// 4. BASE ROUTE
app.get('/', (req, res) => {
    res.json({ 
        message: "Reality Check API is Live",
        status: "Healthy"
    });
});

// 5. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });
});

module.exports = app;