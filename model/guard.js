const mongoose = require('mongoose');

const guardSchema = new mongoose.Schema({
    societyID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Society'
    },
    username:{
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
    fullName:{
        type:String,
        required:true
    },
    assignedGate:{
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

// Virtual field (for ease of querying)
guardSchema.virtual('Visitor', {
    ref: 'Visitor',
    localField: '_id',
    foreignField: 'guardID'
});

// Virtual field(for ease of querying)
guardSchema.virtual('Log', {
    ref: 'Log',
    localField: '_id',
    foreignField: 'guardID'
});


module.exports = mongoose.model('Guard', guardSchema);