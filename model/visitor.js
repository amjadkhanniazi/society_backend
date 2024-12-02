const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    societyID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Society'
    },
    guardID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Guard'
    },
    name:{
        type:String,
        required:true
    },
    entryTime:{
        type:Date,
        default:Date.now
    },
    exitTime:{
        type:Date
    },
    IDNumber:{
        type:Number,
        required:true
    },
    vehicleNumber:{
        type:String,
        required:true
    },
    IDImage:{
        type:String
    },
    vehicleImage:{
        type:String
    },
    personImage:{
        type:String
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

// Virtual field(for ease of querying)
userSchema.virtual('Log', {
    ref: 'Log',
    localField: '_id',
    foreignField: 'visitorID'
});

module.exports = mongoose.model('Visitor', visitorSchema);