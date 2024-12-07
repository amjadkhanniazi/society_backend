const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const societySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    Location:{
        type:String,
        required:true
    },
    contactNumber:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

societySchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// Virtual field (for ease of querying)
societySchema.virtual('Guard', {
    ref: 'Guard',
    localField: '_id',
    foreignField: 'societyID'
});

// Virtual field(for ease of querying)
societySchema.virtual('Visitor', {
    ref: 'Visitor',
    localField: '_id',
    foreignField: 'societyID'
});

// Virtual field(for ease of querying)
societySchema.virtual('Log', {
    ref: 'Log',
    localField: '_id',
    foreignField: 'societyID'
});

societySchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

societySchema.methods.getSignedToken = function(){
    return jwt.sign({id:this._id, email: this.email}, process.env.Secret, {expiresIn:process.env.JWT_EXPIRE});
}

module.exports = mongoose.model('Society', societySchema);