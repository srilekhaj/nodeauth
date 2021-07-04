const mongoose = require('mongoose');
const crypto = require('crypto');

//schema
 const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required : true,
        min: 6,
        max :255
    },
    password: {
        type: String,
        required:true,
        min :6,
        max : 255
    },
    date:{
        type: Date,
        default:Date.now
    },
    resetLink:{data:String,
        default:''}
   
 },{ timestamps: true})
 




module.exports = mongoose.model('User', UserSchema);
