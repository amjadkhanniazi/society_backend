const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.js');

const societyRoutes = require('./route/societyRoutes');
const guardRoutes = require('./route/guardRoutes');


const app=express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/society', societyRoutes);
app.use('/guard', guardRoutes);


app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
})