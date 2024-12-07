const jwt = require('jsonwebtoken');
const SocietyUsers = require('../model/society.js');
const guardUsers = require('../model/guard.js');
const dotenv = require('dotenv');
require('dotenv').config();

dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    

    if (token == null) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.Secret, async (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        //check user credentials in societyUsers and guardUsers
        const societyUser = await SocietyUsers.findOne({ email: user.email });
        const guardUser = await guardUsers.findOne({ email: user.email });
        if (!societyUser && !guardUser) return res.status(401).json({ message: 'Unauthorized' });
        req.user = user;
        next();

    });
};

module.exports = authenticateToken;
