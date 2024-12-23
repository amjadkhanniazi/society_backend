const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.js');

const societyRoutes = require('./route/societyRoutes');
const guardRoutes = require('./route/guardRoutes');
const visitorRoutes = require('./route/visitorRoutes');


const app=express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

connectDB();

app.use('/society', societyRoutes);
app.use('/guard', guardRoutes);
app.use('/visitor', visitorRoutes);


app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
})