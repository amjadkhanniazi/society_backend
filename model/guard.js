const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const guardSchema = new mongoose.Schema({
    societyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true, // Assuming usernames should also be unique
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Example constraint
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true
    }
}, { 
    timestamps: true,
    toJSON: {
        virtuals: true, // Include virtuals by default
        transform: (doc, ret) => {
          delete ret.id; // Remove the 'id' field
          return ret;
        },
      },
    toObject: { virtuals: true }
});

// Virtual fields
guardSchema.virtual('visitors', {
    ref: 'Visitor',
    localField: '_id',
    foreignField: 'guardID'
});

guardSchema.virtual('logs', {
    ref: 'Log',
    localField: '_id',
    foreignField: 'guardID'
});

// Password hashing middleware
guardSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
guardSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
guardSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id, username: this.username }, process.env.Secret, { expiresIn: '12h' });
};

// Indexes for performance
guardSchema.index({ societyID: 1 });
guardSchema.index({ username: 1 });

module.exports = mongoose.model('Guard', guardSchema);