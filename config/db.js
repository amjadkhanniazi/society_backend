const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    const client = mongoose.connect(process.env.MONGO_URL);
    try{
        await client;
        if(client){
            console.log('Connected to MongoDB');
        }
    }
    catch(err){
        console.log(err);
    }
}

module.exports = connectDB;