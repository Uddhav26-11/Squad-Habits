const mongoose=require("mongoose");

const squadSchema=new mongoose.Schema({

name:String,

admin:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

members:[{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

}],

inviteToken:String,

expiresAt:Date

},
{
timestamps:true
}

);

module.exports=mongoose.model(

"Squad",

squadSchema

);