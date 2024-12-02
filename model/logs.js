const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    societyID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Society'
    },
    guardID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Guard'
    },
    visitorID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Visitor'
    },
    action:{
        type:String,
        required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Log', logSchema);