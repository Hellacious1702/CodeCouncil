require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
// Connect to Database
connectDB();

// Body parser
app.use(express.json());



// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // 100 requests per windowMs
});
app.use('/api/', limiter);

// Prevent HTTP param pollution
// app.use(hpp());

// Enable CORS
app.use(cors());

// Mount routers
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV });
});

// Use error handler middleware
app.use(errorHandler);

const PORT = 5050;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
