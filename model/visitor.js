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
    idNumber:{
        type:Number,
        required:true
    },
    vehicleNumber:{
        type:String,
        required:true
    },
    idImage:{
        type:String
    },
    vehicleImage:{
        type:String
    },
    personImage:{
        type:String
    },
    comments:{
        type:String
    }
},
{
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field(for ease of querying)
visitorSchema.virtual('log', {
    ref: 'Log',
    localField: '_id',
    foreignField: 'visitorID'
});

module.exports = mongoose.model('Visitor', visitorSchema);