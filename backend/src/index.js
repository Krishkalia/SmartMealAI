require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartMeal AI Backend is running.' });
});

// We will add more routes here
const planRoutes = require('./routes/planRoutes');
const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

app.use('/api/plan', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartmeal_ai';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Keep-awake ping for Render (every 10 minutes)
      const https = require('https');
      const url = 'https://smartmealai.onrender.com/api/health';
      
      setInterval(() => {
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            console.log('Self health-check successful, server kept awake.');
          } else {
            console.log(`Self health-check failed with status code: ${res.statusCode}`);
          }
        }).on('error', (err) => {
          console.error('Error during self health-check:', err.message);
        });
      }, 10 * 60 * 1000); // 10 minutes in milliseconds
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
