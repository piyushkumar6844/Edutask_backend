const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.mongouri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Import routes
const authRoutes = require('./routes/auth');
const homeworkRoutes = require('./routes/homework');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/homework', homeworkRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
