const mongoose = require('mongoose')
const { Schema,model } = mongoose;
const timeModel = new Schema({
    user_id: {type:String, required:true},
    user_name: {type:String, required:true},
  wallet_address:{type:String, required:true}
},{ timestamps: true })

module.exports = model('time', timeModel); 